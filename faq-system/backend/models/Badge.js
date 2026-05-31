const mongoose = require("mongoose");

const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, default: "" },
  icon: { type: String, default: "🏅" },
  criteria: { type: String, default: "" },
  tier: { type: String, enum: ["bronze", "silver", "gold", "platinum"], default: "bronze" },
  points: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const Badge = mongoose.model("Badge", badgeSchema);

module.exports = Badge;