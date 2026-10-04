import Link from "next/link";
import { resolvePublicWorkspaceId } from "@/lib/workspaces";
import CustomerJourney from "@/components/CustomerJourney";

export const dynamic = "force-dynamic";

export default function CustomerPage() {
  return (
    <main className="min-h-screen bg-[var(--ui-canvas)] py-10">
      <div className="container-aslal space-y-8">
        <header className="rounded-[2rem] bg-[#070C18] p-7 text-white shadow-sm sm:p-10">
          <div className="text-xs font-black uppercase tracking-[.2em] text-[#E2B02A]">Aslal / Customer</div>
          <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">A simpler path from need to purchase.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
            Discover an offer, tell us what you need, receive a response or quote, then continue through the existing order, payment and support workflow.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/marketplace" className="rounded-xl bg-[#E2B02A] px-4 py-3 text-sm font-black text-[#070C18]">Browse marketplace</Link>
            <Link href="/wanted" className="rounded-xl border border-white/15 bg-white/[.05] px-4 py-3 text-sm font-bold text-white">Publish a demand</Link>
            <Link href="/contact" className="rounded-xl border border-white/15 bg-white/[.05] px-4 py-3 text-sm font-bold text-white">Support</Link>
          </div>
        </header>
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["01","Discover","Products, services and commercial offers."],
            ["02","Request","Tell the seller exactly what you need."],
            ["03","Response","Qualification, matching and quote happen in the canonical workflow."],
            ["04","Order & pay","Accepted commerce continues through the existing order/payment controls."],
            ["05","Support","Keep your request reference for follow-up and assistance."],
          ].map(([n,t,b])=><article key={n} className="rounded-2xl border border-slate-200 bg-white p-5"><span className="text-xs font-black text-[#0F3E8A]">{n}</span><h2 className="mt-2 font-black">{t}</h2><p className="mt-1 text-xs leading-5 text-slate-500">{b}</p></article>)}
        </section>
        <CustomerJourney workspaceId={resolvePublicWorkspaceId()} />
      </div>
    </main>
  );
}
