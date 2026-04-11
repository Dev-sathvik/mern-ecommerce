import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../services/apiClient";
import { useAuth } from "../context/useAuth";

const FALLBACK_IMAGE =
  "https://via.placeholder.com/700x520?text=Product+Image";

function normalizeMessage(error, fallback) {
  return error?.message || fallback;
}

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [wishIds, setWishIds] = useState(() => new Set());
  const [related, setRelated] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const imageList = useMemo(() => {
    if (!product?.images?.length) return [FALLBACK_IMAGE];
    return product.images;
  }, [product]);

  useEffect(() => {
    let cancelled = false;
    async function loadProduct() {
      setLoading(true);
      setError("");
      setNotFound(false);
      try {
        const data = await apiRequest(`/products/${id}`);
        if (!cancelled) {
          setProduct(data.product || null);
          setQuantity(1);
          setActiveImage(0);
        }
      } catch (e) {
        if (!cancelled) {
          const msg = normalizeMessage(e, "Unable to load product");
          setError(msg);
          if (
            msg.toLowerCase().includes("not found") ||
            msg.toLowerCase().includes("invalid product id")
          ) {
            setNotFound(true);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadProduct();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!product?._id) return;
    const key = "recentlyViewedProducts";
    const next = [product._id];
    try {
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      if (Array.isArray(existing)) {
        next.push(...existing.filter((productId) => productId !== product._id));
      }
      localStorage.setItem(key, JSON.stringify(next.slice(0, 8)));
    } catch {
      // Ignore local storage failures.
    }
  }, [product]);

  useEffect(() => {
    let cancelled = false;
    async function loadWishlist() {
      if (!token) {
        setWishIds(new Set());
        return;
      }
      try {
        const data = await apiRequest("/wishlist", { token });
        if (!cancelled) {
          setWishIds(new Set((data.items || []).map((p) => p._id)));
        }
      } catch {
        // Ignore wishlist load errors.
      }
    }
    loadWishlist();
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    let cancelled = false;
    async function loadRelatedProducts() {
      if (!product?.category) {
        setRelated([]);
        return;
      }
      try {
        setRelatedLoading(true);
        const data = await apiRequest(
          `/products?category=${encodeURIComponent(product.category)}&limit=6&sort=newest`
        );
        if (!cancelled) {
          const items = (data.items || []).filter((item) => item._id !== product._id).slice(0, 4);
          setRelated(items);
        }
      } catch {
        if (!cancelled) setRelated([]);
      } finally {
        if (!cancelled) setRelatedLoading(false);
      }
    }
    loadRelatedProducts();
    return () => {
      cancelled = true;
    };
  }, [product?._id, product?.category]);

  const wished = product?._id ? wishIds.has(product._id) : false;
  const maxQty = Math.max(1, Number(product?.countInStock ?? 0));
  const isOutOfStock = Number(product?.countInStock ?? 0) <= 0;

  const changeQty = (delta) => {
    setQuantity((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > maxQty) return maxQty;
      return next;
    });
  };

  const handleQtyInput = (event) => {
    const raw = Number.parseInt(event.target.value, 10);
    if (!Number.isFinite(raw) || Number.isNaN(raw)) {
      setQuantity(1);
      return;
    }
    if (raw < 1) {
      setQuantity(1);
      return;
    }
    if (raw > maxQty) {
      setQuantity(maxQty);
      return;
    }
    setQuantity(raw);
  };

  const addToCart = async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (!product?._id || isOutOfStock) return;
    try {
      setAdding(true);
      setError("");
      await apiRequest("/cart/items", {
        method: "POST",
        token,
        body: { productId: product._id, qty: quantity },
      });
      navigate("/cart");
    } catch (e) {
      setError(normalizeMessage(e, "Failed to add to cart"));
    } finally {
      setAdding(false);
    }
  };

  const toggleWishlist = async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (!product?._id) return;
    try {
      const data = await apiRequest(`/wishlist/${product._id}`, { method: "POST", token });
      setWishIds(new Set((data.items || []).map((item) => item._id)));
    } catch (e) {
      setError(normalizeMessage(e, "Failed to update wishlist"));
    }
  };

  const recentlyViewedIds = useMemo(() => {
    if (!product?._id) return [];
    try {
      const ids = JSON.parse(localStorage.getItem("recentlyViewedProducts") || "[]");
      if (!Array.isArray(ids)) return [];
      return ids.filter((itemId) => itemId !== product._id).slice(0, 6);
    } catch {
      return [];
    }
  }, [product?._id]);

  if (loading) {
    return <div style={{ padding: 24 }}>Loading product details...</div>;
  }

  if (notFound) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Product not found</h2>
        <p>The requested product does not exist or the id is invalid.</p>
        <button onClick={() => navigate("/")}>Back to catalog</button>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ color: "crimson", marginBottom: 12 }}>{error}</div>
        <button onClick={() => navigate(0)}>Retry</button>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ padding: 24 }}>
        <div>Product data is unavailable.</div>
        <button style={{ marginTop: 12 }} onClick={() => navigate("/")}>
          Back to catalog
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <Link to="/">Back to products</Link>
      </div>

      {error ? <div style={{ color: "crimson", marginBottom: 10 }}>{error}</div> : null}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
          alignItems: "start",
        }}
      >
        <div>
          <img
            src={imageList[activeImage]}
            alt={product.name}
            style={{ width: "100%", borderRadius: 12, border: "1px solid var(--border)" }}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            {imageList.map((image, idx) => (
              <button
                key={`${image}-${idx}`}
                onClick={() => setActiveImage(idx)}
                style={{
                  border: idx === activeImage ? "2px solid #646cff" : "1px solid var(--border)",
                  borderRadius: 8,
                  padding: 2,
                  background: "transparent",
                }}
              >
                <img
                  src={image}
                  alt={`${product.name} ${idx + 1}`}
                  style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 6 }}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <h1 style={{ marginTop: 0 }}>{product.name}</h1>
          <div style={{ fontSize: 20, fontFamily: "var(--mono)", marginBottom: 10 }}>
            ₹{product.price}
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>Category:</strong> {product.category || "General"}
          </div>
          <div style={{ marginBottom: 16 }}>
            <strong>Stock:</strong>{" "}
            {isOutOfStock ? (
              <span style={{ color: "crimson" }}>Out of stock</span>
            ) : (
              `${product.countInStock} available`
            )}
          </div>
          <p style={{ lineHeight: 1.5 }}>{product.description || "No description available."}</p>

          <div style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={() => changeQty(-1)} disabled={quantity <= 1 || isOutOfStock}>
              -
            </button>
            <input
              value={quantity}
              type="number"
              min={1}
              max={maxQty}
              onChange={handleQtyInput}
              disabled={isOutOfStock}
              style={{ width: 80, textAlign: "center", padding: 8 }}
            />
            <button onClick={() => changeQty(1)} disabled={quantity >= maxQty || isOutOfStock}>
              +
            </button>
          </div>

          <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={addToCart} disabled={adding || isOutOfStock}>
              {adding ? "Adding..." : "Add to cart"}
            </button>
            <button onClick={toggleWishlist}>{wished ? "Wishlisted" : "Add to wishlist"}</button>
          </div>
        </div>
      </div>

      <section style={{ marginTop: 28 }}>
        <h3>Related products</h3>
        {relatedLoading ? (
          <div>Loading related products...</div>
        ) : related.length === 0 ? (
          <div>No related products found.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
            {related.map((item) => (
              <Link
                key={item._id}
                to={`/products/${item._id}`}
                style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 10 }}
              >
                <div style={{ fontWeight: 600 }}>{item.name}</div>
                <div style={{ marginTop: 4 }}>₹{item.price}</div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {recentlyViewedIds.length > 0 ? (
        <section style={{ marginTop: 28 }}>
          <h3>Recently viewed</h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {recentlyViewedIds.map((productId) => (
              <Link key={productId} to={`/products/${productId}`}>
                {productId.slice(-6)}
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
