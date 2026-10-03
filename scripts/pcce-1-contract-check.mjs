import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const root = new URL("../", import.meta.url);
const moduleUrl = new URL("lib/i18n.ts", root);

// This contract check is intentionally source-based: the repository has no test runner.
// It verifies that every supported locale contains the exact PCCE-1 public vocabulary.
const source = readFileSync(moduleUrl, "utf8");
const required = [
  "commerce",
  "intents",
  "growth",
  "sell",
  "automate",
  "system",
  "tellUs",
  "findSolution",
  "requestProduct",
  "requestService",
  "customNeed",
  "talkSpecialist",
  "order",
  "browseProducts",
  "exploreServices",
  "talkTelegram",
];

for (const key of required) {
  if (!source.includes(key)) {
    throw new Error(`PCCE-1 terminology key missing from lib/i18n.ts: ${key}`);
  }
}

for (const locale of ["en", "am", "ar", "om"]) {
  const block = source.match(new RegExp(`\\n  ${locale}: \\{([\\s\\S]*?)(?=\\n  (?:en|am|ar|om): \\{|\\n\\} as const)`));
  if (!block) throw new Error(`PCCE-1 locale block missing: ${locale}`);
  for (const key of required) {
    if (!block[1].includes(key)) {
      throw new Error(`PCCE-1 key '${key}' missing from locale '${locale}'`);
    }
  }
}

console.log("PCCE-1 terminology contract: PASS");
