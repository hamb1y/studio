# studio

One-page sales site for **studio.rishimalnad.dev**: custom websites by Rishi Malnad, ordered through Fiverr.

- Astro 7, static output, one page
- Plain hand-written CSS (tokens in `src/styles/global.css`, scoped styles per component). No framework.
- Lucide icons via `@lucide/astro`
- Three small vanilla TypeScript scripts: the hero reflow rig, the reel player and the price estimator. No Svelte needed.
- Self-hosted variable fonts (Archivo, Martian Mono; both SIL OFL) in `public/fonts/`

## TODO before launch

- [ ] **Set the real Fiverr URL.** `FIVERR_URL` in `src/config.ts` is a placeholder (`https://www.fiverr.com/`). Every call to action reads it, so that one line is the only change.
- [ ] **Add the case-study screenshots.** The Work section expects `src/assets/work/{jnvckm,bhoomiseva}-{desktop,mobile}.png`. Without them it renders empty browser frames. Run `node scripts/capture-work.mjs` (see the script header for the Playwright requirement), then rebuild.
- [ ] Optionally replace `public/og.png` (1200×630 share image, currently a capture of the hero).

## Commands

```bash
bun install
bun run dev       # http://localhost:4321
bun run build     # static site in dist/
bun run preview   # serve dist/
node scripts/capture-work.mjs   # refresh case-study screenshots
sh scripts/encode-reel.sh path/to/studio-reel-v2.mp4   # re-encode the reel into public/reel/
```

## Structure

```
src/
  config.ts            FIVERR_URL, GitHub and portfolio links
  data/pricing.ts      packages, add-on prices, and the quote logic
  data/work.ts         case-study copy
  components/
    Header.astro       sticky bar, collapses to a menu below 760px
    Hero.astro
    ReflowRig.astro    hero motion graphic (markup, CSS and script)
    Capabilities.astro
    Reel.astro         the reel video and its buttons (markup, CSS and script)
    Work.astro         browser and phone frames around the screenshots
    Packages.astro
    Estimator.astro    live price calculator
    Process.astro
    Faq.astro
    Closing.astro
    Footer.astro
  layouts/Base.astro   <head>, fonts, meta
  styles/global.css    tokens, base styles, buttons
public/                fonts, favicon, robots.txt, reel/ (video and posters)
scripts/capture-work.mjs
scripts/encode-reel.sh
```

## Hero motion graphic

`ReflowRig.astro` draws a small generic website inside a browser frame. The layout inside is real CSS using container queries (breakpoints at 600 and 900 virtual px). The script only changes the frame width, runs a FLIP animation when a breakpoint is crossed, and swaps brand themes. The loop: desktop, tablet, phone (with a scroll through the stacked page), back to desktop, then the page breaks into labelled wireframe boxes and rebuilds in the next theme.

Visitors can pick a device, drag the handle (or focus it and use the arrow keys), and pause. The loop only runs while the rig is on screen and the tab is visible. With `prefers-reduced-motion: reduce` it starts paused on the finished desktop view and device changes are instant.

## Reel

`Reel.astro` shows the 20-second reel between "What you get" and "Recent work". It plays muted, looped and inline: it starts once half of it is on screen and pauses when it has scrolled off or the tab is hidden. The buttons below it pause it, turn the sound on and off, and open it full screen, where the browser's own controls take over. Nothing in `public/reel/` loads with the page; the poster and video are fetched when the reel is half a screen away. With `prefers-reduced-motion: reduce` or Save-Data on, it shows the poster with a Play button and fetches no video until that is pressed. Without JavaScript it is a plain video with the browser's controls.

`scripts/encode-reel.sh` makes the files in `public/reel/` from the master export (1080p60 with sound):

- `reel-720.mp4`: 1280×720, 30 fps, H.264 and AAC, 1.4 MB. Phones, upright or on their side.
- `reel-1080.mp4`: 1920×1080, 60 fps, H.264 and AAC, 3.1 MB. Tablets and desktops.
- `reel-720.webm`: VP9 and Opus, 1.3 MB. Only for browsers that can't play H.264, such as some Linux builds.
- `poster-960.webp`, `poster-1920.webp`: the first frame, about 20 KB and 45 KB.

If a re-encode changes the H.264 profile or level, update the `codecs` strings at the top of `Reel.astro`.

## Estimator logic

All prices live in `src/data/pricing.ts`. For any selection the estimator prices it on top of each package (package price plus whatever the selection needs beyond that package) and shows the cheapest. Rush adds 40% to that total.

Assumptions made where the brief was open:

- CMS is one choice of three levels: none, text and photos (+$120), or full editability (+$200 total, not $120 + $200).
- Logo is one choice: none, logo (+$80), or logo with brand kit (+$150).
- Fixes after launch: 14 days are included; each further month (or part of one) beyond a package's window is $20.
- Only Starter states a form count (2). The estimator assumes 2 included forms for every package, so extra forms are always charged.
- Blog is included in Brand only and has no separate add-on price, so it is not a control.

## Not included

Hosting and form management are separate from every package; the page and FAQ say so. The site itself does not pitch hosting or infrastructure.

## Deploy

Cloudflare Pages project `studio` builds every push to `main`: `bun run build`, output `dist`, `BUN_VERSION=1.4.2`. Custom domain: studio.rishimalnad.dev.
