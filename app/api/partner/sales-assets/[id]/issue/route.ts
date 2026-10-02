import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { authorizePermission } from "@/lib/authorization";

export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
 const user=await authorizePermission("partner.portal.view");if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
 const {id}=await params;const body=await request.json().catch(()=>({}));
 const [u]=await prisma.$queryRawUnsafe<any[]>(`SELECT partner_id FROM users WHERE id=? LIMIT 1`,user.id);
 const partnerId=u?.partner_id;if(!partnerId)return NextResponse.json({error:"Partner account is not linked."},{status:409});
 try{
  const result=await prisma.$transaction(async tx=>{
   const allocation=await tx.partnerSalesAssetAllocation.findFirst({where:{id,partnerId,status:"ACTIVE"},include:{asset:true,partner:true}});
   if(!allocation)throw new Error("Active sales asset allocation not found.");
   if(allocation.asset.status!=="ACTIVE")throw new Error("Sales asset is not active.");
   if(allocation.endsAt&&allocation.endsAt<new Date())throw new Error("Allocation has expired.");
   if(allocation.quantityIssued>=allocation.quantityAllocated)throw new Error("No allocated inventory remains.");
   if(allocation.asset.inventoryLimit!==null){
    const issued=await tx.issuedSalesAsset.count({where:{assetId:allocation.assetId,status:{notIn:["VOID","EXPIRED"]}}});
    if(issued>=allocation.asset.inventoryLimit)throw new Error("Asset inventory limit has been reached.");
   }
   const holderName=String(body.holderName??"").trim()||null,holderPhone=String(body.holderPhone??"").trim()||null;
   const issuedId=randomUUID(),serial=`ASL-${new Date().getFullYear()}-${randomUUID().replaceAll("-","").slice(0,10).toUpperCase()}`;
   const issued=await tx.issuedSalesAsset.create({data:{id:issuedId,workspaceId:allocation.workspaceId,assetId:allocation.assetId,allocationId:allocation.id,partnerId,serialNumber:serial,qrPayload:`ASLAL:ASSET:${serial}`,holderName,holderPhone,issuedPrice:allocation.asset.price,issuedValue:allocation.asset.value,status:"VALID",validFrom:allocation.asset.startsAt||new Date(),validUntil:allocation.asset.endsAt,issuedBy:user.email}});
   const quantity=Number(allocation.asset.price??allocation.asset.value??0);
   const order=await tx.order.create({data:{id:randomUUID(),workspaceId:allocation.workspaceId,orderNumber:`SO-ASSET-${new Date().toISOString().slice(0,10).replaceAll("-","")}-${randomUUID().slice(0,8).toUpperCase()}`,status:"CONFIRMED",currency:allocation.asset.currency,subtotal:quantity,discount:0,total:quantity,paymentState:"PENDING",fulfillmentState:"ISSUED",source:"partner_sales_asset",campaign:allocation.campaignId||undefined,partnerId,distributionAssetId:allocation.assetId,salesOwnerEmail:user.email,confirmedAt:new Date(),items:{create:{id:randomUUID(),description:allocation.asset.name,quantity:1,unitPrice:quantity,lineTotal:quantity}}}});
   await tx.partnerSalesAssetAllocation.update({where:{id:allocation.id},data:{quantityIssued:{increment:1}}});
   return {issued,order};
  });
  return NextResponse.json({ok:true,issued:result.issued,order:result.order},{status:201});
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Could not record partner sale."},{status:409});}
}
