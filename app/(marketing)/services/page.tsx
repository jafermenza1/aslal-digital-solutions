import Link from "next/link";
import { SectionTitle } from "@/components/SectionTitle";

const items = [
  ["Web Experiences", "Website development, e-commerce, landing pages, web applications and customer portals."],
  ["Software Marketplace", "Sell existing or affiliated software products, then customize, integrate and implement them for clients."],
  ["Content Creation", "Campaign creative, social content, video direction, copy and conversion-focused storytelling."],
  ["E-commerce & Payments", "Commerce journeys and localized payment integration designed for the Ethiopian market."],
  ["CRM & Lead Systems", "Lead capture, sales pipelines, qualification, follow-up and reporting."],
  ["Telegram Sales Bots", "Interactive sales and qualification experiences that demonstrate automation capability."],
  ["WhatsApp Sales Automation", "Conversational sales flows and handoff to human agents."],
  ["Branding & Re-branding", "Brand systems, digital identity and consistent customer-facing experiences."],
  ["SEO", "Local and global search optimization with technical, content and commercial intent in mind."],
];

export default function ServicesPage() { return <main><section className="bg-[#0F3E8A] py-24 text-white"><div className="container-aslal"><div className="max-w-4xl"><div className="text-xs font-black uppercase tracking-[.2em] text-[#E2B02A]">Solutions</div><h1 className="mt-4 text-5xl font-black tracking-[-.05em] sm:text-7xl">One growth system. Multiple capabilities.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">From digital presence to software implementation, marketing, sales automation and search growth.</p></div></div></section><section className="py-24"><div className="container-aslal"><SectionTitle eyebrow="What we build" title="Technology and marketing connected around outcomes."/><div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{items.map(([title,desc],i)=><div key={title} className="rounded-3xl border border-slate-200 bg-white p-7 card-shadow"><div className="text-xs font-black text-[#E2B02A]">0{i+1}</div><h2 className="mt-7 text-2xl font-black">{title}</h2><p className="mt-3 leading-7 text-slate-600">{desc}</p></div>)}</div><div className="mt-14 rounded-[2rem] bg-[#F8FAFC] p-8 sm:p-12"><h2 className="text-3xl font-black">Not sure what you need?</h2><p className="mt-3 max-w-2xl leading-7 text-slate-600">Use our growth system builder and we'll turn your goals into a practical starting point.</p><Link href="/contact" className="mt-7 inline-block rounded-full bg-[#E2B02A] px-6 py-4 font-black">Build my growth system →</Link></div></div></section></main> }
