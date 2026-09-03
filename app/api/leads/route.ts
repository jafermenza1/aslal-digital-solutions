import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrCreateVisitor, getReferralCode } from "@/lib/tracking";
import { randomUUID } from "node:crypto";

type VisitorRow = {
  first_source: string | null;
  first_medium: string | null;
  first_campaign: string | null;
};

type ProductRow = { id: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_SUBMISSIONS = 5;

function clean(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function getClientKey(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(key: string) {
  const current = attempts.get(key);
  if (!current || current.resetAt <= Date.now()) {
    attempts.delete(key);
    return false;
  }
  return current.count >= MAX_SUBMISSIONS;
}

function recordSubmission(key: string) {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
  else current.count += 1;
}

export async function POST(request: NextRequest) {
  const key = getClientKey(request);
  if (isRateLimited(key)) return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });

  try {
    const body = await request.json();
    if (clean(body.website, 200)) return NextResponse.json({ ok: true });

    const name = clean(body.name, 160);
    const email = clean(body.email, 190).toLowerCase();
    const phone = clean(body.phone, 40);
    const company = clean(body.company, 190);
    const businessType = clean(body.businessType, 100);
    const message = clean(body.message, 5000);
    const productSlug = clean(body.productSlug, 160);

    if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });
    if (!message) return NextResponse.json({ error: "Message is required." }, { status: 400 });
    if (email && !EMAIL_RE.test(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    if (!email && !phone) return NextResponse.json({ error: "Please provide an email or phone number so we can contact you." }, { status: 400 });

    recordSubmission(key);
    const visitorId = await getOrCreateVisitor();
    const referralCode = await getReferralCode();
    const [visitorRows] = await db.execute<VisitorRow[]>(
      "SELECT first_source, first_medium, first_campaign FROM visitors WHERE id = ? LIMIT 1",
      [visitorId]
    );
    const visitor = visitorRows[0];
    const source = referralCode ? "partner" : visitor?.first_source || "website";
    const leadId = randomUUID();
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();
      await connection.execute(
        `INSERT INTO leads
          (id, visitor_id, name, email, phone, company, business_type, message, status, score, source, medium, campaign, referral_code)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'NEW', 25, ?, ?, ?, ?)`,
        [
          leadId,
          visitorId,
          name,
          email || null,
          phone || null,
          company || null,
          businessType || null,
          message,
          source,
          visitor?.first_medium || null,
          visitor?.first_campaign || null,
          referralCode || null,
        ]
      );

      await connection.execute(
        `INSERT INTO lead_stage_history (lead_id, from_stage, to_stage, changed_by)
         VALUES (?, NULL, 'NEW', 'website')`,
        [leadId]
      );

      if (productSlug) {
        const [productRows] = await connection.execute<ProductRow[]>(
          "SELECT id FROM products WHERE slug = ? LIMIT 1",
          [productSlug]
        );
        const product = productRows[0];
        if (product) {
          await connection.execute(
            `INSERT INTO lead_product_interest
              (id, lead_id, product_id, source, interest_score)
             VALUES (?, ?, ?, 'contact_form', 10)`,
            [randomUUID(), leadId, product.id]
          );
        }
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    return NextResponse.json({ ok: true, leadId });
  } catch (error) {
    console.error("LEAD_CREATE_ERROR", error);
    return NextResponse.json({ error: "Unable to submit the request right now." }, { status: 500 });
  }
}
