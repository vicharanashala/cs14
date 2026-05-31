const express = require("express");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const Discussion = require("../models/Discussion");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

// ─── Multer disk storage ────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

// ─── File filter ────────────────────────────────────────────────
const ALLOWED_MIMES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const ALLOWED_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTS.has(ext)) {
    return cb(new Error(`File extension .${ext.slice(1)} is not allowed. Allowed: JPG, JPEG, PNG, WEBP, GIF`), false);
  }
  if (!ALLOWED_MIMES.has(file.mimetype)) {
    return cb(new Error("Invalid file type. Only image files are allowed."), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per image
});

// ─── Global error handler for multer ────────────────────────────
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File too large. Maximum size is 5 MB per image." });
    }
    return res.status(400).json({ message: err.message });
  }
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

// ─── POST /discussions/upload  — upload images (max 5) ──────────
router.post("/upload", verifyToken, upload.array("images", 5), handleMulterError, (req, res) => {
  try {
    const images = (req.files || []).map((f) => ({
      filename: f.filename,
      originalName: f.originalname,
      mimeType: f.mimetype,
      size: f.size,
    }));
    res.status(201).json({ images, message: `${images.length} image(s) uploaded successfully` });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─── GET /discussions/uploads/:filename — serve uploaded image ──
router.get("/uploads/:filename", (req, res) => {
  const filePath = path.join(__dirname, "../uploads", req.params.filename);
  res.sendFile(filePath, (err) => {
    if (err) res.status(404).json({ message: "Image not found" });
  });
});

// GET /discussions
router.get("/", async (req, res) => {
  try {
    const { category, status, sort, search } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search) filter.title = { $regex: search, $options: "i" };

    let query = Discussion.find(filter)
      .populate("author", "username")
      .populate("answers.author", "username")
      .populate("comments.author", "username");

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
    const { title, description, category, images } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ message: "All fields required" });
    }

    const discussion = new Discussion({
      title,
      description,
      category,
      author: req.user.userId,
      images: images || [],
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