require("dotenv").config({ path: "./backend/.env" });
const mongoose = require("mongoose");
const Faq = require("./models/Faq");

mongoose.connect(process.env.MONGO_URI || "mongodb+srv://harshitjain1234:8HxKCzLNrB0w6H38@cluster0.qbq8xzm.mongodb.net/faqDB").then(async () => {
  // Check NOC count in DB
  const nocCount = await Faq.countDocuments({ category: "NOC" });
  console.log("NOC FAQs in DB:", nocCount);
  
  // Get all unique categories
  const cats = await Faq.distinct("category");
  console.log("\nAll categories in DB (" + cats.length + "):");
  cats.sort().forEach(function(c) { console.log(" ", c); });
  
  // Check Interview, Certificate, Yaksha Chat
  var missing = [];
  for (var i = 0; i < 13; i++) {
    var cat = [
      "About the Internship", "Timing and Dates", "NOC",
      "Selection and Offer Letter", "Work and Mentorship",
      "Communication Channels", "Interviews", "Certificate",
      "Rosetta", "Phase 1 and Coursework", "Yaksha Chat",
      "ViBe Platform", "Team Formation"
    ][i];
    var cnt = await Faq.countDocuments({ category: cat });
    console.log(cat + ": " + cnt);
    if (cnt === 0) missing.push(cat);
  }
  
  console.log("\nMissing categories:", missing.join(", "));
  
  await mongoose.disconnect();
}).catch((e) => { console.error(e.message); process.exit(1); });