import mysql from "mysql2/promise";
import { randomUUID } from "node:crypto";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const products = [
  ["crm-pro", "CRM Pro", "Aslal Digital Solutions", "AFFILIATE", "A practical customer and sales management system for growing teams.", "Connect leads, sales activity and follow-up into one workflow.", "Request quote", 1],
  ["commerce-stack", "Commerce Stack", "Aslal Digital Solutions", "CUSTOM", "E-commerce, payments and customer journeys designed around your business.", "Build a localized commerce experience with integrations and automation.", "Request quote", 1],
  ["sales-automation", "Sales Automation", "Aslal Digital Solutions", "CUSTOM", "WhatsApp, Telegram and website automation for faster lead response.", "Qualify, route and follow up with prospects across digital channels.", "Request quote", 1],
  ["web-development", "Web Development", "Aslal Digital Solutions", "OWNED", "Website development, e-commerce, landing pages, web applications and customer portals.", "Website development, e-commerce, landing pages, web applications and customer portals.", "Request quote", 1],
  ["software-marketplace", "Software Marketplace", "Aslal Digital Solutions", "AFFILIATE", "Sell existing or affiliated software products, then customize, integrate and implement them for clients.", "Sell existing or affiliated software products, then customize, integrate and implement them for clients.", "Request quote", 1],
  ["content-creation", "Content Creation", "Aslal Digital Solutions", "OWNED", "Campaign creative, social content, video direction, copy and conversion-focused storytelling.", "Campaign creative, social content, video direction, copy and conversion-focused storytelling.", "Request quote", 1],
  ["ecommerce-payments", "E-commerce & Payments", "Aslal Digital Solutions", "CUSTOM", "Commerce journeys and localized payment integration designed for the Ethiopian market.", "Commerce journeys and localized payment integration designed for the Ethiopian market.", "Request quote", 1],
  ["crm-lead-systems", "CRM & Lead Systems", "Aslal Digital Solutions", "OWNED", "Lead capture, sales pipelines, qualification, follow-up and reporting.", "Lead capture, sales pipelines, qualification, follow-up and reporting.", "Request quote", 1],

  // Aslal-owned recurring marketing packages. These are catalog records so the same
  // product -> contact -> lead -> qualification -> quote -> order workflow applies.
  ["marketing-starter", "Starter Growth Package", "Aslal Digital Solutions", "OWNED", "A focused monthly demand foundation for small businesses and new ventures.", "Build a consistent local presence, improve discoverability and establish the measurement and follow-up foundation for growth.", "15,000 ETB / month", 0],
  ["marketing-growth", "Growth Package", "Aslal Digital Solutions", "OWNED", "A full lead-generation and content engine for established businesses.", "Combine multi-platform content, Meta lead generation, customer support, SEO and reporting into one managed growth workflow.", "40,000–60,000 ETB / month", 1],
  ["marketing-market-leader", "Market Leader Package", "Aslal Digital Solutions", "OWNED", "A managed digital growth ecosystem for medium enterprises.", "Coordinate content, professional production, paid acquisition, SEO, conversion operations and ROI reporting around one commercial growth plan.", "100,000+ ETB / month", 0],

  ["addon-consultation", "Growth Consultation", "Aslal Digital Solutions", "OWNED", "A focused commercial growth consultation and action plan.", "Clarify the growth bottleneck, priority channels, offer, funnel and next actions before committing to a larger engagement.", "Request quote", 0],
  ["addon-branding", "Branding", "Aslal Digital Solutions", "OWNED", "Brand identity and positioning for a stronger market presence.", "Develop practical brand foundations that make campaigns, content and sales communication consistent.", "Request quote", 0],
  ["addon-basic-website", "Basic Website", "Aslal Digital Solutions", "OWNED", "A conversion-focused business website or landing experience.", "Create a fast, mobile-friendly website connected to Aslal lead capture and commercial follow-up.", "Request quote", 0],
  ["addon-ecommerce", "E-commerce", "Aslal Digital Solutions", "OWNED", "A commerce experience connected to products, customers and payments.", "Plan and implement an e-commerce journey that can connect demand, orders, payments and customer operations.", "Request quote", 0],
  ["addon-sales-bot", "Sales Bot", "Aslal Digital Solutions", "OWNED", "A controlled sales-assistance bot for faster response and routing.", "Automate first response and routing while preserving human handoff and the existing sales workflow.", "Request quote", 0],
  ["addon-google-maps-pro", "Google Maps Pro", "Aslal Digital Solutions", "OWNED", "Advanced Google Maps and local discovery optimization.", "Improve local search presence, business information and conversion from high-intent local searches.", "Request quote", 0],
  ["addon-seo-audit", "SEO Audit", "Aslal Digital Solutions", "OWNED", "A practical SEO audit with prioritized improvement actions.", "Identify technical, content and local-search opportunities that can improve qualified organic demand.", "Request quote", 0],
  ["addon-promo-video", "Promo Video", "Aslal Digital Solutions", "OWNED", "Conversion-focused promotional video production.", "Create campaign-ready video content aligned with the offer, audience and acquisition channel.", "Request quote", 0],
  ["addon-bulk-sms", "Bulk SMS", "Aslal Digital Solutions", "OWNED", "Permission-based bulk SMS campaign support.", "Plan and execute targeted customer communication with appropriate consent and campaign tracking.", "Request quote", 0],
  ["addon-verification", "Verification Support", "Aslal Digital Solutions", "OWNED", "Business and platform verification support.", "Prepare the required business information and guide the verification process for relevant platforms.", "Request quote", 0],
  ["addon-maintenance", "Website & System Maintenance", "Aslal Digital Solutions", "OWNED", "Ongoing maintenance for websites and digital systems.", "Keep the customer-facing digital layer updated, monitored and aligned with the active growth workflow.", "Request quote", 0],
  ["addon-crm-setup", "CRM Setup", "Aslal Digital Solutions", "OWNED", "CRM setup aligned to lead capture, sales follow-up and reporting.", "Configure customer records, stages, ownership, next actions and reporting so demand can move through one commercial workflow.", "Request quote", 0]
];

for (const [slug, name, provider, relationship, shortDescription, description, price, featured] of products) {\n  await pool.execute(\n    `INSERT INTO products (id, slug, name, provider_name, relationship_type, short_description, description, starting_price, featured)\n     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)\n     ON DUPLICATE KEY UPDATE name=VALUES(name), short_description=VALUES(short_description), description=VALUES(description), provider_name=VALUES(provider_name), relationship_type=VALUES(relationship_type), starting_price=VALUES(starting_price), featured=VALUES(featured), active=1`,\n    [randomUUID(), slug, name, provider, relationship, shortDescription, description, price, featured]\n  );\n}


// Rich positioning for the recurring Aslal-owned packages. New and existing records
// receive the same canonical copy while remaining editable from Dashboard → Products.
const packageDetails = [
  { slug: "marketing-starter", tagline: "Build the foundation for consistent local demand.", features: "Management of 2 platforms (Telegram/Instagram + Facebook)\n3 high-quality posts per week\nGoogle Maps basic optimization\nMonthly performance summary", benefits: "Consistent digital presence\nBetter local discoverability\nA clear monthly performance baseline", idealFor: "Small businesses\nNew ventures\nBusinesses establishing their first repeatable digital marketing process", deliverables: "Monthly content plan\nPublished social content\nGoogle Maps optimization actions\nMonthly performance summary", ctaLabel: "Request a Growth Plan", ctaNote: "Tell us your business, goal and current channels. Aslal will qualify the opportunity and recommend the appropriate starting scope.", sortOrder: 10 },
  { slug: "marketing-growth", tagline: "Turn attention into qualified demand and a managed sales pipeline.", features: "4-platform management: Telegram, Facebook, Instagram and TikTok\n5 posts per week + 2 TikTok/Reel video shoots\nMeta Ads and lead-generation management\nCustomer support and strategy calls\nBasic SEO\nBi-weekly reporting", benefits: "More consistent qualified demand\nCampaigns connected to lead capture\nFaster follow-up visibility\nClearer performance decisions", idealFor: "Established businesses building a brand\nBusinesses ready to invest in lead generation\nTeams that need marketing and sales execution connected", deliverables: "Content and campaign calendar\nPublished content and short-form video\nManaged Meta lead campaigns\nLead handoff into Aslal Growth OS\nBi-weekly performance review", ctaLabel: "Start Growing", ctaNote: "Request a growth consultation. Your request enters the Aslal sales workflow so scope, goals, budget and next actions can be qualified before a proposal.", sortOrder: 20 },
  { slug: "marketing-market-leader", tagline: "Operate marketing as a measurable growth system.", features: "Full digital ecosystem management\nDaily content + 2 professional video productions\nOmnichannel campaigns across Meta + Google\nAdvanced SEO and professional blog writing\nDedicated manager and 24/7 support\nWeekly ROI reporting and influencer coordination", benefits: "One coordinated acquisition system\nStronger campaign-to-revenue visibility\nDedicated execution ownership\nContinuous optimization around measurable outcomes", idealFor: "Medium enterprises\nBusinesses with multiple acquisition channels\nTeams requiring dedicated growth management", deliverables: "Integrated campaign plan\nDaily content operations\nProfessional video productions\nPaid acquisition management\nAdvanced SEO/content program\nWeekly ROI and pipeline review", ctaLabel: "Build the Market Leader Plan", ctaNote: "Request a strategic growth consultation. Aslal will map the commercial objective, acquisition channels, sales process and reporting requirements before proposing scope.", sortOrder: 30 }
];

for (const item of packageDetails) {
  await pool.execute(
    'UPDATE products SET tagline=?, features=?, benefits=?, ideal_for=?, deliverables=?, cta_label=?, cta_note=?, sort_order=?, active=1 WHERE slug=? AND relationship_type="OWNED"',
    [item.tagline, item.features, item.benefits, item.idealFor, item.deliverables, item.ctaLabel, item.ctaNote, item.sortOrder, item.slug]
  );
}
console.log("Seed complete.");
await pool.end();
