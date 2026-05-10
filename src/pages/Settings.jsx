/*
 * Run this in the Supabase SQL editor to enable account deletion:
 *
 * create or replace function delete_user()
 * returns void
 * language plpgsql
 * security definer
 * as $$
 * begin
 *   delete from auth.users where id = auth.uid();
 * end;
 * $$;
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const ACCENT = '#a78bfa';
const RED = '#f05a7e';

const sectionStyle = {
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 6,
  overflow: 'hidden',
  marginBottom: 16,
};

const sectionHeaderStyle = {
  padding: '12px 20px',
  borderBottom: '1px solid var(--border)',
  fontFamily: 'var(--mono)',
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '0.14em',
  color: 'var(--text3)',
  textTransform: 'uppercase',
};

const sectionBodyStyle = {
  padding: '18px 20px',
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
};

const labelStyle = {
  fontFamily: 'var(--mono)',
  fontSize: 9,
  color: 'var(--text3)',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  marginBottom: 5,
  display: 'block',
};

const inputStyle = {
  width: '100%',
  background: 'var(--input-bg)',
  border: '1px solid var(--border2)',
  borderRadius: 3,
  color: 'var(--text)',
  fontFamily: 'var(--mono)',
  fontSize: 12,
  padding: '9px 12px',
  outline: 'none',
  boxSizing: 'border-box',
};

const btnStyle = {
  padding: '8px 16px',
  borderRadius: 3,
  border: 'none',
  fontFamily: 'var(--mono)',
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '0.12em',
  cursor: 'pointer',
  transition: 'opacity 0.15s',
};

function Msg({ text, isError }) {
  if (!text) return null;
  return (
    <div style={{
      fontFamily: 'var(--mono)',
      fontSize: 11,
      color: isError ? RED : '#22d3a0',
      background: isError ? 'rgba(240,90,126,0.07)' : 'rgba(34,211,160,0.07)',
      border: `1px solid ${isError ? 'rgba(240,90,126,0.2)' : 'rgba(34,211,160,0.2)'}`,
      borderRadius: 3,
      padding: '7px 10px',
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

  // Sync local currency if prop changes (e.g. user logs in with metadata)
  useEffect(() => {
    setLocalCurrency(displayCurrency);
  }, [displayCurrency]);

  if (!user) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        background: 'var(--bg)',
      }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--text3)' }}>
          You need to be signed in to view settings.
        </span>
        <button
          onClick={() => navigate('/')}
          style={{ ...btnStyle, background: ACCENT, color: '#07090e' }}
        >
          GO BACK
        </button>
      </div>
    );
  }

  async function handleChangePassword() {
    setPwMsg('');
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: window.location.origin + '/settings',
    });
    if (error) {
      setPwMsg(error.message);
      setPwErr(true);
    } else {
      setPwMsg('Password reset email sent — check your inbox.');
      setPwErr(false);
    }
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
    if (error) {
      setDeleteError(error.message);
      setDeleting(false);
    } else {
      await supabase.auth.signOut();
      navigate('/');
    }
  }

  const portfolioJson = JSON.stringify(
    portfolios.map(({ name, holdings, created_at }) => ({ name, holdings, created_at })),
    null,
    2,
  );

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg)',
      overflow: 'hidden',
    }}>
      {/* Top bar */}
      <div style={{
        height: 56,
        minHeight: 56,
        background: 'var(--panel)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: 14,
        flexShrink: 0,
      }}>
        <button
          type="button"
          onClick={() => navigate('/')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text3)',
            cursor: 'pointer',
            fontFamily: 'var(--mono)',
            fontSize: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 6px',
            borderRadius: 3,
            transition: 'color 0.12s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text3)')}
        >
          ←
        </button>
        <span style={{
          fontFamily: 'var(--mono)',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.14em',
          color: 'var(--text2)',
          textTransform: 'uppercase',
        }}>
          Settings
        </span>
      </div>

      {/* Scrollable content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '28px 0',
        display: 'flex',
        justifyContent: 'center',
      }}>
        <div style={{ width: '100%', maxWidth: 560, padding: '0 24px' }}>

          {/* Account */}
          <div style={sectionStyle}>
            <div style={sectionHeaderStyle}>Account</div>
            <div style={sectionBodyStyle}>
              <div>
                <span style={labelStyle}>Email</span>
                <input
                  type="text"
                  readOnly
                  value={user.email}
                  style={{ ...inputStyle, color: 'var(--text2)', cursor: 'default' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleChangePassword}
                  style={{ ...btnStyle, background: 'var(--border2)', color: 'var(--text)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  CHANGE PASSWORD
                </button>
                {pwMsg && <Msg text={pwMsg} isError={pwErr} />}
              </div>
            </div>
          </div>

          {/* Display */}
          <div style={sectionStyle}>
            <div style={sectionHeaderStyle}>Display</div>
            <div style={sectionBodyStyle}>
              <div>
                <span style={labelStyle}>Default Currency</span>
                <div style={{
                  display: 'flex',
                  gap: 3,
                  background: 'var(--input-bg)',
                  borderRadius: 4,
                  padding: 3,
                  border: '1px solid var(--border2)',
                  width: 'fit-content',
                }}>
                  {['USD', 'CAD'].map((cur) => (
                    <button
                      key={cur}
                      onClick={() => setLocalCurrency(cur)}
                      style={{
                        padding: '5px 14px',
                        background: localCurrency === cur ? ACCENT : 'transparent',
                        border: 'none',
                        borderRadius: 2,
                        cursor: 'pointer',
                        fontFamily: 'var(--mono)',
                        fontWeight: 600,
                        color: localCurrency === cur ? '#07090e' : 'var(--text3)',
                        transition: 'all 0.15s',
                        letterSpacing: '0.08em',
                        fontSize: 11,
                      }}
                    >
                      {cur}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  type="button"
                  onClick={handleSaveCurrency}
                  style={{ ...btnStyle, background: ACCENT, color: '#07090e' }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  SAVE
                </button>
                {saveMsg && (
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#22d3a0' }}>
                    {saveMsg}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Data */}
          <div style={sectionStyle}>
            <div style={sectionHeaderStyle}>Data</div>
            <div style={sectionBodyStyle}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>
                Your saved portfolios as raw JSON.
              </span>
              <textarea
                readOnly
                value={portfolioJson}
                rows={Math.min(portfolios.length * 6 + 4, 20)}
                style={{
                  ...inputStyle,
                  resize: 'vertical',
                  fontFamily: 'var(--mono)',
                  fontSize: 11,
                  lineHeight: 1.6,
                  color: 'var(--text2)',
                  cursor: 'text',
                  minHeight: 80,
                }}
              />
            </div>
          </div>

          {/* Danger Zone */}
          <div style={{
            ...sectionStyle,
            border: '1px solid rgba(240,90,126,0.3)',
            marginBottom: 0,
          }}>
            <div style={{
              ...sectionHeaderStyle,
              color: RED,
              borderBottom: '1px solid rgba(240,90,126,0.2)',
            }}>
              Danger Zone
            </div>
            <div style={sectionBodyStyle}>
              {!deleteConfirm ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(true)}
                    style={{
                      ...btnStyle,
                      background: 'rgba(240,90,126,0.1)',
                      color: RED,
                      border: '1px solid rgba(240,90,126,0.3)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(240,90,126,0.18)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(240,90,126,0.1)')}
                  >
                    DELETE ACCOUNT
                  </button>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>
                    Permanently deletes your account and all saved portfolios.
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: RED }}>
                    Type <strong>DELETE</strong> to confirm account deletion.
                  </span>
                  <input
                    type="text"
                    value={deleteInput}
                    onChange={(e) => setDeleteInput(e.target.value)}
                    placeholder="DELETE"
                    style={{
                      ...inputStyle,
                      borderColor: 'rgba(240,90,126,0.4)',
                      maxWidth: 240,
                    }}
                  />
                  {deleteError && <Msg text={deleteError} isError />}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      disabled={deleteInput !== 'DELETE' || deleting}
                      style={{
                        ...btnStyle,
                        background: deleteInput === 'DELETE' ? RED : 'rgba(240,90,126,0.15)',
                        color: deleteInput === 'DELETE' ? '#fff' : 'rgba(240,90,126,0.4)',
                        cursor: deleteInput === 'DELETE' ? 'pointer' : 'not-allowed',
                      }}
                    >
                      {deleting ? '...' : 'CONFIRM DELETE'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setDeleteConfirm(false); setDeleteInput(''); setDeleteError(''); }}
                      style={{ ...btnStyle, background: 'var(--border2)', color: 'var(--text3)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text3)')}
                    >
                      CANCEL
                    </button>
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
