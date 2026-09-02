import Link from "next/link";
import { SectionTitle } from "@/components/SectionTitle";

const products = [
  { slug: "crm-pro", name: "CRM Pro", type: "Affiliate / implementation", text: "A practical CRM foundation for managing leads, sales activity and customer follow-up." },
  { slug: "commerce-stack", name: "Commerce Stack", type: "Custom solution", text: "E-commerce, payment integration and customer journeys built around your business." },
  { slug: "sales-automation", name: "Sales Automation", type: "Custom solution", text: "Website, WhatsApp and Telegram experiences designed to qualify and convert demand." },
];

export default function ProductsPage() { return <main><section className="bg-[#F8FAFC] py-24"><div className="container-aslal"><SectionTitle eyebrow="Software marketplace" title="Proven products. Local implementation. Custom fit." description="Aslal can market, resell, implement or customize software from trusted providers. Each product page makes the relationship clear."/><div className="mt-14 grid gap-5 lg:grid-cols-3">{products.map(p=><Link key={p.slug} href={`/products/${p.slug}`} className="group rounded-[2rem] border border-slate-200 bg-white p-8 transition hover:-translate-y-1 hover:border-[#0F3E8A]/30 hover:shadow-2xl"><div className="inline-flex rounded-full bg-[#0F3E8A]/7 px-3 py-1 text-xs font-black text-[#0F3E8A]">{p.type}</div><h2 className="mt-7 text-3xl font-black">{p.name}</h2><p className="mt-4 leading-7 text-slate-600">{p.text}</p><div className="mt-8 font-black text-[#0F3E8A]">View solution →</div></Link>)}</div></div></section></main> }
