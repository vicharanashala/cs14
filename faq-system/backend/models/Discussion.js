const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  content: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const commentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const discussionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
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
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: {
    type: String,
    enum: ["unanswered", "pending", "answered", "approved", "rejected"],
    default: "unanswered",
  },
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  votedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  answers: [answerSchema],
  comments: [commentSchema],
  createdAt: { type: Date, default: Date.now },
});

const Discussion = mongoose.model("Discussion", discussionSchema);

module.exports = Discussion;