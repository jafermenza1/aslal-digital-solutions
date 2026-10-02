import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { authorizeWorkspacePermission } from "@/lib/workspaces";

const TYPES=["BUSINESS","SUPPLIER","ASSET_OWNER","SERVICE_PROVIDER","EXTERNAL_OWNER"] as const;
const STATUSES=["ACTIVE","SUSPENDED","ARCHIVED"] as const;
const clean=(v:unknown,max:number)=>typeof v==="string"?v.trim().slice(0,max):"";

export async function GET(request:Request){
 const workspaceId=new URL(request.url).searchParams.get("workspaceId")?.trim()||"";
 const access=await authorizeWorkspacePermission("products.manage",workspaceId);
 if(!access)return NextResponse.json({error:"Workspace access denied."},{status:403});
 const parties=await prisma.commercialParty.findMany({
  where:{workspaceId:access.workspace.id},
  orderBy:[{status:"asc"},{name:"asc"}],
  include:{_count:{select:{ownedListings:true,suppliedListings:true,authorizations:true}}}
 });
 return NextResponse.json({parties,workspace:access.workspace});
}

export async function POST(request:Request){
 const body=await request.json().catch(()=>({}));
 const workspaceId=clean(body.workspaceId,36);
 const access=await authorizeWorkspacePermission("products.manage",workspaceId);
 if(!access||access.workspace.id!==workspaceId)return NextResponse.json({error:"Workspace access denied."},{status:403});
 const name=clean(body.name,190);
 const type=String(body.type||"BUSINESS");
 const status=String(body.status||"ACTIVE");
 if(!name||!TYPES.includes(type as any)||!STATUSES.includes(status as any))
  return NextResponse.json({error:"Name, party type and status are required."},{status:400});
 const party=await prisma.commercialParty.create({data:{
  id:randomUUID(),workspaceId,name,type:type as any,status:status as any,
  email:clean(body.email,190)||null,phone:clean(body.phone,40)||null,
  contactName:clean(body.contactName,160)||null,description:clean(body.description,20000)||null,
  metadata:body.metadata&&typeof body.metadata==="object"?body.metadata:null
 }});
 return NextResponse.json({ok:true,party},{status:201});
}
