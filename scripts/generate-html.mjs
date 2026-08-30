// Post-build step: turn Vite's single dist/index.html into one static HTML shell
// per route, each carrying its own title, description, canonical, OG/Twitter tags
// and JSON-LD.
//
// Why this exists: the app is a client-rendered SPA, so without this every URL
// serves an identical <head>. Social scrapers don't execute JS, so they'd show
// the same card for every page. Emitting real files also means deep links resolve
// through Vercel's filesystem step, which is what lets unknown paths keep a
// genuine 404 instead of the soft-404 a catch-all rewrite would produce.
//
// Runs via `npm run build` (see package.json), which is what Vercel executes.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  ROUTES,
  INDEXABLE_ROUTES,
  SITE_NAME,
  OG_IMAGE,
  OG_IMAGE_ALT,
  canonicalFor,
  isNotFound,
} from '../frontend/src/seo/routes.js';
import { schemaFor } from '../frontend/src/seo/schema.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'frontend', 'dist');

// Escape for use inside a double-quoted HTML attribute.
function attr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// `</script>` inside a JSON string would close the surrounding <script> tag early.
function jsonLd(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

function headFor(pathname) {
  const meta = ROUTES[pathname];
  const url = canonicalFor(pathname);

  return [
    `<title>${attr(meta.title)}</title>`,
    `<meta name="description" content="${attr(meta.description)}" />`,
    // The 404 shell gets no canonical — see isNotFound() in seo/routes.js.
    ...(isNotFound(pathname) ? [] : [`<link rel="canonical" href="${attr(url)}" />`]),
    // noindex pages keep "follow" so link equity still flows through them.
    `<meta name="robots" content="${meta.index ? 'index, follow' : 'noindex, follow'}" />`,

    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${attr(SITE_NAME)}" />`,
    `<meta property="og:title" content="${attr(meta.title)}" />`,
    `<meta property="og:description" content="${attr(meta.description)}" />`,
    `<meta property="og:url" content="${attr(url)}" />`,
    // Absolute URL is required here — scrapers reject relative og:image.
    `<meta property="og:image" content="${attr(OG_IMAGE)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${attr(OG_IMAGE_ALT)}" />`,

    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${attr(meta.title)}" />`,
    `<meta name="twitter:description" content="${attr(meta.description)}" />`,
    `<meta name="twitter:image" content="${attr(OG_IMAGE)}" />`,

    `<script type="application/ld+json">${jsonLd(schemaFor(pathname))}</script>`,
  ]
    .map((line) => `    ${line}`)
    .join('\n');
}

function buildShell(template, pathname) {
  // Drop the template's placeholder <title>; headFor() supplies the real one.
  // Everything else in <head> (icons, manifest, theme-color, preconnects, the
  // hashed Vite <script>/<link>) and the inline pv-theme FOUC guard is preserved.
  const withoutTitle = template.replace(/[ \t]*<title>[\s\S]*?<\/title>\r?\n?/i, '');

  if (!withoutTitle.includes('</head>')) {
    throw new Error('dist/index.html has no </head> — cannot inject metadata');
  }

  return withoutTitle.replace('</head>', `${headFor(pathname)}\n  </head>`);
}

// '/' -> index.html, '/404' -> 404.html, '/privacy' -> privacy/index.html
function outputPathFor(pathname) {
  if (pathname === '/') return 'index.html';
  if (pathname === '/404') return '404.html';
  return join(pathname.slice(1), 'index.html');
}

async function main() {
  const templatePath = join(DIST, 'index.html');

  let template;
  try {
    template = await readFile(templatePath, 'utf8');
  } catch {
    throw new Error(`Expected a built shell at ${templatePath}. Run \`vite build frontend\` first.`);
  }

  const written = [];

  for (const pathname of Object.keys(ROUTES)) {
    const rel = outputPathFor(pathname);
    const dest = join(DIST, rel);
    await mkdir(dirname(dest), { recursive: true });
    await writeFile(dest, buildShell(template, pathname), 'utf8');
    written.push(rel.replace(/\\/g, '/'));
  }

  // Generated rather than hand-written so it can never list a route that is
  // noindex or no longer exists — both are Search Console errors.
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = INDEXABLE_ROUTES.map(
    (p) =>
      `  <url>\n    <loc>${canonicalFor(p)}</loc>\n` +
      `    <lastmod>${lastmod}</lastmod>\n` +
      `    <priority>${p === '/' ? '1.0' : '0.5'}</priority>\n  </url>`,
  ).join('\n');

  await writeFile(
    join(DIST, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    'utf8',
  );

  console.log(`generate-html: wrote ${written.length} shells → ${written.join(', ')}`);
  console.log(`generate-html: wrote sitemap.xml with ${INDEXABLE_ROUTES.length} URLs`);
}

main().catch((err) => {
  console.error(`generate-html failed: ${err.message}`);
  process.exit(1);
});
