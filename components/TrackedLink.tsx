"use client";

import Link from "next/link";
import { MouseEvent, ReactNode, useState } from "react";

type Props = { href: string; eventName: string; productSlug?: string; children: ReactNode; className?: string };

export function TrackedLink({ href, eventName, productSlug, children, className }: Props) {
  const [busy, setBusy] = useState(false);

  async function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (busy) return;
    setBusy(true);
    event.preventDefault();
    const url = new URL(window.location.href);
    try {
      await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName,
          pagePath: window.location.pathname,
          productSlug,
          metadata: {
            referrer: document.referrer || null,
            utmSource: url.searchParams.get("utm_source"),
            utmMedium: url.searchParams.get("utm_medium"),
            utmCampaign: url.searchParams.get("utm_campaign"),
          },
        }),
        keepalive: true,
      });
    } catch {}
    window.location.assign(href);
  }

  return <Link href={href} onClick={handleClick} className={className}>{busy ? "Opening…" : children}</Link>;
}
