import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";

export type PageBlock={id:string;type:"hero"|"text"|"image"|"cta"|"spacer";props:Record<string,unknown>};
export type PageDraft={blocks:PageBlock[]};
const parse=(v:any,f:any)=>{try{return v?JSON.parse(v):f}catch{return f}};
const normalize=(v:any):PageDraft=>{
 const a=Array.isArray(v?.blocks)?v.blocks:Array.isArray(v)?v:[];
 return {blocks:a.slice(0,100).map((b:any,i:number)=>({id:String(b?.id||("block-"+(i+1))).slice(0,80),type:["hero","text","image","cta","spacer"].includes(b?.type)?b.type:"text",props:b?.props&&typeof b.props==="object"&&!Array.isArray(b.props)?b.props:{}}))};
};
export async function getPage(workspaceId:string,slug:string){const [rows]=await db.query<any[]>("SELECT * FROM website_pages WHERE workspace_id=? AND slug=? LIMIT 1",[workspaceId,slug]);return rows[0]||null;}
export async function ensurePage(workspaceId:string,slug:string,title:string,actor:string){let page=await getPage(workspaceId,slug);if(page)return page;const id=randomUUID();await db.query("INSERT INTO website_pages (id,workspace_id,slug,title,status,draft_json,draft_version,lock_version,created_by,updated_by) VALUES (?,?,?,?,?,?,?,?,?,?)",[id,workspaceId,slug,title,"DRAFT",JSON.stringify({blocks:[]}),1,1,actor,actor]);return getPage(workspaceId,slug);}
export async function saveDraft(workspaceId:string,slug:string,title:string,value:any,expected:number|undefined,actor:string,summary:string){
 const page=await ensurePage(workspaceId,slug,title,actor);const lock=Number(page.lock_version||1);
 if(expected!=null&&expected!==lock)throw new Error("CONTENT_CONFLICT");
 const draft=normalize(value),version=Number(page.draft_version||0)+1;
 await db.query("UPDATE website_pages SET title=?,draft_json=?,draft_version=?,lock_version=?,status=CASE WHEN status='PUBLISHED' THEN 'DRAFT' ELSE status END,updated_by=? WHERE id=? AND workspace_id=? AND lock_version=?",[title,JSON.stringify(draft),version,lock+1,actor,page.id,workspaceId,lock]);
 await db.query("INSERT INTO website_page_revisions (id,workspace_id,page_id,version,state,content_json,change_summary,created_by) VALUES (?,?,?,?,?,?,?,?)",[randomUUID(),workspaceId,page.id,version,"DRAFT",JSON.stringify(draft),summary||"Draft updated",actor]);
 return getPage(workspaceId,slug);
}
export async function publishPage(workspaceId:string,slug:string,actor:string){
 const page=await getPage(workspaceId,slug);if(!page)throw new Error("PAGE_NOT_FOUND");
 const version=Number(page.draft_version||1),now=new Date();
 await db.query("UPDATE website_pages SET published_json=draft_json,published_version=?,status='PUBLISHED',published_at=?,published_by=?,lock_version=lock_version+1,updated_by=? WHERE id=? AND workspace_id=?",[version,now,actor,actor,page.id,workspaceId]);
 await db.query("INSERT INTO website_page_revisions (id,workspace_id,page_id,version,state,content_json,change_summary,created_by) VALUES (?,?,?,?,?,?,?,?)",[randomUUID(),workspaceId,page.id,version,"PUBLISHED",page.draft_json||JSON.stringify({blocks:[]}),"Published",actor]);
 return getPage(workspaceId,slug);
}
export async function unpublishPage(workspaceId:string,slug:string,actor:string){
 const page=await getPage(workspaceId,slug);if(!page)throw new Error("PAGE_NOT_FOUND");
 await db.query("UPDATE website_pages SET status='DRAFT',published_at=NULL,published_by=NULL,lock_version=lock_version+1,updated_by=? WHERE id=? AND workspace_id=?",[actor,page.id,workspaceId]);
 return getPage(workspaceId,slug);
}
export async function rollbackPage(workspaceId:string,slug:string,version:number,actor:string){
 const page=await getPage(workspaceId,slug);if(!page)throw new Error("PAGE_NOT_FOUND");
 const [rows]=await db.query<any[]>("SELECT content_json FROM website_page_revisions WHERE workspace_id=? AND page_id=? AND version=? LIMIT 1",[workspaceId,page.id,version]);
 if(!rows[0])throw new Error("VERSION_NOT_FOUND");
 const draft=normalize(parse(rows[0].content_json,{blocks:[]})),next=Number(page.draft_version||0)+1,lock=Number(page.lock_version||1);
 await db.query("UPDATE website_pages SET draft_json=?,draft_version=?,status='DRAFT',lock_version=?,updated_by=? WHERE id=? AND workspace_id=?",[JSON.stringify(draft),next,lock+1,actor,page.id,workspaceId]);
 await db.query("INSERT INTO website_page_revisions (id,workspace_id,page_id,version,state,content_json,change_summary,created_by) VALUES (?,?,?,?,?,?,?,?)",[randomUUID(),workspaceId,page.id,next,"DRAFT",JSON.stringify(draft),"Rollback from version "+version,actor]);
 return getPage(workspaceId,slug);
}
