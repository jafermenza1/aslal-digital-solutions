import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SCAN_ROOTS = ["app", "components", "lib", "public"];
const ALLOWED_HEX = new Set(["#0F3E8A", "#E2B02A", "#1E293B", "#F8FAFC"]);

const files = [];
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".next", ".git"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/[.](css|tsx?|jsx?|mjs|svg|html)$/.test(entry.name)) files.push(full);
  }
}
for (const root of SCAN_ROOTS) walk(path.join(ROOT, root));

const violations = [];
const hexPattern = /#[0-9A-Fa-f]{3,8}\b/g;
const rgbPattern = /rgba?\([^)]*\)/g;

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  for (const match of content.matchAll(hexPattern)) {
    const value = match[0].toUpperCase();
    if (!ALLOWED_HEX.has(value)) {
      violations.push({ file: path.relative(ROOT, file), value: match[0] });
    }
  }
  for (const match of content.matchAll(rgbPattern)) {
    violations.push({ file: path.relative(ROOT, file), value: match[0] });
  }
}

if (violations.length) {
  console.error("ASLAL brand-color compliance failed.");
  for (const violation of violations) console.error(`- ${violation.file}: ${violation.value}`);
  process.exit(1);
}

console.log(`ASLAL brand-color compliance passed: ${files.length} source files scanned; only official palette values are permitted.`);
