import { NextResponse } from "next/server";
import { authorizePermission } from "@/lib/authorization";
import { getWorkspaceForUser } from "@/lib/workspaces";
import { ensureTranslationDictionary,getTranslationRows } from "@/lib/translation-registry";
import { db } from "@/lib/db";
export const dynamic="force-dynamic";
export async function GET(){const user=await authorizePermission("content.manage");if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});const w=await getWorkspaceForUser(user);if(!w)return NextResponse.json({error:"Workspace unavailable"},{status:403});return NextResponse.json({items:await getTranslationRows(w.id),locales:["en","am","ar","om"]});}
export async function PUT(request:Request){const user=await authorizePermission("content.manage");if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});const w=await getWorkspaceForUser(user);if(!w)return NextResponse.json({error:"Workspace unavailable"},{status:403});const body=await request.json().catch(()=>null);if(!body?.id||typeof body.translatedText!=="string")return NextResponse.json({error:"Invalid translation payload"},{status:400});await db.query("UPDATE translation_entries SET translated_text=?,active=?,updated_by=? WHERE id=? AND workspace_id=?",[String(body.translatedText).trim(),body.active===false?0:1,user.email,String(body.id),w.id]);return NextResponse.json({ok:true});}
export async function POST(){const user=await authorizePermission("content.manage");if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});const w=await getWorkspaceForUser(user);if(!w)return NextResponse.json({error:"Workspace unavailable"},{status:403});await ensureTranslationDictionary(w.id);return NextResponse.json({ok:true});}
