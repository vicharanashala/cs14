const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(__dirname, ".env") });

const Badge = require("./models/Badge");
const UserProfile = require("./models/UserProfile");

const DEFAULT_BADGES = [
  { name: "First Step", description: "Asked your first question", icon: "🌱", tier: "bronze", criteria: "Ask your first FAQ question", points: 5 },
  { name: "Helpful Hand", description: "First answer accepted as helpful", icon: "🤝", tier: "bronze", criteria: "Have your first answer upvoted", points: 10 },
  { name: "Curious Mind", description: "Asked 5 questions", icon: "❓", tier: "bronze", criteria: "Ask 5 FAQ questions", points: 15 },
  { name: "Rising Star", description: "Received 10 upvotes across all posts", icon: "⭐", tier: "silver", criteria: "Receive 10 total upvotes", points: 25 },
  { name: "Expert Answer", description: "Provided 10 verified answers", icon: "🎓", tier: "silver", criteria: "Provide 10 answers", points: 50 },
  { name: "Community Pillar", description: "Received 50 upvotes", icon: "🏅", tier: "gold", criteria: "Receive 50 total upvotes", points: 100 },
  { name: "Top Contributor", description: "Ranked in the top 10 of the leaderboard", icon: "🏆", tier: "gold", criteria: "Reach top 10 on the leaderboard", points: 150 },
  { name: "Hall of Fame", description: "Accumulated 500 points", icon: "👑", tier: "platinum", criteria: "Earn 500 points", points: 250 },
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