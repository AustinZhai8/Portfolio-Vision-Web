const ACCENT = '#a78bfa';

export default function InfoModal({ open, onClose }) {
  if (!open) return null;

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
          width: 'calc(100% - 40px)',
          maxWidth: 520,
          background: 'var(--panel)',
          border: '1px solid var(--border2)',
          borderRadius: 6,
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
        }}
      >
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--text2)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            How Portfolio Vision Works
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text3)',
              cursor: 'pointer',
              fontSize: 20,
              lineHeight: 1,
              padding: '2px 6px',
              marginTop: -2,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontFamily: 'var(--sans, sans-serif)', fontSize: 12, color: 'var(--text2)', lineHeight: 1.6, margin: 0 }}>
            Enter any combination of ETFs and stocks with their invested amounts. Portfolio Vision
            recursively decomposes each ETF into its underlying holdings, then aggregates everything
            into a unified view across all your positions.
          </p>
          <p style={{ fontFamily: 'var(--sans, sans-serif)', fontSize: 12, color: 'var(--text2)', lineHeight: 1.6, margin: 0 }}>
            Portfolio Vision was built with one belief: that truly understanding what you own is the most important part of investing. The goal is to give you a complete, transparent view of your portfolio, not just ticker symbols, but the actual companies and sectors your money is working in. Note that some weightings may be off by a percent or so due to database update timing and partial holdings data.
          </p>
          <p style={{ fontFamily: 'var(--sans, sans-serif)', fontSize: 12, color: 'var(--text2)', lineHeight: 1.6, margin: 0 }}>
            A few things are intentionally excluded. Most covered call ETFs are not supported, since the covered call strategy means you don't fully participate in the underlying stock's growth, the holdings don't reflect true ownership in the same way. Leveraged ETFs are also not included. If you hold a leveraged ETF, simply enter the underlying ETF instead and mentally double the exposure to simulate the effect.
          </p>
          <p style={{ fontFamily: 'var(--sans, sans-serif)', fontSize: 12, color: 'var(--text2)', lineHeight: 1.6, margin: 0 }}>
            Our stock and ETF database is updated constantly. If a ticker you entered is highlighted in
            yellow, it simply means it isn't in our database yet — you can still enter it and track
            it as-is. If you have an addition or any feedback, feel free to email{' '}
            <span style={{ color: ACCENT }}>austinhzhai@gmail.com</span>
          </p>
          <p style={{ fontFamily: 'var(--sans, sans-serif)', fontSize: 12, color: 'var(--text2)', lineHeight: 1.6, margin: 0 }}>
            Holding spot price assets? If you hold any ETF tracking a physical commodity, just type
            the asset name directly. For example, type "Gold" instead of GLD, "Silver" instead of
            SLV, "Copper" instead of CPER. Portfolio Vision will recognize it automatically.
          </p>
          <p style={{ fontFamily: 'var(--sans, sans-serif)', fontSize: 12, color: 'var(--text2)', lineHeight: 1.6, margin: 0 }}>
            What does "Untracked" mean? At the bottom of your results you may see a small percentage
            listed as untracked. This simply means that either the ETF holds too many positions to
            list individually (so only the largest holdings are tracked), or that only partial public
            data is available for that fund. Your total invested amount is still accurate — untracked
            just refers to holdings we cannot break down further.
          </p>
        </div>
      </div>
    </div>
  );
}
