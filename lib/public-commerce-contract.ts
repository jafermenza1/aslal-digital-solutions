export const publicCommerceIntents = [
  { key: "growth", labelKey: "commerce.intents.growth", href: "/growth-builder" },
  { key: "sell", labelKey: "commerce.intents.sell", href: "/growth-builder" },
  { key: "social", labelKey: "commerce.intents.social", href: "/growth-builder" },
  { key: "website", labelKey: "commerce.intents.website", href: "/growth-builder" },
  { key: "automate", labelKey: "commerce.intents.automate", href: "/growth-builder" },
  { key: "customerManagement", labelKey: "commerce.intents.customerManagement", href: "/growth-builder" },
  { key: "other", labelKey: "commerce.intents.other", href: "/growth-builder" },
] as const;

export const publicCommerceCopyKeys = {
  tellUs: "commerce.tellUs",
  findSolution: "commerce.findSolution",
  requestProduct: "commerce.requestProduct",
  requestService: "commerce.requestService",
  customNeed: "commerce.customNeed",
  talkSpecialist: "commerce.talkSpecialist",
  order: "commerce.order",
  browseProducts: "commerce.browseProducts",
  exploreServices: "commerce.exploreServices",
  talkTelegram: "commerce.talkTelegram",
} as const;

export const publicCommerceRouteContract = {
  product: { primaryAction: "order", labelKey: publicCommerceCopyKeys.order },
  service: { primaryAction: "requestService", labelKey: publicCommerceCopyKeys.requestService },
  custom: { primaryAction: "customNeed", labelKey: publicCommerceCopyKeys.customNeed },
} as const;

export const internalToPublicCommerceTerminology = {
  CommercialRequest: "Demand",
  CommercialMatch: "Match",
  CommercialEligibility: "Eligibility",
  CommercialDealRegistration: "Protected referral",
  CommercialAgreement: "Agreement",
  CommercialDistributionItem: "Sales asset",
  IssuedSalesAsset: "Issued sales asset",
} as const;

export type PublicCommerceIntentKey = typeof publicCommerceIntents[number]["key"];
