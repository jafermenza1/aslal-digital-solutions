import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authorizePermission } from "@/lib/authorization";
import type { RowDataPacket } from "mysql2/promise";
export async function GET(){
 const user=await authorizePermission("partner.portal.view");if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
 const [u]=await db.query<(RowDataPacket&{partner_id:string|null})[]>(`SELECT partner_id FROM users WHERE id=? LIMIT 1`,[user.id]);const pid=u[0]?.partner_id;if(!pid)return NextResponse.json({error:"Partner account is not linked."},{status:409});
 const [payouts]=await db.query<RowDataPacket[]>(`SELECT id,amount,currency,status,reference,notes,paid_at,created_at FROM partner_payouts WHERE partner_id=? ORDER BY created_at DESC LIMIT 100`,[pid]);
 const [commissions]=await db.query<RowDataPacket[]>(`SELECT c.id,c.amount,c.currency,c.status,c.created_at,rl.code referral_code FROM commissions c LEFT JOIN referral_links rl ON rl.id=c.referral_link_id WHERE c.partner_id=? ORDER BY c.created_at DESC LIMIT 100`,[pid]);
 return NextResponse.json({payouts,commissions});
}
