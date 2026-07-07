/* eslint-disable react-refresh/only-export-components */
// Single source of truth for the Privacy / Terms copy, shared by the modals
// (Privacy/TermsModal) and the routed pages (pages/Privacy, pages/Terms).
// Data + a tiny shared LegalSection live together intentionally; fast-refresh
// isn't relevant for this static content module.

const mail = <a href="mailto:austinhzhai@gmail.com">austinhzhai@gmail.com</a>;

export const PRIVACY_META = 'Last updated: June 2026 · Portfolio Vision is a personal project built by Austin Zhai. This is not legal advice.';

export const PRIVACY_SECTIONS = [
  {
    title: 'No account? No data.',
    body: (
      <>If you just use the decomposition tool, we don't collect any personal data — your portfolio rows
      live only in your browser's memory and localStorage. A local price cache also stays on your device
      and is never sent to us.</>
    ),
  },
  {
    title: 'With an account',
    body: (
      <>We store (via Supabase): your email and a hashed password — or basic Google profile info if you
      sign in with Google — plus any portfolios you choose to save and your display currency preference.</>
    ),
  },
  {
    title: 'Third parties',
    body: (
      <>Supabase (auth &amp; database) · Google (optional sign-in) · Yahoo Finance via our own proxy
      (receives ticker symbols only) · Frankfurter API (FX rate, no personal data) · Logo.dev (company
      logos) · Vercel (hosting + cookieless analytics). None of these receive your saved portfolio data
      except Supabase.</>
    ),
  },
  {
    title: 'Your controls',
    body: (
      <>Export your saved portfolios as JSON any time from Settings. Permanently delete your account and
      all saved portfolios from Settings → Danger Zone (irreversible). For any privacy question or data
      request, email {mail}.</>
    ),
  },
  {
    title: 'Other notes',
    body: (
      <>Not directed at children; we don't knowingly collect data from anyone under 13. Operated from
      Canada. If this policy changes meaningfully, the date above will be updated.</>
    ),
  },
];

export const TERMS_META = 'Last updated: June 2026';

export const TERMS_SECTIONS = [
  {
    title: 'Not financial advice',
    body: (
      <>Portfolio Vision is an informational tool that decomposes ETFs so you can see what you actually
      own. Nothing on this site is investment, financial, tax, or legal advice, or a recommendation to
      buy, sell, or hold any security. Always do your own research or consult a licensed professional.</>
    ),
  },
  {
    title: 'No warranty on data accuracy',
    body: (
      <>ETF holdings data is manually maintained and may be outdated, incomplete, or approximate. Live
      prices come from Yahoo Finance's unofficial API and may be delayed, incorrect, or unavailable.
      Currency conversion uses a live USD/CAD rate with a fallback, so totals are estimates. The site is
      provided “as is” and “as available,” without warranties of any kind. We are not liable for losses or
      decisions based on information shown here.</>
    ),
  },
  {
    title: 'Accounts',
    body: (
      <>You're responsible for keeping your credentials secure. You can permanently delete your account
      and all saved portfolios from Settings → Danger Zone — irreversible. Accounts that abuse the service
      (e.g. excessive automated requests) may be suspended.</>
    ),
  },
  {
    title: 'Acceptable use',
    body: (
      <>Don't scrape, resell, or redistribute the reference data or price feeds at scale, and don't attempt
      to abuse or circumvent the rate limits of the underlying APIs through this site.</>
    ),
  },
  {
    title: 'Changes',
    body: (
      <>This is a personal project and these terms may change as the site evolves. Continued use after a
      change means you accept the updated terms. Questions: {mail}.</>
    ),
  },
];

export function LegalSection({ title, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.55 }}>{children}</div>
    </div>
  );
}
