import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../services/apiClient";

export function Home() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingId, setAddingId] = useState("");
  const [wishIds, setWishIds] = useState(() => new Set());

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (category) params.set("category", category);
    params.set("limit", "24");
    params.set("sort", "newest");
    return params.toString();
  }, [q, category]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          apiRequest(`/products?${queryString}`),
          apiRequest(`/categories`),
        ]);

        if (!cancelled) {
          setItems(productsRes.items || []);
          setCategories(categoriesRes.categories || []);
        }
      } catch (e) {
        if (!cancelled) setError(e.message || "Something went wrong");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [queryString]);

  useEffect(() => {
    let cancelled = false;
    async function loadWishlist() {
      if (!token) {
        setWishIds(new Set());
        return;
      }
      try {
        const data = await apiRequest(`/wishlist`, { token });
        if (!cancelled) {
          setWishIds(new Set((data.items || []).map((p) => p._id)));
        }
      } catch {
        // ignore wishlist bootstrap failures on home
      }
    }
    loadWishlist();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const addToCart = async (productId) => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setAddingId(productId);
      await apiRequest(`/cart/items`, { method: "POST", token, body: { productId, qty: 1 } });
      navigate("/cart");
    } catch (e) {
      setError(e.message || "Failed to add to cart");
    } finally {
      setAddingId("");
    }
  };

  const toggleWishlist = async (productId) => {
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const data = await apiRequest(`/wishlist/${productId}`, { method: "POST", token });
      setWishIds(new Set((data.items || []).map((p) => p._id)));
    } catch (e) {
      setError(e.message || "Failed to update wishlist");
    }
  };

  return (
    <div style={{ padding: 24, textAlign: "left" }}>
      <div style={{ display: "flex", gap: 12, alignItems: "end", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 240px" }}>
          <label htmlFor="search" style={{ display: "block", marginBottom: 6 }}>
            Search
          </label>
          <input
            id="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products..."
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--border)" }}
          />
        </div>

        <div style={{ width: 240 }}>
          <label htmlFor="category" style={{ display: "block", marginBottom: 6 }}>
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--border)" }}
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <h2 style={{ marginBottom: 12 }}>Products</h2>

        {loading ? (
          <div>Loading products...</div>
        ) : error ? (
          <div style={{ color: "crimson" }}>{error}</div>
        ) : items.length === 0 ? (
          <div>No products found.</div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 12,
            }}
          >
            {items.map((p) => {
              const wished = wishIds.has(p._id);
              return (
                <div
                  key={p._id}
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    padding: 14,
                    background: "rgba(0,0,0,0.02)",
                  }}
                >
                  <div style={{ fontWeight: 600, color: "var(--text-h)" }}>{p.name}</div>
                  <div style={{ marginTop: 6, color: "var(--text)" }}>{p.category}</div>
                  <div
                    style={{ marginTop: 10, fontFamily: "var(--mono)", color: "var(--text-h)" }}
                  >
                    ₹{p.price}
                  </div>
                  <div style={{ marginTop: 10, fontSize: 14, color: "var(--text)" }}>
                    Stock: {p.countInStock ?? 0}
                  </div>
                  <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
                    <button onClick={() => navigate(`/products/${p._id}`)}>View details</button>\n                    <button onClick={() => addToCart(p._id)} disabled={addingId === p._id}>\n                      {addingId === p._id ? "Adding..." : "Add to cart"}\n                    </button>\n                    <button onClick={() => toggleWishlist(p._id)}>\n                      {wished ? "Wishlisted" : "Wishlist"}\n                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

