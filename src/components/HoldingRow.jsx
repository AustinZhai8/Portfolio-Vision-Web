import { useState } from 'react';
import { getStockInfo, displayTicker, isKnownTicker } from '../utils/decompose';
import { fmtMoney } from '../utils/format';
import CompanyLogo from './CompanyLogo';

const ACCENT = '#a78bfa';

export default function HoldingRow({ rank, ticker, amount, weight, maxWeight, even }) {
  const [hov, setHov] = useState(false);
  const info = getStockInfo(ticker);
  const dt = displayTicker(ticker);
  const unknown = !isKnownTicker(ticker);
  const tickerDisplay = dt.length > 8 ? dt.slice(0, 7) + '…' : dt;

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="holding-row"
      style={{
        display: 'grid',
        gridTemplateColumns: '24px 30px 1fr 68px 1fr 100px',
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
          {weight.toFixed(2)}%
        </span>
      </div>

      <span
        style={{
          fontFamily: 'var(--mono)',
          fontSize: 13,
          color: 'var(--text2)',
          textAlign: 'right',
          paddingRight: 12,
        }}
      >
        {fmtMoney(amount)}
      </span>
    </div>
  );
}
