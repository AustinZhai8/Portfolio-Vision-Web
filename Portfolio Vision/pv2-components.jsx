const { useState, useEffect, useRef } = React;

// ── Segmented pill toggle ──────────────────────────────────────────────────────
function Seg({ options, value, onChange, small }) {
  return (
    <div style={{ display: 'inline-flex', gap: 2, background: 'var(--seg-bg)', borderRadius: 999, padding: 3 }}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button key={opt.value} onClick={() => onChange(opt.value)}
            style={{
              padding: small ? '3px 10px' : '6px 14px',
              background: active ? 'var(--seg-active)' : 'transparent',
              color: active ? 'var(--text)' : 'var(--text3)',
              border: 'none', borderRadius: 999, cursor: 'pointer',
              fontSize: small ? 12 : 13, fontWeight: 600, fontFamily: 'var(--sans)',
              transition: 'background 0.15s, color 0.15s', whiteSpace: 'nowrap',
            }}>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Modal shell ────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, width }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(8,8,10,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, backdropFilter: 'blur(4px)' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: width || 440, maxWidth: 'calc(100vw - 48px)', background: 'var(--card)', borderRadius: 24, padding: '28px 28px 24px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 19, fontWeight: 700, color: 'var(--text)' }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'var(--seg-bg)', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: 15, lineHeight: 1, width: 30, height: 30, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function HowItWorksModal({ onClose }) {
  const steps = [
    ['Add your positions', 'Enter each ETF or stock you own, by dollar amount or share count, in USD or CAD.'],
    ['We decompose it', 'Every ETF is unpacked into its underlying holdings — including ETFs inside ETFs — weighted by what you actually own.'],
    ['See what you really hold', 'One combined view of every company, sector, and country across your whole portfolio.'],
  ];
  const notes = [
    ['Weightings are estimates', 'Some weightings may be off by a percent or so due to database update timing and partial holdings data.'],
    ['Covered-call & leveraged ETFs excluded', 'These don\u2019t reflect true ownership of the underlying stocks. For a leveraged ETF, enter the underlying ETF instead and mentally scale the exposure.'],
    ['Yellow ticker?', 'It just isn\u2019t in our database yet — you can still enter and track it as-is.'],
    ['Commodities', 'Type the asset name directly: “Gold” instead of GLD, “Silver” instead of SLV, “Copper” instead of CPER.'],
    ['“Untracked”', 'The slice we can\u2019t break down further — funds with too many positions to list, or only partial public data. Your total is still accurate.'],
  ];
  return (
    <Modal title="How does this work?" onClose={onClose} width={500}>
      <div style={{ maxHeight: '68vh', overflowY: 'auto', paddingRight: 6 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {steps.map(([t, d], i) => (
            <div key={i} style={{ display: 'flex', gap: 14 }}>
              <div style={{ width: 28, height: 28, borderRadius: 999, background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{t}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{d}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ height: 1, background: 'var(--border2)', margin: '20px 0 16px' }}></div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>Good to know</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {notes.map(([t, d], i) => (
            <div key={i}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)', marginBottom: 1 }}>{t}</div>
              <div style={{ fontSize: 12.5, color: 'var(--text2)', lineHeight: 1.5 }}>{d}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--text3)', marginTop: 16, lineHeight: 1.5 }}>
          Missing ticker or feedback? Email <a href="mailto:austinhzhai@gmail.com">austinhzhai@gmail.com</a>
        </p>
      </div>
    </Modal>
  );
}

function ImportCsvModal({ onClose }) {
  const [drag, setDrag] = useState(false);
  const wsSteps = [
    'Log in to your Wealthsimple profile on a desktop web browser.',
    'Select the Profile menu in the bottom-left corner.',
    'Choose Documents from the menu.',
    'Click Custom download (or Request Documents) in the top-right, then download your holdings report.',
  ];
  return (
    <Modal title="Import from CSV" onClose={onClose} width={480}>
      <div style={{ maxHeight: '68vh', overflowY: 'auto', paddingRight: 6 }}>
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); }}
          style={{ border: `1.5px dashed ${drag ? 'var(--accent)' : 'var(--border2)'}`, borderRadius: 16, padding: '30px 20px', textAlign: 'center', transition: 'border-color 0.15s', background: drag ? 'var(--accent-soft)' : 'transparent' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Drop your holdings file here</div>
          <div style={{ fontSize: 12.5, color: 'var(--text3)' }}>or <span style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}>browse files</span></div>
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '18px 0 12px' }}>Getting your CSV from Wealthsimple</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {wsSteps.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 22, height: 22, borderRadius: 999, background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11.5, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
              <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5, paddingTop: 1 }}>{s}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 14, lineHeight: 1.5 }}>
          Positions import as shares; CAD-hedged CDRs come in at their CAD value. Options are skipped. Other brokers export different formats — if yours doesn't import cleanly, email <a href="mailto:austinhzhai@gmail.com">austinhzhai@gmail.com</a>.
        </p>
      </div>
    </Modal>
  );
}

// ── Position row (build screen) ────────────────────────────────────────────────
function PositionRow({ row, onChange, onRemove }) {
  const set = (field, val) => onChange(row.id, field, val);
  const isShares = row.inputType === 'shares';
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '108px 1fr auto auto 28px', gap: 8, alignItems: 'center', padding: '10px 0' }}>
      <input
        value={row.ticker} maxLength={8} placeholder="Ticker"
        onChange={(e) => set('ticker', e.target.value.toUpperCase())}
        className="pv-input"
        style={{ fontWeight: 700, letterSpacing: '0.03em' }}
      />
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 13.5, color: 'var(--text3)', fontWeight: 600, pointerEvents: 'none' }}>{isShares ? '#' : '$'}</span>
        <input
          type="number" min="0"
          value={isShares ? row.shares : row.amount}
          placeholder={isShares ? 'Shares' : 'Amount'}
          onChange={(e) => set(isShares ? 'shares' : 'amount', e.target.value)}
          className="pv-input"
          style={{ width: '100%', paddingLeft: 28, fontVariantNumeric: 'tabular-nums' }}
        />
      </div>
      <Seg small value={row.inputType} onChange={(v) => set('inputType', v)}
        options={[{ value: 'amount', label: '$' }, { value: 'shares', label: '#' }]} />
      <Seg small value={row.currency} onChange={(v) => set('currency', v)}
        options={[{ value: 'USD', label: 'USD' }, { value: 'CAD', label: 'CAD' }]} />
      <button onClick={() => onRemove(row.id)} title="Remove"
        style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 16, lineHeight: 1, width: 28, height: 28, borderRadius: 999, transition: 'color 0.12s, background 0.12s' }}
        onMouseEnter={(e) => { e.target.style.color = 'var(--text)'; e.target.style.background = 'var(--seg-bg)'; }}
        onMouseLeave={(e) => { e.target.style.color = 'var(--text3)'; e.target.style.background = 'none'; }}
      >✕</button>
    </div>
  );
}

// ── Company logo tile ──────────────────────────────────────────────────────────
function LogoTile({ ticker, color }) {
  return (
    <div style={{ width: 34, height: 34, borderRadius: 999, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.92)', flexShrink: 0, letterSpacing: '0.02em' }}>
      {ticker.replace('.', '').slice(0, 2)}
    </div>
  );
}

// ── Holding list item (results) ────────────────────────────────────────────────
function HoldingItem({ h, fmtValue, maxW, tour }) {
  const [hov, setHov] = useState(false);
  const [info, setInfo] = useState(false);
  const infoRef = useRef(null);

  useEffect(() => {
    if (!info) return;
    const close = (e) => { if (infoRef.current && !infoRef.current.contains(e.target)) setInfo(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [info]);

  const positionTotal = h.via.reduce((s, [, amt]) => s + amt, 0);

  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 20px', background: hov ? 'var(--card2)' : 'transparent', transition: 'background 0.12s', cursor: 'default', position: 'relative' }}>
      <LogoTile ticker={h.t} color={h.c} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.n}</div>
        <div style={{ fontSize: 12.5, color: 'var(--text3)', marginTop: 1 }}>{h.t} · {h.sec}</div>
      </div>

      {/* Position size bar */}
      <div style={{ width: 140, flexShrink: 0, display: 'flex', alignItems: 'center' }} className="holding-bar">
        <div style={{ flex: 1, height: 6, background: 'var(--track)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ width: `${(h.w / maxW) * 100}%`, height: '100%', background: 'var(--accent)', opacity: 0.85, borderRadius: 999 }} />
        </div>
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0, width: 90 }}>
        <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{fmtValue(h.v)}</div>
        <div style={{ fontSize: 12.5, color: 'var(--text3)', marginTop: 1, fontVariantNumeric: 'tabular-nums' }}>{h.w.toFixed(2)}%</div>
      </div>

      {/* Info button + popover */}
      <div ref={infoRef} data-tour={tour ? 'info' : undefined} style={{ position: 'relative', flexShrink: 0 }}>
        <button onClick={() => setInfo((v) => !v)} title="Where does this come from?"
          style={{
            width: 26, height: 26, borderRadius: 999, border: 'none', cursor: 'pointer',
            background: info ? 'var(--accent-soft)' : 'var(--seg-bg)',
            color: info ? 'var(--accent)' : 'var(--text3)',
            fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.12s, color 0.12s', fontStyle: 'italic', fontFamily: 'Georgia, serif',
          }}>i</button>

        {info && (
          <div style={{
            position: 'absolute', right: 0, top: 'calc(100% + 8px)', zIndex: 300,
            width: 250, background: 'var(--card2)', border: '1px solid var(--border2)',
            borderRadius: 16, padding: '14px 16px', boxShadow: '0 16px 40px rgba(0,0,0,0.55)',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>Where it comes from</div>
            {h.via.map(([fund, amt]) => (
              <div key={fund} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '5px 0' }}>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text)' }}>{fund}</span>
                <span style={{ fontSize: 13, color: 'var(--text2)', fontVariantNumeric: 'tabular-nums' }}>
                  {fmtValue(amt)} <span style={{ color: 'var(--text3)', fontSize: 12 }}>({((amt / positionTotal) * 100).toFixed(0)}%)</span>
                </span>
              </div>
            ))}
            <div style={{ height: 1, background: 'var(--border2)', margin: '8px 0' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text3)' }}>Total position</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{fmtValue(h.v)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Breakdown bar ──────────────────────────────────────────────────────────────
function BreakdownBar({ label, pct, max, untracked, animKey }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    setW(0);
    const t = setTimeout(() => setW((pct / max) * 100), 100);
    return () => clearTimeout(t);
  }, [animKey, pct, max]);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '7px 0' }}>
      <span style={{ width: 150, fontSize: 13, color: untracked ? 'var(--text3)' : 'var(--text2)', textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontStyle: untracked ? 'italic' : 'normal', flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 8, background: 'var(--track)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{
          width: `${w}%`, height: '100%', borderRadius: 999,
          background: untracked ? 'var(--text3)' : 'var(--accent)',
          opacity: untracked ? 0.4 : 0.9,
          transition: 'width 0.9s cubic-bezier(0.16,1,0.3,1)',
        }} />
      </div>
      <span style={{ width: 52, fontSize: 13, fontWeight: 600, color: untracked ? 'var(--text3)' : 'var(--text)', textAlign: 'right', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{pct.toFixed(2)}%</span>
    </div>
  );
}

function BreakdownCard({ title, data, animKey }) {
  const max = Math.max(...data.map((d) => d.w));
  return (
    <div style={{ flex: 1, minWidth: 300, background: 'var(--card)', borderRadius: 20, padding: '22px 24px', border: '1px solid var(--border)' }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>{title}</h3>
      {data.map((d) => (
        <BreakdownBar key={d.name} label={d.name} pct={d.w} max={max} untracked={d.untracked} animKey={animKey} />
      ))}
    </div>
  );
}

// ── Portfolio switcher (dropdown + save actions) ───────────────────────────────
function PortfolioSwitcher({ portfolios, active, onSelect, dirty, onSave, onSaveAsNew, onNew }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
      <button onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--seg-bg)', border: '1.5px solid ' + (open ? 'var(--accent)' : 'transparent'),
          borderRadius: 999, padding: '7px 14px 7px 16px', cursor: 'pointer',
          fontSize: 15, fontWeight: 700, color: 'var(--text)', transition: 'border-color 0.15s',
        }}>
        {active}
        {dirty && <span title="Unsaved changes" style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--accent)', flexShrink: 0 }} />}
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
        </svg>
      </button>

      {dirty && (
        <button onClick={onSave}
          style={{ background: 'var(--accent-soft)', color: 'var(--accent)', border: 'none', borderRadius: 999, padding: '7px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          Save
        </button>
      )}

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 200,
          minWidth: 230, background: 'var(--card2)', border: '1px solid var(--border2)',
          borderRadius: 16, padding: 6, boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '8px 12px 6px' }}>My portfolios</div>
          {portfolios.map((p) => (
            <button key={p} onClick={() => { onSelect(p); setOpen(false); }}
              className="pv-menu-item"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
                background: 'none', border: 'none', borderRadius: 10, padding: '9px 12px',
                fontSize: 14, fontWeight: 600, color: p === active ? 'var(--text)' : 'var(--text2)',
                cursor: 'pointer', textAlign: 'left',
              }}>
              {p}
              {p === active && (
                <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
                  <path d="M1 5.5L5 9.5L13 1.5" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          ))}
          <div style={{ height: 1, background: 'var(--border2)', margin: '6px 6px' }}></div>
          <button onClick={() => { onSaveAsNew(); setOpen(false); }} className="pv-menu-item"
            style={{ display: 'block', width: '100%', background: 'none', border: 'none', borderRadius: 10, padding: '9px 12px', fontSize: 14, fontWeight: 600, color: 'var(--text2)', cursor: 'pointer', textAlign: 'left' }}>
            Save as new portfolio…
          </button>
          <button onClick={() => { onNew(); setOpen(false); }} className="pv-menu-item"
            style={{ display: 'block', width: '100%', background: 'none', border: 'none', borderRadius: 10, padding: '9px 12px', fontSize: 14, fontWeight: 600, color: 'var(--accent)', cursor: 'pointer', textAlign: 'left' }}>
            + New portfolio
          </button>
        </div>
      )}
    </div>
  );
}

// ── Guided tour (spotlight walkthrough) ────────────────────────────────────────
function Tour({ steps, index, onNext, onBack, onClose }) {
  const step = steps[index];
  const total = steps.length;
  const [rect, setRect] = useState(null);

  useEffect(() => {
    let cancelled = false;
    // NOTE: rect is intentionally NOT reset here — the spotlight glides from the
    // previous target to the new one instead of flashing a centered card.
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
      cancelled = true; clearTimeout(initial); clearInterval(iv);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [index]);

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

  // Until the first target is measured, show only the dim overlay — no centered card flash
  if (!rect) {
    return (
      <React.Fragment>
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(8,8,10,0.72)', zIndex: 899 }} />
        <div style={{ position: 'fixed', inset: 0, zIndex: 900 }} />
      </React.Fragment>
    );
  }

  const below = rect.top + rect.height + 240 < window.innerHeight;
  const left = Math.min(Math.max(rect.left + rect.width / 2 - ttW / 2, 16), window.innerWidth - ttW - 16);
  const ttStyle = below
    ? { left, top: rect.top + rect.height + pad + 16 }
    : { left, bottom: window.innerHeight - rect.top + pad + 16 };

  return (
    <React.Fragment>
      {/* click blocker */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 900 }} />
      {/* spotlight */}
      <div style={{
        position: 'fixed', zIndex: 901, pointerEvents: 'none',
        top: rect.top - pad, left: rect.left - pad,
        width: rect.width + pad * 2, height: rect.height + pad * 2,
        borderRadius: 18, border: '1.5px solid var(--accent)',
        boxShadow: '0 0 0 9999px rgba(8,8,10,0.72), 0 0 24px rgba(167,139,250,0.25)',
        transition: 'top 0.35s cubic-bezier(0.16,1,0.3,1), left 0.35s cubic-bezier(0.16,1,0.3,1), width 0.35s cubic-bezier(0.16,1,0.3,1), height 0.35s cubic-bezier(0.16,1,0.3,1)',
      }} />
      {/* step card */}
      <div style={{
        position: 'fixed', zIndex: 902, width: ttW, ...ttStyle,
        background: 'var(--card2)', border: '1px solid var(--border2)',
        borderRadius: 20, padding: '20px 22px 18px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.65)',
      }}>
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
          {index > 0 && (
            <button onClick={onBack} className="pv-btn-ghost" style={{ padding: '7px 16px', fontSize: 13 }}>Back</button>
          )}
          <button onClick={onNext} className="pv-btn-primary" style={{ padding: '7px 20px', fontSize: 13.5 }}>
            {isLast ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </React.Fragment>
  );
}

// ── Legal modals ────────────────────────────────────────────────────────────────
function LegalSection({ title, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.55 }}>{children}</div>
    </div>
  );
}

function PrivacyModal({ onClose }) {
  return (
    <Modal title="Privacy Policy" onClose={onClose} width={540}>
      <div style={{ maxHeight: '68vh', overflowY: 'auto', paddingRight: 8 }}>
        <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16 }}>Last updated: June 2026 · Portfolio Vision is a personal project built by Austin Zhai. This is not legal advice.</p>
        <LegalSection title="No account? No data.">
          If you just use the decomposition tool, we don't collect any personal data — your portfolio rows live only in your browser's memory and localStorage. A local price cache also stays on your device and is never sent to us.
        </LegalSection>
        <LegalSection title="With an account">
          We store (via Supabase): your email and a hashed password — or basic Google profile info if you sign in with Google — plus any portfolios you choose to save and your display currency preference.
        </LegalSection>
        <LegalSection title="Third parties">
          Supabase (auth &amp; database) · Google (optional sign-in) · Yahoo Finance via our own proxy (receives ticker symbols only) · Frankfurter API (FX rate, no personal data) · Logo.dev (company logos) · Vercel (hosting + cookieless analytics). None of these receive your saved portfolio data except Supabase.
        </LegalSection>
        <LegalSection title="Your controls">
          Export your saved portfolios as JSON any time from Settings. Permanently delete your account and all saved portfolios from Settings → Danger Zone (irreversible). For any privacy question or data request, email <a href="mailto:austinhzhai@gmail.com">austinhzhai@gmail.com</a>.
        </LegalSection>
        <LegalSection title="Other notes">
          Not directed at children; we don't knowingly collect data from anyone under 13. Operated from Canada. If this policy changes meaningfully, the date above will be updated.
        </LegalSection>
      </div>
    </Modal>
  );
}

function TermsModal({ onClose }) {
  return (
    <Modal title="Terms of Service" onClose={onClose} width={540}>
      <div style={{ maxHeight: '68vh', overflowY: 'auto', paddingRight: 8 }}>
        <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16 }}>Last updated: June 2026</p>
        <LegalSection title="Not financial advice">
          Portfolio Vision is an informational tool that decomposes ETFs so you can see what you actually own. Nothing on this site is investment, financial, tax, or legal advice, or a recommendation to buy, sell, or hold any security. Always do your own research or consult a licensed professional.
        </LegalSection>
        <LegalSection title="No warranty on data accuracy">
          ETF holdings data is manually maintained and may be outdated, incomplete, or approximate. Live prices come from Yahoo Finance's unofficial API and may be delayed, incorrect, or unavailable. Currency conversion uses a live USD/CAD rate with a fallback, so totals are estimates. The site is provided “as is” and “as available,” without warranties of any kind. We are not liable for losses or decisions based on information shown here.
        </LegalSection>
        <LegalSection title="Accounts">
          You're responsible for keeping your credentials secure. You can permanently delete your account and all saved portfolios from Settings → Danger Zone — irreversible. Accounts that abuse the service (e.g. excessive automated requests) may be suspended.
        </LegalSection>
        <LegalSection title="Acceptable use">
          Don't scrape, resell, or redistribute the reference data or price feeds at scale, and don't attempt to abuse or circumvent the rate limits of the underlying APIs through this site.
        </LegalSection>
        <LegalSection title="Changes">
          This is a personal project and these terms may change as the site evolves. Continued use after a change means you accept the updated terms. Questions: <a href="mailto:austinhzhai@gmail.com">austinhzhai@gmail.com</a>.
        </LegalSection>
      </div>
    </Modal>
  );
}

Object.assign(window, {
  Seg, Modal, HowItWorksModal, ImportCsvModal,
  PositionRow, LogoTile, HoldingItem, BreakdownBar, BreakdownCard,
  PortfolioSwitcher, Tour, PrivacyModal, TermsModal,
});
