import { useState } from 'react';
import { convertAmount, isEtf, isKnownTicker, resolveTicker } from '../utils/decompose';
import { fmtMoney } from '../utils/format';

const ACCENT = '#a78bfa';
const AMBER = '#f4b942';

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
        background: '#060c16',
        borderRadius: 3,
        padding: 2,
        border: '1px solid #182335',
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

export default function PortfolioPanel({
  rows,
  setRows,
  rowErrors,
  setRowErrors,
  onDecompose,
  displayCurrency,
  portfolioTotal,
  warnings,
  nextId,
}) {
  const [focusedId, setFocusedId] = useState(null);

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
    // Clear error for this row when user edits it
    if (rowErrors[id]) {
      setRowErrors((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  }

  // Live total from current form state (updates as user types)
  const liveTotal = rows.reduce((sum, row) => {
    const amt = parseFloat(row.amount) || 0;
    return sum + convertAmount(amt, row.currency, displayCurrency);
  }, 0);

  const inputBase = {
    background: '#060c16',
    border: '1px solid #182335',
    borderRadius: 3,
    color: '#c8ddf0',
    padding: '5px 8px',
    width: '100%',
    transition: 'border-color 0.12s',
    fontFamily: 'var(--mono)',
  };

  return (
    <div
      style={{
        width: 352,
        minWidth: 352,
        background: '#0b1119',
        borderRight: '1px solid #182335',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      {/* Panel header */}
      <div
        style={{
          padding: '13px 16px 11px',
          borderBottom: '1px solid #182335',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
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
          borderBottom: '1px solid #0f1825',
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

      {/* Rows */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '3px 16px' }}>
        {rows.map((row) => {
          const type = autoType(row.ticker);
          const hasError = !!rowErrors[row.id];
          return (
            <div key={row.id} style={{ borderBottom: '1px solid #0d1520', paddingBottom: 2 }}>
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
                      borderColor: hasError ? '#f05a7e' : focusedId === `${row.id}-t` ? ACCENT : '#182335',
                      color: type === 'Unknown' && row.ticker ? '#f4b942' : '#c8ddf0',
                    }}
                  />
                  {/* Auto-detected type badge */}
                  {row.ticker && (
                    <span
                      style={{
                        position: 'absolute',
                        right: 5,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontFamily: 'var(--mono)',
                        fontSize: 8,
                        color: type === 'ETF' ? ACCENT : type === 'Unknown' ? AMBER : 'var(--text3)',
                        letterSpacing: '0.06em',
                        pointerEvents: 'none',
                      }}
                    >
                      {type}
                    </span>
                  )}
                </div>

                {/* Amount */}
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
                    borderColor: hasError && !rowErrors[row.id]?.includes('Ticker')
                      ? '#f05a7e'
                      : focusedId === `${row.id}-a` ? ACCENT : '#182335',
                  }}
                />

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

              {/* Inline validation error */}
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
            border: '1px dashed #253548',
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
            e.currentTarget.style.borderColor = '#253548';
            e.currentTarget.style.color = 'var(--text3)';
          }}
        >
          + ADD POSITION
        </button>

        {/* Unrecognized tickers warning */}
        {warnings.length > 0 && (
          <div
            style={{
              marginTop: 10,
              padding: '7px 10px',
              background: 'rgba(244, 185, 66, 0.07)',
              border: '1px solid rgba(244, 185, 66, 0.3)',
              borderRadius: 3,
            }}
          >
            <div
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 9,
                color: AMBER,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: 3,
              }}
            >
              Unrecognized tickers
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#b8a060', lineHeight: 1.5 }}>
              {warnings.join(', ')} — included in results as Unknown
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '14px 16px',
          borderTop: '1px solid #182335',
          background: '#060c16',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 14,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 10,
              color: 'var(--text2)',
              letterSpacing: '0.1em',
            }}
          >
            TOTAL INVESTED
          </span>
          <span
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 22,
              fontWeight: 600,
              color: '#c8ddf0',
            }}
          >
            {fmtMoney(liveTotal)}{' '}
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>{displayCurrency}</span>
          </span>
        </div>

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
  );
}
