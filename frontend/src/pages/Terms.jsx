import { useNavigate } from 'react-router-dom';

const ACCENT = '#a78bfa';

const sectionStyle = {
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 6,
  overflow: 'hidden',
  marginBottom: 16,
};

const sectionHeaderStyle = {
  padding: '12px 20px',
  borderBottom: '1px solid var(--border)',
  fontFamily: 'var(--mono)',
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '0.14em',
  color: 'var(--text3)',
  textTransform: 'uppercase',
};

const sectionBodyStyle = {
  padding: '18px 20px',
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
};

const pStyle = {
  fontFamily: 'var(--sans, sans-serif)',
  fontSize: 12,
  color: 'var(--text2)',
  lineHeight: 1.6,
  margin: 0,
};

const ulStyle = {
  ...pStyle,
  paddingLeft: 18,
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
};

function Section({ title, children }) {
  return (
    <div style={sectionStyle}>
      <div style={sectionHeaderStyle}>{title}</div>
      <div style={sectionBodyStyle}>{children}</div>
    </div>
  );
}

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg)',
      overflow: 'hidden',
    }}>
      <div style={{
        height: 56,
        minHeight: 56,
        background: 'var(--panel)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: 14,
        flexShrink: 0,
      }}>
        <button
          type="button"
          onClick={() => navigate('/')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text3)',
            cursor: 'pointer',
            fontFamily: 'var(--mono)',
            fontSize: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 6px',
            borderRadius: 3,
            transition: 'color 0.12s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text3)')}
        >
          ←
        </button>
        <span style={{
          fontFamily: 'var(--mono)',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.14em',
          color: 'var(--text2)',
          textTransform: 'uppercase',
        }}>
          Terms of Service
        </span>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '28px 0',
        display: 'flex',
        justifyContent: 'center',
      }}>
        <div style={{ width: '100%', maxWidth: 640, padding: '0 24px' }}>
          <p style={{ ...pStyle, marginBottom: 16, color: 'var(--text3)', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.04em' }}>
            Last updated: June 2026
          </p>

          <Section title="Not financial advice">
            <p style={pStyle}>
              Portfolio Vision is an informational tool that decomposes ETFs into their underlying
              holdings so you can see what you actually own. It does not provide investment, financial,
              tax, or legal advice, and nothing on this site is a recommendation to buy, sell, or hold
              any security. Always do your own research or consult a licensed professional before
              making investment decisions.
            </p>
          </Section>

          <Section title="No warranty on data accuracy">
            <ul style={ulStyle}>
              <li>ETF holdings data is manually maintained and may be outdated, incomplete, or approximate — see the "How does this work?" panel for known exclusions (covered call and leveraged ETFs).</li>
              <li>Live prices are fetched from Yahoo Finance's unofficial, undocumented API via our own proxy. This is not a guaranteed data feed and may be delayed, incorrect, or unavailable without notice.</li>
              <li>Currency conversion uses a live USD/CAD rate with a hardcoded fallback if that lookup fails, so displayed totals are estimates, not exact.</li>
            </ul>
            <p style={pStyle}>
              The site is provided "as is" and "as available," without warranties of any kind, express
              or implied. We are not liable for any losses or decisions made based on information shown
              on this site.
            </p>
          </Section>

          <Section title="Accounts">
            <p style={pStyle}>
              You're responsible for keeping your account credentials secure. You can permanently delete
              your account and all saved portfolios at any time from Settings → Danger Zone — this action
              is irreversible. We reserve the right to suspend accounts that abuse the service (e.g.
              excessive automated requests that strain the underlying price/FX proxies).
            </p>
          </Section>

          <Section title="Acceptable use">
            <p style={pStyle}>
              Don't use this site to scrape, resell, or redistribute the ETF/stock reference data or
              price feeds at scale, and don't attempt to abuse, overload, or circumvent the rate limits
              of the underlying APIs (Yahoo Finance, Frankfurter, Logo.dev) through this site.
            </p>
          </Section>

          <Section title="Changes">
            <p style={pStyle}>
              This is a personal project and these terms may change as the site evolves. Continued use
              after a change means you accept the updated terms. Questions: email{' '}
              <span style={{ color: ACCENT }}>austinhzhai@gmail.com</span>.
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
