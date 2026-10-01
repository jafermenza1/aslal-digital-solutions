import { randomUUID } from "crypto";
import type { PoolConnection, RowDataPacket } from "mysql2/promise";
import { appendCommissionLedgerEvent } from "@/lib/commission-ledger";
import { getPayoutProviderAdapter, type PayoutProvider } from "@/lib/payout-providers";

export async function createPayoutExecution(
  conn: PoolConnection,
  input: { workspaceId:string; payoutId:string; provider:PayoutProvider; idempotencyKey:string; }
) {
  const [existing] = await conn.query<RowDataPacket[]>(
    "SELECT id,status,provider_transaction_id FROM payout_executions WHERE idempotency_key=? LIMIT 1",
    [input.idempotencyKey],
  );
  if (existing[0]) return existing[0];

  const [payoutRows] = await conn.query<RowDataPacket[]>(
    "SELECT * FROM partner_payouts WHERE id=? AND workspace_id=? FOR UPDATE",
    [input.payoutId,input.workspaceId],
  );
  const payout=payoutRows[0];
  if(!payout) throw new Error("Payout not found.");
  if(["PAID","CANCELLED"].includes(String(payout.status))) throw new Error("Payout is already terminal.");

  await getPayoutProviderAdapter(input.provider).validate({
    payoutId:payout.id, amount:String(payout.amount), currency:payout.currency,
    idempotencyKey:input.idempotencyKey,
  });

  const id=randomUUID();
  await conn.query(
    `INSERT INTO payout_executions
      (id,workspace_id,payout_id,provider,status,attempt,idempotency_key)
     VALUES (?,?,?,?, 'QUEUED',0,?)`,
    [id,input.workspaceId,input.payoutId,input.provider,input.idempotencyKey],
  );
  await conn.query(
    "UPDATE partner_payouts SET provider=?,execution_status='QUEUED' WHERE id=? AND workspace_id=?",
    [input.provider,input.payoutId,input.workspaceId],
  );
  return { id,status:"QUEUED" };
}

export async function confirmManualPayout(
  conn: PoolConnection,
  input: { workspaceId:string; payoutId:string; actor:string; reference:string; notes?:string; evidenceUrl?:string; }
) {
  const [rows]=await conn.query<RowDataPacket[]>(
    "SELECT * FROM partner_payouts WHERE id=? AND workspace_id=? FOR UPDATE",
    [input.payoutId,input.workspaceId],
  );
  const payout=rows[0];
  if(!payout) throw new Error("Payout not found.");
  if(payout.provider !== "MANUAL") throw new Error("Use provider verification for non-manual payouts.");
  if(payout.status === "PAID") return { alreadyPaid:true };
  if(!input.reference.trim()) throw new Error("Manual payment reference is required.");

  const [items]=await conn.query<RowDataPacket[]>(
    "SELECT commission_id,amount FROM partner_payout_items WHERE payout_id=? FOR UPDATE",
    [payout.id],
  );
  for(const item of items) {
    const [cRows]=await conn.query<RowDataPacket[]>(
      "SELECT id,current_balance,currency,status FROM commissions WHERE id=? AND workspace_id=? FOR UPDATE",
      [item.commission_id,input.workspaceId],
    );
    const c=cRows[0];
    if(!c || Number(c.current_balance) < Number(item.amount)-0.01) throw new Error("Payout item exceeds commission balance.");
    const key=`manual-payout-paid:${payout.id}:${c.id}`;
    await appendCommissionLedgerEvent(conn,{
      commissionId:c.id,workspaceId:input.workspaceId,eventType:"PAID",
      amountDelta:-Number(item.amount),reason:"Manual payout verified by finance",
      referenceType:"PAYOUT",referenceId:payout.id,idempotencyKey:key,actor:input.actor,
    });
    await conn.query("UPDATE commissions SET status='PAID' WHERE id=? AND workspace_id=?",[c.id,input.workspaceId]);
  }

  await conn.query(
    `INSERT INTO payout_verifications
      (id,workspace_id,payout_id,status,method,reference,evidence_url,notes,verified_by,verified_at)
     VALUES (?,?,?,?,?,?,?,?,?,NOW())
     ON DUPLICATE KEY UPDATE status='VERIFIED',method='MANUAL',reference=VALUES(reference),
       evidence_url=VALUES(evidence_url),notes=VALUES(notes),verified_by=VALUES(verified_by),verified_at=NOW()`,
    [randomUUID(),input.workspaceId,payout.id,"VERIFIED","MANUAL",input.reference.trim(),input.evidenceUrl||null,input.notes||null,input.actor],
  );
  await conn.query(
    "UPDATE partner_payouts SET status='PAID',execution_status='CONFIRMED',reference=?,notes=?,paid_at=NOW(),verified_at=NOW(),verified_by=? WHERE id=? AND workspace_id=?",
    [input.reference.trim(),input.notes||null,input.actor,payout.id,input.workspaceId],
  );
  return { paid:true };
}
