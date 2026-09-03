import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/security";
import type { RowDataPacket } from "mysql2/promise";

export default async function InsightsPage() {
  const session = verifySession((await cookies()).get("aslal_session")?.value);
  if (!session) redirect("/login");

  const [[eventRows], [productRows], [sourceRows], [referralRows]] = await Promise.all([
    db.query("SELECT event_name, COUNT(*) AS count FROM events GROUP BY event_name ORDER BY count DESC LIMIT 10"),
    db.query("SELECT product_slug, COUNT(*) AS count FROM events WHERE product_slug IS NOT NULL GROUP BY product_slug ORDER BY count DESC LIMIT 8"),
    db.query("SELECT COALESCE(first_source, 'website') AS source, COUNT(*) AS count FROM visitors GROUP BY COALESCE(first_source, 'website') ORDER BY count DESC LIMIT 8"),
    db.query("SELECT COALESCE(referral_code, 'direct') AS referral_code, COUNT(*) AS count FROM leads GROUP BY COALESCE(referral_code, 'direct') ORDER BY count DESC LIMIT 8"),
  ]);

  const events = eventRows as RowDataPacket[];
  const products = productRows as RowDataPacket[];
  const sources = sourceRows as RowDataPacket[];
  const referrals = referralRows as RowDataPacket[];

  return <main className="min-h-screen bg-[#F8FAFC] py-10"><div className="container-aslal">
    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><div className="text-xs font-black uppercase tracking-[.2em] text-[#0F3E8A]">Growth OS / Insights</div><h1 className="mt-2 text-4xl font-black tracking-tight">Demand intelligence</h1><p className="mt-2 text-slate-500">See what visitors are engaging with and which acquisition paths are producing demand.</p></div><a href="/dashboard" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#0F3E8A]">← Dashboard</a></div>
    <div className="mt-8 grid gap-5 lg:grid-cols-2">
      <Panel title="Most viewed products">{products.length ? products.map((x: any) => <Row key={x.product_slug} label={x.product_slug} value={x.count} />) : <Empty text="Product interest will appear as visitors explore solutions." />}</Panel>
      <Panel title="Acquisition sources">{sources.map((x: any) => <Row key={x.source} label={x.source} value={x.count} />)}</Panel>
      <Panel title="Referral / partner leads">{referrals.map((x: any) => <Row key={x.referral_code} label={x.referral_code} value={x.count} />)}</Panel>
      <Panel title="Top tracked actions">{events.map((x: any) => <Row key={x.event_name} label={x.event_name} value={x.count} />)}</Panel>
    </div>
    <div className="mt-8 rounded-[2rem] bg-[#0F3E8A] p-7 text-white"><div className="text-xs font-black uppercase tracking-[.2em] text-[#E2B02A]">Next operating layer</div><h2 className="mt-3 text-2xl font-black">From insight to action.</h2><p className="mt-2 max-w-2xl leading-7 text-white/70">The next Growth OS layer can turn high-intent product activity into follow-up tasks, partner attribution and sales-stage movement without losing the visitor journey.</p></div>
  </div></main>;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <section className="rounded-[2rem] border border-slate-200 bg-white p-7"><h2 className="text-xl font-black">{title}</h2><div className="mt-5 space-y-2">{children}</div></section>; }
function Row({ label, value }: { label: string; value: number }) { return <div className="flex items-center justify-between rounded-xl bg-[#F8FAFC] px-4 py-3"><span className="font-semibold text-slate-700">{label}</span><span className="font-black text-[#0F3E8A]">{value}</span></div>; }
function Empty({ text }: { text: string }) { return <p className="rounded-xl bg-[#F8FAFC] px-4 py-5 text-sm text-slate-500">{text}</p>; }
