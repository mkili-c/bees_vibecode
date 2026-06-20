import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { formatPrice } from "../utils/format.js";

export default function Cart() {
  const { items, setQuantity, removeItem, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="container section center">
        <div className="empty">
          <div className="empty__icon">🛒</div>
          <h1>Your cart is empty</h1>
          <p className="muted">Time to fill it with something sweet.</p>
          <Link to="/shop" className="btn btn--lg">Browse the shop</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container section">
      <h1>Your Cart</h1>
      <div className="cart">
        <div className="cart__items">
          {items.map((item) => (
            <div key={item.id} className="cart-row">
              <Link to={`/shop/${item.slug}`} className="cart-row__img">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} />
                ) : (
                  <span>🍯</span>
                )}
              </Link>
              <div className="cart-row__info">
                <Link to={`/shop/${item.slug}`}>
                  <h3>{item.name}</h3>
                </Link>
                <span className="muted">{formatPrice(item.price)} each</span>
              </div>
              <div className="qty">
                <button
                  onClick={() => setQuantity(item.id, item.quantity - 1)}
                >
                  −
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => setQuantity(item.id, item.quantity + 1)}
                >
                  +
                </button>
              </div>
              <div className="cart-row__total">
                {formatPrice(item.price * item.quantity)}
              </div>
              <button
                className="cart-row__remove"
                aria-label="Remove"
                onClick={() => removeItem(item.id)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <aside className="cart__summary card">
          <h3>Order summary</h3>
          <div className="cart__line">
            <span>Subtotal</span>
            <span>{formatPrice(total)}</span>
          </div>
          <div className="cart__line muted">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>
          <div className="cart__line cart__line--total">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
          <Link to="/checkout" className="btn btn--lg btn--block">
            Proceed to checkout
          </Link>
          <Link to="/shop" className="link-arrow center-link">
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
