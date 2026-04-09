import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../services/apiClient";

export const Orders = () => {
  const { user, token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setError("");
        const data = await apiRequest(`/orders`, { token });
        setItems(data.items || []);
      } catch (error) {
        setError(error.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchOrders();
    }
  }, [token]);

  if (loading) return <div>Loading orders...</div>;

  return (
    <div className="orders-container">
      <h2>Your Orders</h2>
      <p>User: {user?.name}</p>
      {error && <div style={{ color: "crimson", marginTop: 8 }}>{error}</div>}

      {items.length === 0 ? (
        <div style={{ marginTop: 12 }}>No orders yet.</div>
      ) : (
        <div style={{ marginTop: 12, textAlign: "left", display: "grid", gap: 12 }}>
          {items.map((o) => (
            <div
              key={o._id}
              style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 14 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div style={{ fontWeight: 600, color: "var(--text-h)" }}>Order #{o._id}</div>
                <div style={{ color: "var(--text)" }}>{o.status}</div>
              </div>
              <div style={{ marginTop: 8, fontFamily: "var(--mono)", color: "var(--text-h)" }}>
                Subtotal: ₹{o.subtotal}
              </div>
              <div style={{ marginTop: 10, color: "var(--text)" }}>
                Items: {(o.items || []).length}
              </div>
              <div style={{ marginTop: 10, fontSize: 14, color: "var(--text)" }}>
                Placed: {o.createdAt ? new Date(o.createdAt).toLocaleString() : "-"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
