import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import type { RowDataPacket } from "mysql2/promise";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const workspaceId = new URL(request.url).searchParams.get("workspaceId") || undefined;
  const actor = await authorizeWorkspacePermission("partners.manage", workspaceId);
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const b = await request.json();
    const earningsDescription = String(b.earningsDescription ?? "").trim();
    const qualifyingEvent = String(b.qualifyingEvent ?? "").trim();
    const attributionPolicy = String(b.attributionPolicy ?? "LAST_CLICK").toUpperCase();
    const attributionWindowDays = Number(b.attributionWindowDays ?? 30);
    const refundHoldDays = Number(b.refundHoldDays ?? 0);
    const payoutSchedule = String(b.payoutSchedule ?? "MANUAL").trim().slice(0,80);
    const minimumPayout = Number(b.minimumPayout ?? 0);
    const currency = String(b.currency ?? "ETB").trim().toUpperCase();
    const exclusions = String(b.exclusions ?? "").trim() || null;

    if (!earningsDescription || !qualifyingEvent) return NextResponse.json({ error: "Earnings description and qualifying event are required." }, { status: 400 });
    if (!["LAST_CLICK","FIRST_CLICK","LEAD_REGISTRATION","DEAL_REGISTRATION","PROMO_CODE","MANUAL_APPROVAL"].includes(attributionPolicy)) return NextResponse.json({ error: "Invalid attribution policy." }, { status: 400 });
    if (!Number.isInteger(attributionWindowDays) || attributionWindowDays < 0 || attributionWindowDays > 3650) return NextResponse.json({ error: "Attribution window must be 0–3650 days." }, { status: 400 });
    if (!Number.isInteger(refundHoldDays) || refundHoldDays < 0 || refundHoldDays > 3650) return NextResponse.json({ error: "Refund hold must be 0–3650 days." }, { status: 400 });
    if (!Number.isFinite(minimumPayout) || minimumPayout < 0 || !/^[A-Z]{3}$/.test(currency)) return NextResponse.json({ error: "Invalid payout or currency values." }, { status: 400 });

    const [programs] = await db.query<RowDataPacket[]>("SELECT id FROM partner_programs WHERE id=? AND workspace_id=? LIMIT 1", [id, actor.workspace.id]);
    if (!programs[0]) return NextResponse.json({ error: "Program not found." }, { status: 404 });

    const termsId = crypto.randomUUID();
    const snapshot = JSON.stringify({ earningsDescription, qualifyingEvent, attributionPolicy, attributionWindowDays, refundHoldDays, payoutSchedule, minimumPayout, currency, exclusions });

    const conn = await db.getConnection();
    let version = 0;
    try {
      await conn.beginTransaction();
      const [versions] = await conn.query<RowDataPacket[]>("SELECT COALESCE(MAX(version),0) version FROM program_terms WHERE program_id=? FOR UPDATE", [id]);
      version = Number(versions[0]?.version ?? 0) + 1;
      await conn.query("UPDATE program_terms SET active=0 WHERE program_id=?", [id]);
      await conn.query("INSERT INTO program_terms (id,program_id,version,active,currency,earnings_description,qualifying_event,attribution_policy,attribution_window_days,refund_hold_days,payout_schedule,minimum_payout,exclusions,terms_snapshot,published_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [termsId,id,version,true,currency,earningsDescription,qualifyingEvent,attributionPolicy,attributionWindowDays,refundHoldDays,payoutSchedule,minimumPayout,exclusions,snapshot,new Date()]);
      await conn.query("UPDATE partner_programs SET status=CASE WHEN status='DRAFT' THEN 'PUBLISHED' ELSE status END, published_at=COALESCE(published_at,NOW()) WHERE id=?", [id]);
      await conn.commit();
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }

    return NextResponse.json({ ok: true, id: termsId, version });
  } catch (error) {
    console.error("PARTNER_PROGRAM_TERMS_CREATE_ERROR", error);
    return NextResponse.json({ error: "Could not publish program terms." }, { status: 500 });
  }
}
