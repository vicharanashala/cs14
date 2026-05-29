require("dotenv").config({ path: "./backend/.env" });
const axios = require("axios");
const cheerio = require("cheerio");
const mongoose = require("mongoose");
const Faq = require("./models/Faq");

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://harshitjain1234:8HxKCzLNrB0w6H38@cluster0.qbq8xzm.mongodb.net/faqDB";
const SCRAPE_URL = "https://samagama.in/internship/faq";

const SECTION_CATEGORIES = [
  "About the Internship",        // Section 1
  "Timing and Dates",             // Section 2
  "NOC",                          // Section 3
  "Selection and Offer Letter",   // Section 4
  "Work and Mentorship",          // Section 5
  "Communication Channels",       // Section 6
  "Interviews",                   // Section 7
  "Certificate",                  // Section 8
  "Rosetta",                      // Section 9
  "Phase 1 and Coursework",        // Section 10
  "Yaksha Chat",                  // Section 11
  "ViBe Platform",                // Section 12
  "Team Formation",               // Section 13
];

async function scrapeFaq() {
  await mongoose.connect(MONGO_URI);

  console.log(`Fetching ${SCRAPE_URL}...`);
  const { data } = await axios.get(SCRAPE_URL, { timeout: 30000 });
  const $ = cheerio.load(data);

  const faqsToInsert = [];
  let inserted = 0;
  let skipped = 0;

  // Collect all text elements in document order, recording their section
  let currentSectionIdx = -1;
  const allElements = [];

  // Walk the DOM body in order
  $("body > *").each((_, el) => {
    const tag = el.tagName.toLowerCase();
    const text = $(el).text().trim();

    // Detect numbered section heading: "1. About the Internship"
    const sectionMatch = text.match(/^(\d+)\.\s+(.+)/);
    if (sectionMatch) {
      const num = parseInt(sectionMatch[1], 10) - 1;
      if (num >= 0 && num < SECTION_CATEGORIES.length) {
        currentSectionIdx = num;
        allElements.push({ tag, text, sectionIdx: currentSectionIdx, isHeading: true });
      }
      return;
    }

    allElements.push({ tag, text, sectionIdx: currentSectionIdx, isHeading: false });
  });

  // Now extract Q&A: typically <h3>Question</h3><p>Answer</p> pairs
  // or <p><strong>Q?</strong> Answer</p>
  for (let i = 0; i < allElements.length; i++) {
    const el = allElements[i];
    if (el.isHeading || el.sectionIdx === -1) continue;

    const tag = el.tag;

    // Pattern 1: <h3>Question text?</h3> followed by <p>Answer text</p>
    if (tag === "h3") {
      const question = el.text.replace(/[?:.]*$/, "").trim();
      // Look for answer in subsequent elements that are not headings
      let answer = null;
      for (let j = i + 1; j < allElements.length; j++) {
        const next = allElements[j];
        if (next.isHeading || next.sectionIdx !== el.sectionIdx) break;
        const nextText = next.text.trim();
        if (nextText.length > 10 && !nextText.match(/^\d+\.\s+/)) {
          answer = nextText;
          break;
        }
      }
      if (question.length > 5 && answer && answer.length > 5) {
        faqsToInsert.push({ question, answer, category: SECTION_CATEGORIES[el.sectionIdx], upvotes: 0, status: "approved", createdAt: new Date() });
      }
      continue;
    }

    // Pattern 2: <p><strong>Question?</strong> Answer text</p>
    if (tag === "p") {
      const strong = $(`${el.tagName}`, el).find("strong, b").first();
      if (strong.length) {
        const rawQ = strong.text().trim();
        const question = rawQ.replace(/[?:.]*$/, "").trim();
        const fullText = el.text.trim();
        const qIdx = fullText.indexOf(strong.text());
        const answer = qIdx !== -1 ? fullText.slice(qIdx + strong.text().length).replace(/^[:\s]+/, "").trim() : null;

        if (question.length > 5 && answer && answer.length > 5) {
          faqsToInsert.push({ question, answer, category: SECTION_CATEGORIES[el.sectionIdx], upvotes: 0, status: "approved", createdAt: new Date() });
        }
      }
    }
  }

  console.log(`Extracted ${faqsToInsert.length} potential FAQs`);

  // Deduplicate and insert
  for (const faq of faqsToInsert) {
    const existing = await Faq.findOne({ question: faq.question });
    if (existing) {
      console.log(`Skipped: ${faq.question.slice(0, 60)}`);
      skipped++;
    } else {
      await Faq.create(faq);
      console.log(`Inserted: ${faq.question.slice(0, 60)}`);
      inserted++;
    }
  }

  console.log(`\nScraping complete. Inserted ${inserted}, Skipped ${skipped} FAQs.`);
  await mongoose.disconnect();
  process.exit(0);
}

scrapeFaq().catch((err) => {
  console.error("Scraping failed:", err.message);
  mongoose.disconnect();
  process.exit(1);
});