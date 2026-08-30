import { useState, useEffect } from 'react';
import { displayTicker } from '../utils/decompose';
import { letterAvatarColor } from '../utils/colors';

const LOGO_DEV_KEY = import.meta.env.VITE_LOGO_DEV_KEY;

export default function CompanyLogo({ ticker, size = 34 }) {
  const dt = displayTicker(ticker);
  const [failed, setFailed] = useState(false);

  // Reset failed state when ticker changes
  useEffect(() => {
    setFailed(false);
  }, [dt]);

  if (failed || !LOGO_DEV_KEY) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 999,
          background: letterAvatarColor(dt),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: Math.round(size * 0.32),
          fontWeight: 700,
          color: 'rgba(255,255,255,0.92)',
          letterSpacing: '0.02em',
          flexShrink: 0,
        }}
      >
        {dt.replace('.', '').slice(0, 2)}
      </div>
    );
  }

  return (
    <img
      src={`https://img.logo.dev/ticker/${encodeURIComponent(dt)}?token=${LOGO_DEV_KEY}`}
      alt={`${dt} logo`}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        objectFit: 'cover',
        flexShrink: 0,
        background: 'var(--card2)',
      }}
    />
  );
}
