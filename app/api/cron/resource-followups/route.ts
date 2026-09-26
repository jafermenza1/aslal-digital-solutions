import { NextResponse } from "next/server";
import { runResourceFollowUps } from "@/lib/resource-followups";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(request:Request){
 const secret=String(process.env.RESOURCE_FOLLOWUP_CRON_SECRET||process.env.AUTOMATION_CRON_SECRET||"");
 if(!secret)return NextResponse.json({ok:false,error:"Resource follow-up cron secret is not configured"},{status:503});
 const provided=request.headers.get("authorization")?.replace(/^Bearer\\s+/i,"")||"";
 if(provided!==secret)return NextResponse.json({ok:false,error:"Unauthorized"},{status:401});
 try{return NextResponse.json({ok:true,resourceFollowUps:await runResourceFollowUps()},{headers:{"Cache-Control":"no-store"}})}
 catch(error){console.error("RESOURCE_FOLLOWUP_CRON_ERROR",error);return NextResponse.json({ok:false,error:"Resource follow-up processing failed"},{status:502});}
}