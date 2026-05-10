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

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '24px 30px 1fr 68px 1fr 100px 60px',
        gap: 0,
        alignItems: 'center',
        padding: '0 16px',
        height: 38,
        background: hov ? '#131f2e' : even ? '#0f1825' : '#0b1119',
        borderBottom: '1px solid #0d1520',
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
            color: unknown ? '#f4b942' : '#e8f0fb',
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
          color: hov ? ACCENT : '#b8d4f1',
          letterSpacing: '0.06em',
          transition: 'color 0.1s',
        }}
      >
        {dt}
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingRight: 8 }}>
        <div
          style={{
            flex: 1,
            height: 3,
            background: '#182335',
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
            color: '#e8f0fb',
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
          color: '#b8d4f1',
          textAlign: 'right',
          paddingRight: 12,
        }}
      >
        {fmtMoney(amount)}
      </span>

      <span
        style={{
          fontFamily: 'var(--mono)',
          fontSize: 10,
          color: unknown ? '#f4b942' : 'var(--text3)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        {unknown ? 'UNKNOWN' : 'STOCK'}
      </span>
    </div>
  );
}
