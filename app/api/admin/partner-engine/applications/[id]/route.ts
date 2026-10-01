import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeWorkspacePermission } from "@/lib/workspaces";

export async function PATCH(req:Request,{params}:{params:{id:string}}){
  const access=await authorizeWorkspacePermission("partners.manage");
  if(!access)return NextResponse.json({error:"Unauthorized"},{status:401});
  const body=await req.json().catch(()=>({}));
  const action=String(body.action||"").toUpperCase();
  if(!["APPROVE","REJECT"].includes(action))return NextResponse.json({error:"Action must be APPROVE or REJECT."},{status:400});
  const application=await prisma.partnerProgramApplication.findFirst({where:{id:params.id,workspaceId:access.workspace.id},include:{program:{include:{terms:{where:{active:true},take:1}}},partner:true}});
  if(!application)return NextResponse.json({error:"Application not found."},{status:404});
  if(!["PENDING","UNDER_REVIEW"].includes(application.status))return NextResponse.json({error:"Application is already finalized."},{status:409});
  if(action==="REJECT"){
    const reason=String(body.reason||"").trim();
    if(reason.length<10)return NextResponse.json({error:"Rejection reason must be at least 10 characters."},{status:400});
    const updated=await prisma.partnerProgramApplication.update({where:{id:application.id},data:{status:"REJECTED",reviewedBy:access.user.email,reviewedAt:new Date(),reviewReason:reason}});
    return NextResponse.json({application:updated});
  }
  if(application.program.status!=="PUBLISHED"||!application.program.terms[0])return NextResponse.json({error:"Program must be published with active terms before approval."},{status:409});
  const allowed=(application.program.allowedPartnerTypes||"").split(",").map(x=>x.trim()).filter(Boolean);
  if(allowed.length&&!allowed.includes(application.partner.type))return NextResponse.json({error:"Partner type is no longer eligible."},{status:403});
  if(!["ACTIVE"].includes(application.partner.accountStatus))return NextResponse.json({error:"Partner account is not active."},{status:403});
  const t=application.program.terms[0];
  const result=await prisma.$transaction(async tx=>{
    const existing=await tx.commissionContract.findUnique({where:{programId_partnerId:{programId:application.programId,partnerId:application.partnerId}}});
    const contract=existing||await tx.commissionContract.create({data:{id:crypto.randomUUID(),workspaceId:application.workspaceId,programId:application.programId,termsId:t.id,partnerId:application.partnerId,status:"ACTIVE",acceptedAt:new Date(),acceptedBy:access.user.email,termsSnapshot:t.termsSnapshot||{version:t.version,currency:t.currency,earningsDescription:t.earningsDescription,qualifyingEvent:t.qualifyingEvent,attributionPolicy:t.attributionPolicy,attributionWindowDays:t.attributionWindowDays,refundHoldDays:t.refundHoldDays,payoutSchedule:t.payoutSchedule,minimumPayout:t.minimumPayout,exclusions:t.exclusions}}});
    await tx.partnerTermsAcceptance.updateMany({where:{programId:application.programId,partnerId:application.partnerId,workspaceId:application.workspaceId,termsId:t.id,contractId:null},data:{contractId:contract.id}});
    let link=await tx.referralLink.findFirst({where:{partnerId:application.partnerId,workspaceId:application.workspaceId,campaignId:null},orderBy:{createdAt:"asc"}}); if(!link){const base="ASL-"+application.partner.partnerNumber.replace(/[^A-Z0-9]/gi,"").toUpperCase(); try{link=await tx.referralLink.create({data:{id:crypto.randomUUID(),workspaceId:application.workspaceId,partnerId:application.partnerId,code:base,destinationPath:"/"}})}catch{link=await tx.referralLink.create({data:{id:crypto.randomUUID(),workspaceId:application.workspaceId,partnerId:application.partnerId,code:"ASL-"+crypto.randomUUID().replace(/-/g,"").slice(0,12).toUpperCase(),destinationPath:"/"}})}}
    const updated=await tx.partnerProgramApplication.update({where:{id:application.id},data:{status:"APPROVED",reviewedBy:access.user.email,reviewedAt:new Date(),reviewReason:null}});
    return {contract,application:updated};
  });
  return NextResponse.json({ok:true,...result});
}
