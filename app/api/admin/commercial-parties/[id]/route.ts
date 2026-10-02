import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeWorkspacePermission } from "@/lib/workspaces";

const TYPES=["BUSINESS","SUPPLIER","ASSET_OWNER","SERVICE_PROVIDER","EXTERNAL_OWNER"] as const;
const STATUSES=["ACTIVE","SUSPENDED","ARCHIVED"] as const;
const clean=(v:unknown,max:number)=>typeof v==="string"?v.trim().slice(0,max):"";

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 const body=await request.json().catch(()=>({}));
 const workspaceId=clean(body.workspaceId,36);
 const access=await authorizeWorkspacePermission("products.manage",workspaceId);
 if(!access)return NextResponse.json({error:"Workspace access denied."},{status:403});
 const current=await prisma.commercialParty.findFirst({where:{id,workspaceId:access.workspace.id}});
 if(!current)return NextResponse.json({error:"Commercial party not found."},{status:404});
 const type=String(body.type??current.type),status=String(body.status??current.status);
 const name=clean(body.name??current.name,190);
 if(!name||!TYPES.includes(type as any)||!STATUSES.includes(status as any))
  return NextResponse.json({error:"Invalid party data."},{status:400});
 const party=await prisma.commercialParty.update({where:{id},data:{
  name,type:type as any,status:status as any,email:clean(body.email??current.email,190)||null,
  phone:clean(body.phone??current.phone,40)||null,contactName:clean(body.contactName??current.contactName,160)||null,
  description:clean(body.description??current.description,20000)||null,
  metadata:body.metadata===undefined?current.metadata:(body.metadata&&typeof body.metadata==="object"?body.metadata:null)
 }});
 return NextResponse.json({ok:true,party});
}
