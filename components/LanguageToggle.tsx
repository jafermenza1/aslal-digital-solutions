"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function LanguageToggle({ locale }: { locale: "en" | "am" }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const next = locale === "en" ? "am" : "en";
  const label = locale === "en" ? "አማ" : "EN";

  function changeLanguage() {
    document.cookie = `aslal_locale=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
    startTransition(() => router.refresh());
  }

  return <button type="button" onClick={changeLanguage} disabled={pending} className="language-toggle" aria-label={`Switch language to ${next === "am" ? "Amharic" : "English"}`}>{label}</button>;
}
