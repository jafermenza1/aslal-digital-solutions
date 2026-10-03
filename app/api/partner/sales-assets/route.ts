import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authorizePermission } from "@/lib/authorization";
import type { RowDataPacket } from "mysql2/promise";

export async function GET(){
 const user=await authorizePermission("partner.portal.view");if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
 const [u]=await db.query<(RowDataPacket&{partner_id:string|null})[]>(`SELECT partner_id FROM users WHERE id=? LIMIT 1`,[user.id]);
 const partnerId=u[0]?.partner_id;if(!partnerId)return NextResponse.json({error:"Partner account is not linked."},{status:409});
 const [rows]=await db.query<RowDataPacket[]>(`
  SELECT a.id asset_id,a.name,a.asset_type,a.description,a.price,a.value,a.currency,a.inventory_limit,a.starts_at,a.ends_at,a.redemption_instructions,a.status,
    al.id allocation_id,al.quantity_allocated,al.quantity_issued,(al.quantity_allocated-al.quantity_issued) quantity_remaining,al.status allocation_status
  FROM partner_sales_asset_allocations al
  JOIN commercial_distribution_items a ON a.id=al.asset_id AND a.workspace_id=al.workspace_id
  WHERE al.partner_id=? AND al.workspace_id=(SELECT workspace_id FROM partners WHERE id=?)
  ORDER BY al.created_at DESC LIMIT 250`,[partnerId,partnerId]);
 return NextResponse.json({assets:rows});
}
