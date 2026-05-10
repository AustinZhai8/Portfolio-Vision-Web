export const SECTOR_COLORS = {
  Technology: '#38bdf8',
  Healthcare: '#22d3a0',
  'Financial Services': '#a78bfa',
  'Consumer Cyclical': '#fbbf24',
  'Consumer Defensive': '#34d399',
  'Communication Services': '#fb7185',
  Industrials: '#60a5fa',
  Energy: '#f97316',
  Utilities: '#facc15',
  'Basic Materials': '#fb923c',
  'Real Estate': '#84cc16',
  Commodities: '#f59e0b',
  Crypto: '#8b5cf6',
  Unknown: '#64748b',
};

export const COUNTRY_COLORS = {
  'United States': '#38bdf8',
  Canada: '#fbbf24',
  'United Kingdom': '#a78bfa',
  Ireland: '#22d3a0',
  Switzerland: '#fb7185',
  Netherlands: '#f97316',
  Germany: '#60a5fa',
  Japan: '#34d399',
  China: '#facc15',
  Australia: '#fb923c',
  France: '#84cc16',
  Brazil: '#22d3a0',
  Spain: '#a78bfa',
  Mexico: '#fbbf24',
  India: '#fb7185',
  Bermuda: '#60a5fa',
  Global: '#94a3b8',
  Unknown: '#64748b',
};

const AVATAR_PALETTE = [
  '#1d4ed8', '#374151', '#15803d', '#b45309', '#1e40af',
  '#b91c1c', '#78350f', '#9f1239', '#6d28d9', '#0369a1',
  '#1e3a8a', '#991b1b', '#065f46',
];

export function letterAvatarColor(ticker) {
  let hash = 0;
  for (let i = 0; i < ticker.length; i++) {
    hash = (hash * 31 + ticker.charCodeAt(i)) >>> 0;
  }
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

export function sectorColor(name) {
  return SECTOR_COLORS[name] || SECTOR_COLORS.Unknown;
}

export function countryColor(name) {
  return COUNTRY_COLORS[name] || COUNTRY_COLORS.Unknown;
}
