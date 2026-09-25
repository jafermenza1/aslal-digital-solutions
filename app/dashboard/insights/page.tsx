import Link from "next/link";
import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/authorization";
import { authorizeWorkspacePermission } from "@/lib/workspaces";

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

export default async function InsightsPage({ searchParams }: { searchParams: Promise<{ tab?: string; workspaceId?: string }> }) {
  const params = await searchParams;
  const access = await authorizeWorkspacePermission("dashboard.view", params.workspaceId);
  if (!access) return null;
  const workspaceId = access.workspace.id;
  const requestedTab = params.tab || "products";
  const tab = ["products","acquisition","referrals","activity","follow-up"].includes(requestedTab) ? requestedTab : "products";

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
          AND EXISTS (SELECT 1 FROM leads scope_lead WHERE scope_lead.visitor_id = e.visitor_id AND scope_lead.workspace_id = ?)
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
        WHERE l.workspace_id = ?
        GROUP BY lpi.product_id
      ) i ON i.product_id = p.id
      WHERE p.active = 1
      ORDER BY leads_generated DESC, views DESC
      LIMIT 20`,
      [workspaceId, workspaceId]
    ),
    db.query<SourceRow[]>(
      `SELECT
        COALESCE(v.first_source, 'website') AS source,
        COUNT(DISTINCT CASE WHEN l.workspace_id = ? THEN v.id END) AS visitors,
        COUNT(DISTINCT CASE WHEN l.workspace_id = ? THEN l.id END) AS leads,
        COUNT(DISTINCT CASE WHEN l.workspace_id = ? AND l.status = 'WON' THEN l.id END) AS won_deals
      FROM visitors v
      LEFT JOIN leads l ON l.visitor_id = v.id
      GROUP BY COALESCE(v.first_source, 'website')
      ORDER BY leads DESC, visitors DESC
      LIMIT 10`,
      [workspaceId, workspaceId, workspaceId]
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
        WHERE rl.workspace_id = ?
        LEFT JOIN referral_clicks rc ON rc.referral_link_id = rl.id
        GROUP BY rl.code
      ) c ON c.code = l.referral_code
      WHERE l.workspace_id = ?
      GROUP BY COALESCE(l.referral_code, 'direct'), c.clicks
      ORDER BY leads DESC, clicks DESC
      LIMIT 10`,
      [workspaceId, workspaceId]
    ),
    db.query<ActivityRow[]>(
      `SELECT id, event_name, page_path, product_slug, created_at
       FROM events e
       WHERE EXISTS (SELECT 1 FROM leads l_scope WHERE l_scope.visitor_id = e.visitor_id AND l_scope.workspace_id = ?)
       ORDER BY created_at DESC
       LIMIT 12`, [workspaceId]
    ),
    db.query<FollowUpRow[]>(
      `SELECT t.id, t.lead_id, l.name, t.title, t.priority, t.due_at, l.score
       FROM lead_tasks t
       INNER JOIN leads l ON l.id = t.lead_id
       WHERE l.workspace_id = ? AND t.status IN ('OPEN','IN_PROGRESS')
         AND t.due_at IS NOT NULL
       ORDER BY (t.due_at < NOW()) DESC, t.due_at ASC
       LIMIT 10`, [workspaceId]
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

  const tabs = [
    ["products", "Product demand"],
    ["acquisition", "Acquisition"],
    ["referrals", "Referrals"],
    ["activity", "Live activity"],
    ["follow-up", "Follow-up"],
  ] as const;

  return <main className="min-h-screen bg-[#F8FAFC] py-10"><div className="container-aslal">
    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div><div className="text-xs font-black uppercase tracking-[.2em] text-[#0F3E8A]">Growth OS / Insights</div><h1 className="mt-2 text-4xl font-black tracking-tight">Demand intelligence</h1><p className="mt-2 max-w-3xl text-slate-500">One decision window at a time: product demand, acquisition, referrals, activity, or follow-up.</p></div>
      <Link href="/dashboard" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#0F3E8A]">← Dashboard</Link>
    </div>

    <nav className="mt-7 flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm" aria-label="Insights sections">
      {tabs.map(([value,label]) => <Link key={value} href={`/dashboard/insights?tab=${value}`} className={`whitespace-nowrap rounded-xl px-4 py-3 text-sm font-black transition ${tab===value ? "bg-[#0F3E8A] text-white" : "text-slate-600 hover:bg-[#E2B02A]/15 hover:text-[#0F3E8A]"}`}>{label}</Link>)}
    </nav>

    {tab==="products" && <Panel title="Product demand"><div className="mb-4 text-sm text-slate-500">Active products ranked by leads, then views. Revenue shown here is attributed from WON leads, not collected payment.</div><div className="overflow-x-auto"><table className="w-full min-w-[920px] text-left text-sm"><thead><tr className="border-b border-slate-200 text-xs uppercase tracking-[.12em] text-slate-500"><th className="px-3 py-3">Product</th><th className="px-3 py-3">Views</th><th className="px-3 py-3">Unique</th><th className="px-3 py-3">Repeat</th><th className="px-3 py-3">Leads</th><th className="px-3 py-3">Qualified</th><th className="px-3 py-3">Demos</th><th className="px-3 py-3">Won</th><th className="px-3 py-3">Attributed</th></tr></thead><tbody>{products.map(p=><tr key={p.product_slug} className="border-b border-slate-100 last:border-0"><td className="px-3 py-4"><div className="font-black text-slate-800">{p.product_name}</div><div className="text-xs text-slate-500">{p.product_slug}</div></td><td className="px-3 py-4 font-bold">{p.views}</td><td className="px-3 py-4 font-bold">{p.unique_visitors}</td><td className="px-3 py-4 font-bold">{p.repeat_visitors}</td><td className="px-3 py-4 font-black text-[#0F3E8A]">{p.leads_generated}</td><td className="px-3 py-4 font-bold">{p.qualified_leads}</td><td className="px-3 py-4 font-bold">{p.demo_interactions}</td><td className="px-3 py-4 font-black">{p.won_deals}</td><td className="px-3 py-4 font-black">{Number(p.attributed_revenue ?? 0).toLocaleString("en-US",{maximumFractionDigits:2})} ETB</td></tr>)}{products.length===0&&<tr><td colSpan={9} className="px-3 py-10 text-center text-slate-500">No product demand recorded yet.</td></tr>}</tbody></table></div></Panel>}

    {tab==="acquisition" && <Panel title="Acquisition → sales"><div className="space-y-2">{sources.map(x=><div key={x.source} className="grid gap-2 rounded-xl bg-[#F8FAFC] px-4 py-4 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center"><span className="font-bold">{x.source}</span><span className="text-xs text-slate-500">{x.visitors} visitors</span><span className="font-black text-[#0F3E8A]">{x.leads} leads</span><span className="text-xs font-bold">{x.won_deals} won</span></div>)}{sources.length===0&&<Empty text="Acquisition data will appear as visitors arrive."/>}</div></Panel>}

    {tab==="referrals" && <Panel title="Referral performance"><div className="space-y-2">{referrals.map(x=><div key={x.referral_code} className="rounded-xl bg-[#F8FAFC] px-4 py-4"><div className="flex items-center justify-between gap-3"><span className="font-bold">{x.referral_code}</span><span className="font-black text-[#0F3E8A]">{x.leads} leads</span></div><div className="mt-2 text-sm text-slate-600">{x.clicks} clicks · {x.won_deals} won · {Number(x.revenue ?? 0).toLocaleString("en-US",{maximumFractionDigits:2})} ETB attributed</div></div>)}{referrals.length===0&&<Empty text="Referral performance will appear when attributed leads are captured."/>}</div></Panel>}

    {tab==="activity" && <Panel title="Live demand activity"><div className="space-y-2">{activity.map(x=><div key={String(x.id)} className="flex flex-col justify-between gap-2 rounded-xl bg-[#F8FAFC] px-4 py-4 sm:flex-row sm:items-center"><div className="min-w-0"><div className="truncate font-bold">{x.event_name}{x.product_slug ? ` · ${x.product_slug}` : ""}</div><div className="truncate text-xs text-slate-500">{x.page_path || "Unknown page"}</div></div><time className="shrink-0 text-xs font-semibold text-slate-500">{new Date(x.created_at).toLocaleString()}</time></div>)}{activity.length===0&&<Empty text="Tracked activity will appear here."/>}</div></Panel>}

    {tab==="follow-up" && <Panel title="Follow-up queue"><div className="space-y-2">{followUps.map(x=>{const overdue=x.due_at ? new Date(x.due_at).getTime()<now:false;return <Link key={x.id} href={`/dashboard/leads/${x.lead_id}`} className="block rounded-xl bg-[#F8FAFC] px-4 py-4 hover:bg-slate-100"><div className="flex items-center justify-between gap-3"><span className="font-bold">{x.name}</span><span className={`text-xs font-black uppercase ${overdue ? "text-red-600" : "text-[#0F3E8A]"}`}>{overdue ? "Overdue" : x.priority}</span></div><div className="mt-1 text-sm text-slate-700">{x.title}</div><div className="mt-1 text-xs text-slate-500">Score {x.score} · {x.due_at ? new Date(x.due_at).toLocaleString() : "No due date"}</div></Link>})}{followUps.length===0&&<Empty text="No dated open follow-ups are waiting."/>}</div></Panel>}

    <div className="mt-6 rounded-[2rem] bg-[#0F3E8A] p-7 text-white"><div className="text-xs font-black uppercase tracking-[.2em] text-[#E2B02A]">Data rule</div><p className="mt-2 max-w-3xl leading-7 text-white/80">A view, visitor, signal, demo interaction, or attributed WON value is not automatically collected revenue. Use the relevant operational workspace before treating a metric as a commercial outcome.</p></div>
  </div></main>;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <section className="rounded-[2rem] border border-slate-200 bg-white p-7"><h2 className="text-xl font-black">{title}</h2><div className="mt-5">{children}</div></section>; }
function Empty({ text }: { text: string }) { return <p className="rounded-xl bg-[#F8FAFC] px-4 py-5 text-sm text-slate-500">{text}</p>; }
