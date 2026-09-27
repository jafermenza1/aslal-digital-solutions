import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const root = process.cwd();
const standalone = path.join(root, ".next", "standalone");
const publicDir = path.join(root, "public");
const staticDir = path.join(root, ".next", "static");
const require = createRequire(import.meta.url);

if (!fs.existsSync(standalone)) {
  console.error("Standalone build directory was not created.");
  process.exit(1);
}

function copy(source, destination) {
  if (!fs.existsSync(source)) {
    throw new Error(`Required build asset is missing: ${source}`);
  }
  fs.cpSync(source, destination, { recursive: true });
}

copy(publicDir, path.join(standalone, "public"));
copy(staticDir, path.join(standalone, ".next", "static"));

// PDFKit 0.20.x loads standard-font modules lazily from its Node package.
// Next standalone tracing may omit these files, so resolve the installed
// package entry and copy the complete package into the standalone runtime.
const pdfkitEntry = require.resolve("pdfkit");
const pdfkitSource = path.resolve(path.dirname(pdfkitEntry), "..");
const pdfkitDestination = path.join(standalone, "node_modules", "pdfkit");
const helveticaSource = path.join(pdfkitSource, "js", "standard-fonts", "Helvetica.cjs");

if (!fs.existsSync(helveticaSource)) {
  throw new Error(`PDFKit standard font asset is missing from installed package: ${helveticaSource}`);
}

copy(pdfkitSource, pdfkitDestination);

const helveticaDestination = path.join(pdfkitDestination, "js", "standard-fonts", "Helvetica.cjs");
if (!fs.existsSync(helveticaDestination)) {
  throw new Error(`PDFKit standalone packaging failed: ${helveticaDestination}`);
}

console.log("Standalone deployment bundle prepared.");
console.log("PDFKit Helvetica runtime asset:", helveticaDestination);
