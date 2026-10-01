import { NextResponse } from "next/server";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import { db } from "@/lib/db";
import { appendCommissionLedgerEvent } from "@/lib/commission-ledger";
import type { RowDataPacket } from "mysql2/promise";

const ACTIONS = new Set(["APPROVE","MARK_PAYABLE","ADJUST","REVERSE","REFUND","CHARGEBACK","VOID"]);

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await authorizeWorkspacePermission("payouts.manage");
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT c.*,p.name partner_name,o.order_number,r.status revenue_status,pm.status payment_status,pm.reconciliation_status
       FROM commissions c
       JOIN partners p ON p.id=c.partner_id AND p.workspace_id=c.workspace_id
       LEFT JOIN orders o ON o.id=c.order_id AND o.workspace_id=c.workspace_id
       LEFT JOIN revenues r ON r.id=c.revenue_id AND r.workspace_id=c.workspace_id
       LEFT JOIN payments pm ON pm.id=c.payment_id AND pm.workspace_id=c.workspace_id
      WHERE c.id=? AND c.workspace_id=? LIMIT 1`,
    [id, access.workspace.id],
  );
  if (!rows[0]) return NextResponse.json({ error: "Commission not found." }, { status: 404 });
  const [events] = await db.query<RowDataPacket[]>(
    "SELECT * FROM commission_ledger_events WHERE commission_id=? AND workspace_id=? ORDER BY created_at ASC,id ASC",
    [id, access.workspace.id],
  );
  return NextResponse.json({ commission: rows[0], events });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await authorizeWorkspacePermission("payouts.manage");
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const actor = access.user.email;
  const body = await request.json();
  const action = String(body.action ?? "").toUpperCase();
  const reason = String(body.reason ?? "").trim();
  const idempotencyKey = String(body.idempotencyKey ?? "").trim();
  const delta = Number(body.amountDelta ?? 0);

  if (!ACTIONS.has(action)) return NextResponse.json({ error: "Unsupported commission ledger action." }, { status: 400 });
  if (reason.length < 5) return NextResponse.json({ error: "A reason of at least 5 characters is required." }, { status: 400 });
  if (!idempotencyKey || idempotencyKey.length > 255) return NextResponse.json({ error: "A unique idempotencyKey is required." }, { status: 400 });
  if (action === "ADJUST" && (!Number.isFinite(delta) || delta === 0)) {
    return NextResponse.json({ error: "ADJUST requires a non-zero amountDelta." }, { status: 400 });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.query<RowDataPacket[]>(
      `SELECT c.id,c.partner_id,c.workspace_id,c.status,c.current_balance,c.currency,c.eligible_at,c.payment_id,c.revenue_id,
              pm.status payment_status,pm.reconciliation_status,r.status revenue_status
         FROM commissions c
         LEFT JOIN payments pm ON pm.id=c.payment_id AND pm.workspace_id=c.workspace_id
         LEFT JOIN revenues r ON r.id=c.revenue_id AND r.workspace_id=c.workspace_id
        WHERE c.id=? AND c.workspace_id=? FOR UPDATE`,
      [id, access.workspace.id],
    );
    const c = rows[0];
    if (!c) return NextResponse.json({ error: "Commission not found." }, { status: 404 });

    const current = Number(c.current_balance);
    if (["REVERSE","REFUND","CHARGEBACK","VOID","ADJUST"].includes(action) && String(c.status) === "PAID") {
      throw new Error("A PAID commission cannot be mutated through the commission ledger.");
    }
    if (action === "APPROVE" && !["QUALIFIED","APPROVED"].includes(String(c.status))) {
      throw new Error("Only QUALIFIED commissions can be approved.");
    }
    if (action === "MARK_PAYABLE" && !["QUALIFIED","APPROVED"].includes(String(c.status))) {
      throw new Error("Only QUALIFIED or APPROVED commissions can become PAYABLE.");
    }
    let eventType: string;
    let amountDelta = 0;
    let nextStatus: string = String(c.status);

    if (action === "APPROVE") { eventType = "APPROVED"; nextStatus = "APPROVED"; }
    else if (action === "MARK_PAYABLE") {
      if (c.payment_status !== "CONFIRMED" || c.reconciliation_status !== "RECONCILED" || c.revenue_status !== "RECOGNIZED") {
        throw new Error("Commission can become PAYABLE only after confirmed, reconciled payment and recognized revenue.");
      }
      if (c.eligible_at && new Date(c.eligible_at).getTime() > Date.now()) throw new Error("Commission is still within its refund hold.");
      const [disputes] = await conn.query<RowDataPacket[]>(
        "SELECT id FROM partner_disputes WHERE commission_id=? AND workspace_id=? AND status IN ('OPEN','UNDER_REVIEW') LIMIT 1",
        [id, access.workspace.id],
      );
      if (disputes[0]) throw new Error("Commission has an open dispute and cannot become PAYABLE.");
      eventType = "PAYABLE"; nextStatus = "PAYABLE";
    } else if (action === "ADJUST") { eventType = "ADJUSTED"; amountDelta = delta; nextStatus = current + delta > 0 ? "QUALIFIED" : "VOID"; }
    else {
      eventType = action === "REFUND" ? "REFUNDED" : action === "CHARGEBACK" ? "CHARGEBACK" : action === "REVERSE" ? "REVERSED" : "VOID";
      amountDelta = -current;
      nextStatus = "VOID";
    }

    const key = idempotencyKey;
    const result = await appendCommissionLedgerEvent(conn, {
      commissionId: id,
      workspaceId: access.workspace.id,
      eventType: eventType as any,
      amountDelta,
      reason,
      referenceType: "ADMIN_ACTION",
      referenceId: id,
      idempotencyKey: key,
      actor,
      metadata: { action },
    });
    await conn.query("UPDATE commissions SET status=? WHERE id=? AND workspace_id=?", [nextStatus, id, access.workspace.id]);
    await conn.commit();
    return NextResponse.json({ ok: true, action, eventId: result.eventId, balanceAfter: result.balanceAfter, status: nextStatus });
  } catch (error) {
    await conn.rollback();
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update commission ledger." }, { status: 409 });
  } finally {
    conn.release();
  }
}
