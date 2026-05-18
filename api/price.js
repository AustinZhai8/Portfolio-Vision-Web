export default async function handler(req, res) {
  const ticker = req.query?.ticker;
  if (!ticker) {
    res.status(400).json({ error: 'ticker query param required' });
    return;
  }

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}`;
    const upstream = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    const json = await upstream.json();
    const meta = json?.chart?.result?.[0]?.meta;
    const price = meta?.regularMarketPrice;
    if (price == null) {
      res.status(404).json({ error: 'price not found', ticker });
      return;
    }
    res.status(200).json({ ticker, price, currency: meta.currency });
  } catch (err) {
    res.status(500).json({ error: err?.message || 'unknown error', ticker });
  }
}
