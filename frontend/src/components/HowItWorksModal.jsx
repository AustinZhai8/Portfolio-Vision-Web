import Modal from './Modal';

const STEPS = [
  ['Add your positions', 'Enter each ETF or stock you own, by dollar amount or share count, in USD or CAD.'],
  ['We decompose it', 'Every ETF is unpacked into its underlying holdings — including ETFs inside ETFs — weighted by what you actually own.'],
  ['See what you really hold', 'One combined view of every company, sector, and country across your whole portfolio.'],
];

const NOTES = [
  ['Weightings are estimates', 'Some weightings may be off by a percent or so due to database update timing and partial holdings data.'],
  ['Covered-call & leveraged ETFs excluded', 'These don’t reflect true ownership of the underlying stocks. For a leveraged ETF, enter the underlying ETF instead and mentally scale the exposure.'],
  ['Yellow ticker?', 'It just isn’t in our database yet — you can still enter and track it as-is.'],
  ['Commodities', 'Type the asset name directly: “Gold” instead of GLD, “Silver” instead of SLV, “Copper” instead of CPER.'],
  ['“Untracked”', 'The slice we can’t break down further — funds with too many positions to list, or only partial public data. Your total is still accurate.'],
];

export default function HowItWorksModal({ onClose }) {
  return (
    <Modal title="How does this work?" onClose={onClose} width={500}>
      <div style={{ maxHeight: '68vh', overflowY: 'auto', paddingRight: 6 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {STEPS.map(([t, d], i) => (
            <div key={i} style={{ display: 'flex', gap: 14 }}>
              <div style={{ width: 28, height: 28, borderRadius: 999, background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{t}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{d}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ height: 1, background: 'var(--border2)', margin: '20px 0 16px' }} />
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>Good to know</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {NOTES.map(([t, d], i) => (
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
