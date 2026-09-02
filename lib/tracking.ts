import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { db } from "./db";

const VISITOR_COOKIE = "aslal_visitor";
const REFERRAL_COOKIE = "aslal_referral";

export async function getOrCreateVisitor() {
  const jar = await cookies();
  let anonymousId = jar.get(VISITOR_COOKIE)?.value;

  if (!anonymousId) {
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
  return jar.get(REFERRAL_COOKIE)?.value || null;
}

export async function setReferralCode(code: string) {
  const jar = await cookies();
  jar.set(REFERRAL_COOKIE, code, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 90,
    path: "/",
  });
}
