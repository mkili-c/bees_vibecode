# 🐝 The Golden Hive

A full-stack beekeeping website with two purposes:

1. **A honey shop** — browse products, add to cart, and place orders.
2. **A bee-knowledge platform** — publish and read articles about bees and beekeeping.

Built with **FastAPI** (Python) on the backend and **React + Vite** on the frontend.

---

## Features

**Shop**
- Product catalogue with categories, search, and detail pages
- Persistent shopping cart (stored in the browser)
- Checkout that creates real orders, validates stock, and decrements inventory
- Per-user order history

**Content platform**
- Article list with search and tags
- Rich article pages (lightweight Markdown rendering)

**Accounts & admin**
- Register / log in with JWT authentication
- Admin dashboard to create products, publish articles, and view all orders with revenue
- Role-based access control (admin vs. customer)

**API**
- Auto-generated OpenAPI docs at `http://localhost:8000/docs`

---

## Project structure

```
bees_vibecode/
├── backend/                  FastAPI application
│   ├── app/
│   │   ├── main.py           App entry, CORS, routers, startup seeding
│   │   ├── config.py         Settings (env-overridable)
│   │   ├── database.py       SQLAlchemy engine & session
│   │   ├── models.py         User, Product, Order, OrderItem, Article
│   │   ├── schemas.py        Pydantic request/response models
│   │   ├── security.py       Password hashing (bcrypt) & JWT
│   │   ├── deps.py           Auth dependencies (current user / admin)
│   │   ├── seed.py           Seed data (admin, honey, articles)
│   │   └── routers/          auth, products, orders, articles
│   ├── requirements.txt
│   └── venv/                 Python virtual environment (git-ignored)
└── frontend/                 React + Vite single-page app
    ├── src/
    │   ├── api/client.js      Typed fetch wrapper for the API
    │   ├── context/          Auth & Cart React context
    │   ├── components/       Navbar, Footer, cards, Markdown, …
    │   ├── pages/            Home, Shop, Product, Cart, Checkout, …
    │   └── index.css         Honey-themed styling
    └── package.json
```

---

## Getting started

You'll run two processes: the API (port **8000**) and the web app (port **5173**).
The Vite dev server proxies `/api` to the backend, so there are no CORS issues in
development.

### 1. Backend (FastAPI)

```bash
cd backend

# Create the virtual environment (first time only)
python3 -m venv venv

# Activate it
source venv/bin/activate            # macOS/Linux
# venv\Scripts\activate             # Windows

# Install dependencies
pip install -r requirements.txt

# Run the API (tables are created and seed data inserted automatically)
uvicorn app.main:app --reload --port 8000
```

The API is now at `http://localhost:8000` and interactive docs at
`http://localhost:8000/docs`.

### 2. Frontend (React)

In a second terminal:

```bash
cd frontend
npm install        # first time only
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Demo accounts

On first run the database is seeded automatically.

| Role     | Email                     | Password       |
|----------|---------------------------|----------------|
| Admin    | `admin@goldenhive.com`    | `beekeeper123` |

Log in as the admin to access the **Admin** dashboard (add products, publish
articles, view all orders). Register a new account to shop as a customer.

---

## Configuration

Backend settings can be overridden with environment variables or a `backend/.env`
file (see `backend/.env.example`):

| Variable          | Default                          | Purpose                              |
|-------------------|----------------------------------|--------------------------------------|
| `DATABASE_URL`    | `sqlite:///./beekeeping.db`      | Database connection (SQLite default) |
| `SECRET_KEY`      | (dev placeholder)                | JWT signing key — **change in prod** |
| `CORS_ORIGINS`    | `http://localhost:5173,…`        | Allowed frontend origins             |

The frontend can target a different API by setting `VITE_API_URL` in
`frontend/.env` (defaults to the dev proxy).

---

## Tech notes

- **Database:** SQLite by default (zero-config). Point `DATABASE_URL` at
  PostgreSQL for production — no code changes needed thanks to SQLAlchemy.
- **Auth:** JWT bearer tokens; passwords hashed with bcrypt.
- **Seeding** runs on startup and is idempotent (it won't create duplicates).

## Production build

```bash
cd frontend && npm run build      # outputs static files to frontend/dist
```

Serve `frontend/dist` from any static host and run the FastAPI app behind a
production server (e.g. `uvicorn`/`gunicorn`), with `CORS_ORIGINS` set to your
deployed frontend URL.
