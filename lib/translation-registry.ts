import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { copy } from "@/lib/i18n";
import { appUi } from "@/lib/app-i18n";
import { INTERNAL_WORKSPACE_ID } from "@/lib/workspaces";
import { PUBLIC_CONTENT } from "@/lib/public-content";

function flatten(value:any,prefix="",out:{key:string;original:string;label:string}[]=[]){
  if(typeof value==="string"){out.push({key:prefix,original:value,label:prefix.split(".").slice(-1)[0]||prefix});return out;}
  if(value&&typeof value==="object") for(const [k,v] of Object.entries(value)) flatten(v,prefix?prefix+"."+k:k,out);
  return out;
}

export async function ensureTranslationDictionary(workspaceId=INTERNAL_WORKSPACE_ID){
  const [existing]=await db.query<any[]>("SELECT id FROM translation_entries WHERE workspace_id=? LIMIT 1",[workspaceId]);
  if(existing[0]) return;
  const entries:any[]=[];
  for(const [locale,value] of Object.entries(copy)) for(const item of flatten(value)) entries.push(["SITE",locale,item.key,item.label,item.original]);
  for(const [locale,value] of Object.entries(appUi)) for(const item of flatten(value)) entries.push(["APP",locale,item.key,item.label,item.original]);
  for(const item of PUBLIC_CONTENT){
    for(const locale of Object.keys(copy)) entries.push(["SITE",locale,item.key,item.label,item.defaultValue]);
  }
  for(const [surface,locale,key,label,original] of entries){
    await db.query("INSERT INTO translation_entries (id,workspace_id,surface,locale,translation_key,label,original_text,translated_text) VALUES (?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE original_text=VALUES(original_text),label=VALUES(label)",
      [randomUUID(),workspaceId,surface,locale,key,label,original,locale==="en"?original:null]);
  }
}

export async function getTranslationRows(workspaceId=INTERNAL_WORKSPACE_ID){
  await ensureTranslationDictionary(workspaceId);
  const [rows]=await db.query<any[]>("SELECT id,surface,locale,translation_key,label,original_text,translated_text,active,updated_by,updated_at FROM translation_entries WHERE workspace_id=? ORDER BY surface,locale,translation_key",[workspaceId]);
  return rows;
}
