import { useMemo, useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
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
import Settings from './pages/Settings';

const INITIAL_ROWS = [
  { id: 1, ticker: 'VFV', inputType: 'amount', amount: '5000', currency: 'CAD', shares: '' },
  { id: 2, ticker: 'QQQ', inputType: 'amount', amount: '3000', currency: 'USD', shares: '' },
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
  const [defaultInputType, setDefaultInputType] = useState('amount');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Sync display currency from user metadata on login
  useEffect(() => {
    const saved = user?.user_metadata?.defaultCurrency;
    if (saved === 'USD' || saved === 'CAD') setDisplayCurrency(saved);
  }, [user]);

  // Decomposition runs only on committedRows so editing doesn't thrash results
  const { decomposed, sectors, countries, portfolioTotal, decomposeUnknown, portfolio } = useMemo(() => {
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
      portfolio,
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

  // Called by PortfolioPanel after it has already validated, fetched prices for # rows,
  // and converted everything to { id, ticker, amount, currency } format.
  function handleDecomposeComputed(mergedRows) {
    setCommittedRows(mergedRows);
    setRowErrors({});
    setAnimVersion(v => v + 1);
  }

  const animKey = `${displayCurrency}-${animVersion}`;

  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            <Header
              displayCurrency={displayCurrency}
              setDisplayCurrency={setDisplayCurrency}
              defaultInputType={defaultInputType}
              setDefaultInputType={setDefaultInputType}
              user={user}
              onOpenAuth={() => setAuthOpen(true)}
            />
            {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }} className="app-main">
              <PortfolioPanel
                rows={rows}
                setRows={setRows}
                rowErrors={rowErrors}
                setRowErrors={setRowErrors}
                onDecomposeComputed={handleDecomposeComputed}
                onAutoDecompose={(mergedRows) => {
                  setCommittedRows(mergedRows);
                  setAnimVersion((v) => v + 1);
                }}
                displayCurrency={displayCurrency}
                portfolioTotal={portfolioTotal}
                nextId={nextId}
                defaultInputType={defaultInputType}
                user={user}
                onOpenAuth={() => setAuthOpen(true)}
                onLoadPortfolio={(rowsData) => {
                  const newRows = rowsData.map((h) => ({
                    id: nextId(),
                    ticker: h.ticker ?? '',
                    inputType: h.inputType ?? 'amount',
                    amount: h.amount ?? '',
                    currency: h.currency ?? 'USD',
                    shares: h.shares ?? '',
                  }));
                  setRows(newRows);
                  setRowErrors({});
                }}
              />
              <ResultsPanel
                decomposed={decomposed}
                sectors={sectors}
                countries={countries}
                portfolioTotal={portfolioTotal}
                animKey={animKey}
                portfolio={portfolio}
              />
            </div>
          </>
        }
      />
      <Route
        path="/settings"
        element={
          <Settings
            user={user}
            displayCurrency={displayCurrency}
            setDisplayCurrency={setDisplayCurrency}
          />
        }
      />
    </Routes>
  );
}
