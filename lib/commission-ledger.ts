import type { PoolConnection, RowDataPacket } from "mysql2/promise";
import { randomUUID } from "crypto";

export type CommissionLedgerEventType =
  | "EARNED" | "ADJUSTED" | "REVERSED" | "APPROVED"
  | "PAYABLE" | "PAID" | "REFUNDED" | "CHARGEBACK" | "VOID";

type LedgerInput = {
  commissionId: string;
  workspaceId: string;
  eventType: CommissionLedgerEventType;
  amountDelta?: number;
  reason?: string | null;
  referenceType?: string | null;
  referenceId?: string | null;
  idempotencyKey: string;
  actor?: string | null;
  metadata?: unknown;
};

export async function appendCommissionLedgerEvent(conn: PoolConnection, input: LedgerInput) {
  const delta = Number(input.amountDelta ?? 0);
  if (!Number.isFinite(delta)) throw new Error("Commission ledger amount must be finite.");

  const [existing] = await conn.query<RowDataPacket[]>(
    "SELECT id,commission_id,workspace_id,amount,current_balance,currency FROM commissions WHERE id=? AND workspace_id=? FOR UPDATE",
    [input.commissionId, input.workspaceId],
  );
  if (!existing[0]) throw new Error("Commission not found in this workspace.");

  const [dupe] = await conn.query<RowDataPacket[]>(
    "SELECT id,balance_after,event_type,amount_delta FROM commission_ledger_events WHERE idempotency_key=? LIMIT 1",
    [input.idempotencyKey],
  );
  if (dupe[0]) return { eventId: dupe[0].id, balanceAfter: Number(dupe[0].balance_after), duplicate: true };

  const current = Number(existing[0].current_balance ?? existing[0].amount ?? 0);
  const next = current + delta;
  if (next < -0.01) throw new Error("Commission ledger cannot create a negative outstanding balance.");

  const eventId = randomUUID();
  await conn.query(
    `INSERT INTO commission_ledger_events
      (id,workspace_id,commission_id,event_type,amount_delta,balance_after,currency,reason,reference_type,reference_id,idempotency_key,actor,metadata)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      eventId, input.workspaceId, input.commissionId, input.eventType, delta.toFixed(2), next.toFixed(2),
      existing[0].currency, input.reason || null, input.referenceType || null, input.referenceId || null,
      input.idempotencyKey, input.actor || null, input.metadata ? JSON.stringify(input.metadata) : null,
    ],
  );

  await conn.query(
    "UPDATE commissions SET current_balance=? WHERE id=? AND workspace_id=?",
    [next.toFixed(2), input.commissionId, input.workspaceId],
  );

  return { eventId, balanceAfter: next, duplicate: false };
}

export async function seedCommissionEarnedEvent(
  conn: PoolConnection,
  commission: { id: string; workspaceId: string; amount: number; currency: string },
  actor = "SYSTEM",
) {
  const [dupe] = await conn.query<RowDataPacket[]>(
    "SELECT id,balance_after FROM commission_ledger_events WHERE idempotency_key=? LIMIT 1",
    [`commission-earned:${commission.id}`],
  );
  if (dupe[0]) return dupe[0];

  await conn.query(
    `INSERT INTO commission_ledger_events
      (id,workspace_id,commission_id,event_type,amount_delta,balance_after,currency,reason,reference_type,reference_id,idempotency_key,actor)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      randomUUID(), commission.workspaceId, commission.id, "EARNED",
      Number(commission.amount).toFixed(2), Number(commission.amount).toFixed(2), commission.currency,
      "Commission earned from the qualifying commercial event", "COMMISSION", commission.id,
      `commission-earned:${commission.id}`, actor,
    ],
  );
  return { balance_after: Number(commission.amount) };
}

export async function getCommissionStatement(conn: PoolConnection, workspaceId: string, partnerId: string) {
  const [rows] = await conn.query<RowDataPacket[]>(
    `SELECT c.id,c.partner_id,c.amount,c.current_balance,c.currency,c.status,c.eligible_at,c.created_at,
            c.contract_id,c.terms_id,c.qualifying_event,c.attribution_policy,c.attribution_window_days,c.refund_hold_days,
            c.reward_type,c.reward_amount,c.reward_rate,c.commissionable_basis
       FROM commissions c
      WHERE c.workspace_id=? AND c.partner_id=?
      ORDER BY c.created_at DESC`,
    [workspaceId, partnerId],
  );
  const [events] = await conn.query<RowDataPacket[]>(
    `SELECT e.id,e.commission_id,e.event_type,e.amount_delta,e.balance_after,e.currency,e.reason,
            e.reference_type,e.reference_id,e.actor,e.created_at
       FROM commission_ledger_events e
      JOIN commissions c ON c.id=e.commission_id AND c.workspace_id=e.workspace_id
      WHERE e.workspace_id=? AND c.partner_id=?
      ORDER BY e.created_at ASC,e.id ASC`,
    [workspaceId, partnerId],
  );
  return { commissions: rows, events };
}
