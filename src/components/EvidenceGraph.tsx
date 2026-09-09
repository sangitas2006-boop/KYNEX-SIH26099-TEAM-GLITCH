import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Network, X, ShieldAlert, CheckCircle2, Info, ArrowRight,
  Database, SlidersHorizontal, Lock, AlertTriangle
} from 'lucide-react'
import type { MaterialCase } from '../data/materialCases'

interface EvidenceGraphProps {
  isOpen: boolean
  onClose: () => void
  materialCase: MaterialCase
}

export function EvidenceGraph({ isOpen, onClose, materialCase }: EvidenceGraphProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('CNMC')
  const { evidence, recommendedCode, candidates } = materialCase

  // Escape key handler
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
          className="modal evidence-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="evidence-graph-title"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="modal-top">
            <div className="modal-top-title">
              <span className="modal-icon-badge brass"><Network size={20} /></span>
              <div>
                <h2 id="evidence-graph-title">Explainable Evidence Graph</h2>
                <small className="modal-subtitle">Direct topological concordance & conflict isolation network</small>
              </div>
            </div>
            <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
              <X size={20} />
            </button>
          </div>

          <div className="modal-scroll-content">
            {/* Quick Summary Bar */}
            <div className="evidence-head-summary">
              <div>
                <span className="evidence-category-pill">{materialCase.category}</span>
                <h3 className="evidence-code-headline">{recommendedCode}</h3>
              </div>
              <div className="evidence-metrics-strip">
                <div className="metric-pill">
                  <small>Attribute Match</small>
                  <strong>{evidence.attributeScore}%</strong>
                </div>
                <div className="metric-pill">
                  <small>Lexical Overlap</small>
                  <strong>{evidence.lexicalScore}%</strong>
                </div>
                <div className="metric-pill">
                  <small>Taxonomy</small>
                  <strong>{evidence.taxonomyScore}%</strong>
                </div>
                <div className="metric-pill">
                  <small>Source Lineage</small>
                  <strong>100%</strong>
                </div>
                <div className="metric-pill alert">
                  <small>Conflicts Flagged</small>
                  <strong>1 Quarantined</strong>
                </div>
              </div>
            </div>

            {/* Conflict Alert Callout */}
            <div className="conflict-alert-callout">
              <div className="conflict-alert-icon">
                <AlertTriangle size={22} />
              </div>
              <div className="conflict-alert-text">
                <strong>Visible Safety Mismatch Detected & Quarantined</strong>
                <p>{evidence.conflictExplanation}</p>
              </div>
            </div>

            {/* Interactive SVG Network Graph */}
            <div className="svg-network-container">
              <div className="svg-network-header">
                <span><b>Interactive Data Topology</b> · Click any node to inspect concordance rationale</span>
                <span className="legend-strip">
                  <span className="legend-item"><i className="leg-dot source" /> Reference / Source ERP</span>
                  <span className="legend-item"><i className="leg-dot attr" /> Attribute Normalizer</span>
                  <span className="legend-item"><i className="leg-dot target" /> Harmonized CNMC</span>
                  <span className="legend-item"><i className="leg-dot conflict" /> Conflict Isolated</span>
                </span>
              </div>

              <div className="svg-canvas-wrapper">
                <svg
                  className="evidence-network-svg"
                  viewBox="0 0 780 400"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <defs>
                    <linearGradient id="edgeGradMatch" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#5e7352" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#153b3a" stopOpacity="0.9" />
                    </linearGradient>
                    <linearGradient id="edgeGradConflict" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#b75e3e" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#b75e3e" stopOpacity="0.3" />
                    </linearGradient>
                  </defs>

                  {/* Connecting Edges */}
                  {/* CPCL (Reference) to Attributes & CNMC */}
                  <path
                    d="M 220 100 C 260 100, 260 83, 300 83"
                    className="network-edge match"
                    stroke="#5e7352"
                    strokeWidth="2.5"
                    fill="none"
                  />
                  <path
                    d="M 220 100 C 260 100, 260 163, 300 163"
                    className="network-edge match"
                    stroke="#5e7352"
                    strokeWidth="2.5"
                    fill="none"
                  />
                  <path
                    d="M 220 100 C 380 90, 420 170, 540 170"
                    className="network-edge direct"
                    stroke="#153b3a"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    fill="none"
                  />

                  {/* SAIL (Near-Duplicate Candidate) to Attributes & CNMC */}
                  <path
                    d="M 220 220 C 260 220, 260 83, 300 83"
                    className="network-edge match"
                    stroke="#5e7352"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M 220 220 C 260 220, 260 243, 300 243"
                    className="network-edge match"
                    stroke="#5e7352"
                    strokeWidth="2.5"
                    fill="none"
                  />
                  <path
                    d="M 220 220 C 360 220, 420 190, 540 190"
                    className="network-edge direct"
                    stroke="#153b3a"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    fill="none"
                  />

                  {/* Attributes to CNMC */}
                  <path
                    d="M 460 83 C 500 83, 500 160, 540 160"
                    className="network-edge attr-link"
                    stroke="#c69b4a"
                    strokeWidth="2.5"
                    fill="none"
                  />
                  <path
                    d="M 460 163 C 500 163, 500 185, 540 185"
                    className="network-edge attr-link"
                    stroke="#c69b4a"
                    strokeWidth="2.5"
                    fill="none"
                  />
                  <path
                    d="M 460 243 C 500 243, 500 210, 540 210"
                    className="network-edge attr-link"
                    stroke="#c69b4a"
                    strokeWidth="2.5"
                    fill="none"
                  />

                  {/* NTPC CONFLICT EDGE (Blocked / Dashed Red / Barrier) */}
                  <path
                    d="M 220 340 C 380 340, 450 250, 540 230"
                    className="network-edge conflict"
                    stroke="#b75e3e"
                    strokeWidth="3"
                    strokeDasharray="6 6"
                    fill="none"
                  />

                  {/* Edge Labels */}
                  <g className="edge-labels">
                    <rect x="238" y="70" width="56" height="18" rx="4" fill="#f2ebdd" stroke="#5e7352" strokeWidth="1" />
                    <text x="266" y="83" textAnchor="middle" fontSize="10" fontWeight="600" fill="#5e7352">2 in = 50mm</text>

                    <rect x="465" y="105" width="68" height="18" rx="4" fill="#f2ebdd" stroke="#c69b4a" strokeWidth="1" />
                    <text x="499" y="118" textAnchor="middle" fontSize="10" fontWeight="600" fill="#153b3a">Bore Verified</text>

                    <rect x="330" y="305" width="130" height="22" rx="4" fill="#fff" stroke="#b75e3e" strokeWidth="1.5" />
                    <text x="395" y="320" textAnchor="middle" fontSize="11" fontWeight="700" fill="#b75e3e">⚠️ PN25 ≠ PN16 BLOCKED</text>
                  </g>

                  {/* NODES RENDERING */}
                  {/* 1. CPCL Reference Node */}
                  <g
                    className={`svg-node-group ${selectedNodeId === 'CPCL' ? 'active' : ''}`}
                    onClick={() => setSelectedNodeId('CPCL')}
                    style={{ cursor: 'pointer' }}
                  >
                    <rect x="50" y="70" width="170" height="60" rx="8" fill="#ffffff" stroke="#3e667a" strokeWidth="2" />
                    <circle cx="68" cy="90" r="6" fill="#3e667a" />
                    <text x="82" y="94" fontSize="12" fontWeight="700" fill="#153b3a">CPCL-VLV-04182</text>
                    <text x="82" y="112" fontSize="10" fill="#3e667a" fontWeight="700">Reference Record</text>
                  </g>

                  {/* 2. SAIL Near-Duplicate Candidate Node */}
                  <g
                    className={`svg-node-group ${selectedNodeId === 'SAIL' ? 'active' : ''}`}
                    onClick={() => setSelectedNodeId('SAIL')}
                    style={{ cursor: 'pointer' }}
                  >
                    <rect x="50" y="190" width="170" height="60" rx="8" fill="#ffffff" stroke="#5e7352" strokeWidth="2" />
                    <circle cx="68" cy="210" r="6" fill="#5e7352" />
                    <text x="82" y="214" fontSize="12" fontWeight="700" fill="#153b3a">SAIL-VALVE-G50-16</text>
                    <text x="82" y="232" fontSize="10" fill="#5e7352" fontWeight="700">Near-Duplicate Candidate</text>
                  </g>

                  {/* 3. NTPC Conflict Node */}
                  <g
                    className={`svg-node-group conflict-node ${selectedNodeId === 'NTPC' ? 'active' : ''}`}
                    onClick={() => setSelectedNodeId('NTPC')}
                    style={{ cursor: 'pointer' }}
                  >
                    <rect x="50" y="310" width="170" height="60" rx="8" fill="#fff5f2" stroke="#b75e3e" strokeWidth="2.5" />
                    <circle cx="68" cy="330" r="6" fill="#b75e3e" />
                    <text x="82" y="334" fontSize="12" fontWeight="800" fill="#b75e3e">NTPC-VLV-3307</text>
                    <text x="82" y="352" fontSize="10" fontWeight="700" fill="#b75e3e">Conflict — Do Not Merge</text>
                  </g>

                  {/* 4. Attribute Nodes */}
                  <g
                    className={`svg-node-group attr-node ${selectedNodeId === 'ATTR_DIM' ? 'active' : ''}`}
                    onClick={() => setSelectedNodeId('ATTR_DIM')}
                    style={{ cursor: 'pointer' }}
                  >
                    <rect x="300" y="60" width="160" height="46" rx="6" fill="#ffffff" stroke="#c69b4a" strokeWidth="1.5" />
                    <text x="312" y="80" fontSize="11" fontWeight="700" fill="#153b3a">DN 50 mm (2 IN)</text>
                    <text x="312" y="95" fontSize="9.5" fill="#5e7352">100% Dimension Match</text>
                  </g>

                  <g
                    className={`svg-node-group attr-node ${selectedNodeId === 'ATTR_MAT' ? 'active' : ''}`}
                    onClick={() => setSelectedNodeId('ATTR_MAT')}
                    style={{ cursor: 'pointer' }}
                  >
                    <rect x="300" y="140" width="160" height="46" rx="6" fill="#ffffff" stroke="#c69b4a" strokeWidth="1.5" />
                    <text x="312" y="160" fontSize="11" fontWeight="700" fill="#153b3a">ASTM A351 CF8M (SS316)</text>
                    <text x="312" y="175" fontSize="9.5" fill="#5e7352">Austenitic Stainless</text>
                  </g>

                  <g
                    className={`svg-node-group attr-node ${selectedNodeId === 'ATTR_PRS' ? 'active' : ''}`}
                    onClick={() => setSelectedNodeId('ATTR_PRS')}
                    style={{ cursor: 'pointer' }}
                  >
                    <rect x="300" y="220" width="160" height="46" rx="6" fill="#ffffff" stroke="#c69b4a" strokeWidth="1.5" />
                    <text x="312" y="240" fontSize="11" fontWeight="700" fill="#153b3a">Pressure: PN16 (16 Bar)</text>
                    <text x="312" y="255" fontSize="9.5" fill="#5e7352">ISO/EN Standard Class</text>
                  </g>

                  {/* 5. Target CNMC Node */}
                  <g
                    className={`svg-node-group target-node ${selectedNodeId === 'CNMC' ? 'active' : ''}`}
                    onClick={() => setSelectedNodeId('CNMC')}
                    style={{ cursor: 'pointer' }}
                  >
                    <rect x="540" y="140" width="220" height="90" rx="10" fill="#153b3a" stroke="#c69b4a" strokeWidth="2.5" />
                    <text x="556" y="166" fontSize="11" fontWeight="600" fill="#a6c8ba">GOVERNED IDENTITY</text>
                    <text x="556" y="188" fontSize="12" fontWeight="800" fill="#ffffff">CNMC-VALVE-GATE-</text>
                    <text x="556" y="206" fontSize="12" fontWeight="800" fill="#ffffff">SS-050-PN16</text>
                    <text x="556" y="222" fontSize="10" fill="#c69b4a">★ Evidence fit · 85.7%</text>
                  </g>
                </svg>
              </div>
            </div>

            {/* Candidate Breakdown Table */}
            <div className="candidate-breakdown-section">
              <h4>Candidate Concordance Matrix (5 Explicit Dimensions)</h4>
              <div className="candidate-table-wrap">
                <table className="candidate-table">
                  <thead>
                    <tr>
                      <th>CPSE Source</th>
                      <th>Legacy Code</th>
                      <th>Relationship Type</th>
                      <th>Lexical</th>
                      <th>Attributes</th>
                      <th>Taxonomy</th>
                      <th>Lineage</th>
                      <th>Status / Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map(cand => (
                      <tr key={cand.id} className={cand.isConflict ? 'row-conflict' : ''}>
                        <td>
                          <strong>{cand.org}</strong>
                          <small className="cell-plant">{cand.plant}</small>
                        </td>
                        <td><code>{cand.code}</code></td>
                        <td>
                          <span className={`rel-badge ${cand.isConflict ? 'conflict' : cand.relationship === 'Reference record' ? 'reference' : 'near'}`}>
                            {cand.relationship}
                          </span>
                        </td>
                        <td>{cand.concordance.lexical}%</td>
                        <td>
                          <b className={cand.isConflict ? 'text-conflict' : ''}>
                            {cand.concordance.technicalAttributes}%
                          </b>
                        </td>
                        <td>{cand.concordance.taxonomy}%</td>
                        <td>{cand.concordance.sourceLineage}%</td>
                        <td>
                          {cand.isConflict ? (
                            <span className="action-flag-pill">Quarantined · No Merge</span>
                          ) : (
                            <span className="action-harmonized-pill"><CheckCircle2 size={13} /> Eligible for Review</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Explainable Checklist */}
            <div className="evidence-checklist-card">
              <h4>Explainable AI Concordance Rationale</h4>
              <ul className="evidence-reasons-list">
                {evidence.reasons.map((r, i) => (
                  <li key={i}>
                    <CheckCircle2 size={16} className="reason-check-icon" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
              <div className="lineage-guarantee-note">
                <Lock size={14} />
                <span>{evidence.lineageNotes}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer-bar">
            <span className="modal-footnote">
              <Lock size={12} /> Read in &lt;10s: Source records link to common code via verified attributes; pressure mismatch is quarantined.
            </span>
            <button className="button primary compact" onClick={onClose}>
              Back to Studio <ArrowRight size={15} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
