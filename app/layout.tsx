import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { siteConfig } from "@/lib/config";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";

export const metadata: Metadata = {
  title: "Aslal Digital Solutions | Engineered Digital Growth",
  description: "Digital growth systems for businesses in Ethiopia: websites, software, commerce, automation, digital marketing and SEO.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = (await cookies()).get("aslal_locale")?.value === "am" ? "am" : "en";
  return (
    <html lang={locale} dir="ltr">
      <body>
        <Header />
        {children}
        <Footer />
        <AnalyticsTracker />
      </body>
    </html>
  );
}
