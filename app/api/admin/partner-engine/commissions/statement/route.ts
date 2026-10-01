import { NextResponse } from "next/server";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import { db } from "@/lib/db";
import type { RowDataPacket } from "mysql2/promise";

export async function GET(request: Request) {
  const access = await authorizeWorkspacePermission("payouts.manage");
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const partnerId = url.searchParams.get("partnerId")?.trim() || null;

  const [commissions] = await db.query<RowDataPacket[]>(
    `SELECT c.id,c.partner_id,p.name partner_name,p.partner_number,c.amount,c.current_balance,c.currency,c.status,
            c.eligible_at,c.created_at,c.contract_id,c.terms_id,c.qualifying_event,c.attribution_policy,
            c.attribution_window_days,c.refund_hold_days,c.reward_type,c.reward_amount,c.reward_rate,c.commissionable_basis
       FROM commissions c
       JOIN partners p ON p.id=c.partner_id AND p.workspace_id=c.workspace_id
      WHERE c.workspace_id=? AND (? IS NULL OR c.partner_id=?)
      ORDER BY p.name ASC,c.created_at DESC LIMIT 1000`,
    [access.workspace.id, partnerId, partnerId],
  );

  const [events] = await db.query<RowDataPacket[]>(
    `SELECT e.id,e.commission_id,e.event_type,e.amount_delta,e.balance_after,e.currency,e.reason,
            e.reference_type,e.reference_id,e.actor,e.created_at
       FROM commission_ledger_events e
       JOIN commissions c ON c.id=e.commission_id AND c.workspace_id=e.workspace_id
      WHERE e.workspace_id=? AND (? IS NULL OR c.partner_id=?)
      ORDER BY e.created_at DESC,e.id DESC LIMIT 5000`,
    [access.workspace.id, partnerId, partnerId],
  );

  const summary = commissions.reduce((acc: Record<string, {gross:number;outstanding:number;count:number}>, c: any) => {
    const currency=String(c.currency||"ETB");
    acc[currency] ||= {gross:0,outstanding:0,count:0};
    acc[currency].gross += Number(c.amount||0);
    acc[currency].outstanding += Number(c.current_balance||0);
    acc[currency].count += 1;
    return acc;
  }, {});

  return NextResponse.json({ summary, commissions, events });
}
