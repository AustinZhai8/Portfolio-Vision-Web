// Segmented pill toggle — shared across the header, position rows, and the
// build screen's default-input control.
export default function Seg({ options, value, onChange, small }) {
  return (
    <div style={{ display: 'inline-flex', gap: 2, background: 'var(--seg-bg)', borderRadius: 999, padding: 3 }}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              padding: small ? '3px 10px' : '6px 14px',
              background: active ? 'var(--seg-active)' : 'transparent',
              color: active ? 'var(--text)' : 'var(--text3)',
              border: 'none',
              borderRadius: 999,
              cursor: 'pointer',
              fontSize: small ? 12 : 13,
              fontWeight: 600,
              fontFamily: 'var(--sans)',
              transition: 'background 0.15s, color 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
