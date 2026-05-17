const priceCache = {};
const CACHE_TTL = 5 * 60 * 1000;

export async function fetchPrices(tickers, { force = false } = {}) {
  const now = Date.now();
  const result = {};
  const toFetch = [];

  for (const ticker of tickers) {
    if (!force) {
      const cached = priceCache[ticker];
      if (cached && now - cached.fetchedAt < CACHE_TTL) {
        result[ticker] = cached.priceCAD;
        continue;
      }
    } else {
      delete priceCache[ticker];
    }
    toFetch.push(ticker);
  }

  if (toFetch.length === 0) return result;

  const rawResults = await Promise.all(
    toFetch.map(async (ticker) => {
      try {
        const res = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}`
        );
        if (!res.ok) return { ticker, price: null, currency: null };
        const data = await res.json();
        const meta = data.chart?.result?.[0]?.meta;
        if (!meta?.regularMarketPrice) return { ticker, price: null, currency: null };
        return {
          ticker,
          price: meta.regularMarketPrice,
          currency: (meta.currency ?? 'USD').toUpperCase(),
        };
      } catch {
        return { ticker, price: null, currency: null };
      }
    })
  );

  const needsConversion = rawResults.some((r) => r.price != null && r.currency !== 'CAD');
  let usdCadRate = 1.385;
  if (needsConversion) {
    try {
      const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=CAD');
      const data = await res.json();
      usdCadRate = data.rates.CAD;
    } catch { /* use built-in fallback */ }
  }

  for (const { ticker, price, currency } of rawResults) {
    if (price == null) {
      result[ticker] = null;
      continue;
    }
    const priceCAD = currency === 'CAD' ? price : price * usdCadRate;
    priceCache[ticker] = { priceCAD, fetchedAt: now };
    result[ticker] = priceCAD;
  }

  return result;
}
