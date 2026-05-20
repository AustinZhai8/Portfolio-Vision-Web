import { useEffect, useState } from 'react';

export default function HorizBar({ name, w, color, max, animKey }) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    setPct(0);
    const t = setTimeout(() => setPct((w / max) * 100), 80);
    return () => clearTimeout(t);
  }, [animKey, w, max]);

  const isUnknown = name === 'Unknown';
  const isUntracked = name === 'Untracked';
  const isDimmed = isUnknown || isUntracked;

  const barFill = isUntracked
    ? 'repeating-linear-gradient(45deg, var(--stripe1) 0px, var(--stripe1) 5px, var(--stripe2) 5px, var(--stripe2) 10px)'
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
          color: isDimmed ? 'var(--text3)' : 'var(--text2)',
          textAlign: 'right',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontStyle: 'italic',
          opacity: isDimmed ? 0.75 : 1,
        }}
      >
        {isUntracked ? 'Untracked (data cutoff)' : name}
      </span>
      <div style={{ height: 12, background: 'var(--bar-track)', borderRadius: 2, overflow: 'hidden' }}>
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
          color: isDimmed ? 'var(--text3)' : 'var(--text)',
          textAlign: 'right',
        }}
      >
        {w.toFixed(window.innerWidth >= 768 ? 2 : 1)}%
      </span>
    </div>
  );
}
