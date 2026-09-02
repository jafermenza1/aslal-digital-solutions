import { createHmac, timingSafeEqual } from "node:crypto";

type SessionPayload = {
  email: string;
  issuedAt: number;
};

function getSessionSecret() {
  const value = process.env.SESSION_SECRET;
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be configured in production.");
  }
  return value || "development-only-change-me";
}

function encodePayload(payload: SessionPayload) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

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
    const valid = timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expected, "hex"));
    if (!valid) return null;

    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SessionPayload;
    if (typeof payload.email !== "string" || !payload.email || typeof payload.issuedAt !== "number") return null;

    const age = Date.now() - payload.issuedAt;
    if (!Number.isFinite(age) || age < 0 || age > 1000 * 60 * 60 * 12) return null;
    return { email: payload.email };
  } catch {
    return null;
  }
}

export function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
