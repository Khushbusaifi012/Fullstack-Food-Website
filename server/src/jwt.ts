import jwt from "jsonwebtoken";

export type JwtPayload = {
  sub: number;
  email: string;
  name: string;
};

function secret(): string {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 16) {
    throw new Error(
      "JWT_SECRET must be set in server/.env (at least 16 characters). Copy server/.env.example to server/.env.",
    );
  }
  return s;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, secret(), { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, secret()) as jwt.JwtPayload &
    Partial<JwtPayload>;
  const subRaw = decoded.sub;
  const sub =
    typeof subRaw === "number" && Number.isFinite(subRaw)
      ? subRaw
      : typeof subRaw === "string" && /^\d+$/.test(subRaw)
        ? Number.parseInt(subRaw, 10)
        : NaN;
  if (
    !Number.isFinite(sub) ||
    typeof decoded.email !== "string" ||
    typeof decoded.name !== "string"
  ) {
    throw new Error("Invalid token payload");
  }
  return { sub, email: decoded.email, name: decoded.name };
}
