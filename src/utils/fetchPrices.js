const CACHE_TTL = 24 * 60 * 60 * 1000;
const STORAGE_KEY = 'pv_price_cache';

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch { return {}; }
}

function saveToStorage(cache) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {}
}

const priceCache = loadFromStorage();

function isCad(ticker) {
  return ticker.endsWith('.TO') || ticker.endsWith('.V');
}

export function getCachedPrice(ticker) {
  const entry = priceCache[ticker];
  if (!entry) return null;
  if (Date.now() - entry.fetchedAt > CACHE_TTL) return null;
  return entry.priceCAD;
}

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

  const apiKey = import.meta.env.VITE_TWELVE_DATA_KEY;
  const symbols = toFetch.join(',');

  let rawData;
  try {
    const res = await fetch(
      `https://api.twelvedata.com/price?symbol=${encodeURIComponent(symbols)}&apikey=${apiKey}`
    );
    if (!res.ok) throw new Error('HTTP ' + res.status);
    rawData = await res.json();
  } catch {
    // If force-deleted entries before the failed fetch, persist the deletion
    if (force) saveToStorage(priceCache);
    for (const ticker of toFetch) result[ticker] = null;
    return result;
  }

  // Normalize: single-ticker response is { price: "..." }, multi-ticker is { TICKER: { price: "..." } }
  const normalized = toFetch.length === 1
    ? { [toFetch[0]]: rawData }
    : rawData;

  const usdTickers = toFetch.filter((t) => !isCad(t) && normalized[t]?.price != null);
  let usdCadRate = 1.385;
  if (usdTickers.length > 0) {
    try {
      const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=CAD');
      const data = await res.json();
      usdCadRate = data.rates.CAD;
    } catch { /* use built-in fallback */ }
  }

  for (const ticker of toFetch) {
    const entry = normalized[ticker];
    const price = entry?.price != null ? parseFloat(entry.price) : null;
    if (price == null || isNaN(price)) {
      result[ticker] = null;
      continue;
    }
    const priceCAD = isCad(ticker) ? price : price * usdCadRate;
    priceCache[ticker] = { priceCAD, fetchedAt: now };
    result[ticker] = priceCAD;
  }

  saveToStorage(priceCache);
  return result;
}
