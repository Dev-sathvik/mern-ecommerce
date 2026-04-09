import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import Product from "../models/Product.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// GET /api/wishlist
router.get("/wishlist", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("wishlist");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ success: true, items: user.wishlist || [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/wishlist/:productId  (toggle)
router.post("/wishlist/:productId", authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const exists = user.wishlist.some((id) => String(id) === String(productId));
    if (exists) {
      user.wishlist = user.wishlist.filter((id) => String(id) !== String(productId));
    } else {
      user.wishlist.push(productId);
    }

    await user.save();

    const populated = await User.findById(req.userId).populate("wishlist");
    res.json({ success: true, items: populated?.wishlist || [], wished: !exists });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
