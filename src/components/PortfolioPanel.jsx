import { fmtMoney, fmtAmount } from '../utils/format';

const ACCENT = '#a78bfa';

const cellStyle = {
  fontFamily: 'var(--mono)',
  background: '#060c16',
  border: '1px solid #182335',
  borderRadius: 3,
  padding: '5px 8px',
  color: '#c8ddf0',
};

export default function PortfolioPanel({ entries, displayCurrency, total }) {
  const tickers = Object.keys(entries);

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
          {tickers.length} POSITIONS
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 104px 50px 70px',
          gap: 6,
          padding: '7px 16px 6px',
          borderBottom: '1px solid #0f1825',
        }}
      >
        {['STOCK/ETF', 'AMOUNT', 'CCY', 'TYPE'].map((h) => (
          <span
            key={h}
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 9,
              color: 'var(--text3)',
              letterSpacing: '0.08em',
              textAlign: 'center',
            }}
          >
            {h}
          </span>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 16px' }}>
        {tickers.map((ticker) => {
          const { amount, currency } = entries[ticker];
          return (
            <div
              key={ticker}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 104px 50px 70px',
                gap: 6,
                alignItems: 'center',
                padding: '5px 0',
                borderBottom: '1px solid #0d1520',
              }}
            >
              <span
                style={{
                  ...cellStyle,
                  fontSize: 13,
                  fontWeight: 500,
                  letterSpacing: '0.1em',
                }}
              >
                {ticker}
              </span>
              <span
                style={{
                  ...cellStyle,
                  fontSize: 14,
                  textAlign: 'right',
                }}
              >
                {fmtAmount(amount)}
              </span>
              <span
                style={{
                  ...cellStyle,
                  fontSize: 11,
                  textAlign: 'center',
                }}
              >
                {currency}
              </span>
              <span
                style={{
                  ...cellStyle,
                  fontSize: 10,
                  textAlign: 'center',
                  textTransform: 'uppercase',
                }}
              >
                ETF
              </span>
            </div>
          );
        })}
      </div>

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
            {fmtMoney(total)}{' '}
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>{displayCurrency}</span>
          </span>
        </div>
        <div
          style={{
            width: '100%',
            padding: '11px 0',
            background: ACCENT,
            borderRadius: 3,
            color: '#07090e',
            fontFamily: 'var(--mono)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.14em',
            textAlign: 'center',
            cursor: 'default',
            opacity: 0.95,
          }}
        >
          ▶  DECOMPOSE PORTFOLIO
        </div>
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
