import { NextResponse } from "next/server";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import { evaluateCommercialPartnerEligibility } from "@/lib/commercial-eligibility";

const clean=(v:unknown,max:number)=>typeof v==="string"?v.trim().slice(0,max):"";

export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 const url=new URL(request.url); const workspaceId=clean(url.searchParams.get("workspaceId"),36); const partnerId=clean(url.searchParams.get("partnerId"),36);
 const access=await authorizeWorkspacePermission("products.manage",workspaceId);
 if(!access)return NextResponse.json({error:"Workspace access denied."},{status:403});
 if(!partnerId)return NextResponse.json({error:"partnerId is required."},{status:400});
 const rows=await prisma.commercialEligibilityDecisionRecord.findMany({where:{workspaceId:access.workspace.id,listingId:id,partnerId},orderBy:{evaluatedAt:"desc"},take:20});
 return NextResponse.json({decisions:rows});
}

export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params; const body=await request.json().catch(()=>({}));
 const workspaceId=clean(body.workspaceId,36), partnerId=clean(body.partnerId,36), authorizationId=clean(body.authorizationId,36)||null;
 const access=await authorizeWorkspacePermission("products.manage",workspaceId);
 if(!access)return NextResponse.json({error:"Workspace access denied."},{status:403});
 if(!partnerId)return NextResponse.json({error:"partnerId is required."},{status:400});
 try{
  const result=await evaluateCommercialPartnerEligibility({workspaceId:access.workspace.id,listingId:id,partnerId,authorizationId,channel:clean(body.channel,100)||null,territory:clean(body.territory,190)||null,actorId:access.user.id});
  return NextResponse.json({ok:true,...result});
 }catch(error){
  const message=error instanceof Error?error.message:"Eligibility evaluation failed.";
  if(message==="LISTING_NOT_FOUND"||message==="PARTNER_NOT_FOUND")return NextResponse.json({error:"Listing or partner not found in this workspace."},{status:404});
  return NextResponse.json({error:"Eligibility evaluation failed."},{status:500});
 }
}
