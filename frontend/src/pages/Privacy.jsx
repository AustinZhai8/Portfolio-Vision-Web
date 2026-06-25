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

export default function Privacy() {
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
          Privacy Policy
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

          <Section title="What this is">
            <p style={pStyle}>
              Portfolio Vision ("we", "the site") is a personal project built by Austin Zhai.
              This policy explains what data the site collects, why, and how you can control it.
              It is not a substitute for legal advice — if you have specific legal concerns, consult
              a professional.
            </p>
          </Section>

          <Section title="Data we collect">
            <p style={pStyle}>If you just use the decomposition tool without an account, we don't collect any personal data — your portfolio rows live only in your browser's memory and localStorage.</p>
            <p style={pStyle}>If you create an account, we (via Supabase) store:</p>
            <ul style={ulStyle}>
              <li>Your email address, and a hashed password if you sign up with email/password.</li>
              <li>If you sign in with Google, the basic profile info Google shares (email, name) to create your account.</li>
              <li>Any portfolios you choose to save: a name and the ticker/amount rows you entered.</li>
              <li>Your display currency preference (USD/CAD), stored on your account.</li>
            </ul>
            <p style={pStyle}>
              Your browser also stores a local price cache (<code>pv_price_cache</code>) in localStorage so
              repeated price lookups are faster. This stays on your device and is never sent to us.
            </p>
          </Section>

          <Section title="Third parties we use">
            <ul style={ulStyle}>
              <li><strong>Supabase</strong> — hosts authentication and the database (accounts, saved portfolios).</li>
              <li><strong>Google</strong> — if you choose "Continue with Google" for sign-in.</li>
              <li><strong>Yahoo Finance</strong> (via our own serverless proxy) — to look up live prices for the tickers you enter. We only send the ticker symbol, not any account information.</li>
              <li><strong>Frankfurter API</strong> — for the USD/CAD exchange rate, no API key or personal data involved.</li>
              <li><strong>Logo.dev</strong> — to display company logos next to holdings.</li>
              <li><strong>Vercel</strong> — hosts the site, and provides privacy-preserving analytics (page views, performance) that don't use tracking cookies.</li>
            </ul>
            <p style={pStyle}>
              None of these services receive your saved portfolio data — that only ever goes to Supabase.
            </p>
          </Section>

          <Section title="Your controls">
            <ul style={ulStyle}>
              <li>You can export your saved portfolios as JSON any time from Settings.</li>
              <li>You can permanently delete your account and all saved portfolios from Settings → Danger Zone. This is irreversible.</li>
              <li>You can email <span style={{ color: ACCENT }}>austinhzhai@gmail.com</span> with any privacy question or request, including data access or deletion requests.</li>
            </ul>
          </Section>

          <Section title="Other notes">
            <p style={pStyle}>
              Portfolio Vision is not directed at children, and we don't knowingly collect data from
              anyone under 13. This site is operated from Canada; if a future version of this policy
              changes meaningfully, we'll update the date above.
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
