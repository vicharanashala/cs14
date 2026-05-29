require("dotenv").config({ path: "./backend/.env" });
const mongoose = require("mongoose");
const Discussion = require("./models/Discussion");
const Faq = require("./models/Faq");

mongoose.connect(process.env.MONGO_URI || "mongodb+srv://harshitjain1234:8HxKCzLNrB0w6H38@cluster0.qbq8xzm.mongodb.net/faqDB").then(async () => {
  console.log("=== DISCUSSIONS ===");
  var discCats = await Discussion.aggregate([
    { "$group": { "_id": "$category", "count": { "$sum": 1 } } },
    { "$sort": { "count": -1 } }
  ]);
  console.log(JSON.stringify(discCats, null, 2));
  
  console.log("\n=== FAQS ===");
  var faqCats = await Faq.aggregate([
    { "$group": { "_id": "$category", "count": { "$sum": 1 } } },
    { "$sort": { "count": -1 } }
  ]);
  console.log(JSON.stringify(faqCats, null, 2));

  await mongoose.disconnect();
}).catch((e) => { console.error(e.message); process.exit(1); });