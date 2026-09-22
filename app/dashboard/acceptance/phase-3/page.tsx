import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/security";
import { BUSINESS_EVENTS, HIGH_INTENT_EVENTS } from "@/lib/event-taxonomy";

export const dynamic = "force-dynamic";

export default async function Phase3Acceptance() {
  const session = verifySession((await cookies()).get("aslal_session")?.value);
  if (!session) redirect("/login");
  const [visitors, events, growth, leads, opportunities, customers, activities, pageViews, highIntent, identifiedVisitors] = await Promise.all([
    prisma.visitor.count(),
    prisma.event.count(),
    prisma.growthOpportunity.count(),
    prisma.lead.count(),
    prisma.opportunity.count(),
    prisma.customer.count(),
    prisma.activity.count(),
    prisma.event.count({ where: { eventName: "PAGE_VIEW" } }),
    prisma.event.count({ where: { eventName: { in: Array.from(HIGH_INTENT_EVENTS) } } }),
    prisma.lead.count({ where: { visitorId: { not: null } } }),
  ]);
  const automated = [
    ["Visitor records exist", visitors > 0, `${visitors} visitor(s)`],
    ["Canonical PAGE_VIEW events persist", pageViews > 0, `${pageViews} PAGE_VIEW event(s)`],
    ["Business-event boundary is defined", BUSINESS_EVENTS.length > 0, `${BUSINESS_EVENTS.length} accepted event types`],
    ["High-intent event set is defined", HIGH_INTENT_EVENTS.size > 0, `${HIGH_INTENT_EVENTS.size} high-intent types`],
    ["Growth Opportunity records exist", growth > 0, `${growth} signal(s)`],
    ["Lead records exist", leads > 0, `${leads} lead(s)`],
    ["Separate Opportunity records exist", opportunities > 0, `${opportunities} opportunity record(s)`],
    ["Customer records exist", customers > 0, `${customers} customer(s)`],
    ["Customer timeline Activity records exist", activities > 0, `${activities} activity record(s)`],
    ["Identified leads retain visitor linkage", identifiedVisitors > 0, `${identifiedVisitors} lead(s) with visitorId`],
  ];
  const manual = [
    "Open Journey Explorer and select a newly-created visitor.",
    "Confirm first source, medium, campaign and referral are visible when supplied.",
    "Open a public product page, click Request a demo, then use Journey Explorer to confirm DEMO_START and the Growth Opportunity.",
    "Confirm the anonymous visitor has no Person until legitimate lead capture.",
    "Create a partner link in Partners, open its public /go/code URL, submit Contact, then confirm partner/referral/UTM attribution on the Lead.",
    "Open a Lead, use Separate opportunities → Create, and confirm the new Opportunity is listed independently from the Lead.",
    "Move the Lead to WON with a positive ETB deal value.",
    "From the WON Lead, use Convert WON lead to customer and confirm Person, WON Opportunity, attribution and positive ETB value in Customers.",
    "Open Customers & timelines and confirm visitor events, sales activities, notes/tasks and stage history are chronological.",
    "Repeat customer conversion and confirm no second Customer is created.",
  ];
  return <main className="min-h-screen bg-[#F8FAFC] py-8"><div className="container-aslal">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div className="text-xs font-black uppercase tracking-[.2em] text-[#0F3E8A]">Reconciliation / Phase 3</div><h1 className="mt-2 text-4xl font-black">Acceptance evidence</h1><p className="mt-2 max-w-3xl text-slate-500">Automated counts are evidence of persisted data, not a substitute for the manual journey test. Phase 3 is only complete when the manual journey is demonstrated end to end.</p></div><Link href="/dashboard" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold">← Dashboard</Link></div>
    <section className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{[["Visitors",visitors],["Events",events],["Growth signals",growth],["Leads",leads],["Customers",customers]].map(([k,v])=><div key={String(k)} className="rounded-2xl border border-slate-200 bg-white p-5"><div className="text-xs font-bold text-slate-400">{k}</div><div className="mt-2 text-3xl font-black">{v}</div></div>)}</section>
    <div className="mt-7 grid gap-6 lg:grid-cols-2">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6"><h2 className="text-xl font-black">Automated evidence</h2><div className="mt-5 space-y-2">{automated.map(([label,ok,detail])=><div key={String(label)} className="flex items-center justify-between gap-3 rounded-xl bg-[#F8FAFC] p-4"><div><div className="font-bold">{label}</div><div className="text-xs text-slate-500">{detail}</div></div><span className={ok?"font-black text-emerald-700":"font-black text-amber-700"}>{ok?"EVIDENCED":"NOT YET"}</span></div>)}</div></section>
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6"><h2 className="text-xl font-black">Manual completion checklist</h2><div className="mt-5 space-y-3">{manual.map((item,i)=><div key={item} className="flex gap-3 rounded-xl border border-slate-100 p-4"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-blue-50 text-xs font-black text-[#0F3E8A]">{i+1}</span><span className="text-sm leading-6 text-slate-600">{item}</span></div>)}</div></section>
    </div>
    <div className="mt-6 flex flex-wrap gap-3"><Link href="/dashboard/journey" className="rounded-xl bg-[#0F3E8A] px-5 py-3 font-black text-white">Open Journey Explorer</Link><Link href="/dashboard/leads" className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold">Open Leads</Link><Link href="/dashboard/insights" className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold">Open Insights</Link><Link href="/dashboard/partners" className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold">Open Partners</Link><Link href="/dashboard/customers" className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold">Open Customers</Link></div>
  </div></main>;
}
