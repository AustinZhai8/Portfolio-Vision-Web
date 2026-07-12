# Skill: diagnose-holdings

Use this skill when a ticker isn't decomposing correctly: it shows up as "unknown" (amber), it disappears from results, its weight looks wrong, or a share-count row can't be priced.

---

## Decision tree

Start here. Answer each question to narrow the failure.

### Q1: Does the ticker show amber in the portfolio row?

Amber means `isKnownTicker(ticker)` returned false — the ticker isn't in `etf_data.json` under either `"etfs"` or `"stocks"`, and `resolveTicker` didn't map it to one that is.

**Check:**
1. Open `frontend/src/data/etf_data.json`.
2. Search for the ticker as-typed AND with `.TO` appended.
3. If not found: the ticker needs a JSON entry or a `HOLDINGS_ALIASES` entry pointing to one that exists.

`resolveTicker` auto-tries `TICKER.TO` as a fallback if the bare form isn't found, so `VFV` will resolve to `VFV.TO` without an alias. But `XEQT` won't resolve to `VEQT.TO` without an explicit `HOLDINGS_ALIASES` entry.

---

### Q2: The ticker is not amber but doesn't appear in decompose results

This means the ETF decomposed, but its holdings aren't in the stocks map, or the weight is below the `MIN_WEIGHT_PCT` threshold (0.25% of portfolio total).

**Check A — Weight cutoff:**
`ResultsPanel.jsx` hides holdings below 0.25% of the portfolio total. Test with a large dollar amount to confirm the position is present but below threshold.

**Check B — Holdings chain:**
In `etf_data.json`, trace the ETF's `holdings` array. If any holding ticker isn't in `"stocks"`, it becomes part of "Untracked". Each holding's ticker goes through `resolveTicker` during decompose — check if any of them need `HOLDINGS_ALIASES` entries.

**Check C — `holdings_same_as` chain:**
If the ETF has `holdings_same_as`, the target must exist in `"etfs"` (not `"stocks"`). If the target itself has `holdings_same_as`, it chains recursively up to depth 5.

---

### Q3: Share-count row fails to price ("No live price found")

The price fetch calls `/api/price?ticker=<YAHOO_SYMBOL>`, where `YAHOO_SYMBOL = PRICE_ALIASES[userInput] || userInput`.

**Check A — Does `PRICE_ALIASES` have an entry?**
Open `decompose.js`. Search `PRICE_ALIASES` for the ticker. If absent, Yahoo is being called with the bare user-input form.

**Check B — Is the Yahoo symbol correct?**
Fetch manually to verify: `https://query1.finance.yahoo.com/v8/finance/chart/<SYMBOL>`
Common problems:
- Canadian ETF needs `.TO` suffix
- Cboe Canada needs `.NE` suffix (not `.TO`)
- Share-class tickers need `-` not `.` (e.g., `BRK-B` not `BRK.B`)

**Check C — Is it a CAD-hedged CDR or similar instrument?**
These can't be priced against the underlying; they should be imported as `$` rows from the Wealthsimple CSV, not `#` rows. Advise the user to switch to dollar-amount entry.

---

### Q4: Sector or country shows as "Unknown" or "Untracked"

**Unknown**: The stock is in `"stocks"` but its `sector` or `country` field is set to `"Unknown"` or isn't one of the mapped values in `colors.js`.

**Untracked**: The stock is a leaf node from ETF decomposition but isn't in `"stocks"` at all. Add it with the correct sector/country.

To calculate how much "Untracked" you expect:
`portfolioTotal - sum(decomposed values) = untracked dollar amount`
If this is large (>5%), ETF holdings weights may not sum to 100%, or key ETF holdings are missing from `"stocks"`.

---

## Tracing a decomposition manually

Call these functions in the browser console (after importing from the module, or add a `window.debug` assignment temporarily):

```js
// Does the ticker resolve to a JSON key?
resolveTicker('XEQT')          // → 'VEQT.TO'

// Is it treated as an ETF?
isEtf('VEQT.TO')               // → true

// What are its holdings?
getHoldings('VEQT.TO')         // → [{ ticker, weight }, ...]

// What does the full decompose return for a $1000 position?
decompose({ 'XEQT': 1000 })   // → { result: { AAPL: 42.1, ... }, unknown: [] }
```

---

## Quick lookup: what resolveTicker does

```js
// Priority order:
// 1. HOLDINGS_ALIASES[ticker.toUpperCase()]  — explicit map
// 2. If not in ETF_DATA or STOCK_DATA, try ticker + '.TO'
// 3. Return ticker as-is
```

So `SHOP` → not in HOLDINGS_ALIASES, not in ETF_DATA, IS in STOCK_DATA → returns `SHOP`.
And `SHOP.TO` → in HOLDINGS_ALIASES → returns `SHOP`.
