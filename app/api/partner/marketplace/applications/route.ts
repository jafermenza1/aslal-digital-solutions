import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizePermission } from "@/lib/authorization";

export async function GET() {
  const access=await authorizePermission("partner.portal.view");
  if(!access) return NextResponse.json({error:"Unauthorized"},{status:401});
  const partner=await prisma.partner.findFirst({where:{user:{is:{id:access.id}}},select:{id:true}});
  if(!partner) return NextResponse.json({error:"Partner account is not linked."},{status:404});
  const applications=await prisma.partnerProgramApplication.findMany({
    where:{partnerId:partner.id},
    include:{program:{select:{id:true,name:true,slug:true,status:true,admissionMode:true,workspace:{select:{id:true,name:true,slug:true}}},},},
    orderBy:{createdAt:"desc"},take:100,
  });
  return NextResponse.json({applications});
}

export async function POST(req:Request){
  const access=await authorizePermission("partner.portal.view");
  if(!access) return NextResponse.json({error:"Unauthorized"},{status:401});
  const partner=await prisma.partner.findFirst({where:{user:{is:{id:access.id}}}});
  if(!partner) return NextResponse.json({error:"Partner account is not linked."},{status:404});
  if(!["ACTIVE"].includes(partner.accountStatus)) return NextResponse.json({error:"Partner account is not eligible to apply."},{status:403});
  const body=await req.json().catch(()=>({}));
  const programId=String(body.programId||"").trim();
  const message=String(body.message||"").trim();
  if(body.acceptTerms!==true)return NextResponse.json({error:"You must accept the current program terms."},{status:400});
  if(!programId) return NextResponse.json({error:"programId is required."},{status:400});
  const program=await prisma.partnerProgram.findFirst({where:{id:programId,status:"PUBLISHED",workspace:{active:true}},include:{terms:{where:{active:true},take:1}}});
  if(!program||!program.terms[0]) return NextResponse.json({error:"Program is not available."},{status:404});
  const allowed=(program.allowedPartnerTypes||"").split(",").map(x=>x.trim()).filter(Boolean);
  if(allowed.length&&!allowed.includes(partner.type)) return NextResponse.json({error:"Your partner type is not eligible for this program."},{status:403});
  const existing=await prisma.commissionContract.findUnique({where:{programId_partnerId:{programId,partnerId:partner.id}}});
  if(existing) return NextResponse.json({error:"You already participate in this program.",contractId:existing.id},{status:409});
  const existingApplication=await prisma.partnerProgramApplication.findUnique({where:{programId_partnerId:{programId,partnerId:partner.id}}});
  if(existingApplication) return NextResponse.json({application:existingApplication,created:false});
  const autoApprove=program.admissionMode==="OPEN";
  const t=program.terms[0];
  const application=await prisma.$transaction(async tx=>{
    const a=await tx.partnerProgramApplication.create({data:{id:crypto.randomUUID(),workspaceId:program.workspaceId,programId,partnerId:partner.id,status:autoApprove?"APPROVED":"PENDING",message:message||null,partnerSnapshot:{partnerNumber:partner.partnerNumber,name:partner.name,type:partner.type,verificationLevel:partner.verificationLevel},reviewedBy:autoApprove?access.email:null,reviewedAt:autoApprove?new Date():null}});
    if(autoApprove){
      const snapshot=t.termsSnapshot||{version:t.version,currency:t.currency,earningsDescription:t.earningsDescription,qualifyingEvent:t.qualifyingEvent,attributionPolicy:t.attributionPolicy,attributionWindowDays:t.attributionWindowDays,refundHoldDays:t.refundHoldDays,payoutSchedule:t.payoutSchedule,minimumPayout:t.minimumPayout,exclusions:t.exclusions};
      const contract=await tx.commissionContract.create({data:{id:crypto.randomUUID(),workspaceId:program.workspaceId,programId,termsId:t.id,partnerId:partner.id,status:"ACTIVE",acceptedAt:new Date(),acceptedBy:access.email,termsSnapshot:snapshot}});
      await tx.partnerTermsAcceptance.create({data:{id:crypto.randomUUID(),partnerId:partner.id,workspaceId:program.workspaceId,programId,termsId:t.id,contractId:contract.id,acceptedBy:access.email}});
      let link=await tx.referralLink.findFirst({where:{partnerId:partner.id,workspaceId:program.workspaceId,campaignId:null},orderBy:{createdAt:"asc"}}); if(!link){const base="ASL-"+partner.partnerNumber.replace(/[^A-Z0-9]/gi,"").toUpperCase(); try{link=await tx.referralLink.create({data:{id:crypto.randomUUID(),workspaceId:program.workspaceId,partnerId:partner.id,code:base,destinationPath:"/"}})}catch{link=await tx.referralLink.create({data:{id:crypto.randomUUID(),workspaceId:program.workspaceId,partnerId:partner.id,code:"ASL-"+crypto.randomUUID().replace(/-/g,"").slice(0,12).toUpperCase(),destinationPath:"/"}})}}
    }
    return a;
  });
  return NextResponse.json({ok:true,application,autoApproved:autoApprove},{status:201});
}
