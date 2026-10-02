import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import type { RowDataPacket } from "mysql2/promise";
const clean=(v:unknown,max=190)=>typeof v==="string"?v.trim().slice(0,max):"";
export async function POST(request:Request){
 try{
  const b=await request.json().catch(()=>({}));
  const serial=clean(b.serialNumber,50),name=clean(b.attendeeName,190),phone=clean(b.attendeePhone,40)||null,email=clean(b.attendeeEmail,190)||null;
  if(!serial||!name||(!phone&&!email))return NextResponse.json({error:"Ticket serial, attendee name, and phone or email are required."},{status:400});
  const [rows]=await db.query<RowDataPacket[]>('SELECT i.id issued_asset_id,i.workspace_id,i.asset_id,i.status,i.valid_from,i.valid_until,i.holder_name,i.holder_phone,a.name asset_name,a.rsvp_required,a.rsvp_opens_at,a.rsvp_closes_at FROM issued_sales_assets i JOIN commercial_distribution_items a ON a.id=i.asset_id AND a.workspace_id=i.workspace_id WHERE i.serial_number=? LIMIT 1',[serial]);
  const item=rows[0]; if(!item)return NextResponse.json({error:"Ticket or coupon was not found."},{status:404});
  if(item.status!=="VALID")return NextResponse.json({error:"This ticket or coupon is not currently valid for RSVP."},{status:409});
  if(!item.rsvp_required)return NextResponse.json({error:"RSVP is not required for this ticket or coupon."},{status:409});
  const now=new Date();
  if(item.rsvp_opens_at&&now<new Date(item.rsvp_opens_at))return NextResponse.json({error:"RSVP has not opened yet."},{status:409});
  if(item.rsvp_closes_at&&now>new Date(item.rsvp_closes_at))return NextResponse.json({error:"The RSVP window has closed."},{status:409});
  if(item.valid_from&&now<new Date(item.valid_from))return NextResponse.json({error:"This ticket is not valid yet."},{status:409});
  if(item.valid_until&&now>new Date(item.valid_until))return NextResponse.json({error:"This ticket has expired."},{status:409});
  if(item.holder_phone&&phone&&item.holder_phone!==phone)return NextResponse.json({error:"The supplied phone does not match the ticket holder record."},{status:403});
  const [existing]=await db.query<RowDataPacket[]>('SELECT id,status FROM sales_asset_rsvps WHERE issued_asset_id=? LIMIT 1',[item.issued_asset_id]);
  if(existing[0]&&existing[0].status==="CONFIRMED")return NextResponse.json({ok:true,status:"ALREADY_CONFIRMED",rsvpId:existing[0].id});
  const id=randomUUID();
  await db.query('INSERT INTO sales_asset_rsvps (id,workspace_id,asset_id,issued_asset_id,attendee_name,attendee_phone,attendee_email,status,reserved_at,created_at) VALUES (?,?,?,?,?,?,?,?,NOW(),NOW()) ON DUPLICATE KEY UPDATE attendee_name=VALUES(attendee_name),attendee_phone=VALUES(attendee_phone),attendee_email=VALUES(attendee_email),status="CONFIRMED",cancelled_at=NULL,reserved_at=NOW()',[id,item.workspace_id,item.asset_id,item.issued_asset_id,name,phone,email,"CONFIRMED"]);
  return NextResponse.json({ok:true,status:"CONFIRMED",rsvpId:id,assetName:item.asset_name});
 }catch(error){console.error("SALES_ASSET_RSVP_ERROR",error);return NextResponse.json({error:"Could not process RSVP."},{status:500});}
}