# Portfolio Vision — Operating Manual

This is a single-developer codebase. The code is the spec; do not invent features, abstractions, or error states that aren't already present.

---

## Commands

```bash
# Development — ALWAYS use vercel dev, never npm run dev
# npm run dev starts Vite only; /api/* routes return 404
vercel dev

# Production build (output: frontend/dist/)
npm run build

# Lint (targets frontend/ only)
npm run lint

# Sync etf_data.json → Supabase tables
# Run this AFTER any change to etf_data.json
npm run import-etf

# Preview production build
npm run preview
```

---

## Repo Layout

```
portfolio-vision-web/
  .env                          ← env vars for ALL tools (Vite, scripts). Repo root, not frontend/.
  api/
    price.js                    ← Vercel serverless: proxies Yahoo Finance v8
    fxrate.js                   ← Vercel serverless: proxies Frankfurter API; falls back to 1.385
  frontend/
    src/
      App.jsx                   ← Routes, top-level state, decomposition useMemo
      index.css                 ← Design system: all CSS variables, utility classes, mobile overrides
      layout/Header.jsx
      components/               ← All UI: PortfolioPanel, ResultsPanel, HoldingRow, ChartSection, ...
      utils/
        decompose.js            ← Core logic + both alias maps. Most sensitive file.
        colors.js               ← SECTOR_COLORS, COUNTRY_COLORS (hardcoded, no Tailwind)
        format.js               ← fmtMoney, fmtAmount
        parseHoldingsCsv.js     ← Wealthsimple CSV importer
      services/fetchPrices.js   ← Price fetching + localStorage cache (keyed by user-input ticker)
      data/etf_data.json        ← THE SOURCE OF TRUTH for all ETF/stock data (~280 KB)
      lib/supabase.js           ← createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
  database/
    001_etf_data.sql            ← Read-only admin mirror tables (etf_metadata, etf_holdings, stock_info)
    002_security_fixes.sql      ← Defines delete_user() RPC used by Settings page
  backend/scripts/importEtfData.js  ← Populates Supabase tables from etf_data.json
```

---

## Environment Variables

`.env` lives at the **repo root** (not inside `frontend/`). Vite reads it from there because `vite.config.js` sets `envDir: '..'`.

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_LOGO_DEV_KEY=
```

Production values live in the Vercel project dashboard, not in this file.

---

## Data: One Source of Truth

`frontend/src/data/etf_data.json` is the source of truth for everything the decompose engine reads.

The Supabase tables (`etf_metadata`, `etf_holdings`, `stock_info`) are **admin-only mirrors**. They are never queried by the frontend or API routes. They exist so you can inspect data in Supabase. Do not edit them directly; run `npm run import-etf` after changing the JSON.

**Format:**
```json
{
  "etfs": {
    "VFV.TO": {
      "name": "Vanguard S&P 500 Index ETF",
      "currency": "CAD",
      "holdings": [{ "ticker": "AAPL", "weight": 7.24 }, ...]
    },
    "XEQT.TO": {
      "currency": "CAD",
      "holdings_same_as": "VEQT.TO"   ← entire holdings delegated to VEQT.TO
    }
  },
  "stocks": {
    "AAPL": { "name": "Apple Inc.", "sector": "Technology", "country": "United States" }
  }
}
```

Rules:
- Canadian ETF tickers use the `.TO` suffix as the JSON key (e.g., `VFV.TO`).
- Stocks that trade as bare tickers (e.g., `AAPL`, `MSFT`) use no suffix.
- `holdings_same_as` makes the ETF a pure alias — `getHoldings()` follows the chain recursively.
- `weight` values are percentages; they need not sum to exactly 100 (the remainder becomes "Untracked").

---

## The Two Alias Maps (Critical — Read Before Touching decompose.js)

`frontend/src/utils/decompose.js` contains two separate alias maps. They serve different purposes and must be updated independently.

### `HOLDINGS_ALIASES`
Maps a user-input ticker to the **key that exists in `etf_data.json`**.
Used by `resolveTicker()` for DB lookups and decompose logic.
Does NOT affect price fetching.

Examples:
- `XEQT → VEQT.TO` (XEQT's holdings are identical to VEQT.TO)
- `SHOP.TO → SHOP` (normalize a .TO suffix that doesn't exist in the JSON to the bare key that does)

### `PRICE_ALIASES`
Maps a user-input ticker to the **Yahoo Finance symbol** that returns a valid price.
Used only by `fetchPrices.js` when calling `/api/price`.
Does NOT affect decompose.

Examples:
- `XEQT → XEQT.TO` (XEQT lists on TSX; Yahoo needs the .TO suffix)
- `BRK.B → BRK-B` (Yahoo uses dashes for share class, not dots)
- `FEQT.TO → FEQT.NE` (Fidelity ETF trades on Cboe Canada; Yahoo only serves .NE)

**The mistake to avoid:** Assuming one alias entry covers both purposes. If you add a new ETF, ask: (a) what key is it under in etf_data.json? → `HOLDINGS_ALIASES`; (b) what symbol does Yahoo Finance accept? → `PRICE_ALIASES`. These are often different.

---

## Core Logic: Decomposition Pipeline

```
User input (ticker + amount OR shares)
  ↓
PortfolioPanel.runDecompose()
  Validates rows → fetches prices for # rows → converts shares × priceCAD → dollarAmount
  Calls onDecomposeComputed(mergedRows)
  ↓
App.jsx handleDecomposeComputed()
  Sets committedRows (triggers useMemo)
  ↓
useMemo in App.jsx
  Builds portfolio: { TICKER: dollarAmountInDisplayCurrency }
  Calls decompose(portfolio) from decompose.js
  ↓
decompose.js decompose()
  For each ticker:
    - If ETF: getHoldings() → recurse up to depth 5
    - If stock: accumulate dollar amount
  Returns { result: { ticker → amount }, unknown: [] }
  ↓
ResultsPanel + ChartSection render the result
```

**Key invariants:**
- `rows` is the live editor state. `committedRows` drives the decomposition. They diverge while the user is editing and converge when "Decompose portfolio" is clicked.
- The useMemo re-runs only when `committedRows` or `displayCurrency` changes — not on every keystroke.
- Price cache in `fetchPrices.js` is keyed by the **user-input ticker** (not the Yahoo symbol). Entries store `{ priceCAD, priceUSD, fetchedAt }`.
- When `fetchPrices` returns `null` for a ticker, that row is switched to `$` entry instead of blocking the whole decomposition.

---

## Design System

All styling is in `frontend/src/index.css` via CSS custom properties. There are **no Tailwind utility classes** in JSX files. All component styling is inline via `style={{...}}`.

**Do not:**
- Add `className="flex items-center gap-4"` or any other Tailwind utility
- Create a `tailwind.config.*` file (Tailwind v4 — config lives in `@theme` directives inside CSS)
- Use arbitrary values like `text-[#a78bfa]` — use `var(--accent)` instead

**Color tokens** (defined in `index.css :root`):

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0d0d0f` | Page background |
| `--card` | `#17171b` | Card / modal background |
| `--card2` | `#1e1e23` | Card footer / nested surfaces |
| `--border` | `#232329` | Default border |
| `--border2` | `#33333b` | Stronger divider |
| `--text` | `#f4f4f6` | Primary text |
| `--text2` | `#b9b9c2` | Secondary text |
| `--text3` | `#7e7e89` | Tertiary / muted |
| `--accent` | `#a78bfa` | Interactive / highlight |
| `--green` | `#2fd08c` | Success |
| `--red` | `#f05a7e` | Error / destructive |
| `--amber` | `#f4b942` | Warning / unknown ticker |
| `--seg-bg` | `#232329` | Segmented control background |
| `--seg-active` | `#3a3a44` | Segmented control active pill |
| `--track` | `#26262d` | Bar / progress track |

**Utility classes** (use these instead of raw inline styles where they exist):

| Class | Purpose |
|---|---|
| `pv-input` | Text/number input field |
| `pv-btn-primary` | Primary CTA (purple pill, full hover) |
| `pv-btn-ghost` | Secondary button (transparent border) |
| `pv-link-btn` | Inline text button (no border) |
| `pv-select` | Borderless select dropdown |
| `pv-menu-item` | Dropdown menu row (hover state defined) |
| `pv-modal` | Modal inner card (padding, radius) |
| `pv-screen` | Full-height screen container (fade-in animation) |
| `pos-row` | Position-row grid in the build screen |

**Component conventions:**
- Use `<Modal>` from `components/Modal.jsx` for all overlays. It handles `Escape` key, backdrop click, and focus. Always put `onClick={(e) => e.stopPropagation()}` on the inner content div — the Modal shell does this already, but inline modals that skip the shell must do it manually.
- Use `<Seg>` for binary/small-n toggles (USD/CAD, $/# , etc.). Pass `small` prop for row-level controls.
- Use `letterAvatarColor()` from `colors.js` for consistent ticker avatar colors.
- `HorizBar` accepts a `color` prop for shape compatibility but **intentionally ignores it** — bars are always accent-colored (monochrome v2 design decision).

**Mobile:** All mobile overrides are in the `@media (max-width: 767px)` block at the bottom of `index.css`. The `!important` annotations are intentional overrides of inline styles. Do not fight them with more inline styles.

---

## Auth & Persistence

- Auth: Supabase email+password and Google OAuth. Session managed in `App.jsx` via `supabase.auth.onAuthStateChange`.
- Portfolios: Stored in a `portfolios` table (user-owned, RLS-protected). Schema: `{ id, user_id, name, holdings: jsonb, created_at }`. The `holdings` JSON is the `buildHoldingsPayload()` output from `PortfolioPanel` — an array of `{ ticker, inputType, amount, currency }` or `{ ticker, inputType, shares }`.
- The `portfolios` table is NOT in `001_etf_data.sql`. It's a user-data table; you won't find its `CREATE TABLE` in the repo. It exists in Supabase.
- `delete_user()` RPC: Defined in `database/002_security_fixes.sql`. Must be run in the Supabase SQL editor before the "Delete account" button works.
- Default currency preference: Stored in `user.user_metadata.defaultCurrency` via `supabase.auth.updateUser()`. Applied on login in `App.jsx`.

---

## Rules (with the mistake each one prevents)

**R1: Run `vercel dev`, not `npm run dev`.**
Mistake: `npm run dev` starts Vite only. `/api/price` and `/api/fxrate` return 404, making share-count rows unfetchable and the FX rate fallback hardcoded to 1.385.

**R2: `etf_data.json` is the source of truth. Never edit Supabase ETF tables directly.**
Mistake: Direct Supabase edits diverge from the JSON. The frontend reads only the JSON; the Supabase tables are never queried by production code.

**R3: After editing `etf_data.json`, run `npm run import-etf`.**
Mistake: Skipping this leaves Supabase out of sync for admin viewing, and means any future script re-import will overwrite manual Supabase edits.

**R4: Use CSS variables and inline styles; do not use Tailwind utility classes in JSX.**
Mistake: Adding `className="flex gap-4 text-sm"` in a component. It will silently fail to apply because Tailwind v4 in this project has no utility classes scanned/generated from JSX — all theme config is in `index.css @theme` directives and styling is 100% inline.

**R5: Check BOTH alias maps when adding a new ticker. Update only the ones that need updating.**
Mistake: Adding `NEWTICKER: 'NEWTICKER.TO'` to both maps when only `HOLDINGS_ALIASES` needs it (e.g., the Yahoo symbol is already `NEWTICKER.TO` and no entry is needed in `PRICE_ALIASES`). Or vice-versa: adding to `HOLDINGS_ALIASES` but not `PRICE_ALIASES`, so the ticker decomposes correctly but can't be priced when entered as a share-count row.

**R6: Do not trigger decomposition from `rows` directly. Only `committedRows` feeds the useMemo.**
Mistake: Wiring a `useEffect` that watches `rows` and calls `decompose()`. This would re-decompose on every keystroke and break the intentional build→commit→results flow.

**R7: The price cache key is the user-input ticker, not the Yahoo symbol.**
Mistake: Storing `priceCache['XEQT.TO']` when the user typed `XEQT`. `getCachedPrice('XEQT')` will return null. `fetchPrices.js` applies `PRICE_ALIASES` internally before hitting `/api/price`, but caches by the original ticker.

**R8: When adding a new component, wrap modals in `<Modal>` or replicate its click/Escape handling.**
Mistake: Creating a new `position: fixed` overlay without `Escape` key handling or backdrop-click dismiss. `Modal.jsx` already handles both; prefer using it.

**R9: `.env` is at the repo root, not in `frontend/`.**
Mistake: Creating `frontend/.env`. Vite is configured with `envDir: '..'` in `vite.config.js`; it reads from the parent directory.

**R10: Canadian ETFs on Cboe Canada (formerly NEO Exchange) use `.NE` on Yahoo Finance, not `.TO`.**
Mistake: Mapping `FEQT` → `FEQT.TO` in `PRICE_ALIASES`. Yahoo Finance only serves Cboe Canada listings as `.NE`. The DB key can be `.TO` (it is, for Fidelity ETFs); the PRICE_ALIAS must be `.NE`.

**R11: Adding a route means adding it to `frontend/src/seo/routes.js` AND to `rewrites` in `vercel.json`.**
Mistake: Adding `<Route path="/about">` in `App.jsx` and nothing else. There is deliberately **no** SPA catch-all rewrite — the build emits one real HTML file per route (`scripts/generate-html.mjs`) so that unknown paths keep a genuine 404 instead of a 200 soft-404. A route missing from `ROUTES` gets no HTML file generated, and a route missing from `rewrites` is not mapped to it, so it hard-404s in production while working perfectly in `vite dev`. The one meta table drives the static shells, the runtime `useSeo()` head, the JSON-LD, and `sitemap.xml`.

**R12: `frontend/src/seo/routes.js` and `schema.js` are imported by Node at build time.**
Mistake: Adding a JSX element, a `react` import, or `import.meta.env` to either file. `scripts/generate-html.mjs` imports them directly in Node, where all three are syntax or runtime errors. Keep both files inert ESM.

---

## Quality Bars (Checkable, Not Adjective)

Before marking any change done, verify each applicable criterion:

**Data changes (etf_data.json):**
- [ ] `npm run import-etf` ran without error after the edit
- [ ] The ticker key matches the format already in use (`.TO` for Canadian ETFs, bare for US)
- [ ] `holdings` weights are all numeric percentages (not decimals), and the array is non-empty unless `holdings_same_as` is set
- [ ] If `holdings_same_as` is set, the target key exists in `"etfs"`

**Alias changes (decompose.js):**
- [ ] You can state out loud what each new entry does: "this maps X to Y so that [decompose / Yahoo Finance] finds it"
- [ ] No entry was added to `PRICE_ALIASES` where the value would return 404 from Yahoo Finance
- [ ] `HOLDINGS_ALIASES` entry points to a key that exists in `etf_data.json`

**UI changes:**
- [ ] No Tailwind utility classes added to JSX (`className` values are only design-system classes like `pv-btn-primary`, not utility classes like `flex` or `text-sm`)
- [ ] Colors use CSS variables (`var(--accent)`, `var(--text2)`) not hex literals, except where hardcoded in `colors.js`
- [ ] New modals use `<Modal>` or implement Escape + backdrop dismiss
- [ ] Mobile layout was checked — the `@media (max-width: 767px)` block in `index.css` may already handle the component; don't add duplicate mobile overrides inline

**State/logic changes:**
- [ ] If you touched `decompose.js`: `decompose(portfolio)` still returns `{ result, unknown }` with the same shape
- [ ] If you touched `PortfolioPanel.runDecompose`: rows with no live price are switched to `$` entry, not silently dropped
- [ ] If you touched `fetchPrices.js`: the cache key is the user-input ticker; prices are stored as `priceCAD`

**API routes:**
- [ ] Tested with `vercel dev`, not the Vite dev server
- [ ] Route always responds (never throws unhandled) — the `fxrate` route's fallback pattern (`res.status(200).json({ rate: 1.385 })` on error) is the model to follow
