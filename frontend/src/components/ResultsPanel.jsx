import HoldingRow from './HoldingRow';
import ChartSection from './ChartSection';
import { fmtMoney } from '../utils/format';
import { sectorColor, countryColor } from '../utils/colors';

const MIN_WEIGHT_PCT = 0.25;

export default function ResultsPanel({
  decomposed,
  sectors,
  countries,
  portfolioTotal,
  animKey,
  portfolio,
  displayCurrency,
  onBack,
  onShowLegal,
}) {
  const allSorted = Object.entries(decomposed).sort(([, a], [, b]) => b - a);
  const totalCount = allSorted.length;
  const shown = allSorted.filter(([, amount]) => (amount / portfolioTotal) * 100 >= MIN_WEIGHT_PCT);
  const topWeight = shown.length ? (shown[0][1] / portfolioTotal) * 100 : 1;

  const capturedTotal = Object.values(decomposed).reduce((a, b) => a + b, 0);
  const untrackedPct = portfolioTotal > 0 ? ((portfolioTotal - capturedTotal) / portfolioTotal) * 100 : 0;
  const UNTRACKED_ENTRY = { name: 'Untracked', w: untrackedPct, color: 'untracked' };

  const sectorData = Object.entries(sectors).map(([name, amount]) => ({
    name, w: (amount / portfolioTotal) * 100, color: sectorColor(name),
  }));
  if (untrackedPct > 0.05) sectorData.push(UNTRACKED_ENTRY);

  const countryData = Object.entries(countries).map(([name, amount]) => ({
    name, w: (amount / portfolioTotal) * 100, color: countryColor(name),
  }));
  if (untrackedPct > 0.05) countryData.push(UNTRACKED_ENTRY);

  return (
    <div className="pv-screen" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 24px 64px' }}>
      <div style={{ width: '100%', maxWidth: 880 }}>
        <div style={{ marginBottom: 24 }}>
          <button className="pv-btn-ghost" data-tour="back" onClick={onBack}>← Edit portfolio</button>
        </div>

        {/* Total */}
        <div data-tour="total" style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 14, color: 'var(--text2)', fontWeight: 600, marginBottom: 6 }}>Total portfolio (est.)</div>
          <div className="pv-total-num" style={{ fontSize: 46, fontWeight: 800, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
            {fmtMoney(portfolioTotal)} <span style={{ fontSize: 18, color: 'var(--text3)', fontWeight: 600 }}>{displayCurrency}</span>
          </div>
        </div>

        {/* Holdings */}
        <div data-tour="holdings" style={{ background: 'var(--card)', borderRadius: 20, border: '1px solid var(--border)', overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 12px', gap: 12 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Top holdings</h3>
            <span className="holdings-hint" style={{ fontSize: 12.5, color: 'var(--text3)' }}>Tap ⓘ to see which funds hold it</span>
          </div>
          <div>
            {shown.map(([ticker, amount]) => (
              <HoldingRow
                key={ticker}
                ticker={ticker}
                amount={amount}
                weight={(amount / portfolioTotal) * 100}
                maxWeight={topWeight}
                portfolio={portfolio}
              />
            ))}
          </div>
          <div style={{ padding: '12px 24px 16px', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: 12.5, color: 'var(--text3)' }}>
              Showing {shown.length} of {totalCount} holdings — positions below {MIN_WEIGHT_PCT}% of portfolio total hidden
            </span>
          </div>
        </div>

        {/* Breakdowns */}
        <div className="pv-breakdowns" data-tour="breakdowns" style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <ChartSection title="Sectors" data={sectorData} animKey={animKey} />
          <ChartSection title="Geography" data={countryData} animKey={animKey} />
        </div>

        <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 24, textAlign: 'center' }}>
          Data coverage: ETF holdings · May 2026 ·{' '}
          <a href="#" onClick={(e) => { e.preventDefault(); onShowLegal('privacy'); }}>Privacy</a> ·{' '}
          <a href="#" onClick={(e) => { e.preventDefault(); onShowLegal('terms'); }}>Terms</a>
        </p>
      </div>
    </div>
  );
}
