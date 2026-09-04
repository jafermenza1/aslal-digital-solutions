import Link from "next/link";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { LeadStatus, prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/security";

async function requireSession() {
  const session = verifySession((await cookies()).get("aslal_session")?.value);
  if (!session) redirect("/login");
  return session;
}

async function addNote(formData: FormData) {
  "use server";
  const session = await requireSession();
  const leadId = String(formData.get("leadId") || "");
  const body = String(formData.get("body") || "").trim().slice(0, 5000);
  if (!leadId || !body) return;
  await prisma.leadNote.create({ data: { id: crypto.randomUUID(), leadId, body, author: session.email } });
  revalidatePath(`/dashboard/leads/${leadId}`);
}

async function addTask(formData: FormData) {
  "use server";
  const session = await requireSession();
  const leadId = String(formData.get("leadId") || "");
  const title = String(formData.get("title") || "").trim().slice(0, 190);
  const dueAtRaw = String(formData.get("dueAt") || "");
  const priority = String(formData.get("priority") || "NORMAL") as "LOW" | "NORMAL" | "HIGH" | "URGENT";
  if (!leadId || !title || !["LOW", "NORMAL", "HIGH", "URGENT"].includes(priority)) return;
  await prisma.leadTask.create({ data: { id: crypto.randomUUID(), leadId, title, priority, dueAt: dueAtRaw ? new Date(dueAtRaw) : null, assignedTo: session.email } });
  revalidatePath(`/dashboard/leads/${leadId}`);
  revalidatePath("/dashboard/leads");
}

async function completeTask(formData: FormData) {
  "use server";
  await requireSession();
  const leadId = String(formData.get("leadId") || "");
  const taskId = String(formData.get("taskId") || "");
  if (!leadId || !taskId) return;
  const task = await prisma.leadTask.findFirst({ where: { id: taskId, leadId }, select: { id: true, status: true } });
  if (!task || task.status === "DONE") return;
  await prisma.leadTask.update({ where: { id: task.id }, data: { status: "DONE", completedAt: new Date() } });
  revalidatePath(`/dashboard/leads/${leadId}`);
  revalidatePath("/dashboard/leads");
}

async function updateLead(formData: FormData) {
  "use server";
  const session = await requireSession();
  const leadId = String(formData.get("leadId") || "");
  const status = String(formData.get("status") || "") as LeadStatus;
  const dealValueRaw = String(formData.get("dealValue") || "").trim();
  if (!leadId || !Object.values(LeadStatus).includes(status)) return;
  const parsedDealValue = dealValueRaw ? Number(dealValueRaw) : null;
  if (parsedDealValue !== null && (!Number.isFinite(parsedDealValue) || parsedDealValue < 0)) return;
  const lead = await prisma.lead.findUnique({ where: { id: leadId }, select: { status: true } });
  if (!lead) return;
  await prisma.$transaction([
    prisma.lead.update({ where: { id: leadId }, data: { status, dealValue: parsedDealValue, ...(status === LeadStatus.WON ? { wonAt: new Date() } : {}) } }),
    ...(lead.status !== status ? [prisma.leadStageHistory.create({ data: { leadId, fromStage: lead.status, toStage: status, changedBy: session.email } })] : []),
  ]);
  revalidatePath(`/dashboard/leads/${leadId}`);
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard");
}

function scoreBand(score: number) {
  if (score >= 80) return { label: "Priority", text: "Immediate human follow-up recommended." };
  if (score >= 60) return { label: "Hot", text: "Strong buying intent. Contact promptly." };
  if (score >= 30) return { label: "Warm", text: "Active interest. Continue qualification." };
  return { label: "Cold", text: "Early interest. Nurture and watch for new signals." };
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      visitor: true,
      notes: { orderBy: { createdAt: "desc" }, take: 30 },
      tasks: { orderBy: [{ status: "asc" }, { dueAt: "asc" }, { createdAt: "desc" }] },
      stageHistory: { orderBy: { createdAt: "desc" }, take: 30 },
      productInterests: { include: { product: true }, orderBy: { interestScore: "desc" } },
      commissions: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  if (!lead) notFound();
  const band = scoreBand(lead.score);
  const contactPhone = lead.phone?.replace(/[^\d+]/g, "");
  const openTasks = lead.tasks.filter(task => task.status !== "DONE" && task.status !== "CANCELLED");

  return <main className="min-h-screen bg-[#F8FAFC] py-10"><div className="container-aslal">
    <Link href="/dashboard/leads" className="text-sm font-bold text-[#0F3E8A]">← Back to lead inbox</Link>
    <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><div className="text-xs font-black uppercase tracking-[.2em] text-[#0F3E8A]">Opportunity / {lead.status}</div><h1 className="mt-2 text-4xl font-black">{lead.name}</h1><p className="mt-2 text-slate-500">{lead.company || lead.businessType || "Prospect"} · {lead.email || lead.phone || "No contact details"}</p><div className="mt-4 flex flex-wrap gap-2">{lead.email && <a href={`mailto:${lead.email}`} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold">Email</a>}{contactPhone && <a href={`tel:${contactPhone}`} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold">Call</a>}{contactPhone && <a href={`https://wa.me/${contactPhone.replace(/^\+/, "")}`} target="_blank" rel="noreferrer" className="rounded-xl bg-[#0F3E8A] px-4 py-2 text-sm font-bold text-white">WhatsApp</a>}</div></div><div className="rounded-2xl bg-[#0F3E8A] px-6 py-4 text-white"><div className="text-xs font-bold uppercase tracking-[.14em] text-white/60">Lead score · {band.label}</div><div className="mt-1 text-3xl font-black text-[#E2B02A]">{lead.score}<span className="ml-2 text-sm text-white/60">/ 100</span></div></div></div>

    <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <section className="space-y-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6"><div className="flex flex-col justify-between gap-2 sm:flex-row"><div><h2 className="text-xl font-black">Sales control</h2><p className="mt-1 text-sm text-slate-500">{band.text}</p></div><div className="text-sm font-bold text-slate-500">{openTasks.length} open task{openTasks.length === 1 ? "" : "s"}</div></div><form action={updateLead} className="mt-5 grid gap-4 sm:grid-cols-3"><input type="hidden" name="leadId" value={lead.id}/><label className="text-sm font-bold">Stage<select name="status" defaultValue={lead.status} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3">{Object.values(LeadStatus).map(stage => <option key={stage}>{stage}</option>)}</select></label><label className="text-sm font-bold">Deal value (ETB)<input name="dealValue" type="number" min="0" step="0.01" defaultValue={lead.dealValue?.toString() || ""} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3"/></label><button className="self-end rounded-xl bg-[#0F3E8A] px-5 py-3 font-bold text-white">Save opportunity</button></form>{lead.message && <div className="mt-5 rounded-xl bg-[#F8FAFC] p-4 text-sm leading-6 text-slate-600">{lead.message}</div>}</div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6"><h2 className="text-xl font-black">Follow-up tasks</h2><form action={addTask} className="mt-5 grid gap-3 sm:grid-cols-[1fr_160px_140px_auto]"><input type="hidden" name="leadId" value={lead.id}/><input name="title" required placeholder="Call, demo, proposal..." className="rounded-xl border border-slate-200 px-3 py-3"/><input name="dueAt" type="datetime-local" className="rounded-xl border border-slate-200 px-3 py-3"/><select name="priority" className="rounded-xl border border-slate-200 px-3 py-3"><option>NORMAL</option><option>HIGH</option><option>URGENT</option><option>LOW</option></select><button className="rounded-xl bg-[#E2B02A] px-4 py-3 font-black text-[#1E293B]">Add</button></form><div className="mt-5 space-y-2">{lead.tasks.map(task => <div key={task.id} className="flex items-center justify-between gap-3 rounded-xl bg-[#F8FAFC] p-4"><div><div className={`font-bold ${task.status === "DONE" ? "line-through text-slate-400" : ""}`}>{task.title}</div><div className="mt-1 text-xs text-slate-500">{task.priority} · {task.dueAt ? new Date(task.dueAt).toLocaleString() : "No due date"}</div></div>{task.status !== "DONE" && task.status !== "CANCELLED" && <form action={completeTask}><input type="hidden" name="leadId" value={lead.id}/><input type="hidden" name="taskId" value={task.id}/><button className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold">Done</button></form>}</div>)}{lead.tasks.length === 0 && <p className="text-sm text-slate-500">No follow-up tasks yet.</p>}</div></div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6"><h2 className="text-xl font-black">Sales notes</h2><form action={addNote} className="mt-5"><input type="hidden" name="leadId" value={lead.id}/><textarea name="body" required rows={4} placeholder="What did the prospect say? What is the next sales angle?" className="w-full rounded-xl border border-slate-200 p-3"/><button className="mt-3 rounded-xl bg-[#0F3E8A] px-5 py-3 font-bold text-white">Add note</button></form><div className="mt-6 space-y-4">{lead.notes.map(note => <div key={note.id} className="border-l-2 border-[#E2B02A] pl-4"><div className="text-sm leading-6 text-slate-700">{note.body}</div><div className="mt-1 text-xs text-slate-400">{note.author || "Team"} · {new Date(note.createdAt).toLocaleString()}</div></div>)}{lead.notes.length === 0 && <p className="text-sm text-slate-500">No notes yet.</p>}</div></div>
      </section>

      <aside className="space-y-6"><div className="rounded-[2rem] border border-slate-200 bg-white p-6"><h2 className="text-lg font-black">Demand intelligence</h2><div className="mt-5 space-y-3">{lead.productInterests.map(item => <div key={item.id} className="rounded-xl bg-[#F8FAFC] p-4"><div className="font-bold">{item.product.name}</div><div className="mt-1 text-xs text-slate-500">Interest score {item.interestScore} · {item.source || "behavior"}</div></div>)}{lead.productInterests.length === 0 && <p className="text-sm text-slate-500">No product interest is attached to this lead yet.</p>}</div></div><div className="rounded-[2rem] border border-slate-200 bg-white p-6"><h2 className="text-lg font-black">Attribution</h2><dl className="mt-5 space-y-3 text-sm"><div className="flex justify-between gap-4"><dt className="text-slate-500">Source</dt><dd className="font-bold">{lead.source || "website"}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Medium</dt><dd className="font-bold">{lead.medium || "—"}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Campaign</dt><dd className="font-bold">{lead.campaign || "—"}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Referral</dt><dd className="font-bold">{lead.referralCode || "—"}</dd></div></dl></div><div className="rounded-[2rem] border border-slate-200 bg-white p-6"><h2 className="text-lg font-black">Stage history</h2><div className="mt-5 space-y-3">{lead.stageHistory.map(item => <div key={item.id.toString()} className="text-sm"><div className="font-bold">{item.fromStage || "START"} → {item.toStage}</div>{item.note && <div className="text-xs text-slate-500">{item.note}</div>}<div className="text-xs text-slate-400">{item.changedBy || "system"} · {new Date(item.createdAt).toLocaleString()}</div></div>)}{lead.stageHistory.length === 0 && <p className="text-sm text-slate-500">No stage history yet.</p>}</div></div></aside>
    </div>
  </div></main>;
}
