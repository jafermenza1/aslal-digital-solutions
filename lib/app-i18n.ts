import type { Locale } from "@/lib/i18n";

export type AppUiDictionary = {
  nav: { overview:string; quotes:string; leads:string; customers:string; conversations:string; emailTemplates:string; insights:string; journey:string; operations:string; partners:string; products:string; users:string; publicContent:string; publicCatalog:string; partnerPortal:string };
  groups: { work:string; intelligence:string; management:string; explore:string };
  dashboard: { eyebrow:string; welcome:string; featured:string; featuredLeadTitle:string; featuredLeadBody:string; featuredConversationTitle:string; featuredConversationBody:string; featuredOperationsTitle:string; featuredOperationsBody:string; latestDemand:string; workspaces:string; overdue:string; missingExecution:string; growthSignals:string; openPipeline:string; wonRevenue:string; visitors:string; leads:string; opportunities:string; customers:string; quickOpen:string };
  shell: { website:string; signOut:string; theme:string; language:string };
};

export const appUi: Record<Locale, AppUiDictionary> = {
  en: {
    nav:{overview:"Overview",quotes:"Quotes & negotiation",leads:"Leads & pipeline",customers:"Customers",conversations:"Conversations",emailTemplates:"Email templates",insights:"Insights",journey:"Visitor journey",operations:"Operations",partners:"Partners & commissions",products:"Product catalog",users:"Users & access",publicContent:"Website content",publicCatalog:"Public products",partnerPortal:"Partner portal"},
    groups:{work:"WORK",intelligence:"INTELLIGENCE",management:"MANAGEMENT",explore:"EXPLORE"},
    dashboard:{eyebrow:"ASLAL GROWTH OS",welcome:"Good to see you",featured:"Featured work",featuredLeadTitle:"Keep demand moving",featuredLeadBody:"Open the lead queue and clear the next actions that matter most.",featuredConversationTitle:"Stay close to customers",featuredConversationBody:"Review conversations, replies and human handoffs in one workspace.",featuredOperationsTitle:"Protect execution",featuredOperationsBody:"Check production health, follow-up tasks and automation status.",latestDemand:"Latest demand",workspaces:"Your workspaces",overdue:"Overdue actions",missingExecution:"Execution gaps",growthSignals:"High-intent signals",openPipeline:"Open pipeline",wonRevenue:"Won value",visitors:"Visitors",leads:"Leads",opportunities:"Open opportunities",customers:"Customers",quickOpen:"Open workspace"},
    shell:{website:"Website",signOut:"Sign out",theme:"Theme",language:"Language"},
  },
  am: {
    nav:{overview:"አጠቃላይ",quotes:"ዋጋ እና ድርድር",leads:"Leads & የሽያጭ መስመር",customers:"ደንበኞች",conversations:"ውይይቶች",emailTemplates:"የኢሜይል አብነቶች",insights:"ግንዛቤዎች",journey:"የጎብኚ ጉዞ",operations:"ኦፕሬሽን",partners:"አጋሮች & ኮሚሽን",products:"የምርት ካታሎግ",users:"ተጠቃሚዎች & መዳረሻ",publicContent:"የድረ-ገጽ ይዘት",publicCatalog:"የህዝብ ምርቶች",partnerPortal:"የአጋር ፖርታል"},
    groups:{work:"ሥራ",intelligence:"ግንዛቤ",management:"አስተዳደር",explore:"መመርመር"},
    dashboard:{eyebrow:"ASLAL GROWTH OS",welcome:"እንኳን ደህና መጡ",featured:"ዋና ሥራ",featuredLeadTitle:"ፍላጎትን አስቀጥል",featuredLeadBody:"የሊድ ሰልፉን ክፈት እና አስፈላጊውን ቀጣይ እርምጃ ፈጽም።",featuredConversationTitle:"ከደንበኞች ጋር ተቀራረብ",featuredConversationBody:"ውይይቶችን፣ ምላሾችን እና የሰው ማስረከብን በአንድ ቦታ ይገምግሙ።",featuredOperationsTitle:"አፈጻጸምን ጠብቅ",featuredOperationsBody:"የምርት ጤናን፣ የክትትል ሥራዎችን እና automation ሁኔታን ይመልከቱ።",latestDemand:"የቅርብ ጊዜ ፍላጎት",workspaces:"የስራ ቦታዎች",overdue:"ያለፈ እርምጃ",missingExecution:"የአፈጻጸም ክፍተቶች",growthSignals:"ከፍተኛ ፍላጎት ምልክቶች",openPipeline:"ክፍት ፓይፕላይን",wonRevenue:"የተሸነፈ ዋጋ",visitors:"ጎብኚዎች",leads:"Leads",opportunities:"ክፍት ዕድሎች",customers:"ደንበኞች",quickOpen:"የስራ ቦታ ክፈት"},
    shell:{website:"ድረ-ገጽ",signOut:"ውጣ",theme:"ገጽታ",language:"ቋንቋ"},
  },
  om: {
    nav:{overview:"Cuunfaa",quotes:"Gatii fi marii",leads:"Leads & pipeline",customers:"Maamiltoota",conversations:"Haasaawwan",emailTemplates:"Qajojjii email",insights:"Hubannoo",journey:"Imala daawwataa",operations:"Hojiiwwan",partners:"Hiriyyoota & komishinii",products:"Kaatalogii oomishaa",users:"Fayyadamtoota & hayyama",publicContent:"Qabiyyee marsariitii",publicCatalog:"Oomishaalee uummataa",partnerPortal:"Poortaalii hiriyyaa"},
    groups:{work:"HOJII",intelligence:"HUBANNOO",management:"BULCHIINSA",explore:"QORANNOO"},
    dashboard:{eyebrow:"ASLAL GROWTH OS",welcome:"Baga nagaan dhuftan",featured:"Hojii ijoo",featuredLeadTitle:"Fedhii maamilaa itti fufiinsaan sochoosi",featuredLeadBody:"Tarree leads baniitii tarkaanfii itti aanu barbaachisaa taʼe xumuri.",featuredConversationTitle:"Maamiltoota bira jiraadhu",featuredConversationBody:"Haasaawwan, deebii fi human handoff bakka tokko keessatti ilaali.",featuredOperationsTitle:"Hojii sirrii eegi",featuredOperationsBody:"Fayyaa production, hojii follow-up fi automation ilaali.",latestDemand:"Fedhii haaraa",workspaces:"Bakka hojii",overdue:"Tarkaanfii yeroo darbe",missingExecution:"Hanqina raawwii",growthSignals:"Mallattoolee fedhii olaanaa",openPipeline:"Pipeline banaa",wonRevenue:"Gatii moʼame",visitors:"Daawwattoota",leads:"Leads",opportunities:"Carraa banaa",customers:"Maamiltoota",quickOpen:"Bakka hojii bani"},
    shell:{website:"Marsariitii",signOut:"Baʼi",theme:"Bifa",language:"Afaan"},
  },
};

export function getAppUi(locale: Locale = "en") { return appUi[locale] || appUi.en; }
