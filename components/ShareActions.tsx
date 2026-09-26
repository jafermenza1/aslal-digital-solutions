"use client";

import { useState } from "react";

export function ShareActions({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }
  const encoded = encodeURIComponent(url);
  const text = encodeURIComponent(title);
  const links = [
    [`https://wa.me/?text=${encodeURIComponent(title + " " + url)}`, "WhatsApp"],
    [`https://t.me/share/url?url=${encoded}&text=${text}`, "Telegram"],
    [`https://www.facebook.com/sharer/sharer.php?u=${encoded}`, "Facebook"],
    [`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`, "LinkedIn"],
  ] as const;
  return <div className="flex flex-wrap items-center gap-2" aria-label="Share this page">
    <span className="mr-1 text-xs font-black uppercase tracking-wider text-slate-400">Share</span>
    {links.map(([href,label]) => <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="rounded-full border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:border-[#E2B02A] hover:text-[#0F3E8A]">{label}</a>)}
    <button type="button" onClick={copy} className="rounded-full border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:border-[#E2B02A] hover:text-[#0F3E8A]">{copied ? "Copied" : "Copy link"}</button>
  </div>;
}
