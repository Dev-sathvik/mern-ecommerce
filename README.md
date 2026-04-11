# MERN E-Commerce

A **MERN (MongoDB, Express, React, Node.js)** e-commerce app with a React + Vite frontend (`client/`) and an Express + Mongoose backend (`server/`).

**Included today**

- User registration and login with **JWT** (passwords hashed with bcrypt)
- **Product catalog**: list, search, category filter, pagination, sorting (`newest`, `price_asc`, `price_desc`)
- **Cart** persisted on the user document (add, update quantity, remove, clear)
- **Wishlist** (toggle per product)
- **Checkout** with shipping address and **cash on delivery (COD)** orders; order history and details

There is **no admin UI or product seed script** in this repo—you add `Product` documents in MongoDB yourself (for example with [MongoDB Compass](https://www.mongodb.com/products/compass) or a one-off script) so the storefront has items to show.

---

## Project structure

```text
mern-ecommerce/
├── client/                 # React (Vite) SPA
│   └── src/
│       ├── components/     # e.g. ProtectedRoute
│       ├── context/        # AuthContext (token + user)
│       ├── pages/          # Home, Login, Register, Cart, Wishlist, Checkout, Orders, Profile
│       └── services/       # apiClient, authService
└── server/
    ├── middleware/         # JWT authMiddleware
    ├── models/             # User, Product, Order
    ├── routes/             # auth, products, cart, wishlist, orders
    └── server.js
```

---

## Prerequisites

- **Node.js** (v18+ recommended)
- **npm**
- **MongoDB** (local or [Atlas](https://www.mongodb.com/cloud/atlas)) and a connection string

---

## Environment variables

### Backend (`server/.env`)

Copy from `server/.env.example`:

```bash
MONGO_URI=mongodb://127.0.0.1:27017/mern-ecommerce
JWT_SECRET=use_a_long_random_string_in_production
```

`JWT_SECRET` is required for signing and verifying tokens.

### Frontend (`client/.env` — optional)

The client calls the API under `/api` by default. Override the full API base if needed:

```bash
VITE_API_BASE_URL=http://localhost:5000/api
```

If unset, the app uses `http://localhost:5000/api` (see `client/src/services/apiClient.js`).

---

## Installation

```bash
cd server && npm install
cd ../client && npm install
```

---

## Running the app

Use two terminals.

**Backend** (port **5000**):

```bash
cd server
npm run server
```

- `npm run server` — nodemon (reload on changes)
- `npm start` — plain `node server.js`

**Frontend** (Vite default, usually **5173**):

```bash
cd client
npm run dev
```

Open the URL Vite prints (e.g. `http://localhost:5173`). Register a user, add products to MongoDB, then browse the catalog, cart, wishlist, and checkout.

---

## Scripts

| Location   | Command           | Description              |
| ---------- | ----------------- | ------------------------ |
| `server/`  | `npm run server`  | API with nodemon         |
| `server/`  | `npm start`       | API with Node            |
| `client/`  | `npm run dev`     | Vite dev server          |
| `client/`  | `npm run build`   | Production build         |
| `client/`  | `npm run preview` | Preview production build |
| `client/`  | `npm run lint`    | ESLint                   |

---

## API overview

Base URL: `http://localhost:5000`

- **`GET /`** — Health: `{ ok, service }`
- **`GET /api/profile`** — Protected; returns a minimal profile payload (example route using `authMiddleware`)

### Auth (`/api/auth`)

| Method | Path              | Auth   | Description        |
| ------ | ----------------- | ------ | ------------------ |
| POST   | `/api/auth/register` | Public | `{ name, email, password }` → `{ token, user }` |
| POST   | `/api/auth/login`      | Public | `{ email, password }` → `{ token, user }`       |
| GET    | `/api/auth/me`         | Bearer | Current user document                           |

### Products (public)

| Method | Path                    | Description |
| ------ | ----------------------- | ----------- |
| GET    | `/api/products`         | Query: `q`, `category`, `sort` (`newest` \| `price_asc` \| `price_desc`), `page`, `limit` → `{ items, page, limit, total, totalPages }` |
| GET    | `/api/products/:id`     | Single product |
| GET    | `/api/categories`       | Distinct categories from products |

### Cart (Bearer token)

| Method | Path                          | Description |
| ------ | ----------------------------- | ----------- |
| GET    | `/api/cart`                   | Populated cart + `subtotal` |
| POST   | `/api/cart/items`             | Body: `{ productId, qty? }` |
| PATCH  | `/api/cart/items/:productId`  | Body: `{ qty }` |
| DELETE | `/api/cart/items/:productId`  | Remove line |
| DELETE | `/api/cart`                   | Clear cart |

### Wishlist (Bearer token)

| Method | Path                       | Description |
| ------ | -------------------------- | ----------- |
| GET    | `/api/wishlist`            | List wishlist products |
| POST   | `/api/wishlist/:productId` | Toggle product on wishlist |

### Orders (Bearer token)

| Method | Path              | Description |
| ------ | ----------------- | ----------- |
| POST   | `/api/orders`     | Create COD order from cart; body: `shippingAddress` (`fullName`, `phone`, `addressLine1`, `city`, `state`, `postalCode`). Clears cart on success. |
| GET    | `/api/orders`     | Current user’s orders |
| GET    | `/api/orders/:id` | Order detail (only if owned by user) |

**Authorization header:** `Authorization: Bearer <token>`

---

## Frontend routes

| Path          | Notes                              |
| ------------- | ---------------------------------- |
| `/`           | Home: catalog, search, categories, add to cart / wishlist |
| `/login`      | Login                              |
| `/register`   | Register                           |
| `/cart`       | Protected                          |
| `/wishlist`   | Protected                          |
| `/checkout`   | Protected                          |
| `/orders`     | Protected                          |
| `/profile`    | Protected                          |

---

## Data models (summary)

- **User** — `name`, `email`, `password` (hashed), `cartItems[]`, `wishlist[]`
- **Product** — `name`, `description`, `price`, `images[]`, `category`, `countInStock`
- **Order** — `user`, `items[]` (snapshot name/price/qty), `subtotal`, `shippingAddress`, `paymentMethod` (default `COD`), `status` (`placed` \| `confirmed` \| `shipped` \| `delivered` \| `cancelled`)

---

## Tech stack

- **Frontend:** React 19, Vite 8, React Router 7, `fetch`-based API client
- **Backend:** Node.js (ES modules), Express 5, Mongoose 9, JWT, bcryptjs, cors, dotenv
- **Database:** MongoDB

---

## Verify it works

1. Set `server/.env` with a valid `MONGO_URI` and `JWT_SECRET`.
2. Insert at least one **Product** document matching the schema above.
3. Start `server` and `client` as above.
4. Open the app, register, log in, add items to cart, place an order on `/checkout`, and confirm it under `/orders`.

For more detail on the authentication flow, see `AUTHENTICATION_GUIDE.md` in the repo root.
