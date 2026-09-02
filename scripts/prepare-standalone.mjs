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
console.log("Standalone deployment bundle prepared.");
