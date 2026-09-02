import Link from "next/link";
import { navItems } from "@/lib/config";

export function Header() {
  return (
    <header className="metal-header sticky top-0 z-50">
      <div className="container-aslal flex h-20 items-center justify-between gap-6">
        <Link href="/" className="metal-shimmer flex items-center gap-3 rounded-2xl px-1 py-1" aria-label="Aslal Digital Solutions home">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#0F3E8A] text-lg font-black text-white shadow-lg shadow-blue-900/20 ring-1 ring-white/50">
            A<span className="text-[#E2B02A]">↗</span>
          </span>
          <span className="hidden sm:block">
            <span className="block text-sm font-black tracking-[.16em] text-[#0F3E8A]">ASLAL</span>
            <span className="block text-[10px] font-semibold tracking-[.08em] text-[#1E293B]/70">DIGITAL SOLUTIONS</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
          {navItems.map((item) => <Link key={item.href} href={item.href} className="metal-nav-link text-sm font-semibold">{item.label}</Link>)}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/login" className="hidden rounded-full border border-[#0F3E8A]/20 bg-white/50 px-4 py-2 text-sm font-bold text-[#0F3E8A] shadow-inner transition hover:bg-[#0F3E8A] hover:text-white md:inline-block" aria-label="Admin login">Admin</Link>
          <Link href="/contact" className="hidden rounded-full px-4 py-2 text-sm font-bold text-[#0F3E8A] transition hover:-translate-y-0.5 sm:inline-block">Talk to an expert</Link>
          <Link href="/contact" className="glow-button rounded-full bg-[#E2B02A] px-5 py-3 text-sm font-extrabold text-[#1E293B]">Start a project →</Link>
        </div>
      </div>
    </header>
  );
}
