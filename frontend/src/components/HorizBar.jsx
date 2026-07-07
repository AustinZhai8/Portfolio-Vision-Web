import { useEffect, useState } from 'react';

// v2 breakdown bar: label / track / percentage. Accent fill (monochrome per the
// v2 design); "Untracked"/"Unknown" render dimmed and italic. `color` is accepted
// for prop-shape compatibility but intentionally unused for the fill.
export default function HorizBar({ name, w, max, animKey }) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    setPct(0);
    const t = setTimeout(() => setPct((w / max) * 100), 80);
    return () => clearTimeout(t);
  }, [animKey, w, max]);

  const isUnknown = name === 'Unknown';
  const isUntracked = name === 'Untracked';
  const dimmed = isUnknown || isUntracked;
  const label = isUntracked ? 'Untracked (data cutoff)' : name;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '7px 0' }}>
      <span
        className="bd-label"
        style={{
          width: 150, fontSize: 13, color: dimmed ? 'var(--text3)' : 'var(--text2)',
          textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          fontStyle: dimmed ? 'italic' : 'normal', flexShrink: 0,
        }}
        title={label}
      >
        {label}
      </span>
      <div style={{ flex: 1, height: 8, background: 'var(--track)', borderRadius: 999, overflow: 'hidden' }}>
        <div
          style={{
            width: `${pct}%`, height: '100%', borderRadius: 999,
            background: dimmed ? 'var(--text3)' : 'var(--accent)',
            opacity: dimmed ? 0.4 : 0.9,
            transition: 'width 0.9s cubic-bezier(0.16,1,0.3,1)',
          }}
        />
      </div>
      <span
        className="bd-pct"
        style={{
          width: 52, fontSize: 13, fontWeight: 600, color: dimmed ? 'var(--text3)' : 'var(--text)',
          textAlign: 'right', fontVariantNumeric: 'tabular-nums', flexShrink: 0,
        }}
      >
        {w.toFixed(2)}%
      </span>
    </div>
  );
}
