import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/security";

export const dynamic = "force-dynamic";

export default async function CustomersDashboard({ searchParams }: { searchParams: Promise<{ customer?: string }> }) {
  const session = verifySession((await cookies()).get("aslal_session")?.value);
  if (!session) redirect("/login");
  const { customer: selectedId } = await searchParams;

  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      person: true,
      opportunity: { include: { lead: { include: { visitor: true, stageHistory: { orderBy: { createdAt: "asc" }, take: 100 }, notes: { orderBy: { createdAt: "asc" }, take: 100 }, tasks: { orderBy: { createdAt: "asc" }, take: 100 } } } } },
    },
  });

  const selected = selectedId ? customers.find(c => c.id === selectedId) : customers[0];
  let timeline: Array<{ id: string; type: string; timestamp: Date; subject: string | null; actor: string }> = [];
  if (selected) {
    const lead = selected.opportunity?.lead;
    const [activities, events] = await Promise.all([
      prisma.activity.findMany({
        where: { OR: [
          { customerId: selected.id },
          ...(selected.personId ? [{ personId: selected.personId }] : []),
          ...(selected.opportunityId ? [{ opportunityId: selected.opportunityId }] : []),
        ] },
        orderBy: { createdAt: "asc" }, take: 200,
      }),
      lead?.visitorId ? prisma.event.findMany({ where: { visitorId: lead.visitorId }, orderBy: { createdAt: "asc" }, take: 200 }) : Promise.resolve([]),
    ]);
    timeline = [
      ...activities.map(a => ({ id: "activity-"+a.id, type: "ACTIVITY", timestamp: a.createdAt, subject: a.subject || a.type, actor: a.type })),
      ...events.map(e => ({ id: "event-"+e.id, type: "EVENT", timestamp: e.createdAt, subject: e.eventName, actor: "visitor" })),
      ...(lead?.stageHistory || []).map(s => ({ id: "stage-"+s.id, type: "STAGE", timestamp: s.createdAt, subject: (s.fromStage || "START")+" → "+s.toStage, actor: s.changedBy || "system" })),
      ...(lead?.notes || []).map(n => ({ id: "note-"+n.id, type: "NOTE", timestamp: n.createdAt, subject: n.body, actor: n.author || "team" })),
      ...(lead?.tasks || []).map(t => ({ id: "task-"+t.id, type: "TASK", timestamp: t.createdAt, subject: t.title, actor: t.assignedTo || "team" })),
    ].sort((a,b) => a.timestamp.getTime() - b.timestamp.getTime()).slice(-300);
  }

  return <main className="min-h-screen bg-[#F8FAFC] py-10"><div className="container-aslal">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><div className="text-xs font-black uppercase tracking-[.2em] text-[#0F3E8A]">Growth OS / Customers</div><h1 className="mt-2 text-4xl font-black">Customers & journey timeline</h1><p className="mt-2 max-w-3xl text-slate-500">A customer exists only after a verified WON lead with a positive ETB deal value is converted. Repeating conversion is idempotent.</p></div>
      <Link href="/dashboard" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold">← Dashboard</Link>
    </div>
    <div className="mt-7 grid gap-6 lg:grid-cols-[.7fr_1.3fr]">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5">
        <div className="mb-4 text-xs font-black uppercase tracking-wider text-slate-400">{customers.length} customer{customers.length===1?"":"s"}</div>
        <div className="space-y-2">{customers.map(c => <Link key={c.id} href={"/dashboard/customers?customer="+c.id} className={"block rounded-2xl border p-4 "+(selected?.id===c.id?"border-[#0F3E8A] bg-blue-50":"border-slate-100 hover:bg-slate-50")}><div className="font-black">{c.name}</div><div className="mt-1 text-xs text-slate-500">{c.email || c.phone || "No contact"} · {c.status}</div><div className="mt-2 text-xs font-semibold text-slate-400">ETB {Number(c.opportunity?.expectedValue ?? 0).toLocaleString("en-ET")} · {c.opportunity?.stage || "—"}</div></Link>)}{!customers.length&&<p className="py-12 text-center text-sm text-slate-500">No customers yet. Convert a verified WON lead from its lead detail page.</p>}</div>
      </section>
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6">
        {!selected ? <div className="py-16 text-center text-slate-500">Customer timeline will appear after conversion.</div> : <>
          <div className="flex flex-col justify-between gap-3 sm:flex-row"><div><div className="text-xs font-black uppercase tracking-wider text-[#0F3E8A]">Customer</div><h2 className="mt-1 text-2xl font-black">{selected.name}</h2><p className="text-sm text-slate-500">Person {selected.personId || "—"} · Opportunity {selected.opportunityId || "—"}</p></div><Link href={"/dashboard/leads/"+selected.opportunity?.leadId} className="text-sm font-black text-[#0F3E8A]">Open originating lead →</Link></div>
          <div className="mt-5 grid gap-3 sm:grid-cols-4">{[["Source",selected.opportunity?.source||"website"],["Medium",selected.opportunity?.medium||"—"],["Campaign",selected.opportunity?.campaign||"—"],["Referral",selected.opportunity?.referralCode||"—"]].map(([k,v])=><div key={k} className="rounded-xl bg-[#F8FAFC] p-3"><div className="text-[10px] font-black uppercase text-slate-400">{k}</div><div className="mt-1 text-sm font-black break-words">{v}</div></div>)}</div>
          <div className="mt-5 rounded-xl bg-[#0F3E8A] p-4 text-white"><div className="text-xs text-white/60">Verified opportunity value</div><div className="mt-1 text-2xl font-black text-[#E2B02A]">ETB {Number(selected.opportunity?.expectedValue ?? 0).toLocaleString("en-ET", {minimumFractionDigits:2})}</div></div>
          <div className="mt-6"><h3 className="text-lg font-black">Chronological journey</h3><div className="mt-4 space-y-2">{timeline.map(item=><div key={item.id} className="rounded-xl border border-slate-100 bg-[#F8FAFC] p-4"><div className="flex justify-between gap-3"><div className="font-black">{item.type}: {item.subject}</div><time className="shrink-0 text-xs text-slate-400">{item.timestamp.toLocaleString()}</time></div><div className="mt-1 text-xs text-slate-500">Actor: {item.actor}</div></div>)}{!timeline.length&&<p className="text-sm text-slate-500">No timeline records yet.</p>}</div></div>
        </>}
      </section>
    </div>
  </div></main>;
}
