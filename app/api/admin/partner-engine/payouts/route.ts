import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { randomUUID } from "crypto";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import type { RowDataPacket } from "mysql2/promise";

const STATUS = new Set(["PENDING", "APPROVED", "PAID", "FAILED", "VOID"]);

export async function GET() {
  const access = await authorizeWorkspacePermission("payouts.manage");
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [rows] = await db.query<RowDataPacket[]>(`
    SELECT pp.id,pp.partner_id,p.name partner_name,pp.amount,pp.currency,pp.status,pp.reference,pp.notes,pp.paid_at,pp.created_at,
           (SELECT COUNT(*) FROM partner_payout_items pi WHERE pi.payout_id=pp.id) commission_count
    FROM partner_payouts pp
    JOIN partners p ON p.id=pp.partner_id AND p.workspace_id=pp.workspace_id
    WHERE pp.workspace_id=?
    ORDER BY pp.created_at DESC LIMIT 250
  `, [access.workspace.id]);

  const [payableCommissions] = await db.query<RowDataPacket[]>(`
    SELECT c.id,c.partner_id,p.name partner_name,c.amount,c.currency,c.status,c.eligible_at,o.order_number,c.created_at
    FROM commissions c
    JOIN partners p ON p.id=c.partner_id AND p.workspace_id=c.workspace_id
    LEFT JOIN orders o ON o.id=c.order_id AND o.workspace_id=c.workspace_id
    LEFT JOIN partner_payout_items pi ON pi.commission_id=c.id
    LEFT JOIN revenues r ON r.id=c.revenue_id AND r.workspace_id=c.workspace_id
    LEFT JOIN payments pm ON pm.id=c.payment_id AND pm.workspace_id=c.workspace_id
    WHERE c.workspace_id=? AND c.status="PAYABLE" AND pi.id IS NULL
      AND r.status="RECOGNIZED" AND pm.status="CONFIRMED" AND pm.reconciliation_status="RECONCILED"
      AND (c.eligible_at IS NULL OR c.eligible_at<=NOW())
      AND NOT EXISTS (
        SELECT 1 FROM partner_disputes d
        WHERE d.workspace_id=c.workspace_id
          AND d.commission_id=c.id
          AND d.status IN ("OPEN","UNDER_REVIEW")
      )
    ORDER BY p.name ASC,c.created_at ASC LIMIT 500
  `, [access.workspace.id]);

  return NextResponse.json({ payouts: rows, payableCommissions });
}

export async function POST(request: Request) {
  const access = await authorizeWorkspacePermission("payouts.manage");
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const actor = access.user;

  try {
    const b = await request.json();
    const partnerId = String(b.partnerId ?? "").trim();
    const status = String(b.status ?? "PENDING").toUpperCase();
    const currency = String(b.currency ?? "ETB").toUpperCase();
    const requestedAmount = Number(b.amount ?? 0);
    const reference = String(b.reference ?? "").trim() || null;
    const notes = String(b.notes ?? "").trim() || null;
    const commissionIds = Array.isArray(b.commissionIds)
      ? [...new Set(b.commissionIds.map((x: unknown) => String(x).trim()).filter(Boolean))]
      : [];

    if (!partnerId || !STATUS.has(status) || !Number.isFinite(requestedAmount) || requestedAmount < 0 || requestedAmount > 999999999999.99) {
      return NextResponse.json({ error: "Partner, valid status and payout amount are required." }, { status: 400 });
    }
    if (!/^[A-Z]{3}$/.test(currency)) return NextResponse.json({ error: "Currency must be a 3-letter code." }, { status: 400 });
    if (status === "PAID" && !commissionIds.length) {
      return NextResponse.json({ error: "A PAID payout must identify the payable commissions it settles." }, { status: 400 });
    }

    const [partners] = await db.query<RowDataPacket[]>(
      `SELECT id,workspace_id FROM partners WHERE id=? AND workspace_id=? LIMIT 1`,
      [partnerId, access.workspace.id],
    );
    if (!partners[0]) return NextResponse.json({ error: "Partner not found in this workspace." }, { status: 404 });

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      let payoutAmount = requestedAmount;

      if (commissionIds.length) {
        const placeholders = commissionIds.map(() => "?").join(",");
        const [rows] = await conn.query<RowDataPacket[]>(
          `SELECT c.id,c.amount,c.current_balance,c.partner_id,c.currency,c.status,c.eligible_at,c.workspace_id,pi.id payout_item_id,
                  r.status revenue_status,pm.status payment_status,pm.reconciliation_status
           FROM commissions c
           LEFT JOIN partner_payout_items pi ON pi.commission_id=c.id
           LEFT JOIN revenues r ON r.id=c.revenue_id AND r.workspace_id=c.workspace_id
           LEFT JOIN payments pm ON pm.id=c.payment_id AND pm.workspace_id=c.workspace_id
           WHERE c.id IN (${placeholders}) AND c.workspace_id=? FOR UPDATE`,
          [...commissionIds, access.workspace.id],
        );
        if (rows.length !== commissionIds.length) {
          const error = new Error("One or more commission records were not found in this workspace.") as Error & { status?: number };
          error.status = 404;
          throw error;
        }
        if (rows.some((x) => String(x.partner_id) !== partnerId)) throw new Error("All selected commissions must belong to the selected partner.");
        if (rows.some((x) => String(x.currency) !== currency)) throw new Error("All selected commissions must use the payout currency.");
        if (rows.some((x) => x.status !== "PAYABLE")) throw new Error("Only PAYABLE commissions can be included in a payout.");
        if (rows.some((x) => Number(x.current_balance) <= 0)) throw new Error("Only commissions with an outstanding ledger balance can be paid.");
        if (rows.some((x) => x.eligible_at && new Date(x.eligible_at).getTime() > Date.now())) throw new Error("One or more commissions are still within the published refund hold.");
        if (rows.some((x) => x.payout_item_id)) throw new Error("One or more selected commissions are already attached to a payout.");
        if (rows.some((x) => x.revenue_status !== "RECOGNIZED" || x.payment_status !== "CONFIRMED" || x.reconciliation_status !== "RECONCILED")) {
          throw new Error("Every commission must have confirmed, reconciled payment and recognized revenue before payout.");
        }
        payoutAmount = rows.reduce((sum, x) => sum + Number(x.amount), 0);
      }

      if (!Number.isFinite(payoutAmount) || payoutAmount <= 0) throw new Error("Payout amount must be positive.");

      const id = crypto.randomUUID();
      await conn.query(
        `INSERT INTO partner_payouts (id,workspace_id,partner_id,amount,currency,status,reference,notes,paid_at)
         VALUES (?,?,?,?,?,?,?,?,?)`,
        [id, access.workspace.id, partnerId, payoutAmount.toFixed(2), currency, status, reference, notes, status === "PAID" ? new Date() : null],
      );

      for (const commissionId of commissionIds) {
        const [rows] = await conn.query<RowDataPacket[]>(
          `SELECT amount,current_balance FROM commissions WHERE id=? AND workspace_id=? AND partner_id=? LIMIT 1`,
          [commissionId, access.workspace.id, partnerId],
        );
        if (!rows[0]) throw new Error("A selected commission no longer belongs to this workspace/partner.");
        await conn.query(
          `INSERT INTO partner_payout_items (id,payout_id,commission_id,amount) VALUES (?,?,?,?)`,
          [randomUUID(), id, commissionId, Number(rows[0].current_balance).toFixed(2)],
        );
      }

      if (status === "PAID") {
        for (const commissionId of commissionIds) {
          const [commissionRows] = await conn.query<RowDataPacket[]>(
            "SELECT current_balance,currency FROM commissions WHERE id=? AND workspace_id=? AND partner_id=? FOR UPDATE",
            [commissionId, access.workspace.id, partnerId],
          );
          const balance = Number(commissionRows[0]?.current_balance ?? 0);
          if (balance <= 0) throw new Error("A selected commission has no outstanding balance.");
          const key = `commission-paid:${commissionId}:${id}`;
          await conn.query(
            `INSERT INTO commission_ledger_events
              (id,workspace_id,commission_id,event_type,amount_delta,balance_after,currency,reason,reference_type,reference_id,idempotency_key,actor)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
            [randomUUID(), access.workspace.id, commissionId, "PAID", (-balance).toFixed(2), "0.00", commissionRows[0].currency,
             "Commission settled in a confirmed partner payout", "PAYOUT", id, key, actor.email],
          );
          await conn.query(
            `UPDATE commissions SET status="PAID",current_balance=0 WHERE workspace_id=? AND id=? AND status="PAYABLE"`,
            [access.workspace.id, commissionId],
          );
        }
      }

      await conn.commit();
      return NextResponse.json({ ok: true, id, amount: payoutAmount, commissionCount: commissionIds.length, createdBy: actor.email }, { status: 201 });
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error("PARTNER_PAYOUT_CREATE_ERROR", error);
    const status = error instanceof Error && "status" in error ? Number((error as Error & { status?: number }).status) || 500 : 500;
    const message = error instanceof Error ? error.message : "Could not create payout record.";
    return NextResponse.json({ error: message }, { status });
  }
}
