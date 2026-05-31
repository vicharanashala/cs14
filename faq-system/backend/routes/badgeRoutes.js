const express = require("express");
const Badge = require("../models/Badge");
const UserProfile = require("../models/UserProfile");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

const router = express.Router();

// GET /badges — list all badges
router.get("/", async (req, res) => {
  try {
    const badges = await Badge.find().sort({ points: 1 });
    res.json(badges);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /badges/leaderboard — top users by points
router.get("/leaderboard", async (req, res) => {
  try {
    const profiles = await UserProfile.find()
      .populate("userId", "username email")
      .sort({ points: -1 })
      .limit(20);
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /badges/user/:userId — get a user's profile with badges
router.get("/user/:userId", async (req, res) => {
  try {
    let profile = await UserProfile.findOne({ userId: req.params.userId })
      .populate("badges", "name description icon tier points");
    if (!profile) {
      // Auto-create profile if doesn't exist
      profile = new UserProfile({ userId: req.params.userId });
      await profile.save();
      profile = await UserProfile.findOne({ userId: req.params.userId })
        .populate("badges", "name description icon tier points");
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST /badges — create a badge (admin only)
router.post("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, description, icon, tier, criteria, points } = req.body;
    if (!name) return res.status(400).json({ message: "Badge name is required" });
    const existing = await Badge.findOne({ name });
    if (existing) return res.status(400).json({ message: "Badge already exists" });

    const badge = new Badge({ name, description, icon, tier, criteria, points });
    await badge.save();
    res.status(201).json(badge);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST /badges/award — award a badge to a user
router.post("/award", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { userId, badgeId } = req.body;
    if (!userId || !badgeId) return res.status(400).json({ message: "userId and badgeId required" });

    const badge = await Badge.findById(badgeId);
    if (!badge) return res.status(404).json({ message: "Badge not found" });

    let profile = await UserProfile.findOne({ userId });
    if (!profile) {
      profile = new UserProfile({ userId });
      await profile.save();
    }

    if (!profile.badges.some((b) => b.toString() === badgeId)) {
      profile.badges.push(badgeId);
      profile.points = (profile.points || 0) + badge.points;
      await profile.save();
    }

    res.json({ message: `Badge '${badge.name}' awarded`, profile });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PATCH /badges/profile — update own profile
router.patch("/profile", verifyToken, async (req, res) => {
  try {
    const { bio } = req.body;
    let profile = await UserProfile.findOne({ userId: req.user.userId });
    if (!profile) {
      profile = new UserProfile({ userId: req.user.userId });
    }
    if (bio !== undefined) profile.bio = bio;
    profile.updatedAt = new Date();
    await profile.save();
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;