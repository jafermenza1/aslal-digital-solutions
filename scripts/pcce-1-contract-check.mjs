import { readFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const i18n = readFileSync(new URL("lib/i18n.ts", root), "utf8");
const contract = readFileSync(new URL("lib/public-commerce-contract.ts", root), "utf8");
const builder = readFileSync(new URL("../components/GrowthBuilder.tsx", import.meta.url), "utf8");

const required = [
  "commerce", "intents", "growth", "sell", "automate", "system",
  "tellUs", "findSolution", "requestProduct", "requestService",
  "customNeed", "talkSpecialist", "order", "browseProducts",
  "exploreServices", "talkTelegram",
];

for (const key of required) {
  if (!i18n.includes(key)) throw new Error(`PCCE-1 terminology key missing from lib/i18n.ts: ${key}`);
}

for (const locale of ["en", "am", "ar", "om"]) {
  const block = i18n.match(new RegExp(`\\n  ${locale}: \\{([\\s\\S]*?)(?=\\n  (?:en|am|ar|om): \\{|\\n\\} as const)`));
  if (!block) throw new Error(`PCCE-1 locale block missing: ${locale}`);
  for (const key of required) {
    if (!block[1].includes(key)) throw new Error(`PCCE-1 key '${key}' missing from locale '${locale}'`);
  }
}

for (const key of ["publicCommerceIntents", "publicCommerceCopyKeys", "publicCommerceRouteContract", "internalToPublicCommerceTerminology"]) {
  if (!contract.includes(key)) throw new Error(`PCCE-1 contract export missing: ${key}`);
}

for (const forbidden of ["Attract demand", "Capture leads", "Automate follow-up", "Improve conversion"]) {
  if (builder.includes(forbidden)) throw new Error(`PCCE-1 public Growth Builder still exposes legacy term: ${forbidden}`);
}

if (!builder.includes("@/lib/public-commerce-contract")) {
  throw new Error("PCCE-1 Growth Builder is not consuming the public commerce contract.");
}

console.log("PCCE-1 terminology contract: PASS");
