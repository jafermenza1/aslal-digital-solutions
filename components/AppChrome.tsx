"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const appSurface =
    pathname === "/login" ||
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/portal" ||
    pathname.startsWith("/portal/");

  if (appSurface) return <>{children}</>;

  return (
    <div className="site-shell">
      <Header />
      <div className="site-main">{children}</div>
      <Footer />
    </div>
  );
}
