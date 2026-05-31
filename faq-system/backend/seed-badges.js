const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(__dirname, ".env") });

const Badge = require("./models/Badge");
const UserProfile = require("./models/UserProfile");

// Must match badgeEngine.js BADGE_DEFS exactly
const DEFAULT_BADGES = [
  { name: "First Question",       description: "Asked your first question",        icon: "🙋", tier: "bronze",  criteria: "Ask your first question",              points: 5  },
  { name: "First Answer",         description: "Gave your first answer",           icon: "💬", tier: "bronze",  criteria: "Give your first answer",              points: 5  },
  { name: "Verified Contributor", description: "Had an answer accepted",           icon: "✅", tier: "silver",  criteria: "Have an answer accepted",             points: 15 },
  { name: "Helping Hand",         description: "Gave 5 or more answers",           icon: "🤝", tier: "silver",  criteria: "Give 5 or more answers",              points: 20 },
  { name: "Problem Solver",       description: "Had 3 or more answers accepted",   icon: "🛠️", tier: "silver",  criteria: "Have 3 or more answers accepted",      points: 25 },
  { name: "Popular Voice",        description: "Received 10 or more upvotes",      icon: "⬆️", tier: "gold",    criteria: "Receive 10 or more upvotes",           points: 30 },
  { name: "Community Champion",   description: "Had 10 or more answers accepted", icon: "🏆", tier: "gold",    criteria: "Have 10 or more answers accepted",     points: 50 },
  { name: "Top Contributor",      description: "Gave 20 or more answers",          icon: "🌟", tier: "platinum", criteria: "Give 20 or more answers",             points: 75 },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  for (const b of DEFAULT_BADGES) {
    const existing = await Badge.findOne({ name: b.name });
    if (!existing) {
      await Badge.create(b);
      console.log(`Created badge: ${b.name}`);
    } else {
      console.log(`Badge already exists: ${b.name}`);
    }
  }

  // Initialize profiles for existing users
  const User = require("./models/User");
  const users = await User.find();
  for (const user of users) {
    const existing = await UserProfile.findOne({ userId: user._id });
    if (!existing) {
      await UserProfile.create({ userId: user._id });
      console.log(`Created profile for user: ${user.username}`);
    }
  }

  console.log("Badge seeding complete!");
  await mongoose.disconnect();
}

seed().catch(console.error);