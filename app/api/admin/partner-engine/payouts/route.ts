import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authorizePermission } from "@/lib/authorization";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
const STATUS=new Set(["PENDING","APPROVED","PAID","FAILED","VOID"]);
export async function GET(){
 if(!(await authorizePermission("partners.manage")))return NextResponse.json({error:"Unauthorized"},{status:401});
 const [rows]=await db.query<RowDataPacket[]>(`SELECT pp.id,pp.partner_id,p.name partner_name,pp.amount,pp.currency,pp.status,pp.reference,pp.notes,pp.paid_at,pp.created_at,
 (SELECT COUNT(*) FROM partner_payout_items pi WHERE pi.payout_id=pp.id) commission_count
 FROM partner_payouts pp JOIN partners p ON p.id=pp.partner_id ORDER BY pp.created_at DESC LIMIT 250`);
 return NextResponse.json({payouts:rows});
}
export async function POST(request:Request){
 const actor=await authorizePermission("partners.manage");if(!actor)return NextResponse.json({error:"Unauthorized"},{status:401});
 try{
  const b=await request.json(),partnerId=String(b.partnerId??"").trim(),status=String(b.status??"PENDING").toUpperCase(),amount=Number(b.amount??0),currency=String(b.currency??"ETB").toUpperCase(),reference=String(b.reference??"").trim()||null,notes=String(b.notes??"").trim()||null;
  if(!partnerId||!STATUS.has(status)||!Number.isFinite(amount)||amount<=0||amount>999999999999.99)return NextResponse.json({error:"Partner, valid status and positive amount are required."},{status:400});
  if(!/^[A-Z]{3}$/.test(currency))return NextResponse.json({error:"Currency must be a 3-letter code."},{status:400});
  const [p]=await db.query<RowDataPacket[]>(`SELECT id FROM partners WHERE id=? LIMIT 1`,[partnerId]);if(!p[0])return NextResponse.json({error:"Partner not found."},{status:404});
  const id=crypto.randomUUID();
  await db.query(`INSERT INTO partner_payouts (id,partner_id,amount,currency,status,reference,notes,paid_at) VALUES (?,?,?,?,?,?,?,?)`,[id,partnerId,amount.toFixed(2),currency,status,reference,notes,status==="PAID"?new Date():null]);
  return NextResponse.json({ok:true,id,createdBy:actor.email},{status:201});
 }catch(error){console.error("PARTNER_PAYOUT_CREATE_ERROR",error);return NextResponse.json({error:"Could not create payout record."},{status:500});}
}
