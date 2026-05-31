const express = require("express");
const User = require("../models/User");
const UserProfile = require("../models/UserProfile");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

// GET /users/:id/profile — public profile with badges and stats
router.get("/:id/profile", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("username createdAt");
    if (!user) return res.status(404).json({ message: "User not found" });

    let profile = await UserProfile.findOne({ userId: req.params.id })
      .populate("badges", "name description icon tier points");

    if (!profile) {
      profile = new UserProfile({ userId: req.params.id });
      await profile.save();
      profile = await UserProfile.findOne({ userId: req.params.id })
        .populate("badges", "name description icon tier points");
    }

    res.json({
      username: user.username,
      badges: profile.badges,
      stats: profile.stats,
      points: profile.points,
      rank: profile.rank,
    });
  } catch (err) {
    console.error("[userRoutes] GET /:id/profile error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;