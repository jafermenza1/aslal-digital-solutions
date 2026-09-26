export type MarketingService = {
  slug: string;
  name: string;
  description: string;
  details: string;
  outcomes: string[];
  cta: string;
};

export const marketingServices: MarketingService[] = [
  { slug: "web-experiences", name: "Web Experiences", description: "Websites, e-commerce, landing pages, web applications and customer portals.", details: "We design and build practical digital experiences that make it easier for customers to discover, trust and act.", outcomes: ["Clear customer journeys", "Mobile-ready experiences", "Conversion-focused landing pages", "Maintainable implementation"], cta: "Request a web growth plan" },
  { slug: "software-marketplace", name: "Software Marketplace", description: "Existing or affiliated software products, customized, integrated and implemented for your business.", details: "Choose proven software and let Aslal handle evaluation, implementation, customization and commercial handoff.", outcomes: ["Product matching", "Implementation support", "Integration planning", "Local business guidance"], cta: "Request a software consultation" },
  { slug: "content-creation", name: "Content Creation", description: "Campaign creative, social content, video direction, copy and conversion-focused storytelling.", details: "Content is planned around your commercial goal, audience and next action rather than simply publishing more posts.", outcomes: ["Content planning", "Social creative", "Short-form video direction", "Conversion-focused copy"], cta: "Request a content plan" },
  { slug: "ecommerce-payments", name: "E-commerce & Payments", description: "Commerce journeys and localized payment integration designed for the Ethiopian market.", details: "Connect discovery, product selection, checkout and payment experiences into a practical customer journey.", outcomes: ["Commerce journey design", "Payment integration planning", "Order-flow alignment", "Operational handoff"], cta: "Discuss your commerce journey" },
  { slug: "crm-lead-systems", name: "CRM & Lead Systems", description: "Lead capture, sales pipelines, qualification, follow-up and reporting.", details: "Connect marketing demand to sales execution so leads become managed opportunities instead of isolated submissions.", outcomes: ["Lead capture", "Qualification workflow", "Sales ownership", "Pipeline visibility"], cta: "Request a CRM growth plan" },
  { slug: "telegram-sales-bots", name: "Telegram Sales Bots", description: "Interactive sales and qualification experiences with automation and human handoff.", details: "Automate repetitive qualification while preserving a clear route to a salesperson when human action is needed.", outcomes: ["Guided qualification", "Automated responses", "Human handoff", "Follow-up readiness"], cta: "Discuss Telegram automation" },
  { slug: "whatsapp-sales-automation", name: "WhatsApp Sales Automation", description: "Conversational sales flows with structured qualification and human handoff.", details: "Build customer conversations around intent, qualification and the next commercial action.", outcomes: ["Conversation flows", "Qualification prompts", "Human handoff", "Lead attribution"], cta: "Discuss WhatsApp automation" },
  { slug: "branding-rebranding", name: "Branding & Re-branding", description: "Brand systems, digital identity and consistent customer-facing experiences.", details: "Create a consistent identity that can be carried across your website, campaigns, sales materials and customer touchpoints.", outcomes: ["Brand direction", "Visual identity", "Digital consistency", "Sales-ready assets"], cta: "Request a branding consultation" },
  { slug: "seo", name: "SEO", description: "Local and global search optimization aligned to technical, content and commercial intent.", details: "Improve discoverability around the searches that matter to your customers and commercial goals.", outcomes: ["Technical SEO", "Local search optimization", "Content opportunities", "Performance reporting"], cta: "Request an SEO assessment" },
];

export function getMarketingService(slug: string) {
  return marketingServices.find((service) => service.slug === slug);
}
