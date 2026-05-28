const express = require("express");
const Discussion = require("../models/Discussion");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

// GET /discussions
router.get("/", async (req, res) => {
  try {
    const { category, status, sort, search } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search) filter.title = { $regex: search, $options: "i" };

    let query = Discussion.find(filter).populate("author", "username");

    if (sort === "upvotes") {
      query = query.sort({ upvotes: -1 });
    } else if (sort === "unanswered") {
      filter.status = "unanswered";
      query = query.sort({ createdAt: -1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const discussions = await query;
    res.json(discussions);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST /discussions
router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ message: "All fields required" });
    }

    const discussion = new Discussion({
      title,
      description,
      category,
      author: req.user.userId,
    });

    await discussion.save();
    res.status(201).json(discussion);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST /discussions/:id/answers
router.post("/:id/answers", verifyToken, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Content required" });
    }

    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    discussion.answers.push({
      author: req.user.userId,
      content,
      createdAt: new Date(),
    });

    if (discussion.status === "unanswered") {
      discussion.status = "pending";
    }

    await discussion.save();
    res.status(201).json(discussion);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST /discussions/:id/comments
router.post("/:id/comments", verifyToken, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Content required" });
    }

    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    discussion.comments.push({
      author: req.user.userId,
      content,
      createdAt: new Date(),
    });

    await discussion.save();
    res.status(201).json(discussion);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PATCH /discussions/:id/upvote
router.patch("/:id/upvote", verifyToken, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    const userId = req.user.userId.toString();
    const alreadyVoted = discussion.votedBy.some((id) => id.toString() === userId);

    if (alreadyVoted) {
      return res.status(400).json({ message: "Already voted" });
    }

    discussion.upvotes += 1;
    discussion.votedBy.push(userId);
    await discussion.save();

    res.json({ upvotes: discussion.upvotes, downvotes: discussion.downvotes });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PATCH /discussions/:id/downvote
router.patch("/:id/downvote", verifyToken, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    const userId = req.user.userId.toString();
    const alreadyVoted = discussion.votedBy.some((id) => id.toString() === userId);

    if (alreadyVoted) {
      return res.status(400).json({ message: "Already voted" });
    }

    discussion.downvotes += 1;
    discussion.votedBy.push(userId);
    await discussion.save();

    res.json({ upvotes: discussion.upvotes, downvotes: discussion.downvotes });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;