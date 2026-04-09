import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../services/apiClient";

export function Checkout() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const placeOrder = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);

      await apiRequest(`/orders`, {
        method: "POST",
        token,
        body: { shippingAddress: { fullName, phone, addressLine1, city, state, postalCode } },
      });

      navigate("/orders");
    } catch (e2) {
      setError(e2.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, textAlign: "left" }}>
      <h2>Checkout (COD)</h2>
      {error && <div style={{ color: "crimson", marginTop: 8 }}>{error}</div>}

      <form onSubmit={placeOrder} style={{ marginTop: 12, display: "grid", gap: 10, maxWidth: 520 }}>
        <div>
          <label htmlFor="fullName">Full name</label>
          <input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--border)" }}
          />
        </div>
        <div>
          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--border)" }}
          />
        </div>
        <div>
          <label htmlFor="addressLine1">Address</label>
          <input
            id="addressLine1"
            value={addressLine1}
            onChange={(e) => setAddressLine1(e.target.value)}
            required
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--border)" }}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label htmlFor="city">City</label>
            <input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 8,
                border: "1px solid var(--border)",
              }}
            />
          </div>
          <div>
            <label htmlFor="state">State</label>
            <input
              id="state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 8,
                border: "1px solid var(--border)",
              }}
            />
          </div>
        </div>
        <div>
          <label htmlFor="postalCode">Postal code</label>
          <input
            id="postalCode"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            required
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--border)" }}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Placing..." : "Place order"}
        </button>
      </form>
    </div>
  );
}

