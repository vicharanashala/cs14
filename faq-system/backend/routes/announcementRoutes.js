const express = require("express");
const Announcement = require("../models/Announcement");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

const router = express.Router();

// GET /announcements (public)
router.get("/", async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST /announcements (admin only)
router.post("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "All fields required" });
    }

    const announcement = new Announcement({
      title,
      content,
      createdByAdmin: req.user.userId,
    });

    await announcement.save();
    res.status(201).json(announcement);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PUT /announcements/:id
router.put("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { title, content } = req.body;
    const updated = await Announcement.findByIdAndUpdate(req.params.id, { title, content }, { new: true });
    if (!updated) return res.status(404).json({ message: "Announcement not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE /announcements/:id
router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const deleted = await Announcement.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Announcement not found" });
    res.json({ message: "Announcement deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;