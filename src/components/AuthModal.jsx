import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';

const ACCENT = '#a78bfa';

const inputStyle = {
  width: '100%',
  background: 'var(--input-bg)',
  border: '1px solid var(--border2)',
  borderRadius: 3,
  color: 'var(--text)',
  fontFamily: 'var(--mono)',
  fontSize: 13,
  padding: '9px 12px',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.12s',
};

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
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!digits) return;
    const newCode = [...code];
    for (let i = 0; i < 6; i++) newCode[i] = digits[i] ?? '';
    setCode(newCode);
    const focusIdx = Math.min(digits.length, 5);
    inputRefs.current[focusIdx]?.focus();
  }

  async function handleVerify(e) {
    e.preventDefault();
    const token = code.join('');
    if (token.length !== 6) { setError('Enter all 6 digits.'); return; }
    setError('');
    setLoading(true);
    const { error: err } = await supabase.auth.verifyOtp({ email, token, type });
    if (err) {
      setError(err.message);
      setLoading(false);
    } else {
      onVerified();
    }
  }

  const codeString = code.join('');

  return (
    <div style={{ padding: '20px 20px 24px' }}>
      <button
        type="button"
        onClick={onBack}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text3)',
          fontFamily: 'var(--mono)',
          fontSize: 11,
          cursor: 'pointer',
          padding: '0 0 14px',
          letterSpacing: '0.06em',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
        }}
      >
        ← Back
      </button>
      <div
        style={{
          fontFamily: 'var(--mono)',
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--text2)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: 14,
        }}
      >
        {type === 'recovery' ? 'Reset Password' : 'Verify Email'}
      </div>
      <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label
            style={{
              display: 'block',
              fontFamily: 'var(--mono)',
              fontSize: 9,
              color: 'var(--text3)',
              letterSpacing: '0.1em',
              marginBottom: 10,
            }}
          >
            Enter the 6-digit code sent to<br />{email}
          </label>
          <div style={{ display: 'flex', gap: 6 }}>
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
                style={{
                  width: 40,
                  height: 40,
                  background: 'var(--input-bg)',
                  border: `1px solid ${error ? '#f05a7e' : 'var(--border2)'}`,
                  borderRadius: 3,
                  color: 'var(--text)',
                  fontFamily: 'var(--mono)',
                  fontSize: 18,
                  fontWeight: 600,
                  textAlign: 'center',
                  outline: 'none',
                  transition: 'border-color 0.12s',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = ACCENT)}
                onBlur={(e) => (e.currentTarget.style.borderColor = error ? '#f05a7e' : 'var(--border2)')}
              />
            ))}
          </div>
        </div>

        {error && (
          <div
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 11,
              color: '#f05a7e',
              background: 'rgba(240,90,126,0.07)',
              border: '1px solid rgba(240,90,126,0.2)',
              borderRadius: 3,
              padding: '7px 10px',
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || codeString.length !== 6}
          style={{
            marginTop: 4,
            width: '100%',
            padding: '11px 0',
            background: codeString.length === 6 && !loading ? ACCENT : '#3d2f6e',
            border: 'none',
            borderRadius: 3,
            color: codeString.length === 6 && !loading ? '#07090e' : '#9b8ec4',
            fontFamily: 'var(--mono)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.14em',
            cursor: codeString.length === 6 && !loading ? 'pointer' : 'not-allowed',
            transition: 'opacity 0.15s, background 0.15s',
          }}
        >
          {loading ? '...' : 'VERIFY'}
        </button>
      </form>
    </div>
  );
}

export default function AuthModal({ onClose }) {
  const [tab, setTab] = useState('login');
  const [view, setView] = useState('form'); // 'form' | 'forgot' | 'otp'
  const [otpType, setOtpType] = useState('signup'); // 'signup' | 'recovery'
  const [otpEmail, setOtpEmail] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  function resetForm() {
    setEmail('');
    setPassword('');
    setError('');
    setLoading(false);
  }

  function switchTab(t) {
    setTab(t);
    setView('form');
    resetForm();
  }

  function openForgot() {
    setView('forgot');
    setPassword('');
    setError('');
  }

  function backToLogin() {
    setView('form');
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (view === 'forgot') {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email);
      if (err) {
        setError(err.message);
        setLoading(false);
      } else {
        setOtpEmail(email);
        setOtpType('recovery');
        setView('otp');
        setLoading(false);
      }
      return;
    }

    if (tab === 'login') {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) {
        setError(err.message);
        setLoading(false);
      } else {
        onClose();
      }
    } else {
      const { error: err } = await supabase.auth.signUp({ email, password });
      if (err) {
        setError(err.message);
        setLoading(false);
      } else {
        setOtpEmail(email);
        setOtpType('signup');
        setView('otp');
        setLoading(false);
      }
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--modal-overlay)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 380,
          background: 'var(--panel)',
          border: '1px solid var(--border2)',
          borderRadius: 6,
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 20px 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--text2)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            PORTFOLIO<span style={{ color: ACCENT }}>VISION</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text3)',
              cursor: 'pointer',
              fontSize: 18,
              lineHeight: 1,
              padding: 2,
            }}
          >
            ×
          </button>
        </div>

        {view === 'otp' ? (
          <OtpInput
            email={otpEmail}
            type={otpType}
            onVerified={onClose}
            onBack={() => {
              setView(otpType === 'recovery' ? 'forgot' : 'form');
              setError('');
            }}
          />
        ) : view === 'forgot' ? (
          <div style={{ padding: '20px 20px 24px' }}>
            <button
              type="button"
              onClick={backToLogin}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text3)',
                fontFamily: 'var(--mono)',
                fontSize: 11,
                cursor: 'pointer',
                padding: '0 0 14px',
                letterSpacing: '0.06em',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              ← Back to log in
            </button>
            <div
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--text2)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 14,
              }}
            >
              Reset Password
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'var(--mono)',
                    fontSize: 9,
                    color: 'var(--text3)',
                    letterSpacing: '0.1em',
                    marginBottom: 5,
                  }}
                >
                  EMAIL
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  style={{
                    ...inputStyle,
                    borderColor: focusedField === 'email' ? ACCENT : 'var(--border2)',
                  }}
                />
              </div>

              {error && (
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#f05a7e', background: 'rgba(240,90,126,0.07)', border: '1px solid rgba(240,90,126,0.2)', borderRadius: 3, padding: '7px 10px' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: 4,
                  width: '100%',
                  padding: '11px 0',
                  background: loading ? '#3d2f6e' : ACCENT,
                  border: 'none',
                  borderRadius: 3,
                  color: loading ? '#9b8ec4' : '#07090e',
                  fontFamily: 'var(--mono)',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.14em',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'opacity 0.15s, background 0.15s',
                }}
              >
                {loading ? '...' : 'SEND RESET CODE'}
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div
              style={{
                display: 'flex',
                gap: 0,
                padding: '16px 20px 0',
                borderBottom: '1px solid var(--border)',
              }}
            >
              {[
                { key: 'login', label: 'Log In' },
                { key: 'signup', label: 'Sign Up' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => switchTab(key)}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: tab === key ? `2px solid ${ACCENT}` : '2px solid transparent',
                    color: tab === key ? 'var(--text)' : 'var(--text3)',
                    fontFamily: 'var(--mono)',
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    cursor: 'pointer',
                    padding: '0 4px 10px',
                    marginRight: 20,
                    transition: 'color 0.12s',
                  }}
                >
                  {label.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ padding: '20px 20px 24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'var(--mono)',
                      fontSize: 9,
                      color: 'var(--text3)',
                      letterSpacing: '0.1em',
                      marginBottom: 5,
                    }}
                  >
                    EMAIL
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    style={{
                      ...inputStyle,
                      borderColor: focusedField === 'email' ? ACCENT : 'var(--border2)',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'var(--mono)',
                      fontSize: 9,
                      color: 'var(--text3)',
                      letterSpacing: '0.1em',
                      marginBottom: 5,
                    }}
                  >
                    PASSWORD
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="••••••••"
                    required
                    autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                    style={{
                      ...inputStyle,
                      borderColor: focusedField === 'password' ? ACCENT : 'var(--border2)',
                    }}
                  />
                  {tab === 'login' && (
                    <button
                      type="button"
                      onClick={openForgot}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text3)',
                        fontFamily: 'var(--mono)',
                        fontSize: 10,
                        cursor: 'pointer',
                        padding: '5px 0 0',
                        letterSpacing: '0.05em',
                        transition: 'color 0.12s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = ACCENT)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text3)')}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>

                {error && (
                  <div
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 11,
                      color: '#f05a7e',
                      background: 'rgba(240,90,126,0.07)',
                      border: '1px solid rgba(240,90,126,0.2)',
                      borderRadius: 3,
                      padding: '7px 10px',
                    }}
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    marginTop: 4,
                    width: '100%',
                    padding: '11px 0',
                    background: loading ? '#3d2f6e' : ACCENT,
                    border: 'none',
                    borderRadius: 3,
                    color: loading ? '#9b8ec4' : '#07090e',
                    fontFamily: 'var(--mono)',
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.14em',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'opacity 0.15s, background 0.15s',
                  }}
                >
                  {loading ? '...' : tab === 'login' ? 'LOG IN' : 'CREATE ACCOUNT'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
