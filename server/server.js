import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import cartRoutes from "./routes/cart.js";
import wishlistRoutes from "./routes/wishlist.js";
import orderRoutes from "./routes/orders.js";
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
app.use("/api", productRoutes);
app.use("/api", cartRoutes);
app.use("/api", wishlistRoutes);
app.use("/api", orderRoutes);

// Protected Routes Example
app.get("/api/profile", authMiddleware, (req, res) => {
  res.json({ message: "Profile data", userId: req.userId });
});

// Public Routes
app.get("/", (req, res) => {
  res.json({ ok: true, service: "mern-ecommerce-api" });
});

// Start server
app.listen(5000, () => {
  console.log("Server is started in port 5000");
});