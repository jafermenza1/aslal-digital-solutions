export type Locale = "en" | "am";

export const localeCookie = "aslal_locale";

export const copy = {
  en: {
    language: "አማ",
    languageName: "Amharic",
    nav: { solutions: "Solutions", products: "Products", work: "Work", lab: "Automation Lab", contact: "Contact", about: "About", resources: "Resources" },
    actions: { start: "Start a project", expert: "Talk to an expert", build: "Build my growth system", demo: "Experience automation →" },
    hero: { eyebrow: "ETHIOPIA • GROWTH ENGINEERING", title: "Digital systems that turn", highlight: "attention", end: "into growth.", body: "Aslal Digital Solutions builds websites, software, commerce systems, marketing engines and automation for businesses ready to scale." },
    graph: { label: "ASLAL GROWTH GRAPH", badge: "GROWTH MODEL", roi: "MEASURABLE ROI", flow: "BUILD → AUTOMATE → GROW" },
    difference: { eyebrow: "THE ASLAL DIFFERENCE", title: "Your website should do more than exist.", body: "We connect digital presence, products, marketing, sales and automation into one growth system—so attention has a path to revenue." },
    sections: { solutions: "Everything your growth engine needs.", automation: "Don't take our word for it. Experience the technology.", ready: "Let's design the digital system your business actually needs." },
  },
  am: {
    language: "EN",
    languageName: "English",
    nav: { solutions: "መፍትሄዎች", products: "ምርቶች", work: "ስራዎች", lab: "Automation Lab", contact: "ያግኙን", about: "ስለ እኛ", resources: "መረጃዎች" },
    actions: { start: "ፕሮጀክት ይጀምሩ", expert: "ከባለሙያ ጋር ይነጋገሩ", build: "የእድገት ስርዓቴን ይገንቡ", demo: "Automation ይሞክሩ →" },
    hero: { eyebrow: "ኢትዮጵያ • የእድገት ምህንድስና", title: "ዲጂታል ስርዓቶች ትኩረትን", highlight: "ወደ እድገት", end: "ይቀይራሉ።", body: "Aslal Digital Solutions ለሚያድጉ ንግዶች ድረ-ገጾች፣ ሶፍትዌር፣ ኢ-ኮሜርስ፣ ዲጂታል ማርኬቲንግ እና Automation ስርዓቶችን ይገነባል።" },
    graph: { label: "ASLAL የእድገት ግራፍ", badge: "የእድገት ሞዴል", roi: "የሚለካ ROI", flow: "ገንባ → አስተካክል → አሳድግ" },
    difference: { eyebrow: "የASLAL ልዩነት", title: "ድረ-ገጽዎ መኖሩ ብቻ በቂ አይደለም።", body: "ዲጂታል መገኘትን፣ ምርቶችን፣ ማርኬቲንግን፣ ሽያጭን እና Automationን በአንድ የእድገት ስርዓት እናገናኛለን—ትኩረት ወደ ገቢ እንዲመራ።" },
    sections: { solutions: "የእድገት ሞተርዎ የሚፈልገው ሁሉ።", automation: "ቃላችንን ብቻ አትመኑ። ቴክኖሎጂውን ይሞክሩ።", ready: "ለንግድዎ ትክክለኛውን ዲጂታል ስርዓት እንገንባ።" },
  },
} as const;

export function getCopy(locale: Locale = "en") { return copy[locale]; }
