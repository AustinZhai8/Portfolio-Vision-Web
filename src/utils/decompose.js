import ETF_DATA_RAW from '../data/etf_data.json';

const ETF_DATA = ETF_DATA_RAW.etfs;
const STOCK_DATA = ETF_DATA_RAW.stocks;

export const USDCAD = 1.385;

// Duplicate keys in the Python source: XSP and XSU both resolve to VFV.TO
// (later assignment wins, matching Python dict behaviour)
export const TICKER_ALIASES = {
  QQQM: 'QQQ',
  ITOT: 'VTI',
  XEQT: 'VEQT.TO',
  XSP: 'VFV.TO',
  XSU: 'VFV.TO',
};

export function resolveTicker(ticker) {
  const t = ticker.toUpperCase();
  if (TICKER_ALIASES[t]) return TICKER_ALIASES[t];
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
