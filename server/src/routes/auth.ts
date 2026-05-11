import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import { Router } from "express";
import { allocateNextUserId, UserModel } from "../mongo.js";
import { signToken, verifyToken } from "../jwt.js";

export const authRouter = Router();

function emailOk(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

authRouter.post("/register", async (req: Request, res: Response) => {
  try {
    const name = String(req.body?.name ?? "").trim();
    const email = String(req.body?.email ?? "").trim().toLowerCase();
    const password = String(req.body?.password ?? "");

    if (!name) {
      res.status(400).json({ error: "Please enter your name." });
      return;
    }
    if (!email || !emailOk(email)) {
      res.status(400).json({ error: "Please enter a valid email address." });
      return;
    }
    if (password.length < 6) {
      res
        .status(400)
        .json({ error: "Password must be at least 6 characters." });
      return;
    }

    const taken = await UserModel.exists({ email });
    if (taken) {
      res.status(409).json({ error: "That email is already registered." });
      return;
    }

    const nextId = await allocateNextUserId();
    const password_hash = bcrypt.hashSync(password, 10);
    await UserModel.create({
      id: nextId,
      email,
      password_hash,
      name,
    });

    const token = signToken({ sub: nextId, email, name });
    res.status(201).json({
      token,
      user: { id: nextId, email, name },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error." });
  }
});

authRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const email = String(req.body?.email ?? "").trim().toLowerCase();
    const password = String(req.body?.password ?? "");

    if (!email || !emailOk(email)) {
      res.status(400).json({ error: "Please enter a valid email address." });
      return;
    }
    if (password.length < 6) {
      res
        .status(400)
        .json({ error: "Password must be at least 6 characters." });
      return;
    }

    const user = await UserModel.findOne({ email }).lean();
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const token = signToken({
      sub: user.id,
      email: user.email,
      name: user.name,
    });
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error." });
  }
});

authRouter.get("/me", async (req: Request, res: Response) => {
  try {
    const header = req.headers.authorization;
    const token =
      typeof header === "string" && header.startsWith("Bearer ")
        ? header.slice(7)
        : null;
    if (!token) {
      res.status(401).json({ error: "Missing token." });
      return;
    }

    let payload: ReturnType<typeof verifyToken>;
    try {
      payload = verifyToken(token);
    } catch {
      res.status(401).json({ error: "Invalid or expired token." });
      return;
    }

    const user = await UserModel.findOne({ id: payload.sub }).lean();
    if (!user || user.email !== payload.email) {
      res.status(401).json({ error: "User no longer exists." });
      return;
    }

    res.json({
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error." });
  }
});
