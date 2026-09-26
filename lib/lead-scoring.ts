import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";

export type LeadScoreBand = "Cold" | "Warm" | "Hot" | "Priority";

export type LeadScoreBreakdown = {
  score: number;
  band: LeadScoreBand;
  reasons: string[];
};

type LeadSignalsRow = RowDataPacket & {
  product_views: number;
  pricing_interactions: number;
  demo_interactions: number;
  referral_visits: number;
  event_count: number;
  high_value_interests: number;
  resource_downloads: number;
  resource_tool_uses: number;
};

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function getLeadScoreBand(score: number): LeadScoreBand {
  if (score >= 80) return "Priority";
  if (score >= 60) return "Hot";
  if (score >= 30) return "Warm";
  return "Cold";
}

export async function calculateLeadScore(leadId: string): Promise<LeadScoreBreakdown> {
  const [rows] = await db.execute<LeadSignalsRow[]>(
    `SELECT
       (SELECT COUNT(*) FROM events e WHERE e.visitor_id = l.visitor_id AND (LOWER(e.event_name) LIKE '%product%view%' OR LOWER(e.event_name) IN ('product_view', 'view_product'))) AS product_views,
       (SELECT COUNT(*) FROM events e WHERE e.visitor_id = l.visitor_id AND (LOWER(e.event_name) LIKE '%pricing%' OR LOWER(e.event_name) LIKE '%price%')) AS pricing_interactions,
       (SELECT COUNT(*) FROM events e WHERE e.visitor_id = l.visitor_id AND LOWER(e.event_name) LIKE '%demo%') AS demo_interactions,
       (SELECT COUNT(*) FROM events e WHERE e.visitor_id = l.visitor_id AND (LOWER(e.event_name) LIKE '%referral%' OR LOWER(e.event_name) = 'referral_visit')) AS referral_visits,
       (SELECT COUNT(*) FROM events e WHERE e.visitor_id = l.visitor_id) AS event_count,
       (SELECT COUNT(*) FROM events e WHERE e.visitor_id = l.visitor_id AND e.event_name = 'RESOURCE_DOWNLOAD') AS resource_downloads,
       (SELECT COUNT(*) FROM events e WHERE e.visitor_id = l.visitor_id AND e.event_name = 'RESOURCE_TOOL_USE') AS resource_tool_uses,
       (SELECT COUNT(*) FROM lead_product_interest lpi
          INNER JOIN products p ON p.id = lpi.product_id
          WHERE lpi.lead_id = l.id
            AND CAST(REGEXP_REPLACE(COALESCE(p.starting_price, ''), '[^0-9.]', '') AS DECIMAL(15,2)) >= 50000) AS high_value_interests
     FROM leads l
     WHERE l.id = ?
     LIMIT 1`,
    [leadId]
  );

  const signals = rows[0];
  if (!signals) return { score: 0, band: "Cold", reasons: ["Lead not found"] };

  let score = 25;
  const reasons: string[] = ["Contact form submission +25"];

  if (signals.product_views > 0) {
    score += 10;
    reasons.push("Product interest +10");
  }
  if (signals.product_views > 1) {
    score += 15;
    reasons.push("Multiple product views +15");
  }
  if (signals.pricing_interactions > 0) {
    score += 15;
    reasons.push("Pricing interaction +15");
  }
  if (signals.demo_interactions > 0) {
    score += 20;
    reasons.push("Demo interaction +20");
  }
  if (signals.referral_visits > 0) {
    score += 10;
    reasons.push("Referral visit +10");
  }
  if (signals.event_count > 1) {
    score += 5;
    reasons.push("Repeat engagement +5");
  }
  if (signals.high_value_interests > 0) {
    score += 10;
    reasons.push("High-value product interest +10");
  }
  if (signals.resource_downloads > 0) {
    score += 10;
    reasons.push("Resource download +10");
  }
  if (signals.resource_tool_uses > 0 && signals.resource_downloads > 0) {
    score += 30;
    reasons.push("Interactive resource + download combination +30");
  } else if (signals.resource_tool_uses > 0) {
    score += 10;
    reasons.push("Interactive resource use +10");
  }

  const finalScore = clampScore(score);
  return { score: finalScore, band: getLeadScoreBand(finalScore), reasons };
}

export async function recalculateLeadScore(leadId: string) {
  const breakdown = await calculateLeadScore(leadId);
  await db.execute("UPDATE leads SET score = ? WHERE id = ?", [breakdown.score, leadId]);
  return breakdown;
}
