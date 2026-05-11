import type { Request, Response } from "express";
import { Router } from "express";
import { randomUUID } from "node:crypto";
import type { DbFeedback } from "../db.js";
import { FeedbackModel } from "../mongo.js";
import type { AuthedRequest } from "../middleware/requireAuth.js";
import { requireAuth } from "../middleware/requireAuth.js";

const CATEGORIES = new Set(["bug", "suggestion", "compliment", "other"]);

export const feedbackRouter = Router();

feedbackRouter.use(requireAuth);

feedbackRouter.get("/", async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthedRequest;
    const list = await FeedbackModel.find({ userId: authReq.userId })
      .lean()
      .sort({ createdAt: -1 });
    const feedbacks = list.map((f) => ({
      id: f.id,
      userId: f.userId,
      email: f.email,
      name: f.name,
      category: f.category,
      message: f.message,
      createdAt: f.createdAt,
    }));
    res.json({ feedbacks });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error." });
  }
});

feedbackRouter.post("/", async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthedRequest;
    const message = String(req.body?.message ?? "").trim();
    if (message.length < 5) {
      res
        .status(400)
        .json({ error: "Please write at least a few words (5+ characters)." });
      return;
    }
    const rawCat = String(req.body?.category ?? "other").trim().toLowerCase();
    const category = CATEGORIES.has(rawCat) ? rawCat : "other";

    const entry: DbFeedback = {
      id: randomUUID(),
      userId: authReq.userId,
      email: authReq.userEmail,
      name: authReq.userName,
      category,
      message,
      createdAt: new Date().toISOString(),
    };
    try {
      await FeedbackModel.create(entry);
    } catch (writeErr) {
      console.error("[feedback] save failed:", writeErr);
      res.status(500).json({ error: "Could not save feedback." });
      return;
    }

    res.status(201).json({ ok: true, id: entry.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error." });
  }
});
