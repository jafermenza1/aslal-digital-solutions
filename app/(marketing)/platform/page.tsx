import Link from "next/link";
import { ArrowRight, BarChart3, BadgeCheck, BriefcaseBusiness, FileCheck2, Handshake, LineChart, MessageSquareText, PackageCheck, ReceiptText, Search, ShieldCheck, Store, Users, Workflow } from "lucide-react";

const capabilities = [
  { icon: Store, title: "Multi-business commerce", text: "Run separate business workspaces while keeping shared platform capabilities for products, customers, orders, programs and reporting.", href: "/marketplace" },
  { icon: Users, title: "Partner network", text: "Connect businesses with affiliates, referral agents, resellers and other approved partners with role-aware access and relationships.", href: "/partner/register" },
  { icon: PackageCheck, title: "Partner sales assets", text: "Create controlled printable sales assets such as tickets, coupons and similar offers with allocation, serialisation, QR and redemption workflows.", href: "/marketplace" },
  { icon: Search, title: "Demand & opportunity matching", text: "Publish wanted requests and match suitable supply, businesses and professionals using explainable commercial-fit signals.", href: "/wanted" },
  { icon: BriefcaseBusiness, title: "Professional services", text: "Present verified professional profiles and service offerings, then connect them to commercial opportunities and proposals.", href: "/marketplace" },
  { icon: FileCheck2, title: "Proposals & agreements", text: "Compare versioned provider proposals and move accepted terms into acknowledged commercial agreements with a clear lifecycle.", href: "/services" },
  { icon: ReceiptText, title: "Payment evidence & reconciliation", text: "Record external payment evidence for bank, cash, institutional or gateway payments and reconcile verified evidence with canonical payments.", href: "/products" },
  { icon: BarChart3, title: "Commercial analytics", text: "Measure the journey from lead to opportunity, quote, order and paid order, including revenue, partner attribution, commissions and payouts.", href: "/resources" },
  { icon: ShieldCheck, title: "Trust, disputes & controls", text: "Keep evidence, review signals, disputes and restriction decisions explicit so legitimate commercial records are not silently invalidated.", href: "/about" },
  { icon: MessageSquareText, title: "Conversation-led selling", text: "Connect website, WhatsApp and Telegram conversations to structured demand capture, qualification, routing and human handoff.", href: "/automation-lab" },
  { icon: Workflow, title: "Operational workbenches", text: "Give business, partner, finance and operational users focused workspaces for the tasks and reports relevant to their role.", href: "/login" },
  { icon: LineChart, title: "Growth measurement", text: "Bring marketing activity, customer journeys and commercial outcomes into one measurable operating model.", href: "/growth-builder" },
];

export default function PlatformPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#1E293B]">
      <section className="bg-[#0F3E8A] px-5 py-24 text-white sm:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <span className="text-[10px] font-black tracking-[.22em] text-[#E2B02A]">ASLAL GROWTH & COMMERCE PLATFORM</span>
          <div className="mt-5 grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
            <div>
              <h1 className="max-w-4xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">A connected operating layer for marketing, sales, commerce and partners.</h1>
              <p className="mt-7 max-w-3xl text-lg leading-8 text-white/75">Aslal is evolving beyond a conventional digital-marketing website into a business growth and commerce platform. It connects demand capture, partner selling, commercial workflows, payment evidence and measurement around real business records.</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/marketplace" className="inline-flex items-center gap-2 rounded-xl bg-[#E2B02A] px-6 py-4 font-black text-[#1E293B]">Explore Marketplace <ArrowRight size={17}/></Link>
                <Link href="/growth-builder" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-4 font-bold text-white">Build a Growth System <ArrowRight size={17}/></Link>
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/15 bg-[#1E293B] p-7 shadow-2xl">
              <div className="flex items-center gap-3 text-[#E2B02A]"><Handshake size={20}/><span className="text-xs font-black tracking-widest">ONE COMMERCIAL THREAD</span></div>
              <div className="mt-6 space-y-3 text-sm font-bold">
                {["Attract demand","Capture & qualify","Match supply","Propose & agree","Sell & fulfill","Verify payment","Recognize revenue","Measure & improve"].map((x,i)=><div key={x} className="flex items-center gap-3 rounded-xl bg-white/[.06] px-4 py-3"><span className="font-mono text-[#E2B02A]">0{i+1}</span><span>{x}</span></div>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <span className="text-[10px] font-black tracking-[.22em] text-[#0F3E8A]">CURRENT PLATFORM CAPABILITIES</span>
            <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">What the system now brings together.</h2>
            <p className="mt-5 text-lg leading-8 text-[#1E293B]/70">These capabilities describe the current product direction and implemented platform areas. Public pages explain the customer-facing value; authenticated workbenches handle protected operational actions.</p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map(({icon:Icon,title,text,href})=><Link key={title} href={href} className="group rounded-[1.6rem] border border-[#1E293B]/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#E2B02A] hover:shadow-xl">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0F3E8A] text-[#E2B02A]"><Icon size={20}/></div>
              <h3 className="mt-6 text-xl font-black group-hover:text-[#0F3E8A]">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#1E293B]/65">{text}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#0F3E8A] group-hover:text-[#E2B02A]">Explore <ArrowRight size={15}/></span>
            </Link>)}
          </div>
        </div>
      </section>

      <section className="bg-[#1E293B] px-5 py-20 text-white sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-3">
          <div><span className="text-[10px] font-black tracking-[.22em] text-[#E2B02A]">FOR BUSINESSES</span><h2 className="mt-3 text-3xl font-black">Publish, sell, manage and measure.</h2><p className="mt-4 leading-7 text-white/65">Businesses can structure offers, manage commercial relationships, receive partner-attributed demand and inspect operational and financial evidence.</p></div>
          <div><span className="text-[10px] font-black tracking-[.22em] text-[#E2B02A]">FOR PARTNERS</span><h2 className="mt-3 text-3xl font-black">Sell with controlled attribution.</h2><p className="mt-4 leading-7 text-white/65">Partners can participate through defined relationships and eligible programs, use sales assets and links, and keep commercial activity tied to auditable records.</p></div>
          <div><span className="text-[10px] font-black tracking-[.22em] text-[#E2B02A]">FOR CUSTOMERS</span><h2 className="mt-3 text-3xl font-black">A clearer path from interest to purchase.</h2><p className="mt-4 leading-7 text-white/65">Customers can discover offers, submit demand, communicate through connected channels and complete supported purchase or service journeys.</p></div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-[#0F3E8A]/15 bg-white p-8 text-center shadow-xl sm:p-12">
          <BadgeCheck className="mx-auto text-[#E2B02A]" size={32}/>
          <h2 className="mt-4 text-3xl font-black">Start where your business has the biggest gap.</h2>
          <p className="mx-auto mt-4 max-w-2xl leading-7 text-[#1E293B]/65">Explore the public marketplace, submit a wanted request, register as a partner, or use the Growth Builder to define the right starting point.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/marketplace" className="rounded-xl bg-[#0F3E8A] px-5 py-3 font-black text-white">Marketplace</Link>
            <Link href="/wanted" className="rounded-xl border border-[#0F3E8A]/20 px-5 py-3 font-black text-[#0F3E8A]">Post a Need</Link>
            <Link href="/partner/register" className="rounded-xl border border-[#0F3E8A]/20 px-5 py-3 font-black text-[#0F3E8A]">Become a Partner</Link>
            <Link href="/growth-builder" className="rounded-xl bg-[#E2B02A] px-5 py-3 font-black text-[#1E293B]">Growth Builder</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
