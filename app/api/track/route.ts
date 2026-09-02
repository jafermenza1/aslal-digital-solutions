import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrCreateVisitor, getReferralCode } from "@/lib/tracking";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const eventName = String(body.eventName || "unknown").slice(0, 100);
    const pagePath = body.pagePath ? String(body.pagePath).slice(0, 500) : null;
    const productSlug = body.productSlug ? String(body.productSlug).slice(0, 160) : null;
    const metadata = body.metadata ? JSON.stringify(body.metadata).slice(0, 8000) : null;
    const visitorId = await getOrCreateVisitor();
    const referral = await getReferralCode();

    await db.execute("UPDATE visitors SET last_seen_at=CURRENT_TIMESTAMP, first_referral_code=COALESCE(first_referral_code, ?) WHERE id=?", [referral, visitorId]);
    await db.execute("INSERT INTO events (visitor_id, event_name, page_path, product_slug, metadata) VALUES (?, ?, ?, ?, ?)", [visitorId, eventName, pagePath, productSlug, metadata]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("TRACKING_ERROR", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
