import { useEffect, useState } from 'react';

export default function HorizBar({ name, w, color, max, animKey }) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    setPct(0);
    const t = setTimeout(() => setPct((w / max) * 100), 80);
    return () => clearTimeout(t);
  }, [animKey, w, max]);

  const isUnknown = name === 'Unknown';
  // "Untracked" = holdings below the ETF data cutoff — not in our database at all
  const isUntracked = name === 'Untracked';
  const isDimmed = isUnknown || isUntracked;

  // Untracked uses a diagonal-stripe pattern to signal "incomplete / best-effort"
  const barFill = isUntracked
    ? 'repeating-linear-gradient(45deg, #2d3f55 0px, #2d3f55 5px, #1a2d42 5px, #1a2d42 10px)'
    : color;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '150px 1fr 44px',
        gap: 8,
        alignItems: 'center',
        marginBottom: 5,
        marginTop: isUntracked ? 6 : 0,
      }}
    >
      <span
        style={{
          fontFamily: 'var(--sans)',
          fontSize: 13,
          color: isDimmed ? '#64748b' : 'var(--text2)',
          textAlign: 'right',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontStyle: 'italic',
          opacity: isDimmed ? 0.85 : 1,
        }}
      >
        {isUntracked ? 'Untracked (data cutoff)' : name}
      </span>
      <div style={{ height: 12, background: '#182335', borderRadius: 2, overflow: 'hidden' }}>
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: barFill,
            borderRadius: 2,
            transition: 'width 0.85s cubic-bezier(0.16,1,0.3,1)',
            opacity: isUnknown ? 0.6 : 1,
          }}
        />
      </div>
      <span
        style={{
          fontFamily: 'var(--mono)',
          fontSize: 12,
          color: isDimmed ? '#64748b' : '#e8f0fb',
          textAlign: 'right',
        }}
      >
        {w.toFixed(1)}%
      </span>
    </div>
  );
}
