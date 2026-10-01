import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import { authorizeWorkspacePermission } from "@/lib/workspaces";

export async function POST(request: Request) {
  const access = await authorizeWorkspacePermission("partners.manage");
  if (!access) return NextResponse.json({error:"Unauthorized"},{status:403});
  try {
    const b=await request.json();
    const legalName=String(b.legalName||"").trim().slice(0,190);
    if(legalName.length<2)return NextResponse.json({error:"Supplier legal name is required."},{status:400});
    const number="ASL-SUP-"+new Date().getUTCFullYear()+"-"+randomUUID().replace(/-/g,"").slice(0,8).toUpperCase();
    const id=randomUUID();
    await db.query("INSERT INTO suppliers (id,workspace_id,supplier_number,legal_name,contact_name,email,phone,country,status,fulfillment_responsibility,return_responsibility,settlement_schedule,settlement_currency) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",[id,access.workspace.id,number,legalName,String(b.contactName||"").trim().slice(0,160)||null,String(b.email||"").trim().toLowerCase().slice(0,190)||null,String(b.phone||"").trim().slice(0,40)||null,String(b.country||"").trim().slice(0,100)||null,"PENDING",String(b.fulfillmentResponsibility||"SUPPLIER").toUpperCase(),String(b.returnResponsibility||"SUPPLIER").toUpperCase(),String(b.settlementSchedule||"NET_30").toUpperCase(),String(b.currency||"ETB").toUpperCase().slice(0,10)]);
    return NextResponse.json({ok:true,supplierId:id,supplierNumber:number},{status:201});
  }catch(e){console.error("SUPPLIER_CREATE_ERROR",e);return NextResponse.json({error:"Could not create supplier."},{status:500});}
}