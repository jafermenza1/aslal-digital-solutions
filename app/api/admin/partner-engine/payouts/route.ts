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
  const commissionIds=Array.isArray(b.commissionIds)?[...new Set(b.commissionIds.map((x:unknown)=>String(x).trim()).filter(Boolean))]:[];
  if(!partnerId||!STATUS.has(status)||!Number.isFinite(amount)||amount<=0||amount>999999999999.99)return NextResponse.json({error:"Partner, valid status and positive amount are required."},{status:400});
  if(!/^[A-Z]{3}$/.test(currency))return NextResponse.json({error:"Currency must be a 3-letter code."},{status:400});
  const [p]=await db.query<RowDataPacket[]>(`SELECT id FROM partners WHERE id=? LIMIT 1`,[partnerId]);if(!p[0])return NextResponse.json({error:"Partner not found."},{status:404});
  if(status==="PAID" && !commissionIds.length)return NextResponse.json({error:"A PAID partner payout must identify the payable commission records it settles."},{status:400});
  const conn=await db.getConnection();
  try{
   await conn.beginTransaction();
   let payoutAmount=amount;
   if(commissionIds.length){
    const placeholders=commissionIds.map(()=>"?").join(",");
    const [rows]=await conn.query<RowDataPacket[]>(`SELECT c.id,c.amount,c.partner_id,c.currency,c.status,pi.id payout_item_id FROM commissions c LEFT JOIN partner_payout_items pi ON pi.commission_id=c.id WHERE c.id IN (${placeholders}) FOR UPDATE`,commissionIds);
    if(rows.length!==commissionIds.length)return NextResponse.json({error:"One or more commission records were not found."},{status:404});
    if(rows.some(x=>String(x.partner_id)!==partnerId))return NextResponse.json({error:"All selected commissions must belong to the selected partner."},{status:409});
    if(rows.some(x=>x.status!=="PAYABLE"))return NextResponse.json({error:"Only PAYABLE commissions can be included in a payout."},{status:409});
    if(rows.some(x=>x.payout_item_id))return NextResponse.json({error:"One or more selected commissions are already attached to a payout."},{status:409});
    payoutAmount=rows.reduce((sum,x)=>sum+Number(x.amount),0);
   }
   if(!Number.isFinite(payoutAmount)||payoutAmount<=0)return NextResponse.json({error:"Payout amount must be positive."},{status:400});
   const id=crypto.randomUUID();
   await conn.query(`INSERT INTO partner_payouts (id,partner_id,amount,currency,status,reference,notes,paid_at) VALUES (?,?,?,?,?,?,?,?)`,[id,partnerId,payoutAmount.toFixed(2),currency,status,reference,notes,status==="PAID"?new Date():null]);
   for(const commissionId of commissionIds){
    const [rows]=await conn.query<RowDataPacket[]>(`SELECT amount FROM commissions WHERE id=? LIMIT 1`,[commissionId]);
    await conn.query(`INSERT INTO partner_payout_items (id,payout_id,commission_id,amount) VALUES (?,?,?,?)`,[crypto.randomUUID(),id,commissionId,Number(rows[0].amount).toFixed(2)]);
   }
   if(status==="PAID")await conn.query(`UPDATE commissions SET status="PAID" WHERE id IN (${commissionIds.map(()=>"?").join(",")})`,commissionIds);
   await conn.commit();
   return NextResponse.json({ok:true,id,amount:payoutAmount,commissionCount:commissionIds.length,createdBy:actor.email},{status:201});
  }catch(error){await conn.rollback();throw error;}finally{conn.release();}
 }catch(error){console.error("PARTNER_PAYOUT_CREATE_ERROR",error);return NextResponse.json({error:"Could not create payout record."},{status:500});}
}
