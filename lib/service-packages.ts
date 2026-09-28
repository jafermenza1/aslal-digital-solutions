export type PackageFeature={id:string;name:string;description:string;included:boolean;price:number};
export type ServicePackage={id:string;name:string;tagline:string;description:string;price:number;currency:string;billing:string;features:PackageFeature[];cta:string};
export const DEFAULT_SERVICE_PACKAGES:ServicePackage[]=[
{id:"essential",name:"Essential Growth",tagline:"Build a consistent digital presence and a dependable lead flow.",description:"For Ethiopian businesses that need the foundations connected: content, social presence, lead capture and practical follow-up.",price:25000,currency:"ETB",billing:"per month",cta:"Start with Essential",features:[
{id:"social",name:"Social media management",description:"Content calendar, publishing and channel management for priority platforms.",included:true,price:7000},
{id:"content",name:"Content creation",description:"Monthly campaign copy, graphics and short-form content direction.",included:true,price:6000},
{id:"leads",name:"Lead capture & routing",description:"Website/Telegram lead capture connected to the Aslal sales workflow.",included:true,price:5000},
{id:"seo",name:"Local SEO foundation",description:"Technical basics, local search pages and Ethiopian search intent.",included:true,price:3500},
{id:"reporting",name:"Monthly growth report",description:"Clear activity, lead and next-action reporting.",included:true,price:3500},
{id:"influencer",name:"Influencer marketing",description:"Partner/influencer discovery, briefs and campaign coordination.",included:false,price:8000},
{id:"affiliate",name:"Affiliate & referral marketing",description:"Referral links, partner attribution and commission workflow.",included:false,price:7000},
{id:"ads",name:"Paid lead campaigns",description:"Meta lead-generation campaign setup and management.",included:false,price:9000},
{id:"telegram",name:"Telegram sales automation",description:"Catalog, qualification, follow-up and human handoff.",included:false,price:7000},
{id:"crm",name:"CRM sales operations",description:"Pipeline ownership, SLA follow-up and commercial workflow.",included:false,price:7000},
]},
{id:"growth",name:"Growth Engine",tagline:"Turn content and demand into a managed sales pipeline.",description:"For businesses ready to combine marketing, paid demand, partners and Aslal’s CRM/Telegram workflows.",price:45000,currency:"ETB",billing:"per month",cta:"Choose Growth Engine",features:[
{id:"social",name:"Social media management",description:"Multi-channel planning, publishing and community workflow.",included:true,price:9000},
{id:"content",name:"Content creation",description:"Campaign creative, copy and short-form video direction.",included:true,price:9000},
{id:"leads",name:"Lead capture & routing",description:"Lead capture, qualification and sales ownership in Aslal.",included:true,price:6000},
{id:"seo",name:"Local + commercial SEO",description:"Search intent, technical SEO and content opportunity work.",included:true,price:5000},
{id:"reporting",name:"Bi-weekly growth reporting",description:"Lead, campaign and commercial performance reviews.",included:true,price:4000},
{id:"influencer",name:"Influencer marketing",description:"Recruit, brief, attribute and coordinate relevant partners.",included:true,price:8000},
{id:"affiliate",name:"Affiliate & referral marketing",description:"Partner links, attribution and commission-ready workflows.",included:true,price:7000},
{id:"ads",name:"Paid lead campaigns",description:"Meta lead-generation campaign management.",included:true,price:10000},
{id:"telegram",name:"Telegram sales automation",description:"Catalog, qualification, automated follow-up and handoff.",included:true,price:7000},
{id:"crm",name:"CRM sales operations",description:"Pipeline ownership, SLA visibility and sales workflow.",included:false,price:7000},
]},
{id:"scale",name:"Scale & Revenue",tagline:"A coordinated growth and revenue operating layer.",description:"For teams that need marketing, partners, conversational sales and commercial operations working as one system.",price:75000,currency:"ETB",billing:"per month",cta:"Discuss Scale & Revenue",features:[
{id:"social",name:"Social media management",description:"Full campaign planning and channel operations.",included:true,price:11000},
{id:"content",name:"Content creation",description:"Campaign creative, copy, short-form video and conversion assets.",included:true,price:12000},
{id:"leads",name:"Lead capture & routing",description:"Multi-source lead capture and structured sales ownership.",included:true,price:7000},
{id:"seo",name:"Search Everywhere optimization",description:"SEO, local Ethiopian context, answer-ready and entity-focused content.",included:true,price:7000},
{id:"reporting",name:"Executive growth reporting",description:"Commercial, campaign, partner and pipeline reviews.",included:true,price:5000},
{id:"influencer",name:"Influencer marketing",description:"Partner sourcing, campaign management and attribution.",included:true,price:10000},
{id:"affiliate",name:"Affiliate & referral marketing",description:"Partner marketplace, referral attribution and commission workflow.",included:true,price:9000},
{id:"ads",name:"Paid lead campaigns",description:"Managed paid acquisition and optimization.",included:true,price:12000},
{id:"telegram",name:"Telegram sales automation",description:"Catalog, qualification, automation, follow-up and human handoff.",included:true,price:9000},
{id:"crm",name:"CRM + revenue operations",description:"Lead → opportunity → quote → order → payment → reconciliation workflow.",included:true,price:12000},
]}];
