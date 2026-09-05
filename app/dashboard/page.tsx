import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/security";

export default async function DashboardPage() {
  const session = verifySession((await cookies()).get("aslal_session")?.value);
  if (!session) redirect("/login");
  const now = new Date();
  const [visitors, leads, qualifiedLeads, hotLeads, openOpportunities, pipeline, won, overdueTasks, events, recentLeads, openCommission, paidCommission] = await Promise.all([
    prisma.visitor.count(),
    prisma.lead.count(),
    prisma.lead.count({ where: { status: { in: ["QUALIFIED", "DEMO", "PROPOSAL", "NEGOTIATION"] } } }),
    prisma.lead.count({ where: { score: { gte: 60 }, status: { notIn: ["WON", "LOST"] } } }),
    prisma.lead.count({ where: { status: { in: ["QUALIFIED", "DEMO", "PROPOSAL", "NEGOTIATION"] } } }),
    prisma.lead.aggregate({ where: { status: { notIn: ["WON", "LOST"] } }, _sum: { dealValue: true } }),
    prisma.lead.aggregate({ where: { status: "WON" }, _count: { _all: true }, _sum: { dealValue: true }, _avg: { dealValue: true } }),
    prisma.leadTask.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] }, dueAt: { lt: now } } }),
    prisma.event.groupBy({ by: ["eventName"], _count: { _all: true }, orderBy: { _count: { eventName: "desc" } }, take: 8 }),
    prisma.lead.findMany({ orderBy: { updatedAt: "desc" }, take: 6, select: { id: true, name: true, status: true, score: true, company: true, updatedAt: true } }),
    prisma.commission.aggregate({ where: { status: { in: ["PENDING", "QUALIFIED", "APPROVED", "PAYABLE"] } }, _sum: { amount: true }, _count: { _all: true } }),
    prisma.commission.aggregate({ where: { status: "PAID" }, _sum: { amount: true }, _count: { _all: true } }),
  ]);
  const pipelineValue = Number(pipeline._sum.dealValue ?? 0);
  const wonRevenue = Number(won._sum.dealValue ?? 0);
  const avgDeal = Number(won._avg.dealValue ?? 0);
  const openCommissions = Number(openCommission._sum.amount ?? 0);
  const paidCommissions = Number(paidCommission._sum.amount ?? 0);
  const conversion = visitors > 0 ? (leads / visitors) * 100 : 0;
  const qualifiedConversion = leads > 0 ? (qualifiedLeads / leads) * 100 : 0;

  return <main className="min-h-screen bg-[#F8FAFC] py-12"><div className="container-aslal">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div className="text-xs font-black uppercase tracking-[.2em] text-[#0F3E8A]">Growth OS / Command Center</div><h1 className="mt-2 text-4xl font-black">Sales command center</h1><p className="mt-2 text-slate-500">{session.email} · Demand, pipeline, follow-up, revenue, and partner obligations.</p></div><form action="/api/auth/logout" method="post"><button className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold">Sign out</button></form></div>
    <section className="mt-10 grid gap-4 md:grid-cols-3"><Metric label="Visitors" value={visitors}/><Metric label="Leads" value={leads}/><Metric label="Qualified + opportunities" value={qualifiedLeads}/></section>
    <section className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4"><Metric label="Open pipeline (ETB)" value={pipelineValue.toLocaleString("en-US", { maximumFractionDigits: 2 })}/><Metric label="Won revenue (ETB)" value={wonRevenue.toLocaleString("en-US", { maximumFractionDigits: 2 })}/><Metric label="Won deals" value={won._count._all}/><Metric label="Average won deal (ETB)" value={avgDeal.toLocaleString("en-US", { maximumFractionDigits: 2 })}/></section>
    <section className="mt-4 grid gap-4 md:grid-cols-4"><SmallMetric label="Lead conversion" value={`${conversion.toFixed(1)}%`} detail="Visitor → lead"/><SmallMetric label="Qualification rate" value={`${qualifiedConversion.toFixed(1)}%`} detail="Lead → opportunity"/><SmallMetric label="Hot leads" value={hotLeads} detail="Score 60+ · still open"/><SmallMetric label="Open commissions" value={`ETB ${openCommissions.toLocaleString("en-US", { maximumFractionDigits: 2 })}`} detail={`${openCommission._count._all} pending / payable`}/></section>
    <section className="mt-4 grid gap-4 md:grid-cols-2"><div className="rounded-[1.5rem] border border-slate-200 bg-white p-5"><div className="text-xs font-black uppercase tracking-[.14em] text-slate-400">Paid partner commissions</div><div className="mt-2 text-3xl font-black text-[#0F3E8A]">ETB {paidCommissions.toLocaleString("en-US", { maximumFractionDigits: 2 })}</div><div className="mt-1 text-xs font-semibold text-slate-500">{paidCommission._count._all} paid record{paidCommission._count._all === 1 ? "" : "s"}</div></div><div className="rounded-[1.5rem] border border-slate-200 bg-white p-5"><div className="text-xs font-black uppercase tracking-[.14em] text-slate-400">Commercial control</div><div className="mt-2 text-lg font-black">Revenue → commission → payout</div><div className="mt-1 text-sm text-slate-500">Keep won deals valued and partner obligations explicitly tracked.</div></div></section>
    <div className="mt-8 grid gap-4 sm:grid-cols-3"><Link href="/dashboard/leads" className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:border-[#0F3E8A]/30"><div className="text-xs font-black uppercase tracking-[.16em] text-[#0F3E8A]">Sales</div><div className="mt-2 text-lg font-black">Open lead inbox →</div><div className="mt-1 text-sm text-slate-500">{overdueTasks} overdue follow-up{overdueTasks === 1 ? "" : "s"}</div></Link><Link href="/dashboard/insights" className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:border-[#0F3E8A]/30"><div className="text-xs font-black uppercase tracking-[.16em] text-[#0F3E8A]">Intelligence</div><div className="mt-2 text-lg font-black">Demand insights →</div><div className="mt-1 text-sm text-slate-500">Products, visitors, and interest signals</div></Link><Link href="/dashboard/partners" className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:border-[#0F3E8A]/30"><div className="text-xs font-black uppercase tracking-[.16em] text-[#0F3E8A]">Partners</div><div className="mt-2 text-lg font-black">Partner performance →</div><div className="mt-1 text-sm text-slate-500">Referral sales and commission obligations</div></Link></div>
    <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_.85fr]"><section className="rounded-[2rem] border border-slate-200 bg-white p-7"><div className="flex items-center justify-between"><div><h2 className="text-xl font-black">Recent sales activity</h2><p className="mt-1 text-sm text-slate-500">Most recently updated opportunities.</p></div><Link href="/dashboard/leads" className="text-sm font-bold text-[#0F3E8A]">View all →</Link></div><div className="mt-6 space-y-2">{recentLeads.map(lead => <Link key={lead.id} href={`/dashboard/leads/${lead.id}`} className="flex items-center justify-between gap-4 rounded-xl bg-[#F8FAFC] px-4 py-3 hover:bg-slate-100"><div><div className="font-bold">{lead.name}</div><div className="text-xs text-slate-500">{lead.company || "Prospect"} · {lead.status}</div></div><div className="text-right"><div className="font-black text-[#0F3E8A]">{lead.score}</div><div className="text-[10px] text-slate-400">score</div></div></Link>)}{recentLeads.length === 0 && <p className="text-sm text-slate-500">No leads yet.</p>}</div></section><section className="rounded-[2rem] border border-slate-200 bg-white p-7"><h2 className="text-xl font-black">Event activity</h2><p className="mt-1 text-sm text-slate-500">Top tracked demand signals.</p><div className="mt-6 grid gap-3">{events.map(e => <div key={e.eventName} className="flex items-center justify-between rounded-xl bg-[#F8FAFC] px-4 py-3"><span className="font-semibold">{e.eventName}</span><span className="font-black text-[#0F3E8A]">{e._count._all}</span></div>)}</div></section></div>
  </div></main>;
}
function Metric({label,value}:{label:string;value:number|string}){return <div className="rounded-[2rem] bg-[#0F3E8A] p-7 text-white"><div className="text-xs font-bold uppercase tracking-[.16em] text-white/55">{label}</div><div className="mt-3 text-4xl font-black text-[#E2B02A]">{value}</div></div>}
function SmallMetric({label,value,detail}:{label:string;value:number|string;detail:string}){return <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5"><div className="text-xs font-black uppercase tracking-[.14em] text-slate-400">{label}</div><div className="mt-2 text-3xl font-black text-[#0F3E8A]">{value}</div><div className="mt-1 text-xs font-semibold text-slate-500">{detail}</div></div>}
