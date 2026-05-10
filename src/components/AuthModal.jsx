import { useState } from 'react';
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

export default function AuthModal({ onClose }) {
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  function resetForm() {
    setEmail('');
    setPassword('');
    setError('');
    setSuccess('');
    setLoading(false);
  }

  function switchTab(t) {
    setTab(t);
    resetForm();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (tab === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        onClose();
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        setSuccess('Check your email to confirm your account.');
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

            {success && (
              <div
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 11,
                  color: '#22d3a0',
                  background: 'rgba(34,211,160,0.07)',
                  border: '1px solid rgba(34,211,160,0.2)',
                  borderRadius: 3,
                  padding: '7px 10px',
                }}
              >
                {success}
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
      </div>
    </div>
  );
}
