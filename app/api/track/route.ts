import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrCreateVisitor, getReferralCode } from "@/lib/tracking";

const MAX_METADATA_BYTES = 8000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const eventName = String(body.eventName || "unknown").trim().slice(0, 100) || "unknown";
    const pagePath = body.pagePath ? String(body.pagePath).slice(0, 500) : null;
    const productSlug = body.productSlug ? String(body.productSlug).slice(0, 160) : null;
    const metadataObject = body.metadata && typeof body.metadata === "object" ? body.metadata : {};
    const metadataJson = JSON.stringify(metadataObject);
    const metadata = metadataJson.length <= MAX_METADATA_BYTES ? metadataJson : metadataJson.slice(0, MAX_METADATA_BYTES);
    const visitorId = await getOrCreateVisitor();
    const referral = await getReferralCode();
    const utmSource = typeof metadataObject.utmSource === "string" ? metadataObject.utmSource.slice(0, 100) : null;
    const utmMedium = typeof metadataObject.utmMedium === "string" ? metadataObject.utmMedium.slice(0, 100) : null;
    const utmCampaign = typeof metadataObject.utmCampaign === "string" ? metadataObject.utmCampaign.slice(0, 150) : null;

    await db.execute(
      `UPDATE visitors
       SET last_seen_at=CURRENT_TIMESTAMP,
           first_source=COALESCE(first_source, ?),
           first_medium=COALESCE(first_medium, ?),
           first_campaign=COALESCE(first_campaign, ?),
           first_referral_code=COALESCE(first_referral_code, ?)
       WHERE id=?`,
      [utmSource, utmMedium, utmCampaign, referral, visitorId]
    );

    await db.execute(
      "INSERT INTO events (visitor_id, event_name, page_path, product_slug, metadata) VALUES (?, ?, ?, ?, ?)",
      [visitorId, eventName, pagePath, productSlug, metadata]
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("TRACKING_ERROR", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
