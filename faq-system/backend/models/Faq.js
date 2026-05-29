const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true, trim: true },
  answer: { type: String, required: true, trim: true },
  category: {
    type: String,
    required: true,
    enum: [
      "About the Internship",
      "Timing and Dates",
      "NOC",
      "Selection and Offer Letter",
      "Work and Mentorship",
      "Communication Channels",
      "Interviews",
      "Certificate",
      "Rosetta",
      "Phase 1 and Coursework",
      "Yaksha Chat",
      "ViBe Platform",
      "Team Formation",
    ],
  },
  createdByAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  upvotes: { type: Number, default: 0 },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

const Faq = mongoose.model("Faq", faqSchema);

module.exports = Faq;