import { createHmac, timingSafeEqual } from "node:crypto";

const secret = process.env.SESSION_SECRET || "development-only-change-me";

export function signSession(email: string) {
  const payload = `${email}.${Date.now()}`;
  const signature = createHmac("sha256", secret).update(payload).digest("hex");
  return `${Buffer.from(payload).toString("base64url")}.${signature}`;
}

export function verifySession(value: string | undefined) {
  if (!value) return null;
  const [encoded, signature] = value.split(".");
  if (!encoded || !signature) return null;

  try {
    const payload = Buffer.from(encoded, "base64url").toString("utf8");
    const expected = createHmac("sha256", secret).update(payload).digest("hex");
    if (signature.length !== expected.length) return null;
    const valid = timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    if (!valid) return null;
    const [email, issuedAt] = payload.split(".");
    if (!email || !issuedAt) return null;
    const age = Date.now() - Number(issuedAt);
    if (!Number.isFinite(age) || age > 1000 * 60 * 60 * 12) return null;
    return { email };
  } catch {
    return null;
  }
}
