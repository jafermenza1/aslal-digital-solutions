import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import type { RowDataPacket } from "mysql2/promise";
import { authorizePermission } from "@/lib/authorization";
import { db } from "@/lib/db";
import { PUBLIC_CONTENT, PUBLIC_FONT_OPTIONS } from "@/lib/public-content";

type Row=RowDataPacket&{id:string;page_path:string;content_key:string;label:string;value:string;rich_html:string|null;format:string;font_family:string;font_size:number;active:number;updated_by:string|null};

async function seed(){for(const item of PUBLIC_CONTENT) await db.query("INSERT INTO public_content (id,page_path,content_key,label,value,font_family,font_size) VALUES (?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE label=VALUES(label)",[randomUUID(),item.pagePath,item.key,item.label,item.defaultValue,item.fontFamily||"inherit",item.fontSize||16]);}

export async function GET(){const user=await authorizePermission("content.manage");if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});await seed();const [rows]=await db.query<Row[]>("SELECT id,page_path,content_key,label,value,rich_html,format,font_family,font_size,active,updated_by FROM public_content ORDER BY page_path,content_key");return NextResponse.json({items:rows,fonts:PUBLIC_FONT_OPTIONS});}

export async function PUT(request:Request){const user=await authorizePermission("content.manage");if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});const body=await request.json().catch(()=>null) as {id?:string;value?:string;richHtml?:string;format?:string;fontFamily?:string;fontSize?:number;active?:boolean}|null;if(!body?.id||typeof body.value!=="string")return NextResponse.json({error:"Invalid content payload"},{status:400});const richHtml=sanitizeRichHtml(typeof body.richHtml==="string"?body.richHtml:"");const plain=stripRichHtml(richHtml,typeof body.value==="string"?body.value:"");const format=richHtml? "rich":"plain";const font=PUBLIC_FONT_OPTIONS.some(x=>x.value===body.fontFamily)?body.fontFamily!:"inherit";const size=Number(body.fontSize);if(!Number.isFinite(size)||size<8||size>96)return NextResponse.json({error:"Font size must be between 8 and 96px"},{status:400});await db.query("UPDATE public_content SET value=?,rich_html=?,format=?,font_family=?,font_size=?,active=?,updated_by=? WHERE id=?",[plain,richHtml||null,format,font,size,body.active===false?0:1,user.email,body.id]);return NextResponse.json({ok:true});}
function sanitizeRichHtml(input:string){
 let html=input.replace(/<script[^>]*>[\s\S]*?<\/script>/gi,"").replace(/<style[^>]*>[\s\S]*?<\/style>/gi,"");
 html=html.replace(/\s(on[a-z]+|style|class|id|srcset)\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi,"");
 html=html.replace(/<(\/?)(?!p\b|br\b|strong\b|b\b|em\b|i\b|u\b|s\b|h2\b|h3\b|ul\b|ol\b|li\b|blockquote\b|a\b|img\b)[^>]*>/gi,"");
 html=html.replace(/<a([^>]*)href\s*=\s*(".*?"|'.*?'|[^\s>]+)([^>]*)>/gi,(m,before,url,after)=>{const raw=String(url).replace(/^['"]|['"]$/g,"");return /^https?:\/\//i.test(raw)||raw.startsWith("/")||raw.startsWith("#")?"<a"+before+"href=\""+raw.replace(/"/g,"&quot;")+"\""+after+">":"<a"+before+"href=\"#\""+after+">"});
 html=html.replace(/<img([^>]*)src\s*=\s*(".*?"|'.*?'|[^\s>]+)([^>]*)>/gi,(m,before,url,after)=>{const raw=String(url).replace(/^['"]|['"]$/g,"");return /^https?:\/\//i.test(raw)||raw.startsWith("/")?"<img"+before+"src=\""+raw.replace(/"/g,"&quot;")+"\""+after+" loading=\"lazy\" />":""});
 return html.trim();
}
function stripRichHtml(html:string,fallback:string){const plain=html.replace(/<br\s*\/?>/gi,"\n").replace(/<\/p>/gi,"\n").replace(/<[^>]+>/g,"").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'\"').replace(/&#39;/g,"'").trim();return plain||fallback.trim();}
