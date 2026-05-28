const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true, trim: true },
  answer: { type: String, required: true, trim: true },
  category: {
    type: String,
    required: true,
    enum: [
      "Academics",
      "Hostel",
      "Finance",
      "Library",
      "Sports",
      "Clubs",
      "Events",
      "Health",
      "Transport",
      "Admin",
      "IT Support",
      "Career",
      "Other",
    ],
  },
  createdByAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  upvotes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const Faq = mongoose.model("Faq", faqSchema);

module.exports = Faq;