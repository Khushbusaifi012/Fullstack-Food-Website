import mongoose from "mongoose";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { AppData, OrderLine } from "./db.js";

const orderLineSchema = new mongoose.Schema<OrderLine>(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password_hash: { type: String, required: true },
    name: { type: String, required: true },
  },
  { collection: "users" },
);

const stripMongo = {
  transform: (_doc: unknown, ret: Record<string, unknown>) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
};

const orderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: Number, required: true, index: true },
    createdAt: { type: String, required: true },
    status: { type: String, required: true },
    deliveryMode: {
      type: String,
      enum: ["delivery", "pickup"],
      required: true,
    },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    /** Pickup orders and optional notes use ""; route still validates delivery address. */
    address: { type: String, default: "" },
    notes: { type: String, default: "" },
    paymentMethod: { type: String, required: true },
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    total: { type: Number, required: true },
    lines: { type: [orderLineSchema], default: [] },
  },
  { collection: "orders", toJSON: stripMongo },
);

const feedbackSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: Number, required: true, index: true },
    email: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: String, required: true },
  },
  { collection: "feedbacks", toJSON: stripMongo },
);

const messageSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: Number, required: true, index: true },
    email: { type: String, required: true },
    name: { type: String, required: true },
    subject: { type: String, default: "" },
    message: { type: String, required: true },
    orderId: { type: String, default: "" },
    createdAt: { type: String, required: true },
  },
  { collection: "messages", toJSON: stripMongo },
);

export const UserModel = mongoose.model("User", userSchema);
export const OrderModel = mongoose.model("Order", orderSchema);
export const FeedbackModel = mongoose.model("Feedback", feedbackSchema);
export const MessageModel = mongoose.model("Message", messageSchema);

export async function allocateNextUserId(): Promise<number> {
  const last = await UserModel.findOne()
    .sort({ id: -1 })
    .select("id")
    .lean<{ id: number } | null>();
  return (last?.id ?? 0) + 1;
}

function legacyDbPath(): string {
  return path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "data",
    "db.json",
  );
}

async function seedFromLegacyJsonIfEmpty(): Promise<void> {
  const existingUsers = await UserModel.countDocuments();
  if (existingUsers > 0) return;

  const dbFile = legacyDbPath();
  if (!fs.existsSync(dbFile)) return;

  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(dbFile, "utf8"));
  } catch {
    return;
  }
  const data = raw as Partial<AppData>;
  const users = Array.isArray(data.users) ? data.users : [];
  const orders = Array.isArray(data.orders) ? data.orders : [];
  const feedbacks = Array.isArray(data.feedbacks) ? data.feedbacks : [];
  if (users.length === 0) return;

  await UserModel.insertMany(users);
  if (orders.length > 0) await OrderModel.insertMany(orders);
  if (feedbacks.length > 0) await FeedbackModel.insertMany(feedbacks);
  console.info(
    `[mongo] seeded from data/db.json — ${users.length} user(s), ${orders.length} order(s), ${feedbacks.length} feedback(s)`,
  );
}

/**
 * Connect to MongoDB and start the API only after the DB is ready.
 */
export async function connectMongo(): Promise<void> {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    console.error(
      "[mongo] Missing MONGODB_URI. Add it to server/.env (see server/.env.example). Example: mongodb://127.0.0.1:27017/restaurant",
    );
    process.exit(1);
  }

  await mongoose.connect(uri);
  await seedFromLegacyJsonIfEmpty();

  const [u, o, f, m] = await Promise.all([
    UserModel.countDocuments(),
    OrderModel.countDocuments(),
    FeedbackModel.countDocuments(),
    MessageModel.countDocuments(),
  ]);
  console.info(
    `[mongo] ${uri.split("@").pop()} — ${u} user(s), ${o} order(s), ${f} feedback(s), ${m} message(s)`,
  );
}
