import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Permission } from "@/lib/permissions";
import { authorizeWorkspacePermission } from "@/lib/workspaces";

export const dynamic = "force-dynamic";

type QueueItem = {
  kind: string;
  title: string;
  detail: string;
  count: number;
  href: string;
  action: string;
};

type WorkCard = {
  title: string;
  description: string;
  href: string;
  permission: Permission;
  metric?: string;
};

export default async function AdminCenterPage() {
  const access = await authorizeWorkspacePermission("dashboard.view");
  if (!access) return <div className="p-8">No active workspace is available.</div>;

  const user = access.user;
  const can = (permission: Permission) => user.permissions.includes(permission);
  const wid = access.workspace.id;

  const [
    listingPending,
    professionalPending,
    partnerPending,
    payoutPending,
    failedPayments,
    activeUsers,
    activeWorkspaces,
    activeOrders,
    openTasks,
  ] = await Promise.all([
    can("listings.manage")
      ? prisma.commercialListing.count({ where: { workspaceId: wid, status: "PENDING_REVIEW" } })
      : Promise.resolve(0),
    can("listings.manage")
      ? prisma.professionalProfile.count({ where: { workspaceId: wid, status: "PENDING_REVIEW" } })
      : Promise.resolve(0),
    can("partners.manage")
      ? prisma.partner.count({ where: { workspaceId: wid, verificationStatus: "REGISTERED" } })
      : Promise.resolve(0),
    can("commissions.manage")
      ? prisma.partnerPayout.count({ where: { workspaceId: wid, status: "PENDING" } })
      : Promise.resolve(0),
    can("commerce.view")
      ? prisma.payment.count({ where: { workspaceId: wid, status: "FAILED" } })
      : Promise.resolve(0),
    can("users.manage")
      ? prisma.user.count({ where: { active: true, workspaceUsers: { some: { workspaceId: wid, status: "ACTIVE" } } } })
      : Promise.resolve(0),
    can("users.manage")
      ? prisma.workspace.count({ where: { id: wid, active: true } })
      : Promise.resolve(0),
    can("commerce.view")
      ? prisma.order.count({ where: { workspaceId: wid, status: { in: ["CONFIRMED", "FULFILLING"] } } })
      : Promise.resolve(0),
    can("operations.view")
      ? prisma.leadTask.count({ where: { lead: { workspaceId: wid }, status: { in: ["OPEN", "IN_PROGRESS"] } } })
      : Promise.resolve(0),

  ]);

  const auditLeadIds = can("operations.view")
    ? (await prisma.lead.findMany({ where: { workspaceId: wid }, select: { id: true }, take: 5000 })).map((row) => row.id)
    : [];
  const auditLeads = auditLeadIds.length ? await prisma.leadAdminAudit.count({ where: { leadId: { in: auditLeadIds } } }) : 0;

  const queues: QueueItem[] = [
    {
      kind: "Marketplace",
      title: "Product & service listings",
      detail: "Submitted by permitted business owners and professionals.",
      count: listingPending,
      href: "/dashboard/approvals",
      action: "Review listings",
    },
    {
      kind: "People",
      title: "Professional profiles",
      detail: "Profiles waiting for Aslal review before publication.",
      count: professionalPending,
      href: "/dashboard/approvals",
      action: "Review profiles",
    },
    {
      kind: "Partners",
      title: "Partner verification",
      detail: "Registrations requiring verification or activation.",
      count: partnerPending,
      href: "/dashboard/partners",
      action: "Review partners",
    },
    {
      kind: "Finance",
      title: "Payout queue",
      detail: "Payouts that still need finance handling.",
      count: payoutPending,
      href: "/dashboard/finance",
      action: "Open finance",
    },
    {
      kind: "Payments",
      title: "Failed payments",
      detail: "Payment failures that may interrupt a customer journey.",
      count: failedPayments,
      href: "/dashboard/orders",
      action: "Investigate",
    },
  ];

  const totalAttention = queues.reduce((sum, item) => sum + item.count, 0);

  const workCards: WorkCard[] = [
    {
      title: "People & Access",
      description: "Users, roles, workspace membership and business boundaries.",
      href: "/dashboard/users",
      permission: "users.manage",
      metric: `${activeUsers} active users`,
    },
    {
      title: "Business Workspaces",
      description: "Business contexts, membership and workspace administration.",
      href: "/dashboard/workspaces",
      permission: "users.manage",
      metric: `${activeWorkspaces} active workspace${activeWorkspaces === 1 ? "" : "s"}`,
    },
    {
      title: "Orders & Sales",
      description: "Confirmed orders, payment state and the commercial journey.",
      href: "/dashboard/orders",
      permission: "commerce.view",
      metric: `${activeOrders} active order${activeOrders === 1 ? "" : "s"}`,
    },
    {
      title: "Finance & Payouts",
      description: "Payment reconciliation, commissions and partner settlements.",
      href: "/dashboard/finance",
      permission: "commissions.manage",
      metric: payoutPending ? `${payoutPending} payout${payoutPending === 1 ? "" : "s"} pending` : "No payouts pending",
    },
    {
      title: "Operations",
      description: "Production integrity, follow-up work, automation and audit evidence.",
      href: "/dashboard/operations",
      permission: "operations.view",
      metric: `${openTasks} open task${openTasks === 1 ? "" : "s"}`,
    },
    {
      title: "Reports",
      description: "Workspace-scoped operational, commercial, financial and audit reporting.",
      href: "/dashboard/reports",
      permission: "dashboard.view",
    },
  ];

  return (
    <main className="min-h-screen bg-[var(--ui-canvas)] py-8">
      <div className="mx-auto max-w-[1500px] space-y-6 px-4 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900 sm:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="min-w-0">
              <div className="text-[10px] font-black uppercase tracking-[.18em] text-[#0F3E8A]">
                Aslal Admin Center
              </div>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                Run the business from one place
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-300">
                Review exceptions first, then open the specialist workspace only when deeper operational control is required.
                All work remains inside the active workspace boundary.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {access.workspace.name}
                </span>
                <Link
                  href="/dashboard/workbench"
                  className="rounded-full bg-[#0F3E8A] px-3 py-1.5 text-xs font-black text-white"
                >
                  My Workbench →
                </Link>
              </div>
            </div>
            <div className="rounded-2xl bg-slate-50 px-5 py-4 dark:bg-slate-800">
              <div className="text-xs font-bold text-slate-500">Needs attention</div>
              <div className="mt-1 text-3xl font-black text-slate-950 dark:text-white">{totalAttention}</div>
              <div className="mt-1 text-xs text-slate-500">approval, partner, payment or payout items</div>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[.15em] text-slate-400">Priority queue</div>
              <h2 className="mt-1 text-xl font-black text-slate-950 dark:text-white">What needs attention?</h2>
            </div>
            <Link href="/dashboard/approvals" className="text-xs font-black text-[#0F3E8A]">
              Open approvals →
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {queues.map((queue) => (
              <article
                key={queue.title}
                className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900"
              >
                <div className="text-[10px] font-black uppercase tracking-[.15em] text-slate-400">{queue.kind}</div>
                <div className="mt-3 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-black text-slate-950 dark:text-white">{queue.title}</h3>
                    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-300">{queue.detail}</p>
                  </div>
                  <span
                    className={
                      queue.count
                        ? "min-w-10 rounded-full bg-[#E2B02A]/15 px-3 py-1 text-center text-sm font-black text-[#070C18]"
                        : "min-w-10 rounded-full bg-slate-100 px-3 py-1 text-center text-sm font-black text-slate-500 dark:bg-slate-800"
                    }
                  >
                    {queue.count}
                  </span>
                </div>
                <Link
                  href={queue.href}
                  className="mt-5 inline-flex rounded-xl bg-[#0F3E8A] px-4 py-2.5 text-xs font-black text-white hover:opacity-90"
                >
                  {queue.action} →
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3">
            <div className="text-[10px] font-black uppercase tracking-[.15em] text-slate-400">Control surfaces</div>
            <h2 className="mt-1 text-xl font-black text-slate-950 dark:text-white">Manage by business outcome</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {workCards.filter((card) => can(card.permission)).map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#0F3E8A]/30 dark:border-white/10 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-black text-slate-950 dark:text-white">{card.title}</h3>
                  {card.metric && (
                    <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                      {card.metric}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-300">{card.description}</p>
                <span className="mt-4 inline-block text-xs font-black text-[#0F3E8A] group-hover:underline">Open workspace →</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <Link href="/dashboard/listings" className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
            <div className="text-[10px] font-black uppercase tracking-[.15em] text-slate-400">Commerce governance</div>
            <h3 className="mt-2 font-black text-slate-950 dark:text-white">Marketplace & listings</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Review, publish and operate commercial listings without exposing backend complexity.</p>
            <span className="mt-4 inline-block text-xs font-black text-[#0F3E8A]">Open marketplace →</span>
          </Link>
          <Link href="/dashboard/partners" className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
            <div className="text-[10px] font-black uppercase tracking-[.15em] text-slate-400">Partner governance</div>
            <h3 className="mt-2 font-black text-slate-950 dark:text-white">Partners & programs</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Verify people, manage partner relationships and continue into attribution or program workflows.</p>
            <span className="mt-4 inline-block text-xs font-black text-[#0F3E8A]">Open partners →</span>
          </Link>
          <Link href="/dashboard/operations?tab=audit" className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
            <div className="text-[10px] font-black uppercase tracking-[.15em] text-slate-400">Control evidence</div>
            <h3 className="mt-2 font-black text-slate-950 dark:text-white">Audit & operational integrity</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{auditLeads} lead audit records currently exist in this workspace; specialist controls remain available.</p>
            <span className="mt-4 inline-block text-xs font-black text-[#0F3E8A]">Open audit →</span>
          </Link>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-900/60">
          <div className="text-xs font-black uppercase tracking-[.15em] text-slate-400">Operating rule</div>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            This center does not create a second approval, payment, partner or workspace engine. It routes administrators into the existing
            authoritative workflows, where server-side permissions and workspace checks remain responsible for the actual change.
          </p>
        </section>
      </div>
    </main>
  );
}
