import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import InfoModal from './InfoModal';

const ACCENT = '#a78bfa';

function avatarInitials(user) {
  if (!user?.email) return '';
  return user.email.split('@')[0].slice(0, 2).toUpperCase();
}

function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        width: 32,
        height: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'none',
        border: '1px solid var(--border2)',
        borderRadius: 6,
        cursor: 'pointer',
        color: 'var(--text3)',
        flexShrink: 0,
        transition: 'border-color 0.15s, color 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = ACCENT;
        e.currentTarget.style.color = ACCENT;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border2)';
        e.currentTarget.style.color = 'var(--text3)';
      }}
    >
      {theme === 'dark' ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
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
      <div
        onClick={onOpenAuth}
        title="Sign in"
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'var(--avatar-bg)',
          border: '1px solid var(--border2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1,
          flexShrink: 0,
          cursor: 'pointer',
          transition: 'border-color 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = ACCENT)}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border2)')}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text3)', transform: 'translateY(-1px)' }}>
          <circle cx="12" cy="8" r="4" />
          <path d="M 12 14 C 8 14 5 16 5 19 L 5 22 L 19 22 L 19 19 C 19 16 16 14 12 14 Z" />
        </svg>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', zIndex: 100, flexShrink: 0 }}>
      <div
        onClick={() => setDropOpen((v) => !v)}
        title={user.email}
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: ACCENT,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          border: '1px solid transparent',
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
      >
        <span
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 12,
            fontWeight: 700,
            color: '#07090e',
            letterSpacing: '0.04em',
          }}
        >
          {avatarInitials(user)}
        </span>
      </div>

      {dropOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 220,
            background: 'var(--card)',
            border: '1px solid var(--border2)',
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          }}
        >
          <div
            style={{
              padding: '10px 14px 8px',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 9,
                color: 'var(--text3)',
                letterSpacing: '0.1em',
                marginBottom: 3,
              }}
            >
              SIGNED IN AS
            </div>
            <div
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 11,
                color: 'var(--text)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={user.email}
            >
              {user.email}
            </div>
          </div>
          <button
            type="button"
            onClick={() => { setDropOpen(false); navigate('/settings'); }}
            style={{
              width: '100%',
              padding: '9px 14px',
              background: 'none',
              border: 'none',
              borderBottom: '1px solid var(--border)',
              color: 'var(--text2)',
              fontFamily: 'var(--mono)',
              fontSize: 11,
              letterSpacing: '0.08em',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 0.12s, color 0.12s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--card-hover)';
              e.currentTarget.style.color = 'var(--text)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.color = 'var(--text2)';
            }}
          >
            Settings
          </button>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '9px 14px',
              background: 'none',
              border: 'none',
              color: 'var(--text2)',
              fontFamily: 'var(--mono)',
              fontSize: 11,
              letterSpacing: '0.08em',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 0.12s, color 0.12s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(240,90,126,0.08)';
              e.currentTarget.style.color = '#f05a7e';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.color = 'var(--text2)';
            }}
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Header({ displayCurrency, setDisplayCurrency, user, onOpenAuth, theme, onToggleTheme }) {
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <>
      <header
        className="app-header"
        style={{
          height: 80,
          minHeight: 80,
          background: 'var(--panel)',
          borderBottom: '1px solid var(--border)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: 12,
          flexShrink: 0,
          zIndex: 20,
        }}
      >
      <img
        src="/PortfolioVision.png"
        alt="Portfolio Vision"
        className="header-logo"
        style={{
          height: 78,
          width: 'auto',
          objectFit: 'contain',
          flexShrink: 0,
          marginLeft: 20,
        }}
      />

      <div className="header-spacer" style={{ flex: 1 }} />

      {/* Title — absolutely centered */}
      <div
        className="header-center"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '50%',
          transform: 'translateY(calc(-50% + 8px))',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          pointerEvents: 'none',
        }}
      >
        <span
          className="header-tagline"
          style={{
            fontFamily: 'var(--sans)',
            color: 'var(--text)',
            fontWeight: 500,
            letterSpacing: '0.04em',
            whiteSpace: 'nowrap',
            fontSize: 19,
            lineHeight: 1,
          }}
        >
          See everything. Invest better.
        </span>
        <span
          style={{
            fontFamily: 'var(--mono)',
            fontWeight: 600,
            letterSpacing: '0.12em',
            color: 'var(--text3)',
            textTransform: 'uppercase',
            fontSize: 12,
            lineHeight: 1,
          }}
        >
          PORTFOLIO<span style={{ color: ACCENT }}>VISION</span>
        </span>
        <button
          type="button"
          onClick={() => setInfoOpen(true)}
          style={{
            background: 'none',
            border: 'none',
            fontFamily: 'var(--mono)',
            fontSize: 9,
            color: 'var(--text3)',
            cursor: 'pointer',
            padding: '2px 0 0',
            marginTop: 0,
            letterSpacing: '0.04em',
            textDecoration: 'underline',
            textDecorationColor: 'var(--border2)',
            textUnderlineOffset: 2,
            transition: 'color 0.12s',
            pointerEvents: 'auto',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = ACCENT)}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text3)')}
        >
          How does this work?
        </button>
      </div>

      {/* Right controls */}
      <div
        className="header-controls"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <span
          className="header-display-label"
          style={{
            fontFamily: 'var(--mono)',
            color: 'var(--text3)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontSize: 12,
          }}
        >
          Display:
        </span>
        <div
          style={{
            display: 'flex',
            gap: 3,
            background: 'var(--input-bg)',
            borderRadius: 4,
            padding: 3,
            border: '1px solid var(--border2)',
          }}
        >
          {['USD', 'CAD'].map((cur) => (
            <button
              key={cur}
              onClick={() => setDisplayCurrency(cur)}
              style={{
                padding: '4px 10px',
                background: displayCurrency === cur ? ACCENT : 'transparent',
                border: 'none',
                borderRadius: 2,
                cursor: 'pointer',
                fontFamily: 'var(--mono)',
                fontWeight: 600,
                color: displayCurrency === cur ? '#07090e' : 'var(--text3)',
                transition: 'all 0.15s',
                letterSpacing: '0.08em',
                fontSize: 10,
              }}
            >
              {cur}
            </button>
          ))}
        </div>
      </div>

      <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      <AvatarButton user={user} onOpenAuth={onOpenAuth} />
      </header>
      <InfoModal open={infoOpen} onClose={() => setInfoOpen(false)} />
    </>
  );
}
