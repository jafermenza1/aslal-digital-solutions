import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authorizePermission } from "@/lib/authorization";
import type { RowDataPacket } from "mysql2/promise";
export async function GET(){
 const user=await authorizePermission("partner.portal.view");if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
 const [u]=await db.query<(RowDataPacket&{partner_id:string|null})[]>(`SELECT partner_id FROM users WHERE id=? LIMIT 1`,[user.id]);
 const partnerId=u[0]?.partner_id;if(!partnerId)return NextResponse.json({error:"Partner account is not linked."},{status:409});
 const [rows]=await db.query<RowDataPacket[]>(`SELECT i.id,i.serial_number,i.status,i.issued_at,a.name asset_name,a.asset_type FROM issued_sales_assets i JOIN commercial_distribution_items a ON a.id=i.asset_id AND a.workspace_id=i.workspace_id WHERE i.partner_id=? AND i.workspace_id=(SELECT workspace_id FROM partners WHERE id=?) ORDER BY i.issued_at DESC LIMIT 250`,[partnerId,partnerId]);
 return NextResponse.json({issued:rows});
}
