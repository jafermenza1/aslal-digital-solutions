import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_IDLE_MS = 20 * 60 * 1000;

type SessionPayload = { email: string; issuedAt: number };

function getSessionSecret() {
  const value = process.env.SESSION_SECRET;
  if (!value && process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET must be configured in production.");
  return value || "development-only-change-me";
}
function encodePayload(payload: SessionPayload) { return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url"); }
export function signSession(email: string) {
  const payload = encodePayload({ email, issuedAt: Date.now() });
  const signature = createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
  return `${payload}.${signature}`;
}
export function verifySession(value: string | undefined) {
  if (!value) return null;
  const [encoded, signature] = value.split(".");
  if (!encoded || !signature || signature.length !== 64 || !/^[a-f0-9]+$/i.test(signature)) return null;
  try {
    const expected = createHmac("sha256", getSessionSecret()).update(encoded).digest("hex");
    if (!timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expected, "hex"))) return null;
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SessionPayload;
    if (typeof payload.email !== "string" || !payload.email || typeof payload.issuedAt !== "number") return null;
    const age = Date.now() - payload.issuedAt;
    if (!Number.isFinite(age) || age < 0 || age > SESSION_IDLE_MS) return null;
    return { email: payload.email };
  } catch { return null; }
}
export function isAdminEmail(email: string) {
  const configured = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  return Boolean(configured) && email.trim().toLowerCase() === configured;
}
export function safeEqual(a: string, b: string) {
  const left = Buffer.from(a), right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
