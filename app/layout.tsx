import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { AppChrome } from "@/components/AppChrome";
import { localeCookie, normalizeLocale } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Aslal Digital Solutions | Your Growth Partner",
  description: "Technology and marketing connected around outcomes.",
  icons: { icon: "/favicon.svg", apple: "/favicon.svg" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get(localeCookie)?.value);

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} suppressHydrationWarning>
      <body>
        <AppChrome>{children}</AppChrome>
        <AnalyticsTracker />
      </body>
    </html>
  );
}
