require("dotenv").config({ path: "./backend/.env" });
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const mongoose = require("mongoose");
const Faq = require("./models/Faq");

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://harshitjain1234:8HxKCzLNrB0w6H38@cluster0.qbq8xzm.mongodb.net/faqDB";
const SCRAPE_URL = "https://samagama.in/internship/faq";

const SECTION_CATEGORIES = [
  "About the Internship",        // Section 1
  "Timing and Dates",            // Section 2
  "NOC",                         // Section 3
  "Selection and Offer Letter",  // Section 4
  "Work and Mentorship",         // Section 5
  "Communication Channels",      // Section 6
  "Interviews",                  // Section 7
  "Certificate",                 // Section 8
  "Rosetta",                     // Section 9
  "Phase 1 and Coursework",     // Section 10
  "Yaksha Chat",                 // Section 11
  "ViBe Platform",              // Section 12
  "Team Formation",              // Section 13
];

async function migrateFaqs() {
  await mongoose.connect(MONGO_URI);

  // 1. Fetch live page with Puppeteer to get Q → category mapping
  console.log("Fetching live page...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.goto(SCRAPE_URL, { waitUntil: "networkidle2", timeout: 60000 });
  await page.waitForSelector("details", { timeout: 30000 }).catch(function() {});

  const html = await page.content();
  const $ = cheerio.load(html);

  // Build a liveQuestion → category map from the rendered page
  const questionCategoryMap = {};
  let currentSectionIdx = -1;

  $("*").each(function(_, el) {
    var tag = el.tagName.toLowerCase();

    if (tag === "h2") {
      var text = $(el).text().trim();
      var match = text.match(/^(\d+)\.\s+(.+?)\s*§?$/);
      if (match) {
        var num = parseInt(match[1], 10) - 1;
        if (num >= 0 && num < SECTION_CATEGORIES.length) {
          currentSectionIdx = num;
        }
      }
      return;
    }

    if (currentSectionIdx === -1) return;

    if (tag === "details") {
      var summaryEl = $(el).find("summary").first();
      var summaryText = summaryEl.text().trim().replace(/\s+/g, " ");

      var question = summaryText
        .replace(/^[\d.]+\s*/, "")
        .replace(/\s*§$/, "")
        .trim();

      questionCategoryMap[question] = SECTION_CATEGORIES[currentSectionIdx];
    }
  });

  await browser.close();

  console.log("Live Q→category map has " + Object.keys(questionCategoryMap).length + " entries\n");

  // 2. Find all existing FAQs with missing or empty category
  const noCategoryCount = await Faq.countDocuments({
    $or: [
      { category: { $exists: false } },
      { category: "" },
      { category: null },
    ],
  });
  console.log("FAQs needing category: " + noCategoryCount);

  if (noCategoryCount === 0) {
    console.log("Nothing to migrate.");
    await mongoose.disconnect();
    process.exit(0);
  }

  // 3. Update each FAQ that has a matching question in the live map
  var updated = 0;
  var notFound = 0;

  var cursor = Faq.find({
    $or: [
      { category: { $exists: false } },
      { category: "" },
      { category: null },
    ],
  }).cursor();

  for await (var faq of cursor) {
    var match = questionCategoryMap[faq.question];
    if (match) {
      faq.category = match;
      await faq.save();
      console.log("Updated [" + match + "]: " + faq.question.slice(0, 60));
      updated++;
    } else {
      console.log("No live match for: " + faq.question.slice(0, 60));
      notFound++;
    }
  }

  console.log("\nMigration complete. Updated " + updated + ", not found " + notFound + ".");

  await mongoose.disconnect();
  process.exit(0);
}

migrateFaqs().catch(async function(err) {
  console.error("Migration failed: " + err.message);
  try { await browser.close(); } catch (_) {}
  await mongoose.disconnect();
  process.exit(1);
});