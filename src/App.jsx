import { useMemo, useState, useEffect } from 'react';
import {
  decompose,
  breakdownBySector,
  breakdownByCountry,
  convertAmount,
  isKnownTicker,
  resolveTicker,
} from './utils/decompose';
import { supabase } from './lib/supabase';
import Header from './components/Header';
import PortfolioPanel from './components/PortfolioPanel';
import ResultsPanel from './components/ResultsPanel';
import AuthModal from './components/AuthModal';

const INITIAL_ROWS = [
  { id: 1, ticker: 'VFV', amount: '5000', currency: 'CAD' },
  { id: 2, ticker: 'QQQ', amount: '3000', currency: 'USD' },
];

let _uid = 3;
const nextId = () => _uid++;

export default function App() {
  const [displayCurrency, setDisplayCurrency] = useState('USD');
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [committedRows, setCommittedRows] = useState(INITIAL_ROWS);
  const [rowErrors, setRowErrors] = useState({});
  const [animVersion, setAnimVersion] = useState(0);
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Decomposition runs only on committedRows so editing doesn't thrash results
  const { decomposed, sectors, countries, portfolioTotal, decomposeUnknown } = useMemo(() => {
    const portfolio = {};
    for (const row of committedRows) {
      const ticker = row.ticker.trim().toUpperCase();
      const amount = parseFloat(row.amount);
      if (!ticker || !amount || amount <= 0) continue;
      portfolio[ticker] = (portfolio[ticker] || 0) + convertAmount(amount, row.currency, displayCurrency);
    }
    const portfolioTotal = Object.values(portfolio).reduce((a, b) => a + b, 0);
    const { result, unknown } = decompose(portfolio);
    return {
      decomposed: result,
      sectors: breakdownBySector(result),
      countries: breakdownByCountry(result),
      portfolioTotal,
      decomposeUnknown: unknown,
    };
  }, [committedRows, displayCurrency]);

  // Tickers the user entered that aren't in our database at all
  const unrecognizedInput = useMemo(() =>
    committedRows
      .map(r => r.ticker.trim().toUpperCase())
      .filter(t => t && !isKnownTicker(t))
      .map(t => resolveTicker(t)),
    [committedRows],
  );

  // Combined warning list: unrecognized input tickers + ETFs with no holdings data
  const warnings = useMemo(() => {
    const seen = new Set();
    return [...unrecognizedInput, ...decomposeUnknown].filter(t => {
      if (seen.has(t)) return false;
      seen.add(t);
      return true;
    });
  }, [unrecognizedInput, decomposeUnknown]);

  function handleDecompose() {
    const errors = {};
    for (const row of rows) {
      const ticker = row.ticker.trim();
      const amount = parseFloat(row.amount);
      if (!ticker) {
        errors[row.id] = 'Ticker required';
      } else if (!amount || amount <= 0) {
        errors[row.id] = 'Enter a positive amount';
      }
    }
    if (Object.keys(errors).length > 0) {
      setRowErrors(errors);
      return;
    }
    setRowErrors({});
    setCommittedRows(rows);
    setAnimVersion(v => v + 1);
  }

  const animKey = `${displayCurrency}-${animVersion}`;

  return (
    <>
      <Header
        displayCurrency={displayCurrency}
        setDisplayCurrency={setDisplayCurrency}
        user={user}
        onOpenAuth={() => setAuthOpen(true)}
      />
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        <PortfolioPanel
          rows={rows}
          setRows={setRows}
          rowErrors={rowErrors}
          setRowErrors={setRowErrors}
          onDecompose={handleDecompose}
          displayCurrency={displayCurrency}
          portfolioTotal={portfolioTotal}
          nextId={nextId}
        />
        <ResultsPanel
          decomposed={decomposed}
          sectors={sectors}
          countries={countries}
          portfolioTotal={portfolioTotal}
          animKey={animKey}
        />
      </div>
    </>
  );
}
