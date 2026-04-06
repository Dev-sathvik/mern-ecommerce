import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export const Cart = () => {
  const { user, token } = useAuth();
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setCartData(data);
      } catch (error) {
        console.error("Error fetching cart:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchCart();
    }
  }, [token]);

  if (loading) return <div>Loading cart...</div>;

  return (
    <div className="cart-container">
      <h2>Shopping Cart</h2>
      <p>User: {user?.name}</p>
      {cartData && <pre>{JSON.stringify(cartData, null, 2)}</pre>}
    </div>
  );
};
