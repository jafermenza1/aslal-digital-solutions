import { NextResponse } from "next/server";
import { authorizePermission } from "@/lib/authorization";
import { db } from "@/lib/db";
import type { RowDataPacket } from "mysql2/promise";

export async function GET() {
  const user = await authorizePermission("partner.portal.view");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [partners] = await db.query<RowDataPacket[]>(
    "SELECT id,workspace_id,partner_number,name FROM partners WHERE id=(SELECT partner_id FROM users WHERE id=?) LIMIT 1",
    [user.id],
  );
  const partner = partners[0];
  if (!partner) return NextResponse.json({ error: "Partner account is not linked." }, { status: 409 });

  const [commissions] = await db.query<RowDataPacket[]>(
    `SELECT c.id,c.amount,c.current_balance,c.currency,c.status,c.eligible_at,c.created_at,
            c.contract_id,c.terms_id,c.qualifying_event,c.attribution_policy,c.attribution_window_days,c.refund_hold_days,
            c.reward_type,c.reward_amount,c.reward_rate,c.commissionable_basis,
            o.order_number,pp.name program_name,pt.version terms_version
       FROM commissions c
       LEFT JOIN orders o ON o.id=c.order_id AND o.workspace_id=c.workspace_id
       LEFT JOIN partner_campaigns pc ON pc.id=(
         SELECT COALESCE(rl.campaign_id,adr.campaign_id) FROM orders oo
         LEFT JOIN referral_links rl ON rl.id=oo.referral_link_id
         LEFT JOIN agent_deal_registrations adr ON adr.id=oo.agent_deal_registration_id
         WHERE oo.id=c.order_id LIMIT 1
       ) AND pc.workspace_id=c.workspace_id
       LEFT JOIN partner_programs pp ON pp.id=pc.program_id AND pp.workspace_id=c.workspace_id
       LEFT JOIN program_terms pt ON pt.id=c.terms_id AND pt.program_id=pp.id
      WHERE c.partner_id=? AND c.workspace_id=?
      ORDER BY c.created_at DESC`,
    [partner.id, partner.workspace_id],
  );

  const [events] = await db.query<RowDataPacket[]>(
    `SELECT e.id,e.commission_id,e.event_type,e.amount_delta,e.balance_after,e.currency,e.reason,
            e.reference_type,e.reference_id,e.actor,e.created_at
       FROM commission_ledger_events e
       JOIN commissions c ON c.id=e.commission_id AND c.workspace_id=e.workspace_id
      WHERE e.workspace_id=? AND c.partner_id=?
      ORDER BY e.created_at DESC,e.id DESC`,
    [partner.workspace_id, partner.id],
  );

  const totals = commissions.reduce((acc: Record<string,string|number>, c: any) => {
    const currency=String(c.currency||"ETB");
    acc[currency] = Number(acc[currency]||0)+Number(c.current_balance||0);
    return acc;
  }, {});

  return NextResponse.json({ partner, totals, commissions, events });
}
