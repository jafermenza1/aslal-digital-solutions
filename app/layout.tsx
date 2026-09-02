import type { Metadata } from "next";
import "./globals.css";
import { siteConfig } from "@/lib/config";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";

export const metadata: Metadata = {
  title: "Aslal Digital Solutions | Engineered Digital Growth",
  description: "Digital growth systems for businesses in Ethiopia: websites, software, commerce, automation, digital marketing and SEO.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        <Footer />
        <AnalyticsTracker />
      </body>
    </html>
  );
}
