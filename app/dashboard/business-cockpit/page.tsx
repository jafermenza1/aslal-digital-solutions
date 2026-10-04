import Link from "next/link";
import { requirePermission } from "@/lib/authorization";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import { db } from "@/lib/db";

type Metric={label:string;value:string;href:string;hint:string};
function money(v:number){return `ETB ${Number(v||0).toLocaleString("en-ET")}`;}

export default async function BusinessCockpitPage(){
 const user=await requirePermission("dashboard.view");
 const access=await authorizeWorkspacePermission("dashboard.view");
 if(!access)return null;
 const p=new Set(user.permissions);
 const [leadRows]=p.has("leads.view")?await db.query<any[]>(`SELECT COUNT(*) leads,COALESCE(SUM(CASE WHEN status IN ('NEW','CONTACTED','QUALIFIED','DEMO','PROPOSAL','NEGOTIATION') THEN 1 ELSE 0 END),0) open_leads FROM leads WHERE workspace_id=?`,[access.workspace.id]):[[{leads:0,open_leads:0}]];
 const [listingRows]=p.has("listings.manage")?await db.query<any[]>(`SELECT COUNT(*) listings,COALESCE(SUM(status='PENDING_REVIEW'),0) pending,COALESCE(SUM(status='PUBLISHED'),0) published FROM commercial_listings WHERE workspace_id=?`,[access.workspace.id]):[[{listings:0,pending:0,published:0}]];
 const [productRows]=p.has("products.manage")?await db.query<any[]>(`SELECT COUNT(*) products,COALESCE(SUM(active=1),0) active FROM products WHERE workspace_id=?`,[access.workspace.id]):[[{products:0,active:0}]];
 const [orderRows]=p.has("commerce.view")?await db.query<any[]>(`SELECT COUNT(*) orders,COALESCE(SUM(CASE WHEN status IN ('CONFIRMED','FULFILLING') THEN 1 ELSE 0 END),0) active_orders,COALESCE(SUM(CASE WHEN status IN ('CONFIRMED','FULFILLING','COMPLETED') THEN total ELSE 0 END),0) value FROM orders WHERE workspace_id=?`,[access.workspace.id]):[[{orders:0,active_orders:0,value:0}]];
 const [partnerRows]=p.has("partners.manage")?await db.query<any[]>(`SELECT COUNT(*) partners,COALESCE(SUM(status='ACTIVE'),0) active FROM partners WHERE workspace_id=?`,[access.workspace.id]):[[{partners:0,active:0}]];
 const [commissionRows]=p.has("commissions.manage")?await db.query<any[]>(`SELECT COUNT(*) commissions,COALESCE(SUM(CASE WHEN status IN ('PENDING','QUALIFIED','APPROVED','PAYABLE') THEN amount ELSE 0 END),0) pending_value FROM commissions WHERE workspace_id=?`,[access.workspace.id]):[[{commissions:0,pending_value:0}]];
 const l=leadRows[0]||{},li=listingRows[0]||{},pr=productRows[0]||{},o=orderRows[0]||{},pa=partnerRows[0]||{},c=commissionRows[0]||{};
 const metrics:Metric[]=[
  p.has("commerce.view")?{label:"Active sales",value:String(o.active_orders||0),href:"/dashboard/orders",hint:`${o.orders||0} total orders`}:null,
  p.has("leads.view")?{label:"Open pipeline",value:String(l.open_leads||0),href:"/dashboard/leads",hint:`${l.leads||0} leads`}:null,
  p.has("listings.manage")?{label:"Listings",value:String(li.listings||0),href:"/dashboard/listings",hint:`${li.pending||0} awaiting review`}:null,
  p.has("products.manage")?{label:"Catalog",value:String(pr.products||0),href:"/dashboard/products",hint:`${pr.active||0} active products/services`}:null,
  p.has("partners.manage")?{label:"Partners",value:String(pa.active||0),href:"/dashboard/partners",hint:`${pa.partners||0} connected partners`}:null,
  p.has("commissions.manage")?{label:"Commission queue",value:money(Number(c.pending_value||0)),href:"/dashboard/finance",hint:`${c.commissions||0} commission records`}:null,
 ].filter(Boolean) as Metric[];
 const actions=[
  p.has("products.manage")?["Add product or service","Create catalog information first; publication remains controlled by listing review.","/dashboard/products"]:null,
  p.has("listings.manage")?["Review my listings","Track drafts, review queue, published listings and rejected items.","/dashboard/listings"]:null,
  p.has("commerce.view")?["Orders & sales","Move from commercial activity to the existing order workspace.","/dashboard/orders"]:null,
  p.has("partners.manage")?["Partner growth","Manage partner relationships, programs and attributed opportunities.","/dashboard/partners"]:null,
  p.has("commissions.manage")?["Finance","Review revenue, commission and payout operations.","/dashboard/finance"]:null,
 ].filter(Boolean) as string[][];
 return <main className="min-h-full bg-[var(--ui-canvas)] py-8"><div className="container-aslal">
  <header><div className="text-xs font-black uppercase tracking-[.2em] text-[var(--ui-accent)]">Business cockpit</div><h1 className="mt-2 text-3xl font-black tracking-tight">Run {access.workspace.name}</h1><p className="mt-2 max-w-3xl text-sm text-slate-500">One place to see what needs attention, then move directly into the existing workflow that owns the action.</p></header>
  <section className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{metrics.map(m=><Link key={m.href+m.label} href={m.href} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-slate-900"><div className="text-xs font-black uppercase tracking-wider text-slate-400">{m.label}</div><div className="mt-2 text-3xl font-black">{m.value}</div><div className="mt-1 text-xs text-slate-500">{m.hint}</div><span className="mt-4 inline-block text-sm font-black text-[var(--ui-accent)]">Open workflow →</span></Link>)}</section>
  <section className="mt-8 grid gap-5 lg:grid-cols-[1.4fr_.8fr]"><div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-900"><div className="text-xs font-black uppercase tracking-wider text-slate-400">Today’s work</div><div className="mt-4 grid gap-3 sm:grid-cols-2">{actions.map(([title,desc,href])=><Link key={href} href={href} className="rounded-xl border border-slate-200 p-4 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"><div className="font-black">{title}</div><p className="mt-1 text-sm leading-6 text-slate-500">{desc}</p><span className="mt-3 inline-block text-xs font-black text-[var(--ui-accent)]">Continue →</span></Link>)}</div></div>
   <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-900"><div className="text-xs font-black uppercase tracking-wider text-slate-400">Important rule</div><h2 className="mt-2 text-xl font-black">Create is not publish</h2><p className="mt-3 text-sm leading-6 text-slate-500">Business owners and permitted professionals can prepare products and services. Marketplace publication remains a controlled review step, so customers only see approved listings.</p><Link href="/dashboard/approvals" className="mt-5 inline-block text-sm font-black text-[var(--ui-accent)]">Open approvals →</Link></div>
  </section>
 </div></main>;
}
