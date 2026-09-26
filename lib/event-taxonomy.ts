export const BUSINESS_EVENTS = [
  "PAGE_VIEW","PRODUCT_VIEW","SERVICE_VIEW","CONTENT_VIEW","VIDEO_PLAY","VIDEO_COMPLETE",
  "FEATURE_VIEW","PRICING_VIEW","DEMO_START","DEMO_COMPLETE","QUOTE_START","QUOTE_COMPLETE",
  "DOWNLOAD","RESOURCE_DOWNLOAD","RESOURCE_TOOL_USE","WHATSAPP_CLICK","TELEGRAM_CLICK","MESSENGER_CLICK","EMAIL_CLICK","PHONE_CLICK",
  "CONTACT_SUBMIT","REFERRAL_CLICK","LANGUAGE_SELECTED","PAYMENT_STARTED","PAYMENT_COMPLETED",
] as const;

export type BusinessEvent = (typeof BUSINESS_EVENTS)[number];

export const BUSINESS_EVENT_DESCRIPTIONS: Record<BusinessEvent, string> = {
  PAGE_VIEW: "A page was viewed.",
  PRODUCT_VIEW: "A product or service page was viewed.",
  SERVICE_VIEW: "A service page was viewed.",
  CONTENT_VIEW: "A content/resource page was viewed.",
  VIDEO_PLAY: "A tracked video started.",
  VIDEO_COMPLETE: "A tracked video completed.",
  FEATURE_VIEW: "A feature was viewed.",
  PRICING_VIEW: "Pricing was viewed.",
  DEMO_START: "A demo request or demo flow was started.",
  DEMO_COMPLETE: "A demo flow was completed.",
  QUOTE_START: "A quote flow was started.",
  QUOTE_COMPLETE: "A quote flow was completed.",
  DOWNLOAD: "A tracked download occurred.",
  RESOURCE_DOWNLOAD: "A resource download or delivery was requested.",
  RESOURCE_TOOL_USE: "A resource tool was used.",
  WHATSAPP_CLICK: "WhatsApp contact CTA was clicked.",
  TELEGRAM_CLICK: "Telegram contact CTA was clicked.",
  MESSENGER_CLICK: "Messenger contact CTA was clicked.",
  EMAIL_CLICK: "Email CTA was clicked.",
  PHONE_CLICK: "Phone CTA was clicked.",
  CONTACT_SUBMIT: "The contact form was successfully submitted.",
  REFERRAL_CLICK: "A referral link was clicked.",
  LANGUAGE_SELECTED: "A supported language was selected.",
  PAYMENT_STARTED: "A payment flow was started.",
  PAYMENT_COMPLETED: "A payment was completed.",
};
const BUSINESS_EVENT_SET = new Set<string>(BUSINESS_EVENTS);

export function isBusinessEvent(value: string): value is BusinessEvent {
  return BUSINESS_EVENT_SET.has(value);
}

export const HIGH_INTENT_EVENTS = new Set<BusinessEvent>([
  "PRICING_VIEW","DEMO_START","DEMO_COMPLETE","QUOTE_START","QUOTE_COMPLETE",
  "WHATSAPP_CLICK","TELEGRAM_CLICK","MESSENGER_CLICK","CONTACT_SUBMIT","PAYMENT_STARTED",
]);

export function growthOpportunityFor(event: BusinessEvent, productSlug?: string | null) {
  if (!HIGH_INTENT_EVENTS.has(event)) return null;
  const interest = productSlug || event.replaceAll("_", " ").toLowerCase();
  return {
    interest: interest.slice(0, 190),
    engagementLevel: event === "QUOTE_COMPLETE" || event === "PAYMENT_STARTED" || event === "CONTACT_SUBMIT" ? "VERY_HIGH" : "HIGH",
    recommendedNextAction: event.includes("QUOTE") || event.includes("CONTACT")
      ? "Review signal and assign sales follow-up"
      : "Review high-intent anonymous activity",
  };
}
