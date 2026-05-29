require("dotenv").config({ path: "./backend/.env" });
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User");
const Faq = require("./models/Faq");
const Discussion = require("./models/Discussion");
const Announcement = require("./models/Announcement");

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://harshitjain1234:8HxKCzLNrB0w6H38@cluster0.qbq8xzm.mongodb.net/faqDB";

const CATEGORIES = [
  "About the Internship",
  "Timing and Dates",
  "NOC",
  "Selection and Offer Letter",
  "Work and Mentorship",
  "Communication Channels",
  "Interviews",
  "Certificate",
  "Rosetta",
  "Phase 1 and Coursework",
  "Yaksha Chat",
  "ViBe Platform",
  "Team Formation",
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB for seeding\n");

  // 1. Create users only if they don't exist
  const adminExists = await User.findOne({ email: "admin@faq.com" });
  let adminUser, student1User, student2User;

  if (!adminExists) {
    const hash = await bcrypt.hash("admin123", 10);
    adminUser = await User.create({ username: "admin", email: "admin@faq.com", passwordHash: hash, role: "admin" });
    console.log("✓ Created admin user: admin@faq.com / admin123");
  } else {
    adminUser = adminExists;
    console.log("⏭  Skipped admin user (already exists)");
  }

  const student1Exists = await User.findOne({ email: "student1@faq.com" });
  if (!student1Exists) {
    const hash = await bcrypt.hash("test123", 10);
    student1User = await User.create({ username: "student1", email: "student1@faq.com", passwordHash: hash, role: "user" });
    console.log("✓ Created student1: student1@faq.com / test123");
  } else {
    student1User = student1Exists;
    console.log("⏭  Skipped student1 (already exists)");
  }

  const student2Exists = await User.findOne({ email: "student2@faq.com" });
  if (!student2Exists) {
    const hash = await bcrypt.hash("test123", 10);
    student2User = await User.create({ username: "student2", email: "student2@faq.com", passwordHash: hash, role: "user" });
    console.log("✓ Created student2: student2@faq.com / test123");
  } else {
    student2User = student2Exists;
    console.log("⏭  Skipped student2 (already exists)");
  }

  console.log("");

  // 2. Create FAQs only if collection is empty
  const faqCount = await Faq.countDocuments();
  if (faqCount === 0) {
    const faqs = [
      {
        question: "What is the Vicharanashala internship?",
        answer: "A two-month internship run by Vicharanashala, a research lab at IIT Ropar. You work on a real open-source project under a mentor after a short training phase. The internship is free.",
        category: "About the Internship",
        status: "approved",
      },
      {
        question: "Who can sign the NOC?",
        answer: "Any authorised signatory at your college: HOD, Acting HOD, Principal, Dean, Director, or Training and Placement Officer.",
        category: "NOC",
        status: "approved",
      },
      {
        question: "How do I know I am selected?",
        answer: "If you can see your yellow VINS result panel on samagama.in, you are selected. There is no separate selection step or confirmation email.",
        category: "Selection and Offer Letter",
        status: "approved",
      },
      {
        question: "Can I use a mobile or tablet for ViBe?",
        answer: "No, only desktop or laptop is supported.",
        category: "ViBe Platform",
        status: "approved",
      },
      {
        question: "What is the size of a team?",
        answer: "The team size is fixed at four members. You cannot have fewer or more members in a team.",
        category: "Team Formation",
        status: "approved",
      },
    ];
    await Faq.insertMany(faqs);
    console.log(`✓ Created ${faqs.length} FAQs (all approved)`);
  } else {
    console.log(`⏭  Skipped FAQs (${faqCount} already in DB)`);
  }

  console.log("");

  // 3. Create Discussions only if collection is empty
  const discCount = await Discussion.countDocuments();
  if (discCount === 0) {
    const discussions = [
      {
        title: "When exactly does the internship start?",
        description: "I want to confirm my start date and what happens on day one",
        category: "Timing and Dates",
        author: student1User._id,
        status: "unanswered",
        answers: [],
      },
      {
        title: "Can HOD email the NOC instead of signing?",
        description: "My HOD is not available to sign physically, is email okay?",
        category: "NOC",
        author: student1User._id,
        status: "unanswered",
        answers: [],
      },
      {
        title: "What projects will we work on?",
        description: "Can someone share what kind of open source projects are assigned?",
        category: "Work and Mentorship",
        author: student1User._id,
        status: "pending",
        answers: [
          {
            author: student2User._id,
            content: "Projects range across AI/ML, web development, NLP, and education-tech. Your mentor assigns based on your background.",
            isVerified: false,
            upvotes: 0,
          },
        ],
      },
      {
        title: "Is the ViBe consent form compulsory?",
        description: "What if I dont want to grant camera access on ViBe?",
        category: "ViBe Platform",
        author: student1User._id,
        status: "pending",
        answers: [
          {
            author: adminUser._id,
            content: "Yes the consent form is compulsory. Proctoring via webcam and microphone is mandatory for fairness and academic integrity.",
            isVerified: false,
            upvotes: 0,
          },
        ],
      },
      {
        title: "How do I submit Rosetta at the end?",
        description: "What is the exact process to submit the Rosetta journal?",
        category: "Rosetta",
        author: student1User._id,
        status: "answered",
        answers: [
          {
            author: adminUser._id,
            content: "Share your Rosetta Google Doc with the coordinator email, set permission to Viewer, ensure all 65 entries are filled and your name is in the title.",
            isVerified: true,
            upvotes: 0,
          },
        ],
      },
      {
        title: "Can I form a team with someone from my college?",
        description: "My friend is also in the internship, can we be in the same team?",
        category: "Team Formation",
        author: student1User._id,
        status: "approved",
        answers: [
          {
            author: student2User._id,
            content: "No. Teams must consist of members from different institutions to encourage networking.",
            isVerified: false,
            upvotes: 0,
          },
        ],
      },
    ];

    await Discussion.insertMany(discussions);
    console.log(`✓ Created ${discussions.length} Discussions`);
  } else {
    console.log(`⏭  Skipped Discussions (${discCount} already in DB)`);
  }

  console.log("");

  // 4. Create Announcement only if collection is empty
  const annCount = await Announcement.countDocuments();
  if (annCount === 0) {
    await Announcement.create({
      title: "Welcome to the Vicharanashala Internship FAQ System!",
      content: "Find answers about your internship, ask questions, and help your peers. Browse by category or search directly.",
    });
    console.log("✓ Created 1 Announcement");
  } else {
    console.log("⏭  Skipped Announcement (already exists)");
  }

  console.log("\nSeeding complete.");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  mongoose.disconnect();
  process.exit(1);
});