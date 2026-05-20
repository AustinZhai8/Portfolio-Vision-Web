import ETF_DATA_RAW from '../data/etf_data.json';

const ETF_DATA = ETF_DATA_RAW.etfs;
const STOCK_DATA = ETF_DATA_RAW.stocks;

export const USDCAD = 1.385;

// Maps input ticker → ETF/stock DB key. Two patterns:
//   (a) ETFs that share holdings collapse onto a single data entry (XEQT → VEQT.TO)
//   (b) Internal holdings-list tickers normalize to the canonical DB key (SHOP.TO → SHOP)
// Used only by resolveTicker for DB lookups. Does NOT affect price fetching.
export const HOLDINGS_ALIASES = {
  // Holdings-equivalence (ETF shares same basket as target)
  XEQT: 'VEQT.TO',
  XSP: 'VFV.TO',
  XSU: 'VFV.TO',
  VSP: 'VFV.TO',
  ZSP: 'VFV.TO',
  ZNQ: 'QQC.TO',
  QQQM: 'QQQ',
  ITOT: 'VTI',
  YINN: 'FXI',
  // Commodity-name conveniences (so decompose finds the proxy ETF entry)
  GOLD: 'GLD',
  SILVER: 'SLV',
  SVR: 'SLV',
  COPPER: 'CPER',
  PLATINUM: 'PPLT',
  PALLADIUM: 'PALL',
  OIL: 'USO',
  NATURALGAS: 'UNG',
  'NATURAL GAS': 'UNG',
  // Crypto convenience aliases (full-name → canonical ticker for decompose/display)
  BITCOIN: 'BTC', ETHEREUM: 'ETH', CARDANO: 'ADA',
  DOGECOIN: 'DOGE', LITECOIN: 'LTC', SOLANA: 'SOL',
  // Single-stock input convenience (bare → DB key form)
  FINN: 'FINN.TO',
  T: 'T.TO',
  AQN: 'AQN.TO',
  MX: 'MX.TO',
  BAM: 'BAM.TO',
  // Internal holdings-list normalizations (foreign-suffix form → existing DB key)
  'SHOP.TO': 'SHOP',
  'BN.TO': 'BN',
  'TOU.TO': 'TOU',
  'WCP.TO': 'WCP',
  'ARX.TO': 'ARX',
  'AZN.L': 'AZN',
  'NESN.SW': 'NSRGY',
  'SHEL.L': 'SHEL',
  '7203.T': 'TM',
  'NOVO-B.CO': 'NVO',
  '0700.HK': '700',
  '9988.HK': '9988',
  '6857.T': '6857',
  // Bare → .TO form for ETFs that have a .TO DB entry
  ZEB: 'ZEB.TO',
  FCCM: 'FCCM.TO',
  FEQT: 'FEQT.TO',
  FBAL: 'FBAL.TO',
  FGRO: 'FGRO.TO',
};

// Maps input ticker → Yahoo Finance symbol.
// Used only by fetchPrices when querying /api/price. Does NOT affect decompose.
export const PRICE_ALIASES = {
  // ETFs whose holdings collapse via HOLDINGS_ALIASES but whose own listing
  // has a distinct live price on Yahoo.
  XEQT: 'XEQT.TO',
  XSP: 'XSP.TO',
  XSU: 'XSU.TO',
  VSP: 'VSP.TO',
  ZSP: 'ZSP.TO',
  ZNQ: 'ZNQ.TO',
  VFV: 'VFV.TO',
  // Single-stock bare-input → Canadian-listing Yahoo symbol
  T: 'T.TO',
  AQN: 'AQN.TO',
  MX: 'MX.TO',
  // FINN/FEQT trade on Cboe Canada — Yahoo wants the .NE suffix
  FINN: 'FINN.NE',
  'FINN.TO': 'FINN.NE',
  FEQT: 'FEQT.NE',
  'FEQT.TO': 'FEQT.NE',
  // Crypto — Yahoo Finance requires the -USD suffix
  BTC: 'BTC-USD', BITCOIN: 'BTC-USD',
  ETH: 'ETH-USD', ETHEREUM: 'ETH-USD',
  BNB: 'BNB-USD',
  XRP: 'XRP-USD',
  ADA: 'ADA-USD', CARDANO: 'ADA-USD',
  DOGE: 'DOGE-USD', DOGECOIN: 'DOGE-USD',
  AVAX: 'AVAX-USD',
  DOT: 'DOT-USD',
  LINK: 'LINK-USD',
  LTC: 'LTC-USD', LITECOIN: 'LTC-USD',
  SOL: 'SOL-USD', SOLANA: 'SOL-USD',
  // Commodity-name conveniences (user types "GOLD", proxy ETF gets priced)
  GOLD: 'GLD',
  SILVER: 'SLV',
  SVR: 'SLV',
  COPPER: 'CPER',
  PLATINUM: 'PPLT',
  PALLADIUM: 'PALL',
  OIL: 'USO',
  NATURALGAS: 'UNG',
  'NATURAL GAS': 'UNG',
  // ZEB (BMO Equal Weight Banks) — TSX listing
  ZEB: 'ZEB.TO',
  // Fidelity Canada ETFs listed on Cboe Canada (formerly NEO Exchange).
  // The DB stores them under .TO keys but Yahoo only serves them at .NE,
  // so map both the bare and .TO forms to the .NE symbol.
  FCCM: 'FCCM.NE',
  'FCCM.TO': 'FCCM.NE',
  FBAL: 'FBAL.NE',
  'FBAL.TO': 'FBAL.NE',
  FCNS: 'FCNS.NE',
  'FCNS.TO': 'FCNS.NE',
  FGRO: 'FGRO.NE',
  'FGRO.TO': 'FGRO.NE',
  FCIQ: 'FCIQ.NE',
  'FCIQ.TO': 'FCIQ.NE',
};

export function resolveTicker(ticker) {
  const t = ticker.toUpperCase();
  if (HOLDINGS_ALIASES[t]) return HOLDINGS_ALIASES[t];
  if (!ETF_DATA[t] && !STOCK_DATA[t]) {
    const candidate = t + '.TO';
    if (ETF_DATA[candidate] || STOCK_DATA[candidate]) return candidate;
  }
  return t;
}

export function displayTicker(ticker) {
  return ticker.endsWith('.TO') ? ticker.slice(0, -3) : ticker;
}

export function inferCurrency(ticker) {
  const t = resolveTicker(ticker.toUpperCase());
  return t.endsWith('.TO') || t.endsWith('.F') ? 'CAD' : 'USD';
}

export function convertAmount(amount, fromCcy, toCcy) {
  if (fromCcy === toCcy) return amount;
  if (fromCcy === 'USD' && toCcy === 'CAD') return amount * USDCAD;
  return amount / USDCAD;
}

function getHoldings(etfTicker) {
  const etf = ETF_DATA[resolveTicker(etfTicker)];
  if (!etf) return null;
  if (etf.holdings_same_as) return getHoldings(etf.holdings_same_as);
  return etf.holdings;
}

export function isEtf(ticker) {
  return !!ETF_DATA[resolveTicker(ticker)];
}

export function isKnownTicker(ticker) {
  const resolved = resolveTicker(ticker.toUpperCase());
  return !!ETF_DATA[resolved] || !!STOCK_DATA[resolved];
}

export function getStockInfo(ticker) {
  const info = STOCK_DATA[resolveTicker(ticker)] || {};
  return {
    name: info.name || ticker,
    sector: info.sector || 'Unknown',
    country: info.country || 'Unknown',
  };
}

export function getEtfName(ticker) {
  const etf = ETF_DATA[resolveTicker(ticker)];
  return etf?.name || ticker;
}

// Returns [{ source: rawInputTicker, sourceName, amount, isEtf }] for a given output ticker
export function decomposeContributions(portfolio, targetTicker) {
  const target = resolveTicker(targetTicker.toUpperCase());
  const contributions = [];
  for (const [rawTicker, amount] of Object.entries(portfolio)) {
    const ticker = resolveTicker(rawTicker.toUpperCase());
    const contrib = _traceContribution(ticker, amount, target, 0);
    if (contrib > 0.005) {
      const etf = isEtf(ticker);
      contributions.push({
        source: rawTicker,
        sourceName: etf ? getEtfName(ticker) : getStockInfo(ticker).name,
        amount: contrib,
        isEtf: etf,
      });
    }
  }
  return contributions.sort((a, b) => b.amount - a.amount);
}

function _traceContribution(ticker, amount, targetTicker, depth) {
  if (depth > 5) return 0;
  if (!isEtf(ticker)) return ticker === targetTicker ? amount : 0;
  const holdings = getHoldings(ticker);
  if (!holdings) return 0;
  let total = 0;
  for (const h of holdings) {
    const sub = resolveTicker(h.ticker.toUpperCase());
    total += _traceContribution(sub, amount * (h.weight / 100), targetTicker, depth + 1);
  }
  return total;
}

// portfolio: { ticker: dollarAmount } — amounts in a single consistent currency
// Returns { result: { stockTicker: amount }, unknown: string[] }
export function decompose(portfolio, _depth = 0) {
  if (_depth > 5) return { result: {}, unknown: [] };

  const result = {};
  const unknown = [];

  for (const [rawTicker, amount] of Object.entries(portfolio)) {
    const ticker = resolveTicker(rawTicker);

    if (isEtf(ticker)) {
      const holdings = getHoldings(ticker);
      if (!holdings) {
        unknown.push(ticker);
        continue;
      }

      for (const holding of holdings) {
        const fraction = holding.weight / 100;
        const subTicker = resolveTicker(holding.ticker.toUpperCase());
        const subAmount = amount * fraction;

        if (isEtf(subTicker)) {
          const { result: subResult, unknown: subUnknown } = decompose(
            { [subTicker]: subAmount },
            _depth + 1,
          );
          for (const [k, v] of Object.entries(subResult)) {
            result[k] = (result[k] || 0) + v;
          }
          unknown.push(...subUnknown);
        } else {
          result[subTicker] = (result[subTicker] || 0) + subAmount;
        }
      }
    } else {
      result[ticker] = (result[ticker] || 0) + amount;
    }
  }

  return { result, unknown };
}

export function breakdownBySector(decomposed) {
  const sectors = {};
  for (const [ticker, amount] of Object.entries(decomposed)) {
    const { sector } = getStockInfo(ticker);
    sectors[sector] = (sectors[sector] || 0) + amount;
  }
  return Object.fromEntries(Object.entries(sectors).sort(([, a], [, b]) => b - a));
}

export function breakdownByCountry(decomposed) {
  const countries = {};
  for (const [ticker, amount] of Object.entries(decomposed)) {
    const { country } = getStockInfo(ticker);
    countries[country] = (countries[country] || 0) + amount;
  }
  return Object.fromEntries(Object.entries(countries).sort(([, a], [, b]) => b - a));
}
