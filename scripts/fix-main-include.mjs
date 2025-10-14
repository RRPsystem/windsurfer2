/**
 * fix-main-include.mjs
 * - Verwijdert ALLE <script src="/js/main.js[?v=...]"> tags
 * - Voegt precies 1 versie-gebuste include toe vóór </body> (of append)
 * - Skipt node_modules/.git/.vercel
 * Usage:
 *   node scripts/fix-main-include.mjs --ver 20251014-1 --dry-run
 *   node scripts/fix-main-include.mjs --ver 20251014-1
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const args = new Map(process.argv.slice(2).flatMap(a => {
  const m = a.match(/^--([^=]+)(?:=(.*))?$/);
  return m ? [[m[1], m[2] ?? "true"]] : [];
}));
const ver = args.get("ver") || process.env.MAIN_JS_VER || "20251014-1";
const dry = args.has("dry-run");
const root = process.cwd();

const skipDirs = new Set(["node_modules",".git",".vercel",".next","dist","build"]);
const walk = (dir) => readdirSync(dir, { withFileTypes: true })
  .flatMap(d => {
    if (skipDirs.has(d.name)) return [];
    const p = join(dir, d.name);
    return d.isDirectory() ? walk(p) : [p];
  });

const files = walk(root).filter(p => p.toLowerCase().endsWith(".html"));

const tagRx = /<script\b[^>]*src=["']\/js\/main\.js(?:\?v=[^"']*)?["'][^>]*>\s*<\/script>\s*/gi;
const makeTag = (v) => `<script src="/js/main.js?v=${v}" defer></script>\n`;

let changed = 0, scanned = 0;
const changes = [];

for (const p of files) {
  scanned++;
  let t = readFileSync(p, "utf8");
  const before = t;

  // 1) strip alle varianten (met/zonder ?v=…)
  t = t.replace(tagRx, "");

  // 2) voeg exact één include toe
  if (/<\/body>/i.test(t)) {
    t = t.replace(/<\/body>/i, `${makeTag(ver)}</body>`);
  } else {
    t = t + "\n" + makeTag(ver);
  }

  if (t !== before) {
    changes.push(p);
    if (!dry) writeFileSync(p, t, { encoding: "utf8" });
    changed++;
  }
}

console.log(`[fix-main-include] scanned=${scanned} changed=${changed} version=${ver}`);
if (changes.length) {
  console.log("Files updated:");
  for (const c of changes) console.log(" -", c);
} else {
  console.log("No changes needed.");
}

// Optional: bump SW if present
const swPath = ["sw.js","public/sw.js"].map(f=>join(root,f)).find(existsSync);
if (swPath) {
  let sw = readFileSync(swPath, "utf8");
  const bumpRx = /const\s+SW_VERSION\s*=\s*["'`](.*?)["'`]\s*;/;
  if (bumpRx.test(sw)) {
    const before = sw;
    sw = sw.replace(bumpRx, `const SW_VERSION = "${ver}";`);
    if (sw !== before) {
      if (!dry) writeFileSync(swPath, sw, { encoding: "utf8" });
      console.log(`[fix-main-include] SW bumped in ${swPath} -> ${ver}`);
    } else {
      console.log("[fix-main-include] SW_VERSION already up to date.");
    }
  }
}
