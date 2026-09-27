import Link from "next/link";
import { cookies } from "next/headers";
import {
  ArrowRight, BarChart3, Bot, CheckCircle2, CreditCard,
  Mail, MessageCircle, Send, ShoppingCart, Sparkles, TrendingUp, Workflow
} from "lucide-react";
import { AslalInteractiveHero } from "@/components/AslalInteractiveHero";
import { HomeRoiEstimator } from "@/components/HomeRoiEstimator";
import { localeCookie, normalizeLocale, type Locale } from "@/lib/i18n";
import { getPageContent } from "@/lib/public-content";

const landingCopy: Record<Locale, {
  painEyebrow:string; painTitle:string; painBody:string;
  pain:[string,string,string][];
  mathTitle:string; mathBody:string; visitors:string; aov:string; current:string; lift:string; estimate:string; claim:string;
  resourcesTitle:string; resourcesBody:string; resourcesCta:string; portfolio:string; automationLab:string;
  resource1:[string,string,string]; resource2:[string,string,string];
  modelEyebrow:string; modelTitle:string; modelBody:string; model:[string,string][];
  ctaTitle:string; ctaBody:string; audit:string; telegram:string; whatsapp:string; email:string;
  offersEyebrow:string; offersTitle:string; offersBody:string;
  offers:[string,string,string,string][];
}> = {
  en: {
    painEyebrow:"01 — THE COMMERCIAL GAP",
    painTitle:"Sound painfully familiar?",
    painBody:"Many businesses have the pieces, but the pieces do not work as one customer journey.",
    pain:[
      ["The payment drop-off","Customers want to buy, but payment, order and follow-up can become disconnected. Aslal helps connect commerce journeys and localized payment planning.","Payment"],
      ["The conversation black hole","Leads arrive through forms, WhatsApp or Telegram, but without structured capture and ownership, serious demand can disappear.","Conversation"],
      ["The vanity metric trap","Traffic and engagement can look healthy while sales teams lack a clear path from interest to qualified opportunity and measurable revenue.","Measurement"]
    ],
    mathTitle:"Let’s look at the math.",
    mathBody:"Use the estimator as a planning tool. It illustrates the commercial impact of moving from disconnected activity toward a connected conversion system; it is not a revenue guarantee.",
    visitors:"Monthly website visitors", aov:"Average order value (ETB)", current:"Illustrative current monthly revenue", lift:"Illustrative annual uplift", estimate:"Illustrative scenario", claim:"Build my growth system",
    resourcesTitle:"Not ready to talk yet?", resourcesBody:"Start with practical Aslal resources and tools. Learn how local commerce, conversational sales and growth systems can fit together.", resourcesCta:"View all resources", portfolio:"View portfolio", automationLab:"Open Automation Lab",
    resource1:["Implementation guide","Localized Payment Blueprint","Plan Telebirr, Chapa and other local payment journeys around order states, callbacks, reconciliation and customer confirmation.","/resources/ethiopian-ecommerce-payment-integration-manual"],
    resource2:["Automation guide","WhatsApp & Telegram Sales Blueprint","Map qualification, routing and human handoff so conversations become managed demand instead of isolated chats.","/resources/whatsapp-telegram-conversational-sales-blueprint"],
    modelEyebrow:"03 — THE ASLAL MODEL", modelTitle:"One commercial thread from first touch to customer value.", modelBody:"Marketing creates demand. Growth systems capture and qualify it. Sales follows up. Commerce completes the order. Reconciliation connects collected funds to recognized revenue and eligible commission.", model:[
      ["Attract","Content, campaigns, SEO and digital presence"],
      ["Capture","Forms, WhatsApp, Telegram and identifiable demand"],
      ["Qualify","Lead ownership, qualification and next actions"],
      ["Convert","Quotes, orders, payment and reconciliation"],
      ["Recognize","Collected funds become recognized revenue"],
      ["Measure","Pipeline, revenue, commission and reporting"]
    ],
    ctaTitle:"Let’s fix your funnel.", ctaBody:"Start with the bottleneck. We can map the practical digital system around it and connect the right people, channels and workflows.", audit:"Build a 30-minute system audit", telegram:"Chat on Telegram", whatsapp:"Chat on WhatsApp", email:"Email Aslal",
    offersEyebrow:"02 — WHAT YOU CAN BUY", offersTitle:"Start with a service, package or product. Grow into a system.", offersBody:"Choose a focused capability when you know what you need, or use the Growth System Builder when you want Aslal to map the right starting scope.", offers:[
      ["Marketing Packages","Starter, Growth and Market Leader packages for consistent demand generation and managed growth.","/products/marketing-growth","Explore package"],
      ["Products & Solutions","Software, web, CRM, commerce and implementation offers with dedicated explanation pages.","/products","Explore products"],
      ["Aslal Services","Custom digital, automation, branding, SEO and customer-system capabilities.","/services","Explore services"],
      ["Automation Lab","Interactive WhatsApp and Telegram sales experiences with human handoff.","/automation-lab","Try automation"]
    ]
  },
  am: {
    painEyebrow:"01 — የንግድ ክፍተቱ", painTitle:"ይህ ችግር የሚያውቁት ይመስላል?", painBody:"ብዙ ንግዶች የሚያስፈልጉት መሳሪያዎች አሏቸው፤ ነገር ግን መሳሪያዎቹ እንደ አንድ የደንበኛ ጉዞ አይሰሩም።",
    pain:[["የክፍያ መቋረጥ","ደንበኞች መግዛት ይፈልጋሉ፤ ነገር ግን ክፍያ፣ ትዕዛዝ እና ክትትል ሊለያዩ ይችላሉ።","ክፍያ"],["የውይይት ጥቁር ጉድጓድ","እርሳስ በፎርም፣ WhatsApp ወይም Telegram ይመጣል፤ የተደራጀ መመዝገብና ባለቤትነት ከሌለ የጠነከረ ፍላጎት ሊጠፋ ይችላል።","ውይይት"],["የቫኒቲ መለኪያ ወጥመድ","ትራፊክና ተሳትፎ ጥሩ ቢመስሉም የሽያጭ ቡድን ፍላጎትን ወደ ተለየ እድልና የሚለካ ገቢ የሚያመራ መንገድ ሊያጣ ይችላል።","መለኪያ"]],
    mathTitle:"ሂሳቡን እንመልከት።", mathBody:"ይህን አስሊያ ለዕቅድ ይጠቀሙ። ከተለያዩ ተግባራት ወደ ተገናኘ የሽያጭ ስርዓት መሄድ የንግድ ተፅዕኖን ያሳያል፤ የገቢ ዋስትና አይደለም።",
    visitors:"ወርሃዊ የድረ-ገጽ ጎብኚዎች", aov:"አማካይ የትዕዛዝ ዋጋ (ETB)", current:"የምሳሌ ወርሃዊ ገቢ", lift:"የምሳሌ ዓመታዊ ጭማሪ", estimate:"የምሳሌ ሁኔታ", claim:"የእድገት ስርዓቴን ገንባ",
    resourcesTitle:"አሁን ለመነጋገር ዝግጁ አይደሉም?", resourcesBody:"በተግባር የተመሰረቱ የAslal መረጃዎችንና መሳሪያዎችን ይጀምሩ።", resourcesCta:"ሁሉንም መረጃዎች ይመልከቱ", portfolio:"ስራዎችን ይመልከቱ", automationLab:"Automation Lab ይክፈቱ",
    resource1:["የአፈጻጸም መመሪያ","የአካባቢ ክፍያ መመሪያ","Telebirr፣ Chapa እና ሌሎች የአካባቢ ክፍያዎችን ከትዕዛዝ፣ ማስረጃና ማስታረቅ ጋር ያቅዱ።","/resources/ethiopian-ecommerce-payment-integration-manual"],
    resource2:["የAutomation መመሪያ","WhatsApp & Telegram የሽያጭ መመሪያ","መመዝገብን፣ መመደብን እና ወደ ሰው ማስተላለፍን ያደራጁ።","/resources/whatsapp-telegram-conversational-sales-blueprint"],
    modelEyebrow:"03 — የASLAL ሞዴል", modelTitle:"ከመጀመሪያ ግንኙነት እስከ ደንበኛ እሴት አንድ የንግድ መስመር።", modelBody:"ማርኬቲንግ ፍላጎትን ይፈጥራል። የእድገት ስርዓት ይመዘግባልና ይመድባል። ሽያጭ ይከታተላል። ንግድ ትዕዛዙን ያጠናቅቃል። ማስታረቅ የተሰበሰበውን ገንዘብ ከተመዘገበ ገቢ ጋር ያገናኛል።", model:[["ማሳብ","ይዘት፣ ዘመቻ፣ SEO እና ዲጂታል መገኘት"],["መመዝገብ","ፎርም፣ WhatsApp፣ Telegram እና የታወቀ ፍላጎት"],["መመደብ","የLead ባለቤትነትና ቀጣይ እርምጃ"],["መቀየር","Quote፣ order፣ payment እና reconciliation"],["ገቢ ማስመዝገብ","የተሰበሰበ ገንዘብ ወደ ታወቀ ገቢ"],["መለካት","Pipeline፣ revenue፣ commission እና reporting"]],
    ctaTitle:"የሽያጭ መንገድዎን እናስተካክል።", ctaBody:"ከዋናው ችግር ይጀምሩ። ትክክለኛውን ሰው፣ ቻናል እና የስራ ሂደት እናገናኛለን።", audit:"የ30 ደቂቃ ስርዓት ግምገማ", telegram:"በTelegram ያነጋግሩ", whatsapp:"በWhatsApp ያነጋግሩ", email:"በኢሜይል ያነጋግሩ",
    offersEyebrow:"02 — ምን መግዛት ይችላሉ", offersTitle:"በአገልግሎት፣ በፓኬጅ ወይም በምርት ይጀምሩ። ወደ ስርዓት ያሳድጉ።", offersBody:"የሚፈልጉትን ካወቁ ቀጥተኛ አቅም ይምረጡ፤ ካልሆነ Growth System Builder ይጠቀሙ።", offers:[["የማርኬቲንግ ፓኬጆች","Starter፣ Growth እና Market Leader ለተከታታይ የፍላጎት ፈጠራ።","/products/marketing-growth","ፓኬጅ ይመልከቱ"],["ምርቶችና መፍትሄዎች","Software፣ web፣ CRM፣ commerce እና implementation አቅርቦቶች።","/products","ምርቶች ይመልከቱ"],["የAslal አገልግሎቶች","ዲጂታል፣ automation፣ branding፣ SEO እና customer-system አቅሞች።","/services","አገልግሎቶች ይመልከቱ"],["Automation Lab","WhatsApp እና Telegram የሽያጭ ልምዶች ከሰው ማስተላለፍ ጋር።","/automation-lab","Automation ይሞክሩ"]]
  },
  ar: {
    painEyebrow:"01 — الفجوة التجارية", painTitle:"هل يبدو هذا مألوفًا؟", painBody:"لدى كثير من الشركات الأدوات المطلوبة، لكنها لا تعمل كرحلة عميل واحدة.", pain:[["تعثر الدفع","قد يرغب العميل في الشراء، لكن الدفع والطلب والمتابعة تصبح منفصلة.","الدفع"],["فجوة المحادثات","تصل العملاء المحتملون عبر النماذج أو WhatsApp أو Telegram، لكن غياب التنظيم قد يفقد الطلب الجاد.","المحادثة"],["فخ المقاييس السطحية","قد تبدو الزيارات والتفاعل جيدة بينما لا يملك فريق المبيعات مسارًا واضحًا نحو فرصة مؤهلة وإيراد قابل للقياس.","القياس"]], mathTitle:"لننظر إلى الأرقام.", mathBody:"استخدم الحاسبة للتخطيط. إنها توضح أثر الانتقال إلى نظام تحويل مترابط وليست ضمانًا للإيرادات.", visitors:"زوار الموقع شهريًا", aov:"متوسط قيمة الطلب (ETB)", current:"الإيراد الشهري التقديري", lift:"الزيادة السنوية التقديرية", estimate:"سيناريو توضيحي", claim:"ابنِ نظام النمو الخاص بي", resourcesTitle:"لست مستعدًا للحديث بعد؟", resourcesBody:"ابدأ بموارد وأدوات Aslal العملية.", resourcesCta:"عرض كل الموارد", portfolio:"استكشف أعمالنا", automationLab:"افتح مختبر الأتمتة", resource1:["دليل التنفيذ","مخطط المدفوعات المحلية","خطط لرحلات Telebirr وChapa والمدفوعات المحلية حول الطلب والتسوية والتأكيد.","/resources/ethiopian-ecommerce-payment-integration-manual"], resource2:["دليل الأتمتة","مخطط مبيعات WhatsApp وTelegram","صمّم التأهيل والتوجيه والتحويل إلى الموظف البشري.","/resources/whatsapp-telegram-conversational-sales-blueprint"], modelEyebrow:"03 — نموذج ASLAL", modelTitle:"مسار تجاري واحد من أول تفاعل إلى قيمة العميل.", modelBody:"التسويق يصنع الطلب، والنظام يلتقطه ويؤهله، والمبيعات تتابع، والتجارة تكمل الطلب، والتسوية تربط الأموال المحصلة بالإيراد المسجل.", model:[["جذب","المحتوى والحملات وSEO والحضور الرقمي"],["التقاط","النماذج وWhatsApp وTelegram والطلب المعروف"],["تأهيل","ملكية العميل المحتمل والخطوة التالية"],["تحويل","العروض والطلبات والدفع والتسوية"],["تسجيل","تحويل الأموال المحصلة إلى إيراد مسجل"],["قياس","خط المبيعات والإيراد والعمولة والتقارير"]], ctaTitle:"لنصلح مسار المبيعات.", ctaBody:"ابدأ بالمشكلة الأساسية وسنحدد النظام العملي المناسب.", audit:"مراجعة نظام لمدة 30 دقيقة", telegram:"تحدث معنا عبر Telegram", whatsapp:"تحدث معنا عبر WhatsApp", email:"راسل Aslal", offersEyebrow:"02 — ما يمكنك شراؤه", offersTitle:"ابدأ بخدمة أو حزمة أو منتج. ثم حوّله إلى نظام.", offersBody:"اختر القدرة التي تعرف أنك تحتاجها أو استخدم Growth System Builder لتحديد نقطة البداية.", offers:[["حزم التسويق","حزم Starter وGrowth وMarket Leader لتوليد الطلب.","/products/marketing-growth","استكشف الحزمة"],["المنتجات والحلول","برمجيات وويب وCRM وتجارة وتنفيذ.","/products","استكشف المنتجات"],["خدمات Aslal","رقمنة وأتمتة وهوية وSEO وأنظمة العملاء.","/services","استكشف الخدمات"],["مختبر الأتمتة","تجارب مبيعات عبر WhatsApp وTelegram مع تحويل بشري.","/automation-lab","جرّب الأتمتة"]]
  },
  om: {
    painEyebrow:"01 — GIDDUU GURGURTAA", painTitle:"Kun siif beekamaa fakkaataa?", painBody:"Dhaabbileen hedduun meeshaalee barbaachisan qabu; garuu meeshaaleen sun imala maamilaa tokkootti wal hin hidhaman.", pain:[["Kaffaltii irratti addaan cituu","Maamilaan bituu barbaada, garuu kaffaltii, ajaja fi hordoffiin wal irraa cituu danda'u.","Kaffaltii"],["Hidhaa haasawa","Lead'n form, WhatsApp ykn Telegram irraa dhufa; sirna galmee fi abbummaa malee fedhiin cimaa baduu danda'a.","Haasawa"],["Tuuta lakkoofsota qofa","Traffic fi engagement gaarii fakkaachuu danda'u; garuu gurgurtaan gara opportunity fi galii safaramutti karaa ifa ta'e dhabuu danda'a.","Safartuu"]], mathTitle:"Herrega haa ilaallu.", mathBody:"Meeshaa karooraaf fayyadami. Bu'aa fakkeenyummaa agarsiisa malee waadaa galii miti.", visitors:"Daawwattoota marsariitii ji'aa", aov:"Gatii ajaja giddu-galeessaa (ETB)", current:"Galii ji'aa fakkeenyummaa", lift:"Dabala waggaa fakkeenyummaa", estimate:"Haala fakkeenyummaa", claim:"Sirna guddinaa koo ijaari", resourcesTitle:"Amma haasa'uuf qophaa'aa miti?", resourcesBody:"Qabeenya fi meeshaalee Aslal hojii irra oolan irraa jalqabi.", resourcesCta:"Qabeenya hunda ilaali", portfolio:"Hojii ilaali", automationLab:"Automation Lab bani", resource1:["Qajeelfama hojii","Qajeelfama kaffaltii naannoo","Telebirr, Chapa fi kaffaltii naannoo ajaja fi reconciliation waliin karoorsi.","/resources/ethiopian-ecommerce-payment-integration-manual"], resource2:["Qajeelfama automation","WhatsApp & Telegram Sales Blueprint","Qualification, routing fi gara namaatti dabarsuu sirreessi.","/resources/whatsapp-telegram-conversational-sales-blueprint"], modelEyebrow:"03 — MOODELA ASLAL", modelTitle:"Hariiroo daldalaa tokko tuqaa jalqabaa irraa hanga gatii maamilaa.", modelBody:"Marketing fedhii uuma. Sirni guddinaa qabee qulqulleessa. Sales hordofa. Commerce ajaja xumura. Reconciliation maallaqa walitti qabame galii beekametti hidha.", model:[["Harkisuu","Content, campaign, SEO fi argama dijitaalaa"],["Qabachuu","Form, WhatsApp, Telegram fi fedhii beekamaa"],["Qulqulleessuu","Abbummaa lead fi tarkaanfii itti aanu"],["Jijjiiruu","Quote, order, payment fi reconciliation"],["Galii galmeessuu","Maallaqa walitti qabame gara galii beekametti"],["Safaruu","Pipeline, revenue, commission fi reporting"]], ctaTitle:"Funnel kee haa sirreessinu.", ctaBody:"Rakkoo ijoo irraa jalqabi; sirna dijitaalaa, namoota, chaanaalii fi workflow sirrii walitti hidha.", audit:"Qorannoo sirnaa daqiiqaa 30", telegram:"Telegram irratti haasa'i", whatsapp:"WhatsApp irratti haasa'i", email:"Email Aslal", offersEyebrow:"02 — MAAL BITUU DANDEESSA", offersTitle:"Tajaajila, paakeejii ykn oomisha irraa jalqabi. Gara sirnaatti guddadhu.", offersBody:"Wanta barbaaddu yoo beekte filadhu; yoo hin beekne Growth System Builder fayyadami.", offers:[["Paakeejii Marketing","Starter, Growth fi Market Leader fedhii uumuu fi guddinaaf.","/products/marketing-growth","Paakeejii ilaali"],["Oomisha fi Furmaata","Software, web, CRM, commerce fi implementation.","/products","Oomisha ilaali"],["Tajaajila Aslal","Digital, automation, branding, SEO fi customer systems.","/services","Tajaajila ilaali"],["Automation Lab","Muuxannoo gurgurtaa WhatsApp fi Telegram nama waliin dabarsu.","/automation-lab","Automation yaali"]]
  }
};

const whatsappNumber = process.env.WHATSAPP_NUMBER || "251911276682";
const telegramUsername = process.env.TELEGRAM_BOT_USERNAME?.replace(/^@/, "") || "";
const email = "info@aslaldigital.com";

export default async function Home() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get(localeCookie)?.value);
  const t = landingCopy[locale];
  const content = await getPageContent("/");
  return (
    <main className="landing-page bg-[#F8FAFC] text-[#1E293B]">
      <AslalInteractiveHero content={heroContent}/>

      <section className="landing-section bg-white" aria-labelledby="pain-title">
        <div className="container-aslal">
          <div className="section-heading max-w-3xl">
            <span className="text-[10px] font-black tracking-[.2em] text-[#0F3E8A]">{t.painEyebrow}</span>
            <h2 id="pain-title" className="mt-3 text-4xl font-black tracking-tight text-[#1E293B] md:text-5xl">{t.painTitle}</h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">{t.painBody}</p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {t.pain.map(([title,text,badge],i) => {
              const Icon = i === 0 ? CreditCard : i === 1 ? MessageCircle : TrendingUp;
              return <article key={title} className="group relative overflow-hidden rounded-[1.7rem] border border-slate-200 bg-[#F8FAFC] p-7 shadow-sm transition hover:-translate-y-1 hover:border-[#0F3E8A]/30 hover:shadow-xl">
                <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-[#0F3E8A]/[.05] blur-2xl"/>
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F3E8A] text-[#E2B02A]"><Icon size={23}/></div>
                <span className="mt-6 inline-flex rounded-full bg-[#E2B02A]/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#7a5b00]">{badge}</span>
                <h3 className="mt-4 text-xl font-black text-[#1E293B]">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
              </article>;
            })}
          </div>
        </div>
      </section>

      <section className="landing-section bg-[#F8FAFC]" aria-labelledby="offers-title">
        <div className="container-aslal">
          <div className="section-heading max-w-3xl">
            <span className="text-[10px] font-black tracking-[.2em] text-[#0F3E8A]">{t.offersEyebrow}</span>
            <h2 id="offers-title" className="mt-3 text-4xl font-black tracking-tight text-[#1E293B] md:text-5xl">{t.offersTitle}</h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">{t.offersBody}</p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {t.offers.map(([title,text,href,cta],i) => {
              const Icon = i===0 ? Sparkles : i===1 ? ShoppingCart : i===2 ? Workflow : Bot;
              return <Link key={title} href={href} className="group rounded-[1.7rem] border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-[#E2B02A] hover:shadow-xl">
                <div className="flex items-center justify-between"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#0F3E8A] text-white"><Icon size={20}/></span><ArrowRight className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#E2B02A]" size={19}/></div>
                <h3 className="mt-7 text-xl font-black text-[#1E293B] group-hover:text-[#0F3E8A]">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-[#0F3E8A] group-hover:text-[#E2B02A]">{cta}<ArrowRight size={15}/></span>
              </Link>;
            })}
          </div>
        </div>
      </section>

      <section className="landing-section bg-white" aria-labelledby="math-title">
        <div className="container-aslal">
          <div className="section-heading max-w-3xl">
            <span className="text-[10px] font-black tracking-[.2em] text-[#0F3E8A]">{t.estimate}</span>
            <h2 id="math-title" className="mt-3 text-4xl font-black tracking-tight text-[#1E293B] md:text-5xl">{t.mathTitle}</h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">{t.mathBody}</p>
          </div>
          <HomeRoiEstimator t={t}/>
        </div>
      </section>

      <section className="landing-section bg-[#F8FAFC]" aria-labelledby="model-title">
        <div className="container-aslal grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
          <div className="section-heading">
            <span className="text-[10px] font-black tracking-[.2em] text-[#0F3E8A]">{t.modelEyebrow}</span>
            <h2 id="model-title" className="mt-3 text-4xl font-black tracking-tight text-[#1E293B] md:text-5xl">{t.modelTitle}</h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">{t.modelBody}</p>
            <Link href="/growth-builder" className="mt-7 inline-flex items-center gap-2 font-black text-[#0F3E8A] hover:text-[#E2B02A]">{t.claim}<ArrowRight size={17}/></Link>
          </div>
          <div className="relative rounded-[2rem] bg-[#0F3E8A] p-6 shadow-2xl sm:p-8">
            <div className="absolute left-10 right-10 top-1/2 hidden h-px bg-white/15 lg:block"/>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {t.model.map(([title,text],i)=> <div key={title} className="relative z-10 rounded-2xl border border-white/10 bg-white/[.07] p-5 backdrop-blur-sm">
                <div className="flex items-center gap-3"><span className="font-mono text-xs font-black text-[#E2B02A]">0{i+1}</span><CheckCircle2 size={17} className="text-[#E2B02A]"/></div>
                <h3 className="mt-4 font-black text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-white/60">{text}</p>
              </div>)}
            </div>
            <div className="mt-5 flex items-center justify-center gap-3 rounded-2xl bg-[#071F47] p-4 text-xs font-black tracking-widest text-white"><Workflow size={16} className="text-[#E2B02A]"/> BUILD <ArrowRight size={13}/> AUTOMATE <ArrowRight size={13}/> GROW <ArrowRight size={13}/> MEASURE</div>
          </div>
        </div>
      </section>

      <section className="landing-section bg-white" aria-labelledby="resources-title">
        <div className="container-aslal">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="section-heading max-w-3xl">
              <span className="text-[10px] font-black tracking-[.2em] text-[#0F3E8A]">04 — RESOURCES</span>
              <h2 id="resources-title" className="mt-3 text-4xl font-black tracking-tight text-[#1E293B] md:text-5xl">{t.resourcesTitle}</h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">{t.resourcesBody}</p>
            </div>
            <Link href="/resources" className="inline-flex shrink-0 items-center gap-2 font-black text-[#0F3E8A] hover:text-[#E2B02A]">{t.resourcesCta}<ArrowRight size={17}/></Link>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {[t.resource1,t.resource2].map(([eyebrow,title,text,href],i)=><Link key={title} href={href} className="group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-[#F8FAFC] p-8 transition hover:-translate-y-1 hover:border-[#0F3E8A]/30 hover:shadow-xl">
              <div className="absolute right-4 top-4 opacity-[.06] transition group-hover:opacity-[.12]">{i===0?<CreditCard size={120}/>:<MessageCircle size={120}/>}</div>
              <span className="relative text-[10px] font-black uppercase tracking-[.18em] text-[#0F3E8A]">{eyebrow}</span>
              <h3 className="relative mt-4 pr-12 text-2xl font-black text-[#1E293B]">{title}</h3>
              <p className="relative mt-3 max-w-xl text-sm leading-7 text-slate-600">{text}</p>
              <span className="relative mt-7 inline-flex items-center gap-2 font-black text-[#0F3E8A] group-hover:text-[#E2B02A]">Open resource <ArrowRight size={16}/></span>
            </Link>)}
          </div>
        </div>
      </section>

      <section className="landing-section bg-[#0F3E8A] text-white" aria-labelledby="cta-title">
        <div className="container-aslal">
          <div className="mx-auto max-w-4xl text-center">
            <span className="text-[10px] font-black tracking-[.2em] text-[#E2B02A]">05 — NEXT ACTION</span>
            <h2 id="cta-title" className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">{t.ctaTitle}</h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/70">{t.ctaBody}</p>
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/growth-builder" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E2B02A] px-6 py-4 font-black text-[#1E293B] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#efd05b]">{t.audit}<ArrowRight size={17}/></Link>
              <a href={telegramUsername ? `https://t.me/${telegramUsername}` : "https://t.me/"} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-4 font-bold text-white transition hover:border-[#E2B02A] hover:text-[#E2B02A]"><Send size={17}/>{t.telegram}</a>
              <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi Aslal, I want to discuss my growth system.")}`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-4 font-bold text-white transition hover:border-[#E2B02A] hover:text-[#E2B02A]"><MessageCircle size={17}/>{t.whatsapp}</a>
              <a href={`mailto:${email}`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-4 font-bold text-white transition hover:border-[#E2B02A] hover:text-[#E2B02A]"><Mail size={17}/>{t.email}</a>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-[#F8FAFC] py-10">
        <div className="container-aslal flex flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left">
          <div><span className="text-xs font-black tracking-[.2em] text-[#0F3E8A]">ASLAL DIGITAL SOLUTIONS</span><p className="mt-2 text-sm text-slate-500">BUILD · AUTOMATE · GROW · MEASURE</p></div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-bold text-slate-500"><BarChart3 size={18} className="text-[#0F3E8A]"/> <span>Growth systems</span><span>•</span><span>Commerce</span><span>•</span><span>Automation</span><span>•</span><span>Customer systems</span></div>
        </div>
      </section>
    </main>
  );
}
