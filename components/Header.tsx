import Link from "next/link";
import { navItems } from "@/lib/config";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-blue-950/10 bg-[#F8FAFC]/90 backdrop-blur-xl">
      <div className="container-aslal flex h-20 items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3" aria-label="Aslal Digital Solutions home">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#0F3E8A] text-lg font-black text-white shadow-lg shadow-blue-900/20">
            A<span className="text-[#E2B02A]">↗</span>
          </span>
          <span className="hidden sm:block">
            <span className="block text-sm font-black tracking-[.16em] text-[#0F3E8A]">ASLAL</span>
            <span className="block text-[10px] font-semibold tracking-[.08em] text-[#1E293B]/70">DIGITAL SOLUTIONS</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => <Link key={item.href} href={item.href} className="text-sm font-semibold text-[#1E293B]/75 transition hover:text-[#0F3E8A]">{item.label}</Link>)}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/contact" className="hidden rounded-full px-4 py-2 text-sm font-bold text-[#0F3E8A] sm:inline-block">Talk to an expert</Link>
          <Link href="/contact" className="rounded-full bg-[#E2B02A] px-5 py-3 text-sm font-extrabold text-[#1E293B] shadow-lg shadow-yellow-600/15 transition hover:-translate-y-0.5">Start a project</Link>
        </div>
      </div>
    </header>
  );
}
