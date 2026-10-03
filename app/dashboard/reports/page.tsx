import Link from "next/link";
import { requirePermission } from "@/lib/authorization";
import { authorizeWorkspacePermission } from "@/lib/workspaces";

const reports=[
 {key:"executive",roles:["BUSINESS_OWNER","ADMIN","SUPER_ADMIN"],title:"Executive",description:"Workspace health, pipeline, customers and operating signals.",href:"/dashboard"},
 {key:"pipeline",roles:["BUSINESS_OWNER","SALES_MANAGER","SALES_OPERATOR","ADMIN","SUPER_ADMIN"],title:"Pipeline",description:"Leads, opportunities, follow-up and commercial progression.",href:"/dashboard/insights?tab=follow-up"},
 {key:"campaign",roles:["BUSINESS_OWNER","MARKETING_OPERATOR","ADMIN","SUPER_ADMIN"],title:"Campaign",description:"Acquisition, product demand, referrals and campaign signals.",href:"/dashboard/insights"},
 {key:"partner",roles:["BUSINESS_OWNER","PARTNER_MANAGER","ADMIN","SUPER_ADMIN"],title:"Partner",description:"Partner performance, referrals, commissions and attributed revenue.",href:"/dashboard/partners"},
 {key:"earnings",roles:["PARTNER"],title:"Earnings",description:"Your partner activity, referral performance and earnings.",href:"/dashboard/partner"},
 {key:"financial",roles:["BUSINESS_OWNER","FINANCE","ADMIN","SUPER_ADMIN"],title:"Financial",description:"Payments, revenue recognition, commissions and payouts.",href:"/dashboard/finance"},
 {key:"audit",roles:["BUSINESS_OWNER","AUDITOR","ADMIN","SUPER_ADMIN"],title:"Audit",description:"Workspace-scoped operational evidence and controlled reporting.",href:"/api/admin/reports/weekly-pipeline?format=csv"},
 {key:"commercial",roles:["BUSINESS_OWNER","SALES_MANAGER","PARTNER_MANAGER","FINANCE","AUDITOR","ADMIN","SUPER_ADMIN"],title:"Commercial Analytics",description:"Supply, demand, conversion, attribution, revenue and commission reporting.",href:"/dashboard/commercial-analytics"},
 {key:"business",roles:["CLIENT"],title:"Business",description:"Your business dashboard and seven-day operational audit export.",href:"/dashboard/client"},
];
export default async function ReportsPage(){
 const user=await requirePermission("dashboard.view"); const access=await authorizeWorkspacePermission("dashboard.view"); if(!access)return null;
 const available=reports.filter(r=>r.roles.includes(user.role));
 return <main className="min-h-screen bg-[var(--ui-canvas)] py-10"><div className="container-aslal">
  <header><div className="text-xs font-black uppercase tracking-[.2em] text-[#0F3E8A]">Reports Center</div><h1 className="mt-2 text-4xl font-black">Workspace reports</h1><p className="mt-2 text-slate-500">Reports are evaluated inside the active business context: <strong>{access.workspace.name}</strong>.</p></header>
  <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{available.map(r=><Link key={r.key} href={r.href} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="text-xs font-black uppercase tracking-[.14em] text-[#0F3E8A]">{r.title}</div><p className="mt-3 text-sm leading-6 text-slate-500">{r.description}</p><span className="mt-5 inline-block text-sm font-black text-[#0F3E8A]">{r.key==="audit"?"Export CSV":"Open report"} →</span></Link>)}</section>
 </div></main>;
}