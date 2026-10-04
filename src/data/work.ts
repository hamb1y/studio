/**
 * Case studies. Screenshots live in src/assets/work/ as
 * `<id>-desktop.png` (1440 wide, full page) and `<id>-mobile.png` (390 wide).
 * Refresh them with `node scripts/capture-work.mjs` (see README).
 */
export interface CaseStudy {
  id: string;
  url: string;
  domain: string;
  kind: string;
  summary: string;
  built: { title: string; detail: string }[];
  stack: string;
}

export const WORK: CaseStudy[] = [
  {
    id: "jnvckm",
    url: "https://jnvckm.org",
    domain: "jnvckm.org",
    kind: "Alumni association",
    summary: "News, events, programmes and a list of funded projects. The association's own team keeps it up to date.",
    built: [
      {
        title: "Sections with detail pages",
        detail: "Stories, events, programmes and funded projects each have an index page and a page per entry.",
      },
      {
        title: "Editing in the browser",
        detail: "The team adds stories, events, projects and photos through a CMS at /admin. They don't touch code.",
      },
      {
        title: "Project filter",
        detail: "The funded-projects list filters by category instantly. It's the one interactive part of an otherwise static site.",
      },
      {
        title: "Speed",
        detail: "Static pages, WebP photos, self-hosted fonts, no trackers. Every photo also gets its own share image.",
      },
    ],
    stack: "Astro, Svelte, Sveltia CMS",
  },
  {
    id: "bhoomiseva",
    url: "https://bhoomiseva.pages.dev",
    domain: "bhoomiseva.pages.dev",
    kind: "Community organisation",
    summary: "A donate page, sign-up forms, programme pages and a blog, with every page's text editable in the CMS.",
    built: [
      {
        title: "Donate page",
        detail: "Pick a cause and an amount and the page makes a UPI QR code and pay button on the spot, plus a ready-to-send confirmation message.",
      },
      {
        title: "Editable text",
        detail: "Page text, stories, events, blog posts, programmes and team profiles are all managed in the CMS.",
      },
      {
        title: "Programmes and blog",
        detail: "A programme overview with three detail pages, dated stories and events, and a blog with a filter.",
      },
      {
        title: "Forms and photos",
        detail: "Sign-up and contact forms that fall back to email if sending fails, and a photo viewer that works with the keyboard.",
      },
    ],
    stack: "Astro, Svelte, Sveltia CMS",
  },
];
