import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const ACCENT = '#a78bfa';

function avatarInitials(user) {
  if (!user?.email) return 'AZ';
  return user.email.split('@')[0].slice(0, 2).toUpperCase();
}

function AvatarButton({ user, onOpenAuth }) {
  const [dropOpen, setDropOpen] = useState(false);
  const containerRef = useRef(null);

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
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: '#182335',
          border: '1px solid #253548',
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
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#253548')}
      >
        <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text2)' }}>
          AZ
        </span>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', zIndex: 100, flexShrink: 0 }}>
      <div
        onClick={() => setDropOpen((v) => !v)}
        title={user.email}
        style={{
          width: 32,
          height: 32,
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
            background: '#0f1825',
            border: '1px solid #253548',
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          }}
        >
          <div
            style={{
              padding: '10px 14px 8px',
              borderBottom: '1px solid #182335',
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
                color: '#c8ddf0',
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

export default function Header({ displayCurrency, setDisplayCurrency, user, onOpenAuth }) {
  return (
    <header
      style={{
        height: 80,
        minHeight: 80,
        background: '#0b1119',
        borderBottom: '1px solid #182335',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: 16,
        flexShrink: 0,
        zIndex: 20,
      }}
    >
      {/* Logo */}
      <img
        src="/PortfolioVision.png"
        alt="Portfolio Vision"
        style={{
          height: 78,
          width: 'auto',
          objectFit: 'contain',
          flexShrink: 0,
          marginLeft: 20,
        }}
      />

      <div style={{ flex: 1 }} />

      {/* Title — absolutely centered */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--sans)',
            color: '#e8f0fb',
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
      </div>

      {/* Right controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <span
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
            background: '#060c16',
            borderRadius: 4,
            padding: 3,
            border: '1px solid #253548',
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

      <AvatarButton user={user} onOpenAuth={onOpenAuth} />
    </header>
  );
}
