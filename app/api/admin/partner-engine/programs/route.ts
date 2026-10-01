import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import type { RowDataPacket } from "mysql2/promise";

const STATUS = new Set(["DRAFT","PUBLISHED","PAUSED","ARCHIVED"]);
const ADMISSION = new Set(["OPEN","VERIFICATION_REQUIRED","BUSINESS_APPROVAL","INVITATION_ONLY"]);
const ATTRIBUTION = new Set(["LAST_CLICK","FIRST_CLICK","LEAD_REGISTRATION","DEAL_REGISTRATION","PROMO_CODE","MANUAL_APPROVAL"]);

export async function GET(request: Request) {
  const workspaceId = new URL(request.url).searchParams.get("workspaceId");
  const access = await authorizeWorkspacePermission("partners.manage", workspaceId);
  if (!access) return NextResponse.json({ error: "Unauthorized or workspace access denied" }, { status: 403 });
  const [programs] = await db.query<RowDataPacket[]>(
    "SELECT pp.*, pt.id terms_id, pt.version terms_version, pt.active terms_active, pt.currency, pt.earnings_description, pt.qualifying_event, pt.attribution_policy, pt.attribution_window_days, pt.refund_hold_days, pt.payout_schedule, pt.minimum_payout, pt.exclusions, (SELECT COUNT(*) FROM commission_contracts cc WHERE cc.program_id=pp.id AND cc.status='ACTIVE') partner_count, (SELECT COUNT(*) FROM partner_campaigns pc WHERE pc.program_id=pp.id) campaign_count FROM partner_programs pp LEFT JOIN program_terms pt ON pt.program_id=pp.id AND pt.active=1 WHERE pp.workspace_id=? ORDER BY pp.created_at DESC LIMIT 250",
    [access.workspace.id]
  );
  return NextResponse.json({ programs });
}

export async function POST(request: Request) {
  const workspaceId = new URL(request.url).searchParams.get("workspaceId") || undefined;
  const actor = await authorizeWorkspacePermission("partners.manage", workspaceId);
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const b = await request.json();
    const name = String(b.name ?? "").trim();
    const slug = String(b.slug ?? name).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0,160);
    const status = String(b.status ?? "DRAFT").toUpperCase();
    const admissionMode = String(b.admissionMode ?? "OPEN").toUpperCase();
    const attributionPolicy = String(b.attributionPolicy ?? "LAST_CLICK").toUpperCase();
    const earningsDescription = String(b.earningsDescription ?? "").trim();
    const qualifyingEvent = String(b.qualifyingEvent ?? "").trim();
    const attributionWindowDays = Number(b.attributionWindowDays ?? 30);
    const refundHoldDays = Number(b.refundHoldDays ?? 0);
    const payoutSchedule = String(b.payoutSchedule ?? "MANUAL").trim().slice(0,80);
    const minimumPayout = Number(b.minimumPayout ?? 0);
    const currency = String(b.currency ?? "ETB").trim().toUpperCase();
    const allowedTypes = Array.isArray(b.allowedPartnerTypes)
      ? b.allowedPartnerTypes.map((v: unknown) => String(v).toUpperCase()).filter((v: string) => ["AGENT","INFLUENCER","AFFILIATE","RESELLER"].includes(v))
      : [];
    if (name.length < 3 || name.length > 190) return NextResponse.json({ error: "Program name must be 3–190 characters." }, { status: 400 });
    if (!slug) return NextResponse.json({ error: "Program slug is required." }, { status: 400 });
    if (!STATUS.has(status) || !ADMISSION.has(admissionMode) || !ATTRIBUTION.has(attributionPolicy)) return NextResponse.json({ error: "Invalid program status, admission mode, or attribution policy." }, { status: 400 });
    if (!earningsDescription || !qualifyingEvent) return NextResponse.json({ error: "Earnings description and qualifying event are required." }, { status: 400 });
    if (!Number.isInteger(attributionWindowDays) || attributionWindowDays < 0 || attributionWindowDays > 3650) return NextResponse.json({ error: "Attribution window must be 0–3650 days." }, { status: 400 });
    if (!Number.isInteger(refundHoldDays) || refundHoldDays < 0 || refundHoldDays > 3650) return NextResponse.json({ error: "Refund hold must be 0–3650 days." }, { status: 400 });
    if (!Number.isFinite(minimumPayout) || minimumPayout < 0) return NextResponse.json({ error: "Minimum payout must be non-negative." }, { status: 400 });
    if (!/^[A-Z]{3}$/.test(currency)) return NextResponse.json({ error: "Currency must be a 3-letter code." }, { status: 400 });

    const id = crypto.randomUUID();
    const termsId = crypto.randomUUID();
    const termsSnapshot = JSON.stringify({ earningsDescription, qualifyingEvent, attributionPolicy, attributionWindowDays, refundHoldDays, payoutSchedule, minimumPayout, currency, allowedPartnerTypes: allowedTypes });
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const [existing] = await conn.query<RowDataPacket[]>("SELECT id FROM partner_programs WHERE workspace_id=? AND slug=? LIMIT 1 FOR UPDATE", [actor.workspace.id, slug]);
      if (existing[0]) {
        await conn.rollback();
        return NextResponse.json({ error: "A program with this slug already exists in this workspace." }, { status: 409 });
      }
      await conn.query("INSERT INTO partner_programs (workspace_id,id,name,slug,description,status,admission_mode,allowed_partner_types,published_at,created_by) VALUES (?,?,?,?,?,?,?,?,?,?)", [actor.workspace.id,id,name,slug,String(b.description ?? "").trim() || null,status,admissionMode,allowedTypes.join(","),status === "PUBLISHED" ? new Date() : null,actor.user.email]);
      await conn.query("INSERT INTO program_terms (id,program_id,version,active,currency,earnings_description,qualifying_event,attribution_policy,attribution_window_days,refund_hold_days,payout_schedule,minimum_payout,exclusions,terms_snapshot,published_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [termsId,id,1,status === "PUBLISHED",currency,earningsDescription,qualifyingEvent,attributionPolicy,attributionWindowDays,refundHoldDays,payoutSchedule,minimumPayout,String(b.exclusions ?? "").trim() || null,termsSnapshot,status === "PUBLISHED" ? new Date() : null]);
      await conn.commit();
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
    return NextResponse.json({ ok: true, id, termsId }, { status: 201 });
  } catch (error) {
    console.error("PARTNER_PROGRAM_CREATE_ERROR", error);
    return NextResponse.json({ error: "Could not create partner program." }, { status: 500 });
  }
}
