import { useState, useRef } from 'react';
import { convertAmount, isEtf, isKnownTicker } from '../utils/decompose';
import { fmtMoney } from '../utils/format';

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
            background: '#0f1825',
            border: '1px solid #253548',
            borderRadius: 4,
            padding: '12px 14px',
            zIndex: 200,
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
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
          <p
            style={{
              fontFamily: 'var(--sans, sans-serif)',
              fontSize: 11.5,
              color: 'var(--text2)',
              lineHeight: 1.6,
              margin: '0 0 8px',
            }}
          >
            Enter any combination of ETFs and stocks with their invested amounts. Portfolio Vision
            recursively decomposes each ETF into its underlying holdings, then aggregates everything
            into a unified view across all your positions.
          </p>
          <p
            style={{
              fontFamily: 'var(--sans, sans-serif)',
              fontSize: 11.5,
              color: 'var(--text2)',
              lineHeight: 1.6,
              margin: '0 0 8px',
            }}
          >
            Our stock and ETF database is updated monthly. If a ticker you entered is highlighted in
            yellow, it simply means it isn't in our database yet — you can still enter it and track
            it as-is. To request an addition, email{' '}
            <span style={{ color: ACCENT }}>austinhsi@gmail.com</span>
          </p>
          <p
            style={{
              fontFamily: 'var(--sans, sans-serif)',
              fontSize: 11.5,
              color: 'var(--text2)',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
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
          const isUnknown = type === 'Unknown' && !!row.ticker;
          const showTypeBadge = !!row.ticker && type !== 'Unknown';
          return (
            <div
              key={row.id}
              style={{
                borderBottom: '1px solid ' + (isUnknown ? 'rgba(244,185,66,0.15)' : '#0d1520'),
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
                      borderColor: hasError ? '#f05a7e' : focusedId === `${row.id}-t` ? ACCENT : '#182335',
                      color: isUnknown ? '#f4b942' : '#c8ddf0',
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
                          : '#182335',
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
