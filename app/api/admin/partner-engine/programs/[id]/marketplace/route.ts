import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeWorkspacePermission } from "@/lib/workspaces";

export async function GET(req:Request,{params}:{params:{id:string}}){
  const access=await authorizeWorkspacePermission("partners.manage");
  if(!access)return NextResponse.json({error:"Unauthorized"},{status:401});
  const p=await prisma.partnerProgram.findFirst({where:{id:params.id,workspaceId:access.workspace.id},include:{marketplaceProfile:true}});
  if(!p)return NextResponse.json({error:"Program not found."},{status:404});
  return NextResponse.json({profile:p.marketplaceProfile});
}
export async function PUT(req:Request,{params}:{params:{id:string}}){
  const access=await authorizeWorkspacePermission("partners.manage");
  if(!access)return NextResponse.json({error:"Unauthorized"},{status:401});
  const p=await prisma.partnerProgram.findFirst({where:{id:params.id,workspaceId:access.workspace.id}});
  if(!p)return NextResponse.json({error:"Program not found."},{status:404});
  const b=await req.json().catch(()=>({}));
  const category=String(b.category||"General").trim().slice(0,100);
  const data={category,headline:String(b.headline||"").trim()||null,offerSummary:String(b.offerSummary||"").trim()||null,partnerBenefits:String(b.partnerBenefits||"").trim()||null,eligibilitySummary:String(b.eligibilitySummary||"").trim()||null,supportDescription:String(b.supportDescription||"").trim()||null,logoUrl:String(b.logoUrl||"").trim()||null,featured:Boolean(b.featured),displayOrder:Number.isInteger(b.displayOrder)?b.displayOrder:0};
  const profile=await prisma.marketplaceProgramProfile.upsert({where:{programId:p.id},create:{id:crypto.randomUUID(),workspaceId:access.workspace.id,programId:p.id,...data},update:data});
  return NextResponse.json({profile});
}
