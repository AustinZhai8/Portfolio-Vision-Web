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
- Import holdings from a broker CSV (Wealthsimple format) — auto-populates rows as shares, with CAD-hedged CDRs imported at their CAD value and options skipped
- Per-row currency toggle (USD/CAD) and global USD/CAD display toggle
- Live price fetching via Yahoo Finance proxy (TSX, TSX-V, NEO/Cboe Canada, CSE, US exchanges, FX, crypto)
- Price cache persisted to localStorage
- Holdings filtered to >= 0.25% weight, remainder collapsed into a summary row
- Sort by value, ticker, or default order
- Save and load portfolios (requires account)
- Google OAuth and email/password auth with OTP verification
- JSON export of portfolio data
- Canadian ETFs fully supported in shares mode (VFV.TO, XEQT.TO, FEQT.NE, FINN.NE, etc.)

---

## Architecture

```
┌─────────────┐        ┌──────────────────┐        ┌──────────────┐
│   FRONTEND  │──────▶ │      BACKEND     │──────▶ │   DATABASE   │
│   (React)   │        │ (Vercel API fns) │        │  (Supabase)  │
└─────────────┘        └──────────────────┘        └──────────────┘
        │                       │                          │
        │                       └─▶ Yahoo Finance proxy    │
        │                       └─▶ Frankfurter FX proxy   │
        │                                                  │
        └─────────────────── auth (OAuth / OTP) ───────────┘
```

1. User interacts with the React frontend
2. Frontend sends price/FX requests to Vercel serverless functions
3. Backend proxies requests to Yahoo Finance / Frankfurter and shapes the response
4. Supabase stores users, saved portfolios, and a mirror of the ETF holdings data
5. Response is sent back to the frontend

---

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, React Router DOM
- **Backend:** Vercel serverless functions (Node)
- **Database/Auth:** Supabase (Postgres + auth)
- **Data sources:** Yahoo Finance (via proxy), Frankfurter API (FX), Logo.dev (logos)
- **Hosting:** Vercel
- **Analytics:** Vercel Analytics + Speed Insights

---

## Project Structure

```
portfolio-vision-web/
│
├── frontend/                     # FRONTEND (React + Vite)
│   ├── public/                   # Static files served as-is
│   ├── src/
│   │   ├── assets/               # Static images
│   │   ├── components/           # Reusable UI components
│   │   │   ├── AuthModal.jsx
│   │   │   ├── ChartSection.jsx
│   │   │   ├── CompanyLogo.jsx
│   │   │   ├── HoldingRow.jsx
│   │   │   ├── HorizBar.jsx
│   │   │   ├── ImportCsvModal.jsx
│   │   │   ├── InfoModal.jsx
│   │   │   ├── PortfolioPanel.jsx
│   │   │   └── ResultsPanel.jsx
│   │   ├── layout/               # App shell / global chrome (Header, etc.)
│   │   ├── pages/                # Route-level views (Settings, Privacy, Terms)
│   │   ├── hooks/                # Custom React hooks (reserved)
│   │   ├── context/              # React context providers (reserved)
│   │   ├── services/             # API clients (fetchPrices.js)
│   │   ├── lib/                  # SDK clients (supabase.js)
│   │   ├── utils/                # Pure helpers (decompose, parseHoldingsCsv, colors, format)
│   │   ├── data/                 # Reference data (etf_data.json — source of truth)
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── App.css
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── eslint.config.js
│
├── api/                          # Vercel serverless functions (MUST live at repo root)
│   ├── price.js                  # Yahoo Finance price proxy
│   └── fxrate.js                 # USD/CAD FX proxy
│
├── backend/                      # BACKEND maintenance / non-runtime scripts
│   └── scripts/
│       └── importEtfData.js      # JSON → Supabase importer
│
├── database/                     # DATABASE (Supabase / Postgres schema)
│   ├── 001_etf_data.sql          # Tables: etf_metadata, etf_holdings, stock_info
│   └── 002_security_fixes.sql    # portfolios RLS + hardened delete_user()
│
├── .env                          # Local env vars (gitignored)
├── .gitignore
├── package.json                  # One package.json for the whole project
├── package-lock.json
├── vercel.json                   # Routes /api/* → backend/api/* and sets build paths
└── README.md
```

The three conceptual layers map to `frontend/` (React app), `api/` + `backend/` (serverless functions + maintenance scripts), and `database/` (Supabase SQL). `api/` lives at the repo root because Vercel requires it there — it can't be relocated via config. `vercel.json` at the root points the build at `frontend/` and sets the output directory.

---

## Local Development

This project uses Vercel serverless functions for price fetching, so use `vercel dev` (not `npm run dev`) — otherwise `/api/price` and `/api/fxrate` won't be served and shares-mode price fetching will silently fail.

```bash
npm install
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

Set the same variables in the Vercel project dashboard under Environment Variables.

---

## Database

Schema lives in [database/](database/). The Supabase tables (`etf_metadata`, `etf_holdings`, `stock_info`) mirror [frontend/src/data/etf_data.json](frontend/src/data/etf_data.json), which remains the source of truth for decomposition logic. To repopulate the tables from the JSON:

```bash
npm run import-etf
```

User-saved portfolios live in the `portfolios` table. `database/002_security_fixes.sql` enables Row-Level Security on it (owner-only access) and hardens the `delete_user()` account-deletion function. There is no migration tooling — run the `.sql` files directly in the Supabase SQL editor, in order.

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
- Yahoo Finance's unofficial API is used for live prices. It is not a guaranteed service and could change without notice.
- FX conversion for non-USD/CAD currencies treats the raw price as-is and derives the other side via the USD/CAD rate.

---

## About

Built by Austin Zhai, second-year Computer Engineering student at UBC. Personal project built to get hands-on experience with full-stack development, API design, and real-world data problems.
