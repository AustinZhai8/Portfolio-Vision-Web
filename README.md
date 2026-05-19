# Portfolio Vision

**See everything. Invest better.**

[portfoliovision.online](https://portfoliovision.online)

---

## What it does

Portfolio Vision takes your portfolio of ETFs and stocks, decomposes each ETF into its underlying holdings, and shows you exactly what you own across sector and geographic breakdowns. If you hold VFV, XEQT, and AAPL, you don't just see three positions — you see every company underneath them, weighted correctly, all in one place.

---

## Features

- ETF decomposition with recursive depth (ETFs holding ETFs handled automatically)
- Sector and geographic breakdown with animated horizontal bar charts
- Input by dollar amount or number of shares
- Per-row currency toggle (USD/CAD) and USD/CAD display toggle globally
- Live price fetching via Yahoo Finance proxy (supports TSX, TSX-V, NEO, CSE, US exchanges)
- 24hr price cache persisted to localStorage
- Holdings filtered to >= 0.3% weight, remainder collapsed into a summary row
- Sort by value, ticker, or default order
- Save and load portfolios (requires account)
- Google OAuth and email/password auth with OTP verification
- JSON export of portfolio data
- Canadian ETFs fully supported in shares mode (VFV.TO, XEQT.TO, FEQT.NE, FINN.NE, etc.)

---

## Tech Stack

- React + Vite + Tailwind CSS
- Supabase (auth + database)
- Vercel (hosting + serverless functions)
- Yahoo Finance via serverless proxy (`api/price.js`, `api/fxrate.js`)
- Frankfurter API for USD/CAD exchange rate
- Logo.dev for company logos
- React Router DOM
- Vercel Analytics + Speed Insights

---

## Project Structure

```
portfolio-vision-web/
├── api/
│   ├── price.js          <- Yahoo Finance proxy (serverless)
│   └── fxrate.js         <- USD/CAD rate proxy (serverless)
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── PortfolioPanel.jsx
│   │   ├── ResultsPanel.jsx
│   │   ├── HoldingRow.jsx
│   │   ├── CompanyLogo.jsx
│   │   ├── HorizBar.jsx
│   │   └── ChartSection.jsx
│   ├── pages/
│   │   └── Settings.jsx
│   ├── utils/
│   │   ├── decompose.js
│   │   ├── colors.js
│   │   ├── format.js
│   │   └── fetchPrices.js
│   ├── lib/
│   │   └── supabase.js
│   └── data/
│       └── etf_data.json
```

---

## Local Development

This project uses Vercel serverless functions for price fetching. Use `vercel dev` instead of `npm run dev` so the `/api/` routes are served locally.

```bash
npm install -g vercel
vercel dev
```

---

## Environment Variables

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_LOGO_DEV_KEY=
```

Set the same variables in your Vercel project dashboard under Environment Variables.

---

## Deployment

Deployed on Vercel with auto-deploy from the `main` branch on GitHub.

```bash
git add .
git commit -m "your message"
git push
```

---

## Known Limitations

- ETF holdings data is static and manually maintained in `etf_data.json`. Data coverage is as of May 2026.
- Some ETFs with bad weight data (e.g. SMH) may show sector breakdowns slightly over 100% — this is a data quality issue, not a code bug.
- Yahoo Finance's unofficial API is used for live prices. It is not a guaranteed service and could change without notice.
- FX conversion for non-USD/CAD currencies defaults to treating the raw price as-is and deriving the other side via the USD/CAD rate.

---

## About

Built by Austin Zhai, first year Computer Engineering student at UBC. Personal project built to get hands-on experience with full-stack development, API design, and real-world data problems.