import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SCAN_ROOTS = ["app", "components", "lib", "public"];
const ALLOWED_HEX = new Set(["#0F3E8A", "#E2B02A", "#070C18", "#0F172A", "#1E293B", "#F8FAFC", "#FFFFFF", "#F1F5F9"]);

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
const rgbPattern = /rgba?\(([^)]*)\)/g;

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  for (const match of content.matchAll(hexPattern)) {
    const value = match[0].toUpperCase();
    if (!ALLOWED_HEX.has(value)) {
      violations.push({ file: path.relative(ROOT, file), value: match[0] });
    }
  }
  for (const match of content.matchAll(rgbPattern)) {
    const parts = match[1].split(",").map((part) => Number.parseFloat(part.trim()));
    const rgb = parts.slice(0, 3);
    const allowedRgb = [[15, 62, 138], [226, 176, 42], [7, 12, 24], [15, 23, 42], [30, 41, 59], [248, 250, 252], [255, 255, 255], [241, 245, 249]];
    if (rgb.length !== 3 || !allowedRgb.some((value) => value.every((channel, index) => channel === rgb[index]))) {
      violations.push({ file: path.relative(ROOT, file), value: match[0] });
    }
  }
}

if (violations.length) {
  console.error("ASLAL brand-color compliance failed.");
  for (const violation of violations) console.error(`- ${violation.file}: ${violation.value}`);
  process.exit(1);
}

console.log(`ASLAL brand-color compliance passed: ${files.length} source files scanned; only official palette values are permitted.`);
