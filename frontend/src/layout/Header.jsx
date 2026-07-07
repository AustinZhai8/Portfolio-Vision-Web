import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Seg from '../components/Seg';

function avatarInitials(user) {
  if (!user?.email) return '';
  return user.email.split('@')[0].slice(0, 2).toUpperCase();
}

function AvatarButton({ user, onOpenAuth }) {
  const [dropOpen, setDropOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!dropOpen) return;
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setDropOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropOpen]);

  async function handleLogout() {
    setDropOpen(false);
    await supabase.auth.signOut();
  }

  if (!user) {
    return (
      <button
        type="button"
        onClick={onOpenAuth}
        title="Sign in"
        style={{
          width: 36, height: 36, borderRadius: 999,
          background: 'var(--accent-soft)', border: '1px solid var(--border2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, cursor: 'pointer', transition: 'border-color 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border2)')}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ color: 'var(--text3)' }}>
          <circle cx="12" cy="8" r="4" />
          <path d="M 12 14 C 8 14 5 16 5 19 L 5 22 L 19 22 L 19 19 C 19 16 16 14 12 14 Z" />
        </svg>
      </button>
    );
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', zIndex: 100, flexShrink: 0 }}>
      <button
        type="button"
        onClick={() => setDropOpen((v) => !v)}
        title={user.email}
        style={{
          width: 36, height: 36, borderRadius: 999,
          background: 'var(--accent-soft)', border: '1px solid var(--border2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: 12, fontWeight: 700, color: 'var(--accent)',
          letterSpacing: '0.02em', transition: 'border-color 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border2)')}
      >
        {avatarInitials(user)}
      </button>

      {dropOpen && (
        <div
          style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 230,
            background: 'var(--card2)', border: '1px solid var(--border2)',
            borderRadius: 16, padding: 6, overflow: 'hidden',
            boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
          }}
        >
          <div style={{ padding: '8px 12px 6px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 3 }}>
              Signed in as
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={user.email}>
              {user.email}
            </div>
          </div>
          <div style={{ height: 1, background: 'var(--border2)', margin: '6px' }} />
          <button
            type="button"
            className="pv-menu-item"
            onClick={() => { setDropOpen(false); navigate('/settings'); }}
            style={{ display: 'block', width: '100%', background: 'none', border: 'none', borderRadius: 10, padding: '9px 12px', fontSize: 14, fontWeight: 600, color: 'var(--text2)', cursor: 'pointer', textAlign: 'left' }}
          >
            Settings
          </button>
          <button
            type="button"
            className="pv-menu-item"
            onClick={handleLogout}
            style={{ display: 'block', width: '100%', background: 'none', border: 'none', borderRadius: 10, padding: '9px 12px', fontSize: 14, fontWeight: 600, color: 'var(--text2)', cursor: 'pointer', textAlign: 'left' }}
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Header({ displayCurrency, setDisplayCurrency, user, onOpenAuth }) {
  return (
    <header
      style={{
        height: 68, display: 'flex', alignItems: 'center',
        padding: '0 28px', gap: 14, flexShrink: 0,
      }}
    >
      <img
        src="/PortfolioVision.png"
        alt="Portfolio Vision"
        style={{ width: 52, height: 52, objectFit: 'contain' }}
      />
      <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>Portfolio Vision</span>
      <div style={{ flex: 1 }} />
      <div data-tour="display-currency">
        <Seg
          value={displayCurrency}
          onChange={setDisplayCurrency}
          options={[{ value: 'USD', label: 'USD' }, { value: 'CAD', label: 'CAD' }]}
        />
      </div>
      <AvatarButton user={user} onOpenAuth={onOpenAuth} />
    </header>
  );
}
