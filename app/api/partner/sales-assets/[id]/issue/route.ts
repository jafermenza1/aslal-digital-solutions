import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { authorizePermission } from "@/lib/authorization";

export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
 const user=await authorizePermission("partner.portal.view");if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
 const {id}=await params;
 const b=await request.json();
 const holderName=String(b.holderName??"").trim()||null;
 const holderPhone=String(b.holderPhone??"").trim()||null;
 const conn=await db.getConnection();
 try{
  await conn.beginTransaction();
  const [u]=await conn.query<any[]>(`SELECT partner_id FROM users WHERE id=? LIMIT 1 FOR UPDATE`,[user.id]);
  const partnerId=u[0]?.partner_id;if(!partnerId)throw new Error("Partner account is not linked.");
  const [rows]=await conn.query<any[]>(`
   SELECT al.*,a.name,a.asset_type,a.price,a.value,a.currency,a.inventory_limit,a.starts_at,a.ends_at,a.status asset_status
   FROM partner_sales_asset_allocations al JOIN commercial_distribution_items a ON a.id=al.asset_id AND a.workspace_id=al.workspace_id
   JOIN partners p ON p.id=al.partner_id AND p.workspace_id=al.workspace_id
   WHERE al.id=? AND al.partner_id=? AND al.workspace_id=p.workspace_id LIMIT 1 FOR UPDATE`,[id,partnerId]);
  const row=rows[0];if(!row)throw new Error("Allocation not found.");
  if(row.status!=="ACTIVE"||row.asset_status!=="ACTIVE")throw new Error("This allocation is not active.");
  if(row.ends_at&&new Date(row.ends_at)<new Date())throw new Error("This allocation has expired.");
  if(row.quantity_issued>=row.quantity_allocated)throw new Error("No allocated inventory remains.");
  if(row.inventory_limit!==null&&row.quantity_issued>=row.inventory_limit)throw new Error("Asset inventory limit has been reached.");
  const issuedId=randomUUID();
  const serial="ASL-"+new Date().getFullYear()+"-"+randomUUID().replaceAll("-","").slice(0,10).toUpperCase();
  const qrPayload=`ASLAL:ASSET:${serial}`;
  await conn.query(`INSERT INTO issued_sales_assets
   (id,workspace_id,asset_id,allocation_id,partner_id,serial_number,qr_payload,holder_name,holder_phone,issued_price,issued_value,status,issued_at,valid_from,valid_until,issued_by,created_at)
   VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW())`,[
    issuedId,row.workspace_id,row.asset_id,row.id,partnerId,serial,qrPayload,holderName,holderPhone,row.price,row.value,"VALID",
    new Date(),row.starts_at||new Date(),row.ends_at||null,user.email
  ]);
  await conn.query(`UPDATE partner_sales_asset_allocations SET quantity_issued=quantity_issued+1,updated_at=NOW() WHERE id=?`,[row.id]);
  await conn.commit();
  return NextResponse.json({ok:true,id:issuedId,serialNumber:serial,qrPayload},{status:201});
 }catch(error){await conn.rollback();const message=error instanceof Error?error.message:"Could not issue sales asset.";return NextResponse.json({error:message},{status:409});}
 finally{conn.release();}
}
