import Link from "next/link";
import {
  ArrowRight, Mail, MessageCircle, Send, ShoppingCart, Workflow, Target
} from "lucide-react";
import { ProvenMarketingHero } from "@/components/AslalInteractiveHero";
import { getPageContent } from "@/lib/public-content";
import { ScrollReveal } from "@/components/ScrollReveal";

const whatsappNumber = process.env.WHATSAPP_NUMBER || "251911276682";
const telegramUsername = process.env.TELEGRAM_BOT_USERNAME?.replace(/^@/, "") || "";
const email = "info@aslaldigital.com";

export default async function Home() {
  const content = await getPageContent("/");
  return (
    <main className="landing-page bg-[#070C18] text-[#F8FAFC]"><div className="landing-center-node" aria-hidden="true"><span/></div>
      <ProvenMarketingHero content={content}/>

      <ScrollReveal><section className="landing-section bg-white" aria-labelledby="journey-title">
        <div className="container-aslal py-2">
          <div className="rounded-[2rem] border border-[#0F3E8A]/10 bg-[#F8FAFC] p-7 shadow-sm sm:p-9">
            <div className="max-w-3xl"><span className="text-[10px] font-black tracking-[.2em] text-[#0F3E8A]">HOW THE JOURNEY WORKS</span><h2 id="journey-title" className="mt-3 text-3xl font-black tracking-tight md:text-4xl">Choose the outcome. We handle the complexity.</h2><p className="mt-4 text-base leading-7 text-slate-600">You do not need to understand Aslal’s internal systems. Start with what you want to accomplish and the platform carries the context into the right next step.</p></div>
            <div className="relative mt-9 grid gap-4 md:grid-cols-3">
              <div className="pointer-events-none absolute left-[16%] right-[16%] top-10 hidden h-px bg-gradient-to-r from-transparent via-[#E2B02A]/45 to-transparent md:block" />
              {([
                ["01","Choose an outcome","Tell us whether you want customers, online sales, automation or a connected digital system.",Target],
                ["02","Take the simplest path","We send you to a guided builder, solution catalog, conversation or direct request—not a maze of services.",Route],
                ["03","Keep your context","Your selected goal, product, referral and attribution stay attached as the request moves into Aslal’s operating system.",ShieldCheck]
              ] as Array<[string,string,string,typeof Target]>).map(([number,title,text,Icon])=>{
                const StepIcon=Icon as typeof Target;
                return <div key={number} className="group relative z-10">
                  <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-[#E2B02A]/35 bg-white shadow-[0_12px_40px_rgba(15,62,138,.10)] transition duration-300 group-hover:-translate-y-1 group-hover:border-[#E2B02A] group-hover:shadow-[0_18px_55px_rgba(226,176,42,.20)]">
                    <StepIcon className="h-6 w-6 text-[#0F3E8A]" />
                  </div>
                  <div className="mt-4 text-center">
                    <span className="font-mono text-[10px] font-black tracking-[.18em] text-[#E2B02A]">{number}</span>
                    <h3 className="mt-2 font-black text-[#1E293B]">{title}</h3>
                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">{text}</p>
                  </div>
                </div>;
              })}
            </div>
          </div>
        </div>
      </section></ScrollReveal>

      <ScrollReveal><section className="landing-section bg-white" aria-labelledby="pain-title">
        <div className="container-aslal">
          <div className="section-heading max-w-3xl">
            <span className="text-[10px] font-black tracking-[.2em] text-[#0F3E8A]">{t.painEyebrow}</span>
            <h2 id="pain-title" className="mt-3 text-4xl font-black tracking-tight text-[#1E293B] md:text-5xl">{t.painTitle}</h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">{t.painBody}</p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {t.pain.map(([title,text,badge],i) => {
              const Icon = i === 0 ? CreditCard : i === 1 ? MessageCircle : TrendingUp;
              return <article key={title} className="group relative overflow-hidden rounded-[1.7rem] border border-slate-200 bg-[#F8FAFC] p-7 shadow-sm transition hover:-translate-y-1 hover:border-[#0F3E8A]/30 hover:shadow-xl">
                <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-[#0F3E8A]/[.05] blur-2xl"/>
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F3E8A] text-[#E2B02A]"><Icon size={23}/></div>
                <span className="mt-6 inline-flex rounded-full bg-[#E2B02A]/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#1E293B]">{badge}</span>
                <h3 className="mt-4 text-xl font-black text-[#1E293B]">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
              </article>;
            })}
          </div>
        </div>
      </section></ScrollReveal>

      <ScrollReveal><section className="landing-section bg-[#F8FAFC]" aria-labelledby="offers-title">
        <div className="container-aslal">
          <div className="section-heading max-w-3xl">
            <span className="text-[10px] font-black tracking-[.2em] text-[#0F3E8A]">{t.offersEyebrow}</span>
            <h2 id="offers-title" className="mt-3 text-4xl font-black tracking-tight text-[#1E293B] md:text-5xl">{t.offersTitle}</h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">{t.offersBody}</p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {t.offers.map(([title,text,href,cta],i) => {
              const Icon = i===0 ? Sparkles : i===1 ? ShoppingCart : i===2 ? Workflow : Bot;
              return <Link key={title} href={href} className="group rounded-[1.7rem] border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-[#E2B02A] hover:shadow-xl">
                <div className="flex items-center justify-between"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#0F3E8A] text-white"><Icon size={20}/></span><ArrowRight className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#E2B02A]" size={19}/></div>
                <h3 className="mt-7 text-xl font-black text-[#1E293B] group-hover:text-[#0F3E8A]">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-[#0F3E8A] group-hover:text-[#E2B02A]">{cta}<ArrowRight size={15}/></span>
              </Link>;
            })}
          </div>
        </div>
      </section></ScrollReveal>

      <ScrollReveal><section className="landing-section bg-white" aria-labelledby="math-title">
        <div className="container-aslal">
          <div className="section-heading max-w-3xl">
            <span className="text-[10px] font-black tracking-[.2em] text-[#0F3E8A]">{t.estimate}</span>
            <h2 id="math-title" className="mt-3 text-4xl font-black tracking-tight text-[#1E293B] md:text-5xl">{t.mathTitle}</h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">{t.mathBody}</p>
          </div>
          <HomeRoiEstimator t={t}/>
        </div>
      </section></ScrollReveal>

      <ScrollReveal><section className="landing-section bg-[#F8FAFC]" aria-labelledby="model-title">
        <div className="container-aslal grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
          <div className="section-heading">
            <span className="text-[10px] font-black tracking-[.2em] text-[#0F3E8A]">{t.modelEyebrow}</span>
            <h2 id="model-title" className="mt-3 text-4xl font-black tracking-tight text-[#1E293B] md:text-5xl">{t.modelTitle}</h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">{t.modelBody}</p>
            <Link href="/growth-builder" className="mt-7 inline-flex items-center gap-2 font-black text-[#0F3E8A] hover:text-[#E2B02A]">{t.claim}<ArrowRight size={17}/></Link>
          </div>
          <div className="relative rounded-[2rem] bg-[#0F3E8A] p-6 shadow-2xl sm:p-8">
            <div className="absolute left-10 right-10 top-1/2 hidden h-px bg-white/15 lg:block"/>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {t.model.map(([title,text],i)=> <div key={title} className="relative z-10 rounded-2xl border border-white/10 bg-white/[.07] p-5 backdrop-blur-sm">
                <div className="flex items-center gap-3"><span className="font-mono text-xs font-black text-[#E2B02A]">0{i+1}</span><CheckCircle2 size={17} className="text-[#E2B02A]"/></div>
                <h3 className="mt-4 font-black text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-white/60">{text}</p>
              </div>)}
            </div>
            <div className="mt-5 flex items-center justify-center gap-3 rounded-2xl bg-[#0F3E8A] p-4 text-xs font-black tracking-widest text-white"><Workflow size={16} className="text-[#E2B02A]"/> BUILD <ArrowRight size={13}/> AUTOMATE <ArrowRight size={13}/> GROW <ArrowRight size={13}/> MEASURE</div>
          </div>
        </div>
      </section></ScrollReveal>


      <ScrollReveal><section className="landing-section bg-[#1E293B] text-white" aria-labelledby="platform-title">
        <div className="container-aslal">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="section-heading max-w-3xl">
              <span className="text-[10px] font-black tracking-[.2em] text-[#E2B02A]">06 — THE ASLAL PLATFORM</span>
              <h2 id="platform-title" className="mt-3 text-4xl font-black tracking-tight md:text-5xl">More than marketing: a connected growth and commerce system.</h2>
              <p className="mt-5 text-lg leading-8 text-white/70">The current platform connects businesses, partners, customers and operational teams around demand, selling, payment evidence and measurable commercial outcomes.</p>
            </div>
            <Link href="/platform" className="inline-flex shrink-0 items-center gap-2 font-black text-[#E2B02A]">Explore platform <ArrowRight size={17}/></Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[["Multi-business","Workspace-isolated business operations and shared platform capabilities."],["Partner commerce","Affiliate, referral and reseller relationships with controlled attribution."],["Sales assets","Printable tickets, coupons and related assets with serial, QR and redemption controls."],["Commercial intelligence","Matching, proposals, agreements, payment evidence, disputes and analytics."]].map(([title,text])=>
              <Link key={title} href="/platform" className="rounded-2xl border border-white/10 bg-white/[.06] p-6 transition hover:border-[#E2B02A]/60 hover:bg-white/[.09]">
                <h3 className="text-lg font-black text-[#E2B02A]">{title}</h3><p className="mt-3 text-sm leading-6 text-white/65">{text}</p>
              </Link>
            )}
          </div>
        </div>
      </section></ScrollReveal>

      <ScrollReveal><section className="landing-section bg-white" aria-labelledby="resources-title">
        <div className="container-aslal">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="section-heading max-w-3xl">
              <span className="text-[10px] font-black tracking-[.2em] text-[#0F3E8A]">04 — RESOURCES</span>
              <h2 id="resources-title" className="mt-3 text-4xl font-black tracking-tight text-[#1E293B] md:text-5xl">{t.resourcesTitle}</h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">{t.resourcesBody}</p>
            </div>
            <Link href="/resources" className="inline-flex shrink-0 items-center gap-2 font-black text-[#0F3E8A] hover:text-[#E2B02A]">{t.resourcesCta}<ArrowRight size={17}/></Link>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {[t.resource1,t.resource2].map(([eyebrow,title,text,href],i)=><Link key={title} href={href} className="group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-[#F8FAFC] p-8 transition hover:-translate-y-1 hover:border-[#0F3E8A]/30 hover:shadow-xl">
              <div className="absolute right-4 top-4 opacity-[.06] transition group-hover:opacity-[.12]">{i===0?<CreditCard size={120}/>:<MessageCircle size={120}/>}</div>
              <span className="relative text-[10px] font-black uppercase tracking-[.18em] text-[#0F3E8A]">{eyebrow}</span>
              <h3 className="relative mt-4 pr-12 text-2xl font-black text-[#1E293B]">{title}</h3>
              <p className="relative mt-3 max-w-xl text-sm leading-7 text-slate-600">{text}</p>
              <span className="relative mt-7 inline-flex items-center gap-2 font-black text-[#0F3E8A] group-hover:text-[#E2B02A]">Open resource <ArrowRight size={16}/></span>
            </Link>)}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/portfolio" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-[#0F3E8A] transition hover:border-[#E2B02A] hover:text-[#E2B02A]">{t.portfolio}<ArrowRight size={15}/></Link>
            <Link href="/automation-lab" className="inline-flex items-center gap-2 rounded-xl bg-[#0F3E8A] px-5 py-3 text-sm font-black text-white transition hover:bg-[#E2B02A] hover:text-[#1E293B]">{t.automationLab}<ArrowRight size={15}/></Link>
          </div>
        </div>
      </section></ScrollReveal>

      <ScrollReveal><section className="landing-section bg-[#0F3E8A] text-white" aria-labelledby="cta-title">
        <div className="container-aslal">
          <div className="mx-auto max-w-4xl text-center">
            <span className="text-[10px] font-black tracking-[.2em] text-[#E2B02A]">05 — NEXT ACTION</span>
            <h2 id="cta-title" className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">{t.ctaTitle}</h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/70">{t.ctaBody}</p>
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/growth-builder" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E2B02A] px-6 py-4 font-black text-[#1E293B] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#E2B02A]">{t.audit}<ArrowRight size={17}/></Link>
              <a href={telegramUsername ? `https://t.me/${telegramUsername}` : "https://t.me/"} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-4 font-bold text-white transition hover:border-[#E2B02A] hover:text-[#E2B02A]"><Send size={17}/>{t.telegram}</a>
              <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi Aslal, I want to discuss my growth system.")}`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-4 font-bold text-white transition hover:border-[#E2B02A] hover:text-[#E2B02A]"><MessageCircle size={17}/>{t.whatsapp}</a>
              <a href={`mailto:${email}`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-4 font-bold text-white transition hover:border-[#E2B02A] hover:text-[#E2B02A]"><Mail size={17}/>{t.email}</a>
            </div>
          </div>
        </div>
      </section></ScrollReveal>

      <ScrollReveal><section className="border-t border-slate-200 bg-[#F8FAFC] py-10">
        <div className="container-aslal flex flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left">
          <div><span className="text-xs font-black tracking-[.2em] text-[#0F3E8A]">ASLAL DIGITAL SOLUTIONS</span><p className="mt-2 text-sm text-slate-500">BUILD · AUTOMATE · GROW · MEASURE</p></div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-bold text-slate-500"><BarChart3 size={18} className="text-[#0F3E8A]"/> <span>Growth systems</span><span>•</span><span>Commerce</span><span>•</span><span>Automation</span><span>•</span><span>Customer systems</span></div>
        </div>
      </section></ScrollReveal>
    </main>
  );
}
