import Link from "next/link";
import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/authorization";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ClientDashboard({ searchParams }: { searchParams: Promise<{ workspaceId?: string }> }) {
  const user = await requirePermission("dashboard.view");
  if (user.role !== "CLIENT") redirect("/dashboard");

  const { workspaceId } = await searchParams;
  const access = await authorizeWorkspacePermission("dashboard.view", workspaceId);
  if (!access) redirect("/dashboard");
  const wid = access.workspace.id;

  const [leads, customers, orders, tasks, commissions] = await Promise.all([
    prisma.lead.findMany({
      where: { workspaceId: wid },
      orderBy: { updatedAt: "desc" },
      take: 100,
      select: { id: true, name: true, company: true, status: true, score: true, ownerEmail: true, nextAction: true, nextActionDueAt: true, dealValue: true, createdAt: true },
    }),
    prisma.customer.count({ where: { workspaceId: wid } }),
    prisma.order.findMany({
      where: { workspaceId: wid },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { id: true, orderNumber: true, status: true, paymentState: true, total: true, currency: true, createdAt: true, customer: { select: { name: true } } },
    }),
    prisma.leadTask.findMany({
      where: { lead: { workspaceId: wid }, status: { in: ["OPEN", "IN_PROGRESS"] } },
      orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
      take: 100,
      select: { id: true, title: true, status: true, priority: true, dueAt: true, assignedTo: true, lead: { select: { id: true, name: true } } },
    }),
    prisma.commission.aggregate({
      where: { workspaceId: wid },
      _sum: { amount: true },
    }),
  ]);

  const activeLeads = leads.filter((lead) => !["WON", "LOST"].includes(lead.status));
  const overdueTasks = tasks.filter((task) => task.dueAt && task.dueAt.getTime() < Date.now()).length;
  const pipelineValue = activeLeads.reduce((sum, lead) => sum + Number(lead.dealValue || 0), 0);

  return (
    <main className="min-h-screen bg-[#F8FAFC] py-10">
      <div className="container-aslal space-y-7">
        <header className="rounded-[2rem] bg-[#0F3E8A] p-7 text-white shadow-sm">
          <div className="text-xs font-black uppercase tracking-[.2em] text-white/60">Growth OS / Client CRM</div>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">Client pipeline</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/75">
            Workspace-scoped view of your pipeline, assigned sales work, orders and financial progress.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-sm font-bold">
            <span className="rounded-full bg-white/10 px-4 py-2">Workspace · {access.workspace.name}</span>
            <Link href="/dashboard" className="rounded-full bg-white px-4 py-2 text-[#0F3E8A]">Dashboard</Link>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Active pipeline", activeLeads.length],
            ["Pipeline value", "ETB " + pipelineValue.toLocaleString("en-ET", { maximumFractionDigits: 0 })],
            ["Customers", customers],
            ["Open tasks", tasks.length],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-xs font-black uppercase tracking-wider text-slate-400">{label}</div>
              <div className="mt-2 text-2xl font-black text-slate-900">{value}</div>
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-end justify-between gap-3">
              <div><div className="text-xs font-black uppercase tracking-wider text-[#0F3E8A]">CRM</div><h2 className="mt-1 text-xl font-black">Assigned lead pipeline</h2></div>
              <span className="text-xs font-bold text-slate-400">{activeLeads.length} active</span>
            </div>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead><tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400"><th className="px-3 py-3">Lead</th><th className="px-3 py-3">Owner</th><th className="px-3 py-3">Stage</th><th className="px-3 py-3">Next action</th><th className="px-3 py-3">Value</th></tr></thead>
                <tbody>{activeLeads.map((lead) => <tr key={lead.id} className="border-b border-slate-50"><td className="px-3 py-4"><Link href={"/dashboard/leads/" + lead.id} className="font-black text-[#0F3E8A]">{lead.name}</Link><div className="text-xs text-slate-400">{lead.company || "Prospect"}</div></td><td className="px-3 py-4 font-semibold">{lead.ownerEmail || "Unassigned"}</td><td className="px-3 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black">{lead.status}</span></td><td className="px-3 py-4">{lead.nextAction || "—"}{lead.nextActionDueAt && <div className="text-xs text-slate-400">{lead.nextActionDueAt.toLocaleString("en-ET")}</div>}</td><td className="px-3 py-4 font-bold">ETB {Number(lead.dealValue || 0).toLocaleString("en-ET", { maximumFractionDigits: 0 })}</td></tr>)}{!activeLeads.length&&<tr><td colSpan={5} className="px-3 py-12 text-center text-slate-500">No active leads in this workspace.</td></tr>}</tbody>
              </table>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-black uppercase tracking-wider text-[#0F3E8A]">Sales execution</div>
            <h2 className="mt-1 text-xl font-black">Rep task list</h2>
            <p className="mt-1 text-sm text-slate-500">{overdueTasks} overdue task{overdueTasks === 1 ? "" : "s"}.</p>
            <div className="mt-5 space-y-2">{tasks.map((task) => <div key={task.id} className="rounded-xl border border-slate-100 p-4"><div className="font-black">{task.title}</div><div className="mt-1 text-xs text-slate-500">{task.lead.name} · {task.assignedTo || "Unassigned"} · {task.priority}</div>{task.dueAt && <div className={"mt-2 text-xs font-bold " + (task.dueAt.getTime() < Date.now() ? "text-red-600" : "text-slate-400")}>{task.dueAt.toLocaleString("en-ET")}</div>}</div>)}{!tasks.length&&<div className="py-10 text-center text-sm text-slate-500">No open sales tasks.</div>}</div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-end justify-between gap-3"><div><div className="text-xs font-black uppercase tracking-wider text-[#0F3E8A]">Commerce</div><h2 className="mt-1 text-xl font-black">Recent orders</h2></div><span className="text-xs font-bold text-slate-400">Commission ledger: ETB {Number(commissions._sum.amount || 0).toLocaleString("en-ET", { maximumFractionDigits: 0 })}</span></div>
          <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead><tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400"><th className="px-3 py-3">Order</th><th className="px-3 py-3">Customer</th><th className="px-3 py-3">Order status</th><th className="px-3 py-3">Payment</th><th className="px-3 py-3">Total</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id} className="border-b border-slate-50"><td className="px-3 py-4 font-black">{order.orderNumber}</td><td className="px-3 py-4">{order.customer?.name || "—"}</td><td className="px-3 py-4">{order.status}</td><td className="px-3 py-4">{order.paymentState}</td><td className="px-3 py-4 font-bold">{order.currency} {Number(order.total).toLocaleString("en-ET", { maximumFractionDigits: 0 })}</td></tr>)}{!orders.length&&<tr><td colSpan={5} className="px-3 py-12 text-center text-slate-500">No orders in this workspace.</td></tr>}</tbody></table></div>
        </section>
      </div>
    </main>
  );
}
