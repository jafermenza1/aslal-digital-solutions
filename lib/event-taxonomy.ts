export const BUSINESS_EVENTS = [
  "PAGE_VIEW",
  "PRODUCT_VIEW",
  "SERVICE_VIEW",
  "CONTENT_VIEW",
  "VIDEO_PLAY",
  "VIDEO_COMPLETE",
  "FEATURE_VIEW",
  "PRICING_VIEW",
  "DEMO_START",
  "DEMO_COMPLETE",
  "QUOTE_START",
  "QUOTE_COMPLETE",
  "DOWNLOAD",
  "WHATSAPP_CLICK",
  "TELEGRAM_CLICK",
  "MESSENGER_CLICK",
  "EMAIL_CLICK",
  "PHONE_CLICK",
  "CONTACT_SUBMIT",
  "REFERRAL_CLICK",
  "LANGUAGE_SELECTED",
  "PAYMENT_STARTED",
  "PAYMENT_COMPLETED",
] as const;

export type BusinessEvent = (typeof BUSINESS_EVENTS)[number];

const BUSINESS_EVENT_SET = new Set<string>(BUSINESS_EVENTS);

export function isBusinessEvent(value: string): value is BusinessEvent {
  return BUSINESS_EVENT_SET.has(value);
}

export const HIGH_INTENT_EVENTS = new Set<BusinessEvent>([
  "PRICING_VIEW",
  "DEMO_START",
  "DEMO_COMPLETE",
  "QUOTE_START",
  "QUOTE_COMPLETE",
  "WHATSAPP_CLICK",
  "TELEGRAM_CLICK",
  "MESSENGER_CLICK",
  "CONTACT_SUBMIT",
  "PAYMENT_STARTED",
]);

export function growthOpportunityFor(event: BusinessEvent, productSlug?: string | null) {
  if (!HIGH_INTENT_EVENTS.has(event)) return null;
  const interest = productSlug || event.replaceAll("_", " ").toLowerCase();
  const engagementLevel =
    event === "QUOTE_COMPLETE" || event === "PAYMENT_STARTED" || event === "CONTACT_SUBMIT"
      ? "VERY_HIGH"
      : "HIGH";
  return {
    interest: interest.slice(0, 190),
    engagementLevel,
    recommendedNextAction: event.includes("QUOTE") || event.includes("CONTACT")
      ? "Review signal and assign sales follow-up"
      : "Review high-intent anonymous activity",
  };
}
