import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { db } from "./db";

const VISITOR_COOKIE = "aslal_visitor";
const REFERRAL_COOKIE = "aslal_referral";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getOrCreateVisitor() {
  const jar = await cookies();
  let anonymousId = jar.get(VISITOR_COOKIE)?.value;

  if (!anonymousId || !UUID_RE.test(anonymousId)) {
    anonymousId = randomUUID();
    jar.set(VISITOR_COOKIE, anonymousId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }

  const id = anonymousId;
  await db.execute(
    `INSERT INTO visitors (id, anonymous_id)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE last_seen_at=CURRENT_TIMESTAMP`,
    [id, id]
  );

  return id;
}

export async function getReferralCode() {
  const jar = await cookies();
  const value = jar.get(REFERRAL_COOKIE)?.value;
  return value && value.length <= 100 ? value : null;
}

export async function setReferralCode(code: string) {
  const normalized = code.trim().slice(0, 100);
  if (!normalized) return;
  const jar = await cookies();
  jar.set(REFERRAL_COOKIE, normalized, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}
