import { NextResponse } from "next/server";
import { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import { authorizeWorkspacePermission } from "@/lib/workspaces";

type AuditRow = RowDataPacket & {
  lead_id: string;
  lead_name: string;
  lead_status: string;
  owner_email: string | null;
  source: string | null;
  medium: string | null;
  campaign: string | null;
  referral_code: string | null;
  first_source: string | null;
  first_medium: string | null;
  first_campaign: string | null;
  partner_number: string | null;
  partner_name: string | null;
  campaign_id: string | null;
  campaign_name: string | null;
  published_asset_count: number | string;
  opportunity_stage: string | null;
  opportunity_value: number | string | null;
  order_count: number | string;
  confirmed_order_value: number | string | null;
  created_at: Date;
};

function csv(value: unknown) {
  const text = value == null ? "" : String(value);
  return '"' + text.replaceAll('"', '""') + '"';
}

function isoDate(value: Date) {
  return value.toISOString();
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const access = await authorizeWorkspacePermission(
    "dashboard.view",
    url.searchParams.get("workspaceId") || undefined
  );
  if (!access) {
    return NextResponse.json({ error: "Unauthorized or workspace access denied" }, { status: 403 });
  }

  const now = new Date();
  const defaultFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const from = url.searchParams.get("from") ? new Date(url.searchParams.get("from") as string) : defaultFrom;
  const to = url.searchParams.get("to") ? new Date(url.searchParams.get("to") as string) : now;
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from >= to) {
    return NextResponse.json({ error: "Valid from/to dates are required and from must be before to." }, { status: 400 });
  }

  const [rows] = await db.query<AuditRow[]>(
    `SELECT
       l.id AS lead_id,
       l.name AS lead_name,
       l.status AS lead_status,
       l.owner_email,
       l.source,
       l.medium,
       l.campaign,
       l.referral_code,
       v.first_source,
       v.first_medium,
       v.first_campaign,
       p.partner_number,
       p.name AS partner_name,
       pc.id AS campaign_id,
       pc.name AS campaign_name,
       COALESCE(pa.published_asset_count, 0) AS published_asset_count,
       o.stage AS opportunity_stage,
       o.expected_value AS opportunity_value,
       COALESCE(oc.order_count, 0) AS order_count,
       oc.confirmed_order_value,
       l.created_at
     FROM leads l
     LEFT JOIN visitors v ON v.id = l.visitor_id
     LEFT JOIN referral_links rl
       ON rl.code = l.referral_code
      AND rl.workspace_id = l.workspace_id
     LEFT JOIN partners p
       ON p.id = rl.partner_id
      AND p.workspace_id = l.workspace_id
     LEFT JOIN partner_campaigns pc
       ON pc.id = rl.campaign_id
      AND pc.workspace_id = l.workspace_id
     LEFT JOIN (
       SELECT campaign_id, workspace_id, COUNT(*) AS published_asset_count
       FROM campaign_assets
       WHERE workspace_id = ? AND status = 'PUBLISHED'
       GROUP BY campaign_id, workspace_id
     ) pa ON pa.campaign_id = pc.id AND pa.workspace_id = l.workspace_id
     LEFT JOIN opportunities o
       ON o.lead_id = l.id
      AND o.workspace_id = l.workspace_id
     LEFT JOIN (
       SELECT
         opportunity_id,
         workspace_id,
         COUNT(*) AS order_count,
         SUM(CASE WHEN status IN ('CONFIRMED','FULFILLING','COMPLETED') THEN total ELSE 0 END) AS confirmed_order_value
       FROM orders
       WHERE workspace_id = ?
       GROUP BY opportunity_id, workspace_id
     ) oc ON oc.opportunity_id = o.id AND oc.workspace_id = l.workspace_id
     WHERE l.workspace_id = ?
       AND l.created_at >= ?
       AND l.created_at < ?
     ORDER BY l.created_at DESC`,
    [access.workspace.id, access.workspace.id, access.workspace.id, from, to]
  );

  const data = rows.map((row) => ({
    leadId: row.lead_id,
    leadName: row.lead_name,
    leadStatus: row.lead_status,
    ownerEmail: row.owner_email,
    source: row.source,
    medium: row.medium,
    campaign: row.campaign,
    referralCode: row.referral_code,
    firstSource: row.first_source,
    firstMedium: row.first_medium,
    firstCampaign: row.first_campaign,
    partnerNumber: row.partner_number,
    partnerName: row.partner_name,
    campaignId: row.campaign_id,
    campaignName: row.campaign_name,
    publishedAssetCount: Number(row.published_asset_count || 0),
    opportunityStage: row.opportunity_stage,
    opportunityValue: row.opportunity_value == null ? null : Number(row.opportunity_value),
    orderCount: Number(row.order_count || 0),
    confirmedOrderValue: row.confirmed_order_value == null ? 0 : Number(row.confirmed_order_value),
    createdAt: isoDate(row.created_at),
  }));

  if (url.searchParams.get("format") === "csv") {
    const headers = [
      "lead_id","lead_name","lead_status","owner_email","source","medium","campaign",
      "referral_code","first_source","first_medium","first_campaign","partner_number",
      "partner_name","campaign_id","campaign_name","published_asset_count","opportunity_stage",
      "opportunity_value","order_count","confirmed_order_value","created_at"
    ];
    const lines = [
      headers.join(","),
      ...data.map((row) => [
        row.leadId,row.leadName,row.leadStatus,row.ownerEmail,row.source,row.medium,row.campaign,
        row.referralCode,row.firstSource,row.firstMedium,row.firstCampaign,row.partnerNumber,
        row.partnerName,row.campaignId,row.campaignName,row.publishedAssetCount,row.opportunityStage,
        row.opportunityValue,row.orderCount,row.confirmedOrderValue,row.createdAt
      ].map(csv).join(","))
    ];
    return new NextResponse(lines.join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="weekly-pipeline-audit-${from.toISOString().slice(0,10)}-to-${to.toISOString().slice(0,10)}.csv"`,
      },
    });
  }

  return NextResponse.json({
    workspace: { id: access.workspace.id, name: access.workspace.name },
    range: { from: from.toISOString(), to: to.toISOString() },
    count: data.length,
    rows: data,
  });
}
