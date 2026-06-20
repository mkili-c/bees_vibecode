import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    logout();
    setOpen(false);
    navigate("/");
  }

  const close = () => setOpen(false);

  return (
    <header className="navbar">
      <div className="navbar__inner container">
        <Link to="/" className="brand" onClick={close}>
          <span className="brand__mark" aria-hidden>🐝</span>
          <span className="brand__name">The Golden Hive</span>
        </Link>

        <button
          className="navbar__toggle"
          aria-label="Toggle menu"
          onClick={() => setOpen((o) => !o)}
        >
          ☰
        </button>

        <nav className={`navbar__links ${open ? "is-open" : ""}`}>
          <NavLink to="/shop" onClick={close}>Shop</NavLink>
          <NavLink to="/learn" onClick={close}>Learn</NavLink>
          <NavLink to="/about" onClick={close}>About</NavLink>
          {user && <NavLink to="/orders" onClick={close}>My Orders</NavLink>}
          {isAdmin && <NavLink to="/admin" onClick={close}>Admin</NavLink>}

          <NavLink to="/cart" className="navbar__cart" onClick={close}>
            🛒 Cart{count > 0 && <span className="badge">{count}</span>}
          </NavLink>

          {user ? (
            <div className="navbar__user">
              <span className="navbar__hello">Hi, {user.full_name.split(" ")[0]}</span>
              <button className="btn btn--ghost btn--sm" onClick={handleLogout}>
                Log out
              </button>
            </div>
          ) : (
            <NavLink to="/login" className="btn btn--sm" onClick={close}>
              Log in
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
