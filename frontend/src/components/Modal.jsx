import { useEffect } from 'react';

// v2 modal shell — overlay + blur + rounded card + close button.
// Reused by HowItWorks / Import / Auth / Privacy / Terms.
export default function Modal({ title, onClose, children, width }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'var(--modal-overlay)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="pv-modal"
        style={{
          width: width || 440, maxWidth: '100%',
          background: 'var(--card)', borderRadius: 24, padding: '28px 28px 24px',
          border: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 19, fontWeight: 700, color: 'var(--text)' }}>{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'var(--seg-bg)', border: 'none', color: 'var(--text2)', cursor: 'pointer',
              fontSize: 15, lineHeight: 1, width: 30, height: 30, borderRadius: 999,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
