import { useState, useRef, useEffect } from 'react';
import { convertAmount, isEtf, isKnownTicker, inferCurrency, resolveTicker } from '../utils/decompose';
import { fmtMoney } from '../utils/format';
import { fetchPrices } from '../utils/fetchPrices';
import { supabase } from '../lib/supabase';

const ACCENT = '#a78bfa';

function autoType(ticker) {
  const t = ticker.trim().toUpperCase();
  if (!t) return '';
  if (isEtf(t)) return 'ETF';
  if (isKnownTicker(t)) return 'Stock';
  return 'Unknown';
}

function CurrencyToggle({ value, onChange }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 2,
        background: 'var(--input-bg)',
        borderRadius: 3,
        padding: 2,
        border: '1px solid var(--border)',
        alignItems: 'center',
        flexShrink: 0,
      }}
    >
      {['USD', 'CAD'].map((cur) => (
        <button
          key={cur}
          type="button"
          className="row-toggle-btn"
          onClick={() => onChange(cur)}
          style={{
            padding: '3px 5px',
            background: value === cur ? ACCENT : 'transparent',
            border: 'none',
            borderRadius: 2,
            cursor: 'pointer',
            fontFamily: 'var(--mono)',
            fontWeight: 600,
            fontSize: 9,
            color: value === cur ? '#07090e' : 'var(--text3)',
            letterSpacing: '0.06em',
            transition: 'all 0.12s',
            lineHeight: 1,
          }}
        >
          {cur}
        </button>
      ))}
    </div>
  );
}

function InputTypeToggle({ value, onChange }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 2,
        background: 'var(--input-bg)',
        borderRadius: 3,
        padding: 2,
        border: '1px solid var(--border)',
        alignItems: 'center',
        flexShrink: 0,
      }}
    >
      {[{ key: 'amount', label: '$' }, { key: 'shares', label: '#' }].map(({ key, label }) => (
        <button
          key={key}
          type="button"
          className="row-toggle-btn"
          onClick={() => onChange(key)}
          title={key === 'amount' ? 'Dollar amount' : 'Share count'}
          style={{
            padding: '3px 6px',
            background: value === key ? ACCENT : 'transparent',
            border: 'none',
            borderRadius: 2,
            cursor: 'pointer',
            fontFamily: 'var(--mono)',
            fontWeight: 700,
            fontSize: 10,
            color: value === key ? '#07090e' : 'var(--text3)',
            letterSpacing: '0.04em',
            transition: 'all 0.12s',
            lineHeight: 1,
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function OverrideModal({ portfolios, onOverride, onClose, loading }) {
  const [selectedId, setSelectedId] = useState('');
  const [confirmName, setConfirmName] = useState('');
  const [error, setError] = useState('');
  const selectedPortfolio = portfolios.find((p) => p.id === selectedId);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedId) { setError('Select a portfolio.'); return; }
    if (confirmName !== selectedPortfolio.name) { setError(`Type "${selectedPortfolio.name}" exactly to confirm.`); return; }
    setError('');
    const err = await onOverride(selectedId);
    if (err) { setError(err); }
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'var(--modal-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 340, background: 'var(--panel)', border: '1px solid var(--border2)', borderRadius: 6, padding: '20px', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text2)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>
          Override Portfolio
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text3)', letterSpacing: '0.1em', marginBottom: 5, textTransform: 'uppercase' }}>
              Select Portfolio
            </label>
            <select value={selectedId} onChange={(e) => { setSelectedId(e.target.value); setConfirmName(''); setError(''); }}
              style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border2)', borderRadius: 3, color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: 13, padding: '8px 10px', outline: 'none', boxSizing: 'border-box' }}>
              <option value="">-- Choose one --</option>
              {portfolios.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          {selectedId && (
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text3)', letterSpacing: '0.1em', marginBottom: 5, textTransform: 'uppercase' }}>
                Type "{selectedPortfolio?.name}" to confirm
              </label>
              <input type="text" value={confirmName} onChange={(e) => setConfirmName(e.target.value)} placeholder={selectedPortfolio?.name}
                style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border2)', borderRadius: 3, color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: 13, padding: '8px 10px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          )}
          {error && <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#f05a7e' }}>{error}</div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" disabled={loading || !selectedId || confirmName !== selectedPortfolio?.name}
              style={{ flex: 1, padding: '9px 0', background: selectedId && confirmName === selectedPortfolio?.name && !loading ? ACCENT : '#3d2f6e', border: 'none', borderRadius: 3, color: selectedId && confirmName === selectedPortfolio?.name && !loading ? '#07090e' : '#9b8ec4', fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', cursor: selectedId && confirmName === selectedPortfolio?.name && !loading ? 'pointer' : 'not-allowed' }}>
              {loading ? '...' : 'OVERRIDE'}
            </button>
            <button type="button" onClick={onClose}
              style={{ flex: 1, padding: '9px 0', background: 'none', border: '1px solid var(--border2)', borderRadius: 3, color: 'var(--text3)', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em', cursor: 'pointer' }}>
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SaveNameModal({ onSave, onClose, mode, currentName }) {
  const [name, setName] = useState(mode === 'update' ? currentName : '');
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

  const isUpdate = mode === 'update';
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'var(--modal-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 320, background: 'var(--panel)', border: '1px solid var(--border2)', borderRadius: 6, padding: '20px', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text2)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>
          {isUpdate ? `Update Portfolio (currently updating: ${currentName})` : 'Save Portfolio'}
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input ref={inputRef} value={name} onChange={(e) => setName(e.target.value)} placeholder="Portfolio name" maxLength={64}
            style={{ background: 'var(--input-bg)', border: '1px solid var(--border2)', borderRadius: 3, color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: 13, padding: '8px 10px', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
          {error && <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#f05a7e' }}>{error}</div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" disabled={loading}
              style={{ flex: 1, padding: '9px 0', background: loading ? '#3d2f6e' : ACCENT, border: 'none', borderRadius: 3, color: loading ? '#9b8ec4' : '#07090e', fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? '...' : isUpdate ? 'UPDATE' : 'SAVE'}
            </button>
            <button type="button" onClick={onClose}
              style={{ flex: 1, padding: '9px 0', background: 'none', border: '1px solid var(--border2)', borderRadius: 3, color: 'var(--text3)', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em', cursor: 'pointer' }}>
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PortfolioPanel({
  rows,
  setRows,
  rowErrors,
  setRowErrors,
  onDecomposeComputed,
  onAutoDecompose,
  displayCurrency,
  portfolioTotal,
  nextId,
  defaultInputType,
  user,
  onOpenAuth,
  onLoadPortfolio,
}) {
  const [priceFetching, setPriceFetching] = useState(false);
  const [pricesFetchedAt, setPricesFetchedAt] = useState(null);
  const [priceError, setPriceError] = useState('');

  const [focusedId, setFocusedId] = useState(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveMode, setSaveMode] = useState('new');
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [portfolios, setPortfolios] = useState([]);
  const [pfLoading, setPfLoading] = useState(false);
  const [pfError, setPfError] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [loadedPortfolioId, setLoadedPortfolioId] = useState(null);
  const [sortMode, setSortMode] = useState('default');

  useEffect(() => {
    if (user) fetchPortfolios();
    else setPortfolios([]);
  }, [user]);

  async function fetchPortfolios() {
    setPfLoading(true);
    setPfError('');
    const { data, error } = await supabase
      .from('portfolios')
      .select('id, name, holdings, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setPfLoading(false);
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

  // Build merged rows (all in amount+currency format) for onAutoDecompose
  // Only safe to call when no rows are in shares mode
  function buildMergedAmountRows() {
    return rows
      .filter((r) => r.ticker.trim() && r.inputType === 'amount' && r.amount)
      .map((r) => ({ id: r.id, ticker: r.ticker.trim().toUpperCase(), amount: r.amount, currency: r.currency }));
  }

  async function handleSave(name) {
    const holdings = buildHoldingsPayload();
    if (saveMode === 'update' && loadedPortfolioId) {
      const { error } = await supabase.from('portfolios').update({ holdings, name }).eq('id', loadedPortfolioId);
      if (error) return error.message;
    } else {
      const { error } = await supabase.from('portfolios').insert({ user_id: user.id, name, holdings });
      if (error) return error.message;
    }
    setSaveOpen(false);
    setSaveMode('new');
    fetchPortfolios();
    const hasSharesRows = rows.some((r) => r.inputType === 'shares');
    if (!hasSharesRows) onAutoDecompose?.(buildMergedAmountRows());
    return null;
  }

  async function handleOverride(portfolioId) {
    const holdings = buildHoldingsPayload();
    const { error } = await supabase.from('portfolios').update({ holdings }).eq('id', portfolioId);
    if (error) return error.message;
    setOverrideOpen(false);
    fetchPortfolios();
    const hasSharesRows = rows.some((r) => r.inputType === 'shares');
    if (!hasSharesRows) onAutoDecompose?.(buildMergedAmountRows());
    return null;
  }

  async function handleDelete(id) {
    setDeleteError('');
    const { error } = await supabase.from('portfolios').delete().eq('id', id);
    if (error) { setDeleteError('Failed to delete.'); return; }
    setConfirmDeleteId(null);
    setPortfolios((prev) => prev.filter((p) => p.id !== id));
  }

  function handleLoad(portfolio) {
    const raw = portfolio.holdings;
    // Support both old format (array of {ticker,amount,currency}) and new per-row format
    const rawRows = Array.isArray(raw) ? raw : (raw ?? []);
    setLoadedPortfolioId(portfolio.id);
    setPricesFetchedAt(null);
    setPriceError('');
    onLoadPortfolio(rawRows);
  }

  function addRow() {
    setRows((prev) => [...prev, {
      id: nextId(),
      ticker: '',
      inputType: defaultInputType,
      amount: '',
      currency: 'USD',
      shares: '',
    }]);
    setSortMode('default');
  }

  function getSortedRows() {
    if (sortMode === 'default') return rows;
    const sorted = [...rows];
    switch (sortMode) {
      case 'value-high':
        sorted.sort((a, b) => {
          const aVal = a.inputType === 'amount' ? convertAmount(parseFloat(a.amount) || 0, a.currency, displayCurrency) : 0;
          const bVal = b.inputType === 'amount' ? convertAmount(parseFloat(b.amount) || 0, b.currency, displayCurrency) : 0;
          return bVal - aVal;
        });
        break;
      case 'value-low':
        sorted.sort((a, b) => {
          const aVal = a.inputType === 'amount' ? convertAmount(parseFloat(a.amount) || 0, a.currency, displayCurrency) : 0;
          const bVal = b.inputType === 'amount' ? convertAmount(parseFloat(b.amount) || 0, b.currency, displayCurrency) : 0;
          return aVal - bVal;
        });
        break;
      case 'ticker-az':
        sorted.sort((a, b) => a.ticker.localeCompare(b.ticker));
        break;
      case 'ticker-za':
        sorted.sort((a, b) => b.ticker.localeCompare(a.ticker));
        break;
    }
    return sorted;
  }

  function removeRow(id) {
    setRows((prev) => prev.filter((r) => r.id !== id));
    setRowErrors((prev) => { const next = { ...prev }; delete next[id]; return next; });
  }

  function handleTickerBlur(id) {
    setFocusedId(null);
    setRows((prev) => {
      const row = prev.find((r) => r.id === id);
      if (!row || !row.ticker.trim()) return prev;
      const ticker = row.ticker.trim().toUpperCase();
      // Only merge rows with same ticker AND same inputType
      const allMatching = prev.filter(
        (r) => r.ticker.trim().toUpperCase() === ticker && r.inputType === row.inputType
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

      const merged = allMatching.reduce((sum, r) => {
        return sum + convertAmount(parseFloat(r.amount) || 0, r.currency, keeper.currency);
      }, 0);
      return prev
        .filter((r) => !mergedIds.has(r.id) || r.id === keeper.id)
        .map((r) => r.id === keeper.id ? { ...r, amount: String(parseFloat(merged.toFixed(2))) } : r);
    });
    setRowErrors((prev) => { const next = { ...prev }; delete next[id]; return next; });
  }

  function updateRow(id, field, value) {
    setRows((prev) => prev.map((r) => {
      if (r.id !== id) return r;
      const updated = { ...r, [field]: value };
      if (field === 'ticker' && value.trim() && r.inputType === 'amount') {
        const ticker = value.trim().toUpperCase();
        if (isKnownTicker(ticker)) updated.currency = inferCurrency(ticker);
      }
      return updated;
    }));
    if (rowErrors[id]) {
      setRowErrors((prev) => { const next = { ...prev }; delete next[id]; return next; });
    }
  }

  function updateRowInputType(id, newType) {
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, inputType: newType } : r));
    if (rowErrors[id]) {
      setRowErrors((prev) => { const next = { ...prev }; delete next[id]; return next; });
    }
  }

  async function handleDecomposeClick() {
    // 1. Validate all rows
    const errors = {};
    for (const row of rows) {
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

    // 2. Fetch prices for # rows
    const shareRows = rows.filter((r) => r.inputType === 'shares' && r.ticker.trim());
    let prices = {};
    if (shareRows.length > 0) {
      setPriceFetching(true);
      setPriceError('');
      setRowErrors({});
      const tickers = [...new Set(shareRows.map((r) => resolveTicker(r.ticker.trim().toUpperCase())))];
      try {
        prices = await fetchPrices(tickers);
      } catch {
        setPriceError('Failed to fetch prices. Check your connection.');
        setPriceFetching(false);
        return;
      }
      setPriceFetching(false);
    }

    // 3. Check for unavailable prices
    const priceErrors = {};
    for (const row of shareRows) {
      const resolved = resolveTicker(row.ticker.trim().toUpperCase());
      if (prices[resolved] == null) priceErrors[row.id] = 'Price unavailable';
    }
    if (Object.keys(priceErrors).length > 0) { setRowErrors(priceErrors); return; }

    // 4. Build merged rows: $ rows pass through, # rows become amount+CAD
    const mergedRows = rows.map((row) => {
      const ticker = row.ticker.trim().toUpperCase();
      if (row.inputType === 'shares') {
        const priceCAD = prices[resolveTicker(ticker)];
        return { id: row.id, ticker, amount: String(parseFloat(row.shares) * priceCAD), currency: 'CAD' };
      }
      return { id: row.id, ticker, amount: row.amount, currency: row.currency };
    });

    if (shareRows.length > 0) setPricesFetchedAt(new Date());
    setRowErrors({});
    onDecomposeComputed(mergedRows);
  }

  // Live total from $ rows only (# rows require a price fetch)
  const liveTotal = rows.reduce((sum, row) => {
    if (row.inputType !== 'amount') return sum;
    return sum + convertAmount(parseFloat(row.amount) || 0, row.currency, displayCurrency);
  }, 0);
  const hasSharesRows = rows.some((r) => r.inputType === 'shares');

  const inputBase = {
    background: 'var(--input-bg)',
    border: '1px solid var(--border)',
    borderRadius: 3,
    color: 'var(--text)',
    padding: '5px 8px',
    width: '100%',
    transition: 'border-color 0.12s',
    fontFamily: 'var(--mono)',
  };

  const currentPortfolio = portfolios.find((p) => p.id === loadedPortfolioId);
  const fetchedTime = pricesFetchedAt
    ? pricesFetchedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  // Grid: ticker | value | $/# toggle | USD/CAD toggle | delete
  const GRID = '90px 1fr 46px 64px 24px';

  return (
    <>
      {saveOpen && (
        <SaveNameModal
          onSave={handleSave}
          onClose={() => setSaveOpen(false)}
          mode={saveMode}
          currentName={currentPortfolio?.name || ''}
        />
      )}
      {overrideOpen && (
        <OverrideModal
          portfolios={portfolios}
          onOverride={handleOverride}
          onClose={() => setOverrideOpen(false)}
          loading={false}
        />
      )}
      <div
        className="portfolio-panel"
        style={{
          width: 420,
          minWidth: 420,
          background: 'var(--panel)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        {/* Panel header */}
        <div style={{ padding: '13px 16px 11px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text2)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Portfolio
          </span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)' }}>
            {rows.length} POSITION{rows.length !== 1 ? 'S' : ''}
          </span>
        </div>

        {/* Loaded portfolio banner */}
        {loadedPortfolioId && currentPortfolio && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 16px', background: 'rgba(167,139,250,0.08)', borderBottom: '1px solid rgba(167,139,250,0.18)', gap: 8 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: ACCENT, letterSpacing: '0.08em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={currentPortfolio.name}>
              EDITING: {currentPortfolio.name}
            </span>
            <button type="button" title="Stop editing this portfolio" onClick={() => setLoadedPortfolioId(null)}
              style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: '0 0 0 4px', flexShrink: 0, transition: 'color 0.12s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#f05a7e')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text3)')}>
              ×
            </button>
          </div>
        )}

        {/* Sort control */}
        <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--card)' }}>
          <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--text3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 5 }}>
            Sort By
          </label>
          <select value={sortMode} onChange={(e) => setSortMode(e.target.value)}
            style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 3, color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: 11, padding: '6px 8px', outline: 'none', cursor: 'pointer', transition: 'border-color 0.12s' }}
            onFocus={(e) => (e.currentTarget.style.borderColor = ACCENT)}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}>
            <option value="default">Default (order entered)</option>
            <option value="value-high">Value: High to Low</option>
            <option value="value-low">Value: Low to High</option>
            <option value="ticker-az">Ticker: A to Z</option>
            <option value="ticker-za">Ticker: Z to A</option>
          </select>
        </div>

        {/* Column headers */}
        <div style={{ display: 'grid', gridTemplateColumns: GRID, gap: 6, padding: '7px 16px 5px', borderBottom: '1px solid var(--card)', alignItems: 'end' }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text3)', letterSpacing: '0.08em' }}>TICKER</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text3)', letterSpacing: '0.08em', textAlign: 'right' }}>VALUE: AMOUNT/SHARES</span>
          <span />
          <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text3)', letterSpacing: '0.08em' }}>CCY</span>
          <span />
        </div>

        {/* Scrollable rows */}
        <div className="portfolio-panel-rows" style={{ flex: 1, overflowY: 'auto', padding: '3px 16px', minHeight: 0 }}>
          {getSortedRows().map((row) => {
            const type = autoType(row.ticker);
            const hasError = !!rowErrors[row.id];
            const isUnknown = type === 'Unknown' && !!row.ticker;
            const showTypeBadge = !!row.ticker && type !== 'Unknown';
            const isShares = row.inputType === 'shares';

            return (
              <div
                key={row.id}
                style={{
                  borderBottom: '1px solid ' + (isUnknown ? 'rgba(244,185,66,0.2)' : 'var(--border-sub)'),
                  background: isUnknown ? 'rgba(244,185,66,0.04)' : 'transparent',
                  paddingBottom: 2,
                  marginLeft: -16, marginRight: -16,
                  paddingLeft: 16, paddingRight: 16,
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: GRID, gap: 6, alignItems: 'center', paddingTop: 5, paddingBottom: hasError ? 2 : 5 }}>

                  {/* Ticker */}
                  <div style={{ position: 'relative' }}>
                    <input
                      value={row.ticker}
                      maxLength={8}
                      placeholder="TICKER"
                      onChange={(e) => updateRow(row.id, 'ticker', e.target.value.toUpperCase())}
                      onFocus={() => setFocusedId(`${row.id}-t`)}
                      onBlur={() => handleTickerBlur(row.id)}
                      style={{
                        ...inputBase,
                        fontSize: 13,
                        fontWeight: 500,
                        letterSpacing: '0.1em',
                        borderColor: hasError ? '#f05a7e' : focusedId === `${row.id}-t` ? ACCENT : 'var(--border)',
                        color: isUnknown ? '#f4b942' : 'var(--text)',
                      }}
                    />
                  </div>

                  {/* Amount or Shares */}
                  <div style={{ position: 'relative' }}>
                    {showTypeBadge && (
                      <span style={{ position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--mono)', fontSize: 7.5, fontWeight: 600, color: type === 'ETF' ? ACCENT : 'var(--text3)', letterSpacing: '0.06em', pointerEvents: 'none', lineHeight: 1 }}>
                        {type === 'ETF' ? 'ETF' : 'STK'}
                      </span>
                    )}
                    <input
                      type="number"
                      value={isShares ? row.shares : row.amount}
                      placeholder="0"
                      min="0"
                      step="any"
                      onChange={(e) => updateRow(row.id, isShares ? 'shares' : 'amount', e.target.value)}
                      onFocus={() => setFocusedId(`${row.id}-v`)}
                      onBlur={() => setFocusedId(null)}
                      style={{
                        ...inputBase,
                        fontSize: 13,
                        textAlign: 'right',
                        paddingLeft: showTypeBadge ? 30 : 8,
                        paddingRight: 6,
                        borderColor:
                          hasError && !rowErrors[row.id]?.includes('Ticker')
                            ? '#f05a7e'
                            : focusedId === `${row.id}-v`
                            ? ACCENT
                            : 'var(--border)',
                      }}
                    />
                  </div>

                  {/* Input type toggle */}
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <InputTypeToggle value={row.inputType} onChange={(t) => updateRowInputType(row.id, t)} />
                  </div>

                  {/* Currency toggle (hidden for # rows) */}
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {!isShares && (
                      <CurrencyToggle value={row.currency} onChange={(cur) => updateRow(row.id, 'currency', cur)} />
                    )}
                  </div>

                  {/* Remove */}
                  <button type="button" onClick={() => removeRow(row.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 2, borderRadius: 2, transition: 'color 0.12s', textAlign: 'center' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#f05a7e')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text3)')}
                    title="Remove">
                    ×
                  </button>
                </div>

                {hasError && (
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#f05a7e', paddingBottom: 4, paddingLeft: 2 }}>
                    {rowErrors[row.id]}
                  </div>
                )}
              </div>
            );
          })}

          {/* Add position */}
          <button type="button" onClick={addRow}
            style={{ width: '100%', marginTop: 10, padding: '7px 0', background: 'none', border: '1px dashed var(--border2)', borderRadius: 3, cursor: 'pointer', color: 'var(--text3)', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.color = ACCENT; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text3)'; }}>
            + ADD POSITION
          </button>

          {/* Clear */}
          {rows.length > 0 && (
            <button type="button"
              onClick={() => { setRows([]); setRowErrors({}); setSortMode('default'); setLoadedPortfolioId(null); setPricesFetchedAt(null); setPriceError(''); }}
              style={{ width: '100%', marginTop: 6, padding: '7px 0', background: 'none', border: '1px solid transparent', borderRadius: 3, cursor: 'pointer', color: 'var(--text3)', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em', transition: 'color 0.15s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#f05a7e')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text3)')}>
              CLEAR ALL
            </button>
          )}
        </div>

        {/* My Portfolios section */}
        {!user ? (
          <div style={{ borderTop: '1px solid var(--border)', flexShrink: 0, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span onClick={onOpenAuth}
              style={{ fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--text3)', letterSpacing: '0.06em', cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'var(--border2)', textUnderlineOffset: 3, transition: 'color 0.15s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text3)')}>
              Sign in to save portfolios
            </span>
          </div>
        ) : (
          <div style={{ borderTop: '1px solid var(--border)', flexShrink: 0, maxHeight: 180, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '8px 16px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>My Portfolios</span>
              {pfError && <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: '#f05a7e' }}>{pfError}</span>}
            </div>
            {pfLoading ? (
              <div style={{ padding: '4px 16px 12px', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)' }}>Loading…</div>
            ) : portfolios.length === 0 ? (
              <div style={{ padding: '4px 16px 12px', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)' }}>No saved portfolios yet</div>
            ) : (
              <div style={{ overflowY: 'auto', flex: 1, padding: '0 16px 8px' }}>
                {deleteError && <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#f05a7e', marginBottom: 4 }}>{deleteError}</div>}
                {portfolios.map((pf) => (
                  <div key={pf.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0', borderBottom: '1px solid var(--border-sub)' }}>
                    <span style={{ flex: 1, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={pf.name}>
                      {pf.name}
                    </span>
                    {confirmDeleteId === pf.id ? (
                      <>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text3)', whiteSpace: 'nowrap' }}>Sure?</span>
                        <button type="button" onClick={() => handleDelete(pf.id)} style={smallBtnStyle('#f05a7e')}>Yes</button>
                        <button type="button" onClick={() => { setConfirmDeleteId(null); setDeleteError(''); }} style={smallBtnStyle('var(--text3)')}>No</button>
                      </>
                    ) : (
                      <>
                        <button type="button" onClick={() => handleLoad(pf)} style={smallBtnStyle(ACCENT)}>Load</button>
                        <button type="button" onClick={() => { setConfirmDeleteId(pf.id); setDeleteError(''); }} style={smallBtnStyle('var(--text3)')}>×</button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)', background: 'var(--footer-bg)', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text2)', letterSpacing: '0.1em' }}>
              {hasSharesRows ? 'TOTAL ($ ROWS)' : 'TOTAL INVESTED'}
            </span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 22, fontWeight: 600, color: hasSharesRows ? 'var(--text3)' : 'var(--text)' }}>
              {fmtMoney(liveTotal)}{' '}
              <span style={{ fontSize: 12, color: 'var(--text3)' }}>{displayCurrency}</span>
            </span>
          </div>

          {user && (
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              <button type="button" onClick={() => { setSaveMode('new'); setSaveOpen(true); }}
                style={{ flex: 1, padding: '8px 0', background: 'none', border: '1px solid var(--border2)', borderRadius: 3, color: 'var(--text2)', fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', cursor: 'pointer', transition: 'border-color 0.15s, color 0.15s' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.color = ACCENT; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text2)'; }}>
                + SAVE AS NEW
              </button>
              {!loadedPortfolioId && portfolios.length > 0 ? (
                <button type="button" onClick={() => setOverrideOpen(true)}
                  style={{ flex: 1, padding: '8px 0', background: 'none', border: '1px solid var(--border2)', borderRadius: 3, color: 'var(--text2)', fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', cursor: 'pointer', transition: 'border-color 0.15s, color 0.15s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.color = ACCENT; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text2)'; }}>
                  OVERRIDE
                </button>
              ) : loadedPortfolioId ? (
                <button type="button" onClick={() => { setSaveMode('update'); setSaveOpen(true); }}
                  style={{ flex: 1, padding: '8px 0', background: ACCENT, border: 'none', borderRadius: 3, color: '#07090e', fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', cursor: 'pointer', transition: 'opacity 0.15s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.88')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}>
                  ⬆ UPDATE
                </button>
              ) : null}
            </div>
          )}

          <button type="button" disabled={priceFetching} onClick={handleDecomposeClick}
            style={{ width: '100%', padding: '11px 0', background: priceFetching ? '#3d2f6e' : ACCENT, border: 'none', borderRadius: 3, color: priceFetching ? '#9b8ec4' : '#07090e', fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', cursor: priceFetching ? 'not-allowed' : 'pointer', transition: 'opacity 0.15s, background 0.15s' }}
            onMouseEnter={(e) => { if (!priceFetching) e.currentTarget.style.opacity = '0.88'; }}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}>
            {priceFetching ? 'FETCHING PRICES…' : '▶  DECOMPOSE PORTFOLIO'}
          </button>

          {/* Prices as of / Refresh — only shown after a shares fetch */}
          {fetchedTime && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 7 }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text3)', letterSpacing: '0.05em' }}>
                Prices as of {fetchedTime}
              </span>
              <button type="button" disabled={priceFetching}
                onClick={async () => {
                  const shareRows = rows.filter((r) => r.inputType === 'shares' && r.ticker.trim());
                  if (shareRows.length === 0) return;
                  setPriceFetching(true);
                  setPriceError('');
                  const tickers = [...new Set(shareRows.map((r) => resolveTicker(r.ticker.trim().toUpperCase())))];
                  try {
                    const prices = await fetchPrices(tickers, { force: true });
                    const priceErrors = {};
                    const mergedRows = rows.map((row) => {
                      const ticker = row.ticker.trim().toUpperCase();
                      if (row.inputType === 'shares') {
                        const priceCAD = prices[resolveTicker(ticker)];
                        if (priceCAD == null) { priceErrors[row.id] = 'Price unavailable'; return row; }
                        return { id: row.id, ticker, amount: String(parseFloat(row.shares) * priceCAD), currency: 'CAD' };
                      }
                      return { id: row.id, ticker, amount: row.amount, currency: row.currency };
                    });
                    setPriceFetching(false);
                    if (Object.keys(priceErrors).length > 0) { setRowErrors(priceErrors); return; }
                    setPricesFetchedAt(new Date());
                    setRowErrors({});
                    onDecomposeComputed(mergedRows);
                  } catch {
                    setPriceError('Failed to fetch prices.');
                    setPriceFetching(false);
                  }
                }}
                style={{ background: 'none', border: 'none', color: priceFetching ? 'var(--text3)' : ACCENT, fontFamily: 'var(--mono)', fontSize: 10, cursor: priceFetching ? 'not-allowed' : 'pointer', padding: 0, letterSpacing: '0.06em' }}>
                ↻ Refresh
              </button>
            </div>
          )}

          {priceError && (
            <div style={{ marginTop: 6, fontFamily: 'var(--mono)', fontSize: 10, color: '#f05a7e', background: 'rgba(240,90,126,0.07)', border: '1px solid rgba(240,90,126,0.2)', borderRadius: 3, padding: '6px 8px' }}>
              {priceError}
            </div>
          )}

          <div style={{ marginTop: 8, fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)', textAlign: 'center', lineHeight: 1.6 }}>
            DATA COVERAGE: ETF HOLDINGS · MAY 2026
          </div>
        </div>
      </div>
    </>
  );
}

function smallBtnStyle(color) {
  return {
    background: 'none',
    border: 'none',
    color,
    fontFamily: 'var(--mono)',
    fontSize: 10,
    cursor: 'pointer',
    padding: '2px 4px',
    flexShrink: 0,
  };
}
