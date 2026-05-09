import { useMemo, useState } from 'react';
import {
  decompose,
  breakdownBySector,
  breakdownByCountry,
  convertAmount,
} from './utils/decompose';
import Header from './components/Header';
import PortfolioPanel from './components/PortfolioPanel';
import ResultsPanel from './components/ResultsPanel';

const TEST_ENTRIES = {
  VFV: { amount: 5000, currency: 'CAD' },
  QQQ: { amount: 3000, currency: 'USD' },
};

export default function App() {
  const [displayCurrency, setDisplayCurrency] = useState('USD');

  const { decomposed, sectors, countries, portfolioTotal } = useMemo(() => {
    const portfolio = {};
    for (const [ticker, { amount, currency }] of Object.entries(TEST_ENTRIES)) {
      portfolio[ticker] = convertAmount(amount, currency, displayCurrency);
    }
    const portfolioTotal = Object.values(portfolio).reduce((a, b) => a + b, 0);
    const { result } = decompose(portfolio);
    return {
      decomposed: result,
      sectors: breakdownBySector(result),
      countries: breakdownByCountry(result),
      portfolioTotal,
    };
  }, [displayCurrency]);

  return (
    <>
      <Header displayCurrency={displayCurrency} setDisplayCurrency={setDisplayCurrency} />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        <PortfolioPanel
          entries={TEST_ENTRIES}
          displayCurrency={displayCurrency}
          total={portfolioTotal}
        />
        <ResultsPanel
          decomposed={decomposed}
          sectors={sectors}
          countries={countries}
          portfolioTotal={portfolioTotal}
          animKey={displayCurrency}
        />
      </div>
    </>
  );
}
