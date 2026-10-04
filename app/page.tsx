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
  const telegramUrl = telegramUsername ? `https://t.me/${telegramUsername}` : "/contact?channel=telegram";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi Aslal, I need help with my business.")}`;
  const intents = [
    {title:"Get more customers",body:"Marketing, campaigns, SEO and lead generation.",href:"/growth-builder?goal=Get%20more%20customers",icon:Target},
    {title:"Sell online",body:"Find products, services and commercial offers, then start an order.",href:"/marketplace",icon:ShoppingCart},
    {title:"Automate conversations",body:"Connect Telegram, WhatsApp and human follow-up.",href:"/growth-builder?goal=Automate%20conversations",icon:MessageCircle},
    {title:"Build a digital system",body:"Website, CRM, automation and connected customer workflows.",href:"/growth-builder?goal=Build%20a%20digital%20system",icon:Workflow}
  ];
  return (
    <main className="landing-page bg-[#070C18] text-[#F8FAFC]">
      <ProvenMarketingHero content={content} telegramUrl={telegramUrl} whatsappUrl={whatsappUrl}/>
      <ScrollReveal><section className="landing-section bg-[#070C18] py-16 sm:py-20" aria-labelledby="intent-title">
        <div className="container-aslal">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-[10px] font-black tracking-[.2em] text-[#E2B02A]">START WITH YOUR GOAL</span>
            <h2 id="intent-title" className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">What are you trying to do?</h2>
            <p className="mt-4 text-base leading-7 text-white/55">You do not need to know which service you need. Choose the outcome and we will take you to the simplest next step.</p>
          </div>
          <div className="mx-auto mt-9 grid max-w-5xl gap-4 sm:grid-cols-2">
            {intents.map(({title,body,href,icon:Icon})=><Link key={title} href={href} className="group rounded-[1.7rem] border border-white/10 bg-[#0F172A] p-6 shadow-[0_18px_60px_rgba(7,12,24,.25)] transition hover:-translate-y-1 hover:border-[#E2B02A]/55 hover:bg-[#1E293B]">
              <div className="flex items-start justify-between gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#0F3E8A] text-[#F8FAFC]"><Icon size={21}/></span><ArrowRight className="mt-1 text-white/25 transition group-hover:translate-x-1 group-hover:text-[#E2B02A]" size={20}/></div>
              <h3 className="mt-6 text-xl font-black text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-white/55">{body}</p>
            </Link>)}
          </div>
          <div className="mt-7 text-center"><Link href="/contact?goal=Tell%20us%20what%20you%20need" className="inline-flex items-center gap-2 text-sm font-black text-[#E2B02A] hover:text-white">I am not sure — tell Aslal what I need <ArrowRight size={15}/></Link></div>
        </div>
      </section></ScrollReveal>
      <ScrollReveal><section className="landing-section bg-[#0F172A] py-14 sm:py-18" aria-labelledby="channel-title">
        <div className="container-aslal">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-[10px] font-black tracking-[.2em] text-[#E2B02A]">NEED HELP CHOOSING?</span>
            <h2 id="channel-title" className="mt-3 text-2xl font-black text-white sm:text-3xl">Choose the easiest way to reach us.</h2>
            <p className="mt-3 text-sm leading-6 text-white/50">Telegram is the fastest conversational path. WhatsApp is direct chat. The website and email keep a formal request on record.</p>
          </div>
          <div className="mx-auto mt-7 grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <a href={telegramUrl} target="_blank" rel="noreferrer" className="rounded-2xl border border-white/10 bg-[#1E293B] p-5 transition hover:-translate-y-1 hover:border-[#E2B02A]/55"><Send className="text-[#E2B02A]" size={20}/><h3 className="mt-4 font-black text-white">Telegram</h3><p className="mt-1 text-xs leading-5 text-white/50">Fastest conversation.</p></a>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="rounded-2xl border border-white/10 bg-[#1E293B] p-5 transition hover:-translate-y-1 hover:border-[#E2B02A]/55"><MessageCircle className="text-[#E2B02A]" size={20}/><h3 className="mt-4 font-black text-white">WhatsApp</h3><p className="mt-1 text-xs leading-5 text-white/50">Direct chat with Aslal.</p></a>
            <Link href="/contact" className="rounded-2xl border border-white/10 bg-[#1E293B] p-5 transition hover:-translate-y-1 hover:border-[#E2B02A]/55"><Mail className="text-[#E2B02A]" size={20}/><h3 className="mt-4 font-black text-white">Website</h3><p className="mt-1 text-xs leading-5 text-white/50">Send your request.</p></Link>
            <a href={`mailto:${email}`} className="rounded-2xl border border-white/10 bg-[#1E293B] p-5 transition hover:-translate-y-1 hover:border-[#E2B02A]/55"><Mail className="text-[#E2B02A]" size={20}/><h3 className="mt-4 font-black text-white">Email</h3><p className="mt-1 text-xs leading-5 text-white/50">Formal business enquiry.</p></a>
          </div>
        </div>
      </section></ScrollReveal>
      <ScrollReveal><section className="landing-section bg-[#070C18] py-14 sm:py-18" aria-labelledby="browse-title">
        <div className="container-aslal">
          <div className="flex flex-col justify-between gap-5 rounded-[2rem] border border-white/10 bg-[#0F172A] p-7 sm:p-9 md:flex-row md:items-center">
            <div className="max-w-2xl"><span className="text-[10px] font-black tracking-[.2em] text-[#E2B02A]">ALREADY KNOW WHAT YOU NEED?</span><h2 id="browse-title" className="mt-3 text-2xl font-black text-white sm:text-3xl">Browse solutions directly.</h2><p className="mt-3 text-sm leading-6 text-white/50">Explore the Commerce Exchange or the unified Products catalog without having to understand the platform behind it.</p></div>
            <div className="flex flex-wrap gap-3"><Link href="/marketplace" className="inline-flex items-center gap-2 rounded-xl bg-[#E2B02A] px-5 py-3 text-sm font-black text-[#1E293B]">Marketplace <ArrowRight size={15}/></Link><Link href="/products" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[.05] px-5 py-3 text-sm font-black text-white">Products <ArrowRight size={15}/></Link></div>
          </div>
        </div>
      </section></ScrollReveal>
      <ScrollReveal><section className="border-t border-white/10 bg-[#070C18] py-9"><div className="container-aslal flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left"><span className="text-xs font-black tracking-[.2em] text-[#E2B02A]">ASLAL DIGITAL SOLUTIONS</span><span className="text-xs font-bold text-white/35">Practical digital growth for Ethiopian businesses.</span></div></section></ScrollReveal>
    </main>
  );
}
