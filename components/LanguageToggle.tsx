"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";

export function LanguageToggle({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const next: Locale = locale === "en" ? "am" : locale === "am" ? "om" : "en";
  const label = locale === "en" ? "አማ" : locale === "am" ? "OM" : "EN";

  function changeLanguage() {
    document.cookie = `aslal_locale=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
    window.dispatchEvent(new Event("aslal-locale-change"));
    startTransition(() => router.refresh());
  }

  const languageName = next === "am" ? "Amharic" : next === "om" ? "Afaan Oromoo" : "English";

  return <button type="button" onClick={changeLanguage} disabled={pending} className="language-toggle" aria-label={`Switch language to ${languageName}`}>{label}</button>;
}
