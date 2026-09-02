import Link from "next/link";
import { siteConfig } from "@/lib/config";

export function Footer() {
  return (
    <footer className="bg-[#0F3E8A] text-white">
      <div className="container-aslal grid gap-12 py-16 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <div className="mb-5 text-xl font-black tracking-tight">ASLAL <span className="text-[#E2B02A]">DIGITAL SOLUTIONS</span></div>
          <p className="max-w-md text-sm leading-7 text-white/70">Engineered growth, local context, technical precision and measurable ROI for businesses in Ethiopia.</p>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-black uppercase tracking-widest text-[#E2B02A]">Explore</h3>
          <div className="space-y-3 text-sm text-white/75">
            <Link className="block hover:text-white" href="/services">Solutions</Link>
            <Link className="block hover:text-white" href="/products">Products</Link>
            <Link className="block hover:text-white" href="/work">Work</Link>
            <Link className="block hover:text-white" href="/demo">Automation Lab</Link>
          </div>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-black uppercase tracking-widest text-[#E2B02A]">Contact</h3>
          <div className="space-y-3 text-sm text-white/75">
            <p>{siteConfig.location}</p>
            <p>{siteConfig.phone}</p>
            <p>{siteConfig.email}</p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/50">© {new Date().getFullYear()} Aslal Digital Solutions PLC. All rights reserved.</div>
    </footer>
  );
}
