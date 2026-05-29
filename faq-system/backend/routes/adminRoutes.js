const express = require("express");
const Discussion = require("../models/Discussion");
const User = require("../models/User");
const Faq = require("../models/Faq");
const Category = require("../models/Category");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

const router = express.Router();

// All routes require verifyToken + verifyAdmin
router.use(verifyToken, verifyAdmin);

// GET /admin/discussions
router.get("/discussions", async (req, res) => {
  try {
    const { category, status } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;

    const discussions = await Discussion.find(filter)
      .populate("author", "username")
      .populate("answers.author", "username");
    res.json(discussions);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PATCH /admin/discussions/:id/verify-answer
router.patch("/discussions/:id/verify-answer", async (req, res) => {
  try {
    const { answerId } = req.body;
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    const answer = discussion.answers.id(answerId);
    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    answer.isVerified = true;
    await discussion.save();

    const sortedAnswers = [...discussion.answers].sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
    discussion.answers = sortedAnswers;
    await discussion.save();

    res.json(discussion);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PATCH /admin/discussions/:id/approve
router.patch("/discussions/:id/approve", async (req, res) => {
  console.log("--- 1. APPROVE ROUTE STARTED ---");
  console.log("Discussion ID:", req.params.id);
  console.log("Answer ID:", req.body.answerId);
  console.log("Admin User Object:", req.user);

  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }
    console.log("--- 2. DISCUSSION FOUND ---", discussion.title);

    const answer = discussion.answers.id(req.body.answerId);
    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }
    console.log("--- 3. ANSWER FOUND ---", answer.content);

    const newFaq = new Faq({
      question: discussion.title,
      answer: answer.content,
      category: discussion.category,
      createdByAdmin: req.user?.userId || req.user?.id || req.user?._id || null,
      status: "approved",
    });

    console.log("--- 4. ATTEMPTING TO SAVE FAQ ---");
    await newFaq.save();
    console.log("--- 5. FAQ SAVED SUCCESSFULLY ---");

    await Discussion.findByIdAndDelete(req.params.id);
    console.log("--- 6. OLD DISCUSSION DELETED ---");

    res.json({ message: "FAQ created and discussion removed", faq: newFaq });
  } catch (err) {
    console.error("💥 BACKEND CRASHED! ERROR DETAILS:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PATCH /admin/discussions/:id/reject
router.patch("/discussions/:id/reject", async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }
    // Delete the discussion from the Discussion collection (no FAQ created)
    await Discussion.findByIdAndDelete(req.params.id);
    res.json({ message: "Discussion deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE /admin/discussions/:id
router.delete("/discussions/:id", async (req, res) => {
  try {
    const discussion = await Discussion.findByIdAndDelete(req.params.id);
    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }
    res.json({ message: "Discussion deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /admin/analytics
router.get("/analytics", async (req, res) => {
  try {
    const [totalFaqs, totalUsers, categoryAgg, mostUpvoted] = await Promise.all([
      Faq.countDocuments(),
      User.countDocuments(),
      Discussion.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ]),
      Discussion.findOne().sort({ upvotes: -1 }).select("title upvotes"),
    ]);

    const mostActiveCategory = categoryAgg.length > 0 ? categoryAgg[0]._id : "None";

    res.json({
      totalFaqs,
      totalUsers,
      mostActiveCategory,
      mostUpvotedQuestion: mostUpvoted
        ? { title: mostUpvoted.title, upvotes: mostUpvoted.upvotes }
        : { title: "None", upvotes: 0 },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST /admin/discussions/bulk-approve
router.post("/discussions/bulk-approve", async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !ids.length) return res.status(400).json({ message: "No IDs provided" });
    let approvedCount = 0;
    for (const dId of ids) {
      const discussion = await Discussion.findById(dId);
      if (discussion && discussion.answers.length > 0) {
        const sorted = [...discussion.answers].sort((a,b) => (b.upvotes || 0) - (a.upvotes || 0));
        const answer = sorted[0];
        const newFaq = new Faq({
          question: discussion.title,
          answer: answer.content,
          category: discussion.category,
          createdByAdmin: req.user.userId,
          status: "approved",
        });
        await newFaq.save();
        await Discussion.findByIdAndDelete(dId);
        approvedCount++;
      } else if (discussion) {
        await Discussion.findByIdAndDelete(dId);
      }
    }
    res.json({ message: `Successfully approved/resolved ${approvedCount} discussions` });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST /admin/discussions/bulk-delete
router.post("/discussions/bulk-delete", async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !ids.length) return res.status(400).json({ message: "No IDs provided" });
    await Discussion.deleteMany({ _id: { $in: ids } });
    res.json({ message: `Successfully deleted ${ids.length} discussions` });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST /admin/categories
router.post("/categories", async (req, res) => {
  try {
    const { name, description, icon } = req.body;
    if (!name) return res.status(400).json({ message: "Category name is required" });
    const existing = await Category.findOne({ name: name.trim() });
    if (existing) return res.status(400).json({ message: "Category already exists" });

    const category = new Category({
      name: name.trim(),
      description: description || "",
      icon: icon || "📁"
    });
    await category.save();
    res.status(201).json({ message: "Category created", data: category });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE /admin/categories/:name
router.delete("/categories/:name", async (req, res) => {
  try {
    const { name } = req.params;
    const deleted = await Category.findOneAndDelete({ name });
    if (!deleted) return res.status(404).json({ message: "Category not found" });
    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;