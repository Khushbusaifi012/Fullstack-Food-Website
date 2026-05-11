import type { Request, Response } from "express";
import { Router } from "express";
import { randomUUID } from "node:crypto";
import type { DbMessage } from "../db.js";
import { MessageModel, OrderModel } from "../mongo.js";
import type { AuthedRequest } from "../middleware/requireAuth.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const messagesRouter = Router();

messagesRouter.use(requireAuth);

messagesRouter.get("/", async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthedRequest;
    const list = await MessageModel.find({ userId: authReq.userId })
      .lean()
      .sort({ createdAt: -1 });
    const messages = list.map((m) => ({
      id: m.id,
      userId: m.userId,
      email: m.email,
      name: m.name,
      subject: m.subject,
      message: m.message,
      orderId: m.orderId,
      createdAt: m.createdAt,
    }));
    res.json({ messages });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error." });
  }
});

messagesRouter.post("/", async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthedRequest;
    const message = String(req.body?.message ?? "").trim();
    if (message.length < 5) {
      res
        .status(400)
        .json({ error: "Please write at least a few words (5+ characters)." });
      return;
    }

    let subject = String(req.body?.subject ?? "").trim();
    if (subject.length > 120) subject = subject.slice(0, 120);

    const rawOrderId = String(req.body?.orderId ?? "").trim();
    let orderId = "";
    if (rawOrderId) {
      const order = await OrderModel.findOne({
        id: rawOrderId,
        userId: authReq.userId,
      })
        .select("id")
        .lean();
      if (!order) {
        res.status(400).json({ error: "That order was not found on your account." });
        return;
      }
      orderId = rawOrderId;
    }

    const entry: DbMessage = {
      id: randomUUID(),
      userId: authReq.userId,
      email: authReq.userEmail,
      name: authReq.userName,
      subject,
      message,
      orderId,
      createdAt: new Date().toISOString(),
    };
    try {
      await MessageModel.create(entry);
    } catch (writeErr) {
      console.error("[messages] save failed:", writeErr);
      res.status(500).json({ error: "Could not save message." });
      return;
    }

    res.status(201).json({ ok: true, id: entry.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error." });
  }
});
