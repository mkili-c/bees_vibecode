import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api/client.js";
import { formatPrice } from "../utils/format.js";

export default function Checkout() {
  const { items, total, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.full_name || "");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [placed, setPlaced] = useState(null);

  if (placed) {
    return (
      <div className="container section center">
        <div className="empty">
          <div className="empty__icon">✅</div>
          <h1>Thank you, {name.split(" ")[0]}!</h1>
          <p className="muted">
            Order #{placed.id} is confirmed — total {formatPrice(placed.total)}.
            We'll pack it with care and ship within two working days.
          </p>
          <button className="btn btn--lg" onClick={() => navigate("/orders")}>
            View my orders
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container section center">
        <p className="muted">Your cart is empty.</p>
        <button className="btn" onClick={() => navigate("/shop")}>
          Go to the shop
        </button>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const order = await api.createOrder({
        items: items.map((i) => ({ product_id: i.id, quantity: i.quantity })),
        shipping_name: name,
        shipping_address: address,
      });
      clear();
      setPlaced(order);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container section">
      <h1>Checkout</h1>
      <div className="checkout">
        <form className="checkout__form card" onSubmit={handleSubmit}>
          <h3>Shipping details</h3>
          <label>
            Full name
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label>
            Shipping address
            <textarea
              className="input"
              rows={4}
              placeholder="Street, city, postcode, country"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="btn btn--lg btn--block" disabled={submitting}>
            {submitting ? "Placing order…" : `Place order · ${formatPrice(total)}`}
          </button>
          <p className="muted small">
            This is a demo checkout — no real payment is taken.
          </p>
        </form>

        <aside className="checkout__summary card">
          <h3>Your order</h3>
          {items.map((i) => (
            <div key={i.id} className="cart__line">
              <span>
                {i.name} × {i.quantity}
              </span>
              <span>{formatPrice(i.price * i.quantity)}</span>
            </div>
          ))}
          <div className="cart__line cart__line--total">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
