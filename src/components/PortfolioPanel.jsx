import { useState, useRef, useEffect } from 'react';
import { convertAmount, isEtf, isKnownTicker } from '../utils/decompose';
import { fmtMoney } from '../utils/format';
import { supabase } from '../lib/supabase';

const ACCENT = '#a78bfa';

function autoType(ticker) {
  const t = ticker.trim().toUpperCase();
  if (!t) return '';
  if (isEtf(t)) return 'ETF';
  if (isKnownTicker(t)) return 'Stock';
  return 'Unknown';
}

function InfoTooltip() {
  const [show, setShow] = useState(false);
  const hideTimer = useRef(null);

  function scheduleHide() {
    hideTimer.current = setTimeout(() => setShow(false), 150);
  }

  function cancelHide() {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <span
        onMouseEnter={() => { cancelHide(); setShow(true); }}
        onMouseLeave={scheduleHide}
        style={{
          cursor: 'default',
          fontSize: 13,
          color: 'var(--text3)',
          marginLeft: 7,
          lineHeight: 1,
          userSelect: 'none',
        }}
      >
        ⓘ
      </span>
      {show && (
        <div
          onMouseEnter={cancelHide}
          onMouseLeave={scheduleHide}
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            left: -50,
            width: 288,
            background: 'var(--card)',
            border: '1px solid var(--border2)',
            borderRadius: 4,
            padding: '12px 14px',
            zIndex: 200,
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 10,
              color: ACCENT,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            How Portfolio Vision works
          </div>
          <p style={{ fontFamily: 'var(--sans, sans-serif)', fontSize: 11.5, color: 'var(--text2)', lineHeight: 1.6, margin: '0 0 8px' }}>
            Enter any combination of ETFs and stocks with their invested amounts. Portfolio Vision
            recursively decomposes each ETF into its underlying holdings, then aggregates everything
            into a unified view across all your positions.
          </p>
          <p style={{ fontFamily: 'var(--sans, sans-serif)', fontSize: 11.5, color: 'var(--text2)', lineHeight: 1.6, margin: '0 0 8px' }}>
            Our stock and ETF database is updated monthly. If a ticker you entered is highlighted in
            yellow, it simply means it isn't in our database yet — you can still enter it and track
            it as-is. To request an addition, email{' '}
            <span style={{ color: ACCENT }}>austinhsi@gmail.com</span>
          </p>
          <p style={{ fontFamily: 'var(--sans, sans-serif)', fontSize: 11.5, color: 'var(--text2)', lineHeight: 1.6, margin: 0 }}>
            Holding spot price assets? If you hold any ETF tracking a physical commodity, just type
            the asset name directly. For example, type "Gold" instead of GLD, "Silver" instead of
            SLV, "Copper" instead of CPER. Portfolio Vision will recognize it automatically.
          </p>
        </div>
      )}
    </div>
  );
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
        height: '100%',
        alignItems: 'center',
      }}
    >
      {['USD', 'CAD'].map((cur) => (
        <button
          key={cur}
          type="button"
          onClick={() => onChange(cur)}
          style={{
            padding: '3px 6px',
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

function SaveNameModal({ onSave, onClose }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--modal-overlay)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 320,
          background: 'var(--panel)',
          border: '1px solid var(--border2)',
          borderRadius: 6,
          padding: '20px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 10,
            color: 'var(--text2)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: 14,
          }}
        >
          Save Portfolio
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Portfolio name"
            maxLength={64}
            style={{
              background: 'var(--input-bg)',
              border: '1px solid var(--border2)',
              borderRadius: 3,
              color: 'var(--text)',
              fontFamily: 'var(--mono)',
              fontSize: 13,
              padding: '8px 10px',
              outline: 'none',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
          {error && (
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#f05a7e' }}>{error}</div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '9px 0',
                background: loading ? '#3d2f6e' : ACCENT,
                border: 'none',
                borderRadius: 3,
                color: loading ? '#9b8ec4' : '#07090e',
                fontFamily: 'var(--mono)',
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.12em',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? '...' : 'SAVE'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '9px 0',
                background: 'none',
                border: '1px solid var(--border2)',
                borderRadius: 3,
                color: 'var(--text3)',
                fontFamily: 'var(--mono)',
                fontSize: 10,
                letterSpacing: '0.12em',
                cursor: 'pointer',
              }}
            >
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
  onDecompose,
  displayCurrency,
  portfolioTotal,
  nextId,
  user,
  onOpenAuth,
  onLoadPortfolio,
}) {
  const [focusedId, setFocusedId] = useState(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [portfolios, setPortfolios] = useState([]);
  const [pfLoading, setPfLoading] = useState(false);
  const [pfError, setPfError] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState('');

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

  async function handleSave(name) {
    const holdings = rows
      .filter((r) => r.ticker.trim() && r.amount)
      .map((r) => ({ ticker: r.ticker.trim().toUpperCase(), amount: r.amount, currency: r.currency }));
    const { error } = await supabase
      .from('portfolios')
      .insert({ user_id: user.id, name, holdings });
    if (error) return error.message;
    setSaveOpen(false);
    fetchPortfolios();
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
    onLoadPortfolio(portfolio.holdings);
  }

  function addRow() {
    setRows((prev) => [...prev, { id: nextId(), ticker: '', amount: '', currency: 'USD' }]);
  }

  function removeRow(id) {
    setRows((prev) => prev.filter((r) => r.id !== id));
    setRowErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function updateRow(id, field, value) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    if (rowErrors[id]) {
      setRowErrors((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  }

  const liveTotal = rows.reduce((sum, row) => {
    const amt = parseFloat(row.amount) || 0;
    return sum + convertAmount(amt, row.currency, displayCurrency);
  }, 0);

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

  return (
    <>
      {saveOpen && <SaveNameModal onSave={handleSave} onClose={() => setSaveOpen(false)} />}
      <div
        style={{
          width: 352,
          minWidth: 352,
          background: 'var(--panel)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        {/* Panel header */}
        <div
          style={{
            padding: '13px 16px 11px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 10,
                color: 'var(--text2)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              Portfolio
            </span>
            <InfoTooltip />
          </div>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)' }}>
            {rows.length} POSITION{rows.length !== 1 ? 'S' : ''}
          </span>
        </div>

        {/* Column headers */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '86px 1fr 65px 24px',
            gap: 6,
            padding: '7px 16px 5px',
            borderBottom: '1px solid var(--card)',
          }}
        >
          {['TICKER', 'AMOUNT', 'CCY', ''].map((h, i) => (
            <span
              key={i}
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 9,
                color: 'var(--text3)',
                letterSpacing: '0.08em',
                textAlign: i === 1 ? 'right' : 'left',
              }}
            >
              {h}
            </span>
          ))}
        </div>

        {/* Scrollable rows */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '3px 16px', minHeight: 0 }}>
          {rows.map((row) => {
            const type = autoType(row.ticker);
            const hasError = !!rowErrors[row.id];
            const isUnknown = type === 'Unknown' && !!row.ticker;
            const showTypeBadge = !!row.ticker && type !== 'Unknown';
            return (
              <div
                key={row.id}
                style={{
                  borderBottom: '1px solid ' + (isUnknown ? 'rgba(244,185,66,0.2)' : 'var(--border-sub)'),
                  background: isUnknown ? 'rgba(244,185,66,0.04)' : 'transparent',
                  paddingBottom: 2,
                  marginLeft: -16,
                  marginRight: -16,
                  paddingLeft: 16,
                  paddingRight: 16,
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '86px 1fr 65px 24px',
                    gap: 6,
                    alignItems: 'center',
                    paddingTop: 5,
                    paddingBottom: hasError ? 2 : 5,
                  }}
                >
                  {/* Ticker */}
                  <div style={{ position: 'relative' }}>
                    <input
                      value={row.ticker}
                      maxLength={8}
                      placeholder="TICKER"
                      onChange={(e) => updateRow(row.id, 'ticker', e.target.value.toUpperCase())}
                      onFocus={() => setFocusedId(`${row.id}-t`)}
                      onBlur={() => setFocusedId(null)}
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

                  {/* Amount */}
                  <div style={{ position: 'relative' }}>
                    {showTypeBadge && (
                      <span
                        style={{
                          position: 'absolute',
                          left: 6,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          fontFamily: 'var(--mono)',
                          fontSize: 7.5,
                          fontWeight: 600,
                          color: type === 'ETF' ? ACCENT : 'var(--text3)',
                          letterSpacing: '0.06em',
                          pointerEvents: 'none',
                          lineHeight: 1,
                        }}
                      >
                        {type === 'ETF' ? 'ETF' : 'STK'}
                      </span>
                    )}
                    <input
                      type="number"
                      value={row.amount}
                      placeholder="0"
                      min="0"
                      step="any"
                      onChange={(e) => updateRow(row.id, 'amount', e.target.value)}
                      onFocus={() => setFocusedId(`${row.id}-a`)}
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
                            : focusedId === `${row.id}-a`
                            ? ACCENT
                            : 'var(--border)',
                      }}
                    />
                  </div>

                  {/* Currency toggle */}
                  <CurrencyToggle
                    value={row.currency}
                    onChange={(cur) => updateRow(row.id, 'currency', cur)}
                  />

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text3)',
                      cursor: 'pointer',
                      fontSize: 16,
                      lineHeight: 1,
                      padding: 2,
                      borderRadius: 2,
                      transition: 'color 0.12s',
                      textAlign: 'center',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#f05a7e')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text3)')}
                    title="Remove"
                  >
                    ×
                  </button>
                </div>

                {hasError && (
                  <div
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 10,
                      color: '#f05a7e',
                      paddingBottom: 4,
                      paddingLeft: 2,
                    }}
                  >
                    {rowErrors[row.id]}
                  </div>
                )}
              </div>
            );
          })}

          {/* Add position */}
          <button
            type="button"
            onClick={addRow}
            style={{
              width: '100%',
              marginTop: 10,
              padding: '7px 0',
              background: 'none',
              border: '1px dashed var(--border2)',
              borderRadius: 3,
              cursor: 'pointer',
              color: 'var(--text3)',
              fontFamily: 'var(--mono)',
              fontSize: 10,
              letterSpacing: '0.12em',
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = ACCENT;
              e.currentTarget.style.color = ACCENT;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border2)';
              e.currentTarget.style.color = 'var(--text3)';
            }}
          >
            + ADD POSITION
          </button>
        </div>

        {/* My Portfolios section */}
        {!user ? (
          <div
            style={{
              borderTop: '1px solid var(--border)',
              flexShrink: 0,
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              onClick={onOpenAuth}
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 14,
                color: 'var(--text3)',
                letterSpacing: '0.06em',
                cursor: 'pointer',
                textDecoration: 'underline',
                textDecorationColor: 'var(--border2)',
                textUnderlineOffset: 3,
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text3)')}
            >
              Sign in to save portfolios
            </span>
          </div>
        ) : (
        <div
          style={{
            borderTop: '1px solid var(--border)',
            flexShrink: 0,
            maxHeight: 180,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '8px 16px 6px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 9,
                color: 'var(--text3)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              My Portfolios
            </span>
            {pfError && (
              <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: '#f05a7e' }}>
                {pfError}
              </span>
            )}
          </div>

          {pfLoading ? (
            <div style={{ padding: '4px 16px 12px', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)' }}>
              Loading…
            </div>
          ) : portfolios.length === 0 ? (
            <div style={{ padding: '4px 16px 12px', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)' }}>
              No saved portfolios yet
            </div>
          ) : (
            <div style={{ overflowY: 'auto', flex: 1, padding: '0 16px 8px' }}>
              {deleteError && (
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#f05a7e', marginBottom: 4 }}>
                  {deleteError}
                </div>
              )}
              {portfolios.map((pf) => (
                <div
                  key={pf.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 0',
                    borderBottom: '1px solid var(--border-sub)',
                  }}
                >
                  <span
                    style={{
                      flex: 1,
                      fontFamily: 'var(--mono)',
                      fontSize: 11,
                      color: 'var(--text)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={pf.name}
                  >
                    {pf.name}
                  </span>

                  {confirmDeleteId === pf.id ? (
                    <>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text3)', whiteSpace: 'nowrap' }}>
                        Sure?
                      </span>
                      <button type="button" onClick={() => handleDelete(pf.id)} style={smallBtnStyle('#f05a7e')}>
                        Yes
                      </button>
                      <button type="button" onClick={() => { setConfirmDeleteId(null); setDeleteError(''); }} style={smallBtnStyle('var(--text3)')}>
                        No
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" onClick={() => handleLoad(pf)} style={smallBtnStyle(ACCENT)}>
                        Load
                      </button>
                      <button type="button" onClick={() => { setConfirmDeleteId(pf.id); setDeleteError(''); }} style={smallBtnStyle('var(--text3)')}>
                        ×
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        )}

        {/* Footer */}
        <div
          style={{
            padding: '14px 16px',
            borderTop: '1px solid var(--border)',
            background: 'var(--footer-bg)',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 10,
            }}
          >
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text2)', letterSpacing: '0.1em' }}>
              TOTAL INVESTED
            </span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 22, fontWeight: 600, color: 'var(--text)' }}>
              {fmtMoney(liveTotal)}{' '}
              <span style={{ fontSize: 12, color: 'var(--text3)' }}>{displayCurrency}</span>
            </span>
          </div>

          {user && (
            <button
              type="button"
              onClick={() => setSaveOpen(true)}
              style={{
                width: '100%',
                padding: '8px 0',
                background: 'none',
                border: '1px solid var(--border2)',
                borderRadius: 3,
                color: 'var(--text2)',
                fontFamily: 'var(--mono)',
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.12em',
                cursor: 'pointer',
                marginBottom: 8,
                transition: 'border-color 0.15s, color 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = ACCENT;
                e.currentTarget.style.color = ACCENT;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border2)';
                e.currentTarget.style.color = 'var(--text2)';
              }}
            >
              + SAVE PORTFOLIO
            </button>
          )}

          <button
            type="button"
            onClick={onDecompose}
            style={{
              width: '100%',
              padding: '11px 0',
              background: ACCENT,
              border: 'none',
              borderRadius: 3,
              color: '#07090e',
              fontFamily: 'var(--mono)',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.14em',
              cursor: 'pointer',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.88')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            ▶  DECOMPOSE PORTFOLIO
          </button>

          <div
            style={{
              marginTop: 8,
              fontFamily: 'var(--mono)',
              fontSize: 10,
              color: 'var(--text3)',
              textAlign: 'center',
              lineHeight: 1.6,
            }}
          >
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
