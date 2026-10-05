import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import type { RowDataPacket } from "mysql2/promise";
import { authorizePermission } from "@/lib/authorization";
import { getWorkspaceForUser } from "@/lib/workspaces";
import { db } from "@/lib/db";
import { PUBLIC_CONTENT, PUBLIC_FONT_OPTIONS } from "@/lib/public-content";

type Row=RowDataPacket&{id:string;workspace_id:string;page_path:string;content_key:string;label:string;value:string;rich_html:string|null;format:string;font_family:string;font_size:number;active:number;updated_by:string|null};

async function seed(workspaceId:string){for(const item of PUBLIC_CONTENT) await db.query("INSERT INTO public_content (id,workspace_id,page_path,content_key,label,value,font_family,font_size) VALUES (?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE label=VALUES(label)",[randomUUID(),workspaceId,item.pagePath,item.key,item.label,item.defaultValue,item.fontFamily||"inherit",item.fontSize||16]);}

export async function GET(){
 const user=await authorizePermission("content.manage");if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
 const workspace=await getWorkspaceForUser(user);if(!workspace)return NextResponse.json({error:"Workspace unavailable"},{status:403});
 await seed(workspace.id);
 const [rows]=await db.query<Row[]>("SELECT id,workspace_id,page_path,content_key,label,value,rich_html,format,font_family,font_size,active,updated_by FROM public_content WHERE workspace_id=? ORDER BY page_path,content_key",[workspace.id]);
 return NextResponse.json({items:rows,fonts:PUBLIC_FONT_OPTIONS,workspace:{id:workspace.id,name:workspace.name}});
}

export async function PUT(request:Request){
 const user=await authorizePermission("content.manage");if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
 const workspace=await getWorkspaceForUser(user);if(!workspace)return NextResponse.json({error:"Workspace unavailable"},{status:403});
 const body=await request.json().catch(()=>null) as {id?:string;value?:string;richHtml?:string;format?:string;fontFamily?:string;fontSize?:number;active?:boolean}|null;
 if(!body?.id||typeof body.value!=="string")return NextResponse.json({error:"Invalid content payload"},{status:400});
 const richHtml=sanitizeRichHtml(typeof body.richHtml==="string"?body.richHtml:"");const plain=stripRichHtml(richHtml,body.value);
 const format=richHtml?"rich":"plain";const font=PUBLIC_FONT_OPTIONS.some(x=>x.value===body.fontFamily)?body.fontFamily!:"inherit";
 const size=Number(body.fontSize);if(!Number.isFinite(size)||size<8||size>96)return NextResponse.json({error:"Font size must be between 8 and 96px"},{status:400});
 const [result]=await db.query<any>("UPDATE public_content SET value=?,rich_html=?,format=?,font_family=?,font_size=?,active=?,updated_by=? WHERE id=? AND workspace_id=?",[plain,richHtml||null,format,font,size,body.active===false?0:1,user.email,body.id,workspace.id]);
 if(!result.affectedRows)return NextResponse.json({error:"Content not found in active workspace"},{status:404});
 return NextResponse.json({ok:true});
}
function sanitizeRichHtml(input:string){
 let html=input.replace(/<script[^>]*>[\s\S]*?<\/script>/gi,"").replace(/<style[^>]*>[\s\S]*?<\/style>/gi,"");
 html=html.replace(/\s(on[a-z]+|style|class|id|srcset)\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi,"");
 html=html.replace(/<(\/?)((?!p\b|br\b|strong\b|b\b|em\b|i\b|u\b|s\b|h2\b|h3\b|ul\b|ol\b|li\b|blockquote\b|a\b|img\b)[^>]*)>/gi,"");
 html=html.replace(/<a([^>]*)href\s*=\s*(".*?"|'.*?'|[^\s>]+)([^>]*)>/gi,(m,before,url,after)=>{const raw=String(url).replace(/^['"]|['"]$/g,"");return /^https?:\/\//i.test(raw)||raw.startsWith("/")||raw.startsWith("#")?"<a"+before+"href=\""+raw.replace(/"/g,"&quot;")+"\""+after+">":"<a"+before+"href=\"#\""+after+">"});
 html=html.replace(/<img([^>]*)src\s*=\s*(".*?"|'.*?'|[^\s>]+)([^>]*)>/gi,(m,before,url,after)=>{const raw=String(url).replace(/^['"]|['"]$/g,"");return /^https?:\/\//i.test(raw)||raw.startsWith("/")?"<img"+before+"src=\""+raw.replace(/"/g,"&quot;")+"\""+after+" loading=\"lazy\" />":""});
 return html.trim();
}
function stripRichHtml(html:string,fallback:string){const plain=html.replace(/<br\s*\/?>/gi,"\n").replace(/<\/p>/gi,"\n").replace(/<[^>]+>/g,"").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'").trim();return plain||fallback.trim();}