import express from "express";
import mongoose from "mongoose";
import Product from "../models/Product.js";

const router = express.Router();

function parsePositiveInt(value, fallback, { min = 1, max = 100 } = {}) {
  const n = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(n) || Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

// GET /api/products?q=&category=&sort=&page=&limit=
router.get("/products", async (req, res) => {
  try {
    const { q, category, sort } = req.query;
    const page = parsePositiveInt(req.query.page, 1, { min: 1, max: 10_000 });
    const limit = parsePositiveInt(req.query.limit, 12, { min: 1, max: 100 });

    const filter = {};
    if (q) {
      filter.name = { $regex: String(q), $options: "i" };
    }
    if (category) {
      filter.category = String(category);
    }

    let sortSpec = { createdAt: -1 };
    if (sort === "price_asc") sortSpec = { price: 1 };
    if (sort === "price_desc") sortSpec = { price: -1 };
    if (sort === "newest") sortSpec = { createdAt: -1 };

    const [items, total] = await Promise.all([
      Product.find(filter)
        .sort(sortSpec)
        .skip((page - 1) * limit)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/products/:id
router.get("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/categories
router.get("/categories", async (_req, res) => {
  try {
    const categories = await Product.distinct("category");
    res.json({ success: true, categories: categories.filter(Boolean).sort() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
