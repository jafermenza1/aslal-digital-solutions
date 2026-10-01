import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import { authorizeWorkspacePermission } from "@/lib/workspaces";

export async function POST(request: Request) {
  const access = await authorizeWorkspacePermission("partners.manage");
  if (!access) return NextResponse.json({error:"Unauthorized"},{status:403});
  try {
    const b=await request.json();
    const resellerId=String(b.resellerId||"").trim();
    const supplierId=String(b.supplierId||"").trim()||null;
    const agreementNumber=String(b.agreementNumber||("AGR-"+randomUUID().slice(0,12).toUpperCase())).trim();
    const pricingModel=String(b.pricingModel||"MARGIN").toUpperCase();
    const margin=Number(b.defaultMarginPercent||0);
    const discount=Number(b.permittedDiscountPercent||0);
    const customerOwnership=String(b.customerOwnership||"BUSINESS").toUpperCase();
    const fulfillment=String(b.fulfillmentResponsibility||"BUSINESS").toUpperCase();
    const returns=String(b.returnResponsibility||"BUSINESS").toUpperCase();
    const settlementRule=String(b.settlementRule||"ORDER_FULFILLED").toUpperCase();
    const settlementSchedule=String(b.settlementSchedule||"NET_30").toUpperCase();
    if(!resellerId||margin<0||margin>100||discount<0||discount>100)return NextResponse.json({error:"Invalid reseller agreement values."},{status:400});
    const [r]=await db.query<any[]>("SELECT id,status,workspace_id FROM resellers WHERE id=? AND workspace_id=? LIMIT 1",[resellerId,access.workspace.id]);
    if(!r[0])return NextResponse.json({error:"Reseller not found."},{status:404});
    if(supplierId){const [s]=await db.query<any[]>("SELECT id,status,workspace_id FROM suppliers WHERE id=? AND workspace_id=? LIMIT 1",[supplierId,access.workspace.id]);if(!s[0])return NextResponse.json({error:"Supplier not found."},{status:404});}
    const id=randomUUID();
    await db.query("INSERT INTO reseller_agreements (id,workspace_id,reseller_id,supplier_relationship_id,agreement_number,status,currency,pricing_model,default_margin_percent,permitted_discount_percent,customer_ownership,fulfillment_responsibility,return_responsibility,settlement_rule,settlement_schedule,effective_from,terms_snapshot) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",[id,access.workspace.id,resellerId,null,agreementNumber,"ACTIVE",String(b.currency||"ETB").toUpperCase(),pricingModel,margin,discount,customerOwnership,fulfillment,returns,settlementRule,settlementSchedule,b.effectiveFrom?new Date(b.effectiveFrom):new Date(),JSON.stringify({territories:b.territories||[],customerOwnership,fulfillmentResponsibility:fulfillment,returnResponsibility:returns,settlementRule,settlementSchedule})]);
    return NextResponse.json({ok:true,agreementId:id,agreementNumber},{status:201});
  }catch(e){console.error("RESELLER_AGREEMENT_CREATE_ERROR",e);return NextResponse.json({error:"Could not create reseller agreement."},{status:500});}
}