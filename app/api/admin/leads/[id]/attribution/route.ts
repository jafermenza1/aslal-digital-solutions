import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { authorizeWorkspacePermission } from "@/lib/workspaces";

const METHODS = ["DIRECT_OFFLINE","MANUAL_PARTNER","PARTNER_BROUGHT_CUSTOMER","OFFLINE_CODE","CAMPAIGN_EVENT","STAFF_CAPTURE"];

const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: leadId } = await params;
  const access = await authorizeWorkspacePermission("leads.edit", new URL(request.url).searchParams.get("workspaceId"));
  if (!access) return NextResponse.json({ error: "Unauthorized or workspace access denied" }, { status: 403 });

  const [rows] = await db.execute<any[]>(`
    SELECT la.*, p.name partner_name, p.partner_number, c.name campaign_name
    FROM lead_attributions la
    LEFT JOIN partners p ON p.id=la.partner_id
    LEFT JOIN partner_campaigns c ON c.id=la.campaign_id
    WHERE la.lead_id=? AND la.workspace_id=?
    ORDER BY la.created_at DESC
  `, [leadId, access.workspace.id]);
  const [audits] = await db.execute<any[]>(`
    SELECT * FROM lead_attribution_audits
    WHERE lead_id=? AND workspace_id=?
    ORDER BY created_at DESC
  `, [leadId, access.workspace.id]);
  return NextResponse.json({ attributions: rows, auditHistory: audits });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: leadId } = await params;
  const body = await request.json().catch(() => ({}));
  const access = await authorizeWorkspacePermission("leads.edit", typeof body.workspaceId === "string" ? body.workspaceId : undefined);
  if (!access) return NextResponse.json({ error: "Unauthorized or workspace access denied" }, { status: 403 });

  const reason = clean(body.reasonNotes, 2000);
  if (!reason) return NextResponse.json({ error: "A reason is required when amending attribution." }, { status: 400 });

  const [rows] = await db.execute<any[]>(`
    SELECT * FROM lead_attributions
    WHERE lead_id=? AND workspace_id=?
    ORDER BY created_at DESC LIMIT 1
  `, [leadId, access.workspace.id]);
  const current = rows[0];
  if (!current) return NextResponse.json({ error: "No attribution record exists for this lead." }, { status: 404 });

  const method = clean(body.attributionMethod, 40) || current.attribution_method || "DIRECT_OFFLINE";
  if (!METHODS.includes(method)) return NextResponse.json({ error: "Choose a valid attribution method." }, { status: 400 });

  const partnerId = body.partnerId === null ? null : clean(body.partnerId, 36) || current.partner_id || null;
  const campaignId = body.campaignId === null ? null : clean(body.campaignId, 36) || current.campaign_id || null;
  const source = clean(body.source, 100) || current.source || null;
  const campaign = clean(body.campaign, 150) || current.campaign || null;

  if (partnerId) {
    if (!campaignId) return NextResponse.json({ error: "A partner attribution must remain linked to a campaign." }, { status: 400 });
    const [partnerRows] = await db.execute<any[]>(`
      SELECT cp.id FROM campaign_partners cp
      JOIN partners p ON p.id=cp.partner_id
      WHERE cp.partner_id=? AND cp.campaign_id=? AND cp.status IN ('APPROVED','ACTIVE','COMPLETED')
        AND p.workspace_id=? AND p.status='ACTIVE' LIMIT 1
    `, [partnerId, campaignId, access.workspace.id]);
    if (!partnerRows[0]) return NextResponse.json({ error: "Selected partner is not an active approved partner for this campaign." }, { status: 400 });
  }

  const before = {
    attributionMethod: current.attribution_method,
    partnerId: current.partner_id,
    campaignId: current.campaign_id,
    source: current.source,
    campaign: current.campaign,
    reasonNotes: current.reason_notes,
    isAmended: Boolean(current.is_amended),
    amendmentCount: Number(current.amendment_count || 0),
  };
  const after = {
    attributionMethod: method,
    partnerId,
    campaignId,
    source,
    campaign,
    reasonNotes: reason,
    isAmended: true,
    amendmentCount: Number(current.amendment_count || 0) + 1,
  };

  await db.execute(`
    UPDATE lead_attributions
    SET attribution_method=?, partner_id=?, campaign_id=?, source=?, campaign=?, reason_notes=?,
        is_amended=TRUE, amended_at=CURRENT_TIMESTAMP, amended_by=?, amendment_count=amendment_count+1
    WHERE id=? AND workspace_id=?
  `, [method, partnerId, campaignId, source, campaign, reason, access.user.email, current.id, access.workspace.id]);

  await db.execute(`
    INSERT INTO lead_attribution_audits
      (id,workspace_id,attribution_id,lead_id,action,actor,reason,before_state,after_state)
    VALUES (?,?,?,?,?,?,?,?,?)
  `, [
    randomUUID(), access.workspace.id, current.id, leadId, "AMEND", access.user.email, reason,
    JSON.stringify(before), JSON.stringify(after)
  ]);

  return NextResponse.json({ ok: true, amendedBy: access.user.email, amendmentCount: after.amendmentCount });
}
