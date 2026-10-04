/**
 * Packages and add-on prices. The package cards and the live estimator both
 * read from this file, so a price only ever changes here.
 */

/** 0 = no CMS, 1 = text and photos, 2 = full editability (sections and layouts). */
export type CmsLevel = 0 | 1 | 2;
/** 0 = no logo, 1 = logo, 2 = logo with brand kit. */
export type LogoLevel = 0 | 1 | 2;

export interface Package {
  id: "starter" | "business" | "brand";
  name: string;
  price: number;
  pitch: string;
  deliveryDays: number;
  pages: number;
  forms: number;
  cms: CmsLevel;
  artDirection: boolean;
  logo: LogoLevel;
  revisions: number;
  fixDays: number;
  /** Plain-language list shown on the package card. */
  features: string[];
}

export const PACKAGES: Package[] = [
  {
    id: "starter",
    name: "Starter",
    price: 139,
    pitch: "A small site, say home, services and contact.",
    deliveryDays: 5,
    pages: 3,
    forms: 2,
    cms: 0,
    artDirection: false,
    logo: 0,
    revisions: 2,
    fixDays: 14,
    features: [
      "3 pages",
      "Responsive on phone, tablet and desktop",
      "Up to 2 forms",
      "2 revision rounds",
      "14 days of fixes after launch",
    ],
  },
  {
    id: "business",
    name: "Business",
    price: 349,
    pitch: "A bigger site you update yourself.",
    deliveryDays: 10,
    pages: 6,
    forms: 2,
    cms: 1,
    artDirection: true,
    logo: 0,
    revisions: 3,
    fixDays: 30,
    features: [
      "6 pages",
      "CMS to edit text and photos",
      "Art direction for type, colour and layout",
      "3 revision rounds",
      "30 days of fixes after launch",
    ],
  },
  {
    id: "brand",
    name: "Brand",
    price: 699,
    pitch: "A logo, a brand kit and a site you can rearrange.",
    deliveryDays: 18,
    pages: 12,
    forms: 2,
    cms: 2,
    artDirection: true,
    logo: 2,
    revisions: 3,
    fixDays: 60,
    features: [
      "Up to 12 pages",
      "Fully editable CMS: sections and layouts",
      "Blog",
      "Art direction",
      "Logo with brand kit",
      "3 revision rounds",
      "60 days of fixes after launch",
    ],
  },
];

/** Rough add-on prices used by the estimator. */
export const ADDONS = {
  page: 25,
  form: 15,
  revision: 20,
  /** Price of each CMS level, from none. */
  cms: [0, 120, 200] as const,
  artDirection: 60,
  /** Price of each logo level, from none. */
  logo: [0, 80, 150] as const,
  supportMonth: 20,
  rushMultiplier: 1.4,
};

export const CMS_LABELS = ["No CMS", "Text & photos", "Full editability"] as const;
export const LOGO_LABELS = ["No logo", "Logo", "Logo + brand kit"] as const;

/** Length of the fixes window the estimator offers, in days. */
export const FIX_STEPS = [
  { days: 14, label: "14 days" },
  { days: 30, label: "1 month" },
  { days: 60, label: "2 months" },
  { days: 90, label: "3 months" },
  { days: 180, label: "6 months" },
  { days: 365, label: "12 months" },
] as const;

export interface Selection {
  pages: number;
  forms: number;
  cms: CmsLevel;
  artDirection: boolean;
  logo: LogoLevel;
  revisions: number;
  fixDays: number;
  rush: boolean;
}

export interface Line {
  label: string;
  amount: number;
}

export interface Quote {
  base: Package;
  lines: Line[];
  subtotal: number;
  rushAmount: number;
  total: number;
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/**
 * Prices a selection on top of one package: the package price plus whatever
 * the selection needs beyond what that package already includes.
 */
export function quoteOn(base: Package, s: Selection): Quote {
  const lines: Line[] = [{ label: `${base.name} package`, amount: base.price }];

  const extraPages = Math.max(0, s.pages - base.pages);
  if (extraPages) lines.push({ label: `+${plural(extraPages, "page", "pages")}`, amount: extraPages * ADDONS.page });

  const extraForms = Math.max(0, s.forms - base.forms);
  if (extraForms) lines.push({ label: `+${plural(extraForms, "form", "forms")}`, amount: extraForms * ADDONS.form });

  if (s.cms > base.cms) {
    lines.push({
      label: base.cms ? `Upgrade CMS to ${CMS_LABELS[s.cms].toLowerCase()}` : `CMS: ${CMS_LABELS[s.cms].toLowerCase()}`,
      amount: ADDONS.cms[s.cms] - ADDONS.cms[base.cms],
    });
  }

  if (s.artDirection && !base.artDirection) lines.push({ label: "Art direction", amount: ADDONS.artDirection });

  if (s.logo > base.logo) {
    lines.push({ label: LOGO_LABELS[s.logo], amount: ADDONS.logo[s.logo] - ADDONS.logo[base.logo] });
  }

  const extraRevisions = Math.max(0, s.revisions - base.revisions);
  if (extraRevisions) {
    lines.push({
      label: `+${plural(extraRevisions, "revision round", "revision rounds")}`,
      amount: extraRevisions * ADDONS.revision,
    });
  }

  const extraMonths = Math.max(0, Math.ceil((s.fixDays - base.fixDays) / 30));
  if (extraMonths) {
    lines.push({
      label: `+${plural(extraMonths, "month", "months")} of fixes`,
      amount: extraMonths * ADDONS.supportMonth,
    });
  }

  const subtotal = lines.reduce((sum, l) => sum + l.amount, 0);
  const rushAmount = s.rush ? Math.round(subtotal * (ADDONS.rushMultiplier - 1)) : 0;
  return { base, lines, subtotal, rushAmount, total: subtotal + rushAmount };
}

/** The cheapest way to get the selection: each package plus add-ons, lowest wins. */
export function bestQuote(s: Selection): Quote {
  return PACKAGES.map((p) => quoteOn(p, s)).reduce((best, q) => (q.total < best.total ? q : best));
}
