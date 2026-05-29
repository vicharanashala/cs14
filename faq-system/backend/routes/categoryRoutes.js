const express = require("express");
const Category = require("../models/Category");
const router = express.Router();

// GET /categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
