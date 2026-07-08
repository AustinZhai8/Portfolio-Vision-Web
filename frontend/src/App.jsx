import { useMemo, useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  decompose,
  breakdownBySector,
  breakdownByCountry,
  convertAmount,
} from './utils/decompose';
import { supabase } from './lib/supabase';
import Header from './layout/Header';
import PortfolioPanel from './components/PortfolioPanel';
import ResultsPanel from './components/ResultsPanel';
import AuthModal from './components/AuthModal';
import Tour from './components/Tour';
import PrivacyModal from './components/PrivacyModal';
import TermsModal from './components/TermsModal';
import Settings from './pages/Settings';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

const INITIAL_ROWS = [
  { id: 1, ticker: 'VFV', inputType: 'amount', amount: '5000', currency: 'CAD', shares: '' },
  { id: 2, ticker: 'QQQ', inputType: 'shares', amount: '', currency: 'USD', shares: '5' },
];

let _uid = 3;
const nextId = () => _uid++;

const TOUR_STEPS = [
  { target: 'switcher', screen: 'build', title: 'Your portfolios', body: 'This shows which portfolio you’re editing. Sign in to switch between saved portfolios, save a copy, or start a new one. A purple dot marks unsaved changes.' },
  { target: 'rows', screen: 'build', title: 'Add what you own', body: 'One row per position: ticker plus how much you hold. Enter by dollar amount ($) or share count (#), in USD or CAD, per row. ETFs, stocks, and Canadian tickers all work.' },
  { target: 'toolbar', screen: 'build', title: 'Sort & import', body: 'Reorder rows, or skip typing entirely and import your Wealthsimple CSV in one click. The import dialog shows exactly where to download it.' },
  { target: 'display-currency', screen: 'build', title: 'Display currency', body: 'Flip the entire app between USD and CAD. Every value converts automatically.' },
  { target: 'decompose', screen: 'build', title: 'Decompose', body: 'The main event. We unpack every ETF into its underlying companies, including ETFs inside ETFs, and combine it all into one true picture.' },
  { target: 'holdings', screen: 'results', title: 'What you really own', body: 'Every company across all your funds, weighted by what you actually hold. Bars show relative position size, and the ⓘ on each row reveals exactly which funds the money comes from.' },
  { target: 'breakdowns', screen: 'results', title: 'Sectors & geography', body: 'Your real exposure by sector and country. “Untracked” marks the slice beyond our data coverage. Use “Edit portfolio” up top to tweak and re-run. That’s the whole flow.' },
];

export default function App() {
  const [displayCurrency, setDisplayCurrency] = useState('USD');
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [committedRows, setCommittedRows] = useState(INITIAL_ROWS);
  const [rowErrors, setRowErrors] = useState({});
  const [animVersion, setAnimVersion] = useState(0);
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [defaultInputType, setDefaultInputType] = useState('amount');
  const [screen, setScreen] = useState('build');
  const [tourIndex, setTourIndex] = useState(null);
  const [legal, setLegal] = useState(null);
  const [decomposeNotice, setDecomposeNotice] = useState('');

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

  // Keep the visible screen in sync with the current tour step
  useEffect(() => {
    if (tourIndex == null) return;
    const st = TOUR_STEPS[tourIndex];
    if (st && st.screen !== screen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setScreen(st.screen);
      window.scrollTo(0, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourIndex]);

  // Decomposition runs only on committedRows so editing doesn't thrash results
  const { decomposed, sectors, countries, portfolioTotal, portfolio } = useMemo(() => {
    const pf = {};
    for (const row of committedRows) {
      const ticker = row.ticker.trim().toUpperCase();
      const amount = parseFloat(row.amount);
      if (!ticker || !amount || amount <= 0) continue;
      pf[ticker] = (pf[ticker] || 0) + convertAmount(amount, row.currency, displayCurrency);
    }
    const total = Object.values(pf).reduce((a, b) => a + b, 0);
    const { result } = decompose(pf);
    return {
      decomposed: result,
      sectors: breakdownBySector(result),
      countries: breakdownByCountry(result),
      portfolioTotal: total,
      portfolio: pf,
    };
  }, [committedRows, displayCurrency]);

  // Called by PortfolioPanel after it has validated, fetched prices for # rows,
  // and converted everything to { id, ticker, amount, currency } format.
  // `notice` carries a one-line warning when a row got excluded (e.g. no live
  // price available) so the portfolio still decomposes instead of being blocked.
  function handleDecomposeComputed(mergedRows, notice = '') {
    setCommittedRows(mergedRows);
    setDecomposeNotice(notice);
    setAnimVersion((v) => v + 1);
    setScreen('results');
    window.scrollTo(0, 0);
  }

  const animKey = `${displayCurrency}-${animVersion}`;

  const startTour = () => { setScreen('build'); window.scrollTo(0, 0); setTourIndex(0); };
  const endTour = () => setTourIndex(null);
  const tourNext = () => {
    if (tourIndex >= TOUR_STEPS.length - 1) { setTourIndex(null); setScreen('build'); window.scrollTo(0, 0); }
    else setTourIndex((i) => i + 1);
  };
  const tourBack = () => { if (tourIndex > 0) setTourIndex((i) => i - 1); };

  const homeElement = (
    <>
      <Header
        displayCurrency={displayCurrency}
        setDisplayCurrency={setDisplayCurrency}
        user={user}
        onOpenAuth={() => setAuthOpen(true)}
      />
      {screen === 'build' ? (
        <PortfolioPanel
          rows={rows}
          setRows={setRows}
          rowErrors={rowErrors}
          setRowErrors={setRowErrors}
          onDecomposeComputed={handleDecomposeComputed}
          displayCurrency={displayCurrency}
          nextId={nextId}
          defaultInputType={defaultInputType}
          setDefaultInputType={setDefaultInputType}
          user={user}
          onOpenAuth={() => setAuthOpen(true)}
          onStartTour={startTour}
          onShowLegal={setLegal}
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
      ) : (
        <ResultsPanel
          decomposed={decomposed}
          sectors={sectors}
          countries={countries}
          portfolioTotal={portfolioTotal}
          animKey={animKey}
          portfolio={portfolio}
          displayCurrency={displayCurrency}
          notice={decomposeNotice}
          onBack={() => { setScreen('build'); window.scrollTo(0, 0); }}
          onShowLegal={setLegal}
        />
      )}

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      {tourIndex != null && (
        <Tour steps={TOUR_STEPS} index={tourIndex} onNext={tourNext} onBack={tourBack} onClose={endTour} />
      )}
      {legal === 'privacy' && <PrivacyModal onClose={() => setLegal(null)} />}
      {legal === 'terms' && <TermsModal onClose={() => setLegal(null)} />}
    </>
  );

  return (
    <Routes>
      <Route path="/" element={homeElement} />
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
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
    </Routes>
  );
}
