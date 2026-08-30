import { Link } from 'react-router-dom';

// Served for unmatched paths. Two ways in:
//   - hard load of a bad URL   -> Vercel serves dist/404.html (real 404 status)
//   - client-side nav to a bad path -> the <Route path="*"> catch-all in App.jsx
// Previously the second case rendered a blank white page.
export default function NotFound() {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <header
        className="app-header"
        style={{
          height: 68, display: 'flex', alignItems: 'center',
          padding: '0 28px', gap: 14, flexShrink: 0,
        }}
      >
        <Link
          to="/"
          style={{ display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none', color: 'inherit' }}
        >
          <img src="/logo-96.png" alt="" width={52} height={52} style={{ objectFit: 'contain' }} className="header-logo" />
          <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>Portfolio Vision</span>
        </Link>
      </header>

      <div
        className="pv-screen"
        style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px 24px 64px', textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 460 }}>
          <div
            style={{
              fontSize: 13, fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 12,
            }}
          >
            404
          </div>

          <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: 12 }}>
            This page doesn&rsquo;t exist
          </h1>

          <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 28 }}>
            The link may be out of date, or the address might have a typo. Your saved
            portfolios are unaffected.
          </p>

          <Link to="/" className="pv-btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
            Back to your portfolio
          </Link>

          <p style={{ fontSize: 12.5, color: 'var(--text3)', marginTop: 28 }}>
            <Link to="/privacy" style={{ color: 'var(--text3)' }}>Privacy</Link>
            {' · '}
            <Link to="/terms" style={{ color: 'var(--text3)' }}>Terms</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
