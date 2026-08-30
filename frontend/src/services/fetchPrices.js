import { PRICE_ALIASES } from '../utils/decompose';

const STORAGE_KEY = 'pv_price_cache';

export function loadCacheFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch { return {}; }
}

export function saveCache(cache) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // Best-effort only: private browsing and quota-exceeded both throw here.
    // Losing the cache costs a refetch, so there is nothing to recover from.
  }
}

const priceCache = loadCacheFromStorage();

export function getCacheEntry(ticker) {
  return priceCache[ticker] || null;
}

export function getCachedPrice(ticker) {
  const entry = getCacheEntry(ticker);
  return entry ? entry.priceCAD : null;
}

export function getOldestFetchedAt(tickers) {
  let oldest = null;
  for (const ticker of tickers) {
    const entry = priceCache[ticker];
    if (!entry) continue;
    if (oldest === null || entry.fetchedAt < oldest) oldest = entry.fetchedAt;
  }
  return oldest;
}

async function fetchOnePrice(ticker) {
  try {
    const res = await fetch('/api/price?ticker=' + encodeURIComponent(ticker));
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.price == null) return null;
    return { price: parseFloat(data.price), currency: data.currency };
  } catch {
    return null;
  }
}

// Note: there is no cache-skip path — every call refetches each ticker from
// /api/price. The cache is written for getCachedPrice()/getOldestFetchedAt()
// to read, not to short-circuit this function. A `force` flag used to be
// accepted here and silently ignored; it was removed rather than left as a
// no-op that implies a behaviour that doesn't exist.
export async function fetchPrices(tickers, usdCadRate) {
  const now = Date.now();
  const result = {};
  const toFetch = [...new Set(tickers)];

  if (toFetch.length === 0) return result;

  let rate = usdCadRate;
  if (rate == null) {
    try {
      const res = await fetch('/api/fxrate');
      const data = await res.json();
      rate = typeof data?.rate === 'number' ? data.rate : 1.385;
    } catch {
      rate = 1.385;
    }
  }

  const fetched = await Promise.all(
    toFetch.map((t) => fetchOnePrice(PRICE_ALIASES[t] || t))
  );

  for (let i = 0; i < toFetch.length; i++) {
    const ticker = toFetch[i];
    const entry = fetched[i];
    if (!entry || isNaN(entry.price)) {
      result[ticker] = null;
      continue;
    }
    const { price, currency } = entry;
    const priceCAD = currency === 'CAD' ? price : price * rate;
    const priceUSD = currency === 'USD' ? price : price / rate;
    priceCache[ticker] = { priceCAD, priceUSD, fetchedAt: now };
    result[ticker] = priceCAD;
  }

  saveCache(priceCache);
  return result;
}
