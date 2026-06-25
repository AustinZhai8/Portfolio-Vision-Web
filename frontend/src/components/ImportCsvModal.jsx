import { useState, useRef } from 'react';
import { parseHoldingsCsv } from '../utils/parseHoldingsCsv';

const ACCENT = '#a78bfa';
const RED = '#f05a7e';

const STEPS = [
  'Log in to your Wealthsimple profile on a desktop web browser.',
  'Select the Profile menu in the bottom-left corner.',
  'Choose Documents from the menu.',
  'Click the Custom download (or Request Documents) button in the top-right, then download your holdings report.',
];

export default function ImportCsvModal({ onClose, onImport }) {
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

  async function handleFile(file) {
    if (!file) return;
    if (!/\.csv$/i.test(file.name)) {
      setError('Please choose a .csv file.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const text = await file.text();
      const { holdings, summary, error: parseError } = parseHoldingsCsv(text);
      if (parseError) {
        setError(parseError);
        setBusy(false);
        return;
      }
      onImport(holdings, summary);
    } catch {
      setError('Could not read that file. Try downloading it again.');
      setBusy(false);
    }
  }

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'var(--modal-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: 'calc(100% - 40px)', maxWidth: 460, background: 'var(--panel)', border: '1px solid var(--border2)', borderRadius: 6, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}
      >
        {/* Header */}
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600, color: 'var(--text2)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Import Holdings from CSV
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: '2px 6px' }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Wealthsimple instructions */}
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
              Getting your CSV from Wealthsimple
            </div>
            <ol style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 5 }}>
              {STEPS.map((step, i) => (
                <li key={i} style={{ fontFamily: 'var(--sans, sans-serif)', fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>
                  {step}
                </li>
              ))}
            </ol>
            <p style={{ fontFamily: 'var(--sans, sans-serif)', fontSize: 11, color: 'var(--text3)', lineHeight: 1.5, margin: '8px 0 0' }}>
              Other brokers export different formats — if yours doesn't import cleanly, let me know at austinhzhai@gmail.com.
            </p>
          </div>

          {/* Drop zone */}
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFile(e.dataTransfer.files?.[0]);
            }}
            style={{
              border: `1px dashed ${dragOver ? ACCENT : 'var(--border2)'}`,
              background: dragOver ? 'rgba(167,139,250,0.06)' : 'var(--input-bg)',
              borderRadius: 4,
              padding: '26px 16px',
              textAlign: 'center',
              cursor: busy ? 'progress' : 'pointer',
              transition: 'border-color 0.15s, background 0.15s',
            }}
          >
            <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text2)', letterSpacing: '0.04em' }}>
              {busy ? 'Reading…' : 'Drop your CSV here, or click to choose a file'}
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)', marginTop: 6 }}>
              Imports as shares · CAD-hedged CDRs use their CAD value · options are skipped
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              style={{ display: 'none' }}
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>

          {error && (
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: RED, background: 'rgba(240,90,126,0.07)', border: '1px solid rgba(240,90,126,0.2)', borderRadius: 3, padding: '8px 10px', lineHeight: 1.5 }}>
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
