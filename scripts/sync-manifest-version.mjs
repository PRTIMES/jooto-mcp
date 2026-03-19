import { readFileSync, writeFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const manifestText = readFileSync("manifest.json", "utf8");

const pattern = /^(\s*"version"\s*:\s*")[^"]*(")/m;
if (!pattern.test(manifestText)) {
  throw new Error('"version" field not found in manifest.json');
}

const updated = manifestText.replace(pattern, `$1${pkg.version}$2`);
writeFileSync("manifest.json", updated);

console.log(`manifest.json version → ${pkg.version}`);
