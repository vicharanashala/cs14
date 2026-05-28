const express = require("express");
const Faq = require("../models/Faq");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

const router = express.Router();

// GET /faqs
router.get("/", async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.question = { $regex: search, $options: "i" };
    }

    const faqs = await Faq.find(filter).sort({ createdAt: -1 });
    res.json(faqs);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /faqs/trending
router.get("/trending", async (req, res) => {
  try {
    const faqs = await Faq.find().sort({ upvotes: -1 }).limit(5);
    res.json(faqs);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /faqs/recent
router.get("/recent", async (req, res) => {
  try {
    const faqs = await Faq.find().sort({ createdAt: -1 }).limit(5);
    res.json(faqs);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST /faqs
router.post("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { question, answer, category } = req.body;

    if (!question || !answer || !category) {
      return res.status(400).json({ message: "All fields required" });
    }

    const faq = new Faq({
      question,
      answer,
      category,
      createdByAdmin: req.user.userId,
    });

    await faq.save();
    res.status(201).json(faq);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE /faqs/:id
router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const faq = await Faq.findByIdAndDelete(req.params.id);

    if (!faq) {
      return res.status(404).json({ message: "FAQ not found" });
    }

    res.json({ message: "FAQ deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;