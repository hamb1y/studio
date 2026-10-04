/**
 * Captures the case-study screenshots used by the Work section.
 *
 *   node scripts/capture-work.mjs
 *   node scripts/capture-work.mjs jnvckm=http://localhost:4400   # capture one site from a local build
 *
 * Writes src/assets/work/<id>-desktop.png (1440 wide, top of the page, up to
 * three screens tall) and src/assets/work/<id>-mobile.png (390x844 at 2x).
 * Astro converts them to responsive WebP at build time.
 *
 * Needs Playwright, which is not a dependency of this site. Either run it
 * where Playwright is installed globally, or install it just for this:
 *   npm i --no-save playwright && npx playwright install chromium
 * Set CHROME_PATH to use an existing Chromium binary instead.
 */
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

// Keep in step with src/data/work.ts.
const SITES = [
  { id: "jnvckm", url: "https://jnvckm.org" },
  { id: "bhoomiseva", url: "https://bhoomiseva.pages.dev" },
];

const overrides = Object.fromEntries(
  process.argv
    .slice(2)
    .filter((a) => a.includes("="))
    .map((a) => a.split(/=(.*)/s).slice(0, 2)),
);
const only = Object.keys(overrides);
const targets = SITES.filter((s) => !only.length || only.includes(s.id)).map((s) => ({
  ...s,
  url: overrides[s.id] || s.url,
}));

const outDir = fileURLToPath(new URL("../src/assets/work/", import.meta.url));
await mkdir(outDir, { recursive: true });

const { chromium } = await import("playwright");
const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});

async function settle(page) {
  await page.evaluate(() => document.fonts.ready);
  // Scroll through once so lazy images load, then return to the top.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(600);
}

for (const site of targets) {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  await desktop.goto(site.url, { waitUntil: "networkidle" });
  await settle(desktop);
  const height = await desktop.evaluate(() => document.documentElement.scrollHeight);
  await desktop.screenshot({
    path: `${outDir}${site.id}-desktop.png`,
    fullPage: true,
    clip: { x: 0, y: 0, width: 1440, height: Math.min(height, 2700) },
  });
  await desktop.close();

  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
  });
  await mobile.goto(site.url, { waitUntil: "networkidle" });
  await settle(mobile);
  await mobile.screenshot({ path: `${outDir}${site.id}-mobile.png` });
  await mobile.close();

  console.log(`captured ${site.id} from ${site.url}`);
}

await browser.close();
