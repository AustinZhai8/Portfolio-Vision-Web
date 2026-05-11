import { useState } from 'react';
import { getStockInfo, displayTicker, isKnownTicker, decomposeContributions, getEtfName, isEtf } from '../utils/decompose';
import { fmtMoney } from '../utils/format';
import CompanyLogo from './CompanyLogo';

const ACCENT = '#a78bfa';

function ContributionPopup({ ticker, portfolio, onClose }) {
  const contributions = decomposeContributions(portfolio, ticker);
  const info = getStockInfo(ticker);
  const dt = displayTicker(ticker);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(4,8,16,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 320,
          background: 'var(--panel)',
          border: '1px solid var(--border2)',
          borderRadius: 6,
          padding: '18px 20px 16px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
        }}
      >
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 600, color: ACCENT, letterSpacing: '0.08em' }}>
            {dt}
          </div>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
            {info.name}
          </div>
        </div>

        <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
          Exposure Sources
        </div>

        {contributions.length === 0 ? (
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>
            No tracked sources found.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {contributions.map((c) => (
              <div
                key={c.source}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  padding: '5px 0',
                  borderBottom: '1px solid var(--border-sub)',
                }}
              >
                <div>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text)', letterSpacing: '0.06em' }}>
                    {displayTicker(c.source)}
                  </span>
                  {c.isEtf && (
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: ACCENT, letterSpacing: '0.06em', marginLeft: 5 }}>
                      ETF
                    </span>
                  )}
                  <div style={{ fontFamily: 'var(--sans)', fontSize: 10, color: 'var(--text3)', marginTop: 1 }}>
                    {c.sourceName}
                  </div>
                </div>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text2)' }}>
                  {fmtMoney(c.amount)}
                </span>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: 14,
            width: '100%',
            padding: '8px 0',
            background: 'none',
            border: '1px solid var(--border2)',
            borderRadius: 3,
            color: 'var(--text3)',
            fontFamily: 'var(--mono)',
            fontSize: 10,
            letterSpacing: '0.1em',
            cursor: 'pointer',
          }}
        >
          CLOSE
        </button>
      </div>
    </div>
  );
}

export default function HoldingRow({ rank, ticker, amount, weight, maxWeight, even, portfolio }) {
  const [hov, setHov] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const info = getStockInfo(ticker);
  const dt = displayTicker(ticker);
  const unknown = !isKnownTicker(ticker);
  const tickerDisplay = dt.length > 8 ? dt.slice(0, 7) + '…' : dt;

  return (
    <>
      {infoOpen && portfolio && (
        <ContributionPopup ticker={ticker} portfolio={portfolio} onClose={() => setInfoOpen(false)} />
      )}
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        className="holding-row"
        style={{
          display: 'grid',
          gridTemplateColumns: '24px 30px 1fr 68px 1fr 84px 24px',
          gap: 0,
          alignItems: 'center',
          padding: '0 16px',
          height: 38,
          background: hov ? 'var(--card-hover)' : even ? 'var(--card)' : 'var(--panel)',
          borderBottom: '1px solid var(--border-sub)',
          transition: 'background 0.1s',
          cursor: 'default',
        }}
      >
        <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>
          {rank}
        </span>

        <CompanyLogo ticker={ticker} size={24} />

        <div style={{ paddingLeft: 10, minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              color: unknown ? '#f4b942' : 'var(--text)',
              fontWeight: 500,
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {unknown ? dt : info.name}
          </div>
          {!unknown && (
            <div
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 11,
                color: 'var(--text2)',
                marginTop: 1,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {info.sector}
            </div>
          )}
        </div>

        <span
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 13,
            color: hov ? ACCENT : 'var(--text2)',
            letterSpacing: '0.06em',
            transition: 'color 0.1s',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'block',
          }}
          title={dt.length > 8 ? dt : undefined}
        >
          {tickerDisplay}
        </span>

        <div className="holding-weight" style={{ display: 'flex', alignItems: 'center', gap: 6, paddingRight: 8 }}>
          <div
            className="holding-weight-bar"
            style={{
              flex: 1,
              height: 3,
              background: 'var(--bar-track)',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${(weight / maxWeight) * 100}%`,
                height: '100%',
                background: ACCENT,
                borderRadius: 2,
                opacity: 0.85,
              }}
            />
          </div>
          <span
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 13,
              color: 'var(--text)',
              minWidth: 38,
              textAlign: 'right',
            }}
          >
            {weight.toFixed(1)}%
          </span>
        </div>

        <span
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 13,
            color: 'var(--text2)',
            textAlign: 'right',
            paddingRight: 6,
          }}
        >
          {fmtMoney(amount)}
        </span>

        <button
          type="button"
          onClick={() => setInfoOpen(true)}
          title="Show exposure sources"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: hov ? ACCENT : 'var(--text3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            width: 20,
            height: 20,
            borderRadius: 3,
            transition: 'color 0.1s',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = ACCENT)}
          onMouseLeave={(e) => (e.currentTarget.style.color = hov ? ACCENT : 'var(--text3)')}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="8" strokeWidth="3" />
            <line x1="12" y1="12" x2="12" y2="16" />
          </svg>
        </button>
      </div>
    </>
  );
}
