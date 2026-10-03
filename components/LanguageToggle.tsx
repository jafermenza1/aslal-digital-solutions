"use client";

import { useTransition } from "react";
import { nextLocale, shortLocale, type Locale } from "@/lib/i18n";

export function LanguageToggle({locale}:{locale:Locale}){
 const [pending,startTransition]=useTransition();
 const next=nextLocale(locale);
 const languageName=next==="am"?"Amharic":next==="om"?"Afaan Oromoo":next==="ar"?"Arabic":"English";
 function changeLanguage(){
  const pathname=window.location.pathname;
  const localePrefix=/^\/(en|am|om|ar)(?=\/|$)/;
  const base=pathname.replace(localePrefix,"")||"/";
  const target=next==="en"?base:"/"+next+(base==="/"?"":base);
  document.cookie=`aslal_locale=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
  window.dispatchEvent(new Event("aslal-locale-change"));
  startTransition(()=>{window.location.assign(target);});
 }
 return <button type="button" onClick={changeLanguage} disabled={pending} className="language-toggle" aria-label={`Switch language to ${languageName}`} title={`Switch language to ${languageName}`}><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6"/><path d="M3.8 12h16.4M12 3.5c2.1 2.3 3.2 5.1 3.2 8.5S14.1 18.2 12 20.5M12 3.5c-2.1 2.3-3.2 5.1-3.2 8.5S9.9 18.2 12 20.5" stroke="currentColor" strokeWidth="1.4"/></svg><span>{shortLocale(next)}</span></button>;
}
