# Restaurant / foodislice

Full-stack demo for ordering food: React menu and checkout, Express API, and MongoDB for users, orders, feedback, and support messages.

## Stack

| Layer | Tech |
|--------|------|
| Frontend | React 19, Vite 8, TypeScript, Tailwind CSS 4, React Router |
| Backend | Express 5, TypeScript, Mongoose, JWT auth, bcrypt |
| Data | MongoDB (optional one-time seed from `server/data/db.json` if that file exists locally) |

## Prerequisites

- **Node.js** (LTS recommended)
- **MongoDB** reachable via a connection string (local or Atlas)

## Setup

From the repository root:

```bash
npm install
npm install --prefix server
```

Create **`server/.env`** (this path is loaded by the API). Minimum:

```env
JWT_SECRET=change-me-use-at-least-16-chars
MONGODB_URI=mongodb://127.0.0.1:27017/restaurant
```

Optional:

| Variable | Purpose |
|----------|---------|
| `PORT` | API port (default **4000**) |
| `CLIENT_ORIGIN` | Allowed browser origin for CORS (default `http://localhost:5173`) |
| `ORDER_STATUS_ADMIN_SECRET` | Enables `PATCH /api/orders/:id/status` using header `X-Restaurant-Admin-Secret`. If unset, that route returns **503**. |

Frontend (optional):

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | Base URL for the API (e.g. `https://api.example.com`). **Omit** in local dev so requests use `/api` and Vite’s proxy forwards to port 4000. |

## Scripts

Run from the **repo root**:

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server (usually [http://localhost:5173](http://localhost:5173)); `/api` is proxied to `http://localhost:4000` |
| `npm run dev:api` | API only (`tsx watch` in `server/`) |
| `npm run dev:full` | Frontend + API together (requires two ports free) |
| `npm run build` | Production build of the client |
| `npm run preview` | Preview the production build locally |

Server-only:

```bash
npm run build --prefix server
npm run start --prefix server
```

## Features (high level)

- Browse menu, cart, checkout draft, INR formatting, themes
- Auth: sign up / log in (JWT)
- Orders: create, history, invoice helpers, tracking timeline on the client
- Feedback (topic categories) and **Message** to support with optional linked order
- Staff-style order status updates via authenticated admin header (when configured)

## API quick reference

- `GET /api/health` — liveness check
- `POST /api/auth/signup`, `POST /api/auth/login` — auth
- `GET /api/orders`, `POST /api/orders` — orders (auth)
- `PATCH /api/orders/:id/status` — admin secret header (optional)
- `POST /api/feedback`, `POST /api/messages` — authenticated feedback / support

See `server/src/routes/` for full behavior.

## Seeding MongoDB

If `server/data/db.json` exists and the database has **no users**, the server imports users (and orders/feedbacks from that file) on first connection. That file may be absent in a fresh clone; you can still create an account via **Sign up**.

## License

Private project (`"private": true` in `package.json`).
