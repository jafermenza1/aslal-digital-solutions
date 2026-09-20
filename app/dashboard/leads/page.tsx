import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { LeadStatus, prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { verifySession } from "@/lib/security";

const stages = Object.values(LeadStatus);
const pageSize = 24;

type SortKey = "priority" | "newest" | "deal";

async function changeStatus(formData: FormData) {
  "use server";
  const session = verifySession((await cookies()).get("aslal_session")?.value);
  if (!session) redirect("/login");
  const leadId = String(formData.get("leadId") || "");
  const status = String(formData.get("status") || "") as LeadStatus;
  if (!leadId || !stages.includes(status)) return;
  const lead = await prisma.lead.findUnique({ where: { id: leadId }, select: { status: true } });
  if (!lead || lead.status === status) return;
  await prisma.$transaction([
    prisma.lead.update({ where: { id: leadId }, data: { status, ...(status === LeadStatus.WON ? { wonAt: new Date() } : {}) } }),
    prisma.leadStageHistory.create({ data: { leadId, fromStage: lead.status, toStage: status, changedBy: session.email } }),
  ]);
  revalidatePath("/dashboard/leads");
  revalidatePath(`/dashboard/leads/${leadId}`);
  revalidatePath("/dashboard");
}

function buildQuery(search: string, status?: LeadStatus, source?: string, referral?: string, product?: string, minScore?: number): Prisma.LeadWhereInput {
  const where: Prisma.LeadWhereInput = {};
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
  const where = buildQuery(search, status, source, referral, product, minScore);
  const orderBy = sort === "newest" ? [{ createdAt: "desc" as const }] : sort === "deal" ? [{ dealValue: "desc" as const }, { score: "desc" as const }] : [{ score: "desc" as const }, { updatedAt: "desc" as const }];

  const [leads, total, stageCounts, stageValues, sources, products, executionGaps] = await Promise.all([
    prisma.lead.findMany({ where, orderBy, skip: (page - 1) * pageSize, take: pageSize, include: { productInterests: { include: { product: true }, orderBy: { interestScore: "desc" }, take: 3 }, tasks: { where: { status: { in: ["OPEN", "IN_PROGRESS"] } }, orderBy: { dueAt: "asc" }, take: 1 } } }),
    prisma.lead.count({ where }),
    prisma.lead.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.lead.groupBy({ by: ["status"], _sum: { dealValue: true } }),
    prisma.lead.findMany({ distinct: ["source"], where: { source: { not: null } }, select: { source: true }, orderBy: { source: "asc" } }),
    prisma.product.findMany({ where: { active: true }, select: { slug: true, name: true }, orderBy: { name: "asc" } }),
    prisma.lead.count({
      where: {
        status: { notIn: [LeadStatus.WON, LeadStatus.LOST] },
        OR: [{ ownerEmail: null }, { nextAction: null }, { nextActionDueAt: null }],
      },
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const countFor = (stage: LeadStatus) => stageCounts.find(item => item.status === stage)?._count._all ?? 0;
  const valueFor = (stage: LeadStatus) => Number(stageValues.find(item => item.status === stage)?._sum.dealValue ?? 0);
  const query = new URLSearchParams();
  if (search) query.set("q", search);
  if (source) query.set("source", source);
  if (referral) query.set("referral", referral);
  if (product) query.set("product", product);
  if (minScore) query.set("minScore", String(minScore));
  if (sort !== "priority") query.set("sort", sort);
  const pageHref = (nextPage: number) => { const next = new URLSearchParams(query); if (status) next.set("status", status); if (nextPage > 1) next.set("page", String(nextPage)); return `/dashboard/leads?${next.toString()}`; };

  return <main className="min-h-screen bg-[#F8FAFC] py-10"><div className="container-aslal">
    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><div className="text-xs font-black uppercase tracking-[.2em] text-[#0F3E8A]">Growth OS / Sales</div><h1 className="mt-2 text-4xl font-black tracking-tight">Lead inbox</h1><p className="mt-2 text-slate-500">Search demand, prioritize opportunities, and keep every follow-up moving.</p></div><Link href="/dashboard" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#0F3E8A]">← Dashboard</Link></div>

    <div className="mt-7 grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">{stages.map(stage => <Link key={stage} href={`/dashboard/leads?${new URLSearchParams({ ...(status ? { status: stage } : {}), ...(search ? { q: search } : {}) }).toString()}`} className={`rounded-2xl border p-3 ${status === stage ? "border-[#0F3E8A] bg-[#0F3E8A] text-white" : "border-slate-200 bg-white"}`}><div className="text-[10px] font-black uppercase tracking-wider opacity-60">{stage}</div><div className="mt-1 text-xl font-black">{countFor(stage)}</div><div className="text-[10px] opacity-60">ETB {valueFor(stage).toLocaleString()}</div></Link>)}</div>

    <form method="get" className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-5"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6"><input name="q" defaultValue={search} placeholder="Search name, company, email, phone..." className="xl:col-span-2 rounded-xl border border-slate-200 px-4 py-3"/><select name="status" defaultValue={status || ""} className="rounded-xl border border-slate-200 px-3 py-3"><option value="">All stages</option>{stages.map(stage => <option key={stage}>{stage}</option>)}</select><select name="source" defaultValue={source} className="rounded-xl border border-slate-200 px-3 py-3"><option value="">All sources</option>{sources.map(item => <option key={item.source!}>{item.source}</option>)}</select><select name="product" defaultValue={product} className="rounded-xl border border-slate-200 px-3 py-3"><option value="">All products</option>{products.map(item => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select><select name="sort" defaultValue={sort} className="rounded-xl border border-slate-200 px-3 py-3"><option value="priority">Priority</option><option value="newest">Newest</option><option value="deal">Deal value</option></select></div><div className="mt-3 flex flex-wrap gap-3"><input name="minScore" type="number" min="0" max="100" defaultValue={minScore ?? ""} placeholder="Min score" className="w-32 rounded-xl border border-slate-200 px-3 py-2"/><input name="referral" defaultValue={referral} placeholder="Referral code" className="w-40 rounded-xl border border-slate-200 px-3 py-2"/><button className="rounded-xl bg-[#0F3E8A] px-5 py-2 font-bold text-white">Apply filters</button><Link href="/dashboard/leads" className="rounded-xl border border-slate-200 bg-white px-5 py-2 font-bold text-slate-600">Clear</Link></div></form>

    <div className="mt-5 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between"><span>Showing {total === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total} leads</span><div className="flex flex-wrap items-center gap-3"><span>Page {page} / {totalPages}</span>{executionGaps > 0 && <span className="rounded-full bg-red-50 px-3 py-1 font-bold text-red-700">{executionGaps} active lead{executionGaps === 1 ? "" : "s"} missing owner/action/due date</span>}</div></div>
    <section className="mt-3 overflow-hidden rounded-[2rem] border border-slate-200 bg-white"><div className="grid gap-px bg-slate-200 md:grid-cols-2 xl:grid-cols-3">{leads.map(lead => <article key={lead.id} className="bg-white p-6"><div className="flex items-start justify-between gap-3"><div><Link href={`/dashboard/leads/${lead.id}`} className="text-lg font-black hover:text-[#0F3E8A]">{lead.name}</Link><div className="mt-1 text-sm text-slate-500">{lead.company || lead.businessType || "Prospect"}</div></div><div className={`rounded-full px-3 py-1 text-xs font-black ${lead.score >= 80 ? "bg-red-50 text-red-700" : lead.score >= 60 ? "bg-amber-50 text-amber-700" : lead.score >= 30 ? "bg-blue-50 text-[#0F3E8A]" : "bg-slate-100 text-slate-600"}`}>Score {lead.score}</div></div><div className="mt-4 text-xs font-bold uppercase tracking-[.12em] text-slate-400">{lead.status} · {lead.source || "website"} · {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(lead.createdAt)}</div><div className="mt-3 flex flex-wrap gap-2">{lead.productInterests.map(item => <span key={item.id} className="rounded-full bg-[#F8FAFC] px-3 py-1 text-xs font-semibold text-slate-600">{item.product.name}</span>)}</div>{lead.dealValue !== null && <div className="mt-3 text-sm font-black text-[#0F3E8A]">ETB {Number(lead.dealValue).toLocaleString("en-US", { maximumFractionDigits: 2 })}</div>}{lead.tasks[0] && <div className="mt-3 rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-800">Next: {lead.tasks[0].title}{lead.tasks[0].dueAt ? ` · ${new Date(lead.tasks[0].dueAt).toLocaleDateString()}` : ""}</div>}<div className="mt-4 flex gap-2"><Link href={`/dashboard/leads/${lead.id}`} className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-center text-sm font-bold">Open</Link><form action={changeStatus} className="flex flex-1 gap-2"><input type="hidden" name="leadId" value={lead.id}/><select name="status" defaultValue={lead.status} className="min-w-0 flex-1 rounded-xl border border-slate-200 px-2 py-2 text-xs font-bold">{stages.map(stage => <option key={stage}>{stage}</option>)}</select><button className="rounded-xl bg-[#0F3E8A] px-3 py-2 text-xs font-bold text-white">Save</button></form></div></article>)}</div>{leads.length === 0 && <div className="p-12 text-center text-slate-500">No leads match these filters.</div>}</section>
    <div className="mt-5 flex justify-end gap-2">{page > 1 && <Link href={pageHref(page - 1)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold">← Previous</Link>}{page < totalPages && <Link href={pageHref(page + 1)} className="rounded-xl bg-[#0F3E8A] px-4 py-2 text-sm font-bold text-white">Next →</Link>}</div>
  </div></main>;
}
