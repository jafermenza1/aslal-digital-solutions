import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdminEmail, verifySession } from "@/lib/security";
import { getProductionIntegrityReport } from "@/lib/production-integrity";
import { TestDataReset } from "@/components/LeadAdminControls";

async function requireAdmin() {
  const session = verifySession((await cookies()).get("aslal_session")?.value);
  if (!session || !isAdminEmail(session.email)) redirect("/login");
  return session;
}

async function updateTask(formData: FormData) {
  "use server";
  await requireAdmin();
  const taskId = String(formData.get("taskId") || "");
  const status = String(formData.get("status") || "");
  const assignedTo = String(formData.get("assignedTo") || "").trim().slice(0, 190) || null;
  const dueAtRaw = String(formData.get("dueAt") || "").trim();
  if (!taskId || !["OPEN","IN_PROGRESS","DONE","CANCELLED"].includes(status)) return;
  const dueAt = dueAtRaw ? new Date(dueAtRaw) : null;
  if (dueAt && Number.isNaN(dueAt.getTime())) return;
  await prisma.leadTask.update({
    where: { id: taskId },
    data: { status: status as "OPEN"|"IN_PROGRESS"|"DONE"|"CANCELLED", assignedTo, dueAt, completedAt: status === "DONE" ? new Date() : null },
  });
}

async function createTask(formData: FormData) {
  "use server";
  const session = await requireAdmin();
  const leadId = String(formData.get("leadId") || "").trim();
  const title = String(formData.get("title") || "").trim().slice(0, 190);
  const assignedTo = String(formData.get("assignedTo") || "").trim().slice(0, 190) || session.email;
  const dueAtRaw = String(formData.get("dueAt") || "").trim();
  const priority = String(formData.get("priority") || "NORMAL");
  if (!leadId || !title || !["LOW","NORMAL","HIGH","URGENT"].includes(priority)) return;
  const dueAt = dueAtRaw ? new Date(dueAtRaw) : null;
  if (dueAt && Number.isNaN(dueAt.getTime())) return;
  await prisma.leadTask.create({ data: { id: crypto.randomUUID(), leadId, title, assignedTo, dueAt, priority: priority as "LOW"|"NORMAL"|"HIGH"|"URGENT" } });
}

export const dynamic = "force-dynamic";

export default async function OperationsPage() {
  await requireAdmin();
  const [report, tasks, leads, audits] = await Promise.all([
    getProductionIntegrityReport(),
    prisma.leadTask.findMany({
      orderBy: [{ status: "asc" }, { dueAt: "asc" }, { createdAt: "desc" }],
      take: 150,
      include: { lead: { select: { id: true, name: true, company: true, status: true } } },
    }),
    prisma.lead.findMany({ where: { status: { notIn: ["WON","LOST"] } }, select: { id: true, name: true, company: true }, orderBy: { updatedAt: "desc" }, take: 300 }),
    prisma.leadAdminAudit.findMany({ orderBy: { createdAt: "desc" }, take: 40, include: { } }),
  ]);

  return <main className="portal-shell min-h-screen"><div className="mx-auto max-w-[1480px] p-4 sm:p-7">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div className="text-[10px] font-black uppercase tracking-[.2em] text-[#E2B02A]">Growth OS / Operations</div><h1 className="mt-2 text-4xl font-black">Sales operations control</h1><p className="mt-2 max-w-3xl text-white/55">Manage LeadTask follow-up and run a live production-data integrity check. Historical data is never fabricated.</p></div><div className="flex flex-wrap gap-2"><Link href="/dashboard" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white">← Dashboard</Link><Link href="/dashboard/leads" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white">Leads</Link></div></div>

    <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[
      ["Active leads",report.leads.active,report.leads.executionGaps ? "text-red-300" : "text-emerald-300"],
      ["Execution gaps",report.leads.executionGaps,report.leads.executionGaps ? "text-red-300" : "text-emerald-300"],
      ["Open tasks",report.tasks.open,"text-white"],["Overdue tasks",report.tasks.overdue,report.tasks.overdue ? "text-red-300" : "text-emerald-300"]
    ].map(([label,value,klass])=><div key={String(label)} className="portal-card p-5"><div className="text-xs font-bold text-white/45">{label}</div><div className={`mt-2 text-3xl font-black ${klass}`}>{value}</div></div>)}</section>

    <section className="mt-6 portal-card p-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><div className="text-[10px] font-black uppercase tracking-[.2em] text-[#E2B02A]">Automated live check</div><h2 className="mt-2 text-2xl font-black">{report.passed ? "Production integrity checks passed" : "Production data needs attention"}</h2><p className="mt-2 text-sm text-white/55">Checked {new Date(report.checkedAt).toLocaleString("en-ET")}. Reload to run the check again. Monitoring can call the admin API.</p></div><Link href="/dashboard/operations" className="rounded-xl bg-[#E2B02A] px-5 py-3 text-sm font-black text-[#1E293B]">Run check again</Link></div>
      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4"><CheckCard title="Database" ok={report.database.reachable} detail={report.database.reachable ? "Connection available" : "Database query failed"} /><CheckCard title="Core tables" ok={Object.keys(report.database.tables).length > 0 && Object.values(report.database.tables).every(Boolean)} detail={Object.entries(report.database.tables).filter(([,ok])=>!ok).map(([name])=>name).join(", ") || "All required tables present"} /><CheckCard title="Active lead execution" ok={report.leads.executionGaps===0} detail={report.leads.missingOwner+" owner · "+report.leads.missingNextAction+" action · "+report.leads.missingDueDate+" due-date gaps"} /><CheckCard title="Journey integrity" ok={report.journey.opportunitiesWithoutLead===0 && report.journey.wonLeadsWithoutCustomer===0 && report.journey.customersWithoutOpportunity===0} detail={report.journey.wonLeadsWithoutCustomer+" WON leads without customer"} /></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Metric label="Overdue lead actions" value={report.leads.overdue}/><Metric label="WON leads missing value" value={report.leads.wonMissingDealValue}/><Metric label="Open tasks without due date" value={report.tasks.missingDueDate}/><Metric label="Open tasks without owner" value={report.tasks.unassigned}/></div>
      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[.04] p-4 text-sm text-white/60"><b className="text-white">Migration ledger:</b> {report.database.migration.tablePresent ? report.database.migration.failed+" unfinished/failed migration record(s); latest applied: "+(report.database.migration.latest || "none") : "Prisma migration ledger table was not found."}</div>
    </section>

    <section className="mt-6 portal-card p-6"><div className="flex items-end justify-between gap-4"><div><div className="text-[10px] font-black uppercase tracking-[.2em] text-[#E2B02A]">LeadTask</div><h2 className="mt-2 text-2xl font-black">Follow-up task queue</h2></div><span className="text-xs font-bold text-white/40">Showing up to 150 tasks</span></div>
      <form action={createTask} className="mt-5 grid gap-3 lg:grid-cols-[1.4fr_1.5fr_160px_150px_140px_auto]"><select name="leadId" required className="rounded-xl border border-white/10 bg-white/[.06] px-3 py-3 text-white"><option value="">Select active lead</option>{leads.map(lead=><option key={lead.id} value={lead.id}>{lead.name}{lead.company ? " — "+lead.company : ""}</option>)}</select><input name="title" required placeholder="Call, demo, proposal..." className="rounded-xl border border-white/10 bg-white/[.06] px-3 py-3 text-white placeholder:text-white/30"/><input name="dueAt" type="datetime-local" className="rounded-xl border border-white/10 bg-white/[.06] px-3 py-3 text-white"/><select name="priority" className="rounded-xl border border-white/10 bg-white/[.06] px-3 py-3 text-white"><option>NORMAL</option><option>HIGH</option><option>URGENT</option><option>LOW</option></select><input name="assignedTo" type="email" placeholder="Owner email" className="rounded-xl border border-white/10 bg-white/[.06] px-3 py-3 text-white placeholder:text-white/30"/><button className="rounded-xl bg-[#E2B02A] px-4 py-3 font-black text-[#1E293B]">Add task</button></form>
      <div className="mt-6 overflow-x-auto"><table className="w-full min-w-[1000px] text-left text-sm"><thead><tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-white/35">{["Lead","Task","Status","Priority","Due","Assigned","Save"].map(x=><th key={x} className="px-3 py-3">{x}</th>)}</tr></thead><tbody>{tasks.map(task=><tr key={task.id} className="border-b border-white/5 align-top"><td className="px-3 py-4"><Link href={"/dashboard/leads/"+task.leadId} className="font-black text-white hover:text-[#E2B02A]">{task.lead.name}</Link><div className="text-xs text-white/35">{task.lead.status}</div></td><td className="px-3 py-4"><div className="font-bold">{task.title}</div><div className="mt-1 max-w-[300px] text-xs text-white/35">{task.description || "No description"}</div></td><td className="px-3 py-4"><select name="status" form={"task-"+task.id} defaultValue={task.status} className="rounded-lg border border-white/10 bg-white/[.06] px-2 py-2 text-xs text-white"><option>OPEN</option><option>IN_PROGRESS</option><option>DONE</option><option>CANCELLED</option></select></td><td className="px-3 py-4"><span className="rounded-full bg-white/10 px-2 py-1 text-xs font-bold">{task.priority}</span></td><td className="px-3 py-4"><input name="dueAt" form={"task-"+task.id} type="datetime-local" defaultValue={task.dueAt ? new Date(task.dueAt).toISOString().slice(0,16) : ""} className="w-[190px] rounded-lg border border-white/10 bg-white/[.06] px-2 py-2 text-xs text-white"/></td><td className="px-3 py-4"><input name="assignedTo" form={"task-"+task.id} type="email" defaultValue={task.assignedTo || ""} className="w-[210px] rounded-lg border border-white/10 bg-white/[.06] px-2 py-2 text-xs text-white"/></td><td className="px-3 py-4"><form id={"task-"+task.id} action={updateTask}><input type="hidden" name="taskId" value={task.id}/><button className="rounded-lg bg-[#0F3E8A] px-3 py-2 text-xs font-black text-white">Save</button></form></td></tr>)}</tbody></table>{tasks.length===0&&<div className="p-10 text-center text-sm text-white/40">No tasks found.</div>}</div>
    </section>
  <TestDataReset />
    <section className="mt-6 portal-card p-6"><div className="flex items-center justify-between gap-3"><div><h2 className="text-xl font-black">Admin data audit</h2><p className="mt-1 text-sm text-white/55">Recent lead corrections, deletions, and test-data resets.</p></div><a href="/api/admin/leads/export" className="rounded-xl border border-white/15 px-4 py-2 text-sm font-bold text-white">Export leads CSV</a></div><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead><tr className="border-b border-white/10 text-white/45"><th className="px-3 py-3">Time</th><th className="px-3 py-3">Action</th><th className="px-3 py-3">Lead</th><th className="px-3 py-3">Actor</th><th className="px-3 py-3">Reason</th></tr></thead><tbody>{audits.map(a=><tr key={a.id} className="border-b border-white/5 align-top"><td className="px-3 py-3 text-white/55">{new Date(a.createdAt).toLocaleString("en-ET")}</td><td className="px-3 py-3 font-black text-[#E2B02A]">{a.action}</td><td className="px-3 py-3 text-white/60">{a.leadId || "—"}</td><td className="px-3 py-3 text-white/60">{a.actor}</td><td className="px-3 py-3 text-white/70">{a.reason}</td></tr>)}{audits.length===0&&<tr><td colSpan={5} className="p-6 text-center text-white/45">No admin changes recorded yet.</td></tr>}</tbody></table></div></section>
  </div></main>;
}
function CheckCard({title,ok,detail}:{title:string;ok:boolean;detail:string}){return <div className={`rounded-2xl border p-4 ${ok ? "border-emerald-400/20 bg-emerald-400/10" : "border-red-400/25 bg-red-400/10"}`}><div className="flex items-center justify-between gap-3"><span className="font-black">{title}</span><span className="text-xs font-black">{ok ? "PASS" : "ATTENTION"}</span></div><p className="mt-2 text-xs leading-5 text-white/55">{detail}</p></div>}
function Metric({label,value}:{label:string;value:number}){return <div className="rounded-2xl bg-white/[.04] p-4"><div className="text-xs text-white/40">{label}</div><div className={`mt-1 text-2xl font-black ${value ? "text-red-300" : "text-emerald-300"}`}>{value}</div></div>}
