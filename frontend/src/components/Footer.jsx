import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div>
          <div className="brand brand--footer">
            <span aria-hidden>🐝</span> The Golden Hive
          </div>
          <p className="footer__tag">
            Raw honey & hive products from our family apiary, plus everything you
            ever wanted to know about bees.
          </p>
        </div>
        <div className="footer__col">
          <h4>Shop</h4>
          <Link to="/shop">All products</Link>
          <Link to="/cart">Your cart</Link>
          <Link to="/orders">Your orders</Link>
        </div>
        <div className="footer__col">
          <h4>Learn</h4>
          <Link to="/learn">Bee articles</Link>
          <Link to="/about">Our story</Link>
        </div>
      </div>
      <div className="footer__bar">
        © {new Date().getFullYear()} The Golden Hive · Made with care for the bees.
      </div>
    </footer>
  );
}
