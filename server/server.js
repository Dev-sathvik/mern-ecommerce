import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import { authMiddleware } from "./middleware/auth.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.log(err));

// Auth Routes
app.use("/api/auth", authRoutes);

// Protected Routes Example
app.get("/api/cart", authMiddleware, (req, res) => {
  res.json({ message: "Cart data", userId: req.userId });
});

app.get("/api/orders", authMiddleware, (req, res) => {
  res.json({ message: "Orders data", userId: req.userId });
});

app.get("/api/profile", authMiddleware, (req, res) => {
  res.json({ message: "Profile data", userId: req.userId });
});

// Public Routes
app.get("/", (req, res) => {
  res.json([{ name: "Phone", price: 20000 }]);
});

// Start server
app.listen(5000, () => {
  console.log("Server is started in port 5000");
});