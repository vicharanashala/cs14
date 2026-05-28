const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");

dotenv.config();

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB error", err));

app.use("/auth", authRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});