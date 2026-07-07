import { useState, useRef, useEffect } from 'react';
import { getStockInfo, displayTicker, isKnownTicker, decomposeContributions } from '../utils/decompose';
import { fmtMoney } from '../utils/format';
import CompanyLogo from './CompanyLogo';

// v2 holding row ("HoldingItem") with an inline "Where it comes from" popover
// fed by decomposeContributions. Prop contract unchanged from the old ResultsPanel.
export default function HoldingRow({ ticker, amount, weight, maxWeight, portfolio }) {
  const [hov, setHov] = useState(false);
  const [info, setInfo] = useState(false);
  const infoRef = useRef(null);

  const stockInfo = getStockInfo(ticker);
  const dt = displayTicker(ticker);
  const unknown = !isKnownTicker(ticker);

  useEffect(() => {
    if (!info) return;
    const close = (e) => { if (infoRef.current && !infoRef.current.contains(e.target)) setInfo(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [info]);

  const contributions = info && portfolio ? decomposeContributions(portfolio, ticker) : [];
  const positionTotal = contributions.reduce((s, c) => s + c.amount, 0) || amount;

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="holding-item"
      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 20px', background: hov ? 'var(--card2)' : 'transparent', transition: 'background 0.12s', cursor: 'default', position: 'relative' }}
    >
      <CompanyLogo ticker={ticker} size={34} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 600, color: unknown ? 'var(--amber)' : 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {unknown ? dt : stockInfo.name}
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--text3)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {dt}{!unknown && stockInfo.sector ? ` · ${stockInfo.sector}` : ''}
        </div>
      </div>

      {/* Position size bar */}
      <div className="holding-bar" style={{ width: 140, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
        <div style={{ flex: 1, height: 6, background: 'var(--track)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ width: `${(weight / maxWeight) * 100}%`, height: '100%', background: 'var(--accent)', opacity: 0.85, borderRadius: 999 }} />
        </div>
      </div>

      <div className="holding-val" style={{ textAlign: 'right', flexShrink: 0, width: 92 }}>
        <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{fmtMoney(amount)}</div>
        <div style={{ fontSize: 12.5, color: 'var(--text3)', marginTop: 1, fontVariantNumeric: 'tabular-nums' }}>{weight.toFixed(2)}%</div>
      </div>

      {/* Info button + popover */}
      <div ref={infoRef} style={{ position: 'relative', flexShrink: 0 }}>
        <button
          type="button"
          onClick={() => setInfo((v) => !v)}
          title="Where does this come from?"
          style={{
            width: 26, height: 26, borderRadius: 999, border: 'none', cursor: 'pointer',
            background: info ? 'var(--accent-soft)' : 'var(--seg-bg)',
            color: info ? 'var(--accent)' : 'var(--text3)',
            fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.12s, color 0.12s', fontStyle: 'italic', fontFamily: 'Georgia, serif',
          }}
        >
          i
        </button>

        {info && (
          <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', zIndex: 300, width: 260, background: 'var(--card2)', border: '1px solid var(--border2)', borderRadius: 16, padding: '14px 16px', boxShadow: '0 16px 40px rgba(0,0,0,0.55)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>Where it comes from</div>
            {contributions.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--text3)' }}>No tracked sources found.</div>
            ) : (
              <>
                {contributions.map((c) => (
                  <div key={c.source} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '5px 0', gap: 10 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.sourceName}>
                      {displayTicker(c.source)}
                      {c.isEtf && <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', marginLeft: 5 }}>ETF</span>}
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--text2)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                      {fmtMoney(c.amount)} <span style={{ color: 'var(--text3)', fontSize: 12 }}>({((c.amount / positionTotal) * 100).toFixed(0)}%)</span>
                    </span>
                  </div>
                ))}
                <div style={{ height: 1, background: 'var(--border2)', margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text3)' }}>Total position</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{fmtMoney(amount)}</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
