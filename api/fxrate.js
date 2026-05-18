export default async function handler(req, res) {
  try {
    const upstream = await fetch('https://api.frankfurter.app/latest?from=USD&to=CAD');
    const data = await upstream.json();
    const rate = data?.rates?.CAD;
    if (typeof rate !== 'number') {
      res.status(200).json({ rate: 1.385 });
      return;
    }
    res.status(200).json({ rate });
  } catch {
    res.status(200).json({ rate: 1.385 });
  }
}
