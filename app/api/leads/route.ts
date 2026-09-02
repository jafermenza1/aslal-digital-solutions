import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrCreateVisitor, getReferralCode } from "@/lib/tracking";
import { randomUUID } from "node:crypto";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = clean(body.name, 160);
    const email = clean(body.email, 190).toLowerCase();
    const phone = clean(body.phone, 40);
    const company = clean(body.company, 190);
    const businessType = clean(body.businessType, 100);
    const message = clean(body.message, 5000);

    if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });
    if (!message) return NextResponse.json({ error: "Message is required." }, { status: 400 });
    if (email && !EMAIL_RE.test(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    if (!email && !phone) return NextResponse.json({ error: "Please provide an email or phone number so we can contact you." }, { status: 400 });

    const visitorId = await getOrCreateVisitor();
    const referralCode = await getReferralCode();
    const id = randomUUID();
    const [[visitorRows]] = await Promise.all([
      db.query("SELECT first_source, first_medium, first_campaign FROM visitors WHERE id=? LIMIT 1", [visitorId]),
    ]);
    const visitor = (visitorRows as Array<{ first_source: string | null; first_medium: string | null; first_campaign: string | null }>)[0];
    const source = referralCode ? "partner" : visitor?.first_source || "website";

    await db.execute(
      `INSERT INTO leads (id, visitor_id, name, email, phone, company, business_type, message, score, source, medium, campaign, referral_code)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, visitorId, name, email || null, phone || null, company || null, businessType || null, message, 25, source, visitor?.first_medium || null, visitor?.first_campaign || null, referralCode]
    );

    await db.execute(
      "INSERT INTO events (visitor_id, event_name, page_path, metadata) VALUES (?, 'lead_submitted', '/contact', ?)",
      [visitorId, JSON.stringify({ leadId: id, referralCode })]
    );

    return NextResponse.json({ ok: true, leadId: id });
  } catch (error) {
    console.error("LEAD_CREATE_ERROR", error);
    return NextResponse.json({ error: "Unable to submit the request right now." }, { status: 500 });
  }
}
