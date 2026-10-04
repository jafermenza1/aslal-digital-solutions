import { NextResponse } from "next/server";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import { getTelegramChannelConfig } from "@/lib/telegram-channel-config";

export const runtime="nodejs";
export const dynamic="force-dynamic";

async function telegram(method:string,body?:Record<string,unknown>){
 const token=process.env.TELEGRAM_BOT_TOKEN;
 if(!token)throw new Error("TELEGRAM_BOT_TOKEN is not configured");
 const r=await fetch("https://api.telegram.org/bot"+token+"/"+method,{method:body?"POST":"GET",headers:body?{"content-type":"application/json"}:undefined,body:body?JSON.stringify(body):undefined,cache:"no-store"});
 const data=await r.json().catch(()=>({}));
 if(!r.ok||!data.ok)throw new Error(String(data.description||"Telegram API request failed"));
 return data.result;
}

export async function GET(request:Request){
 const workspaceId=new URL(request.url).searchParams.get("workspaceId");
 const access=await authorizeWorkspacePermission("telegram.view",workspaceId);
 if(!access)return NextResponse.json({error:"Unauthorized or workspace access denied."},{status:403});
 const cfg=await getTelegramChannelConfig(access.workspace.id);
 if(!cfg)return NextResponse.json({error:"Telegram channel configuration is not initialized."},{status:404});
 try{
  const info=await telegram("getWebhookInfo");
  return NextResponse.json({ok:true,workspaceId:access.workspace.id,enabled:cfg.enabled,publicEnabled:cfg.publicEnabled,miniAppEnabled:cfg.miniAppEnabled,webhook:info});
 }catch(error){
  return NextResponse.json({ok:false,error:error instanceof Error?error.message:"Telegram API unavailable.",enabled:cfg.enabled,publicEnabled:cfg.publicEnabled,miniAppEnabled:cfg.miniAppEnabled},{status:503});
 }
}

export async function POST(request:Request){
 const body=await request.json().catch(()=>({}));
 const workspaceId=typeof body.workspaceId==="string"?body.workspaceId:null;
 const access=await authorizeWorkspacePermission("telegram.manage",workspaceId);
 if(!access)return NextResponse.json({error:"Unauthorized or workspace access denied."},{status:403});
 const site=(process.env.NEXT_PUBLIC_SITE_URL||"https://aslaldigital.com").replace(/\/$/,"");
 const secret=process.env.TELEGRAM_WEBHOOK_SECRET;
 if(!secret)return NextResponse.json({error:"TELEGRAM_WEBHOOK_SECRET is not configured."},{status:503});
 try{
  const result=await telegram("setWebhook",{url:site+"/api/telegram/webhook",secret_token:secret,allowed_updates:["message","callback_query","inline_query"],drop_pending_updates:false});
  const info=await telegram("getWebhookInfo");
  return NextResponse.json({ok:true,result,webhook:info});
 }catch(error){
  return NextResponse.json({error:error instanceof Error?error.message:"Unable to synchronize Telegram webhook."},{status:503});
 }
}
