import { requirePermission } from "@/lib/authorization";
import { getWorkspaceForUser } from "@/lib/workspaces";
import { prisma } from "@/lib/prisma";
import PartnerOpportunityCenter from "@/components/PartnerOpportunityCenter";

export const dynamic = "force-dynamic";

export default async function PartnerPortalPage() {
  const user = await requirePermission("partner.portal.view");
  const workspace = await getWorkspaceForUser(user);
  if (!workspace) return <main className="min-h-screen p-6"><div className="portal-card mx-auto max-w-3xl p-8"><h1 className="text-2xl font-black">Workspace access unavailable</h1><p className="mt-2 text-sm text-white/60">Your partner workspace is not available.</p></div></main>;
  const userRecord = await prisma.user.findUnique({ where: { id: user.id }, select: { partnerId: true } });
  const partner = userRecord?.partnerId ? await prisma.partner.findUnique({
    where: { id: userRecord.partnerId, workspaceId: workspace.id },
    include: {
      referralLinks: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { _count: { select: { clicks: true } } },
      },
    },
  }) : null;

  if (!partner) {
    return <main className="min-h-screen p-6"><div className="portal-card mx-auto max-w-3xl p-8"><h1 className="text-2xl font-black">Partner profile unavailable</h1><p className="mt-2 text-sm text-white/60">Your partner account is not linked to a partner record. Contact Aslal administration.</p></div></main>;
  }

  const codes = partner.referralLinks.map((link) => link.code);
  const [leadCount, wonCount, revenue] = await Promise.all([
    codes.length ? prisma.lead.count({ where: { workspaceId: workspace.id, referralCode: { in: codes } } }) : 0,
    codes.length ? prisma.lead.count({ where: { workspaceId: workspace.id, referralCode: { in: codes }, status: "WON" } }) : 0,
    codes.length ? prisma.lead.aggregate({ where: { workspaceId: workspace.id, referralCode: { in: codes }, status: "WON" }, _sum: { dealValue: true } }) : { _sum: { dealValue: null } },
  ]);

  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://aslaldigital.com").replace(/\/$/, "");

  return <main className="min-h-screen bg-[#F8FAFC] py-10">
    <div className="container-aslal">
      <header className="rounded-[2rem] bg-[#0F3E8A] p-7 text-white shadow-sm sm:p-9">
        <div className="text-[10px] font-black uppercase tracking-[.2em] text-[#E2B02A]">Aslal Partner Portal · {workspace.name}</div>
        <h1 className="mt-2 text-3xl font-black sm:text-4xl">{partner.name}</h1>
        <p className="mt-2 text-sm text-white/65">Your referral identity, activity and attributable commercial outcomes.</p>
      </header>
      <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[["Referral clicks", partner.referralLinks.reduce((sum, item) => sum + item._count.clicks, 0)], ["Referred leads", leadCount], ["Won deals", wonCount], ["Attributed revenue", `ETB ${Number(revenue._sum.dealValue || 0).toLocaleString("en-ET")}`]].map(([label,value]) => <div key={String(label)} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm"><div className="text-xs font-black uppercase tracking-wider text-slate-400">{label}</div><div className="mt-2 text-2xl font-black text-[#0F3E8A]">{value}</div></div>)}
      </section>
      <section className="mt-5 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-slate-900">Referral links</h2>
        <p className="mt-1 text-sm text-slate-500">Use the approved link or the printed partner card to distribute your referral identity.</p>
        <div className="mt-5 space-y-3">{partner.referralLinks.map((link) => <div key={link.id} className="rounded-2xl border border-slate-100 p-4"><div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><div className="font-mono text-sm font-black text-[#0F3E8A]">{link.code}</div><div className="mt-1 break-all text-xs text-slate-400">{baseUrl}/go/{link.code}</div></div><div className="text-xs font-bold text-slate-500">{link._count.clicks} clicks</div></div></div>)}</div>
      </section>
      <PartnerOpportunityCenter />
      <p className="mt-5 text-xs leading-5 text-slate-400">This portal exposes only partner-attributed performance. Confidential customer information is not shown here.</p>
    </div>
  </main>;
}
