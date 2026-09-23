import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import type { RowDataPacket } from "mysql2/promise";
import { authorizePermission } from "@/lib/authorization";
import { db } from "@/lib/db";
import { PUBLIC_CONTENT, PUBLIC_FONT_OPTIONS } from "@/lib/public-content";

type Row=RowDataPacket&{id:string;page_path:string;content_key:string;label:string;value:string;font_family:string;font_size:number;active:number;updated_by:string|null};

async function seed(){for(const item of PUBLIC_CONTENT) await db.query("INSERT INTO public_content (id,page_path,content_key,label,value,font_family,font_size) VALUES (?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE label=VALUES(label)",[randomUUID(),item.pagePath,item.key,item.label,item.defaultValue,item.fontFamily||"inherit",item.fontSize||16]);}

export async function GET(){const user=await authorizePermission("content.manage");if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});await seed();const [rows]=await db.query<Row[]>("SELECT id,page_path,content_key,label,value,font_family,font_size,active,updated_by FROM public_content ORDER BY page_path,content_key");return NextResponse.json({items:rows,fonts:PUBLIC_FONT_OPTIONS});}

export async function PUT(request:Request){const user=await authorizePermission("content.manage");if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});const body=await request.json().catch(()=>null) as {id?:string;value?:string;fontFamily?:string;fontSize?:number;active?:boolean}|null;if(!body?.id||typeof body.value!=="string")return NextResponse.json({error:"Invalid content payload"},{status:400});const font=PUBLIC_FONT_OPTIONS.some(x=>x.value===body.fontFamily)?body.fontFamily!:"inherit";const size=Number(body.fontSize);if(!Number.isFinite(size)||size<8||size>96)return NextResponse.json({error:"Font size must be between 8 and 96px"},{status:400});await db.query("UPDATE public_content SET value=?,font_family=?,font_size=?,active=?,updated_by=? WHERE id=?",[body.value.trim(),font,size,body.active===false?0:1,user.email,body.id]);return NextResponse.json({ok:true});}