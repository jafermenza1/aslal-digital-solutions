import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import CommissionOperations from "@/components/CommissionOperations";
import PartnerPayoutBatch from "@/components/PartnerPayoutBatch";
import PaymentReconciliationWorkbench from "@/components/PaymentReconciliationWorkbench";

export const dynamic = "force-dynamic";

export default async function FinancePage({ searchParams }: { searchParams: Promise<{ workspaceId?: string }> }) {
  const { workspaceId } = await searchParams;
  const access = await authorizeWorkspacePermission("commissions.manage", workspaceId);
  if (!access) redirect("/dashboard");
  const wid = access.workspace.id;

  const [pendingPayments, exceptions, failedPayments, pendingCommissions, payableCommissions, recognizedRevenue] = await Promise.all([
    prisma.payment.count({ where: { workspaceId: wid, status: "PENDING" } }),
    prisma.payment.count({ where: { workspaceId: wid, reconciliationStatus: "EXCEPTION" } }),
    prisma.payment.count({ where: { workspaceId: wid, status: { in: ["FAILED", "REVERSED"] } } }),
    prisma.commission.count({ where: { workspaceId: wid, status: { in: ["PENDING", "QUALIFIED", "APPROVED"] } } }),
    prisma.commission.count({ where: { workspaceId: wid, status: "PAYABLE" } }),
    prisma.revenue.aggregate({ where: { workspaceId: wid, status: "RECOGNIZED" }, _sum: { recognizedAmount: true } }),
  ]);

  return (
    <main className="min-h-screen bg-[var(--ui-canvas)] py-10">
      <div className="container-aslal space-y-7">
        <header className="rounded-[2rem] bg-[var(--ui-surface-1)] p-7 text-white shadow-sm sm:p-8">
          <div className="text-xs font-black uppercase tracking-[.2em] text-[#E2B02A]">Growth OS / Finance & Operations</div>
          <div className="mt-2 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Control the money journey</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/60">
                Work from one queue: verify collection, reconcile revenue, approve commissions, prepare partner payouts and surface exceptions. Existing specialist controls remain underneath this operating surface.
              </p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/[.05] px-4 py-2 text-xs font-bold text-white/60">Workspace · {access.workspace.name}</span>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["Payment review", pendingPayments, "PENDING collections"],
            ["Exceptions", exceptions, "payment exceptions"],
            ["Failed / reversed", failedPayments, "payments needing attention"],
            ["Commission queue", pendingCommissions, "not yet PAYABLE"],
            ["Ready for payout", payableCommissions, "PAYABLE commissions"],
          ].map(([label, value, hint]) => (
            <div key={String(label)} className="rounded-2xl border border-slate-200 bg-[var(--ui-surface-1)] p-5 shadow-sm">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</div>
              <div className="mt-2 text-2xl font-black text-slate-950">{value}</div>
              <div className="mt-1 text-xs text-slate-500">{hint}</div>
            </div>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
          <div className="rounded-2xl border border-slate-200 bg-[var(--ui-surface-1)] p-5">
            <div className="text-xs font-black uppercase tracking-wider text-[#0F3E8A]">Financial state</div>
            <h2 className="mt-1 text-xl font-black">Recognized revenue</h2>
            <div className="mt-2 text-3xl font-black">ETB {Number(recognizedRevenue._sum.recognizedAmount || 0).toLocaleString("en-ET", { minimumFractionDigits: 2 })}</div>
            <p className="mt-1 text-sm text-slate-500">Revenue is recognized only after the canonical payment reconciliation path succeeds.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-[var(--ui-surface-1)] p-5">
            <div className="text-xs font-black uppercase tracking-wider text-[#0F3E8A]">Exception routing</div>
            <h2 className="mt-1 text-xl font-black">Need another operating surface?</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/dashboard/orders" className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black">Orders & payments</Link>
              <Link href="/dashboard/operations" className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black">Operations & issues</Link>
              <Link href="/dashboard/reports" className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black">Reports</Link>
              <Link href="/dashboard/partners" className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black">Partner records</Link>
            </div>
          </div>
        </section>

        <PaymentReconciliationWorkbench />

        <section className="rounded-[2rem] border border-slate-200 bg-[var(--ui-surface-1)] p-6 shadow-sm">
          <div className="text-xs font-black uppercase tracking-wider text-[#0F3E8A]">Next controlled step</div>
          <h2 className="mt-1 text-xl font-black">Commission approval</h2>
          <p className="mt-1 text-sm text-slate-500">Only advance an earning when its canonical commercial evidence supports it. The existing commission engine remains authoritative.</p>
          <div className="mt-6"><CommissionOperations /></div>
        </section>

        <PartnerPayoutBatch />
      </div>
    </main>
  );
}
