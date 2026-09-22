import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/security";

export const dynamic = "force-dynamic";

const ACTIVE_STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "DEMO", "PROPOSAL", "NEGOTIATION"] as const;

export default async function Phase2Acceptance() {
  const session = verifySession((await cookies()).get("aslal_session")?.value);
  if (!session) redirect("/login");

  const [active, missingOwner, missingAction, missingDue, overdue, stageHistory, leads, phoneForms] =
    await Promise.all([
      prisma.lead.count({ where: { status: { in: [...ACTIVE_STATUSES] } } }),
      prisma.lead.count({ where: { status: { in: [...ACTIVE_STATUSES] }, ownerEmail: null } }),
      prisma.lead.count({ where: { status: { in: [...ACTIVE_STATUSES] }, nextAction: null } }),
      prisma.lead.count({ where: { status: { in: [...ACTIVE_STATUSES] }, nextActionDueAt: null } }),
      prisma.lead.count({
        where: { status: { in: [...ACTIVE_STATUSES] }, nextActionDueAt: { lt: new Date() } },
      }),
      prisma.leadStageHistory.count(),
      prisma.lead.count(),
      prisma.lead.count({ where: { phone: { startsWith: "+251" } } }),
    ]);

  const configuredOwner = process.env.ASLAL_DEFAULT_LEAD_OWNER_EMAIL || "";
  const executionGaps = missingOwner + missingAction + missingDue;
  const checks = [
    ["Active leads have an owner", missingOwner === 0, String(missingOwner) + " active lead(s) lack owner"],
    ["Active leads have a next action", missingAction === 0, String(missingAction) + " active lead(s) lack next action"],
    ["Active leads have a due date", missingDue === 0, String(missingDue) + " active lead(s) lack due date"],
    ["Stage history exists", stageHistory > 0 || leads === 0, String(stageHistory) + " stage-history record(s)"],
    ["Configured sales owner exists", Boolean(configuredOwner), configuredOwner || "ASLAL_DEFAULT_LEAD_OWNER_EMAIL is not configured"],
    ["Canonical phone capture is represented", leads === 0 || phoneForms > 0, String(phoneForms) + " lead(s) currently use +251 canonical phone form"],
  ];

  return (
    <main className="min-h-screen bg-[#F8FAFC] py-8">
      <div className="container-aslal">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="text-xs font-black uppercase tracking-[.2em] text-[#0F3E8A]">Reconciliation / Phase 2</div>
            <h1 className="mt-2 text-4xl font-black">Sales execution acceptance</h1>
            <p className="mt-2 max-w-4xl text-slate-500">
              Evidence for lead capture, ownership, next action, due date, stage history and Ethiopian phone normalization.
              This page reports repository/database evidence; it does not claim migration or production deployment success.
            </p>
          </div>
          <Link href="/dashboard" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold">← Dashboard</Link>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Active leads", active],
            ["Execution gaps", executionGaps],
            ["Overdue actions", overdue],
            ["Stage history", stageHistory],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-xs font-black uppercase tracking-wider text-slate-400">{label}</div>
              <div className="mt-2 text-3xl font-black text-[#0F3E8A]">{value}</div>
            </div>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-black">Automated evidence</h2>
            <div className="mt-5 space-y-3">
              {checks.map(([label, pass, detail]) => (
                <div key={String(label)} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4">
                  <div>
                    <div className="font-bold">{label}</div>
                    <div className="mt-1 text-xs text-slate-500">{detail}</div>
                  </div>
                  <span className={"rounded-full px-3 py-1 text-xs font-black " + (pass ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                    {pass ? "PASS" : "GAP"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-black">Required controlled checks</h2>
            <ol className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
              <li>1. Apply the checked-in additive Prisma migration in the target environment.</li>
              <li>2. Submit a new website lead and verify owner, next action and 30-minute triage deadline.</li>
              <li>3. Attempt to save an active lead with each execution field missing; each save must be rejected.</li>
              <li>4. Verify valid 09 and 07 Ethiopian numbers normalize to +2519... / +2517....</li>
              <li>5. Verify invalid Ethiopian mobile input is rejected with a specific validation error.</li>
              <li>6. Change a stage and verify LeadStageHistory records actor, transition and timestamp.</li>
              <li>7. Resolve legacy execution gaps with real business ownership/actions; never fabricate history.</li>
              <li>8. Verify production health after migration and redeployment.</li>
            </ol>
          </div>
        </section>
      </div>
    </main>
  );
}
