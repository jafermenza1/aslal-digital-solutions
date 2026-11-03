"use client";

import { useEffect } from "react";

export function EventTracker({ eventName, productSlug }: { eventName: string; productSlug?: string }) {
  useEffect(() => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName,
        pagePath: window.location.pathname,
        productSlug,
        metadata: {
          referrer: document.referrer || null,
          utmSource: new URLSearchParams(window.location.search).get("utm_source"),
          utmMedium: new URLSearchParams(window.location.search).get("utm_medium"),
          utmCampaign: new URLSearchParams(window.location.search).get("utm_campaign"),
        },
      }),
      keepalive: true,
    }).catch(() => undefined);
    fetch("/api/website-growth",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({stage:/CLICK|CTA|SUBMIT|REQUEST/i.test(eventName)?"CTA":"VIEW",pagePath:window.location.pathname,ctaKey:/CLICK|CTA|SUBMIT|REQUEST/i.test(eventName)?eventName:null,contentKey:productSlug?`product:${productSlug}`:null,metadata:{eventName}}),keepalive:true}).catch(()=>undefined);
  }, [eventName, productSlug]);

  return null;
}
