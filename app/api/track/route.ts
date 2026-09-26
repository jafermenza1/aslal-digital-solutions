import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { getOrCreateVisitor, getReferralCode } from "@/lib/tracking";
import { recalculateLeadScore } from "@/lib/lead-scoring";
import { growthOpportunityFor, isBusinessEvent } from "@/lib/event-taxonomy";

const MAX_METADATA_BYTES = 8000;

type LeadRow = RowDataPacket & { id: string };

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const eventName = String(body.eventName || "").trim().slice(0, 100);
    if (!isBusinessEvent(eventName)) return NextResponse.json({ ok: false, error: "Unsupported business event." }, { status: 400 });
    const pagePath = body.pagePath ? String(body.pagePath).slice(0, 500) : null;
    const productSlug = body.productSlug ? String(body.productSlug).slice(0, 160) : null;
    const metadataObject = body.metadata && typeof body.metadata === "object" ? body.metadata : {};
    const metadata = JSON.stringify(metadataObject);
    if (metadata.length > MAX_METADATA_BYTES) {
      return NextResponse.json({ ok: false, error: "Event metadata is too large." }, { status: 413 });
    }

    const visitorId = await getOrCreateVisitor();
    const referral = await getReferralCode();
    const utmSource = typeof metadataObject.attributionSource === "string" ? metadataObject.attributionSource.slice(0, 100) : typeof metadataObject.utmSource === "string" ? metadataObject.utmSource.slice(0, 100) : null;
    const utmMedium = typeof metadataObject.attributionMedium === "string" ? metadataObject.attributionMedium.slice(0, 100) : typeof metadataObject.utmMedium === "string" ? metadataObject.utmMedium.slice(0, 100) : null;
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

    const growthSignal = growthOpportunityFor(eventName, productSlug);
    if (growthSignal) {
      const [existingRows] = await db.execute<RowDataPacket[]>(
        "SELECT id FROM growth_opportunities WHERE visitor_id = ? AND interest = ? AND status = 'OPEN' LIMIT 1",
        [visitorId, growthSignal.interest]
      );
      if (!existingRows[0]) {
        await db.execute(
          `INSERT INTO growth_opportunities
            (id, visitor_id, interest, engagement_level, source, medium, campaign, recommended_next_action)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [randomUUID(), visitorId, growthSignal.interest, growthSignal.engagementLevel, utmSource, utmMedium, utmCampaign, growthSignal.recommendedNextAction]
        );
      }
    }

    const [leadRows] = await db.execute<LeadRow[]>(
      "SELECT id FROM leads WHERE visitor_id = ? AND status NOT IN ('WON', 'LOST') ORDER BY created_at DESC LIMIT 1",
      [visitorId]
    );
    const lead = leadRows[0];
    if (lead) {
      try {
        await recalculateLeadScore(lead.id);
      } catch (error) {
        console.error("LEAD_SCORE_ERROR", error);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("TRACKING_ERROR", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
