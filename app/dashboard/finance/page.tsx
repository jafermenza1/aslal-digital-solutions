import { requirePermission } from "@/lib/authorization";
import CommissionOperations from "@/components/CommissionOperations";
import PartnerPayoutBatch from "@/components/PartnerPayoutBatch";
import PaymentReconciliationWorkbench from "@/components/PaymentReconciliationWorkbench";

export default async function FinancePage() {
  await requirePermission("commissions.manage");
  return (
    <main className="min-h-screen bg-[var(--ui-canvas)] py-10">
      <div className="container-aslal space-y-8">
        <header>
          <div className="text-xs font-black uppercase tracking-[.2em] text-[#D97706]">Growth OS / Finance</div>
          <h1 className="mt-2 text-4xl font-black tracking-tight">Payment, commission and payout controls</h1>
          <p className="mt-2 max-w-3xl text-slate-500">Confirm and reconcile payments, advance commissions only after recognized revenue, and prepare workspace-scoped partner payout batches.</p>
        </header>
        <PaymentReconciliationWorkbench />
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">Commission approval</h2>
          <p className="mt-1 text-sm text-slate-500">Commission state changes remain tied to confirmed payment, reconciliation and recognized revenue.</p>
          <div className="mt-6"><CommissionOperations /></div>
        </section>
        <PartnerPayoutBatch />
      </div>
    </main>
  );
}
