import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { LeadStatus, prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/security";

const stages = Object.values(LeadStatus);

async function changeStatus(formData: FormData) {
  "use server";
  const session = verifySession((await cookies()).get("aslal_session")?.value);
  if (!session) redirect("/login");
  const leadId = String(formData.get("leadId") || "");
  const status = String(formData.get("status") || "") as LeadStatus;
  if (!leadId || !stages.includes(status)) return;
  const lead = await prisma.lead.findUnique({ where: { id: leadId }, select: { status: true } });
  if (!lead || lead.status === status) return;
  await prisma.$transaction([
    prisma.lead.update({ where: { id: leadId }, data: { status, ...(status === LeadStatus.WON ? { wonAt: new Date() } : {}) } }),
    prisma.leadStageHistory.create({ data: { leadId, fromStage: lead.status, toStage: status, changedBy: session.email } }),
  ]);
  revalidatePath("/dashboard/leads");
  revalidatePath(`/dashboard/leads/${leadId}`);
}

export default async function LeadsDashboard({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const session = verifySession((await cookies()).get("aslal_session")?.value);
  if (!session) redirect("/login");
  const requested = (await searchParams).status;
  const status = requested && stages.includes(requested as LeadStatus) ? (requested as LeadStatus) : undefined;
  const leads = await prisma.lead.findMany({
    where: status ? { status } : undefined,
    orderBy: [{ score: "desc" }, { updatedAt: "desc" }],
    take: 100,
    include: {
      productInterests: { include: { product: true }, orderBy: { interestScore: "desc" }, take: 3 },
      tasks: { where: { status: { in: ["OPEN", "IN_PROGRESS"] } }, orderBy: { dueAt: "asc" }, take: 1 },
    },
  });

  return <main className="min-h-screen bg-[#F8FAFC] py-10"><div className="container-aslal">
    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><div className="text-xs font-black uppercase tracking-[.2em] text-[#0F3E8A]">Growth OS / Sales</div><h1 className="mt-2 text-4xl font-black tracking-tight">Lead pipeline</h1><p className="mt-2 text-slate-500">Prioritize demand, move opportunities forward, and keep every follow-up visible.</p></div><a href="/dashboard" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#0F3E8A]">← Dashboard</a></div>
    <div className="mt-7 flex flex-wrap gap-2"><a href="/dashboard/leads" className={`rounded-full px-4 py-2 text-sm font-bold ${!status ? "bg-[#0F3E8A] text-white" : "bg-white text-slate-600"}`}>All</a>{stages.map(stage => <a key={stage} href={`/dashboard/leads?status=${stage}`} className={`rounded-full px-4 py-2 text-sm font-bold ${status === stage ? "bg-[#0F3E8A] text-white" : "bg-white text-slate-600"}`}>{stage}</a>)}</div>
    <section className="mt-6 overflow-hidden rounded-[2rem] border border-slate-200 bg-white"><div className="grid gap-px bg-slate-200 md:grid-cols-2 xl:grid-cols-3">{leads.map(lead => <article key={lead.id} className="bg-white p-6"><div className="flex items-start justify-between gap-3"><div><a href={`/dashboard/leads/${lead.id}`} className="text-lg font-black hover:text-[#0F3E8A]">{lead.name}</a><div className="mt-1 text-sm text-slate-500">{lead.company || lead.businessType || "Prospect"}</div></div><div className="rounded-full bg-[#E2B02A]/15 px-3 py-1 text-xs font-black text-[#0F3E8A]">Score {lead.score}</div></div><div className="mt-4 text-xs font-bold uppercase tracking-[.12em] text-slate-400">{lead.source || "website"} · {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(lead.createdAt)}</div><div className="mt-4 flex flex-wrap gap-2">{lead.productInterests.map(item => <span key={item.id} className="rounded-full bg-[#F8FAFC] px-3 py-1 text-xs font-semibold text-slate-600">{item.product.name}</span>)}</div>{lead.tasks[0] && <div className="mt-4 rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-800">Next: {lead.tasks[0].title}</div>}<form action={changeStatus} className="mt-5 flex gap-2"><input type="hidden" name="leadId" value={lead.id}/><select name="status" defaultValue={lead.status} className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold">{stages.map(stage => <option key={stage}>{stage}</option>)}</select><button className="rounded-xl bg-[#0F3E8A] px-4 py-2 text-sm font-bold text-white">Save</button></form></article>)}</div>{leads.length === 0 && <div className="p-12 text-center text-slate-500">No leads match this stage yet.</div>}</section>
  </div></main>;
}
