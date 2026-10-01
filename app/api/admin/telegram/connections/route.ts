import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const clean=(v:unknown,max=190)=>typeof v==="string"?v.trim().slice(0,max):"";

export async function GET(request:Request){
  const workspaceId=new URL(request.url).searchParams.get("workspaceId");
  const access=await authorizeWorkspacePermission("telegram.view",workspaceId);
  if(!access)return NextResponse.json({error:"Unauthorized or workspace access denied."},{status:403});
  const connections=await prisma.telegramBusinessConnection.findMany({where:{workspaceId:access.workspace.id},orderBy:{createdAt:"desc"}});
  return NextResponse.json({workspace:access.workspace,connections});
}

export async function POST(request:Request){
  const body=await request.json().catch(()=>({}));
  const workspaceId=clean(body.workspaceId,36);
  const access=await authorizeWorkspacePermission("telegram.manage",workspaceId);
  if(!access)return NextResponse.json({error:"Unauthorized or workspace access denied."},{status:403});
  const displayName=clean(body.displayName);
  const connectionType=body.connectionType==="BUSINESS"?"BUSINESS":"BOT";
  const botUsername=clean(body.botUsername)||null;
  const botId=clean(body.botId,80)||null;
  const telegramBusinessConnectionId=clean(body.telegramBusinessConnectionId)||null;
  const botTokenEnvKey=clean(body.botTokenEnvKey)||null;
  if(!displayName)return NextResponse.json({error:"Display name is required."},{status:400});
  if(connectionType==="BUSINESS"&&!telegramBusinessConnectionId)return NextResponse.json({error:"Telegram Business connection ID is required for a BUSINESS connection."},{status:400});
  const connection=await prisma.telegramBusinessConnection.create({data:{id:randomUUID(),workspaceId,displayName,connectionType,status:"PENDING",botUsername,botId,telegramBusinessConnectionId,botTokenEnvKey,permissions:body.permissions&&typeof body.permissions==="object"?body.permissions:{},createdBy:access.user?.email||access.user?.id||null}});
  return NextResponse.json({connection},{status:201});
}

export async function PATCH(request:Request){
  const body=await request.json().catch(()=>({}));
  const id=clean(body.id,36); if(!id)return NextResponse.json({error:"Connection id is required."},{status:400});
  const existing=await prisma.telegramBusinessConnection.findUnique({where:{id}});
  if(!existing)return NextResponse.json({error:"Telegram connection not found."},{status:404});
  const access=await authorizeWorkspacePermission("telegram.manage",existing.workspaceId);
  if(!access)return NextResponse.json({error:"Unauthorized or workspace access denied."},{status:403});
  const data:any={};
  for(const k of ["displayName","botUsername","botId","telegramBusinessConnectionId","botTokenEnvKey","webhookStatus","webhookUrl","lastError"])if(body[k]!==undefined)data[k]=clean(body[k],k==="webhookUrl"?1000:190)||null;
  if(body.status&&["PENDING","ACTIVE","DISABLED","ERROR"].includes(body.status))data.status=body.status;
  if(body.permissions&&typeof body.permissions==="object")data.permissions=body.permissions;
  if(body.status==="ACTIVE")data.lastConnectedAt=new Date();
  const connection=await prisma.telegramBusinessConnection.update({where:{id},data});
  return NextResponse.json({connection});
}
