// One-time importer that mirrors frontend/src/data/etf_data.json into Supabase.
// Run with: npm run import-etf  (or: node backend/scripts/importEtfData.js)
//
// The JSON file remains the source of truth for decomposition. This script
// just keeps the Supabase tables in sync for admin/audit access.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..', '..');

function loadEnv() {
  const envPath = resolve(projectRoot, '.env');
  const env = {};
  try {
    const raw = readFileSync(envPath, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      env[key] = value;
    }
  } catch (err) {
    throw new Error(`Could not read .env at ${envPath}: ${err.message}`);
  }
  return env;
}

const env = loadEnv();
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const dataPath = resolve(projectRoot, 'frontend/src/data/etf_data.json');
const raw = JSON.parse(readFileSync(dataPath, 'utf8'));
const etfs = raw.etfs || {};
const stocks = raw.stocks || {};

async function upsertChunked(table, rows, conflictTarget) {
  const CHUNK = 500;
  let ok = 0;
  let failed = 0;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const slice = rows.slice(i, i + CHUNK);
    const { error } = await supabase
      .from(table)
      .upsert(slice, conflictTarget ? { onConflict: conflictTarget } : undefined);
    if (error) {
      failed += slice.length;
      console.error(`  ${table} chunk ${i}–${i + slice.length} failed:`, error.message);
    } else {
      ok += slice.length;
    }
  }
  return { ok, failed };
}

async function importMetadata() {
  const rows = Object.entries(etfs).map(([ticker, e]) => ({
    ticker,
    name: e.name ?? null,
    exchange: e.exchange ?? null,
    currency: e.currency ?? null,
    description: e.description ?? null,
    holdings_same_as: e.holdings_same_as ?? null,
  }));
  console.log(`etf_metadata: upserting ${rows.length} rows...`);
  const r = await upsertChunked('etf_metadata', rows, 'ticker');
  console.log(`  ok=${r.ok} failed=${r.failed}`);
  return r;
}

async function importHoldings() {
  const rows = [];
  for (const [etfTicker, e] of Object.entries(etfs)) {
    if (!Array.isArray(e.holdings)) continue;
    for (const h of e.holdings) {
      if (!h?.ticker) continue;
      rows.push({
        etf_ticker: etfTicker,
        holding_ticker: h.ticker,
        holding_name: h.name ?? null,
        weight: typeof h.weight === 'number' ? h.weight : null,
      });
    }
  }
  console.log(`etf_holdings: deleting existing rows then inserting ${rows.length}...`);
  const { error: delErr } = await supabase.from('etf_holdings').delete().neq('id', 0);
  if (delErr) {
    console.error('  delete failed:', delErr.message);
    return { ok: 0, failed: rows.length };
  }
  let ok = 0;
  let failed = 0;
  const CHUNK = 500;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const slice = rows.slice(i, i + CHUNK);
    const { error } = await supabase.from('etf_holdings').insert(slice);
    if (error) {
      failed += slice.length;
      console.error(`  insert chunk ${i}–${i + slice.length} failed:`, error.message);
    } else {
      ok += slice.length;
    }
  }
  console.log(`  ok=${ok} failed=${failed}`);
  return { ok, failed };
}

async function importStocks() {
  const rows = Object.entries(stocks).map(([ticker, s]) => ({
    ticker,
    name: s.name ?? null,
    sector: s.sector ?? null,
    country: s.country ?? null,
  }));
  console.log(`stock_info: upserting ${rows.length} rows...`);
  const r = await upsertChunked('stock_info', rows, 'ticker');
  console.log(`  ok=${r.ok} failed=${r.failed}`);
  return r;
}

const m = await importMetadata();
const h = await importHoldings();
const s = await importStocks();

console.log('---');
console.log(`Done. metadata ok=${m.ok}/failed=${m.failed} | holdings ok=${h.ok}/failed=${h.failed} | stocks ok=${s.ok}/failed=${s.failed}`);
if (m.failed || h.failed || s.failed) process.exit(1);
