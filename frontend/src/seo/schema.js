// JSON-LD structured data, built from facts that already exist in this repo.
//
// Deliberately NOT LocalBusiness: Portfolio Vision is a free web app with no
// storefront, address, or service area. LocalBusiness requires a real physical
// location, and fabricating one violates Google's structured-data policy.
// WebApplication + WebSite + Person + BreadcrumbList + FAQPage is the honest
// and correct description of what this site is.
//
// Plain ESM, no imports beyond ./routes.js, so the build script can load it in node.

import { SITE_URL, SITE_NAME, AUTHOR, OG_IMAGE, ROUTES } from './routes.js';

const AUTHOR_ID = `${SITE_URL}/#author`;
const SITE_ID = `${SITE_URL}/#website`;
const APP_ID = `${SITE_URL}/#app`;

const person = {
  '@type': 'Person',
  '@id': AUTHOR_ID,
  name: AUTHOR,
  url: SITE_URL,
};

const website = {
  '@type': 'WebSite',
  '@id': SITE_ID,
  url: SITE_URL,
  name: SITE_NAME,
  description: ROUTES['/'].description,
  inLanguage: 'en',
  publisher: { '@id': AUTHOR_ID },
};

const webApplication = {
  '@type': 'WebApplication',
  '@id': APP_ID,
  name: SITE_NAME,
  url: SITE_URL,
  description: ROUTES['/'].description,
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript.',
  image: OG_IMAGE,
  author: { '@id': AUTHOR_ID },
  isAccessibleForFree: true,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'CAD',
  },
  featureList: [
    'Recursive ETF decomposition, including ETFs held inside other ETFs',
    'Overlapping positions merged into a single correctly-weighted holding',
    'Sector and geographic exposure breakdowns',
    'Live prices for TSX, Cboe Canada, CSE and US exchanges',
    'Wealthsimple CSV import',
    'Positions entered by dollar amount or share count, in USD or CAD',
  ],
};

// Sourced verbatim from the copy already shipped in
// frontend/src/components/HowItWorksModal.jsx (STEPS + NOTES). Google requires
// FAQ answers to match visible page content, so these must stay in sync with it.
const FAQ = [
  [
    'How does Portfolio Vision work?',
    'Enter each ETF or stock you own, by dollar amount or share count, in USD or CAD. Every ETF is unpacked into its underlying holdings, including ETFs inside ETFs, weighted by what you actually own. You get one combined view of every company, sector, and country across your whole portfolio.',
  ],
  [
    'How accurate are the weightings?',
    'Some weightings may be off by a percent or so due to database update timing and partial holdings data. ETF holdings are point-in-time and funds rebalance continuously, so decomposed values are estimates.',
  ],
  [
    'Are covered-call and leveraged ETFs supported?',
    'They are excluded, because they do not reflect true ownership of the underlying stocks. For a leveraged ETF, enter the underlying ETF instead and mentally scale the exposure.',
  ],
  [
    'Why is my ticker showing in yellow?',
    'A yellow ticker just is not in the database yet. You can still enter and track it as-is.',
  ],
  [
    'How do I add commodities?',
    'Type the asset name directly: "Gold" instead of GLD, "Silver" instead of SLV, "Copper" instead of CPER.',
  ],
  [
    'What does "Untracked" mean?',
    'Untracked is the slice that cannot be broken down further: funds with too many positions to list, or with only partial public data. Your total is still accurate.',
  ],
];

const faqPage = {
  '@type': 'FAQPage',
  '@id': `${SITE_URL}/#faq`,
  mainEntity: FAQ.map(([question, answer]) => ({
    '@type': 'Question',
    name: question,
    acceptedAnswer: { '@type': 'Answer', text: answer },
  })),
};

function breadcrumbFor(pathname) {
  const label = ROUTES[pathname]?.breadcrumb;
  if (!label) return null;
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: label, item: `${SITE_URL}${pathname}` },
    ],
  };
}

/**
 * Returns the JSON-LD graph for a route, as a single @graph document.
 * Home carries the full product + FAQ payload; subpages carry identity + breadcrumb.
 */
export function schemaFor(pathname) {
  const graph = [person, website];

  if (pathname === '/') {
    graph.push(webApplication, faqPage);
  } else {
    const crumbs = breadcrumbFor(pathname);
    if (crumbs) graph.push(crumbs);
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}

// Exported so the Breadcrumbs component can render the same trail it declares.
export function breadcrumbTrail(pathname) {
  const label = ROUTES[pathname]?.breadcrumb;
  return label ? [{ name: 'Home', path: '/' }, { name: label, path: pathname }] : null;
}
