import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { LeadStatus, prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { requirePermission } from "@/lib/authorization";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import { verifySession } from "@/lib/security";
import { handleLeadStatusChange } from "@/lib/automation";
import { OfflineLeadForm } from "@/components/OfflineLeadForm";

const stages = Object.values(LeadStatus);
const pageSize = 24;

type SortKey = "priority" | "newest" | "deal";

async function changeStatus(formData: FormData) {
  "use server";
  const session = await requirePermission("leads.view");
  const leadId = String(formData.get("leadId") || "");
  const status = String(formData.get("status") || "") as LeadStatus;
  if (!leadId || !stages.includes(status)) return;
  const lead = await prisma.lead.findUnique({ where: { id: leadId }, select: { status: true, ownerEmail: true, nextAction: true, nextActionDueAt: true } });
  if (!lead || lead.status === status) return;
  const activeTarget = status !== LeadStatus.WON && status !== LeadStatus.LOST;
  if (activeTarget && (!lead.ownerEmail || !lead.nextAction || !lead.nextActionDueAt)) {
    redirect(`/dashboard/leads/${leadId}?error=Active%20leads%20require%20an%20owner%2C%20next%20action%2C%20and%20due%20date%20before%20stage%20changes.`);
  }
  await prisma.$transaction([
    prisma.lead.update({ where: { id: leadId }, data: { status, ...(status === LeadStatus.WON ? { wonAt: new Date() } : {}) } }),
    prisma.leadStageHistory.create({ data: { leadId, fromStage: lead.status, toStage: status, changedBy: session.email } }),
  ]);
  try {
    await handleLeadStatusChange({ leadId, fromStatus: lead.status, toStatus: status, actor: session.email });
  } catch (error) {
    console.error("LEAD_STATUS_AUTOMATION_ERROR", error);
  }
  revalidatePath("/dashboard/leads");
  revalidatePath(`/dashboard/leads/${leadId}`);
  revalidatePath("/dashboard");
}

function buildQuery(search: string, status?: LeadStatus, source?: string, referral?: string, product?: string, minScore?: number, workspaceId?: string): Prisma.LeadWhereInput {
  const where: Prisma.LeadWhereInput = workspaceId ? { workspaceId } : {};
  if (status) where.status = status;
  if (source) where.source = { equals: source };
  if (referral) where.referralCode = { contains: referral };
  if (minScore !== undefined) where.score = { gte: minScore };
  if (product) where.productInterests = { some: { product: { slug: product } } };
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
      { phone: { contains: search } },
      { company: { contains: search } },
      { businessType: { contains: search } },
    ];
  }
  return where;
}

export default async function LeadsDashboard({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = verifySession((await cookies()).get("aslal_session")?.value);
  if (!session) redirect("/login");
  const params = await searchParams;
  const value = (key: string) => typeof params[key] === "string" ? params[key] as string : "";
  const requestedStatus = value("status");
  const access = await authorizeWorkspacePermission("leads.view", value("workspaceId"));
  if (!access) redirect("/dashboard");
  const workspaceId = access.workspace.id;
  const requestedTab = value("tab");
  const tab = ["inbox","add","filters"].includes(requestedTab) ? requestedTab : "inbox";
  const status = requestedStatus && stages.includes(requestedStatus as LeadStatus) ? requestedStatus as LeadStatus : undefined;
  const search = value("q").trim().slice(0, 100);
  const source = value("source").trim().slice(0, 100);
  const referral = value("referral").trim().slice(0, 100);
  const product = value("product").trim().slice(0, 160);
  const minScoreRaw = Number(value("minScore"));
  const minScore = Number.isFinite(minScoreRaw) && minScoreRaw > 0 ? Math.min(100, Math.floor(minScoreRaw)) : undefined;
  const requestedSort = value("sort") as SortKey;
  const sort: SortKey = ["priority", "newest", "deal"].includes(requestedSort) ? requestedSort : "priority";
  const page = Math.max(1, Number(value("page")) || 1);
  const where = buildQuery(search, status, source, referral, product, minScore, workspaceId);
  const orderBy = sort === "newest" ? [{ createdAt: "desc" as const }] : sort === "deal" ? [{ dealValue: "desc" as const }, { score: "desc" as const }] : [{ score: "desc" as const }, { updatedAt: "desc" as const }];

  const [leads, total, stageCounts, stageValues, sources, products, executionGaps] = await Promise.all([
    prisma.lead.findMany({ where, orderBy, skip: (page - 1) * pageSize, take: pageSize, include: { productInterests: { include: { product: { select: { id: true, name: true } } }, orderBy: { interestScore: "desc" }, take: 3 } } }),
    prisma.lead.count({ where }),
    prisma.lead.groupBy({ by: ["status"], where: { workspaceId }, _count: { _all: true } }),
    prisma.lead.groupBy({ by: ["status"], where: { workspaceId }, _sum: { dealValue: true } }),
    prisma.lead.findMany({ distinct: ["source"], where: { workspaceId, source: { not: null } }, select: { source: true }, orderBy: { source: "asc" } }),
    prisma.product.findMany({ where: { active: true, workspaceId }, select: { id:true, slug: true, name: true }, orderBy: { name: "asc" } }),
    prisma.lead.count({
      where: {
        workspaceId,
        status: { notIn: [LeadStatus.WON, LeadStatus.LOST] },
        OR: [{ ownerEmail: null }, { nextAction: null }, { nextActionDueAt: null }],
      },
    }),
  ]);
  const now = new Date();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const countFor = (stage: LeadStatus) => stageCounts.find(item => item.status === stage)?._count._all ?? 0;
  const valueFor = (stage: LeadStatus) => Number(stageValues.find(item => item.status === stage)?._sum.dealValue ?? 0);
  const query = new URLSearchParams();
  if (search) query.set("q", search);
  if (source) query.set("source", source);
  if (referral) query.set("referral", referral);
  if (product) query.set("product", product);
  if (minScore) query.set("minScore", String(minScore));
  query.set("workspaceId", workspaceId);
  if (sort !== "priority") query.set("sort", sort);
  const pageHref = (nextPage: number) => { const next = new URLSearchParams(query); if (status) next.set("status", status); if (nextPage > 1) next.set("page", String(nextPage)); return `/dashboard/leads?${next.toString()}`; };

  return <main className="min-h-screen bg-[var(--ui-canvas)] py-10"><div className="container-aslal">
    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><div className="text-xs font-black uppercase tracking-[.2em] text-[#D97706]">Growth OS / Sales</div><h1 className="mt-2 text-4xl font-black tracking-tight">Lead inbox</h1><p className="mt-2 text-slate-500">Search demand, prioritize opportunities, and keep every follow-up moving.</p></div><div className="flex flex-wrap gap-2"><Link href="/api/admin/leads/export" className="rounded-full bg-[#D97706] px-5 py-3 text-sm font-bold text-white">Export CSV</Link><Link href="/dashboard" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#D97706]">← Dashboard</Link></div></div>

    {tab === "inbox" && <div className="mt-7 grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">{stages.map(stage => <Link key={stage} href={`/dashboard/leads?${new URLSearchParams({ ...(status ? { status: stage } : {}), ...(search ? { q: search } : {}) }).toString()}`} className={`rounded-2xl border p-3 ${status === stage ? "border-[#D97706] bg-[#D97706] text-white" : "border-slate-200 bg-white"}`}><div className="text-[10px] font-black uppercase tracking-wider opacity-60">{stage}</div><div className="mt-1 text-xl font-black">{countFor(stage)}</div><div className="text-[10px] opacity-60">ETB {valueFor(stage).toLocaleString()}</div></Link>)}</div>}

    {tab === "add" && <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-5"><h2 className="text-xl font-black">Add lead</h2><p className="mt-1 text-sm text-slate-500">Capture offline or manually collected demand without mixing it into the daily queue.</p></div><OfflineLeadForm products={products} /></section>}
    {tab === "filters" && <form method="get" className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-5"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6"><input name="q" defaultValue={search} placeholder="Search name, company, email, phone..." className="xl:col-span-2 rounded-xl border border-slate-200 px-4 py-3"/><select name="status" defaultValue={status || ""} className="rounded-xl border border-slate-200 px-3 py-3"><option value="">All stages</option>{stages.map(stage => <option key={stage}>{stage}</option>)}</select><select name="source" defaultValue={source} className="rounded-xl border border-slate-200 px-3 py-3"><option value="">All sources</option>{sources.map(item => <option key={item.source!}>{item.source}</option>)}</select><select name="product" defaultValue={product} className="rounded-xl border border-slate-200 px-3 py-3"><option value="">All products</option>{products.map(item => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select><select name="sort" defaultValue={sort} className="rounded-xl border border-slate-200 px-3 py-3"><option value="priority">Priority</option><option value="newest">Newest</option><option value="deal">Deal value</option></select></div><div className="mt-3 flex flex-wrap gap-3"><input name="minScore" type="number" min="0" max="100" defaultValue={minScore ?? ""} placeholder="Min score" className="w-32 rounded-xl border border-slate-200 px-3 py-2"/><input name="referral" defaultValue={referral} placeholder="Referral code" className="w-40 rounded-xl border border-slate-200 px-3 py-2"/><button className="rounded-xl bg-[#D97706] px-5 py-2 font-bold text-white">Apply filters</button><Link href="/dashboard/leads" className="rounded-xl border border-slate-200 bg-white px-5 py-2 font-bold text-slate-600">Clear</Link></div></form>}

    <nav className="mt-7 flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm" aria-label="Lead workspace tabs"><Link href="/dashboard/leads?tab=inbox" className={"whitespace-nowrap rounded-xl px-4 py-3 text-sm font-black "+(tab==="inbox"?"bg-[#D97706] text-white":"text-slate-500")}>Lead inbox</Link><Link href="/dashboard/leads?tab=add" className={"whitespace-nowrap rounded-xl px-4 py-3 text-sm font-black "+(tab==="add"?"bg-[#D97706] text-white":"text-slate-500")}>Add lead</Link><Link href="/dashboard/leads?tab=filters" className={"whitespace-nowrap rounded-xl px-4 py-3 text-sm font-black "+(tab==="filters"?"bg-[#D97706] text-white":"text-slate-500")}>Search & filters</Link></nav>

    {tab === "inbox" && <>    <div className="mt-5 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between"><span>Showing {total === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total} leads</span><div className="flex flex-wrap items-center gap-3"><span>Page {page} / {totalPages}</span>{executionGaps > 0 && <span className="rounded-full bg-red-50 px-3 py-1 font-bold text-red-700">{executionGaps} active lead{executionGaps === 1 ? "" : "s"} missing owner/action/due date</span>}</div></div>
    <section className="mt-3 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1180px] text-left text-sm">
          <thead className="bg-[#D97706] text-white">
            <tr>
              {["Name","Owner","Stage","Next action","Due date","Source","Phone","Product / service","Score","Action"].map(header => <th key={header} className="px-4 py-4 text-xs font-black uppercase tracking-wider">{header}</th>)}
            </tr>
          </thead>
          <tbody>
            {leads.map(lead => {
              const overdue = lead.nextActionDueAt ? new Date(lead.nextActionDueAt).getTime() < now.getTime() : false;
              return <tr key={lead.id} className="border-t border-slate-100 align-top hover:bg-slate-50">
                <td className="px-4 py-4"><Link href={`/dashboard/leads/${lead.id}`} className="font-black text-slate-900 hover:text-[#D97706]">{lead.name}</Link><div className="mt-1 text-xs text-slate-500">{lead.company || lead.businessType || "Prospect"}</div></td>
                <td className="px-4 py-4"><div className="font-semibold">{lead.ownerEmail || <span className="font-bold text-red-600">Unassigned</span>}</div></td>
                <td className="px-4 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black">{lead.status}</span></td>
                <td className="max-w-[230px] px-4 py-4"><div className="font-semibold">{lead.nextAction || <span className="font-bold text-red-600">Missing</span>}</div></td>
                <td className="px-4 py-4"><span className={overdue ? "font-black text-red-600" : "font-semibold"}>{lead.nextActionDueAt ? new Date(lead.nextActionDueAt).toLocaleString("en-ET") : "Missing"}{overdue ? " · OVERDUE" : ""}</span></td>
                <td className="px-4 py-4"><div className="font-semibold">{lead.source || "website"}</div><div className="text-xs text-slate-400">{lead.referralCode || ""}</div></td>
                <td className="px-4 py-4">{lead.phone ? <a href={`tel:${lead.phone}`} className="font-semibold text-[#D97706]">{lead.phone}</a> : "—"}</td>
                <td className="px-4 py-4">{lead.productInterests.length ? <div className="flex max-w-[190px] flex-wrap gap-1">{lead.productInterests.map(item => <span key={item.id} className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-[#D97706]">{item.product.name}</span>)}</div> : <span className="text-slate-400">Not specified</span>}</td>
                <td className="px-4 py-4"><span className="font-black">{lead.score}</span></td>
                <td className="px-4 py-4"><div className="flex flex-col gap-2"><Link href={`/dashboard/leads/${lead.id}`} className="rounded-lg border border-slate-200 px-3 py-2 text-center text-xs font-black">Open</Link><form action={changeStatus} className="flex gap-1"><input type="hidden" name="leadId" value={lead.id}/><select name="status" defaultValue={lead.status} className="min-w-0 rounded-lg border border-slate-200 px-2 py-2 text-xs font-bold">{stages.map(stage => <option key={stage}>{stage}</option>)}</select><button className="rounded-lg bg-[#D97706] px-3 py-2 text-xs font-bold text-white">Save</button></form></div></td>
              </tr>;
            })}
            {leads.length === 0 && <tr><td colSpan={10} className="p-12 text-center text-slate-500">No leads match these filters.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
    <div className="mt-5 flex gap-3">{page > 1 && <Link href={pageHref(page - 1)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold">← Previous</Link>}{page < totalPages && <Link href={pageHref(page + 1)} className="rounded-xl bg-[#D97706] px-4 py-2 text-sm font-bold text-white">Next →</Link>}</div>
    </>}

  </div></main>;
}
