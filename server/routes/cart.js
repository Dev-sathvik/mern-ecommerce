import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import Product from "../models/Product.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

async function getPopulatedCart(userId) {
  const user = await User.findById(userId).populate("cartItems.product");
  if (!user) return null;

  const items = (user.cartItems || [])
    .filter((ci) => ci.product)
    .map((ci) => ({
      product: ci.product,
      qty: ci.qty,
      lineTotal: (ci.product.price ?? 0) * ci.qty,
    }));

  const subtotal = items.reduce((sum, it) => sum + it.lineTotal, 0);
  return { items, subtotal };
}

// GET /api/cart
router.get("/cart", authMiddleware, async (req, res) => {
  try {
    const cart = await getPopulatedCart(req.userId);
    if (!cart) return res.status(404).json({ message: "User not found" });
    res.json({ success: true, ...cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/cart/items { productId, qty? }
router.post("/cart/items", authMiddleware, async (req, res) => {
  try {
    const { productId, qty } = req.body;
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: "Invalid product id" });
    }
    const addQty = Math.max(1, Number.parseInt(qty ?? "1", 10) || 1);

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const existing = user.cartItems.find((ci) => String(ci.product) === String(productId));
    if (existing) {
      existing.qty += addQty;
    } else {
      user.cartItems.push({ product: productId, qty: addQty });
    }

    await user.save();
    const cart = await getPopulatedCart(req.userId);
    res.status(201).json({ success: true, ...cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/cart/items/:productId { qty }
router.patch("/cart/items/:productId", authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: "Invalid product id" });
    }
    const nextQty = Number.parseInt(req.body?.qty, 10);
    if (!Number.isFinite(nextQty) || Number.isNaN(nextQty) || nextQty < 1) {
      return res.status(400).json({ message: "qty must be a number >= 1" });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const item = user.cartItems.find((ci) => String(ci.product) === String(productId));
    if (!item) return res.status(404).json({ message: "Item not found in cart" });

    item.qty = nextQty;
    await user.save();

    const cart = await getPopulatedCart(req.userId);
    res.json({ success: true, ...cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/cart/items/:productId
router.delete("/cart/items/:productId", authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.cartItems = user.cartItems.filter((ci) => String(ci.product) !== String(productId));
    await user.save();

    const cart = await getPopulatedCart(req.userId);
    res.json({ success: true, ...cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/cart
router.delete("/cart", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.cartItems = [];
    await user.save();

    const cart = await getPopulatedCart(req.userId);
    res.json({ success: true, ...cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
