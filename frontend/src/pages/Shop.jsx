import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import ProductCard from "../components/ProductCard.jsx";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCat, setActiveCat] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.categories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (activeCat) params.category = activeCat;
    if (search.trim()) params.search = search.trim();
    api
      .listProducts(params)
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [activeCat, search]);

  return (
    <div className="container section">
      <div className="page-head">
        <h1>The Honey Shop</h1>
        <p>Raw honey and hive products, harvested gently from our own bees.</p>
      </div>

      <div className="shop-toolbar">
        <div className="chips">
          <button
            className={`chip ${activeCat === "" ? "is-active" : ""}`}
            onClick={() => setActiveCat("")}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              className={`chip ${activeCat === c ? "is-active" : ""}`}
              onClick={() => setActiveCat(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <input
          className="input"
          type="search"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="muted">Loading products…</p>
      ) : products.length === 0 ? (
        <p className="muted">No products found. Try a different search.</p>
      ) : (
        <div className="grid grid--3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
