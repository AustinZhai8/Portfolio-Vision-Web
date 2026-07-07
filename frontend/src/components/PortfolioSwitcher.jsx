import { useState, useRef, useEffect } from 'react';

// Portfolio switcher pill + dropdown. Wired to the real Supabase portfolios
// owned by PortfolioPanel; the switcher only renders and dispatches intent.
export default function PortfolioSwitcher({
  portfolios,
  activeId,
  activeName,
  dirty,
  signedIn,
  onOpenAuth,
  onSelect,
  onSave,
  onSaveAsNew,
  onNew,
  onDelete,
}) {
  const [open, setOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setConfirmDeleteId(null); } };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  if (!signedIn) {
    return (
      <button
        type="button"
        onClick={onOpenAuth}
        className="pv-btn-ghost"
        style={{ padding: '7px 16px', fontSize: 13 }}
      >
        Sign in to save
      </button>
    );
  }

  const label = activeName || 'Untitled portfolio';

  return (
    <div ref={ref} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--seg-bg)', border: '1.5px solid ' + (open ? 'var(--accent)' : 'transparent'),
          borderRadius: 999, padding: '7px 14px 7px 16px', cursor: 'pointer',
          fontSize: 15, fontWeight: 700, color: 'var(--text)', transition: 'border-color 0.15s',
          maxWidth: 240,
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
        {dirty && <span title="Unsaved changes" style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--accent)', flexShrink: 0 }} />}
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', flexShrink: 0 }}>
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
        </svg>
      </button>

      {dirty && (
        <button
          type="button"
          onClick={onSave}
          style={{ background: 'var(--accent-soft)', color: 'var(--accent)', border: 'none', borderRadius: 999, padding: '7px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
        >
          Save
        </button>
      )}

      {open && (
        <div
          style={{
            position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 200,
            minWidth: 250, background: 'var(--card2)', border: '1px solid var(--border2)',
            borderRadius: 16, padding: 6, boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '8px 12px 6px' }}>My portfolios</div>
          {portfolios.length === 0 && (
            <div style={{ fontSize: 13, color: 'var(--text3)', padding: '4px 12px 10px' }}>No saved portfolios yet</div>
          )}
          {portfolios.map((p) => (
            <div key={p.id} className="pv-menu-item" style={{ display: 'flex', alignItems: 'center', gap: 4, borderRadius: 10 }}>
              <button
                type="button"
                onClick={() => { onSelect(p); setOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1, minWidth: 0,
                  background: 'none', border: 'none', borderRadius: 10, padding: '9px 4px 9px 12px',
                  fontSize: 14, fontWeight: 600, color: p.id === activeId ? 'var(--text)' : 'var(--text2)',
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.name}>{p.name}</span>
                {p.id === activeId && (
                  <svg width="14" height="11" viewBox="0 0 14 11" fill="none" style={{ flexShrink: 0, marginLeft: 6 }}>
                    <path d="M1 5.5L5 9.5L13 1.5" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              {confirmDeleteId === p.id ? (
                <button
                  type="button"
                  onClick={() => { onDelete(p.id); setConfirmDeleteId(null); }}
                  title="Confirm delete"
                  style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: 12, fontWeight: 700, padding: '0 10px 0 4px', flexShrink: 0 }}
                >
                  Delete?
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(p.id); }}
                  title="Delete portfolio"
                  style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 15, lineHeight: 1, padding: '0 10px 0 4px', flexShrink: 0 }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <div style={{ height: 1, background: 'var(--border2)', margin: '6px' }} />
          <button
            type="button"
            className="pv-menu-item"
            onClick={() => { onSaveAsNew(); setOpen(false); }}
            style={{ display: 'block', width: '100%', background: 'none', border: 'none', borderRadius: 10, padding: '9px 12px', fontSize: 14, fontWeight: 600, color: 'var(--text2)', cursor: 'pointer', textAlign: 'left' }}
          >
            Save as new portfolio…
          </button>
          <button
            type="button"
            className="pv-menu-item"
            onClick={() => { onNew(); setOpen(false); }}
            style={{ display: 'block', width: '100%', background: 'none', border: 'none', borderRadius: 10, padding: '9px 12px', fontSize: 14, fontWeight: 600, color: 'var(--accent)', cursor: 'pointer', textAlign: 'left' }}
          >
            + New portfolio
          </button>
        </div>
      )}
    </div>
  );
}
