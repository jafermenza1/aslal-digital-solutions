import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { AppChrome } from "@/components/AppChrome";

export const metadata: Metadata = {
  title: "Aslal Digital Solutions | Your Growth Partner",
  description: "Technology and marketing connected around outcomes.",
  icons: { icon: "/favicon.svg", apple: "/favicon.svg" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const locale =
    cookieStore.get("aslal_locale")?.value === "am"
      ? "am"
      : cookieStore.get("aslal_locale")?.value === "om"
        ? "om"
        : "en";

  return (
    <html lang={locale} dir="ltr">
      <body>
        <AppChrome>{children}</AppChrome>
        <AnalyticsTracker />
      </body>
    </html>
  );
}
