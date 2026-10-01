import { randomBytes } from "crypto";

export type PartnerIdentityType = "AGENT" | "INFLUENCER" | "AFFILIATE" | "RESELLER";

const PREFIX: Record<PartnerIdentityType, string> = {
  AGENT: "AG",
  INFLUENCER: "IN",
  AFFILIATE: "AF",
  RESELLER: "RS",
};

export function generatePartnerNumber(type: PartnerIdentityType, date = new Date()) {
  const year = date.getUTCFullYear();
  const suffix = randomBytes(4).toString("hex").toUpperCase();
  return `ASL-${PREFIX[type]}-${year}-${suffix}`;
}

export function generateResellerNumber(date = new Date()) {
  const year = date.getUTCFullYear();
  const suffix = randomBytes(4).toString("hex").toUpperCase();
  return `ASL-RS-${year}-${suffix}`;
}
