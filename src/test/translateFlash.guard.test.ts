// ============================================================
// Repo-wide guard: any component that updates text on a fast timer
// (< 60s) must opt out of Google Translate, otherwise the widget
// re-translates it on every tick and the text visibly flashes.
// ============================================================
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "..");

function walk(dir: string, out: string[] = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "test" || entry.name === "node_modules") continue;
      walk(full, out);
    } else if (/\.tsx$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

const FAST_INTERVAL = /setInterval\(\s*[\s\S]{0,200}?,\s*(\d{1,5})\s*\)/g;

describe("translate-flash guard", () => {
  it("marks fast-ticking components as notranslate", () => {
    const offenders: string[] = [];

    for (const file of walk(ROOT)) {
      const src = fs.readFileSync(file, "utf8");
      let match: RegExpExecArray | null;
      FAST_INTERVAL.lastIndex = 0;
      let fastTick = false;
      while ((match = FAST_INTERVAL.exec(src))) {
        if (Number(match[1]) > 0 && Number(match[1]) < 60000) fastTick = true;
      }
      if (!fastTick) continue;
      const optedOut = /translate="no"/.test(src) && /notranslate/.test(src);
      // Slideshows/carousels swap whole blocks, not text — they are exempt
      // only when they contain no time formatting helpers.
      const rendersTime = /getSeconds\(|getMinutes\(|toLocaleTimeString\(/.test(src);
      if (rendersTime && !optedOut) offenders.push(path.relative(ROOT, file));
    }

    expect(offenders).toEqual([]);
  });
});
