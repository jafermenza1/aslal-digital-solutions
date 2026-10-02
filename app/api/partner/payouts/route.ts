import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authorizePermission } from "@/lib/authorization";
import type { RowDataPacket } from "mysql2/promise";
export async function GET(){
 const user=await authorizePermission("partner.portal.view");if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
 const [u]=await db.query<(RowDataPacket&{partner_id:string|null})[]>(`SELECT partner_id FROM users WHERE id=? LIMIT 1`,[user.id]);const pid=u[0]?.partner_id;if(!pid)return NextResponse.json({error:"Partner account is not linked."},{status:409});
 const [payouts]=await db.query<RowDataPacket[]>(`SELECT id,amount,currency,status,reference,notes,paid_at,created_at FROM partner_payouts WHERE partner_id=? AND workspace_id=(SELECT workspace_id FROM partners WHERE id=?) ORDER BY created_at DESC LIMIT 100`,[pid,pid]);
 const [commissions]=await db.query<RowDataPacket[]>(`
   SELECT c.id,c.amount,c.currency,c.status,c.created_at,c.eligible_at,c.order_id,c.payment_id,
          rl.code referral_code,o.order_number,pm.status payment_status,pm.reconciliation_status,
          pp.id program_id,pp.name program_name,pt.version terms_version,pt.attribution_policy,
          pt.attribution_window_days,pt.refund_hold_days,pt.qualifying_event,pt.payout_schedule,
          pc.reward_type,pc.reward_amount,pc.reward_rate
   FROM commissions c
   LEFT JOIN referral_links rl ON rl.id=c.referral_link_id AND rl.workspace_id=c.workspace_id
   LEFT JOIN orders o ON o.id=c.order_id AND o.workspace_id=c.workspace_id
   LEFT JOIN payments pm ON pm.id=c.payment_id AND pm.workspace_id=c.workspace_id
   LEFT JOIN partner_campaigns pc ON pc.id=rl.campaign_id AND pc.workspace_id=c.workspace_id
   LEFT JOIN partner_programs pp ON pp.id=pc.program_id AND pp.workspace_id=c.workspace_id
   LEFT JOIN program_terms pt ON pt.program_id=pc.program_id AND pt.active=1
   WHERE c.partner_id=? AND c.workspace_id=(SELECT workspace_id FROM partners WHERE id=?)
   ORDER BY c.created_at DESC LIMIT 100
 `,[pid,pid]);
 const explained=commissions.map(c=>({
   ...c,
   why_earned:{
     program:c.program_name||null,
     terms_version:c.terms_version||null,
     referral_code:c.referral_code||null,
     attribution_policy:c.attribution_policy||"LEGACY_DIRECT_REFERRAL",
     attribution_window_days:c.attribution_window_days??null,
     qualifying_event:c.qualifying_event||"Reconciled payment",
     refund_hold_days:c.refund_hold_days??0,
     payout_schedule:c.payout_schedule||null,
     reward_type:c.reward_type||null,
     reward_amount:c.reward_amount??null,
     reward_rate:c.reward_rate??null,
     order_number:c.order_number||null,
     payment_status:c.payment_status||null,
     reconciliation_status:c.reconciliation_status||null,
     eligible_at:c.eligible_at||null,
     explanation:c.program_name
       ? `Earned from ${c.order_number||"the attributed order"} through referral ${c.referral_code||"the partner attribution"}, under ${c.program_name} terms v${c.terms_version}. The qualifying event is ${c.qualifying_event||"reconciled payment"}; the commission remains subject to the published ${c.refund_hold_days??0}-day refund hold.`
       : `Earned from ${c.order_number||"the attributed order"} through referral ${c.referral_code||"the partner attribution"} after payment reconciliation.`
   }
 }));
 return NextResponse.json({payouts,commissions:explained});
}
