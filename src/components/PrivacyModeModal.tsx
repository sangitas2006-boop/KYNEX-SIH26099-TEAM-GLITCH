import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, ShieldCheck, Database, Key, X, CheckCircle2, ArrowRight } from 'lucide-react'

interface PrivacyModeModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PrivacyModeModal({ isOpen, onClose }: PrivacyModeModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="modal-backdrop" role="presentation" onClick={onClose}>
        <motion.div
          className="modal privacy-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="privacy-modal-title"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="modal-top">
            <div className="modal-top-title">
              <span className="modal-icon-badge olive"><Lock size={20} /></span>
              <div>
                <h2 id="privacy-modal-title">Privacy-Preserving Cross-CPSE Fingerprint Exchange</h2>
                <small className="modal-subtitle">Federated technical-attribute exchange</small>
              </div>
            </div>
            <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
              <X size={20} />
            </button>
          </div>

          <div className="modal-scroll-content">
            <div className="privacy-intro-card">
              <div className="privacy-intro-head">
                <div>
                  <span className="privacy-kicker">Data boundary / technical exchange</span>
                  <h3>Compare material identity without sharing commercial history.</h3>
                </div>
                <span className="privacy-mode-pill"><ShieldCheck size={13} /> Federated design</span>
              </div>
              <p className="privacy-intro-lede">KYNEX is designed to exchange the technical evidence needed for harmonization while keeping procurement-sensitive records inside each CPSE’s controlled environment.</p>
              <div className="privacy-boundary-summary">
                <div><small>STAYS LOCAL</small><strong>Commercial records</strong><span>Prices · suppliers · contracts</span></div>
                <div><small>EXCHANGED</small><strong>Technical fingerprint</strong><span>Type · grade · size · rating</span></div>
                <div><small>REQUIRES REVIEW</small><strong>Published identity</strong><span>Expert decision · audit trail</span></div>
              </div>
            </div>

            <section className="privacy-flow-section" aria-labelledby="privacy-flow-title">
              <div className="privacy-section-heading">
                <div><span className="privacy-kicker">01 / Exchange path</span><h3 id="privacy-flow-title">Three boundaries. One accountable decision.</h3></div>
                <p>Only the minimum technical evidence moves toward comparison. Publication remains governed.</p>
              </div>
              <div className="privacy-flow-rail">
                <article className="privacy-flow-node">
                  <span className="privacy-flow-icon"><Database size={18} /></span>
                  <small>01 / SOURCE SYSTEMS</small>
                  <h4>Native ERP vaults</h4>
                  <p>Each CPSE keeps its commercial and operational records in its own controlled environment.</p>
                  <span className="privacy-chip retained">Retained locally</span>
                </article>
                <div className="privacy-flow-connector"><ArrowRight size={18} /><span>technical attributes only</span></div>
                <article className="privacy-flow-node exchange">
                  <span className="privacy-flow-icon"><Key size={18} /></span>
                  <small>02 / MINIMUM PROOF</small>
                  <h4>Technical fingerprint</h4>
                  <p>Normalized fields support comparison without carrying purchase history or supplier strategy.</p>
                  <span className="privacy-chip exchanged">Comparable evidence</span>
                </article>
                <div className="privacy-flow-connector"><ArrowRight size={18} /><span>review before publish</span></div>
                <article className="privacy-flow-node governed">
                  <span className="privacy-flow-icon"><ShieldCheck size={18} /></span>
                  <small>03 / CONTROL PLANE</small>
                  <h4>Governed resolution</h4>
                  <p>Recommendations are reviewed by an authorized material officer and recorded with lineage.</p>
                  <span className="privacy-chip governed">Expert controlled</span>
                </article>
              </div>
            </section>

            <section aria-labelledby="privacy-controls-title">
              <div className="privacy-section-heading compact">
                <div><span className="privacy-kicker">02 / Control details</span><h3 id="privacy-controls-title">What the architecture protects</h3></div>
              </div>
              <div className="privacy-controls-grid">
                <article className="privacy-card">
                  <div className="privacy-card-top"><span className="p-icon"><Database size={18} /></span><small>CONTROL 01</small></div>
                  <h4>Native ERP isolation</h4>
                  <p>Procurement context stays behind the source-system boundary.</p>
                  <ul><li><CheckCircle2 size={14} /> Purchase-order pricing remains local</li><li><CheckCircle2 size={14} /> Supplier vendor codes remain local</li><li><CheckCircle2 size={14} /> Tender terms remain local</li></ul>
                </article>
                <article className="privacy-card accent">
                  <div className="privacy-card-top"><span className="p-icon"><Key size={18} /></span><small>CONTROL 02</small></div>
                  <h4>Fingerprint exchange</h4>
                  <p>Comparison is based on normalized physical attributes rather than commercial history.</p>
                  <code className="privacy-hash">SHA-256(Valve · SS316 · 50mm · PN16)</code>
                  <span className="privacy-card-note">Example technical fingerprint</span>
                </article>
                <article className="privacy-card">
                  <div className="privacy-card-top"><span className="p-icon"><ShieldCheck size={18} /></span><small>CONTROL 03</small></div>
                  <h4>Governed publication</h4>
                  <p>The system can propose a candidate, but it cannot silently publish or overwrite a source record.</p>
                  <ul><li><CheckCircle2 size={14} /> Expert approval required</li><li><CheckCircle2 size={14} /> Native aliases preserved</li><li><CheckCircle2 size={14} /> Decision recorded in audit trail</li></ul>
                </article>
              </div>
            </section>

            <div className="privacy-status-note">
              <CheckCircle2 size={16} />
              <span><strong>Boundary rule:</strong> AI recommends; authorized domain officers validate. Production deployment still requires CPSE security, access-control, and retention review.</span>
            </div>
          </div>

          <div className="modal-footer-bar">
            <span className="modal-footnote">
              <Lock size={12} /> <span><strong>Source-safe publication</strong><small>Non-destructive · auditable · human-validated</small></span>
            </span>
            <button className="button primary compact" onClick={onClose}>
              Done <ArrowRight size={15} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
