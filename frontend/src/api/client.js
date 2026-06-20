// Thin wrapper around fetch that targets the FastAPI backend.
// In dev, Vite proxies /api to the backend, so a relative base works everywhere.
const API_BASE = import.meta.env.VITE_API_URL || "";

let authToken = localStorage.getItem("token") || null;

export function setAuthToken(token) {
  authToken = token;
  if (token) localStorage.setItem("token", token);
  else localStorage.removeItem("token");
}

async function request(path, { method = "GET", body, form, auth = false } = {}) {
  const headers = {};
  let payload;

  if (form) {
    // OAuth2 password flow expects url-encoded form data.
    payload = new URLSearchParams(form).toString();
    headers["Content-Type"] = "application/x-www-form-urlencoded";
  } else if (body !== undefined) {
    payload = JSON.stringify(body);
    headers["Content-Type"] = "application/json";
  }

  if (auth && authToken) headers["Authorization"] = `Bearer ${authToken}`;

  const res = await fetch(`${API_BASE}/api${path}`, {
    method,
    headers,
    body: payload,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const detail = data?.detail;
    const message = Array.isArray(detail)
      ? detail.map((d) => d.msg).join(", ")
      : detail || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

export const api = {
  // Auth
  register: (body) => request("/auth/register", { method: "POST", body }),
  login: (email, password) =>
    request("/auth/login", { method: "POST", form: { username: email, password } }),
  me: () => request("/auth/me", { auth: true }),

  // Products
  listProducts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/products${qs ? `?${qs}` : ""}`);
  },
  getProduct: (slug) => request(`/products/${slug}`),
  categories: () => request("/products/categories"),
  createProduct: (body) => request("/products", { method: "POST", body, auth: true }),
  updateProduct: (id, body) =>
    request(`/products/${id}`, { method: "PUT", body, auth: true }),
  deleteProduct: (id) =>
    request(`/products/${id}`, { method: "DELETE", auth: true }),

  // Orders
  createOrder: (body) => request("/orders", { method: "POST", body, auth: true }),
  myOrders: () => request("/orders", { auth: true }),
  allOrders: () => request("/orders/all", { auth: true }),

  // Articles
  listArticles: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/articles${qs ? `?${qs}` : ""}`);
  },
  getArticle: (slug) => request(`/articles/${slug}`),
  createArticle: (body) => request("/articles", { method: "POST", body, auth: true }),
};
