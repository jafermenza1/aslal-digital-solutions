import Link from "next/link";
import { requirePermission } from "@/lib/authorization";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import { db } from "@/lib/db";

const labels:Record<string,string>={BUSINESS_OWNER:"Owner",SALES_MANAGER:"Sales Manager",SALES_OPERATOR:"Sales Operator",MARKETING_OPERATOR:"Marketing",PARTNER_MANAGER:"Partner Manager",FINANCE:"Finance",AUDITOR:"Auditor",PARTNER:"Partner",CLIENT:"Client",ADMIN:"Administrator",SUPER_ADMIN:"System Administrator"};
const links:Record<string,Array<[string,string,string]>>={
 BUSINESS_OWNER:[["Leads","Review pipeline and priority work","/dashboard/leads"],["Finance","Review revenue, commissions and payouts","/dashboard/finance"],["Reports","Open workspace reports","/dashboard/reports"],["Access","Manage people and workspace access","/dashboard/users"]],
 SALES_MANAGER:[["Pipeline","Manage active sales opportunities","/dashboard/leads"],["Orders","Review quotes and orders","/dashboard/orders"],["Reports","Open pipeline reports","/dashboard/reports"]],
 SALES_OPERATOR:[["My leads","Work active leads and follow-ups","/dashboard/leads"],["Customers","Review customer records","/dashboard/customers"],["Orders","Review commercial handoff","/dashboard/orders"]],
 MARKETING_OPERATOR:[["Insights","Review acquisition and demand signals","/dashboard/insights"],["Products","Manage products and services","/dashboard/products"],["Reports","Open campaign reports","/dashboard/reports"]],
 PARTNER_MANAGER:[["Partner network","Manage partners and programs","/dashboard/partners"],["Pipeline","Review attributed opportunities","/dashboard/leads"],["Reports","Open partner reports","/dashboard/reports"]],
 FINANCE:[["Finance","Reconcile payments, commissions and payouts","/dashboard/finance"],["Orders","Review commercial transactions","/dashboard/orders"],["Reports","Open financial reports","/dashboard/reports"]],
 AUDITOR:[["Operations","Review controlled operational activity","/dashboard/operations"],["Finance","Review financial controls","/dashboard/finance"],["Reports","Open audit reports","/dashboard/reports"]],
 PARTNER:[["Partner portal","Manage your partner activity and earnings","/dashboard/partner"],["Reports","Open available earnings reports","/dashboard/reports"]],
 CLIENT:[["Business dashboard","Review your business activity","/dashboard/client"],["Reports","Open business reports","/dashboard/reports"]],
 ADMIN:[["Workspaces","Manage business contexts and memberships","/dashboard/workspaces"],["Reports","Open all workspace reports","/dashboard/reports"],["Operations","Review system operations","/dashboard/operations"]],
 SUPER_ADMIN:[["Workspaces","Manage all business contexts and memberships","/dashboard/workspaces"],["Reports","Open all workspace reports","/dashboard/reports"],["Operations","Review system operations","/dashboard/operations"]]
};
export default async function WorkbenchPage(){
 const user=await requirePermission("dashboard.view"); const access=await authorizeWorkspacePermission("dashboard.view"); if(!access)return null;
 const [leadRows]=await db.query<any[]>("SELECT COUNT(*) leads,COALESCE(SUM(CASE WHEN status IN ('QUALIFIED','DEMO','PROPOSAL','NEGOTIATION') THEN 1 ELSE 0 END),0) open_leads,COALESCE(SUM(CASE WHEN status='WON' THEN deal_value ELSE 0 END),0) won_value FROM leads WHERE workspace_id=?",[access.workspace.id]);
 const k=leadRows[0]||{leads:0,open_leads:0,won_value:0}; const role=user.role; const items=[...(links[role]||links.SALES_OPERATOR),...(user.permissions.includes("listings.manage")?[["Marketplace listings","Add and manage products, services and commercial listings","/dashboard/listings"] as [string,string,string]]:[])];
 return <main className="min-h-screen bg-[var(--ui-canvas)] py-10"><div className="container-aslal">
  <header><div className="text-xs font-black uppercase tracking-[.2em] text-[#E2B02A]">My Workbench</div><h1 className="mt-2 text-4xl font-black">{labels[role]||role} workspace</h1><p className="mt-2 text-slate-500">{access.workspace.name} · {access.workspace.slug}</p></header>
  <section className="mt-8 grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="text-xs font-black uppercase text-slate-400">Leads</div><div className="mt-2 text-3xl font-black">{Number(k.leads)}</div></div><div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="text-xs font-black uppercase text-slate-400">Open work</div><div className="mt-2 text-3xl font-black">{Number(k.open_leads)}</div></div><div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="text-xs font-black uppercase text-slate-400">Won revenue</div><div className="mt-2 text-3xl font-black">ETB {Number(k.won_value||0).toLocaleString("en-ET")}</div></div></section>
  <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map(([title,desc,href])=><Link key={href} href={href} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5"><h2 className="text-xl font-black text-slate-900">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{desc}</p><span className="mt-5 inline-block text-sm font-black text-[#0F3E8A]">Open →</span></Link>)}</section>
 </div></main>;
}