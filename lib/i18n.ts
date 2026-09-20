export type Locale = "en" | "am" | "om";

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
  om: {
    language: "AM",
    languageName: "Afaan Oromoo",
    nav: { solutions: "Furmaata", products: "Oomishaalee", work: "Hojii", lab: "Automation Lab", contact: "Nu qunnamaa", about: "Waa'ee keenya", resources: "Qabeenya" },
    actions: { start: "Pirojektii jalqabi", expert: "Ogeessa waliin haasa'i", build: "Sirna guddinaa koo ijaari", demo: "Automation yaali →" },
    hero: { eyebrow: "ITOOPHIYAA • ENGINEERING GUDDINAA", title: "Sirnoota dijitaalaa kan", highlight: "xiyyeeffannoo", end: "gara guddinaatti jijjiiran.", body: "Aslal Digital Solutions dhaabbilee guddachuu barbaadaniif marsariitii, software, e-commerce, marketing fi automation ijaara." },
    graph: { label: "ASLAL GROWTH GRAPH", badge: "GROWTH MODEL", roi: "ROI SAFARU", flow: "IJAARI → AUTOMATE GODHI → GUDDADHU" },
    difference: { eyebrow: "GARAAGARUMMAA ASLAL", title: "Marsariitiin kee jiraachuu qofa caalaa hojjechuu qaba.", body: "Argama dijitaalaa, oomisha, marketing, gurgurtaa fi automation sirna guddinaa tokko keessatti walitti hidha." },
    sections: { solutions: "Wanti sirna guddinaa kee barbaadu hundi.", automation: "Jechoota keenya qofa hin amaniin. Teeknooloojicha yaali.", ready: "Sirna dijitaalaa hojii kee dhugaa barbaadu haa ijaarru." },
  },
} as const;

export function getCopy(locale: Locale = "en") { return copy[locale]; }
