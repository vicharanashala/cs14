const mongoose = require("mongoose");

const userProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  bio: { type: String, default: "" },
  rank: { type: String, enum: ["Newcomer", "Contributor", "Expert", "Mentor", "Hall of Fame"], default: "Newcomer" },
  points: { type: Number, default: 0 },
  badges: [{ type: mongoose.Schema.Types.ObjectId, ref: "Badge" }],
  stats: {
    questionsAsked: { type: Number, default: 0 },
    answersGiven: { type: Number, default: 0 },
    answersAccepted: { type: Number, default: 0 },
    upvotesReceived: { type: Number, default: 0 },
  },
  updatedAt: { type: Date, default: Date.now },
});

const UserProfile = mongoose.model("UserProfile", userProfileSchema);

module.exports = UserProfile;