"use client";

import { useEffect } from "react";
import { browserAttribution } from "@/lib/browser-attribution";

export function AnalyticsTracker() {
  useEffect(() => {
    const url = new URL(window.location.href);
    const attribution = browserAttribution();
    const payload = {
      eventName: "PAGE_VIEW",
      pagePath: window.location.pathname,
      metadata: {
        referrer: document.referrer || null,
        utmSource: url.searchParams.get("utm_source"),
        utmMedium: url.searchParams.get("utm_medium"),
        utmCampaign: url.searchParams.get("utm_campaign"),
        attributionSource: attribution?.source || null,
        attributionMedium: attribution?.medium || null,
      },
    };

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => undefined);
  }, []);

  return null;
}
