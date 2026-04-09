import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../services/apiClient";

export function ProductDetail() {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [wished, setWished] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        setError("");
        const data = await apiRequest(`/products/${productId}`);
        setProduct(data);
        setQty(1);
        setWished(false); // Will load separately if needed
      } catch (e) {
        setError(e.message || "Product not found");
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [productId]);

  useEffect(() => {
    async function loadWishlist() {
      if (!token || !product) return;
      try {
        const data = await apiRequest(`/wishlist`, { token });
        setWished(data.items.some(p => p._id === product._id));
      } catch {
        // ignore
      }
    }
    loadWishlist();
  }, [token, product]);

  const addToCart = async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      setAdding(true);
      await apiRequest(`/cart/items`, {
        method: "POST",
        token,
        body: { productId, qty }
      });
      navigate("/cart");
    } catch (e) {
      setError(e.message || "Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  const toggleWishlist = async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const data = await apiRequest(`/wishlist/${productId}`, { method: "POST", token });
      setWished(data.items.some(p => p._id === productId));
    } catch (e) {
      setError(e.message || "Failed to update wishlist");
    }
  };

  const updateQty = (delta) => {
    const newQty = Math.max(1, Math.min(qty + delta, product?.countInStock || 1));
    setQty(newQty);
  };

  if (loading) {
    return <div style={{ padding: 24, textAlign: "center" }}>Loading product...</div>;
  }

  if (error || !product) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "crimson" }}>
        {error || "Product not found"}
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "start" }}>
        {/* Images Gallery */}
        <div>
          <div style={{
            width: "100%",
            height: 400,
            background: "#f5f5f5",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            color: "#999"
          }}>
            {product.images && product.images.length > 0
              ? product.images[0] // Simple first image
              : "No image available"
            }
          </div>
        </div>

        {/* Details */}
        <div>
          <h1 style={{ marginBottom: 8, color: "var(--text-h)" }}>{product.name}</h1>
          <div style={{ marginBottom: 12, fontSize: 18, fontFamily: "var(--mono)", color: "var(--text-h)" }}>
            ₹{product.price}
          </div>
          <div style={{ marginBottom: 16, color: "var(--text)" }}>{product.category}</div>
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ marginBottom: 8 }}>Description</h3>
            <p style={{ color: "var(--text)", lineHeight: 1.6 }}>
              {product.description || "No description available."}
            </p>
          </div>
          <div style={{ marginBottom: 24, fontSize: 14, color: "var(--text)" }}>
            Stock: {product.countInStock || 0}
          </div>

          {/* Quantity */}
          {product.countInStock > 0 && (
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", marginBottom: 8 }}>Quantity</label>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button onClick={() => updateQty(-1)} disabled={qty <= 1}>-</button>
                <span style={{ minWidth: 40, textAlign: "center", fontFamily: "var(--mono)" }}>{qty}</span>
                <button onClick={() => updateQty(1)} disabled={qty >= product.countInStock}>+</button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={addToCart}
              disabled={adding || product.countInStock === 0}
              style={{ flex: 1, padding: 12, fontWeight: 600 }}
            >
              {adding ? "Adding..." : "Add to Cart"}
            </button>
            <button
              onClick={toggleWishlist}
              style={{ padding: 12, fontWeight: 600 }}
            >
              {wished ? "Wishlisted ✓" : "Add to Wishlist"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

