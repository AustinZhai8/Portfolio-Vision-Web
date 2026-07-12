# Skill: add-etf

Use this skill when the user wants to add a new ETF, stock alias, commodity alias, or crypto alias to Portfolio Vision — or when they want to know why a ticker doesn't decompose or price correctly.

---

## Step 1 — Identify what the ticker needs

Answer these four questions before touching any file:

1. **Does it need a holdings entry in `etf_data.json`?**
   Yes if it's an ETF with distinct underlying holdings you want to show.
   No if it shares holdings with an ETF already in the JSON (`holdings_same_as` is enough).

2. **Does it need a `HOLDINGS_ALIASES` entry in `decompose.js`?**
   Yes if: (a) the user-input form differs from the JSON key (e.g., user types `XEQT`, key is `VEQT.TO`), OR (b) an internal holdings-list ticker needs to normalize to an existing stock key (e.g., `SHOP.TO → SHOP`).

3. **Does it need a `PRICE_ALIASES` entry in `decompose.js`?**
   Yes if: the Yahoo Finance symbol differs from what the user would type. Common cases:
   - Canadian ETF: Yahoo needs `.TO` suffix → map `TICKER → TICKER.TO`
   - Cboe Canada (NEO) listing: Yahoo needs `.NE` → map `TICKER → TICKER.NE` AND `TICKER.TO → TICKER.NE`
   - Berkshire-style share class: Yahoo uses `-` not `.` → map `BRK.B → BRK-B`
   - Crypto: Yahoo needs `-USD` suffix → map `BTC → BTC-USD`

4. **Is it an ETF with the same holdings as an existing ETF?**
   Use `holdings_same_as` in the JSON + a `HOLDINGS_ALIASES` entry pointing to the existing ETF key. No need to duplicate the holdings array.

---

## Step 2 — Edit `etf_data.json` (if needed)

File: `frontend/src/data/etf_data.json`

**New ETF with distinct holdings:**
```json
"ETFS": {
  "NEW.TO": {
    "name": "Full Fund Name",
    "currency": "CAD",
    "holdings": [
      { "ticker": "AAPL", "weight": 5.21 },
      { "ticker": "MSFT", "weight": 4.87 }
    ]
  }
}
```

Key format rules:
- Canadian ETF → `TICKER.TO` as the JSON key
- US ETF → bare `TICKER`
- `weight` is a percentage (5.21 = 5.21%), not a decimal

**ETF that mirrors an existing ETF:**
```json
"XSP.TO": {
  "currency": "CAD",
  "holdings_same_as": "VFV.TO"
}
```

**New stock (if not already present in `"stocks"`):**
```json
"stocks": {
  "NVDA": { "name": "NVIDIA Corporation", "sector": "Technology", "country": "United States" }
}
```

Valid `sector` values: `Technology`, `Healthcare`, `Financial Services`, `Consumer Cyclical`, `Consumer Defensive`, `Communication Services`, `Industrials`, `Energy`, `Utilities`, `Basic Materials`, `Real Estate`, `Commodities`, `Crypto`

Valid `country` values: match the keys in `COUNTRY_COLORS` in `colors.js`; for new countries outside that list, use `Unknown` (they'll render as dimmed/gray).

---

## Step 3 — Edit `decompose.js` (if needed)

File: `frontend/src/utils/decompose.js`

**`HOLDINGS_ALIASES`** — add near the section whose comment matches the purpose:

```js
// ETF that shares a holdings basket with an existing entry
NEWETF: 'EXISTING.TO',

// Bare input → .TO DB key (user types NEWTICKER, DB key is NEWTICKER.TO)
NEWTICKER: 'NEWTICKER.TO',
```

**`PRICE_ALIASES`** — add the Yahoo Finance symbol mapping:

```js
// Canadian listing (TSX)
NEWTICKER: 'NEWTICKER.TO',

// Cboe Canada (NEO) — must map BOTH bare and .TO forms to .NE
NEWTICKER: 'NEWTICKER.NE',
'NEWTICKER.TO': 'NEWTICKER.NE',
```

Do NOT add to `PRICE_ALIASES` if Yahoo Finance already accepts the user-input form directly (e.g., US stocks like `AAPL` need no entry).

---

## Step 4 — Sync Supabase

```bash
npm run import-etf
```

This must run after any change to `etf_data.json`. It has no side effects on the frontend — it only updates the admin-mirror tables.

---

## Verification checklist

- [ ] Open `vercel dev` and type the new ticker into a portfolio row. The ticker input does not show amber (unknown).
- [ ] For ETFs: click "Decompose portfolio". The ETF's underlying stocks appear in the results, not the ETF itself.
- [ ] For share-count rows: "Decompose portfolio" fetches a live price without error.
- [ ] `npm run import-etf` ran without error.
- [ ] `HOLDINGS_ALIASES` entry (if added) points to a key that exists in `etf_data.json`.
- [ ] `PRICE_ALIASES` entry (if added) uses the exact Yahoo Finance symbol (verify by hitting `https://query1.finance.yahoo.com/v8/finance/chart/TICKER` directly if unsure).
