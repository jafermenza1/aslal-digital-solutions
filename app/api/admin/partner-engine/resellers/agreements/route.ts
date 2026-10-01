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
    const supplierRelationshipId=supplierId?randomUUID():null;
    await db.query("START TRANSACTION");
    try {
      if(supplierId) await db.query("INSERT INTO supplier_relationships (id,workspace_id,supplier_id,relationship_type,status,territory_scope,fulfillment_terms,return_terms,settlement_terms,terms_snapshot) VALUES (?,?,?,?,?,?,?,?,?,?)",[supplierRelationshipId,access.workspace.id,supplierId,"SUPPLY","ACTIVE",JSON.stringify(b.territories||[]),JSON.stringify({responsibility:fulfillment}),JSON.stringify({responsibility:returns}),JSON.stringify({rule:settlementRule,schedule:settlementSchedule}),JSON.stringify({createdForAgreement:agreementNumber})]);
    await db.query("INSERT INTO reseller_agreements (id,workspace_id,reseller_id,supplier_relationship_id,agreement_number,status,currency,pricing_model,default_margin_percent,permitted_discount_percent,customer_ownership,fulfillment_responsibility,return_responsibility,settlement_rule,settlement_schedule,effective_from,terms_snapshot) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",[id,access.workspace.id,resellerId,supplierRelationshipId,agreementNumber,"ACTIVE",String(b.currency||"ETB").toUpperCase(),pricingModel,margin,discount,customerOwnership,fulfillment,returns,settlementRule,settlementSchedule,b.effectiveFrom?new Date(b.effectiveFrom):new Date(),JSON.stringify({territories:b.territories||[],customerOwnership,fulfillmentResponsibility:fulfillment,returnResponsibility:returns,settlementRule,settlementSchedule})]);
    const territories=Array.isArray(b.territories)?b.territories:[]; for(const t of territories){await db.query("INSERT INTO reseller_territories (id,workspace_id,agreement_id,country,region,city,district,allowed) VALUES (?,?,?,?,?,?,?,?)",[randomUUID(),access.workspace.id,id,t.country||null,t.region||null,t.city||null,t.district||null,t.allowed!==false]);} await db.query("COMMIT"); return NextResponse.json({ok:true,agreementId:id,agreementNumber},{status:201});
    } catch(e){ await db.query("ROLLBACK"); throw e; }
  }catch(e){console.error("RESELLER_AGREEMENT_CREATE_ERROR",e);return NextResponse.json({error:"Could not create reseller agreement."},{status:500});}
}