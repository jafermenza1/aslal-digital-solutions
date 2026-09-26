import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import { SOCIAL_PLATFORMS } from "@/lib/social-profiles";

const clean=(v:unknown,n:number)=>typeof v==="string"?v.trim().slice(0,n):"";
export async function GET(){
 const ctx=await authorizeWorkspacePermission("content.manage"); if(!ctx)return NextResponse.json({error:"Social profile administration is not permitted."},{status:403});
 const [rows]=await db.query("SELECT id,platform,label,url,handle,display_order,is_active FROM social_profiles WHERE workspace_id=? ORDER BY display_order ASC, platform ASC",[ctx.workspace.id]);
 return NextResponse.json({profiles:rows});
}
export async function PUT(request:Request){
 const ctx=await authorizeWorkspacePermission("content.manage"); if(!ctx)return NextResponse.json({error:"Social profile administration is not permitted."},{status:403});
 const body=await request.json().catch(()=>({})) as Record<string,unknown>;
 const id=clean(body.id,36), platform=clean(body.platform,40).toLowerCase(), label=clean(body.label,80), url=clean(body.url,1000), handle=clean(body.handle,190)||null;
 const displayOrder=Math.max(0,Math.min(9999,Number(body.displayOrder)||0)), isActive=body.isActive!==false;
 if(!SOCIAL_PLATFORMS.includes(platform as typeof SOCIAL_PLATFORMS[number])||!label||!/^https?:\/\//i.test(url))return NextResponse.json({error:"Platform, label and a valid https/http URL are required."},{status:400});
 if(id) await db.query("UPDATE social_profiles SET platform=?,label=?,url=?,handle=?,display_order=?,is_active=? WHERE id=? AND workspace_id=?",[platform,label,url,handle,displayOrder,isActive?1:0,id,ctx.workspace.id]);
 else await db.query("INSERT INTO social_profiles (id,workspace_id,platform,label,url,handle,display_order,is_active) VALUES (?,?,?,?,?,?,?,?)",[randomUUID(),ctx.workspace.id,platform,label,url,handle,displayOrder,isActive?1:0]);
 return NextResponse.json({ok:true});
}
export async function DELETE(request:Request){
 const ctx=await authorizeWorkspacePermission("content.manage"); if(!ctx)return NextResponse.json({error:"Social profile administration is not permitted."},{status:403});
 const body=await request.json().catch(()=>({})) as {id?:string}; if(!body.id)return NextResponse.json({error:"Profile id is required."},{status:400});
 await db.query("DELETE FROM social_profiles WHERE id=? AND workspace_id=?",[body.id,ctx.workspace.id]); return NextResponse.json({ok:true});
}