# MERN E-Commerce

A starter **MERN (MongoDB, Express, React, Node.js)** e-commerce application with:

- A React + Vite frontend (`client/`)
- An Express + MongoDB backend (`server/`)

The backend currently exposes a sample products endpoint, and the frontend fetches data from it and logs it in the browser console.

---

## Project Structure

```text
mern-ecommerce/
├── client/   # React (Vite) frontend
└── server/   # Express + MongoDB backend
```

---

## Prerequisites

Before you begin, make sure you have:

- **Node.js** (v18+ recommended)
- **npm**
- **MongoDB connection string** (local MongoDB or MongoDB Atlas)

---

## Environment Variables

Create a `.env` file inside the `server/` folder:

```bash
# server/.env
MONGO_URI=your_mongodb_connection_string
```

> Example:
> `MONGO_URI=mongodb://127.0.0.1:27017/mern-ecommerce`

---

## Installation

Install dependencies for both server and client.

### 1) Install backend dependencies

```bash
cd server
npm install
```

### 2) Install frontend dependencies

```bash
cd ../client
npm install
```

---

## Running the Application

You need two terminals: one for backend and one for frontend.

### Terminal 1: Start backend

```bash
cd server
npm run server
```

- Backend runs on: `http://localhost:5000`
- Alternative command (without nodemon):

```bash
npm start
```

### Terminal 2: Start frontend

```bash
cd client
npm run dev
```

- Frontend runs on: `http://localhost:5173` (default Vite port)

---

## Available Scripts

### Backend (`server/`)

- `npm run server` — Start backend with nodemon
- `npm start` — Start backend with Node.js

### Frontend (`client/`)

- `npm run dev` — Start Vite dev server
- `npm run build` — Build production assets
- `npm run preview` — Preview production build locally
- `npm run lint` — Run ESLint

---

## API

### `GET /`

Returns a sample products array.

Example response:

```json
[
  {
    "name": "Phone",
    "price": 20000
  }
]
```

Base URL (backend): `http://localhost:5000`

---

## How to Verify Everything Works

1. Start backend (`npm run server`) in `server/`
2. Start frontend (`npm run dev`) in `client/`
3. Open frontend in browser
4. Open browser DevTools console
5. You should see the product data logged from the backend request

---

## Tech Stack

- **Frontend:** React, Vite, Axios, React Router
- **Backend:** Node.js, Express, Mongoose, dotenv, cors
- **Database:** MongoDB

---

## Current Status

This repository is a starter structure for an e-commerce app. Next steps typically include:

- Product models and CRUD APIs
- Authentication/authorization
- Cart and order management
- Payment integration
- Admin dashboard

