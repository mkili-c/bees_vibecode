import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { formatPrice } from "../utils/format.js";

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const soldOut = product.stock <= 0;

  return (
    <div className="card product-card">
      <Link to={`/shop/${product.slug}`} className="product-card__image">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} loading="lazy" />
        ) : (
          <div className="product-card__placeholder">🍯</div>
        )}
        {soldOut && <span className="product-card__soldout">Sold out</span>}
      </Link>
      <div className="product-card__body">
        <span className="product-card__category">{product.category}</span>
        <h3>
          <Link to={`/shop/${product.slug}`}>{product.name}</Link>
        </h3>
        <p className="product-card__desc">{product.short_description}</p>
        <div className="product-card__footer">
          <span className="price">{formatPrice(product.price)}</span>
          <button
            className="btn btn--sm"
            disabled={soldOut}
            onClick={() => addItem(product, 1)}
          >
            {soldOut ? "Sold out" : "Add to cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
