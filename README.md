# Restaurant / foodislice

Full-stack demo for ordering food: React menu and checkout, Express API, and MongoDB for users, orders, feedback, and support messages.

## Stack

| Layer | Tech |
|--------|------|
| Frontend | React 19, Vite 8, TypeScript, Tailwind CSS 4, React Router |
| Backend | Express 5, TypeScript, Mongoose, JWT auth, bcrypt |
| Data | MongoDB |

## Prerequisites

- **Node.js** (LTS recommended)
- **MongoDB** reachable via a connection string (local or Atlas)

## Setup

From the repository root:

```bash
npm install
npm install --prefix server
```

Optional:

| Variable | Purpose |
|----------|---------|
| `PORT` | API port (default **4000**) |
| `CLIENT_ORIGIN` | Allowed browser origin for CORS (default `http://localhost:5173`) |

Frontend (optional):

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | Base URL for the API (e.g. `https://api.example.com`).

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
- `PATCH /api/orders/:id/status` — admin secret header (optional)
- `POST /api/feedback`, `POST /api/messages` — authenticated feedback / support

See `server/src/routes/` for full behavior.
