import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeWorkspacePermission } from "@/lib/workspaces";

const STATUSES=["REQUESTED","APPROVED","ACTIVE","SUSPENDED","EXPIRED","REVOKED"] as const;
const clean=(v:unknown,max:number)=>typeof v==="string"?v.trim().slice(0,max):"";

export async function PATCH(request:Request,{params}:{params:Promise<{id:string;authorizationId:string}>}){
 const {id,authorizationId}=await params; const body=await request.json().catch(()=>({}));
 const workspaceId=clean(body.workspaceId,36);
 const access=await authorizeWorkspacePermission("products.manage",workspaceId);
 if(!access)return NextResponse.json({error:"Workspace access denied."},{status:403});
 const current=await prisma.commercialListingAuthorization.findFirst({where:{id:authorizationId,listingId:id,workspaceId:access.workspace.id}});
 if(!current)return NextResponse.json({error:"Authorization not found."},{status:404});
 const status=String(body.status??current.status);
 if(!STATUSES.includes(status as any))return NextResponse.json({error:"Invalid authorization status."},{status:400});
 const revoking=status==="REVOKED";
 const authorization=await prisma.commercialListingAuthorization.update({where:{id:authorizationId},data:{
  status:status as any,
  approvedBy:["APPROVED","ACTIVE"].includes(status)?(current.approvedBy||access.user.id):current.approvedBy,
  approvedAt:["APPROVED","ACTIVE"].includes(status)?(current.approvedAt||new Date()):current.approvedAt,
  revokedAt:revoking?new Date():current.revokedAt,
  revocationReason:revoking?(clean(body.revocationReason,20000)||"Authorization revoked by workspace operator."):current.revocationReason
 }});
 return NextResponse.json({ok:true,authorization});
}
