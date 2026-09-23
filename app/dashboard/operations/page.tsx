import Link from "next/link";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/authorization";
import { getProductionIntegrityReport } from "@/lib/production-integrity";
import { TestDataReset } from "@/components/LeadAdminControls";
import { getAutomationSnapshot } from "@/lib/automation";

type Tab = "overview" | "tasks" | "automation" | "audit";

const tabs: Array<{ key: Tab; label: string; short: string; description: string }> = [
  { key: "overview", label: "Overview", short: "Health", description: "Production integrity and what needs attention." },
  { key: "tasks", label: "Follow-up", short: "Tasks", description: "Assign, schedule and complete sales follow-up work." },
  { key: "automation", label: "Automation", short: "Automation", description: "Inspect the internal Phase 5 workflow engine." },
  { key: "audit", label: "Admin audit", short: "Audit", description: "Review administrative corrections and test-data controls." },
];

async function requireAdmin() {
  return requirePermission("operations.view");
}

async function updateTask(formData: FormData) {
  "use server";
  await requireAdmin();

  const taskId = String(formData.get("taskId") || "");
  const status = String(formData.get("status") || "");
  const assignedTo = String(formData.get("assignedTo") || "").trim().slice(0, 190) || null;
  const dueAtRaw = String(formData.get("dueAt") || "").trim();

  if (!taskId || !["OPEN", "IN_PROGRESS", "DONE", "CANCELLED"].includes(status)) return;

  const dueAt = dueAtRaw ? new Date(dueAtRaw) : null;
  if (dueAt && Number.isNaN(dueAt.getTime())) return;

  await prisma.leadTask.update({
    where: { id: taskId },
    data: {
      status: status as "OPEN" | "IN_PROGRESS" | "DONE" | "CANCELLED",
      assignedTo,
      dueAt,
      completedAt: status === "DONE" ? new Date() : null,
    },
  });

  revalidatePath("/dashboard/operations");
  revalidatePath("/dashboard/leads");
  redirect("/dashboard/operations?tab=tasks");
}

async function createTask(formData: FormData) {
  "use server";
  const session = await requireAdmin();

  const leadId = String(formData.get("leadId") || "").trim();
  const title = String(formData.get("title") || "").trim().slice(0, 190);
  const assignedTo = String(formData.get("assignedTo") || "").trim().slice(0, 190) || session.email;
  const dueAtRaw = String(formData.get("dueAt") || "").trim();
  const priority = String(formData.get("priority") || "NORMAL");

  if (!leadId || !title || !["LOW", "NORMAL", "HIGH", "URGENT"].includes(priority)) return;

  const dueAt = dueAtRaw ? new Date(dueAtRaw) : null;
  if (dueAt && Number.isNaN(dueAt.getTime())) return;

  await prisma.leadTask.create({
    data: {
      id: crypto.randomUUID(),
      leadId,
      title,
      assignedTo,
      dueAt,
      priority: priority as "LOW" | "NORMAL" | "HIGH" | "URGENT",
    },
  });

  revalidatePath("/dashboard/operations");
  revalidatePath("/dashboard/leads");
  redirect("/dashboard/operations?tab=tasks");
}

export const dynamic = "force-dynamic";

export default async function OperationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();

  const params = await searchParams;
  const rawTab = typeof params.tab === "string" ? params.tab : "overview";
  const tab: Tab = tabs.some((item) => item.key === rawTab) ? (rawTab as Tab) : "overview";
  const activeTab = tabs.find((item) => item.key === tab) || tabs[0];

  const report = tab === "overview" ? await getProductionIntegrityReport() : null;

  const [tasks, leads] =
    tab === "tasks"
      ? await Promise.all([
          prisma.leadTask.findMany({
            orderBy: [{ status: "asc" }, { dueAt: "asc" }, { createdAt: "desc" }],
            take: 150,
            include: {
              lead: { select: { id: true, name: true, company: true, status: true } },
            },
          }),
          prisma.lead.findMany({
            where: { status: { notIn: ["WON", "LOST"] } },
            select: { id: true, name: true, company: true },
            orderBy: { updatedAt: "desc" },
            take: 300,
          }),
        ])
      : [[], []];

  const automation = tab === "automation" ? await getAutomationSnapshot(30) : null;
  const audits =
    tab === "audit"
      ? await prisma.leadAdminAudit.findMany({ orderBy: { createdAt: "desc" }, take: 40 })
      : [];

  return (
    <main className="portal-shell min-h-screen">
      <div className="mx-auto max-w-[1180px] p-4 sm:p-6 lg:p-8">
        <header className="rounded-3xl border border-white/10 bg-white/[.03] p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <div className="text-[10px] font-black uppercase tracking-[.2em] text-[#E2B02A]">
                Growth OS / Operations
              </div>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Sales operations</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">{activeTab.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/dashboard" className="rounded-full border border-white/15 px-4 py-2.5 text-sm font-bold text-white">
                ← Dashboard
              </Link>
              <Link href="/dashboard/leads" className="rounded-full border border-white/15 px-4 py-2.5 text-sm font-bold text-white">
                Leads
              </Link>
            </div>
          </div>

          <nav aria-label="Operations sections" className="-mx-1 mt-6 flex gap-2 overflow-x-auto px-1 pb-1">
            {tabs.map((item) => {
              const active = item.key === tab;
              return (
                <Link
                  key={item.key}
                  href={`/dashboard/operations?tab=${item.key}`}
                  aria-current={active ? "page" : undefined}
                  className={
                    active
                      ? "shrink-0 rounded-2xl bg-[#E2B02A] px-4 py-3 text-sm font-black text-[#1E293B] shadow-sm"
                      : "shrink-0 rounded-2xl border border-white/10 bg-white/[.04] px-4 py-3 text-sm font-bold text-white/65 hover:text-white"
                  }
                >
                  <span className="hidden sm:inline">{item.label}</span>
                  <span className="sm:hidden">{item.short}</span>
                </Link>
              );
            })}
          </nav>
        </header>

        {tab === "overview" && report && (
          <>
            <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Metric label="Active leads" value={report.leads.active} danger={false} />
              <Metric label="Execution gaps" value={report.leads.executionGaps} danger={report.leads.executionGaps > 0} />
              <Metric label="Open tasks" value={report.tasks.open} danger={false} />
              <Metric label="Overdue tasks" value={report.tasks.overdue} danger={report.tasks.overdue > 0} />
            </section>

            <section className="mt-5 grid gap-4 lg:grid-cols-2">
              <section className="portal-card p-5 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[.2em] text-[#E2B02A]">Production integrity</div>
                    <h2 className="mt-2 text-2xl font-black">{report.passed ? "Checks passed" : "Attention required"}</h2>
                    <p className="mt-2 text-sm leading-6 text-white/50">
                      Last checked {new Date(report.checkedAt).toLocaleString("en-ET")}.
                    </p>
                  </div>
                  <Link
                    href="/dashboard/operations?tab=overview"
                    className="shrink-0 rounded-xl bg-[#E2B02A] px-4 py-2.5 text-sm font-black text-[#1E293B]"
                  >
                    Refresh
                  </Link>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <CheckCard title="Database" ok={report.database.reachable} detail={report.database.reachable ? "Connection available." : "Database query failed."} />
                  <CheckCard
                    title="Core tables"
                    ok={Object.keys(report.database.tables).length > 0 && Object.values(report.database.tables).every(Boolean)}
                    detail={Object.entries(report.database.tables).filter(([, ok]) => !ok).map(([name]) => name).join(", ") || "All required tables present."}
                  />
                  <CheckCard
                    title="Lead execution"
                    ok={report.leads.executionGaps === 0}
                    detail={`${report.leads.missingOwner} owner · ${report.leads.missingNextAction} action · ${report.leads.missingDueDate} due-date gaps`}
                  />
                  <CheckCard
                    title="Journey integrity"
                    ok={report.journey.opportunitiesWithoutLead === 0 && report.journey.wonLeadsWithoutCustomer === 0 && report.journey.customersWithoutOpportunity === 0}
                    detail={`${report.journey.wonLeadsWithoutCustomer} WON lead(s) without customer · ${report.journey.customersWithoutOpportunity} customer(s) without opportunity`}
                  />
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <MiniStat label="Overdue lead actions" value={report.leads.overdue} />
                  <MiniStat label="WON leads missing value" value={report.leads.wonMissingDealValue} />
                  <MiniStat label="Tasks without due date" value={report.tasks.missingDueDate} />
                  <MiniStat label="Tasks without owner" value={report.tasks.unassigned} />
                </div>
              </section>

              <section className="portal-card p-5 sm:p-6">
                <div className="text-[10px] font-black uppercase tracking-[.2em] text-[#E2B02A]">Readiness</div>
                <h2 className="mt-2 text-2xl font-black">What happens next?</h2>
                <div className="mt-5 space-y-3">
                  {([
                    ["1", "Close real data-quality gaps", report.leads.executionGaps > 0 || report.tasks.missingDueDate > 0 || report.tasks.unassigned > 0],
                    ["2", "Verify Phase 5 scheduler", true],
                    ["3", "Run controlled acceptance", true],
                    ["4", "Reconcile Phase 5 evidence", true],
                  ] as const).map(([number, text, active]) => (

                    <div key={number} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[.035] p-4">
                      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-black ${active ? "bg-[#E2B02A]/15 text-[#E2B02A]" : "bg-white/10 text-white/40"}`}>
                        {number}
                      </span>
                      <div>
                        <div className="font-black">{text}</div>
                        <div className="mt-1 text-xs leading-5 text-white/40">
                          {number === "1" ? "Use the audited admin tools; never invent values." : "Required before Phase 5 can move to SATISFIED."}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </section>

            <p className="mt-4 text-xs leading-5 text-white/35">
              Overdue work is displayed honestly. It is not cleared by changing dates unless the underlying business work was actually rescheduled.
            </p>
          </>
        )}

        {tab === "tasks" && (
          <>
            <section className="mt-5 portal-card p-5 sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[.2em] text-[#E2B02A]">Follow-up queue</div>
                  <h2 className="mt-2 text-2xl font-black">Create sales work</h2>
                  <p className="mt-2 text-sm leading-6 text-white/50">Keep the work explicit: who, what, and by when.</p>
                </div>
                <div className="text-xs font-bold text-white/35">{tasks.length} tasks loaded</div>
              </div>

              <form action={createTask} className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
                <select name="leadId" required className="rounded-xl border border-white/10 bg-white/[.06] px-3 py-3 text-sm text-white lg:col-span-2">
                  <option value="">Select active lead</option>
                  {leads.map((lead) => (
                    <option key={lead.id} value={lead.id}>{lead.name}{lead.company ? ` — ${lead.company}` : ""}</option>
                  ))}
                </select>
                <input name="title" required placeholder="Call, demo, proposal..." className="rounded-xl border border-white/10 bg-white/[.06] px-3 py-3 text-sm text-white placeholder:text-white/30 lg:col-span-2" />
                <input name="dueAt" type="datetime-local" className="rounded-xl border border-white/10 bg-white/[.06] px-3 py-3 text-sm text-white" />
                <select name="priority" className="rounded-xl border border-white/10 bg-white/[.06] px-3 py-3 text-sm text-white">
                  <option>NORMAL</option><option>HIGH</option><option>URGENT</option><option>LOW</option>
                </select>
                <input name="assignedTo" type="email" placeholder="Owner email" className="rounded-xl border border-white/10 bg-white/[.06] px-3 py-3 text-sm text-white placeholder:text-white/30 lg:col-span-2" />
                <button className="rounded-xl bg-[#E2B02A] px-4 py-3 text-sm font-black text-[#1E293B] lg:col-span-4">Add follow-up task</button>
              </form>
            </section>

            <section className="mt-5">
              <div className="hidden overflow-hidden rounded-3xl border border-white/10 bg-white/[.02] lg:block">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-white/35">
                      {["Lead", "Task", "Status", "Priority", "Due", "Assigned", "Save"].map((label) => <th key={label} className="px-4 py-4">{label}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => (
                      <tr key={task.id} className="border-b border-white/5 align-top">
                        <td className="px-4 py-4">
                          <Link href={`/dashboard/leads/${task.leadId}`} className="font-black text-white hover:text-[#E2B02A]">{task.lead.name}</Link>
                          <div className="mt-1 text-xs text-white/35">{task.lead.status}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-bold">{task.title}</div>
                          <div className="mt-1 max-w-[340px] text-xs leading-5 text-white/35">{task.description || "No description"}</div>
                        </td>
                        <td className="px-4 py-4">
                          <form action={updateTask} className="grid gap-2">
                            <input type="hidden" name="taskId" value={task.id} />
                            <select name="status" defaultValue={task.status} className="rounded-lg border border-white/10 bg-white/[.06] px-2 py-2 text-xs text-white">
                              <option>OPEN</option><option>IN_PROGRESS</option><option>DONE</option><option>CANCELLED</option>
                            </select>
                            <input name="dueAt" type="datetime-local" defaultValue={task.dueAt ? new Date(task.dueAt).toISOString().slice(0, 16) : ""} className="rounded-lg border border-white/10 bg-white/[.06] px-2 py-2 text-xs text-white" />
                            <input name="assignedTo" type="email" defaultValue={task.assignedTo || ""} className="rounded-lg border border-white/10 bg-white/[.06] px-2 py-2 text-xs text-white" />
                            <button className="rounded-lg bg-[#0F3E8A] px-3 py-2 text-xs font-black text-white">Save</button>
                          </form>
                        </td>
                        <td className="px-4 py-4"><span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-black">{task.priority}</span></td>
                        <td className="px-4 py-4 text-xs text-white/55">{task.dueAt ? new Date(task.dueAt).toLocaleString("en-ET") : "No due date"}</td>
                        <td className="px-4 py-4 text-xs text-white/55">{task.assignedTo || "Unassigned"}</td>
                        <td className="px-4 py-4 text-xs text-white/35">Edit in Status column</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {tasks.length === 0 && <div className="p-12 text-center text-sm text-white/40">No tasks found.</div>}
              </div>

              <div className="space-y-3 lg:hidden">
                {tasks.map((task) => (
                  <article key={task.id} className="portal-card p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link href={`/dashboard/leads/${task.leadId}`} className="font-black text-white hover:text-[#E2B02A]">{task.lead.name}</Link>
                        <div className="mt-1 text-xs text-white/35">{task.lead.status}</div>
                      </div>
                      <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-black">{task.priority}</span>
                    </div>
                    <div className="mt-4 font-bold">{task.title}</div>
                    <div className="mt-1 text-xs leading-5 text-white/35">{task.description || "No description"}</div>
                    <form action={updateTask} className="mt-4 grid gap-2">
                      <input type="hidden" name="taskId" value={task.id} />
                      <label className="text-xs font-bold text-white/45">Status
                        <select name="status" defaultValue={task.status} className="mt-1 w-full rounded-xl border border-white/10 bg-white/[.06] px-3 py-2.5 text-sm text-white">
                          <option>OPEN</option><option>IN_PROGRESS</option><option>DONE</option><option>CANCELLED</option>
                        </select>
                      </label>
                      <label className="text-xs font-bold text-white/45">Due
                        <input name="dueAt" type="datetime-local" defaultValue={task.dueAt ? new Date(task.dueAt).toISOString().slice(0, 16) : ""} className="mt-1 w-full rounded-xl border border-white/10 bg-white/[.06] px-3 py-2.5 text-sm text-white" />
                      </label>
                      <label className="text-xs font-bold text-white/45">Assigned to
                        <input name="assignedTo" type="email" defaultValue={task.assignedTo || ""} placeholder="Owner email" className="mt-1 w-full rounded-xl border border-white/10 bg-white/[.06] px-3 py-2.5 text-sm text-white placeholder:text-white/30" />
                      </label>
                      <button className="mt-1 rounded-xl bg-[#0F3E8A] px-3 py-2.5 text-sm font-black text-white">Save task</button>
                    </form>
                  </article>
                ))}
                {tasks.length === 0 && <div className="portal-card p-10 text-center text-sm text-white/40">No tasks found.</div>}
              </div>
            </section>
          </>
        )}

        {tab === "automation" && automation && (
          <section className="mt-5 space-y-5">
            <section className="portal-card p-5 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[.2em] text-[#E2B02A]">Phase 5</div>
                  <h2 className="mt-2 text-2xl font-black">Sales follow-up automation</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
                    Internal-only automation is enabled: tasks and activities, durable executions, retries, delayed actions, and cancellation on reply or terminal lead state. Customer-facing promotional automation remains disabled.
                  </p>
                </div>
                <Link href="/api/admin/automation" className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-bold text-white">Raw status</Link>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <MiniStat label="Active workflows" value={automation.workflows.filter((workflow) => workflow.active).length} />
                <MiniStat label="Recent executions" value={automation.executions.recentTotal} />
                <MiniStat label="Pending" value={automation.executions.pending} />
                <MiniStat label="Failed in 24h" value={automation.executions.failedRecent} />
              </div>
            </section>

            <section className="portal-card p-5 sm:p-6">
              <h3 className="text-xl font-black">Workflows</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {automation.workflows.map((workflow) => (
                  <div key={workflow.id} className="rounded-2xl border border-white/10 bg-white/[.035] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-black">{workflow.name}</div>
                        <div className="mt-1 text-xs text-white/40">{workflow.systemKey}</div>
                      </div>
                      <span className={workflow.active ? "rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] font-black text-emerald-300" : "rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-black text-white/45"}>
                        {workflow.active ? "ACTIVE" : "OFF"}
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold text-white/45">
                      <span className="rounded-full bg-white/10 px-2.5 py-1">{workflow.triggerType}</span>
                      <span className="rounded-full bg-white/10 px-2.5 py-1">v{workflow.version ?? "—"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="hidden overflow-hidden rounded-3xl border border-white/10 bg-white/[.02] lg:block">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-white/35">
                      {["Workflow", "Trigger", "Target", "Status", "Attempts", "Created", "Error"].map((label) => <th key={label} className="px-4 py-4">{label}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {automation.recentExecutions.map((item) => (
                      <tr key={item.id} className="border-b border-white/5 align-top">
                        <td className="px-4 py-4 font-black">{item.workflow.name}</td>
                        <td className="px-4 py-4 text-white/55">{item.triggerType}</td>
                        <td className="px-4 py-4 text-white/55">{item.targetType}:{item.targetId}</td>
                        <td className="px-4 py-4 font-black">{item.status}</td>
                        <td className="px-4 py-4 text-white/55">{item.attempts}</td>
                        <td className="px-4 py-4 text-white/55">{new Date(item.createdAt).toLocaleString("en-ET")}</td>
                        <td className="px-4 py-4 text-red-200/80">{item.lastError || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {automation.recentExecutions.length === 0 && <div className="p-12 text-center text-sm text-white/40">No automation executions yet.</div>}
              </div>

              <div className="space-y-3 lg:hidden">
                {automation.recentExecutions.map((item) => (
                  <article key={item.id} className="portal-card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="font-black">{item.workflow.name}</div>
                      <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-black">{item.status}</span>
                    </div>
                    <div className="mt-3 grid gap-2 text-xs text-white/50">
                      <div><span className="text-white/30">Trigger:</span> {item.triggerType}</div>
                      <div><span className="text-white/30">Target:</span> {item.targetType}:{item.targetId}</div>
                      <div><span className="text-white/30">Attempts:</span> {item.attempts}</div>
                      <div><span className="text-white/30">Created:</span> {new Date(item.createdAt).toLocaleString("en-ET")}</div>
                      {item.lastError && <div className="text-red-200/80"><span className="text-white/30">Error:</span> {item.lastError}</div>}
                    </div>
                  </article>
                ))}
                {automation.recentExecutions.length === 0 && <div className="portal-card p-10 text-center text-sm text-white/40">No automation executions yet.</div>}
              </div>
            </section>
          </section>
        )}

        {tab === "audit" && (
          <section className="mt-5 space-y-5">
            <div className="portal-card p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[.2em] text-[#E2B02A]">Administration</div>
                  <h2 className="mt-2 text-2xl font-black">Audit & test-data controls</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
                    Corrections, deletions and test-data cleanup remain explicit and audited.
                  </p>
                </div>
                <Link href="/api/admin/leads/export" className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-bold text-white">Export leads CSV</Link>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <MiniStat label="Recent audit records" value={audits.length} />
                <MiniStat label="Correction policy" value="Reason required" />
                <MiniStat label="Test reset" value="Explicit confirmation" />
              </div>
            </div>

            <div className="hidden overflow-hidden rounded-3xl border border-white/10 bg-white/[.02] lg:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-white/35">
                    {["Time", "Action", "Lead", "Actor", "Reason"].map((label) => <th key={label} className="px-4 py-4">{label}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {audits.map((audit) => (
                    <tr key={audit.id} className="border-b border-white/5 align-top">
                      <td className="px-4 py-4 text-white/50">{new Date(audit.createdAt).toLocaleString("en-ET")}</td>
                      <td className="px-4 py-4 font-black text-[#E2B02A]">{audit.action}</td>
                      <td className="px-4 py-4 text-white/55">{audit.leadId || "—"}</td>
                      <td className="px-4 py-4 text-white/55">{audit.actor}</td>
                      <td className="px-4 py-4 text-white/70">{audit.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {audits.length === 0 && <div className="p-12 text-center text-sm text-white/40">No admin changes recorded yet.</div>}
            </div>

            <div className="space-y-3 lg:hidden">
              {audits.map((audit) => (
                <article key={audit.id} className="portal-card p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-[#E2B02A]/15 px-2.5 py-1 text-[10px] font-black text-[#E2B02A]">{audit.action}</span>
                    <span className="text-[10px] text-white/35">{new Date(audit.createdAt).toLocaleDateString("en-ET")}</span>
                  </div>
                  <div className="mt-3 grid gap-2 text-xs">
                    <div><span className="text-white/30">Lead:</span> {audit.leadId || "—"}</div>
                    <div><span className="text-white/30">Actor:</span> {audit.actor}</div>
                    <div className="leading-5 text-white/65"><span className="text-white/30">Reason:</span> {audit.reason}</div>
                  </div>
                </article>
              ))}
              {audits.length === 0 && <div className="portal-card p-10 text-center text-sm text-white/40">No admin changes recorded yet.</div>}
            </div>

            <TestDataReset />
          </section>
        )}
      </div>
    </main>
  );
}

function Metric({ label, value, danger }: { label: string; value: number; danger: boolean }) {
  return (
    <div className="portal-card p-5">
      <div className="text-xs font-bold text-white/45">{label}</div>
      <div className={`mt-2 text-3xl font-black ${danger ? "text-red-300" : ""}`}>{value}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl bg-white/[.04] p-4">
      <div className="text-xs text-white/40">{label}</div>
      <div className="mt-1 break-words text-xl font-black">{value}</div>
    </div>
  );
}

function CheckCard({ title, ok, detail }: { title: string; ok: boolean; detail: string }) {
  return (
    <div className={`rounded-2xl border p-4 ${ok ? "border-emerald-400/20 bg-emerald-400/10" : "border-red-400/25 bg-red-400/10"}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="font-black">{title}</span>
        <span className="text-[10px] font-black">{ok ? "PASS" : "ATTENTION"}</span>
      </div>
      <p className="mt-2 text-xs leading-5 text-white/55">{detail}</p>
    </div>
  );
}
