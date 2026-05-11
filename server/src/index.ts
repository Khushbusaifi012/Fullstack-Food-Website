import cors from "cors";
import "dotenv/config";
import express from "express";
import { authRouter } from "./routes/auth.js";
import { feedbackRouter } from "./routes/feedback.js";
import { messagesRouter } from "./routes/messages.js";
import { ordersRouter } from "./routes/orders.js";
import { connectMongo } from "./mongo.js";

const jwtSecret = process.env.JWT_SECRET?.trim();
if (!jwtSecret || jwtSecret.length < 16) {
  console.error(
    "[restaurant-api] Missing JWT_SECRET. Copy server/.env.example to server/.env and set JWT_SECRET (at least 16 characters).",
  );
  process.exit(1);
}

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const clientOrigin =
  process.env.CLIENT_ORIGIN || "http://localhost:5173";

const corsOrigins = [
  clientOrigin,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
];

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  }),
);
/** GET/HEAD should not use a JSON body; Postman often still sends `Content-Type: application/json`, which breaks `express.json()`. */
app.use((req, _res, next) => {
  const m = req.method.toUpperCase();
  if (m !== "GET" && m !== "HEAD") {
    next();
    return;
  }
  const raw = req.headers["content-type"];
  const ct =
    typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] ?? "" : "";
  if (ct.toLowerCase().includes("application/json")) {
    delete req.headers["content-type"];
  }
  next();
});
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/feedback", feedbackRouter);
app.use("/api/messages", messagesRouter);

void connectMongo()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API listening on http://localhost:${PORT}`);
      console.log(`CORS origins: ${corsOrigins.join(", ")}`);
    });
  })
  .catch((err) => {
    console.error("[mongo] connect failed:", err);
    process.exit(1);
  });
