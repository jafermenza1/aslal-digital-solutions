import Link from "next/link";
import { requirePermission } from "@/lib/authorization";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import { db } from "@/lib/db";

const roleLabels:Record<string,string>={SALES_MANAGER:"Sales Manager",SALES_OPERATOR:"Sales Operator",MARKETING_OPERATOR:"Marketing Operator",PARTNER_MANAGER:"Partner Manager",FINANCE:"Finance",AUDITOR:"Auditor",BUSINESS_OWNER:"Business Owner",ADMIN:"Administrator",SUPER_ADMIN:"System Administrator",PARTNER:"Partner",CLIENT:"Client"};
type Card=[string,string,string,string];

export default async function WorkbenchPage(){
 const user=await requirePermission("dashboard.view"); const access=await authorizeWorkspacePermission("dashboard.view"); if(!access)return null;
 const p=new Set(user.permissions); const role=user.workspaceRole||user.role;
 const [leadRows]=p.has("leads.view")?await db.query<any[]>(`SELECT COUNT(*) total,COALESCE(SUM(CASE WHEN owner_email=? THEN 1 ELSE 0 END),0) assigned,COALESCE(SUM(CASE WHEN status IN ('QUALIFIED','DEMO','PROPOSAL','NEGOTIATION') THEN 1 ELSE 0 END),0) open_work FROM leads WHERE workspace_id=?`,[user.email,access.workspace.id]):[[{total:0,assigned:0,open_work:0}]];
 const [listingRows]=p.has("listings.manage")?await db.query<any[]>(`SELECT COUNT(*) total,COALESCE(SUM(status='PENDING_REVIEW'),0) review FROM commercial_listings WHERE workspace_id=?`,[access.workspace.id]):[[{total:0,review:0}]];
 const [productRows]=p.has("products.manage")?await db.query<any[]>(`SELECT COUNT(*) total,COALESCE(SUM(active=1),0) active FROM products WHERE workspace_id=?`,[access.workspace.id]):[[{total:0,active:0}]];
 const [orderRows]=p.has("commerce.view")?await db.query<any[]>(`SELECT COUNT(*) total,COALESCE(SUM(status IN ('CONFIRMED','FULFILLING')),0) active FROM orders WHERE workspace_id=?`,[access.workspace.id]):[[{total:0,active:0}]];
 const [customerRows]=p.has("customers.view")?await db.query<any[]>(`SELECT COUNT(*) total FROM customers WHERE workspace_id=?`,[access.workspace.id]):[[{total:0}]];
 const l=leadRows[0]||{},li=listingRows[0]||{},pr=productRows[0]||{},o=orderRows[0]||{},cu=customerRows[0]||{};
 const cards:Card[]=[];
 if(p.has("leads.view")) cards.push(["Leads & follow-up",`${l.assigned||0} assigned to you · ${l.open_work||0} active pipeline items`,"/dashboard/leads","Work queue"]);
 if(p.has("customers.view")) cards.push(["Customers",`${cu.total||0} workspace customer records`,"/dashboard/customers","Customer work"]);
 if(p.has("products.manage")) cards.push(["Products & services",`${pr.active||0} active · ${pr.total||0} catalog records`,"/dashboard/products","Catalog"]);
 if(p.has("listings.manage")) cards.push(["Marketplace listings",`${li.review||0} awaiting review · ${li.total||0} total listings`,"/dashboard/listings","Listings"]);
 if(p.has("commerce.view")) cards.push(["Orders & sales",`${o.active||0} active · ${o.total||0} total orders`,"/dashboard/orders","Commercial work"]);
 if(p.has("insights.view")) cards.push(["Insights & reports","Review performance and demand signals for your permitted scope.","/dashboard/reports","Reporting"]);
 if(p.has("operations.view")) cards.push(["Operations","Resolve issues and operational follow-up without leaving your workspace.","/dashboard/operations","Operations"]);
 if(p.has("partners.manage")) cards.push(["Partners","Work the partner relationship and attributed pipeline.","/dashboard/partners","Partner work"]);
 const roleHelp:Record<string,string>={SALES_MANAGER:"Manage the pipeline, commercial handoffs and team-level sales outcomes.",SALES_OPERATOR:"Work assigned leads, customer follow-up and commercial handoffs.",MARKETING_OPERATOR:"Maintain products/services, listings, campaigns and acquisition signals.",PARTNER_MANAGER:"Manage partner relationships and attributed opportunities.",FINANCE:"Review controlled commercial and financial operations.",AUDITOR:"Inspect operational and financial activity without changing the business workflow.",OWNER:"Run the business across sales, catalog, partners and finance.",BUSINESS_OWNER:"Run the business across sales, catalog, partners and finance."};
 return <main className="min-h-full bg-[var(--ui-canvas)] py-8"><div className="container-aslal">
  <header><div className="text-xs font-black uppercase tracking-[.2em] text-[var(--ui-accent)]">My workbench</div><h1 className="mt-2 text-3xl font-black tracking-tight">{roleLabels[role]||role}</h1><p className="mt-2 text-sm text-slate-500">{access.workspace.name} · {roleHelp[role]||"Your permitted work, organized around the records and tasks you can act on."}</p></header>
  <section className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{cards.map(([title,desc,href,cta])=><Link key={href+title} href={href} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-slate-900"><div className="text-lg font-black">{title}</div><p className="mt-2 text-sm leading-6 text-slate-500">{desc}</p><span className="mt-4 inline-block text-xs font-black text-[var(--ui-accent)]">{cta} →</span></Link>)}</section>
  <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-900"><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="text-xs font-black uppercase tracking-wider text-slate-400">How to use this workbench</div><h2 className="mt-1 text-xl font-black">Start with assigned work, then open the record</h2></div><Link href="/dashboard" className="text-sm font-black text-[var(--ui-accent)]">Dashboard →</Link></div><div className="mt-5 grid gap-3 md:grid-cols-4"><div><b>1. Find</b><p className="mt-1 text-sm text-slate-500">Use the work queue or command search.</p></div><div><b>2. Open</b><p className="mt-1 text-sm text-slate-500">Work from the record, not a chain of popups.</p></div><div><b>3. Act</b><p className="mt-1 text-sm text-slate-500">Only actions allowed by your role are shown.</p></div><div><b>4. Report</b><p className="mt-1 text-sm text-slate-500">Return to reports when you need the wider picture.</p></div></div></section>
 </div></main>;
}