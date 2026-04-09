import express from "express";
import mongoose from "mongoose";
import { authMiddleware } from "../middleware/auth.js";
import User from "../models/User.js";
import Order from "../models/Order.js";

const router = express.Router();

// POST /api/orders  (COD) { shippingAddress: { fullName, phone, addressLine1, city, state, postalCode } }
router.post("/orders", authMiddleware, async (req, res) => {
  try {
    const sa = req.body?.shippingAddress;
    const required = ["fullName", "phone", "addressLine1", "city", "state", "postalCode"];
    for (const k of required) {
      if (!sa?.[k] || String(sa[k]).trim() === "") {
        return res.status(400).json({ message: `shippingAddress.${k} is required` });
      }
    }

    const user = await User.findById(req.userId).populate("cartItems.product");
    if (!user) return res.status(404).json({ message: "User not found" });

    const cartItems = (user.cartItems || []).filter((ci) => ci.product);
    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const items = cartItems.map((ci) => ({
      product: ci.product._id,
      name: ci.product.name,
      price: ci.product.price,
      qty: ci.qty,
    }));

    const subtotal = items.reduce((sum, it) => sum + it.price * it.qty, 0);

    const order = await Order.create({
      user: user._id,
      items,
      subtotal,
      shippingAddress: {
        fullName: String(sa.fullName).trim(),
        phone: String(sa.phone).trim(),
        addressLine1: String(sa.addressLine1).trim(),
        city: String(sa.city).trim(),
        state: String(sa.state).trim(),
        postalCode: String(sa.postalCode).trim(),
      },
      paymentMethod: "COD",
      status: "placed",
    });

    user.cartItems = [];
    await user.save();

    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/orders  (my orders)
router.get("/orders", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json({ success: true, items: orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/orders/:id  (my order details)
router.get("/orders/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (String(order.user) !== String(req.userId)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
