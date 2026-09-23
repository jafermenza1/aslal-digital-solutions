import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEYLEN = 64;

export function hashPassword(password: string) {
  if (password.length < 10) throw new Error("Password must contain at least 10 characters.");
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, KEYLEN, { N: 16384, r: 8, p: 1 });
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

export function verifyPassword(password: string, encoded: string) {
  const [method, salt, hash] = encoded.split("$");
  if (method !== "scrypt" || !salt || !hash) return false;
  try {
    const derived = scryptSync(password, salt, KEYLEN, { N: 16384, r: 8, p: 1 });
    const expected = Buffer.from(hash, "hex");
    return expected.length === derived.length && timingSafeEqual(expected, derived);
  } catch {
    return false;
  }
}