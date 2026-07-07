import { useState, useRef } from 'react';
import { parseHoldingsCsv } from '../utils/parseHoldingsCsv';
import Modal from './Modal';

const WS_STEPS = [
  'Log in to your Wealthsimple profile on a desktop web browser.',
  'Select the Profile menu in the bottom-left corner.',
  'Choose Documents from the menu.',
  'Click Custom download (or Request Documents) in the top-right, then download your holdings report.',
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
    <Modal title="Import from CSV" onClose={onClose} width={480}>
      <div style={{ maxHeight: '68vh', overflowY: 'auto', paddingRight: 6 }}>
        {/* Drop zone */}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); }}
          style={{
            border: `1.5px dashed ${dragOver ? 'var(--accent)' : 'var(--border2)'}`,
            borderRadius: 16, padding: '30px 20px', textAlign: 'center',
            transition: 'border-color 0.15s, background 0.15s',
            background: dragOver ? 'var(--accent-soft)' : 'transparent',
            cursor: busy ? 'progress' : 'pointer',
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
            {busy ? 'Reading…' : 'Drop your holdings file here'}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text3)' }}>
            or <span style={{ color: 'var(--accent)', fontWeight: 600 }}>browse files</span>
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
          <div style={{ marginTop: 14, fontSize: 12.5, color: 'var(--red)', background: 'rgba(240,90,126,0.08)', border: '1px solid rgba(240,90,126,0.25)', borderRadius: 12, padding: '9px 12px', lineHeight: 1.5 }}>
            {error}
          </div>
        )}

        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '18px 0 12px' }}>
          Getting your CSV from Wealthsimple
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {WS_STEPS.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 22, height: 22, borderRadius: 999, background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11.5, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
              <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5, paddingTop: 1 }}>{s}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 14, lineHeight: 1.5 }}>
          Positions import as shares; CAD-hedged CDRs come in at their CAD value. Options are skipped. Other
          brokers export different formats, so if yours doesn't import cleanly, email <a href="mailto:austinhzhai@gmail.com">austinhzhai@gmail.com</a>.
        </p>
      </div>
    </Modal>
  );
}
