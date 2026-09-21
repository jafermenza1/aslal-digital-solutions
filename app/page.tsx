import Link from "next/link";
import { cookies } from "next/headers";
import { PlexusBackground } from "@/components/PlexusBackground";

const solutions = [
  ["CRM Pro", "Affiliate / Implementation", "A practical CRM foundation for managing leads, sales activity and follow-ups.", "/products"],
  ["Commerce Stack", "Custom Solution", "E-commerce, localized payments and connected customer journeys built around how you sell.", "/services"],
  ["Sales Automation", "Custom Solution", "Website, WhatsApp and Telegram experiences that qualify demand and move prospects toward action.", "/services"],
];

const capabilities = [
  ["01", "Web Experiences", "Websites, landing pages, e-commerce, applications and customer portals."],
  ["02", "E-commerce & Payments", "Commerce journeys and localized payment integration for the Ethiopian market."],
  ["03", "Branding & Re-branding", "Brand systems and digital identity that stay consistent across every touchpoint."],
  ["04", "CRM & Lead Systems", "Lead capture, qualification, pipelines, follow-up and reporting."],
  ["05", "WhatsApp Sales Automation", "Conversational sales flows with clear human handoffs."],
  ["06", "Telegram Sales Bots", "Interactive qualification and sales experiences."],
  ["07", "SEO", "Technical, content and commercial-intent search optimization."],
  ["08", "Content Creation", "Campaign creative, social content and conversion storytelling."],
  ["09", "Software Marketplace", "Proven software products customized, integrated and implemented for your needs."],
];

export default async function Home() {
  const c = (await cookies()).get("aslal_locale")?.value;
  return (
    <main className="landing-page">
      <div className="landing-ambient" aria-hidden="true"><PlexusBackground /><div className="ambient-fade" /></div>

      <section className="landing-hero relative isolate">
        <div className="hero-vignette" />
        <div className="container-aslal relative z-10 grid min-h-[760px] items-center gap-14 py-24 lg:grid-cols-[1.12fr_.88fr]">
          <div className="hero-copy">
            <div className="hero-kicker"><span className="status-dot" /> PROVEN PRODUCTS · LOCAL IMPLEMENTATION · CUSTOM FIT</div>
            <h1><span>Your Growth</span><strong>Partner</strong></h1>
            <p>We implement, customize and connect digital systems that capture demand, streamline payments and help businesses turn attention into revenue.</p>
            <div className="hero-actions">
              <Link href="/growth-builder" className="glow-button hero-primary">Build My Growth System <span>→</span></Link>
              <Link href="/services" className="hero-secondary">Explore Solutions</Link>
            </div>
            <div className="hero-signals"><span>CRM</span><i /> <span>COMMERCE</span><i /> <span>PAYMENTS</span><i /> <span>AUTOMATION</span><i /> <span>SEO</span></div>
          </div>

          <div className="hero-system">
            <div className="system-top"><div><small>ASLAL GROWTH SYSTEM</small><h2>Demand <span>→</span> Revenue</h2></div><b>LIVE MODEL</b></div>
            <div className="system-flow">{["Attract","Capture","Qualify","Automate","Convert","Retain"].map((x,i)=><div key={x} className={i===5 ? "active" : ""}><em>0{i+1}</em><strong>{x}</strong></div>)}</div>
            <div className="system-outcome"><div><small>OUTCOME ARCHITECTURE</small><strong>Attention → action → growth</strong></div><span>ROI</span><div className="progress"><i /></div></div>
          </div>
        </div>
        <div className="hero-bottom-glow" />
      </section>

      <section className="landing-section light-section">
        <div className="container-aslal">
          <div className="section-heading"><span>SOLUTIONS BUILT FOR YOUR BUSINESS REALITY</span><h2>Connected systems without the custom-build price tag.</h2><p>We partner with trusted providers and combine proven tools with local implementation and custom fit.</p></div>
          <div className="solution-grid">{solutions.map(([title,tag,desc,href])=><Link href={href} key={title} className="solution-card"><span>{tag}</span><h3>{title}</h3><p>{desc}</p><b>View solution <i>→</i></b></Link>)}</div>
        </div>
      </section>

      <section className="landing-section capability-section">
        <div className="container-aslal">
          <div className="section-heading section-heading-light"><span>THE ENGINE / CAPABILITIES</span><h2>Everything you need to scale, under one roof.</h2><p>Nine connected capabilities across digital presence, commerce, sales automation, traffic, content and software.</p></div>
          <div className="capability-grid">{capabilities.map(([n,title,desc])=><div key={n} className="capability-card"><em>{n}</em><h3>{title}</h3><p>{desc}</p></div>)}</div>
        </div>
      </section>

      <section className="landing-section trust-section">
        <div className="container-aslal trust-inner"><div><span>TRUST & EXECUTION</span><h2>Local context. Technical precision. Connected execution.</h2></div><div className="trust-pills"><b>LOCAL</b><b>TRUSTED</b><b>CONNECTED</b><b>MEASURABLE</b></div></div>
      </section>

      <section id="growth-builder" className="landing-section builder-section">
        <div className="container-aslal builder-inner"><div><span>NOT SURE EXACTLY WHAT YOU NEED?</span><h2>Start with the bottleneck.</h2><p>The Growth System Builder turns what is holding you back into a practical starting point for your business.</p></div><Link href="/growth-builder">Build My Growth System <span>→</span></Link></div>
      </section>
      <div className="landing-end-fade" aria-hidden="true" />
    </main>
  );
}
