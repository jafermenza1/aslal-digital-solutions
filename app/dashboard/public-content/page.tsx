import { requirePermission } from "@/lib/authorization";
import { ensurePublicContent, ensurePublicContentTranslations } from "@/lib/public-content";
import { db } from "@/lib/db";
import type { RowDataPacket } from "mysql2/promise";
import { PublicContentEditor } from "@/components/PublicContentEditor";
import { WebsiteStudio } from "@/components/WebsiteStudio";
import { TranslationStudio } from "@/components/TranslationStudio";
import { getWebsiteSettings } from "@/lib/website-settings";
import { getTranslationRows } from "@/lib/translation-registry";
import { getWorkspaceForUser } from "@/lib/workspaces";
type Row=RowDataPacket&{id:string;page_path:string;content_key:string;label:string;value:string;rich_html:string|null;format:string;font_family:string;font_size:number;active:number;updated_by:string|null};
export const dynamic="force-dynamic";
export default async function PublicContentPage(){
 const user=await requirePermission("content.manage");
 const workspace=await getWorkspaceForUser(user);
 if(!workspace)throw new Error("Workspace not available.");
 await ensurePublicContent(workspace.id);
 await ensurePublicContentTranslations(workspace.id);
 const [items]=await db.query<Row[]>("SELECT id,page_path,content_key,label,value,rich_html,format,font_family,font_size,active,updated_by FROM public_content WHERE workspace_id=? ORDER BY page_path,content_key",[workspace.id]);
 const fonts=[{value:"inherit",label:"Site default"},{value:"Inter, ui-sans-serif, system-ui, sans-serif",label:"Inter / System"},{value:"Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif",label:"Plus Jakarta Sans"},{value:"Noto Sans, ui-sans-serif, system-ui, sans-serif",label:"Noto Sans"},{value:"Georgia, serif",label:"Georgia"},{value:"Arial, sans-serif",label:"Arial"},{value:"Tahoma, sans-serif",label:"Tahoma"}];
 const settings=await getWebsiteSettings(workspace.id);
 const translations=await getTranslationRows(workspace.id);
 return <main className="dashboard-home">
  <section className="dashboard-hero-card"><div><span className="dashboard-kicker">WEBSITE STUDIO</span><h2>Website Content & Configuration</h2><p>Manage website pages, brand, navigation, appearance, packages, locations and search metadata separately from language translation work.</p></div></section>
  <div className="mt-5"><WebsiteStudio initialSettings={settings}/></div>
  <section className="mt-8"><div className="dashboard-hero-card"><div><span className="dashboard-kicker">TRANSLATIONS</span><h2>Language Content</h2><p>Translations have their own workspace, search, CSV workflow and save actions. Source website content remains separate and canonical.</p></div></div><div className="mt-5"><TranslationStudio initialRows={translations.map(x=>({...x,active:Number(x.active)}))}/></div></section>
  <section className="mt-8"><div className="dashboard-hero-card"><div><span className="dashboard-kicker">PAGE CONTENT</span><h2>Editable Web Content</h2><p>Edit the source-language page copy here. Translation changes do not modify the source content.</p></div></div><div className="mt-5"><PublicContentEditor initialItems={items.map(x=>({...x,font_size:Number(x.font_size),active:Number(x.active)}))} fonts={fonts}/></div></section>
 </main>
}