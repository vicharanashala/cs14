const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding");

    // Create admin if not exists
    const adminExists = await User.findOne({ email: "admin@faq.com" });
    if (!adminExists) {
      const adminHash = await bcrypt.hash("admin123", 10);
      await User.create({
        username: "admin",
        email: "admin@faq.com",
        passwordHash: adminHash,
        role: "admin",
      });
      console.log("Admin user created");
    } else {
      console.log("Admin user already exists");
    }

    // Create student1 if not exists
    const student1Exists = await User.findOne({ email: "student1@faq.com" });
    if (!student1Exists) {
      const hash1 = await bcrypt.hash("test123", 10);
      await User.create({
        username: "student1",
        email: "student1@faq.com",
        passwordHash: hash1,
        role: "user",
      });
      console.log("student1 created");
    } else {
      console.log("student1 already exists");
    }

    // Create student2 if not exists
    const student2Exists = await User.findOne({ email: "student2@faq.com" });
    if (!student2Exists) {
      const hash2 = await bcrypt.hash("test123", 10);
      await User.create({
        username: "student2",
        email: "student2@faq.com",
        passwordHash: hash2,
        role: "user",
      });
      console.log("student2 created");
    } else {
      console.log("student2 already exists");
    }

    console.log("Seeding complete");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();