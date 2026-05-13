import type { Request, Response } from "express";
import { Router } from "express";
import { randomUUID } from "node:crypto";
import type { DbOrder, OrderLine } from "../db.js";
import { OrderModel } from "../mongo.js";
import type { AuthedRequest } from "../middleware/requireAuth.js";
import { requireAuth } from "../middleware/requireAuth.js";

const TAX_RATE = 0.05;

/** Must stay in sync with `src/lib/orderTracking.ts` (frontend timeline). */
const ALLOWED_ORDER_STATUSES = new Set([
  "placed",
  "confirmed",
  "pending",
  "preparing",
  "in_kitchen",
  "cooking",
  "being_prepared",
  "ready",
  "ready_for_pickup",
  "on_the_way",
  "out_for_delivery",
  "dispatched",
  "in_transit",
  "delivered",
  "completed",
  "picked_up",
  "pickedup",
  "cancelled",
  "canceled",
]);

export const ordersRouter = Router();

/**
 * Kitchen / back-office: advance order status (no customer JWT).
 * Set ORDER_STATUS_ADMIN_SECRET in server/.env and send header X-Restaurant-Admin-Secret.
 */
ordersRouter.patch("/:id/status", async (req: Request, res: Response) => {
  try {
    const configured = process.env.ORDER_STATUS_ADMIN_SECRET?.trim();
    const sent = String(req.headers["x-restaurant-admin-secret"] ?? "").trim();
    if (!configured) {
      res.status(503).json({
        error:
          "ORDER_STATUS_ADMIN_SECRET is not set on the server. Add it to server/.env to enable status updates.",
      });
      return;
    }
    if (sent !== configured) {
      res.status(401).json({ error: "Invalid or missing X-Restaurant-Admin-Secret." });
      return;
    }

    const id = String(req.params.id ?? "").trim();
    const status = String(req.body?.status ?? "").trim().toLowerCase();
    if (!id) {
      res.status(400).json({ error: "Missing order id." });
      return;
    }
    if (!ALLOWED_ORDER_STATUSES.has(status)) {
      res.status(400).json({
        error: `Invalid status. Allowed: ${[...ALLOWED_ORDER_STATUSES].sort().join(", ")}`,
      });
      return;
    }

    const updated = await OrderModel.findOneAndUpdate(
      { id },
      { $set: { status } },
      { new: true },
    );
    if (!updated) {
      res.status(404).json({ error: "Order not found." });
      return;
    }
    res.json({ ok: true, order: updated.toJSON() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error." });
  }
});

ordersRouter.use(requireAuth);

function isOrderLine(x: unknown): x is OrderLine {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.productId === "string" &&
    typeof o.name === "string" &&
    typeof o.unitPrice === "number" &&
    typeof o.quantity === "number" &&
    Number.isFinite(o.unitPrice) &&
    Number.isInteger(o.quantity) &&
    o.quantity > 0 &&
    o.unitPrice >= 0
  );
}

ordersRouter.post("/", async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthedRequest;
    const linesRaw = req.body?.lines;
    if (!Array.isArray(linesRaw) || linesRaw.length === 0) {
      res.status(400).json({ error: "Cart is empty." });
      return;
    }
    const lines = linesRaw.filter(isOrderLine);
    if (lines.length !== linesRaw.length) {
      res.status(400).json({ error: "Invalid line items." });
      return;
    }

    const deliveryMode: DbOrder["deliveryMode"] =
      req.body?.deliveryMode === "pickup" ? "pickup" : "delivery";
    const fullName = String(req.body?.fullName ?? "").trim();
    const phone = String(req.body?.phone ?? "").trim();
    const address = String(req.body?.address ?? "").trim();
    const notes = String(req.body?.notes ?? "").trim();
    const paymentMethod = String(req.body?.paymentMethod ?? "online").trim();

    if (!fullName) {
      res.status(400).json({ error: "Please enter your name." });
      return;
    }
    if (!phone) {
      res.status(400).json({ error: "Please enter your phone number." });
      return;
    }
    if (deliveryMode === "delivery" && !address) {
      res.status(400).json({ error: "Please enter a delivery address." });
      return;
    }

    const subtotal = lines.reduce(
      (s, l) => s + l.unitPrice * l.quantity,
      0,
    );
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;

    const order: DbOrder = {
      id: randomUUID(),
      userId: authReq.userId,
      createdAt: new Date().toISOString(),
      status: "placed",
      deliveryMode,
      fullName,
      phone,
      address: deliveryMode === "delivery" ? address : "",
      notes,
      paymentMethod,
      subtotal,
      tax,
      total,
      lines,
    };
    try {
      await OrderModel.create(order);
    } catch (writeErr) {
      console.error("[orders] save failed:", writeErr);
      res.status(500).json({ error: "Could not save order." });
      return;
    }

    res.status(201).json({
      order: {
        id: order.id,
        createdAt: order.createdAt,
        total: order.total,
        status: order.status,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error." });
  }
});

ordersRouter.get("/", async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthedRequest;
    const list = await OrderModel.find({ userId: authReq.userId })
      .lean()
      .sort({ createdAt: -1 });
    const mine = list.map((o) => ({
      id: o.id,
      createdAt: o.createdAt,
      status: o.status,
      total: o.total,
      deliveryMode: o.deliveryMode,
      lineCount: o.lines.reduce((n, l) => n + l.quantity, 0),
    }));
    res.json({ orders: mine });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error." });
  }
});

ordersRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthedRequest;
    const order = await OrderModel.findOne({
      id: req.params.id,
      userId: authReq.userId,
    });
    if (!order) {
      res.status(404).json({ error: "Order not found." });
      return;
    }
    res.json({ order: order.toJSON() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error." });
  }
});
