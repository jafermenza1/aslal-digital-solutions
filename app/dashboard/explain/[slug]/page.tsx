import Link from "next/link";
import { requirePermission } from "@/lib/authorization";

export const dynamic = "force-dynamic";

const GUIDES: Record<string, {
  title: string;
  eyebrow: string;
  meaning: string;
  source: string;
  interpretation: string;
  workspace: string;
  href: string;
}> = {
  leads: {
    title: "Leads",
    eyebrow: "COMMERCIAL DEMAND",
    meaning: "The total number of lead records currently stored in the Growth OS.",
    source: "Lead records in the CRM database. A lead is a captured person or business opportunity that can be worked through the sales process.",
    interpretation: "This number tells you the size of the demand record currently in the system. It does not mean every lead is qualified or ready to buy.",
    workspace: "Leads",
    href: "/dashboard/leads",
  },
  customers: {
    title: "Customers",
    eyebrow: "RELATIONSHIPS",
    meaning: "The total number of customer records currently stored in the Growth OS.",
    source: "Customer records in the CRM database.",
    interpretation: "Use this as a count of recorded customer relationships. It is not the same as total historical revenue or the number of people who have ever contacted the business.",
    workspace: "Customers",
    href: "/dashboard/customers",
  },
  "open-pipeline": {
    title: "Open pipeline",
    eyebrow: "SALES VALUE",
    meaning: "The summed expected value of opportunities that are not yet WON or LOST.",
    source: "Opportunity records whose stage is still active. The dashboard sums expectedValue and displays the result in ETB.",
    interpretation: "This is potential commercial value still being worked. It is not cash received and should not be treated as guaranteed revenue.",
    workspace: "Insights",
    href: "/dashboard/insights",
  },
  "won-revenue": {
    title: "Won revenue",
    eyebrow: "REALIZED DEAL VALUE",
    meaning: "The summed expected value recorded on opportunities whose stage is WON.",
    source: "Won opportunity records and their expectedValue field, displayed in ETB.",
    interpretation: "This is the dashboard's recorded value of won opportunities. It is not a bank or payment-provider reconciliation unless those systems are explicitly connected.",
    workspace: "Insights",
    href: "/dashboard/insights",
  },
  overdue: {
    title: "Overdue",
    eyebrow: "FOLLOW-UP CONTROL",
    meaning: "Active leads with a next-action due date that is earlier than the current database time.",
    source: "Lead records that are not WON or LOST and have nextActionDueAt before NOW().",
    interpretation: "A higher number means more active demand has passed its planned follow-up time. Open the operations or leads workspace to act on those records.",
    workspace: "Operations",
    href: "/dashboard/operations?tab=follow-up",
  },
  "growth-signals": {
    title: "Growth signals",
    eyebrow: "OPPORTUNITY DISCOVERY",
    meaning: "The number of open Growth Opportunity records currently identified by the system.",
    source: "growthOpportunity records with status OPEN.",
    interpretation: "These are opportunities for action, not guaranteed sales. Review the underlying signal and evidence before turning it into commercial work.",
    workspace: "Insights",
    href: "/dashboard/insights",
  },
  "missing-execution": {
    title: "Missing execution",
    eyebrow: "SALES DISCIPLINE",
    meaning: "Active leads that are missing an owner, a next action, or a next-action due date.",
    source: "Lead records that are not WON or LOST where ownerEmail, nextAction, or nextActionDueAt is missing.",
    interpretation: "This identifies active demand that does not yet have a complete execution plan. It is a data-quality and follow-up control, not a measure of lead quality.",
    workspace: "Leads",
    href: "/dashboard/leads?sort=newest",
  },
  "latest-demand": {
    title: "Latest demand",
    eyebrow: "RECENT ACTIVITY",
    meaning: "The six most recently updated lead records shown on the dashboard.",
    source: "Lead records ordered by updatedAt descending, limited to six records.",
    interpretation: "This is a quick view of recent CRM activity. It is not a ranking of lead quality or a complete list of all recent demand.",
    workspace: "Leads",
    href: "/dashboard/leads",
  },
};

export default async function DashboardGuidePage({ params }: { params: Promise<{ slug: string }> }) {
  await requirePermission("dashboard.view");
  const { slug } = await params;
  const guide = GUIDES[slug];

  if (!guide) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
        <div className="portal-card p-8">
          <span className="text-[10px] font-black uppercase tracking-[.2em] text-[#E2B02A]">DASHBOARD GUIDE</span>
          <h1 className="mt-3 text-3xl font-black">Explanation not found</h1>
          <p className="mt-3 text-sm leading-6 text-white/55">The requested dashboard metric does not have a registered explanation slug.</p>
          <Link href="/dashboard" className="mt-6 inline-flex rounded-xl bg-[#E2B02A] px-4 py-3 text-sm font-black text-[#1E293B]">Return to dashboard</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[.2em] text-[#E2B02A]">{guide.eyebrow}</span>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">{guide.title}</h1>
        </div>
        <Link href={guide.href} className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-bold text-white">Open {guide.workspace} →</Link>
      </div>

      <section className="portal-card p-6 sm:p-8">
        <h2 className="text-xl font-black">What this number means</h2>
        <p className="mt-3 text-base leading-7 text-white/70">{guide.meaning}</p>

        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[.035] p-5">
            <h3 className="text-sm font-black">Where the data comes from</h3>
            <p className="mt-2 text-sm leading-6 text-white/55">{guide.source}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[.035] p-5">
            <h3 className="text-sm font-black">How to interpret it</h3>
            <p className="mt-2 text-sm leading-6 text-white/55">{guide.interpretation}</p>
          </div>
        </div>

        <div className="mt-7 rounded-2xl border border-[#E2B02A]/20 bg-[#E2B02A]/[.06] p-5">
          <h3 className="text-sm font-black text-[#E2B02A]">Use the source workspace</h3>
          <p className="mt-2 text-sm leading-6 text-white/60">Open the linked workspace to inspect the underlying records instead of relying on the headline number alone.</p>
          <Link href={guide.href} className="mt-4 inline-flex rounded-xl bg-[#E2B02A] px-4 py-3 text-sm font-black text-[#1E293B]">Inspect {guide.workspace} →</Link>
        </div>
      </section>
    </main>
  );
}
