import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import type { RowDataPacket } from "mysql2/promise";
import { authorizePermission } from "@/lib/authorization";
import { db } from "@/lib/db";
import { ensureResources } from "@/lib/resources-server";

type Row=RowDataPacket&{id:string;slug:string;category:string;title:string;description:string;preview:string;cta:string;intent:string;download_url:string|null;active:number;published_at:Date;updated_at:Date};

export async function GET(request:Request){
  const user=await authorizePermission("content.manage"); if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
  await ensureResources();
  const url=new URL(request.url); const category=url.searchParams.get("category")||""; const days=Math.min(3650,Math.max(1,Number(url.searchParams.get("days")||3650)));
  const [rows]=await db.query<Row[]>(`SELECT id,slug,category,title,description,preview,cta,intent,download_url,active,published_at,updated_at FROM resources WHERE published_at >= DATE_SUB(NOW(), INTERVAL ? DAY) ${category?"AND category=?":""} ORDER BY published_at DESC`,category?[days,category]:[days]);
  return NextResponse.json({items:rows});
}

export async function PUT(request:Request){
  const user=await authorizePermission("content.manage"); if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
  const body=await request.json().catch(()=>null) as Record<string,unknown>|null;
  const id=typeof body?.id==="string"?body.id:""; if(!id)return NextResponse.json({error:"Resource id is required."},{status:400});
  const fields=["category","title","description","preview","cta","intent","downloadUrl"] as const;
  for(const f of fields)if(typeof body?.[f]!=="string"||!(body?.[f] as string).trim())return NextResponse.json({error:`${f} is required.`},{status:400});
  const downloadUrl=typeof body?.downloadUrl==="string"?body.downloadUrl.trim():"";
  if(downloadUrl && !downloadUrl.startsWith("/resources/downloads/"))return NextResponse.json({error:"Download URL must point inside /resources/downloads/."},{status:400});
  const active=body?.active!==false;
  const publishedAt=typeof body?.publishedAt==="string"&&body.publishedAt?new Date(body.publishedAt):new Date();
  if(Number.isNaN(publishedAt.getTime()))return NextResponse.json({error:"Invalid publish date."},{status:400});
  await db.query(`UPDATE resources SET category=?,title=?,description=?,preview=?,cta=?,intent=?,download_url=?,active=?,published_at=? WHERE id=?`,
    [body.category,body.title,body.description,body.preview,body.cta,body.intent,downloadUrl||null,active?1:0,publishedAt,id]);
  return NextResponse.json({ok:true});
}

export async function POST(request:Request){
  const user=await authorizePermission("content.manage"); if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
  const body=await request.json().catch(()=>null) as Record<string,unknown>|null;
  const slug=typeof body?.slug==="string"?body.slug.trim().toLowerCase():"";
  if(!/^[a-z0-9-]{3,160}$/.test(slug))return NextResponse.json({error:"Invalid slug."},{status:400});
  const required=["category","title","description","preview","cta","intent"] as const;
  if(required.some(k=>typeof body?.[k]!=="string"||!(body[k] as string).trim()))return NextResponse.json({error:"All resource fields are required."},{status:400});
  const downloadUrl=typeof body?.downloadUrl==="string"?body.downloadUrl.trim():"";
  if(downloadUrl&&!downloadUrl.startsWith("/resources/downloads/"))return NextResponse.json({error:"Download URL must point inside /resources/downloads/."},{status:400});
  await db.query(`INSERT INTO resources (id,slug,category,title,description,preview,cta,intent,download_url,active,published_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [randomUUID(),slug,body.category,body.title,body.description,body.preview,body.cta,body.intent,downloadUrl||null,1,new Date()]);
  return NextResponse.json({ok:true});
}
