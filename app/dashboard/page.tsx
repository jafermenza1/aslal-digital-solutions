import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/security";

export default async function DashboardPage() {
  const session = verifySession((await cookies()).get("aslal_session")?.value);
  if (!session) redirect("/login");
  const now = new Date();
  const [visitors, leads, hotLeads, pipeline, overdueTasks, events] = await Promise.all([
    prisma.visitor.count(),
    prisma.lead.count(),
    prisma.lead.count({ where: { score: { gte: 60 }, status: { notIn: ["WON", "LOST"] } } }),
    prisma.lead.aggregate({ where: { status: { notIn: ["WON", "LOST"] } }, _sum: { dealValue: true } }),
    prisma.leadTask.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] }, dueAt: { lt: now } } }),
    prisma.event.groupBy({ by: ["eventName"], _count: { _all: true }, orderBy: { _count: { eventName: "desc" } }, take: 8 }),
  ]);
  const pipelineValue = pipeline._sum.dealValue ? Number(pipeline._sum.dealValue) : 0;

  return <main className="min-h-screen bg-[#F8FAFC] py-12"><div className="container-aslal">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div className="text-xs font-black uppercase tracking-[.2em] text-[#0F3E8A]">Growth OS</div><h1 className="mt-2 text-4xl font-black">Good evening.</h1><p className="mt-2 text-slate-500">{session.email} · Sales operations are connected.</p></div><form action="/api/auth/logout" method="post"><button className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold">Sign out</button></form></div>
    <div className="mt-10 grid gap-4 md:grid-cols-3"><Metric label="Visitors" value={visitors}/><Metric label="Leads" value={leads}/><Metric label="Hot leads" value={hotLeads}/></div>
    <div className="mt-4 grid gap-4 md:grid-cols-2"><Metric label="Open pipeline (ETB)" value={pipelineValue.toLocaleString("en-US", { maximumFractionDigits: 2 })}/><Metric label="Overdue follow-ups" value={overdueTasks}/></div>
    <div className="mt-8 grid gap-4 sm:grid-cols-3"><a href="/dashboard/leads" className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:border-[#0F3E8A]/30"><div className="text-xs font-black uppercase tracking-[.16em] text-[#0F3E8A]">Sales</div><div className="mt-2 text-lg font-black">Open pipeline →</div></a><a href="/dashboard/insights" className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:border-[#0F3E8A]/30"><div className="text-xs font-black uppercase tracking-[.16em] text-[#0F3E8A]">Intelligence</div><div className="mt-2 text-lg font-black">Demand insights →</div></a><a href="/dashboard/partners" className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:border-[#0F3E8A]/30"><div className="text-xs font-black uppercase tracking-[.16em] text-[#0F3E8A]">Partners</div><div className="mt-2 text-lg font-black">Partner performance →</div></a></div>
    <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-7"><h2 className="text-xl font-black">Event activity</h2><div className="mt-6 grid gap-3">{events.map(e => <div key={e.eventName} className="flex items-center justify-between rounded-xl bg-[#F8FAFC] px-4 py-3"><span className="font-semibold">{e.eventName}</span><span className="font-black text-[#0F3E8A]">{e._count._all}</span></div>)}</div></section>
  </div></main>;
}
function Metric({label,value}:{label:string;value:number|string}){return <div className="rounded-[2rem] bg-[#0F3E8A] p-7 text-white"><div className="text-xs font-bold uppercase tracking-[.16em] text-white/55">{label}</div><div className="mt-3 text-4xl font-black text-[#E2B02A]">{value}</div></div>}
