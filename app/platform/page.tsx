import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight, Bot, BrainCircuit, CircleDollarSign, Globe2, Handshake,
  MessageCircle, Network, QrCode, ShieldCheck, ShoppingBag, Target, Users, Zap
} from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { VisualAssetPlaceholder } from "@/components/VisualAssetPlaceholder";

const pillars = [
  { icon: Target, label: "DEMAND", title: "Capture real demand", text: "Turn website intent, social traffic, Telegram conversations and wanted requests into structured commercial demand." },
  { icon: Network, label: "MATCH", title: "Connect the right supply", text: "Match products, services, businesses and partners without exposing the internal complexity to customers." },
  { icon: Handshake, label: "PARTNER", title: "Protect contribution", text: "Carry partner attribution through referrals, opportunities, deals, orders and eligible earnings." },
  { icon: CircleDollarSign, label: "COMMERCE", title: "Complete the transaction", text: "Move from request to proposal, agreement, order, payment evidence, revenue and fulfillment." },
];

const surfaces = [
  { icon: ShoppingBag, title: "Marketplace", text: "Discover products, services and commercial offers.", href: "/marketplace" },
  { icon: MessageCircle, title: "Conversational Commerce", text: "Move discovery and buying into Telegram and human-assisted conversations.", href: "/telegram" },
  { icon: Target, title: "Wanted", text: "Publish what you need and let the commercial network respond.", href: "/wanted" },
  { icon: Users, title: "Partner Network", text: "Affiliate, referral, reseller and service-partner workflows.", href: "/partner-network" },
];

function PlatformHero() {
  return (
    <section className="platform-hero relative overflow-hidden">
      <div className="platform-hero-grid" aria-hidden="true" />
      <div className="container-aslal relative z-10 grid min-h-[720px] items-center gap-12 py-20 lg:grid-cols-[minmax(0,1.02fr)_minmax(480px,.98fr)] lg:py-24 xl:min-h-[760px]">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E2B02A]/35 bg-[#0F172A]/80 px-4 py-2 font-mono text-[10px] font-black tracking-[.2em] text-[#E2B02A] backdrop-blur-xl">
            <span className="h-2 w-2 rounded-full bg-[#E2B02A] shadow-[0_0_16px_#E2B02A]" />
            ASLAL GROWTH OS · CONNECTED COMMERCE
          </div>
          <h1 className="mt-7 max-w-3xl text-[clamp(3.2rem,6vw,6.7rem)] font-black leading-[.9] tracking-[-.065em] text-white">
            One system.
            <span className="block text-[#E2B02A]">Many simple</span>
            <span className="block">ways in.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/68 sm:text-xl">
            Customers can discover, ask, buy or talk. Businesses can capture demand and operate it. Partners can contribute and be credited. Aslal connects the journey underneath.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/growth-builder" className="inline-flex items-center gap-2 rounded-xl bg-[#E2B02A] px-6 py-4 font-black text-[#1E293B] shadow-[0_18px_55px_rgba(226,176,42,.2)] transition hover:-translate-y-1">
              Build my growth system <ArrowRight size={17} />
            </Link>
            <Link href="/marketplace" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[.06] px-6 py-4 font-bold text-white backdrop-blur-xl transition hover:border-[#E2B02A]/60 hover:text-[#E2B02A]">
              Explore the exchange
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[9px] font-black tracking-[.18em] text-white/38">
            <span>DEMAND → MATCH</span><span>ATTRIBUTION → COMMERCE</span><span>PAYMENT → INSIGHT</span>
          </div>
        </div>

        <div className="platform-hero-visual">
          <div className="platform-hero-visual-head">
            <div>
              <span className="font-mono text-[9px] font-black tracking-[.2em] text-[#E2B02A]">LIVE SYSTEM MAP</span>
              <h2 className="mt-2 text-2xl font-black text-white">The interface stays simple.</h2>
            </div>
            <span className="rounded-full border border-[#E2B02A]/25 bg-[#E2B02A]/10 px-3 py-1 font-mono text-[9px] font-black text-[#E2B02A]">CONNECTED</span>
          </div>

          <div className="platform-flow-map" aria-label="Aslal connected commerce flow">
            <div className="platform-flow-column">
              <div className="platform-flow-node"><Globe2 size={18}/><span>WEB</span></div>
              <div className="platform-flow-node"><MessageCircle size={18}/><span>CHAT</span></div>
              <div className="platform-flow-node"><QrCode size={18}/><span>PARTNER</span></div>
            </div>
            <div className="platform-flow-core">
              <div className="platform-core-ring"><Network size={25}/></div>
              <strong>GROWTH OS</strong>
              <span>Demand · Match · Commerce</span>
            </div>
            <div className="platform-flow-column">
              <div className="platform-flow-node"><Target size={18}/><span>DEMAND</span></div>
              <div className="platform-flow-node"><ShoppingBag size={18}/><span>ORDER</span></div>
              <div className="platform-flow-node"><CircleDollarSign size={18}/><span>VALUE</span></div>
            </div>
          </div>

          <VisualAssetPlaceholder label="Hero visual / architecture asset" className="mt-5 min-h-0" />
        </div>
      </div>
    </section>
  );
}

export default function PlatformPage(){
  return (
    <main className="min-h-screen overflow-hidden bg-[#070C18] text-white">
      <PlatformHero />

      <ScrollReveal>
        <section className="relative border-y border-white/10 bg-[#070C18] py-20">
          <div className="container-aslal">
            <div className="max-w-3xl">
              <span className="font-mono text-[10px] font-black tracking-[.25em] text-[#E2B02A]">PLATFORM CORE</span>
              <h2 className="mt-4 text-4xl font-black tracking-[-.04em] sm:text-5xl">One commercial network. Many simple entry points.</h2>
              <p className="mt-5 text-lg leading-8 text-white/60">Customers see products, conversations and requests. Businesses see demand and operations. Partners see opportunities and attributable contribution. The platform connects the layers underneath.</p>
            </div>
            <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {pillars.map(({icon:Icon,label,title,text},i)=>(
                <article key={label} className="group rounded-[1.75rem] border border-white/10 bg-white/[.035] p-6 backdrop-blur-xl transition hover:-translate-y-1 hover:border-[#E2B02A]/50 hover:bg-white/[.06]">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] font-black tracking-[.2em] text-[#E2B02A]">{label}</span>
                    <span className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[.06] text-white"><Icon size={20}/></span>
                  </div>
                  <h3 className="mt-8 text-xl font-black">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/55">{text}</p>
                  <div className="mt-6 flex items-center gap-2 font-mono text-[9px] text-white/35"><span>0{i+1}</span><span className="h-px flex-1 bg-white/10"/></div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="relative bg-[#0F172A] py-20">
          <div className="container-aslal">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div><span className="font-mono text-[10px] font-black tracking-[.25em] text-[#E2B02A]">LIVE SURFACES</span><h2 className="mt-3 text-3xl font-black sm:text-4xl">Enter from wherever your customer starts.</h2></div>
              <Link href="/contact" className="inline-flex items-center gap-2 font-bold text-[#E2B02A]">Talk to Aslal <ArrowRight size={16}/></Link>
            </div>
            <div className="mt-10 grid gap-3 md:grid-cols-2">
              <Link href="/partner-network" className="group rounded-2xl border border-[#E2B02A]/30 bg-[#E2B02A]/[.06] p-5 transition hover:-translate-y-1 hover:border-[#E2B02A]/70">
                <span className="font-mono text-[9px] font-black tracking-[.2em] text-[#E2B02A]">FOR INFLUENCERS & AGENTS</span>
                <h3 className="mt-2 font-black text-white">Join the partner network <ArrowRight size={15} className="ml-1 inline transition group-hover:translate-x-1"/></h3>
                <p className="mt-1 text-xs text-white/45">Register once, complete your profile and discover eligible opportunities.</p>
              </Link>
              <Link href="/partner" className="group rounded-2xl border border-white/10 bg-white/[.035] p-5 transition hover:-translate-y-1 hover:border-[#E2B02A]/50">
                <span className="font-mono text-[9px] font-black tracking-[.2em] text-[#E2B02A]">FOR BUSINESS OWNERS & SMES</span>
                <h3 className="mt-2 font-black text-white">Make your business partner-ready <ArrowRight size={15} className="ml-1 inline transition group-hover:translate-x-1"/></h3>
                <p className="mt-1 text-xs text-white/45">Publish offers and grow through controlled partner relationships.</p>
              </Link>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {surfaces.map(({icon:Icon,title,text,href})=>(
                <Link key={title} href={href} className="group rounded-2xl border border-white/10 bg-[#070C18] p-6 transition hover:-translate-y-1 hover:border-[#E2B02A]/50">
                  <Icon className="text-[#E2B02A]" size={23}/>
                  <h3 className="mt-5 font-black">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/50">{text}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-xs font-black text-white/55 group-hover:text-white">Open <ArrowRight size={14}/></span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="bg-[#070C18] py-20">
          <div className="container-aslal grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
            <div>
              <span className="font-mono text-[10px] font-black tracking-[.25em] text-[#E2B02A]">CONNECTED BY DESIGN</span>
              <h2 className="mt-4 text-4xl font-black tracking-[-.03em] sm:text-5xl">The complexity stays behind the interface.</h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/60">Demand, matching, eligibility, attribution, agreements, orders, payment evidence, commissions and reporting are system concerns—not customer vocabulary.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                {["Identity","Demand","Matching","Conversation","Commerce","Attribution","Finance","Analytics"].map(x=><span key={x} className="rounded-full border border-white/10 bg-white/[.04] px-4 py-2 text-xs font-bold text-white/60">{x}</span>)}
              </div>
            </div>
            <div className="relative rounded-[2rem] border border-[#E2B02A]/20 bg-gradient-to-br from-[#0F172A] to-[#070C18] p-7 shadow-[0_0_80px_rgba(226,176,42,.08)]">
              <div className="absolute inset-6 rounded-[1.5rem] border border-white/5"/>
              <div className="relative grid grid-cols-3 gap-3">
                {([["WEB",Globe2],["AI",BrainCircuit],["BOT",Bot],["QR",QrCode],["SAFE",ShieldCheck],["AUTO",Zap]] as const).map(([label,Icon])=>(
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/[.035] p-4 text-center">
                    <Icon className="mx-auto text-[#E2B02A]" size={19}/>
                    <span className="mt-2 block font-mono text-[9px] font-black tracking-widest text-white/40">{label}</span>
                  </div>
                ))}
              </div>
              <div className="relative mt-4 rounded-2xl border border-[#E2B02A]/25 bg-[#E2B02A]/[.06] p-5 text-center">
                <span className="font-mono text-[9px] font-black tracking-[.2em] text-[#E2B02A]">ASLAL GROWTH OS</span>
                <p className="mt-2 text-sm font-bold text-white/70">Build · Automate · Grow · Measure</p>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="border-t border-[#E2B02A]/20 bg-[#0F3E8A] py-16">
          <div className="container-aslal grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <span className="font-mono text-[10px] font-black tracking-[.2em] text-[#E2B02A]">NEXT ACTION</span>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">Start with the outcome, not the software.</h2>
              <p className="mt-3 max-w-2xl text-white/65">Use the Growth Builder for a guided starting point, or publish a specific demand directly into the exchange.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/growth-builder" className="inline-flex items-center gap-2 rounded-xl bg-[#E2B02A] px-5 py-3.5 font-black text-[#1E293B]">Build my system <ArrowRight size={16}/></Link>
              <Link href="/wanted" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/[.07] px-5 py-3.5 font-bold text-white">Publish a demand <ArrowRight size={16}/></Link>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </main>
  );
}

export const metadata: Metadata = {
  title: "Aslal Platform | Connected Growth & Commerce OS",
  description: "Explore the Aslal Growth OS: demand, commerce, partner attribution, conversational selling and commercial intelligence.",
  alternates: { canonical: "https://aslaldigital.com/platform" },
};
