import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client.js";
import { useCart } from "../context/CartContext.jsx";
import { formatPrice } from "../utils/format.js";

export default function ProductDetail() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setProduct(null);
    setError("");
    api
      .getProduct(slug)
      .then(setProduct)
      .catch(() => setError("Sorry, we couldn't find that product."));
  }, [slug]);

  if (error)
    return (
      <div className="container section">
        <p className="muted">{error}</p>
        <Link to="/shop" className="link-arrow">← Back to the shop</Link>
      </div>
    );

  if (!product) return <div className="container section">Loading…</div>;

  const soldOut = product.stock <= 0;

  function handleAdd() {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="container section">
      <Link to="/shop" className="link-arrow back">← Back to shop</Link>
      <div className="product-detail">
        <div className="product-detail__image">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} />
          ) : (
            <div className="product-card__placeholder big">🍯</div>
          )}
        </div>
        <div className="product-detail__info">
          <span className="product-card__category">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="price price--lg">{formatPrice(product.price)}</p>
          {product.weight_grams > 0 && (
            <p className="muted">Net weight: {product.weight_grams} g</p>
          )}
          <p className="product-detail__desc">{product.description}</p>

          <p className={`stock ${soldOut ? "stock--out" : ""}`}>
            {soldOut
              ? "Currently sold out"
              : product.stock <= 5
              ? `Only ${product.stock} left in stock`
              : "In stock"}
          </p>

          {!soldOut && (
            <div className="product-detail__buy">
              <div className="qty">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                  −
                </button>
                <span>{quantity}</span>
                <button
                  onClick={() =>
                    setQuantity((q) => Math.min(product.stock, q + 1))
                  }
                >
                  +
                </button>
              </div>
              <button className="btn btn--lg" onClick={handleAdd}>
                {added ? "✓ Added!" : "Add to cart"}
              </button>
            </div>
          )}
          <Link to="/cart" className="link-arrow">Go to cart →</Link>
        </div>
      </div>
    </div>
  );
}
