import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import type { RowDataPacket } from "mysql2/promise";

const MANUAL_STATUS = "PENDING";

type PartnerRow = RowDataPacket & { id: string; name: string; status: string };
type LeadRow = RowDataPacket & { id: string; name: string; company: string | null; status: string; deal_value: number | string | null };
type LinkRow = RowDataPacket & { id: string; code: string; partner_id: string; partner_name: string };
type CommissionRow = RowDataPacket & { id: string; partner_id: string; partner_name: string; lead_id: string | null; lead_name: string | null; referral_link_id: string | null; referral_code: string | null; amount: number | string; currency: string; status: string; created_at: Date };

export async function GET() {
  const access = await authorizeWorkspacePermission("partners.manage");
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { workspace } = access;

  const [[partners], [leads], [links], [commissions]] = await Promise.all([
    db.query<PartnerRow[]>(`SELECT id,name,status FROM partners WHERE workspace_id=? ORDER BY status='ACTIVE' DESC,name ASC LIMIT 500`, [workspace.id]),
    db.query<LeadRow[]>(`SELECT id,name,company,status,deal_value FROM leads WHERE workspace_id=? ORDER BY created_at DESC LIMIT 250`, [workspace.id]),
    db.query<LinkRow[]>(`SELECT rl.id,rl.code,rl.partner_id,p.name partner_name FROM referral_links rl INNER JOIN partners p ON p.id=rl.partner_id WHERE rl.workspace_id=? AND p.workspace_id=? ORDER BY rl.created_at DESC LIMIT 500`, [workspace.id, workspace.id]),
    db.query<CommissionRow[]>(`SELECT c.id,c.partner_id,p.name partner_name,c.lead_id,l.name lead_name,c.referral_link_id,rl.code referral_code,c.amount,c.currency,c.status,c.created_at FROM commissions c INNER JOIN partners p ON p.id=c.partner_id LEFT JOIN leads l ON l.id=c.lead_id AND l.workspace_id=c.workspace_id LEFT JOIN referral_links rl ON rl.id=c.referral_link_id AND rl.workspace_id=c.workspace_id WHERE c.workspace_id=? AND p.workspace_id=? ORDER BY c.created_at DESC LIMIT 100`, [workspace.id, workspace.id]),
  ]);

  return NextResponse.json({ partners, leads, links, commissions });
}

export async function POST(request: Request) {
  const access = await authorizeWorkspacePermission("partners.manage");
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { workspace } = access;

  try {
    const body = await request.json();
    const partnerId = String(body.partnerId ?? "").trim();
    const leadId = String(body.leadId ?? "").trim() || null;
    const referralLinkId = String(body.referralLinkId ?? "").trim() || null;
    const currency = String(body.currency ?? "ETB").trim().toUpperCase();
    const amountText = String(body.amount ?? "").trim();
    const amount = Number(amountText);

    if (!partnerId) return NextResponse.json({ error: "Partner is required." }, { status: 400 });
    if (!Number.isFinite(amount) || amount <= 0 || amount > 999999999999.99 || !/^\d+(\.\d{1,2})?$/.test(amountText)) {
      return NextResponse.json({ error: "Amount must be a positive number with up to 2 decimals." }, { status: 400 });
    }
    if (!/^[A-Z]{3}$/.test(currency)) return NextResponse.json({ error: "Currency must be a 3-letter code." }, { status: 400 });

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const [partnerRows] = await connection.query<PartnerRow[]>(`SELECT id,status FROM partners WHERE id=? AND workspace_id=? LIMIT 1`, [partnerId, workspace.id]);
      if (!partnerRows[0]) {
        await connection.rollback();
        return NextResponse.json({ error: "Partner not found." }, { status: 404 });
      }

      if (leadId) {
        const [leadRows] = await connection.query<RowDataPacket[]>(`SELECT id,workspace_id FROM leads WHERE id=? AND workspace_id=? LIMIT 1`, [leadId, workspace.id]);
        if (!leadRows[0]) {
          await connection.rollback();
          return NextResponse.json({ error: "Lead not found in this workspace." }, { status: 404 });
        }
      }

      if (referralLinkId) {
        const [linkRows] = await connection.query<RowDataPacket[]>(`SELECT id,partner_id,workspace_id FROM referral_links WHERE id=? AND partner_id=? AND workspace_id=? LIMIT 1`, [referralLinkId, partnerId, workspace.id]);
        if (!linkRows[0]) {
          await connection.rollback();
          return NextResponse.json({ error: "Referral link not found for this partner in this workspace." }, { status: 400 });
        }
      }

      // Manual commissions always start PENDING. QUALIFIED/APPROVED/PAYABLE/PAID
      // must be reached from the reconciled-payment/revenue state machine.
      const commissionId = crypto.randomUUID();
      await connection.query(
        `INSERT INTO commissions (id,workspace_id,partner_id,lead_id,referral_link_id,amount,currency,status) VALUES (?,?,?,?,?,?,?,?)`,
        [commissionId, workspace.id, partnerId, leadId, referralLinkId, amount.toFixed(2), currency, MANUAL_STATUS],
      );
      await connection.commit();
      return NextResponse.json({ ok: true, id: commissionId, status: MANUAL_STATUS }, { status: 201 });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("COMMISSION_CREATE_ERROR", error);
    return NextResponse.json({ error: "Could not create commission." }, { status: 500 });
  }
}
