import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { db } from "@/lib/db";

function safeDestination(value:string|null){const v=(value||"/").trim();if(!v.startsWith("/")||v.startsWith("//")||v.includes("\\")||v.includes("\r")||v.includes("\n"))return "/";return v;}

export async function GET(request:Request,{params}:{params:Promise<{code:string}>}){
  const {code}=await params;
  const normalized=String(code||"").trim();
  if(!normalized)return NextResponse.redirect(new URL("/",request.url));
  try{
    const [rows]=await db.query<any[]>(`SELECT rl.id,rl.code,rl.workspace_id,rl.partner_id,rl.destination_path,rl.campaign_id,rl.product_slug,pc.program_id,pp.status program_status
      FROM referral_links rl
      LEFT JOIN partner_campaigns pc ON pc.id=rl.campaign_id AND pc.workspace_id=rl.workspace_id
      LEFT JOIN partner_programs pp ON pp.id=pc.program_id AND pp.workspace_id=rl.workspace_id
      JOIN partners p ON p.id=rl.partner_id AND p.workspace_id=rl.workspace_id
      WHERE rl.code=? LIMIT 1`,[normalized]);
    const link=rows[0];
    if(!link||(["DRAFT","PAUSED","ARCHIVED"].includes(String(link.program_status||""))))return NextResponse.redirect(new URL("/",request.url));
    const forwarded=request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()||"";
    const ipHash=forwarded?createHash("sha256").update(forwarded).digest("hex"):null;
    const userAgent=request.headers.get("user-agent")?.slice(0,500)||null;
    await db.query("INSERT INTO referral_clicks (referral_link_id,ip_hash,user_agent) VALUES (?,?,?)",[link.id,ipHash,userAgent]);
    const response=NextResponse.redirect(new URL(safeDestination(link.destination_path),request.url));
    response.cookies.set("aslal_referral_code",link.code,{httpOnly:false,sameSite:"lax",secure:request.url.startsWith("https:"),maxAge:60*60*24*30,path:"/"});
    response.cookies.set("aslal_referral_workspace",link.workspace_id,{httpOnly:false,sameSite:"lax",secure:request.url.startsWith("https:"),maxAge:60*60*24*30,path:"/"});
    return response;
  }catch(error){console.error("AFFILIATE_REDIRECT_ERROR",error);return NextResponse.redirect(new URL("/",request.url));}
}