import HoldingRow from './HoldingRow';
import ChartSection from './ChartSection';
import { sectorColor, countryColor } from '../utils/colors';

const MIN_WEIGHT_PCT = 0.3;

export default function ResultsPanel({
  decomposed,
  sectors,
  countries,
  portfolioTotal,
  animKey,
}) {
  const allSorted = Object.entries(decomposed).sort(([, a], [, b]) => b - a);
  const totalCount = allSorted.length;
  const shown = allSorted.filter(
    ([, amount]) => (amount / portfolioTotal) * 100 >= MIN_WEIGHT_PCT,
  );
  const topWeight = shown.length ? (shown[0][1] / portfolioTotal) * 100 : 1;

  // Captured = sum of all decomposed holdings. Anything left over was below the
  // ETF data cutoff (e.g. VOO only tracks top 160 of ~518 holdings → ~18% untracked).
  const capturedTotal = Object.values(decomposed).reduce((a, b) => a + b, 0);
  const untrackedPct = ((portfolioTotal - capturedTotal) / portfolioTotal) * 100;
  const UNTRACKED_ENTRY = { name: 'Untracked', w: untrackedPct, color: 'untracked' };

  const sectorData = Object.entries(sectors).map(([name, amount]) => ({
    name,
    w: (amount / portfolioTotal) * 100,
    color: sectorColor(name),
  }));
  if (untrackedPct > 0.05) sectorData.push(UNTRACKED_ENTRY);

  const countryData = Object.entries(countries).map(([name, amount]) => ({
    name,
    w: (amount / portfolioTotal) * 100,
    color: countryColor(name),
  }));
  if (untrackedPct > 0.05) countryData.push(UNTRACKED_ENTRY);

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        padding: 14,
        gap: 11,
        minWidth: 0,
      }}
    >
      <div
        style={{
          background: '#0b1119',
          border: '1px solid #182335',
          borderRadius: 4,
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {/* Column headers */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '24px 30px 1fr 68px 1fr 100px 60px',
            gap: 0,
            padding: '8px 16px',
            borderBottom: '1px solid #182335',
            flexShrink: 0,
          }}
        >
          {[
            { label: '#', align: 'left', pl: 0 },
            { label: '', align: 'left', pl: 0 },
            { label: 'COMPANY', align: 'left', pl: 10 },
            { label: 'TICKER', align: 'left', pl: 0 },
            { label: 'WEIGHT', align: 'left', pl: 0 },
            { label: 'VALUE', align: 'right', pl: 0, pr: 12 },
            { label: 'TYPE', align: 'left', pl: 0 },
          ].map((col, i) => (
            <span
              key={i}
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 9,
                color: 'var(--text3)',
                letterSpacing: '0.08em',
                paddingLeft: col.pl || 0,
                paddingRight: col.pr || 0,
                textAlign: col.align,
              }}
            >
              {col.label}
            </span>
          ))}
        </div>

        {/* Scrollable rows */}
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          {shown.map(([ticker, amount], i) => {
            const weight = (amount / portfolioTotal) * 100;
            return (
              <HoldingRow
                key={ticker}
                rank={i + 1}
                ticker={ticker}
                amount={amount}
                weight={weight}
                maxWeight={topWeight}
                even={i % 2 === 0}
              />
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '6px 16px',
            borderTop: '1px solid #182335',
            flexShrink: 0,
            fontFamily: 'var(--mono)',
            fontSize: 10,
            color: 'var(--text3)',
            lineHeight: 1,
          }}
        >
          Showing {shown.length} of {totalCount} holdings — positions below {MIN_WEIGHT_PCT}% of portfolio total hidden
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexShrink: 0, height: 240 }}>
        <ChartSection title="SECTOR BREAKDOWN" data={sectorData} animKey={animKey} />
        <ChartSection title="GEOGRAPHIC EXPOSURE" data={countryData} animKey={animKey} />
      </div>
    </div>
  );
}
