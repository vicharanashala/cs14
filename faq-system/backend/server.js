const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const faqRoutes = require("./routes/faqRoutes");
const discussionRoutes = require("./routes/discussionRoutes");
const adminRoutes = require("./routes/adminRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const userRoutes = require("./routes/userRoutes");

const path = require("path");
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB error", err));

app.use("/auth", authRoutes);
app.use("/faqs", faqRoutes);
app.use("/discussions", discussionRoutes);
app.use("/admin", adminRoutes);
app.use("/announcements", announcementRoutes);
app.use("/categories", categoryRoutes);
app.use("/users", userRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});