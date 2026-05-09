const ACCENT = '#a78bfa';

export default function Header({ displayCurrency, setDisplayCurrency }) {
  return (
    <header
      style={{
        height: 80,
        minHeight: 80,
        background: '#0b1119',
        borderBottom: '1px solid #182335',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: 16,
        flexShrink: 0,
        zIndex: 20,
      }}
    >
      {/* Logo — marginLeft mirrors the visual offset of the right-controls group */}
      <img
        src="/PortfolioVision.png"
        alt="Portfolio Vision"
        style={{
          height: 78,
          width: 'auto',
          objectFit: 'contain',
          flexShrink: 0,
          marginLeft: 20,
        }}
      />

      {/* Pushes right controls to the far right */}
      <div style={{ flex: 1 }} />

      {/* Title — absolutely centered on the full header width, non-interactive */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--sans)',
            color: '#e8f0fb',
            fontWeight: 500,
            letterSpacing: '0.04em',
            whiteSpace: 'nowrap',
            fontSize: 19,
            lineHeight: 1,
          }}
        >
          See everything. Invest better.
        </span>
        <span
          style={{
            fontFamily: 'var(--mono)',
            fontWeight: 600,
            letterSpacing: '0.12em',
            color: 'var(--text3)',
            textTransform: 'uppercase',
            fontSize: 12,
            lineHeight: 1,
          }}
        >
          PORTFOLIO<span style={{ color: ACCENT }}>VISION</span>
        </span>
      </div>

      {/* Right controls — z-index keeps them clickable above the absolute title */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--mono)',
            color: 'var(--text3)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontSize: 12,
          }}
        >
          Display:
        </span>
        <div
          style={{
            display: 'flex',
            gap: 3,
            background: '#060c16',
            borderRadius: 4,
            padding: 3,
            border: '1px solid #253548',
          }}
        >
          {['USD', 'CAD'].map((cur) => (
            <button
              key={cur}
              onClick={() => setDisplayCurrency(cur)}
              style={{
                padding: '4px 10px',
                background: displayCurrency === cur ? ACCENT : 'transparent',
                border: 'none',
                borderRadius: 2,
                cursor: 'pointer',
                fontFamily: 'var(--mono)',
                fontWeight: 600,
                color: displayCurrency === cur ? '#07090e' : 'var(--text3)',
                transition: 'all 0.15s',
                letterSpacing: '0.08em',
                fontSize: 10,
              }}
            >
              {cur}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: '#182335',
          border: '1px solid #253548',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1,
          flexShrink: 0,
        }}
      >
        <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text2)' }}>
          AZ
        </span>
      </div>
    </header>
  );
}
