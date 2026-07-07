import { useNavigate } from 'react-router-dom';
import { TERMS_META, TERMS_SECTIONS, LegalSection } from '../legal/legalContent';

export default function Terms() {
  const navigate = useNavigate();
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <header style={{ height: 68, display: 'flex', alignItems: 'center', padding: '0 28px', gap: 14, flexShrink: 0 }}>
        <button type="button" onClick={() => navigate('/')} className="pv-btn-ghost" style={{ padding: '7px 16px' }}>← Back</button>
        <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>Terms of Service</span>
      </header>
      <div className="pv-screen" style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '20px 24px 64px' }}>
        <div style={{ width: '100%', maxWidth: 640 }}>
          <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 20 }}>{TERMS_META}</p>
          {TERMS_SECTIONS.map((s) => (
            <LegalSection key={s.title} title={s.title}>{s.body}</LegalSection>
          ))}
        </div>
      </div>
    </div>
  );
}
