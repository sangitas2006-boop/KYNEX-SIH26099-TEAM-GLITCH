import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck, CheckCircle2, Download, Printer, QrCode,
  Lock, ArrowLeft, ExternalLink, Calendar, UserCheck, Layers, FileText, Check,
  Info, X, ShieldAlert, Key
} from 'lucide-react'
import type { MaterialCase } from '../data/materialCases'

interface MaterialPassportProps {
  materialCase: MaterialCase
  approvalStatus: 'approved' | 'pending' | 'rejected'
  onBackToStudio: () => void
}

export function MaterialPassport({
  materialCase,
  approvalStatus,
  onBackToStudio
}: MaterialPassportProps) {
  const [downloadToast, setDownloadToast] = useState(false)
  const [verificationModalOpen, setVerificationModalOpen] = useState(false)
  const { recommendedCode, fingerprint, governance, mappingVersion = 'v2.4-NMSB-2026' } = materialCase

  const passportUrl = `local://passport/${recommendedCode}`

  const isApproved = approvalStatus === 'approved'

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    setDownloadToast(true)
    setTimeout(() => {
      setDownloadToast(false)
    }, 4000)
  }

  return (
    <div className="material-passport-shell" id="passport-view">
      {/* Top action bar */}
      <div className="passport-action-bar no-print">
        <button className="button outline compact" onClick={onBackToStudio}>
          <ArrowLeft size={16} /> Back to Studio
        </button>

        <div className="passport-actions-right">
          <button className="button outline compact" onClick={handlePrint} title="Print official Material Passport">
            <Printer size={16} /> Print Passport
          </button>
          <button className="button primary compact" onClick={handleDownload}>
            <Download size={16} /> Download Passport PDF (workspace)
          </button>
        </div>
      </div>

      {/* Download feedback toast */}
      {downloadToast && (
        <motion.div
          className="passport-download-toast"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Check size={18} />
          <span><strong>Passport PDF Generated:</strong> <code>{recommendedCode}-Passport.pdf</code> ready for review in this operational workspace.</span>
        </motion.div>
      )}

      {/* Printable Certificate Card */}
      <div className="passport-certificate-card">
        {/* Visible Integrity Note */}
        <div className="cert-integrity-banner">
          <Info size={14} className="integrity-icon" />
          <span>controlled connected passport — export-only to a production CPSE registry.</span>
        </div>

        {/* Certificate Header Strip */}
        <div className="cert-header">
          <div className="cert-emblem-section">
            <img className="cert-brand-logo" src="/kynex-logo.png" alt="KYNEX" />
            <div className={`cert-emblem-badge ${isApproved ? 'approved' : 'draft'}`}>
              <ShieldCheck size={28} strokeWidth={2.4} />
            </div>
            <div>
              <span className="cert-gov-title">KYNEX · Material Identity Governance</span>
              <h2 className="cert-doc-title">
                {isApproved
                  ? 'Certified National Material Passport'
                  : 'Draft Material Passport — Awaiting Expert Approval'}
              </h2>
              <small className="cert-doc-sub">Federated Material Identity Registry</small>
            </div>
          </div>

          <div className="cert-status-block">
            <div className={`cert-status-badge ${isApproved ? 'approved' : 'pending'}`}>
              <CheckCircle2 size={16} />
              <span>{isApproved ? 'Expert Approved — Certified' : 'Draft — Awaiting Expert Approval'}</span>
            </div>
            <span className="cert-id-tag">DOC-ID: NMP-{recommendedCode.replace(/[^A-Z0-9]/g, '')}</span>
          </div>
        </div>

        {/* Primary Identity Hero Block (Optimized Compact Layout) */}
        <div className="cert-hero-identity compact">
          <div className="identity-code-wrap">
            <span className="identity-label">Common National Material Code (CNMC)</span>
            <h1 className="identity-code-text">{recommendedCode}</h1>
            <p className="identity-title-text">{materialCase.title}</p>

            {/* Compact Metadata Strip */}
            <div className="identity-metadata-compact">
              <div className="id-meta-item">
                <span className="id-meta-lbl">Mapping Version:</span>
                <code>{mappingVersion}</code>
              </div>
              <div className="id-meta-item">
                <span className="id-meta-lbl">Approval Timestamp:</span>
                <span>{isApproved ? `${new Date(governance.auditTimestamp).toUTCString()} (controlled)` : 'Pending Sign-off'}</span>
              </div>
              <div className="id-meta-item full">
                <span className="id-meta-lbl">Source Aliases Retained:</span>
                <div className="aliases-retained-pills">
                  {governance.retainedAliases.map(alias => (
                    <span
                      key={alias.code}
                      className={`alias-code-pill ${alias.status === 'Conflict Quarantined' ? 'quarantine' : ''}`}
                    >
                      <b>{alias.org}:</b> {alias.code}
                      {alias.status === 'Conflict Quarantined' && <small> [Quarantined]</small>}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Clickable Dynamic SVG QR Matrix */}
          <div
            className="passport-qr-stage clickable"
            onClick={() => setVerificationModalOpen(true)}
            role="button"
            tabIndex={0}
            aria-label="Scan or verify passport QR code"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setVerificationModalOpen(true)
              }
            }}
          >
            <div className="passport-qr-box">
              <svg className="passport-qr-svg" viewBox="0 0 140 140" width="120" height="120">
                <rect width="140" height="140" fill="#ffffff" />
                {/* 3 Corner squares */}
                <rect x="8" y="8" width="36" height="36" fill="#153b3a" rx="3" />
                <rect x="15" y="15" width="22" height="22" fill="#ffffff" />
                <rect x="21" y="21" width="10" height="10" fill="#153b3a" />

                <rect x="96" y="8" width="36" height="36" fill="#153b3a" rx="3" />
                <rect x="103" y="15" width="22" height="22" fill="#ffffff" />
                <rect x="109" y="21" width="10" height="10" fill="#153b3a" />

                <rect x="8" y="96" width="36" height="36" fill="#153b3a" rx="3" />
                <rect x="15" y="103" width="22" height="22" fill="#ffffff" />
                <rect x="21" y="109" width="10" height="10" fill="#153b3a" />

                {/* Data dots */}
                <rect x="52" y="12" width="7" height="7" fill="#153b3a" />
                <rect x="64" y="12" width="7" height="7" fill="#b75e3e" />
                <rect x="76" y="12" width="14" height="7" fill="#153b3a" />
                <rect x="52" y="26" width="14" height="7" fill="#153b3a" />
                <rect x="76" y="26" width="7" height="7" fill="#c69b4a" />
                <rect x="52" y="40" width="7" height="14" fill="#153b3a" />
                <rect x="68" y="40" width="20" height="7" fill="#153b3a" />

                <rect x="12" y="52" width="7" height="14" fill="#153b3a" />
                <rect x="26" y="52" width="14" height="7" fill="#153b3a" />
                <rect x="48" y="52" width="44" height="7" fill="#5e7352" />
                <rect x="100" y="52" width="14" height="7" fill="#153b3a" />
                <rect x="121" y="52" width="7" height="14" fill="#153b3a" />

                <rect x="12" y="74" width="14" height="7" fill="#153b3a" />
                <rect x="34" y="74" width="7" height="14" fill="#153b3a" />
                <rect x="48" y="68" width="7" height="21" fill="#153b3a" />
                <rect x="63" y="68" width="14" height="14" fill="#153b3a" />
                <rect x="84" y="68" width="7" height="21" fill="#153b3a" />
                <rect x="98" y="74" width="14" height="7" fill="#153b3a" />
                <rect x="119" y="74" width="7" height="7" fill="#153b3a" />

                <rect x="52" y="98" width="20" height="7" fill="#153b3a" />
                <rect x="78" y="98" width="7" height="14" fill="#153b3a" />
                <rect x="52" y="112" width="7" height="14" fill="#153b3a" />
                <rect x="64" y="112" width="20" height="7" fill="#153b3a" />
                <rect x="98" y="98" width="28" height="7" fill="#153b3a" />
                <rect x="98" y="112" width="14" height="14" fill="#153b3a" />
                <rect x="119" y="119" width="7" height="7" fill="#153b3a" />
              </svg>
            </div>
            <div className="passport-qr-meta">
              <span className="qr-meta-code">Verify on Field</span>
              <small className="qr-click-prompt">Click to Verify / Scan</small>
            </div>
          </div>
        </div>

        {/* Compact Technical Fingerprint Grid */}
        <div className="cert-section-block">
          <h3 className="cert-section-title">
            <Layers size={18} /> Compact Normalized Technical Fingerprint
          </h3>
          <div className="cert-fingerprint-grid">
            {fingerprint.attributes.map(attr => (
              <div className="cert-attr-card" key={attr.id}>
                <span className="attr-key">{attr.label}</span>
                <strong className="attr-val">{attr.normalizedValue}</strong>
                <span className="attr-std">{attr.standardRef}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Retained Source ERP Aliases (Lineage Preservation) */}
        <div className="cert-section-block">
          <h3 className="cert-section-title">
            <Lock size={18} /> Retained Source Lineage (Non-destructive overlay design)
          </h3>
          <div className="cert-aliases-table-wrap">
            <table className="cert-aliases-table">
              <thead>
                <tr>
                  <th>Participant CPSE</th>
                  <th>Legacy Material Code</th>
                  <th>Native ERP Platform</th>
                  <th>Harmonization Link Status</th>
                </tr>
              </thead>
              <tbody>
                {governance.retainedAliases.map(alias => (
                  <tr key={alias.code} className={alias.status === 'Conflict Quarantined' ? 'row-quarantine' : ''}>
                    <td><strong>{alias.org}</strong></td>
                    <td><code>{alias.code}</code></td>
                    <td>{alias.erp}</td>
                    <td>
                      <span className={`alias-status-pill ${alias.status === 'Harmonized' ? 'harmonized' : 'quarantined'}`}>
                        {alias.status === 'Harmonized' ? <CheckCircle2 size={13} /> : <Lock size={13} />}
                        {alias.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="cert-lineage-disclaimer">
            * Native CPSE ERP inventories continue using their respective legacy codes. KYNEX acts as a non-destructive national resolution layer.
          </p>
        </div>

        {/* Governance, Sign-off & Audit Trail */}
        <div className="cert-section-block cert-audit-block">
          <h3 className="cert-section-title">
            <UserCheck size={18} /> Governance & Sign-off Audit Trail
          </h3>
          <div className="cert-audit-grid">
            <div className="audit-tile">
              <span className="audit-lbl">Harmonization Authority</span>
              <strong className="audit-val">{governance.authority}</strong>
            </div>
            <div className="audit-tile">
              <span className="audit-lbl">Sign-off Timestamp</span>
              <strong className="audit-val">
                {isApproved ? `${new Date(governance.auditTimestamp).toUTCString()} (controlled)` : 'Awaiting Review'}
              </strong>
            </div>
            <div className="audit-tile">
              <span className="audit-lbl">Validation Protocol</span>
              <strong className="audit-val">Approval event · operational record</strong>
            </div>
            <div className="audit-tile">
              <span className="audit-lbl">Publish Target</span>
              <strong className="audit-val">Governed review queue · Export-controlled registry boundary</strong>
            </div>
          </div>
        </div>

        {/* Footer Seal */}
        <div className="cert-footer-seal">
          <div className="seal-text">
            <span>KYNEX Identity Resolution Engine</span>
            <small>All codes, records, and signatures shown are for operational and verification purposes.</small>
          </div>
          <div className="seal-stamp">
            <span>KYNEX workspace</span>
            <strong>{isApproved ? 'APPROVED' : 'DRAFT'}</strong>
          </div>
        </div>
      </div>

      {/* QR Verification Modal */}
      <AnimatePresence>
        {verificationModalOpen && (
          <div className="modal-backdrop" role="presentation" onClick={() => setVerificationModalOpen(false)}>
            <motion.div
              className="modal passport-verify-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="passport-verify-title"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-top">
                <div className="modal-top-title">
                  <span className="modal-icon-badge brass"><QrCode size={20} /></span>
                  <div>
                    <h2 id="passport-verify-title">Field Passport QR Verification</h2>
                    <small className="modal-subtitle">Frontend preview of the resolved material identity</small>
                  </div>
                </div>
                <button className="modal-close-btn" onClick={() => setVerificationModalOpen(false)} aria-label="Close dialog">
                  <X size={20} />
                </button>
              </div>

              <div className="modal-scroll-content">
                <div className="verify-target-card">
                  <span className="verify-target-lbl">Resolved Passport URL</span>
                  <code className="verify-url-code">{passportUrl}</code>
                  <div className={`verify-status-badge ${isApproved ? 'valid' : 'pending'}`}>
                    <CheckCircle2 size={16} />
                    <span>{isApproved ? 'Passport approved for this workspace' : 'Draft identity — awaiting sign-off'}</span>
                  </div>
                </div>

                <div className="verify-details-grid">
                  <div className="verify-item">
                    <span className="v-lbl">Common Code</span>
                    <strong>{recommendedCode}</strong>
                  </div>
                  <div className="verify-item">
                    <span className="v-lbl">Mapping Version</span>
                    <span>{mappingVersion}</span>
                  </div>
                  <div className="verify-item">
                    <span className="v-lbl">workspace reference</span>
                    <code>workspace-VALVE-050-PN16</code>
                  </div>
                  <div className="verify-item">
                    <span className="v-lbl">Lineage Preservation</span>
                    <span>Source aliases retained in this workspace</span>
                  </div>
                </div>

                <div className="verify-disclaimer-box">
                  <Info size={14} />
                  <span>controlled connected passport — export-only to a production CPSE registry.</span>
                </div>
              </div>

              <div className="modal-footer-bar">
                <span className="modal-footnote">
                  <Lock size={12} /> Frontend QR verification preview using controlled data.
                </span>
                <button className="button primary compact" onClick={() => setVerificationModalOpen(false)}>
                  Close Verification
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
