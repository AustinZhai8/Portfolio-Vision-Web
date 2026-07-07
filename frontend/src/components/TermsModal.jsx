import Modal from './Modal';
import { TERMS_META, TERMS_SECTIONS, LegalSection } from '../legal/legalContent';

export default function TermsModal({ onClose }) {
  return (
    <Modal title="Terms of Service" onClose={onClose} width={540}>
      <div style={{ maxHeight: '68vh', overflowY: 'auto', paddingRight: 8 }}>
        <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16 }}>{TERMS_META}</p>
        {TERMS_SECTIONS.map((s) => (
          <LegalSection key={s.title} title={s.title}>{s.body}</LegalSection>
        ))}
      </div>
    </Modal>
  );
}
