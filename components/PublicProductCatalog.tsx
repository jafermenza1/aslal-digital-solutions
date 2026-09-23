"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type CatalogItem = {
  id: string;
  slug: string;
  name: string;
  kind: "PRODUCT" | "SERVICE";
  providerName: string | null;
  relationshipType: string;
  tagline: string | null;
  shortDescription: string;
  benefits: string | null;
  imageUrl: string | null;
  featured: boolean;
};

function firstLines(value: string | null) {
  return (value || "").split(/\r?\n/).map((x) => x.trim()).filter(Boolean).slice(0, 3);
}

function contactHref(name: string, goal: string) {
  return `/contact?product=${encodeURIComponent(name)}&goal=${encodeURIComponent(goal)}`;
}

export function PublicProductCatalog({ products }: { products: CatalogItem[] }) {
  const [filter, setFilter] = useState("ALL");

  const filters = [
    ["ALL", "All solutions"],
    ["PRODUCT", "Products"],
    ["SERVICE", "Services"],
    ["OWNED", "Aslal solutions"],
    ["PARTNER", "Partner solutions"],
    ["FEATURED", "Featured"],
  ] as const;

  const visible = useMemo(() => products.filter((p) => {
    if (filter === "ALL") return true;
    if (filter === "PRODUCT" || filter === "SERVICE") return p.kind === filter;
    if (filter === "OWNED") return p.relationshipType === "OWNED";
    if (filter === "PARTNER") return p.relationshipType !== "OWNED";
    return p.featured;
  }), [filter, products]);

  return (
    <div className="mt-12">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter products and services">
        {filters.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`rounded-full border px-4 py-2 text-xs font-black transition ${filter === value ? "border-[#E2B02A] bg-[#E2B02A] text-[#1E293B] shadow-lg shadow-[#E2B02A]/20" : "border-white/15 bg-white/[.05] text-white/65 hover:border-[#E2B02A] hover:text-[#E2B02A]"}`}
            aria-pressed={filter === value}
          >
            {label}
          </button>
        ))}
        <span className="ml-auto self-center text-xs font-bold text-white/45">{visible.length} solution{visible.length === 1 ? "" : "s"}</span>
      </div>

      <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((p) => (
          <article key={p.id} className="catalog-card group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[.06] transition duration-300 hover:-translate-y-1 hover:border-[#E2B02A] hover:bg-white/[.1] hover:shadow-[0_0_28px_rgba(226,176,42,.14)]">
            <Link href={`/products/${p.slug}`} className="block">
              <div className="relative h-52 overflow-hidden bg-gradient-to-br from-[#163f87] to-[#071F47]">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full items-end p-7">
                    <span className="rounded-full bg-[#E2B02A] px-3 py-1 text-[10px] font-black uppercase tracking-[.16em] text-[#1E293B]">{p.kind}</span>
                  </div>
                )}
                {p.featured && <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#0F3E8A]">Featured</span>}
              </div>
              <div className="p-7">
                <div className="text-xs font-black uppercase tracking-[.16em] text-[#E2B02A]">{p.providerName || "Aslal Digital Solutions"} · {p.kind === "SERVICE" ? "Service" : "Product"}</div>
                <h2 className="catalog-title mt-3 text-3xl font-black text-white transition-colors duration-200 group-hover:text-[#E2B02A]">{p.name}</h2>
                {p.tagline && <p className="mt-2 font-semibold text-white/70">{p.tagline}</p>}
                <p className="mt-4 leading-7 text-white/60">{p.shortDescription}</p>
                {firstLines(p.benefits).length > 0 && <div className="mt-5 space-y-2">{firstLines(p.benefits).map((x) => <div key={x} className="text-sm text-white/55">✓ {x}</div>)}</div>}
                <div className="catalog-explore mt-7 font-black text-[#E2B02A] transition-colors">Explore More →</div>
              </div>
            </Link>
            <div className="flex flex-wrap gap-2 border-t border-white/10 px-7 pb-7 pt-4">
              <Link href={contactHref(p.name, "Request a quote")} className="rounded-full bg-[#E2B02A] px-4 py-2 text-xs font-black text-[#1E293B]">Request Quote</Link>
              <Link href={contactHref(p.name, "Request a demo")} className="rounded-full border border-white/20 px-4 py-2 text-xs font-black text-white hover:border-[#E2B02A] hover:text-[#E2B02A]">Request Demo</Link>
            </div>
          </article>
        ))}
      </div>

      {!visible.length && <div className="mt-7 rounded-3xl border border-white/10 bg-white/[.05] p-12 text-center text-white/60">No solutions match this filter.</div>}
    </div>
  );
}
