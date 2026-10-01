import Link from "next/link";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type Card = { title:string; description:string; href:string; exportHref?:string; permission:string };

export default async function ReportsPage(){
  const access = await authorizeWorkspacePermission("dashboard.view");
  if(!access) redirect("/dashboard");
  const workspaceId=access.workspace.id;
  const [leads,customers,orders] = await Promise.all([
    prisma.lead.count({where:{workspaceId}}),
    prisma.customer.count({where:{workspaceId}}),
    prisma.order.count({where:{workspaceId}})
  ]);
  const p=new Set(access.permissions);
  const cards:Card[]=[
    {title:"Executive / Business",description:"Business activity, pipeline and commercial health for the active workspace.",href:"/dashboard",permission:"dashboard.view"},
    {title:"Sales Pipeline",description:"Leads, follow-up and conversion work. Open the sales workflow for record-level action.",href:"/dashboard/leads",exportHref:"/api/admin/leads/export",permission:"leads.view"},
    {title:"Customers",description:"Customer activity and relationship records for this business.",href:"/dashboard/customers",permission:"customers.view"},
    {title:"Commerce",description:"Quotes, orders and commercial operations for the active workspace.",href:"/dashboard/orders",permission:"commerce.view"},
    {title:"Marketing & Insights",description:"Acquisition, product demand, referrals and operational intelligence.",href:"/dashboard/insights",permission:"insights.view"},
    {title:"Partner Performance",description:"Partner network, programs, attribution and partner operations.",href:"/dashboard/partners",permission:"partners.manage"},
    {title:"Finance",description:"Payments, commissions, payout and financial operations. Financial mutations remain ledger-controlled.",href:"/dashboard/finance",permission:"commissions.manage"},
    {title:"Operations / Audit",description:"Tasks, automation, integrity and administrative audit activity.",href:"/dashboard/operations",permission:"operations.view"},
  ];
  return <main className="portal-shell min-h-screen"><div className="mx-auto max-w-[1280px] p-4 sm:p-6 lg:p-8">
    <header className="rounded-3xl border border-white/10 bg-white/[.03] p-6 sm:p-8">
      <div className="text-[10px] font-black uppercase tracking-[.2em] text-[#E2B02A]">Reporting / {access.workspace.name}</div>
      <h1 className="mt-2 text-3xl font-black sm:text-4xl">Reports Center</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">Role-aware reporting entry point. Every report opens inside the same workspace boundary used by the operational screens.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3"><Stat label="Leads" value={leads}/><Stat label="Customers" value={customers}/><Stat label="Orders" value={orders}/></div>
    </header>
    <section className="mt-6 grid gap-4 md:grid-cols-2">
      {cards.filter(c=>p.has(c.permission)).map(card=><article key={card.title} className="rounded-3xl border border-white/10 bg-white/[.03] p-5 sm:p-6">
        <div className="text-lg font-black">{card.title}</div><p className="mt-2 text-sm leading-6 text-white/50">{card.description}</p>
        <div className="mt-5 flex flex-wrap gap-2"><Link href={card.href} className="rounded-full bg-[#E2B02A] px-4 py-2.5 text-sm font-black text-[#1E293B]">Open report</Link>{card.exportHref&&<Link href={card.exportHref} className="rounded-full border border-white/15 px-4 py-2.5 text-sm font-bold">Export available data</Link>}</div>
      </article>)}
    </section>
    <section className="mt-6 rounded-3xl border border-white/10 bg-white/[.02] p-5 text-sm leading-6 text-white/50"><strong className="text-white">Reporting rule:</strong> reports inherit the active business workspace and the user's effective workspace permissions. Future scheduled/exported reports must preserve the same scope.</section>
  </div></main>;
}
function Stat({label,value}:{label:string;value:number}){return <div className="rounded-2xl border border-white/10 bg-white/[.03] p-4"><div className="text-[10px] font-black uppercase tracking-wider text-white/35">{label}</div><div className="mt-1 text-2xl font-black">{value.toLocaleString("en-ET")}</div></div>}
