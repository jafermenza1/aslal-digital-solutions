import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrCreateVisitor, getReferralCode } from "@/lib/tracking";
import { randomUUID } from "node:crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim().slice(0, 160);
    if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });

    const visitorId = await getOrCreateVisitor();
    const referralCode = await getReferralCode();
    const id = randomUUID();
    const score = 25;

    await db.execute(
      `INSERT INTO leads (id, visitor_id, name, email, phone, company, business_type, message, score, source, referral_code)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, visitorId, name, body.email || null, body.phone || null, body.company || null, body.businessType || null, body.message || null, score, referralCode ? "partner" : "website", referralCode]
    );
    await db.execute("INSERT INTO events (visitor_id, event_name, page_path, metadata) VALUES (?, 'lead_submitted', '/contact', ?)", [visitorId, JSON.stringify({ leadId: id, referralCode })]);

    return NextResponse.json({ ok: true, leadId: id });
  } catch (error) {
    console.error("LEAD_CREATE_ERROR", error);
    return NextResponse.json({ error: "Unable to submit the request right now." }, { status: 500 });
  }
}
