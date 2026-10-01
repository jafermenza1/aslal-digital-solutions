import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizePermission } from "@/lib/authorization";

export async function GET() {
  const access=await authorizePermission("partner.portal.view");
  if(!access)return NextResponse.json({error:"Unauthorized"},{status:401});
  const partner=await prisma.partner.findFirst({where:{user:{is:{id:access.id}}},select:{id:true,partnerNumber:true,name:true,type:true,accountStatus:true,verificationLevel:true,tier:true}});
  if(!partner)return NextResponse.json({error:"Partner account is not linked."},{status:404});
  const [contracts,applications,commissions,payouts]=await Promise.all([
    prisma.commissionContract.findMany({
      where:{partnerId:partner.id},
      include:{workspace:{select:{id:true,name:true,slug:true}},program:{select:{id:true,name:true,slug:true,status:true,admissionMode:true,marketplaceProfile:true}}},
      orderBy:{createdAt:"desc"},take:250,
    }),
    prisma.partnerProgramApplication.findMany({
      where:{partnerId:partner.id},
      include:{workspace:{select:{id:true,name:true,slug:true}},program:{select:{id:true,name:true,slug:true,status:true,admissionMode:true}}},
      orderBy:{createdAt:"desc"},take:250,
    }),
    prisma.commission.findMany({where:{partnerId:partner.id},select:{workspaceId:true,status:true,amount:true,currentBalance:true,currency:true}}),
    prisma.partnerPayout.findMany({where:{partnerId:partner.id},select:{workspaceId:true,status:true,amount:true,currency:true}}),
  ]);
  const businesses=new Map<string,{workspaceId:string;name:string;programs:number;activePrograms:number;earned:number;balance:number;paid:number;currency:string}>();
  for(const c of contracts){
    const b=businesses.get(c.workspaceId)||{workspaceId:c.workspaceId,name:c.workspace.name,programs:0,activePrograms:0,earned:0,balance:0,paid:0,currency:"ETB"};
    b.programs++; if(c.status==="ACTIVE")b.activePrograms++; businesses.set(c.workspaceId,b);
  }
  for(const c of commissions){
    const b=businesses.get(c.workspaceId); if(!b)continue;
    const amount=Number(c.amount||0), balance=Number(c.currentBalance||0);
    b.earned+=amount; b.balance+=balance; b.currency=c.currency;
    if(c.status==="PAID")b.paid+=amount;
  }
  for(const p of payouts){
    const b=businesses.get(p.workspaceId); if(b&&p.status==="PAID")b.paid+=Number(p.amount||0);
  }
  return NextResponse.json({
    partner,
    summary:{businesses:businesses.size,activePrograms:contracts.filter(c=>c.status==="ACTIVE").length,pendingApplications:applications.filter(a=>["PENDING","UNDER_REVIEW"].includes(a.status)).length,totalEarned:commissions.reduce((n,c)=>n+Number(c.amount||0),0),currentBalance:commissions.reduce((n,c)=>n+Number(c.currentBalance||0),0)},
    businesses:[...businesses.values()],
    participations:contracts.map(c=>({id:c.id,workspace:c.workspace,program:c.program,status:c.status,acceptedAt:c.acceptedAt,termsSnapshot:c.termsSnapshot})),
    applications,
  });
}
