// `delete_user()` (the RPC called below) is defined in
// database/002_security_fixes.sql — run that file in the Supabase SQL
// editor before relying on this button.

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import { supabase } from '../lib/supabase';
import Seg from '../components/Seg';

const card = {
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 18,
  overflow: 'hidden',
  marginBottom: 18,
};

const cardHeader = {
  padding: '14px 22px',
  borderBottom: '1px solid var(--border)',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.06em',
  color: 'var(--text3)',
  textTransform: 'uppercase',
};

const cardBody = {
  padding: '20px 22px',
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
};

const label = {
  fontSize: 11,
  fontWeight: 700,
  color: 'var(--text3)',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  marginBottom: 6,
  display: 'block',
};

function Msg({ text, isError }) {
  if (!text) return null;
  return (
    <div style={{
      fontSize: 12.5,
      color: isError ? 'var(--red)' : 'var(--green)',
      background: isError ? 'rgba(240,90,126,0.08)' : 'rgba(47,208,140,0.08)',
      border: `1px solid ${isError ? 'rgba(240,90,126,0.25)' : 'rgba(47,208,140,0.25)'}`,
      borderRadius: 12,
      padding: '8px 12px',
    }}>
      {text}
    </div>
  );
}

export default function Settings({ user, displayCurrency, setDisplayCurrency }) {
  const navigate = useNavigate();
  const [localCurrency, setLocalCurrency] = useState(displayCurrency);
  const [portfolios, setPortfolios] = useState([]);
  const [pwMsg, setPwMsg] = useState('');
  const [pwErr, setPwErr] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [deleteInput, setDeleteInput] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', user.id)
      .then(({ data }) => setPortfolios(data || []));
  }, [user]);

  useEffect(() => { setLocalCurrency(displayCurrency); }, [displayCurrency]);

  if (!user) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
        <span style={{ fontSize: 14, color: 'var(--text3)' }}>You need to be signed in to view settings.</span>
        <button onClick={() => navigate('/')} className="pv-btn-primary" style={{ padding: '10px 22px', fontSize: 14 }}>Go back</button>
      </div>
    );
  }

  async function handleChangePassword() {
    setPwMsg('');
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: window.location.origin + '/settings',
    });
    if (error) { setPwMsg(error.message); setPwErr(true); }
    else { setPwMsg('Password reset email sent. Check your inbox.'); setPwErr(false); }
  }

  async function handleSaveCurrency() {
    const { error } = await supabase.auth.updateUser({ data: { defaultCurrency: localCurrency } });
    if (!error) {
      setDisplayCurrency(localCurrency);
      setSaveMsg('Saved.');
      setTimeout(() => setSaveMsg(''), 2500);
    }
  }

  async function handleDeleteAccount() {
    if (deleteInput !== 'DELETE') return;
    setDeleting(true);
    const { error } = await supabase.rpc('delete_user');
    if (error) { setDeleteError(error.message); setDeleting(false); }
    else { await supabase.auth.signOut(); navigate('/'); }
  }

  const portfolioJson = JSON.stringify(
    portfolios.map(({ name, holdings, created_at }) => ({ name, holdings, created_at })),
    null,
    2,
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <header className="app-header" style={{ height: 68, display: 'flex', alignItems: 'center', padding: '0 28px', gap: 14, flexShrink: 0 }}>
        <button type="button" onClick={() => navigate('/')} className="pv-btn-ghost" style={{ padding: '7px 16px' }}>← Back</button>
        <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>Portfolio Vision</span>
      </header>

      <div className="pv-screen" style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '20px 24px 64px' }}>
        <div style={{ width: '100%', maxWidth: 560 }}>
          <Breadcrumbs pathname="/settings" />
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text)', marginBottom: 18 }}>
            Settings
          </h1>

          {/* Account */}
          <div style={card}>
            <div style={cardHeader}>Account</div>
            <div style={cardBody}>
              <div>
                <span style={label}>Email</span>
                <input type="text" readOnly value={user.email} className="pv-input" style={{ color: 'var(--text2)', cursor: 'default' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <button type="button" onClick={handleChangePassword} className="pv-btn-ghost">Change password</button>
                {pwMsg && <Msg text={pwMsg} isError={pwErr} />}
              </div>
            </div>
          </div>

          {/* Display */}
          <div style={card}>
            <div style={cardHeader}>Display</div>
            <div style={cardBody}>
              <div>
                <span style={label}>Default currency</span>
                <Seg
                  value={localCurrency}
                  onChange={setLocalCurrency}
                  options={[{ value: 'USD', label: 'USD' }, { value: 'CAD', label: 'CAD' }]}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button type="button" onClick={handleSaveCurrency} className="pv-btn-primary" style={{ padding: '9px 22px', fontSize: 14 }}>Save</button>
                {saveMsg && <span style={{ fontSize: 12.5, color: 'var(--green)' }}>{saveMsg}</span>}
              </div>
            </div>
          </div>

          {/* Data */}
          <div style={card}>
            <div style={cardHeader}>Data</div>
            <div style={cardBody}>
              <span style={{ fontSize: 13, color: 'var(--text3)' }}>Your saved portfolios as raw JSON.</span>
              <textarea
                readOnly
                value={portfolioJson}
                rows={Math.min(portfolios.length * 6 + 4, 20)}
                className="pv-input"
                style={{ resize: 'vertical', fontSize: 12, lineHeight: 1.6, color: 'var(--text2)', cursor: 'text', minHeight: 80 }}
              />
            </div>
          </div>

          {/* Danger Zone */}
          <div style={{ ...card, border: '1px solid rgba(240,90,126,0.3)', marginBottom: 0 }}>
            <div style={{ ...cardHeader, color: 'var(--red)', borderBottom: '1px solid rgba(240,90,126,0.2)' }}>Danger Zone</div>
            <div style={cardBody}>
              {!deleteConfirm ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(true)}
                    style={{ background: 'rgba(240,90,126,0.1)', color: 'var(--red)', border: '1px solid rgba(240,90,126,0.3)', borderRadius: 999, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                  >
                    Delete account
                  </button>
                  <span style={{ fontSize: 12.5, color: 'var(--text3)' }}>Permanently deletes your account and all saved portfolios.</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <span style={{ fontSize: 13, color: 'var(--red)' }}>Type <strong>DELETE</strong> to confirm account deletion.</span>
                  <input type="text" value={deleteInput} onChange={(e) => setDeleteInput(e.target.value)} placeholder="DELETE" className="pv-input" style={{ maxWidth: 240 }} />
                  {deleteError && <Msg text={deleteError} isError />}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      disabled={deleteInput !== 'DELETE' || deleting}
                      style={{ background: deleteInput === 'DELETE' ? 'var(--red)' : 'rgba(240,90,126,0.15)', color: deleteInput === 'DELETE' ? '#fff' : 'rgba(240,90,126,0.5)', border: 'none', borderRadius: 999, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: deleteInput === 'DELETE' ? 'pointer' : 'not-allowed' }}
                    >
                      {deleting ? '…' : 'Confirm delete'}
                    </button>
                    <button type="button" onClick={() => { setDeleteConfirm(false); setDeleteInput(''); setDeleteError(''); }} className="pv-btn-ghost">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
