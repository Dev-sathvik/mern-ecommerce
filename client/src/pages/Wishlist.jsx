import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../services/apiClient";

export function Wishlist() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setError("");
      setLoading(true);
      const data = await apiRequest(`/wishlist`, { token });
      setItems(data.items || []);
    } catch (e) {
      setError(e.message || "Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const toggle = async (productId) => {
    try {
      setError("");
      const data = await apiRequest(`/wishlist/${productId}`, { method: "POST", token });
      setItems(data.items || []);
    } catch (e) {
      setError(e.message || "Failed to update wishlist");
    }
  };

  if (loading) return <div>Loading wishlist...</div>;

  return (
    <div style={{ padding: 24, textAlign: "left" }}>
      <h2>Wishlist</h2>
      {error && <div style={{ color: "crimson", marginTop: 8 }}>{error}</div>}

      {items.length === 0 ? (
        <div style={{ marginTop: 12 }}>No wishlisted products yet.</div>
      ) : (
        <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
          {items.map((p) => (
            <div
              key={p._id}
              style={{
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: 14,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: "var(--text-h)" }}>{p.name}</div>
                <div style={{ marginTop: 6, color: "var(--text)" }}>{p.category}</div>
                <div style={{ marginTop: 8, fontFamily: "var(--mono)", color: "var(--text-h)" }}>
                  ₹{p.price}
                </div>
              </div>
              <button onClick={() => toggle(p._id)}>Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

