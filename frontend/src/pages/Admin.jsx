import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { formatPrice, formatDate } from "../utils/format.js";

const TABS = ["Products", "Articles", "Orders"];

export default function Admin() {
  const [tab, setTab] = useState("Products");
  return (
    <div className="container section">
      <div className="page-head">
        <h1>Admin Dashboard</h1>
        <p>Manage your shop's products, journal articles, and customer orders.</p>
      </div>
      <div className="chips">
        {TABS.map((t) => (
          <button
            key={t}
            className={`chip ${tab === t ? "is-active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="admin-panel">
        {tab === "Products" && <ProductsAdmin />}
        {tab === "Articles" && <ArticlesAdmin />}
        {tab === "Orders" && <OrdersAdmin />}
      </div>
    </div>
  );
}

function Feedback({ message }) {
  if (!message) return null;
  return <p className={`form-${message.type}`}>{message.text}</p>;
}

function ProductsAdmin() {
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState(null);
  const empty = {
    name: "",
    price: "",
    stock: "",
    weight_grams: "",
    category: "Honey",
    short_description: "",
    description: "",
    image_url: "",
  };
  const [form, setForm] = useState(empty);

  const load = () =>
    api
      .listProducts({ include_inactive: true })
      .then(setProducts)
      .catch(() => {});

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    try {
      await api.createProduct({
        ...form,
        price: parseFloat(form.price) || 0,
        stock: parseInt(form.stock) || 0,
        weight_grams: parseInt(form.weight_grams) || 0,
      });
      setForm(empty);
      setMessage({ type: "success", text: "Product created." });
      load();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this product?")) return;
    try {
      await api.deleteProduct(id);
      load();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="admin-grid">
      <form className="card admin-form" onSubmit={handleSubmit}>
        <h3>Add a product</h3>
        <label>Name<input className="input" value={form.name} onChange={set("name")} required /></label>
        <div className="admin-form__row">
          <label>Price (€)<input className="input" type="number" step="0.01" value={form.price} onChange={set("price")} required /></label>
          <label>Stock<input className="input" type="number" value={form.stock} onChange={set("stock")} required /></label>
        </div>
        <div className="admin-form__row">
          <label>Weight (g)<input className="input" type="number" value={form.weight_grams} onChange={set("weight_grams")} /></label>
          <label>Category<input className="input" value={form.category} onChange={set("category")} /></label>
        </div>
        <label>Short description<input className="input" value={form.short_description} onChange={set("short_description")} /></label>
        <label>Full description<textarea className="input" rows={3} value={form.description} onChange={set("description")} /></label>
        <label>Image URL<input className="input" value={form.image_url} onChange={set("image_url")} /></label>
        <Feedback message={message} />
        <button className="btn btn--block">Create product</button>
      </form>

      <div className="admin-list">
        <h3>Existing products ({products.length})</h3>
        {products.map((p) => (
          <div key={p.id} className="admin-row">
            <span>{p.name}</span>
            <span className="muted">{formatPrice(p.price)} · {p.stock} in stock</span>
            <button className="btn btn--ghost btn--sm" onClick={() => handleDelete(p.id)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ArticlesAdmin() {
  const [articles, setArticles] = useState([]);
  const [message, setMessage] = useState(null);
  const empty = { title: "", excerpt: "", tags: "", cover_image_url: "", body: "" };
  const [form, setForm] = useState(empty);

  const load = () =>
    api
      .listArticles({ include_unpublished: true })
      .then(setArticles)
      .catch(() => {});

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    try {
      await api.createArticle(form);
      setForm(empty);
      setMessage({ type: "success", text: "Article published." });
      load();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="admin-grid">
      <form className="card admin-form" onSubmit={handleSubmit}>
        <h3>Write an article</h3>
        <label>Title<input className="input" value={form.title} onChange={set("title")} required /></label>
        <label>Excerpt<input className="input" value={form.excerpt} onChange={set("excerpt")} /></label>
        <label>Tags (comma-separated)<input className="input" value={form.tags} onChange={set("tags")} /></label>
        <label>Cover image URL<input className="input" value={form.cover_image_url} onChange={set("cover_image_url")} /></label>
        <label>Body (Markdown: ## heading, - list, **bold**)
          <textarea className="input" rows={8} value={form.body} onChange={set("body")} required />
        </label>
        <Feedback message={message} />
        <button className="btn btn--block">Publish article</button>
      </form>

      <div className="admin-list">
        <h3>Published articles ({articles.length})</h3>
        {articles.map((a) => (
          <div key={a.id} className="admin-row">
            <span>{a.title}</span>
            <span className="muted">{formatDate(a.created_at)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrdersAdmin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .allOrders()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="muted">Loading orders…</p>;
  if (orders.length === 0) return <p className="muted">No orders yet.</p>;

  const revenue = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div>
      <p className="admin-stat">
        <strong>{orders.length}</strong> orders ·{" "}
        <strong>{formatPrice(revenue)}</strong> total revenue
      </p>
      <div className="orders">
        {orders.map((order) => (
          <div key={order.id} className="card order">
            <div className="order__head">
              <div>
                <strong>Order #{order.id}</strong>
                <span className="muted"> · {formatDate(order.created_at)}</span>
              </div>
              <span className={`status status--${order.status}`}>{order.status}</span>
            </div>
            <ul className="order__items">
              {order.items.map((item) => (
                <li key={item.id}>
                  <span>{item.product?.name || "Product"} × {item.quantity}</span>
                  <span>{formatPrice(item.unit_price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="order__foot">
              <span className="muted">{order.shipping_name} — {order.shipping_address}</span>
              <strong>{formatPrice(order.total)}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
