const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, default: "" },
  icon: { type: String, default: "📁" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Category", categorySchema);
