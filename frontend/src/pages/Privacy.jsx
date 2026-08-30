import { useNavigate } from 'react-router-dom';
import { PRIVACY_META, PRIVACY_SECTIONS, LegalSection } from '../legal/legalContent';
import Breadcrumbs from '../components/Breadcrumbs';

export default function Privacy() {
  const navigate = useNavigate();
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <header className="app-header" style={{ height: 68, display: 'flex', alignItems: 'center', padding: '0 28px', gap: 14, flexShrink: 0 }}>
        <button type="button" onClick={() => navigate('/')} className="pv-btn-ghost" style={{ padding: '7px 16px' }}>← Back</button>
        <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>Portfolio Vision</span>
      </header>
      <div className="pv-screen" style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '20px 24px 64px' }}>
        <div style={{ width: '100%', maxWidth: 640 }}>
          <Breadcrumbs pathname="/privacy" />
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text)', marginBottom: 8 }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 20 }}>{PRIVACY_META}</p>
          {PRIVACY_SECTIONS.map((s) => (
            <LegalSection key={s.title} title={s.title}>{s.body}</LegalSection>
          ))}
        </div>
      </div>
    </div>
  );
}
