import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { apiRequest } from "../services/apiClient";

export const Cart = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setError("");
        const data = await apiRequest(`/cart`, { token });
        setCartData(data);
      } catch (error) {
        setError(error.message || "Failed to load cart");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchCart();
    }
  }, [token]);

  const setQty = async (productId, qty) => {
    try {
      setError("");
      const data = await apiRequest(`/cart/items/${productId}`, {
        method: "PATCH",
        token,
        body: { qty },
      });
      setCartData(data);
    } catch (e) {
      setError(e.message || "Failed to update qty");
    }
  };

  const removeItem = async (productId) => {
    try {
      setError("");
      const data = await apiRequest(`/cart/items/${productId}`, { method: "DELETE", token });
      setCartData(data);
    } catch (e) {
      setError(e.message || "Failed to remove item");
    }
  };

  const clearCart = async () => {
    try {
      setError("");
      const data = await apiRequest(`/cart`, { method: "DELETE", token });
      setCartData(data);
    } catch (e) {
      setError(e.message || "Failed to clear cart");
    }
  };

  if (loading) return <div>Loading cart...</div>;

  const items = cartData?.items || [];
  const subtotal = cartData?.subtotal ?? 0;

  return (
    <div className="cart-container">
      <h2>Shopping Cart</h2>
      <p>User: {user?.name}</p>
      {error && <div style={{ color: "crimson", marginTop: 8 }}>{error}</div>}

      {items.length === 0 ? (
        <div style={{ marginTop: 16 }}>Your cart is empty.</div>
      ) : (
        <div style={{ marginTop: 16, textAlign: "left" }}>
          <div style={{ display: "grid", gap: 12 }}>
            {items.map((it) => (
              <div
                key={it.product._id}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: 14,
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                <div style={{ flex: "1 1 auto" }}>
                  <div style={{ fontWeight: 600, color: "var(--text-h)" }}>
                    {it.product.name}
                  </div>
                  <div style={{ marginTop: 6, fontFamily: "var(--mono)", color: "var(--text-h)" }}>
                    ₹{it.product.price} × {it.qty} = ₹{it.lineTotal}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button onClick={() => setQty(it.product._id, Math.max(1, it.qty - 1))}>
                    -
                  </button>
                  <span style={{ minWidth: 24, textAlign: "center" }}>{it.qty}</span>
                  <button onClick={() => setQty(it.product._id, it.qty + 1)}>+</button>
                  <button onClick={() => removeItem(it.product._id)}>Remove</button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between" }}>
            <div style={{ fontWeight: 600, color: "var(--text-h)" }}>Subtotal</div>
            <div style={{ fontFamily: "var(--mono)", color: "var(--text-h)" }}>₹{subtotal}</div>
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
            <button onClick={clearCart}>Clear cart</button>
            <button onClick={() => navigate("/checkout")}>Proceed to checkout</button>
          </div>
        </div>
      )}
    </div>
  );
};
