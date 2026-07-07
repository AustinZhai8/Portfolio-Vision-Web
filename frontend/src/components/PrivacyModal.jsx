import Modal from './Modal';
import { PRIVACY_META, PRIVACY_SECTIONS, LegalSection } from '../legal/legalContent';

export default function PrivacyModal({ onClose }) {
  return (
    <Modal title="Privacy Policy" onClose={onClose} width={540}>
      <div style={{ maxHeight: '68vh', overflowY: 'auto', paddingRight: 8 }}>
        <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16 }}>{PRIVACY_META}</p>
        {PRIVACY_SECTIONS.map((s) => (
          <LegalSection key={s.title} title={s.title}>{s.body}</LegalSection>
        ))}
      </div>
    </Modal>
  );
}
