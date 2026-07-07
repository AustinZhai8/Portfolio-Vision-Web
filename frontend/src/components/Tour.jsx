import { useState, useEffect } from 'react';

// Guided spotlight tour. Measures the current step's [data-tour] target, glides a
// spotlight over it, and shows a step card. App owns the step index + screen sync.
export default function Tour({ steps, index, onNext, onBack, onClose }) {
  const step = steps[index];
  const total = steps.length;
  const [rect, setRect] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const find = () => document.querySelector(`[data-tour="${step.target}"]`);
    const measure = () => {
      if (cancelled) return;
      const el = find();
      if (!el) return;
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    measure();
    const initial = setTimeout(() => {
      const el = find();
      if (el) {
        const r = el.getBoundingClientRect();
        const overflowB = r.bottom - (window.innerHeight - 250);
        const overflowT = 90 - r.top;
        if (overflowB > 0) window.scrollBy({ top: overflowB, behavior: 'smooth' });
        else if (overflowT > 0) window.scrollBy({ top: -overflowT, behavior: 'smooth' });
      }
      measure();
    }, 420);
    const iv = setInterval(measure, 150);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      cancelled = true;
      clearTimeout(initial);
      clearInterval(iv);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [index, step.target]);

  useEffect(() => {
    const key = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' || e.key === 'Enter') onNext();
      if (e.key === 'ArrowLeft') onBack();
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [onNext, onBack, onClose]);

  const pad = 10;
  const ttW = 330;
  const isLast = index === total - 1;

  if (!rect) {
    return (
      <>
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(8,8,10,0.72)', zIndex: 899 }} />
        <div style={{ position: 'fixed', inset: 0, zIndex: 900 }} />
      </>
    );
  }

  const below = rect.top + rect.height + 240 < window.innerHeight;
  const left = Math.min(Math.max(rect.left + rect.width / 2 - ttW / 2, 16), window.innerWidth - ttW - 16);
  const ttStyle = below
    ? { left, top: rect.top + rect.height + pad + 16 }
    : { left, bottom: window.innerHeight - rect.top + pad + 16 };

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 900 }} />
      {/* spotlight */}
      <div
        style={{
          position: 'fixed', zIndex: 901, pointerEvents: 'none',
          top: rect.top - pad, left: rect.left - pad,
          width: rect.width + pad * 2, height: rect.height + pad * 2,
          borderRadius: 18, border: '1.5px solid var(--accent)',
          boxShadow: '0 0 0 9999px rgba(8,8,10,0.72), 0 0 24px rgba(167,139,250,0.25)',
          transition: 'top 0.35s cubic-bezier(0.16,1,0.3,1), left 0.35s cubic-bezier(0.16,1,0.3,1), width 0.35s cubic-bezier(0.16,1,0.3,1), height 0.35s cubic-bezier(0.16,1,0.3,1)',
        }}
      />
      {/* step card */}
      <div
        style={{
          position: 'fixed', zIndex: 902, width: ttW, ...ttStyle,
          background: 'var(--card2)', border: '1px solid var(--border2)',
          borderRadius: 20, padding: '20px 22px 18px', boxShadow: '0 24px 60px rgba(0,0,0,0.65)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.04em' }}>STEP {index + 1} OF {total}</span>
          <button onClick={onClose} className="pv-link-btn" style={{ padding: 0, fontSize: 12.5 }}>Skip tour</button>
        </div>
        <div style={{ height: 3, background: 'var(--track)', borderRadius: 999, marginBottom: 14, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${((index + 1) / total) * 100}%`, background: 'var(--accent)', borderRadius: 999, transition: 'width 0.3s' }} />
        </div>
        <h3 style={{ fontSize: 16.5, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>{step.title}</h3>
        <p style={{ fontSize: 13.5, color: 'var(--text2)', lineHeight: 1.55, marginBottom: 16 }}>{step.body}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          {index > 0 && <button onClick={onBack} className="pv-btn-ghost" style={{ padding: '7px 16px', fontSize: 13 }}>Back</button>}
          <button onClick={onNext} className="pv-btn-primary" style={{ padding: '7px 20px', fontSize: 13.5 }}>{isLast ? 'Finish' : 'Next'}</button>
        </div>
      </div>
    </>
  );
}
