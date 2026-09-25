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
 const [payableCommissions]=await db.query<RowDataPacket[]>(`SELECT c.id,c.partner_id,p.name partner_name,c.amount,c.currency,c.status,o.order_number,c.created_at
 FROM commissions c JOIN partners p ON p.id=c.partner_id LEFT JOIN orders o ON o.id=c.order_id
 LEFT JOIN partner_payout_items pi ON pi.commission_id=c.id
 LEFT JOIN revenues r ON r.id=c.revenue_id
 LEFT JOIN payments pm ON pm.id=c.payment_id
 WHERE c.status="PAYABLE" AND pi.id IS NULL AND r.status="RECOGNIZED" AND pm.reconciliation_status="RECONCILED"
 ORDER BY p.name ASC,c.created_at ASC LIMIT 500`);
 return NextResponse.json({payouts:rows,payableCommissions});
}
export async function POST(request:Request){
 const actor=await authorizePermission("partners.manage");if(!actor)return NextResponse.json({error:"Unauthorized"},{status:401});
 try{
  const fail=(message:string,status:number)=>{const error=new Error(message) as Error & {status?:number};error.status=status;throw error;};
  const b=await request.json(),partnerId=String(b.partnerId??"").trim(),status=String(b.status??"PENDING").toUpperCase(),amount=Number(b.amount??0),currency=String(b.currency??"ETB").toUpperCase(),reference=String(b.reference??"").trim()||null,notes=String(b.notes??"").trim()||null;
  const commissionIds=Array.isArray(b.commissionIds)?[...new Set(b.commissionIds.map((x:unknown)=>String(x).trim()).filter(Boolean))]:[];
  if(!partnerId||!STATUS.has(status)||!Number.isFinite(amount)||amount<0||amount>999999999999.99||(!commissionIds.length&&amount<=0))return NextResponse.json({error:"Partner, valid status and a positive amount (or selected commissions) are required."},{status:400});
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
    if(rows.length!==commissionIds.length)fail("One or more commission records were not found.",404);
    if(rows.some(x=>String(x.partner_id)!==partnerId))fail("All selected commissions must belong to the selected partner.",409);
    if(rows.some(x=>x.status!=="PAYABLE"))fail("Only PAYABLE commissions can be included in a payout.",409);
    if(rows.some(x=>x.payout_item_id))fail("One or more selected commissions are already attached to a payout.",409);
    payoutAmount=rows.reduce((sum,x)=>sum+Number(x.amount),0);
   }
   if(!Number.isFinite(payoutAmount)||payoutAmount<=0)fail("Payout amount must be positive.",400);
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
 }catch(error){console.error("PARTNER_PAYOUT_CREATE_ERROR",error);const status=error instanceof Error && "status" in error ? Number((error as Error & {status?:number}).status)||500 : 500;const message=error instanceof Error?error.message:"Could not create payout record.";return NextResponse.json({error:message},{status});}
}
