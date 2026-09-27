import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const standalone = path.join(root, ".next", "standalone");
const publicDir = path.join(root, "public");
const staticDir = path.join(root, ".next", "static");

if (!fs.existsSync(standalone)) {
  console.error("Standalone build directory was not created.");
  process.exit(1);
}

function copy(source, destination) {
  if (!fs.existsSync(source)) return;
  fs.cpSync(source, destination, { recursive: true });
}

copy(publicDir, path.join(standalone, "public"));
copy(staticDir, path.join(standalone, ".next", "static"));

// pdfkit loads its standard fonts lazily at runtime. Next standalone tracing
// can omit those data files, so ship the complete package in the standalone
// bundle rather than relying on the source node_modules directory.
const pdfkitSource = path.join(root, "node_modules", "pdfkit");
const pdfkitDestination = path.join(standalone, "node_modules", "pdfkit");
if (!fs.existsSync(pdfkitSource)) {
  console.error("pdfkit is missing from node_modules.");
  process.exit(1);
}
copy(pdfkitSource, pdfkitDestination);

console.log("Standalone deployment bundle prepared (including pdfkit runtime assets).");
