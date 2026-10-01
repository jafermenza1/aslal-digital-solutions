import { NextResponse } from "next/server";
import { authorizePermission } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { getWorkspaceForUser } from "@/lib/workspaces";

export const dynamic="force-dynamic";

export async function GET(){
  const user=await authorizePermission("partner.portal.view");
  if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
  const workspace=await getWorkspaceForUser(user);
  if(!workspace)return NextResponse.json({error:"Workspace unavailable"},{status:403});
  const linked=await prisma.user.findUnique({where:{id:user.id},select:{partnerId:true}});
  if(!linked?.partnerId)return NextResponse.json({error:"Partner account is not linked."},{status:409});
  const programs=await prisma.partnerProgram.findMany({
    where:{workspaceId:workspace.id,status:"PUBLISHED"},
    orderBy:{createdAt:"desc"},take:100,
    include:{terms:{where:{active:true},take:1},contracts:{where:{partnerId:linked.partnerId},take:1}}
  });
  return NextResponse.json({programs:programs.map(p=>({id:p.id,name:p.name,slug:p.slug,description:p.description,admissionMode:p.admissionMode,allowedPartnerTypes:p.allowedPartnerTypes,status:p.status,terms:p.terms[0]||null,contract:p.contracts[0]?{id:p.contracts[0].id,status:p.contracts[0].status,acceptedAt:p.contracts[0].acceptedAt}:null}))});
}