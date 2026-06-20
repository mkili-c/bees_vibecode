import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { formatPrice, formatDate } from "../utils/format.js";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .myOrders()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container section">Loading your orders…</div>;

  if (orders.length === 0) {
    return (
      <div className="container section center">
        <div className="empty">
          <div className="empty__icon">📦</div>
          <h1>No orders yet</h1>
          <p className="muted">When you place an order, it'll show up here.</p>
          <Link to="/shop" className="btn btn--lg">Start shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container section">
      <h1>My Orders</h1>
      <div className="orders">
        {orders.map((order) => (
          <div key={order.id} className="card order">
            <div className="order__head">
              <div>
                <strong>Order #{order.id}</strong>
                <span className="muted"> · {formatDate(order.created_at)}</span>
              </div>
              <span className={`status status--${order.status}`}>
                {order.status}
              </span>
            </div>
            <ul className="order__items">
              {order.items.map((item) => (
                <li key={item.id}>
                  <span>
                    {item.product?.name || "Product"} × {item.quantity}
                  </span>
                  <span>{formatPrice(item.unit_price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="order__foot">
              <span className="muted">Ship to: {order.shipping_name}</span>
              <strong>Total: {formatPrice(order.total)}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
