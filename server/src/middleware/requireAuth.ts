import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../jwt.js";

export type AuthedRequest = Request & {
  userId: number;
  userEmail: string;
  userName: string;
};

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token =
    typeof header === "string" && header.startsWith("Bearer ")
      ? header.slice(7)
      : null;
  if (!token) {
    res.status(401).json({ error: "Missing token." });
    return;
  }
  try {
    const p = verifyToken(token);
    const r = req as AuthedRequest;
    r.userId = p.sub;
    r.userEmail = p.email;
    r.userName = p.name;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token." });
  }
}
