import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { authorizePermission } from "@/lib/authorization";

export async function GET(){
 const actor=await authorizePermission("commerce.view");
 if(!actor)return NextResponse.json({error:"Unauthorized"},{status:401});
 const [rows]=await db.query(
  `SELECT i.id,i.invoice_number,i.customer_id,c.name customer_name,i.order_id,o.order_number,
          i.status,i.currency,i.subtotal,i.tax_amount,i.total,i.amount_paid,i.balance_due,
          i.issued_at,i.due_at,i.paid_at,i.created_at
     FROM invoices i
     LEFT JOIN customers c ON c.id=i.customer_id
     LEFT JOIN orders o ON o.id=i.order_id
    ORDER BY i.created_at DESC LIMIT 250`
 );
 return NextResponse.json({invoices:rows});
}

export async function POST(request:Request){
 const actor=await authorizePermission("commerce.manage");
 if(!actor)return NextResponse.json({error:"Unauthorized"},{status:401});
 try{
  const b=await request.json();
  const orderId=String(b.orderId??"").trim();
  const dueAt=String(b.dueAt??"").trim()||null;
  const notes=String(b.notes??"").trim()||null;
  const taxAmount=Number(b.taxAmount??0);
  if(!orderId)return NextResponse.json({error:"Order is required."},{status:400});
  if(!Number.isFinite(taxAmount)||taxAmount<0)return NextResponse.json({error:"Tax amount must be zero or greater."},{status:400});

  const [orders]=await db.query<any[]>(
   `SELECT id,order_number,customer_id,currency,subtotal,total,status FROM orders WHERE id=? LIMIT 1`,[orderId]
  );
  const order=orders[0];
  if(!order)return NextResponse.json({error:"Order not found."},{status:404});
  if(!["CONFIRMED","FULFILLING","COMPLETED"].includes(String(order.status)))return NextResponse.json({error:"Only confirmed or fulfilled orders can be invoiced."},{status:400});

  const [existing]=await db.query<any[]>(
   `SELECT id,invoice_number,status FROM invoices WHERE order_id=? AND status<> 'VOID' LIMIT 1`,[orderId]
  );
  if(existing[0])return NextResponse.json({error:"This order already has an active invoice.",invoice:existing[0]},{status:409});

  const subtotal=Number(order.subtotal);
  const total=subtotal+taxAmount;
  const invoiceNumber=`INV-${new Date().getFullYear()}-${randomUUID().replaceAll("-","").slice(0,12).toUpperCase()}`;
  const invoiceId=randomUUID();
  const [items]=await db.query<any[]>(
   `SELECT description,quantity,unit_price,amount,sort_order FROM order_items WHERE order_id=? ORDER BY sort_order ASC`,[orderId]
  );
  const conn=await db.getConnection();
  try{
   await conn.beginTransaction();
   await conn.query(
    `INSERT INTO invoices
      (id,invoice_number,customer_id,order_id,status,currency,subtotal,tax_amount,total,amount_paid,balance_due,issued_at,due_at,notes,created_by,created_at,updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,0,?,?,?, ?,?,NOW(),NOW())`,
    [invoiceId,invoiceNumber,order.customer_id,orderId,"ISSUED",order.currency,subtotal,taxAmount,total,total,new Date(),dueAt,notes,actor.email]
   );
   for(const item of items as any[]){
    await conn.query(
     `INSERT INTO invoice_items (id,invoice_id,description,quantity,unit_price,amount,sort_order)
      VALUES (?,?,?,?,?,?,?)`,
     [randomUUID(),invoiceId,String(item.description||"Order item"),item.quantity,item.unit_price,item.amount,item.sort_order||0]
    );
   }
   await conn.query(
    `INSERT INTO user_audits (id,user_id,actor,action,reason,details,created_at)
     VALUES (UUID(),NULL,?,?,?,?,?,NOW())`,
    [actor.email,"INVOICE_CREATED","Invoice issued from confirmed order.",JSON.stringify({invoiceId,orderId,invoiceNumber,total,currency:order.currency})]
   );
   await conn.commit();
  }catch(error){await conn.rollback();throw error;}finally{conn.release();}
  return NextResponse.json({ok:true,invoiceId,invoiceNumber,status:"ISSUED"},{status:201});
 }catch(error){
  console.error("INVOICE_CREATE_ERROR",error);
  return NextResponse.json({error:"Could not create invoice."},{status:500});
 }
}
