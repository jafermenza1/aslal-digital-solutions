import Link from "next/link";
import { SectionTitle } from "@/components/SectionTitle";

const services = [
  ["01", "Web Experiences", "High-performance websites, e-commerce experiences and business web applications."],
  ["02", "Software & Systems", "Proven software products, affiliate/reseller solutions, customization and implementation."],
  ["03", "Digital Growth", "Content, campaigns, branding, local and global SEO, and conversion-focused journeys."],
  ["04", "Commerce & Payments", "E-commerce and localized payment integrations built around the Ethiopian market."],
  ["05", "CRM & Lead Systems", "Capture, qualify and route demand into a measurable sales pipeline."],
  ["06", "Automation", "WhatsApp, Telegram and AI-assisted sales automation that responds faster."],
];

const growthStages = ["VISITOR", "INTEREST", "LEAD", "CONVERSATION", "OPPORTUNITY", "REVENUE"];

export default function Home() {
  return (
    <main>
      <section className="relative isolate overflow-hidden bg-[#0F3E8A] text-white hero-glow grid-bg">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
          <div className="hero-drift absolute -right-24 top-20 h-80 w-80 rounded-full border border-[#E2B02A]/20" />
          <div className="hero-drift absolute right-16 top-36 h-48 w-48 rounded-full border border-white/10 [animation-delay:-2s]" />
          <div className="hero-pulse absolute left-[8%] top-[28%] h-3 w-3 rounded-full bg-[#E2B02A]" />
          <div className="hero-pulse absolute right-[44%] top-[22%] h-2 w-2 rounded-full bg-white/70 [animation-delay:1s]" />
          <div className="hero-scan absolute left-0 top-[42%] h-px w-1/2 bg-gradient-to-r from-transparent via-[#E2B02A]/60 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#092d69]/45 to-transparent" />
        </div>

        <div className="container-aslal relative z-10 grid min-h-[760px] items-center gap-12 py-24 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-[#E2B02A] shadow-lg shadow-black/10">Ethiopia • Growth Engineering</div>
            <h1 className="max-w-4xl text-6xl font-black leading-[.92] tracking-[-.06em] sm:text-7xl lg:text-8xl">Digital systems that turn <span className="text-[#E2B02A]">attention</span> into growth.</h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-white/85 sm:text-xl">Aslal Digital Solutions builds websites, software, commerce systems, marketing engines and automation for businesses ready to scale.</p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link href="/contact" className="glow-button hero-pulse rounded-full bg-[#E2B02A] px-6 py-4 font-black text-[#1E293B]">Build my growth system</Link>
              <Link href="/demo" className="rounded-full border border-white/25 bg-white/10 px-6 py-4 font-bold text-white backdrop-blur-sm transition hover:-translate-y-1 hover:bg-white/15">Experience automation →</Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm font-bold text-white/70"><span>Web</span><span>Software</span><span>Commerce</span><span>CRM</span><span>Automation</span><span>SEO</span></div>
          </div>

          <div className="relative z-10 mx-auto w-full max-w-xl hero-drift">
            <div className="absolute -inset-6 rounded-[2.5rem] border border-[#E2B02A]/15 pulse-ring" />
            <div className="absolute -inset-12 rounded-[3rem] border border-white/5" />
            <div className="relative rounded-[2rem] border border-white/25 bg-[#082e6d]/95 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl ring-1 ring-white/10">
              <div className="mb-5 flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-[.18em] text-white/70">Aslal Growth Graph</span><span className="rounded-full bg-[#E2B02A] px-3 py-1 text-xs font-black text-[#1E293B]">GROWTH MODEL</span></div>
              <div className="grid grid-cols-2 gap-3">
                {growthStages.map((x, i) => <div key={x} className={`interactive-card rounded-2xl border border-white/15 p-5 transition ${i === 5 ? "hero-pulse bg-[#E2B02A] text-[#1E293B]" : "bg-white/[.08] text-white"} ${i % 2 === 0 ? "float-node" : ""}`} style={{ animationDelay: `${i * 180}ms` }}><div className="text-[10px] font-bold tracking-[.2em] opacity-55">0{i + 1}</div><div className="mt-2 text-lg font-black">{x}</div></div>)}
              </div>
              <div className="relative mt-4 overflow-hidden rounded-2xl border border-white/15 bg-[#061a40]/90 p-5"><div className="text-xs font-semibold text-white/65">MEASURABLE ROI</div><div className="mt-2 text-2xl font-black tracking-tight text-[#E2B02A] sm:text-3xl">BUILD → AUTOMATE → GROW</div><div className="hero-scan absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent" /></div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-24"><div className="container-aslal"><SectionTitle eyebrow="The Aslal difference" title="Your website should do more than exist." description="We connect digital presence, products, marketing, sales and automation into one growth system—so attention has a path to revenue." />
        <div className="mt-14 grid gap-5 md:grid-cols-3"><div className="interactive-card rounded-3xl border border-slate-200 bg-[#F8FAFC] p-8"><div className="text-4xl font-black text-[#0F3E8A]">01</div><h3 className="mt-8 text-xl font-black">Attract</h3><p className="mt-3 leading-7 text-slate-600">Content, SEO, campaigns and high-performance digital experiences bring the right audience in.</p></div><div className="interactive-card rounded-3xl bg-[#0F3E8A] p-8 text-white"><div className="text-4xl font-black text-[#E2B02A]">02</div><h3 className="mt-8 text-xl font-black">Understand</h3><p className="mt-3 leading-7 text-white/75">Measure meaningful product interest, lead activity and campaign attribution.</p></div><div className="interactive-card rounded-3xl border border-slate-200 bg-[#F8FAFC] p-8"><div className="text-4xl font-black text-[#0F3E8A]">03</div><h3 className="mt-8 text-xl font-black">Convert</h3><p className="mt-3 leading-7 text-slate-600">CRM, WhatsApp, Telegram and sales workflows turn qualified attention into conversations and customers.</p></div></div>
      </div></section>

      <section className="bg-[#F8FAFC] py-24"><div className="container-aslal"><SectionTitle eyebrow="Solutions" title="Everything your growth engine needs." /><div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{services.map(([n,t,d]) => <Link href="/services" key={n} className="interactive-card group rounded-3xl border border-slate-200 bg-white p-7"><div className="relative z-10 text-xs font-black tracking-[.2em] text-[#E2B02A]">{n}</div><h3 className="relative z-10 mt-8 text-2xl font-black text-[#1E293B]">{t}</h3><p className="relative z-10 mt-3 leading-7 text-slate-600">{d}</p><div className="relative z-10 mt-7 font-bold text-[#0F3E8A]">Explore →</div></Link>)}</div></div></section>

      <section className="bg-[#1E293B] py-24 text-white"><div className="container-aslal grid items-center gap-12 lg:grid-cols-[1fr_auto]"><div><div className="text-xs font-black uppercase tracking-[.2em] text-[#E2B02A]">Automation Lab</div><h2 className="mt-4 max-w-3xl text-4xl font-black tracking-[-.04em] sm:text-6xl">Don't take our word for it. Experience the technology.</h2><p className="mt-5 max-w-2xl text-lg leading-8 text-white/70">Try the sales experiences we build for clients across website, WhatsApp and Telegram.</p></div><Link href="/demo" className="glow-button rounded-full bg-[#E2B02A] px-7 py-4 font-black text-[#1E293B]">Open the lab →</Link></div></section>

      <section className="bg-white py-24"><div className="container-aslal flex flex-col justify-between gap-8 rounded-[2rem] bg-[#0F3E8A] p-9 text-white sm:p-14 lg:flex-row lg:items-end"><div><div className="text-xs font-black uppercase tracking-[.2em] text-[#E2B02A]">Ready to grow?</div><h2 className="mt-4 max-w-2xl text-4xl font-black tracking-[-.04em] sm:text-5xl">Let's design the digital system your business actually needs.</h2></div><Link href="/contact" className="glow-button shrink-0 rounded-full bg-[#E2B02A] px-7 py-4 font-black text-[#1E293B]">Start a conversation</Link></div></section>
    </main>
  );
}
