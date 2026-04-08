import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export const Orders = () => {
  const { user, token } = useAuth();
  const [ordersData, setOrdersData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setOrdersData(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
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
      {ordersData && <pre>{JSON.stringify(ordersData, null, 2)}</pre>}
    </div>
  );
};
