// Single source of truth for per-route metadata.
//
// Imported by BOTH:
//   - scripts/generate-html.mjs  (build time — bakes tags into the static shells)
//   - frontend/src/seo/useSeo.js (runtime — keeps the head correct across SPA navigation)
//
// Keeping one table is the point: if the build output and the client-side head
// drift, crawlers and users see different metadata for the same URL. Add a route
// here and both sides pick it up.
//
// Plain ESM with no imports so `node` can load it directly from the build script.

export const SITE_URL = 'https://portfoliovision.online';
export const SITE_NAME = 'Portfolio Vision';
export const AUTHOR = 'Austin Zhai';
export const THEME_COLOR = '#0d0d0f'; // matches --bg in index.css
export const OG_IMAGE = `${SITE_URL}/og-image.png`;
export const OG_IMAGE_ALT =
  'Portfolio Vision showing an ETF portfolio broken down into its underlying company holdings';

export const DEFAULT_ROUTE = '/404';

// `index: false` emits <meta name="robots" content="noindex, follow">.
// `breadcrumb` is the trailing crumb label; null means no breadcrumb trail.
export const ROUTES = {
  '/': {
    // Kept short deliberately — this is what shows in the browser tab, and a
    // long descriptive title there reads as noise.
    title: 'Portfolio Vision',
    // The keyword-rich version lives here instead, used for og:title /
    // twitter:title (getRouteMeta callers fall back to `title` when absent).
    ogTitle: 'Portfolio Vision — See What Your ETFs Actually Hold',
    description:
      'Break your ETFs down into the companies you actually own. Portfolio Vision unwraps funds recursively, merges overlapping positions, and shows your real sector and country exposure.',
    index: true,
    breadcrumb: null,
  },
  '/privacy': {
    title: 'Privacy Policy · Portfolio Vision',
    description:
      'How Portfolio Vision handles your data: what is stored, what is never collected, where your saved portfolios live, and how to delete your account.',
    index: true,
    breadcrumb: 'Privacy Policy',
  },
  '/terms': {
    title: 'Terms of Service · Portfolio Vision',
    description:
      'The terms governing your use of Portfolio Vision, including holdings-data accuracy limits and the fact that nothing on the site is financial advice.',
    index: true,
    breadcrumb: 'Terms of Service',
  },
  '/settings': {
    // Private, per-user page. Nothing here is useful in a search result.
    title: 'Settings · Portfolio Vision',
    description:
      'Manage your Portfolio Vision account, default display currency, and saved portfolios.',
    index: false,
    breadcrumb: 'Settings',
  },
  '/404': {
    title: 'Page Not Found · Portfolio Vision',
    description:
      'That page does not exist. Head back to Portfolio Vision to decompose your ETF portfolio into the companies you really own.',
    index: false,
    breadcrumb: null,
  },
};

// Only these get listed in sitemap.xml — `index: false` routes are deliberately
// excluded, since listing a noindex URL in a sitemap is a contradiction that
// Search Console reports as an error.
export const INDEXABLE_ROUTES = Object.keys(ROUTES).filter((p) => ROUTES[p].index);

export function getRouteMeta(pathname) {
  // Normalize a trailing slash so '/privacy/' resolves like '/privacy'.
  const clean =
    pathname !== '/' && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  return ROUTES[clean] || ROUTES[DEFAULT_ROUTE];
}

export function canonicalFor(pathname) {
  return pathname === '/' ? `${SITE_URL}/` : `${SITE_URL}${pathname}`;
}

// True for any path with no route of its own. A 404 gets no canonical tag at
// all: '/404' is not a real URL, and pointing the tag at the bad path the user
// typed would nominate a broken URL as canonical. Absent is the correct answer.
export function isNotFound(pathname) {
  const clean =
    pathname !== '/' && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  return clean === DEFAULT_ROUTE || !ROUTES[clean];
}
