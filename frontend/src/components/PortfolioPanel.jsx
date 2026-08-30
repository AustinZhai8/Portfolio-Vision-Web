import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { convertAmount, isEtf, isKnownTicker, inferCurrency } from '../utils/decompose';
import { fmtMoney } from '../utils/format';
import { fetchPrices, getCachedPrice, getOldestFetchedAt } from '../services/fetchPrices';
import { supabase } from '../lib/supabase';
import Seg from './Seg';
import Modal from './Modal';
import PortfolioSwitcher from './PortfolioSwitcher';
import ImportCsvModal from './ImportCsvModal';
import HowItWorksModal from './HowItWorksModal';

function autoType(ticker) {
  const t = ticker.trim().toUpperCase();
  if (!t) return '';
  if (isEtf(t)) return 'ETF';
  if (isKnownTicker(t)) return 'Stock';
  return 'Unknown';
}

// ── Name-a-new-portfolio modal ─────────────────────────────────────────────
function SaveNameModal({ onSave, onClose }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) { setError('Enter a portfolio name.'); return; }
    setLoading(true);
    setError('');
    const err = await onSave(trimmed);
    if (err) { setError(err); setLoading(false); }
  }

  return (
    <Modal title="Save portfolio" onClose={onClose} width={380}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <input
          ref={inputRef}
          className="pv-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Portfolio name"
          maxLength={64}
        />
        {error && <div style={{ fontSize: 12.5, color: 'var(--red)' }}>{error}</div>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} className="pv-btn-ghost">Cancel</button>
          <button type="submit" disabled={loading} className="pv-btn-primary" style={{ padding: '9px 22px', fontSize: 14, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── Overwrite-existing-portfolio confirmation ──────────────────────────────
function OverrideConfirmModal({ name, onConfirm, onClose }) {
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  }

  return (
    <Modal title="Overwrite portfolio?" onClose={onClose} width={380}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ fontSize: 13.5, color: 'var(--text2)', lineHeight: 1.5 }}>
          This replaces the saved version of <strong style={{ color: 'var(--text)' }}>&quot;{name || 'Untitled portfolio'}&quot;</strong> with your current changes. This can&apos;t be undone.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} className="pv-btn-ghost">Cancel</button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="pv-btn-primary"
            style={{ padding: '9px 22px', fontSize: 14, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Saving…' : 'Overwrite'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Position row (build screen) ────────────────────────────────────────────
function PositionRow({ row, onChange, onRemove, onTickerBlur, isUnknown }) {
  const set = (field, val) => onChange(row.id, field, val);
  const isShares = row.inputType === 'shares';
  return (
    <div className="pos-row">
      <input
        value={row.ticker}
        maxLength={8}
        placeholder="Ticker"
        onChange={(e) => set('ticker', e.target.value.toUpperCase())}
        onBlur={() => onTickerBlur(row.id)}
        className="pv-input pos-ticker"
        style={{ fontWeight: 700, letterSpacing: '0.03em', color: isUnknown ? 'var(--amber)' : 'var(--text)' }}
      />
      <div className="pos-value">
        <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 13.5, color: 'var(--text3)', fontWeight: 600, pointerEvents: 'none' }}>{isShares ? '#' : '$'}</span>
        <input
          type="number"
          min="0"
          step="any"
          value={isShares ? row.shares : row.amount}
          placeholder={isShares ? 'Shares' : 'Amount'}
          onChange={(e) => set(isShares ? 'shares' : 'amount', e.target.value)}
          className="pv-input"
          style={{ width: '100%', paddingLeft: 28, fontVariantNumeric: 'tabular-nums' }}
        />
      </div>
      <div className="pos-type">
        <Seg small value={row.inputType} onChange={(v) => set('inputType', v)}
          options={[{ value: 'amount', label: '$' }, { value: 'shares', label: '#' }]} />
      </div>
      <div className="pos-ccy">
        {!isShares && (
          <Seg small value={row.currency} onChange={(v) => set('currency', v)}
            options={[{ value: 'USD', label: 'USD' }, { value: 'CAD', label: 'CAD' }]} />
        )}
      </div>
      <button
        type="button"
        onClick={() => onRemove(row.id)}
        title="Remove"
        className="pos-del"
        style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 16, lineHeight: 1, width: 28, height: 28, borderRadius: 999, transition: 'color 0.12s, background 0.12s' }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'var(--seg-bg)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text3)'; e.currentTarget.style.background = 'none'; }}
      >
        ✕
      </button>
    </div>
  );
}

export default function PortfolioPanel({
  rows,
  setRows,
  rowErrors,
  setRowErrors,
  onDecomposeComputed,
  displayCurrency,
  nextId,
  defaultInputType,
  setDefaultInputType,
  user,
  onOpenAuth,
  onLoadPortfolio,
  onStartTour,
}) {
  const [priceFetching, setPriceFetching] = useState(false);
  const [pricesFetchedAt, setPricesFetchedAt] = useState(null);
  const [priceError, setPriceError] = useState('');
  const [priceStatusMsg, setPriceStatusMsg] = useState('');

  const [sortFrozen, setSortFrozen] = useState(false);
  const frozenOrderRef = useRef(null);
  const freezeTimerRef = useRef(null);

  const [saveOpen, setSaveOpen] = useState(false);
  const [overrideTarget, setOverrideTarget] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [showHow, setShowHow] = useState(false);
  const [portfolios, setPortfolios] = useState([]);
  const [pfError, setPfError] = useState('');
  const [loadedPortfolioId, setLoadedPortfolioId] = useState(null);
  const [sortMode, setSortMode] = useState('default');
  const [dirty, setDirty] = useState(false);

  function freezeSort() {
    if (freezeTimerRef.current) clearTimeout(freezeTimerRef.current);
    setSortFrozen(true);
  }
  function scheduleUnfreeze() {
    if (freezeTimerRef.current) clearTimeout(freezeTimerRef.current);
    freezeTimerRef.current = setTimeout(() => {
      setSortFrozen(false);
      freezeTimerRef.current = null;
    }, 250);
  }

  useEffect(() => {
    if (user) fetchPortfolios();
    else { setPortfolios([]); setLoadedPortfolioId(null); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function fetchPortfolios() {
    setPfError('');
    const { data, error } = await supabase
      .from('portfolios')
      .select('id, name, holdings, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) { setPfError('Failed to load portfolios.'); return; }
    setPortfolios(data || []);
  }

  function buildHoldingsPayload() {
    return rows
      .filter((r) => r.ticker.trim() && (r.inputType === 'shares' ? r.shares : r.amount))
      .map((r) => ({
        ticker: r.ticker.trim().toUpperCase(),
        inputType: r.inputType,
        ...(r.inputType === 'shares'
          ? { shares: r.shares }
          : { amount: r.amount, currency: r.currency }),
      }));
  }

  const currentPortfolio = portfolios.find((p) => p.id === loadedPortfolioId);

  async function saveNew(name) {
    const holdings = buildHoldingsPayload();
    const { data, error } = await supabase
      .from('portfolios')
      .insert({ user_id: user.id, name, holdings })
      .select('id, name, holdings, created_at')
      .single();
    if (error) return error.message;
    setSaveOpen(false);
    setDirty(false);
    if (data) setLoadedPortfolioId(data.id);
    fetchPortfolios();
    return null;
  }

  async function saveOverride(id) {
    const holdings = buildHoldingsPayload();
    const name = portfolios.find((p) => p.id === id)?.name;
    const { error } = await supabase.from('portfolios').update({ holdings, name }).eq('id', id);
    if (error) { setPfError(error.message); return; }
    setLoadedPortfolioId(id);
    setDirty(false);
    fetchPortfolios();
  }

  function handleSwitcherSave() {
    if (loadedPortfolioId) setOverrideTarget({ id: loadedPortfolioId, name: currentPortfolio?.name });
    else setSaveOpen(true);
  }

  async function handleDelete(id) {
    const { error } = await supabase.from('portfolios').delete().eq('id', id);
    if (error) { setPfError('Failed to delete.'); return; }
    if (id === loadedPortfolioId) setLoadedPortfolioId(null);
    setPortfolios((prev) => prev.filter((p) => p.id !== id));
  }

  function handleLoad(portfolio) {
    const raw = portfolio.holdings;
    const rawRows = Array.isArray(raw) ? raw : (raw ?? []);
    setLoadedPortfolioId(portfolio.id);
    setPricesFetchedAt(null);
    setPriceError('');
    setDirty(false);
    onLoadPortfolio(rawRows);
  }

  function handleNewPortfolio() {
    setRows([]);
    setRowErrors({});
    setLoadedPortfolioId(null);
    setSortMode('default');
    setPricesFetchedAt(null);
    setPriceError('');
    setDirty(false);
  }

  function addRow() {
    setRows((prev) => [...prev, {
      id: nextId(), ticker: '', inputType: defaultInputType, amount: '', currency: 'USD', shares: '',
    }]);
    setSortMode('default');
    setDirty(true);
  }

  function rowDisplayValue(row) {
    if (row.inputType === 'amount') {
      return convertAmount(parseFloat(row.amount) || 0, row.currency, displayCurrency);
    }
    const shares = parseFloat(row.shares) || 0;
    if (!shares || !row.ticker.trim()) return 0;
    const priceCAD = getCachedPrice(row.ticker.trim().toUpperCase());
    if (priceCAD == null) return 0;
    return convertAmount(shares * priceCAD, 'CAD', displayCurrency);
  }

  function getSortedRows() {
    if (sortMode === 'default') return rows;

    if (sortFrozen && frozenOrderRef.current) {
      const rowMap = new Map(rows.map((r) => [r.id, r]));
      const ordered = frozenOrderRef.current.map((id) => rowMap.get(id)).filter(Boolean);
      const frozenSet = new Set(frozenOrderRef.current);
      rows.forEach((r) => { if (!frozenSet.has(r.id)) ordered.push(r); });
      return ordered;
    }

    const sorted = [...rows];
    switch (sortMode) {
      case 'value-high': sorted.sort((a, b) => rowDisplayValue(b) - rowDisplayValue(a)); break;
      case 'value-low': sorted.sort((a, b) => rowDisplayValue(a) - rowDisplayValue(b)); break;
      case 'ticker-az': sorted.sort((a, b) => a.ticker.localeCompare(b.ticker)); break;
      case 'ticker-za': sorted.sort((a, b) => b.ticker.localeCompare(a.ticker)); break;
    }
    frozenOrderRef.current = sorted.map((r) => r.id);
    return sorted;
  }

  function removeRow(id) {
    setRows((prev) => prev.filter((r) => r.id !== id));
    setRowErrors((prev) => { const next = { ...prev }; delete next[id]; return next; });
    setDirty(true);
  }

  function handleTickerBlur(id) {
    setRows((prev) => {
      const row = prev.find((r) => r.id === id);
      if (!row || !row.ticker.trim()) return prev;
      const ticker = row.ticker.trim().toUpperCase();
      const allMatching = prev.filter(
        (r) => r.ticker.trim().toUpperCase() === ticker && r.inputType === row.inputType,
      );
      if (allMatching.length < 2) return prev;

      const keeper = allMatching[0];
      const mergedIds = new Set(allMatching.map((r) => r.id));

      if (row.inputType === 'shares') {
        const total = allMatching.reduce((s, r) => s + (parseFloat(r.shares) || 0), 0);
        return prev
          .filter((r) => !mergedIds.has(r.id) || r.id === keeper.id)
          .map((r) => r.id === keeper.id ? { ...r, shares: String(parseFloat(total.toFixed(4))) } : r);
      }

      const merged = allMatching.reduce((sum, r) => sum + convertAmount(parseFloat(r.amount) || 0, r.currency, keeper.currency), 0);
      return prev
        .filter((r) => !mergedIds.has(r.id) || r.id === keeper.id)
        .map((r) => r.id === keeper.id ? { ...r, amount: String(parseFloat(merged.toFixed(2))) } : r);
    });
    setRowErrors((prev) => { const next = { ...prev }; delete next[id]; return next; });
  }

  function updateRow(id, field, value) {
    setDirty(true);
    if (field === 'inputType' || field === 'currency') freezeSort();
    setRows((prev) => prev.map((r) => {
      if (r.id !== id) return r;
      const updated = { ...r, [field]: value };
      if (field === 'ticker' && value.trim()) {
        const ticker = value.trim().toUpperCase();
        if (r.inputType === 'amount' && isKnownTicker(ticker)) {
          updated.currency = inferCurrency(ticker);
        }
      }
      return updated;
    }));
    if (rowErrors[id]) {
      setRowErrors((prev) => { const next = { ...prev }; delete next[id]; return next; });
    }
  }

  // Validates rows, fetches live prices for share rows, converts them to
  // amount+CAD, and commits via onDecomposeComputed. A # (shares) row whose
  // ticker Yahoo can't price gets switched to $ entry instead of blocking the
  // rest of the portfolio from decomposing, since shares × unknown price has
  // no dollar value to compute.
  async function runDecompose(targetRows = rows) {
    const errors = {};
    for (const row of targetRows) {
      const ticker = row.ticker.trim();
      if (!ticker) {
        errors[row.id] = 'Ticker required';
      } else if (row.inputType === 'shares') {
        const shares = parseFloat(row.shares);
        if (!shares || shares <= 0) errors[row.id] = 'Enter a positive number of shares';
      } else {
        const amount = parseFloat(row.amount);
        if (!amount || amount <= 0) errors[row.id] = 'Enter a positive amount';
      }
    }
    if (Object.keys(errors).length > 0) { setRowErrors(errors); return; }

    const shareRows = targetRows.filter((r) => r.inputType === 'shares' && r.ticker.trim());
    let prices = {};
    if (shareRows.length > 0) {
      setPriceFetching(true);
      setPriceError('');
      setRowErrors({});
      const tickers = [...new Set(shareRows.map((r) => r.ticker.trim().toUpperCase()))];
      try {
        prices = await fetchPrices(tickers);
      } catch {
        setPriceError('Failed to fetch prices. Check your connection.');
        setPriceFetching(false);
        return;
      }
      setPriceFetching(false);
    }

    const priceErrors = {};
    for (const row of shareRows) {
      const t = row.ticker.trim().toUpperCase();
      if (prices[t] == null) priceErrors[row.id] = 'No live price found. Enter a dollar amount instead.';
    }

    if (Object.keys(priceErrors).length > 0) {
      // Can't turn a share count into a dollar value without a price, so switch
      // these rows to $ entry instead of dropping the position altogether.
      setRows((prev) => prev.map((r) => (priceErrors[r.id] ? { ...r, inputType: 'amount', amount: '' } : r)));
    }

    const mergedRows = targetRows
      .filter((row) => !priceErrors[row.id])
      .map((row) => {
        const ticker = row.ticker.trim().toUpperCase();
        if (row.inputType === 'shares') {
          const priceCAD = prices[ticker];
          return { id: row.id, ticker, amount: String(parseFloat(row.shares) * priceCAD), currency: 'CAD' };
        }
        return { id: row.id, ticker, amount: row.amount, currency: row.currency };
      });

    if (targetRows.length > 0 && mergedRows.length === 0) {
      setRowErrors(priceErrors);
      setPriceError("Couldn't get a live price for any position. Switch them to $ and enter an amount instead.");
      return;
    }

    if (shareRows.length > 0) {
      const tickers = [...new Set(shareRows.map((r) => r.ticker.trim().toUpperCase()))];
      const oldest = getOldestFetchedAt(tickers);
      setPricesFetchedAt(oldest ? new Date(oldest) : new Date());
    }
    // Leave any price-unavailable rows flagged so they're still visible if the
    // user comes back to Build; the Results screen itself gets a one-line notice
    // (passed up since this component unmounts once `screen` flips away).
    setRowErrors(priceErrors);
    const skipped = [...new Set(shareRows.filter((r) => priceErrors[r.id]).map((r) => r.ticker.trim().toUpperCase()))];
    const notice = skipped.length > 0
      ? `Couldn't find a live price for ${skipped.join(', ')}, so ${skipped.length === 1 ? "it's" : "they're"} now set to $ entry. Go back and add an amount to include ${skipped.length === 1 ? 'it' : 'them'}.`
      : '';
    onDecomposeComputed(mergedRows, notice);
  }

  async function handleImport(holdings, summary) {
    const newRows = holdings.map((h) => ({
      id: nextId(),
      ticker: h.ticker ?? '',
      inputType: h.inputType ?? 'shares',
      amount: h.amount ?? '',
      currency: h.currency ?? 'USD',
      shares: h.shares ?? '',
    }));
    setRows(newRows);
    setRowErrors({});
    setSortMode('default');
    setLoadedPortfolioId(null);
    setPricesFetchedAt(null);
    setPriceError('');
    setImportOpen(false);
    setDirty(true);

    const parts = [`Imported ${summary.imported} holding${summary.imported === 1 ? '' : 's'}`];
    if (summary.cadHedged) parts.push(`${summary.cadHedged} CAD-hedged as $ value`);
    if (summary.skippedOptions) parts.push(`${summary.skippedOptions} option${summary.skippedOptions === 1 ? '' : 's'} skipped`);
    setPriceStatusMsg(parts.join(' · ') + '.');
  }

  const hasSharesRows = rows.some((r) => r.inputType === 'shares');

  const liveTotal = rows.reduce((sum, row) => {
    if (row.inputType === 'amount') {
      return sum + convertAmount(parseFloat(row.amount) || 0, row.currency, displayCurrency);
    }
    const shares = parseFloat(row.shares) || 0;
    if (!shares || !row.ticker.trim()) return sum;
    const priceCAD = getCachedPrice(row.ticker.trim().toUpperCase());
    if (priceCAD == null) return sum;
    return sum + convertAmount(shares * priceCAD, 'CAD', displayCurrency);
  }, 0);

  const hasSharesWithCachedPrice = rows.some((r) => {
    if (r.inputType !== 'shares' || !r.ticker.trim() || !r.shares) return false;
    return getCachedPrice(r.ticker.trim().toUpperCase()) != null;
  });

  const totalLabel = !hasSharesRows ? 'Total invested' : hasSharesWithCachedPrice ? 'Total (est.)' : 'Total ($ rows)';
  const totalMuted = hasSharesRows && !hasSharesWithCachedPrice;

  const fetchedTimeLabel = pricesFetchedAt
    ? pricesFetchedAt.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    : null;

  const sortedRows = getSortedRows();

  return (
    <div className="pv-screen" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 24px 64px' }}>
      {saveOpen && <SaveNameModal onSave={saveNew} onClose={() => setSaveOpen(false)} />}
      {overrideTarget && (
        <OverrideConfirmModal
          name={overrideTarget.name}
          onConfirm={async () => { await saveOverride(overrideTarget.id); setOverrideTarget(null); }}
          onClose={() => setOverrideTarget(null)}
        />
      )}
      {importOpen && <ImportCsvModal onClose={() => setImportOpen(false)} onImport={handleImport} />}
      {showHow && <HowItWorksModal onClose={() => setShowHow(false)} />}

      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 36, maxWidth: 520 }}>
        <h1 className="pv-hero-title" style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 10 }}>
          See everything.<br />Invest better.
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text2)', marginBottom: 10 }}>
          Add your positions and we'll show you what you really own.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
          <button className="pv-link-btn" style={{ color: 'var(--accent)' }} onClick={() => setShowHow(true)}>How does this work?</button>
          <span style={{ color: 'var(--border2)' }}>·</span>
          <button className="pv-btn-ghost" style={{ padding: '7px 16px' }} onClick={onStartTour}>Take the tour</button>
        </div>
      </div>

      {/* Portfolio card */}
      <div className="pv-card" style={{ width: '100%', maxWidth: 620, background: 'var(--card)', borderRadius: 24, border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div className="pv-card-head" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px 14px', gap: 12, flexWrap: 'wrap' }}>
          <div data-tour="switcher" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <PortfolioSwitcher
              portfolios={portfolios}
              activeId={loadedPortfolioId}
              activeName={currentPortfolio?.name}
              dirty={dirty}
              signedIn={!!user}
              onOpenAuth={onOpenAuth}
              onSelect={handleLoad}
              onSave={handleSwitcherSave}
              onOverride={(p) => setOverrideTarget({ id: p.id, name: p.name })}
              onSaveAsNew={() => setSaveOpen(true)}
              onNew={handleNewPortfolio}
              onDelete={handleDelete}
            />
            <span style={{ fontSize: 13, color: 'var(--text3)' }}>{rows.length} {rows.length === 1 ? 'position' : 'positions'}</span>
          </div>
          <div data-tour="toolbar" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <select className="pv-select" value={sortMode} onChange={(e) => setSortMode(e.target.value)}>
              <option value="default">Order entered</option>
              <option value="value-high">Value: high → low</option>
              <option value="value-low">Value: low → high</option>
              <option value="ticker-az">Ticker: A → Z</option>
              <option value="ticker-za">Ticker: Z → A</option>
            </select>
            <span style={{ color: 'var(--border2)' }}>·</span>
            <button className="pv-link-btn" onClick={() => setImportOpen(true)}>Import CSV</button>
          </div>
        </div>

        <div className="pv-card-rows" style={{ padding: '0 24px' }} data-tour="rows">
          {sortedRows.map((row) => {
            const hasError = !!rowErrors[row.id];
            const isUnknown = autoType(row.ticker) === 'Unknown' && !!row.ticker;
            return (
              <div
                key={row.id}
                onFocus={() => freezeSort()}
                onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) scheduleUnfreeze(); }}
                style={{ borderTop: '1px solid var(--border)' }}
              >
                <PositionRow
                  row={row}
                  onChange={updateRow}
                  onRemove={removeRow}
                  onTickerBlur={handleTickerBlur}
                  isUnknown={isUnknown}
                />
                {hasError && (
                  <div style={{ fontSize: 12, color: 'var(--red)', padding: '0 0 8px 2px' }}>{rowErrors[row.id]}</div>
                )}
              </div>
            );
          })}
          <div style={{ borderTop: '1px solid var(--border)', padding: '12px 0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button className="pv-link-btn" data-tour="add" style={{ color: 'var(--accent)', paddingLeft: 0 }} onClick={addRow}>+ Add position</button>
            {rows.length > 0 && (
              <button className="pv-link-btn" onClick={() => { setRows([]); setRowErrors({}); setSortMode('default'); setDirty(true); }}>Clear all</button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pv-card-foot" style={{ background: 'var(--card2)', padding: '18px 24px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 600 }}>{totalLabel}</span>
            <span style={{ fontSize: 24, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: totalMuted ? 'var(--text3)' : 'var(--text)' }}>
              {fmtMoney(liveTotal)} <span style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 600 }}>{displayCurrency}</span>
            </span>
          </div>
          <button
            className="pv-btn-primary"
            data-tour="decompose"
            onClick={() => runDecompose(rows)}
            disabled={priceFetching}
            style={{ width: '100%', opacity: priceFetching ? 0.7 : 1 }}
          >
            {priceFetching ? 'Fetching prices…' : 'Decompose portfolio'}
          </button>

          {fetchedTimeLabel && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text3)' }}>Prices as of {fetchedTimeLabel}</span>
              <button
                type="button"
                disabled={priceFetching}
                onClick={async () => {
                  const shareRows = rows.filter((r) => r.inputType === 'shares' && r.ticker.trim());
                  if (shareRows.length === 0) return;
                  const tickers = [...new Set(shareRows.map((r) => r.ticker.trim().toUpperCase()))];
                  setPriceFetching(true);
                  setPriceError('');
                  setPriceStatusMsg('');
                  try {
                    const prices = await fetchPrices(tickers, undefined, true);
                    const priceErrors = {};
                    const mergedRows = rows.map((row) => {
                      const ticker = row.ticker.trim().toUpperCase();
                      if (row.inputType === 'shares') {
                        const priceCAD = prices[ticker];
                        if (priceCAD == null) { priceErrors[row.id] = 'Price unavailable'; return row; }
                        return { id: row.id, ticker, amount: String(parseFloat(row.shares) * priceCAD), currency: 'CAD' };
                      }
                      return { id: row.id, ticker, amount: row.amount, currency: row.currency };
                    });
                    setPriceFetching(false);
                    if (Object.keys(priceErrors).length > 0) { setRowErrors(priceErrors); return; }
                    const oldest = getOldestFetchedAt(tickers);
                    setPricesFetchedAt(oldest ? new Date(oldest) : new Date());
                    setRowErrors({});
                    onDecomposeComputed(mergedRows);
                  } catch {
                    setPriceError('Failed to fetch prices.');
                    setPriceFetching(false);
                  }
                }}
                className="pv-link-btn"
                style={{ color: priceFetching ? 'var(--text3)' : 'var(--accent)', padding: 0 }}
              >
                ↻ Refresh
              </button>
            </div>
          )}

          {priceStatusMsg && (
            <div style={{ fontSize: 12, color: 'var(--green)', background: 'rgba(47,208,140,0.08)', border: '1px solid rgba(47,208,140,0.25)', borderRadius: 12, padding: '8px 12px' }}>
              {priceStatusMsg}
            </div>
          )}
          {priceError && (
            <div style={{ fontSize: 12, color: 'var(--red)', background: 'rgba(240,90,126,0.08)', border: '1px solid rgba(240,90,126,0.25)', borderRadius: 12, padding: '8px 12px' }}>
              {priceError}
            </div>
          )}
          {pfError && (
            <div style={{ fontSize: 12, color: 'var(--red)' }}>{pfError}</div>
          )}
        </div>
      </div>

      {/* Default input type */}
      <div style={{ width: '100%', maxWidth: 620, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: 18, padding: '0 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12.5, color: 'var(--text3)', fontWeight: 600 }}>Default input</span>
          <Seg small value={defaultInputType} onChange={setDefaultInputType}
            options={[{ value: 'amount', label: '$ Amount' }, { value: 'shares', label: '# Shares' }]} />
        </div>
      </div>

      <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 28, textAlign: 'center' }}>
        Data coverage: ETF holdings · May 2026 ·{' '}
        <Link to="/privacy">Privacy</Link> ·{' '}
        <Link to="/terms">Terms</Link>
      </p>
    </div>
  );
}
