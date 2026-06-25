// Parses a broker holdings-export CSV (Wealthsimple format) into portfolio rows.
//
// Most holdings import as SHARE rows (ticker + quantity) so the app prices them
// live. The exception is CAD-hedged CDRs: a CDR's share count can't be priced
// against the underlying US ticker, so those import as a fixed CAD dollar-amount
// row using the export's own Market Value. Options/short positions are skipped.
//
// Returns { holdings, summary, error }. On a recognizable-but-wrong file the
// `error` string is set and `holdings` is empty.

// Quote-aware CSV tokenizer. Handles commas inside quotes, "" escapes, and
// \r\n / \n line endings. Returns an array of string-cell arrays.
function tokenize(text) {
  const rows = [];
  let field = '';
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (c !== '\r') {
      field += c;
    }
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

const REQUIRED = ['symbol', 'name', 'security type', 'quantity', 'market value', 'market value currency'];

function isCadHedged(name) {
  return /cad hedged/i.test(name) || /\bcdr\b/i.test(name);
}

export function parseHoldingsCsv(text) {
  const empty = { holdings: [], summary: { imported: 0, cadHedged: 0, skippedOptions: 0 }, error: null };

  const rows = tokenize(text).filter((r) => r.some((cell) => cell.trim() !== ''));
  if (rows.length < 2) {
    return { ...empty, error: 'The file appears to be empty.' };
  }

  // Header → index map (case-insensitive, trimmed).
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const col = {};
  header.forEach((h, i) => { if (!(h in col)) col[h] = i; });

  const missing = REQUIRED.filter((key) => !(key in col));
  if (missing.length) {
    return { ...empty, error: `This doesn't look like a Wealthsimple holdings export (missing columns: ${missing.join(', ')}).` };
  }

  const get = (row, key) => (col[key] != null ? (row[col[key]] ?? '').trim() : '');

  // Aggregate duplicates across accounts so the same ticker shows once.
  const sharesByTicker = new Map();          // ticker -> summed quantity
  const amountByKey = new Map();             // `ticker|currency` -> { ticker, currency, amount }
  let skippedOptions = 0;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const symbol = get(row, 'symbol').toUpperCase();
    if (!symbol) continue;

    const securityType = get(row, 'security type').toUpperCase();
    const direction = get(row, 'position direction').toUpperCase();
    if (securityType === 'OPTION' || direction === 'SHORT') {
      skippedOptions++;
      continue;
    }

    const name = get(row, 'name');

    if (isCadHedged(name)) {
      const value = parseFloat(get(row, 'market value'));
      if (!value || value <= 0) continue;
      const currency = get(row, 'market value currency').toUpperCase() || 'CAD';
      const key = `${symbol}|${currency}`;
      const existing = amountByKey.get(key);
      if (existing) existing.amount += value;
      else amountByKey.set(key, { ticker: symbol, currency, amount: value });
    } else {
      const qty = parseFloat(get(row, 'quantity'));
      if (!qty || qty <= 0) continue;
      sharesByTicker.set(symbol, (sharesByTicker.get(symbol) || 0) + qty);
    }
  }

  const holdings = [];
  for (const [ticker, qty] of sharesByTicker) {
    holdings.push({ ticker, inputType: 'shares', shares: String(parseFloat(qty.toFixed(6))) });
  }
  for (const { ticker, currency, amount } of amountByKey.values()) {
    holdings.push({ ticker, inputType: 'amount', amount: String(parseFloat(amount.toFixed(2))), currency });
  }

  if (holdings.length === 0) {
    return { ...empty, error: 'No importable holdings were found in this file.' };
  }

  return {
    holdings,
    summary: { imported: holdings.length, cadHedged: amountByKey.size, skippedOptions },
    error: null,
  };
}
