import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const labelStyle = {
  display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text3)',
  letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6,
};

function Overlay({ onClose, children }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'var(--modal-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', padding: 24 }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ width: 400, maxWidth: '100%', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 24, overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ onClose }) {
  return (
    <div style={{ padding: '22px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>Portfolio Vision</span>
      <button type="button" onClick={onClose} aria-label="Close" style={{ background: 'var(--seg-bg)', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: 15, lineHeight: 1, width: 30, height: 30, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
    </div>
  );
}

function OtpInput({ email, type, onVerified, onBack }) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  function handleChange(index, value) {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  }

  function handleKeyDown(index, e) {
    if (e.key === 'Backspace' && !code[index] && index > 0) inputRefs.current[index - 1]?.focus();
  }

  function handlePaste(e) {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!digits) return;
    const newCode = [...code];
    for (let i = 0; i < 6; i++) newCode[i] = digits[i] ?? '';
    setCode(newCode);
    inputRefs.current[Math.min(digits.length, 5)]?.focus();
  }

  async function handleVerify(e) {
    e.preventDefault();
    const token = code.join('');
    if (token.length !== 6) { setError('Enter all 6 digits.'); return; }
    setError('');
    setLoading(true);
    const { error: err } = await supabase.auth.verifyOtp({ email, token, type });
    if (err) { setError(err.message); setLoading(false); }
    else onVerified();
  }

  const codeString = code.join('');

  return (
    <div style={{ padding: '20px 24px 26px' }}>
      <button type="button" onClick={onBack} className="pv-link-btn" style={{ padding: '0 0 14px' }}>← Back</button>
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{type === 'recovery' ? 'Reset password' : 'Verify email'}</div>
      <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>Enter the 6-digit code sent to<br />{email}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              className="pv-input"
              style={{ width: 46, height: 48, textAlign: 'center', fontSize: 18, fontWeight: 700, padding: 0, borderColor: error ? 'var(--red)' : 'transparent' }}
            />
          ))}
        </div>
        {error && <div style={{ fontSize: 12.5, color: 'var(--red)', background: 'rgba(240,90,126,0.08)', border: '1px solid rgba(240,90,126,0.25)', borderRadius: 12, padding: '8px 12px' }}>{error}</div>}
        <button type="submit" disabled={loading || codeString.length !== 6} className="pv-btn-primary" style={{ width: '100%', opacity: loading || codeString.length !== 6 ? 0.6 : 1 }}>
          {loading ? 'Verifying…' : 'Verify'}
        </button>
      </form>
    </div>
  );
}

export default function AuthModal({ onClose }) {
  const [tab, setTab] = useState('login');
  const [view, setView] = useState('form'); // 'form' | 'forgot' | 'otp'
  const [otpType, setOtpType] = useState('signup');
  const [otpEmail, setOtpEmail] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  function resetForm() { setEmail(''); setPassword(''); setError(''); setLoading(false); }
  function switchTab(t) { setTab(t); setView('form'); resetForm(); }

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: 'https://portfoliovision.online' } });
    setGoogleLoading(false);
  }

  function openForgot() { setView('forgot'); setPassword(''); setError(''); }
  function backToLogin() { setView('form'); setError(''); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (view === 'forgot') {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email);
      if (err) { setError(err.message); setLoading(false); }
      else { setOtpEmail(email); setOtpType('recovery'); setView('otp'); setLoading(false); }
      return;
    }

    if (tab === 'login') {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) { setError(err.message); setLoading(false); }
      else onClose();
    } else {
      const { error: err } = await supabase.auth.signUp({ email, password });
      if (err) { setError(err.message); setLoading(false); }
      else { setOtpEmail(email); setOtpType('signup'); setView('otp'); setLoading(false); }
    }
  }

  const errorBox = error && (
    <div style={{ fontSize: 12.5, color: 'var(--red)', background: 'rgba(240,90,126,0.08)', border: '1px solid rgba(240,90,126,0.25)', borderRadius: 12, padding: '8px 12px' }}>{error}</div>
  );

  return (
    <Overlay onClose={onClose}>
      <ModalHeader onClose={onClose} />

      {view === 'otp' ? (
        <OtpInput email={otpEmail} type={otpType} onVerified={onClose} onBack={() => { setView(otpType === 'recovery' ? 'forgot' : 'form'); setError(''); }} />
      ) : view === 'forgot' ? (
        <div style={{ padding: '18px 24px 26px' }}>
          <button type="button" onClick={backToLogin} className="pv-link-btn" style={{ padding: '0 0 14px' }}>← Back to log in</button>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Reset password</div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" className="pv-input" />
            </div>
            {errorBox}
            <button type="submit" disabled={loading} className="pv-btn-primary" style={{ width: '100%', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Sending…' : 'Send reset code'}
            </button>
          </form>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 24, padding: '16px 24px 0' }}>
            {[{ key: 'login', label: 'Log in' }, { key: 'signup', label: 'Sign up' }].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => switchTab(key)}
                style={{
                  background: 'none', border: 'none',
                  borderBottom: tab === key ? '2px solid var(--accent)' : '2px solid transparent',
                  color: tab === key ? 'var(--text)' : 'var(--text3)',
                  fontSize: 14, fontWeight: 700, cursor: 'pointer', padding: '0 2px 10px', transition: 'color 0.12s',
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <div style={{ height: 1, background: 'var(--border)' }} />

          <div style={{ padding: '18px 24px 24px' }}>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="pv-btn-ghost"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '11px 0', opacity: googleLoading ? 0.6 : 1 }}
            >
              <svg width="16" height="16" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.86l6.1-6.1C34.46 3.1 29.56 1 24 1 14.82 1 7.01 6.48 3.6 14.27l7.1 5.52C12.36 13.67 17.71 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.52 24.5c0-1.64-.15-3.22-.42-4.74H24v9h12.68c-.55 2.97-2.22 5.49-4.72 7.19l7.27 5.65C43.36 37.66 46.52 31.55 46.52 24.5z" />
                <path fill="#FBBC05" d="M10.7 28.21A14.57 14.57 0 0 1 9.5 24c0-1.46.25-2.87.7-4.21l-7.1-5.52A23.94 23.94 0 0 0 0 24c0 3.88.93 7.55 2.6 10.77l7.1-5.52-.01-.04z" />
                <path fill="#34A853" d="M24 47c5.56 0 10.22-1.84 13.63-4.99l-7.27-5.65c-1.84 1.24-4.19 1.96-6.36 1.96-6.29 0-11.64-4.17-13.3-9.79l-7.1 5.52C7.01 41.52 14.82 47 24 47z" />
              </svg>
              {googleLoading ? '…' : 'Continue with Google'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontSize: 12, color: 'var(--text3)' }}>or</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" className="pv-input" />
              </div>
              <div>
                <label style={labelStyle}>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required autoComplete={tab === 'login' ? 'current-password' : 'new-password'} className="pv-input" />
                {tab === 'login' && (
                  <button type="button" onClick={openForgot} className="pv-link-btn" style={{ padding: '8px 0 0', fontSize: 12.5 }}>Forgot password?</button>
                )}
              </div>
              {errorBox}
              <button type="submit" disabled={loading} className="pv-btn-primary" style={{ width: '100%', opacity: loading ? 0.7 : 1 }}>
                {loading ? '…' : tab === 'login' ? 'Log in' : 'Create account'}
              </button>
              <span style={{ fontSize: 11.5, color: 'var(--text3)', textAlign: 'center', lineHeight: 1.5 }}>
                By continuing you agree to our{' '}
                <Link to="/terms" onClick={onClose} style={{ color: 'var(--text2)', textDecoration: 'underline' }}>Terms</Link>{' '}
                and{' '}
                <Link to="/privacy" onClick={onClose} style={{ color: 'var(--text2)', textDecoration: 'underline' }}>Privacy Policy</Link>.
              </span>
            </form>
          </div>
        </>
      )}
    </Overlay>
  );
}
