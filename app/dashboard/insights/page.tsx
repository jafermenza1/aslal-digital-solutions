import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/authorization";

type ProductDemandRow = RowDataPacket & {
  product_slug: string;
  product_name: string;
  views: number;
  unique_visitors: number;
  repeat_visitors: number;
  leads_generated: number;
  qualified_leads: number;
  demo_interactions: number;
  won_deals: number;
  attributed_revenue: number | string | null;
};

type SourceRow = RowDataPacket & { source: string; visitors: number; leads: number; won_deals: number };
type ReferralRow = RowDataPacket & { referral_code: string; clicks: number; leads: number; won_deals: number; revenue: number | string | null };
type ActivityRow = RowDataPacket & { id: string; event_name: string; page_path: string | null; product_slug: string | null; created_at: Date };
type FollowUpRow = RowDataPacket & { id: string; lead_id: string; name: string; title: string; priority: string; due_at: Date | null; score: number };
type ClockRow = RowDataPacket & { now: Date };

export default async function InsightsPage({searchParams}:{searchParams?:Promise<{tab?:string}>}) {
  await requirePermission("insights.view");
  const requestedTab=(await searchParams)?.tab || "products";
  const tab=["products","acquisition","referrals","activity","followups"].includes(requestedTab) ? requestedTab : "products";

  const [productRows, sourceRows, referralRows, activityRows, followUpRows, clockRows] = await Promise.all([
    db.query<ProductDemandRow[]>(
      `SELECT
        p.slug AS product_slug,
        p.name AS product_name,
        COALESCE(e.views, 0) AS views,
        COALESCE(e.unique_visitors, 0) AS unique_visitors,
        COALESCE(e.repeat_visitors, 0) AS repeat_visitors,
        COALESCE(i.leads_generated, 0) AS leads_generated,
        COALESCE(i.qualified_leads, 0) AS qualified_leads,
        COALESCE(e.demo_interactions, 0) AS demo_interactions,
        COALESCE(i.won_deals, 0) AS won_deals,
        COALESCE(i.attributed_revenue, 0) AS attributed_revenue
      FROM products p
      LEFT JOIN (
        SELECT
          e.product_slug,
          COUNT(*) AS views,
          COUNT(DISTINCT e.visitor_id) AS unique_visitors,
          COUNT(DISTINCT CASE WHEN v.visitor_event_count > 1 THEN e.visitor_id END) AS repeat_visitors,
          COUNT(DISTINCT CASE WHEN LOWER(e.event_name) LIKE '%demo%' THEN e.visitor_id END) AS demo_interactions
        FROM events e
        LEFT JOIN (
          SELECT visitor_id, COUNT(*) AS visitor_event_count
          FROM events
          WHERE visitor_id IS NOT NULL
          GROUP BY visitor_id
        ) v ON v.visitor_id = e.visitor_id
        WHERE e.product_slug IS NOT NULL
        GROUP BY e.product_slug
      ) e ON e.product_slug = p.slug
      LEFT JOIN (
        SELECT
          lpi.product_id,
          COUNT(DISTINCT lpi.lead_id) AS leads_generated,
          COUNT(DISTINCT CASE WHEN l.status IN ('QUALIFIED','DEMO','PROPOSAL','NEGOTIATION','WON') THEN l.id END) AS qualified_leads,
          COUNT(DISTINCT CASE WHEN l.status = 'WON' THEN l.id END) AS won_deals,
          SUM(CASE WHEN l.status = 'WON' THEN COALESCE(l.deal_value, 0) ELSE 0 END) AS attributed_revenue
        FROM lead_product_interest lpi
        INNER JOIN leads l ON l.id = lpi.lead_id
        GROUP BY lpi.product_id
      ) i ON i.product_id = p.id
      WHERE p.active = 1
      ORDER BY leads_generated DESC, views DESC
      LIMIT 20`
    ),
    db.query<SourceRow[]>(
      `SELECT
        COALESCE(v.first_source, 'website') AS source,
        COUNT(DISTINCT v.id) AS visitors,
        COUNT(DISTINCT l.id) AS leads,
        COUNT(DISTINCT CASE WHEN l.status = 'WON' THEN l.id END) AS won_deals
      FROM visitors v
      LEFT JOIN leads l ON l.visitor_id = v.id
      GROUP BY COALESCE(v.first_source, 'website')
      ORDER BY leads DESC, visitors DESC
      LIMIT 10`
    ),
    db.query<ReferralRow[]>(
      `SELECT
        COALESCE(l.referral_code, 'direct') AS referral_code,
        COALESCE(c.clicks, 0) AS clicks,
        COUNT(DISTINCT l.id) AS leads,
        COUNT(DISTINCT CASE WHEN l.status = 'WON' THEN l.id END) AS won_deals,
        SUM(CASE WHEN l.status = 'WON' THEN COALESCE(l.deal_value, 0) ELSE 0 END) AS revenue
      FROM leads l
      LEFT JOIN (
        SELECT rl.code, COUNT(DISTINCT rc.id) AS clicks
        FROM referral_links rl
        LEFT JOIN referral_clicks rc ON rc.referral_link_id = rl.id
        GROUP BY rl.code
      ) c ON c.code = l.referral_code
      GROUP BY COALESCE(l.referral_code, 'direct'), c.clicks
      ORDER BY leads DESC, clicks DESC
      LIMIT 10`
    ),
    db.query<ActivityRow[]>(
      `SELECT id, event_name, page_path, product_slug, created_at
       FROM events
       ORDER BY created_at DESC
       LIMIT 12`
    ),
    db.query<FollowUpRow[]>(
      `SELECT t.id, t.lead_id, l.name, t.title, t.priority, t.due_at, l.score
       FROM lead_tasks t
       INNER JOIN leads l ON l.id = t.lead_id
       WHERE t.status IN ('OPEN','IN_PROGRESS')
         AND t.due_at IS NOT NULL
       ORDER BY (t.due_at < NOW()) DESC, t.due_at ASC
       LIMIT 10`
    ),
    db.query<ClockRow[]>(`SELECT NOW() AS now`),
  ]);

  const products = productRows[0];
  const sources = sourceRows[0];
  const referrals = referralRows[0];
  const activity = activityRows[0];
  const followUps = followUpRows[0];
  // Use one database clock value for the whole render so overdue classification is deterministic.
  const now = new Date(clockRows[0][0]?.now ?? 0).getTime();

  return <main className="min-h-screen bg-[#F8FAFC] py-10"><div className="container-aslal">
    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><div className="text-xs font-black uppercase tracking-[.2em] text-[#0F3E8A]">Growth OS / Insights</div><h1 className="mt-2 text-4xl font-black tracking-tight">Demand intelligence</h1><p className="mt-2 max-w-3xl text-slate-500">Connect product interest, acquisition, referrals, sales outcomes, and follow-up so the team can act on demand instead of only reporting it.</p></div><Link href="/dashboard" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#0F3E8A]">← Dashboard</Link></div>

    <nav aria-label="Insights sections" className="mt-7 flex gap-2 overflow-x-auto pb-1">{[["products","Product demand"],["acquisition","Acquisition"],["referrals","Referrals"],["activity","Live activity"],["followups","Follow-up queue"]].map(([key,label])=><Link key={key} href={`/dashboard/insights?tab=${key}`} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-black transition ${tab===key?"border-[#0F3E8A] bg-[#0F3E8A] text-white":"border-slate-200 bg-white text-slate-600 hover:border-[#0F3E8A]/30 hover:bg-slate-50"}`}>{label}</Link>)}</nav>

    <section className="mt-8 rounded-[2rem]  ${tab==="products"?"":"hidden"} border border-slate-200 bg-white p-7"><div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end"><div><div className="text-xs font-black uppercase tracking-[.16em] text-[#0F3E8A]">Product demand matrix</div><h2 className="mt-2 text-2xl font-black">Which solutions are creating buying intent?</h2></div><div className="text-xs font-semibold text-slate-400">Active products · ranked by leads, then views</div></div><div className="mt-6 overflow-x-auto"><table className="w-full min-w-[920px] text-left text-sm"><thead><tr className="border-b border-slate-200 text-xs uppercase tracking-[.12em] text-slate-400"><th className="px-3 py-3">Product</th><th className="px-3 py-3">Views</th><th className="px-3 py-3">Unique</th><th className="px-3 py-3">Repeat</th><th className="px-3 py-3">Leads</th><th className="px-3 py-3">Qualified</th><th className="px-3 py-3">Demos</th><th className="px-3 py-3">Won</th><th className="px-3 py-3">Revenue</th></tr></thead><tbody>{products.map(p => <tr key={p.product_slug} className="border-b border-slate-100 last:border-0"><td className="px-3 py-4"><div className="font-black text-slate-800">{p.product_name}</div><div className="text-xs text-slate-400">{p.product_slug}</div></td><td className="px-3 py-4 font-bold">{p.views}</td><td className="px-3 py-4 font-bold">{p.unique_visitors}</td><td className="px-3 py-4 font-bold">{p.repeat_visitors}</td><td className="px-3 py-4 font-black text-[#0F3E8A]">{p.leads_generated}</td><td className="px-3 py-4 font-bold">{p.qualified_leads}</td><td className="px-3 py-4 font-bold">{p.demo_interactions}</td><td className="px-3 py-4 font-black">{p.won_deals}</td><td className="px-3 py-4 font-black">{Number(p.attributed_revenue ?? 0).toLocaleString("en-US", { maximumFractionDigits: 2 })} ETB</td></tr>)}{products.length === 0 && <tr><td colSpan={9} className="px-3 py-8 text-center text-sm text-slate-500">Product demand will appear as visitors explore active solutions.</td></tr>}</tbody></table></div></section>

    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <div className={tab==="acquisition"?"":"hidden"}><Panel title="Acquisition → sales"><div className="space-y-2">{sources.map(x => <div key={x.source} className="grid grid-cols-[1.2fr_repeat(3,auto)] items-center gap-4 rounded-xl bg-[#F8FAFC] px-4 py-3"><span className="font-bold">{x.source}</span><span className="text-xs text-slate-500">{x.visitors} visitors</span><span className="font-black text-[#0F3E8A]">{x.leads} leads</span><span className="text-xs font-bold">{x.won_deals} won</span></div>)}{sources.length === 0 && <Empty text="Acquisition data will appear as visitors arrive." />}</div></Panel></div>
      <div className={tab==="referrals"?"":"hidden"}><Panel title="Referral performance"><div className="space-y-2">{referrals.map(x => <div key={x.referral_code} className="rounded-xl bg-[#F8FAFC] px-4 py-3"><div className="flex items-center justify-between gap-3"><span className="font-bold">{x.referral_code}</span><span className="font-black text-[#0F3E8A]">{x.leads} leads</span></div><div className="mt-1 text-xs text-slate-500">{x.clicks} clicks · {x.won_deals} won · {Number(x.revenue ?? 0).toLocaleString("en-US", { maximumFractionDigits: 2 })} ETB revenue</div></div>)}{referrals.length === 0 && <Empty text="Referral performance will appear when attributed leads are captured." />}</div></Panel></div>
    </div>

    <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
      <div className={tab==="activity"?"":"hidden"}><Panel title="Live demand activity"><div className="space-y-2">{activity.map(x => <div key={String(x.id)} className="flex items-center justify-between gap-4 rounded-xl bg-[#F8FAFC] px-4 py-3"><div className="min-w-0"><div className="truncate font-bold">{x.event_name}{x.product_slug ? ` · ${x.product_slug}` : ""}</div><div className="truncate text-xs text-slate-500">{x.page_path || "Unknown page"}</div></div><time className="shrink-0 text-xs font-semibold text-slate-400">{new Date(x.created_at).toLocaleString()}</time></div>)}{activity.length === 0 && <Empty text="Tracked activity will appear here." />}</div></Panel></div>
      <div className={tab==="followups"?"":"hidden"}><Panel title="Follow-up queue"><div className="space-y-2">{followUps.map(x => { const overdue = x.due_at ? new Date(x.due_at).getTime() < now : false; return <Link key={x.id} href={`/dashboard/leads/${x.lead_id}`} className="block rounded-xl bg-[#F8FAFC] px-4 py-3 hover:bg-slate-100"><div className="flex items-center justify-between gap-3"><span className="font-bold">{x.name}</span><span className={`text-xs font-black uppercase ${overdue ? "text-red-600" : "text-[#0F3E8A]"}`}>{overdue ? "Overdue" : x.priority}</span></div><div className="mt-1 text-sm text-slate-600">{x.title}</div><div className="mt-1 text-xs text-slate-400">Score {x.score} · {x.due_at ? new Date(x.due_at).toLocaleString() : "No due date"}</div></Link>})}{followUps.length === 0 && <Empty text="No dated open follow-ups are waiting." />}</div></Panel></div>
    </div>

    <div className="mt-6 rounded-[2rem] bg-[#0F3E8A] p-7 text-white"><div className="text-xs font-black uppercase tracking-[.2em] text-[#E2B02A]">Operating rule</div><h2 className="mt-3 text-2xl font-black">Prioritize demand that can become revenue.</h2><p className="mt-2 max-w-3xl leading-7 text-white/70">Use product demand, lead quality, referral attribution, and overdue follow-ups together. High-interest products and high-score leads should shape the next sales action, campaign, and partner conversation.</p></div>
  </div></main>;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <section className="rounded-[2rem] border border-slate-200 bg-white p-7"><h2 className="text-xl font-black">{title}</h2><div className="mt-5">{children}</div></section>; }
function Empty({ text }: { text: string }) { return <p className="rounded-xl bg-[#F8FAFC] px-4 py-5 text-sm text-slate-500">{text}</p>; }
