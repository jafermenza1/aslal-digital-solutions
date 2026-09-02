"use client";

import { useEffect } from "react";

export function AnalyticsTracker() {
  useEffect(() => {
    const url = new URL(window.location.href);
    const payload = {
      eventName: "page_view",
      pagePath: window.location.pathname,
      metadata: {
        referrer: document.referrer || null,
        utmSource: url.searchParams.get("utm_source"),
        utmMedium: url.searchParams.get("utm_medium"),
        utmCampaign: url.searchParams.get("utm_campaign"),
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
