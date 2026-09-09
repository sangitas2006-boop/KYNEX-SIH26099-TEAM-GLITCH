import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileSpreadsheet, QrCode, ArrowRight, ArrowLeft, CheckCircle2,
  SlidersHorizontal, Network, ShieldCheck, Lock, AlertTriangle,
  RotateCcw, Sparkles, Check, X, Info, Download, Layers, ShieldAlert,
  Edit3
} from 'lucide-react'
import { MATERIAL_CASES, type MaterialCase, type AttributeChip } from '../data/materialCases'
import { ScanModal } from './ScanModal'
import { EvidenceGraph } from './EvidenceGraph'
import { MaterialPassport } from './MaterialPassport'
import { LiveEnginePanel } from './LiveEnginePanel'
import { useAuth } from '../auth/AuthProvider'

interface ResolutionStudioProps {
  initialCaseKey?: string
}

type StudioStep = 'intake' | 'fingerprint' | 'compare' | 'govern' | 'publish'

export function ResolutionStudio({ initialCaseKey = 'gate-valve' }: ResolutionStudioProps) {
  const { isGuest } = useAuth()
  const [selectedCaseKey, setSelectedCaseKey] = useState<string>(initialCaseKey)
  const [currentStep, setCurrentStep] = useState<StudioStep>('intake')
  const [scanModalOpen, setScanModalOpen] = useState(false)
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false)
  const [unitNormalized, setUnitNormalized] = useState(true)
  const [editedAttributes, setEditedAttributes] = useState<Record<string, string>>({})
  const [approvalStatus, setApprovalStatus] = useState<Record<string, 'pending' | 'approved' | 'rejected'>>({
    'gate-valve': 'pending',
    'fastener-bolt': 'pending',
    'pump-impeller': 'pending'
  })
  const [intakeCompleted, setIntakeCompleted] = useState<Record<string, boolean>>({
    'gate-valve': true,
    'fastener-bolt': true,
    'pump-impeller': true
  })
  const [activeEditingChip, setActiveEditingChip] = useState<string | null>(null)
  const [uncertainworkspace, setUncertainworkspace] = useState(false)
  const [clarificationSent, setClarificationSent] = useState(false)

  const currentCase = MATERIAL_CASES[selectedCaseKey] || MATERIAL_CASES['gate-valve']
  const currentStatus = approvalStatus[selectedCaseKey] || 'pending'

  const compatibilityEnvelope = currentCase.id === 'gate-valve'
    ? { safe: ['Material family · SS 316 / CF8M', 'Nominal bore · 2 in ↔ DN50', 'End connection · Flanged RF', 'Unit · Each (EA)'], blockers: ['Pressure class · PN16 is not PN25', 'Operating envelope requires engineer approval'] }
    : currentCase.id === 'fastener-bolt'
      ? { safe: ['Material family · Austenitic stainless steel', 'Nominal thread · M10', 'Shank length · 50 mm', 'Unit · Each (EA)'], blockers: ['Thread pitch · 1.5 mm is not 1.25 mm', 'Fine/coarse pitch must not be substituted'] }
      : { safe: ['Material family · Cast SS 316 / CF8M', 'Outer diameter · 200 mm', 'Impeller family · Closed radial vane', 'Unit · Each (EA)'], blockers: ['Trim diameter · 200 mm is not 220 mm', 'Casing compatibility requires engineer sign-off'] }

  const stepsList: Array<{ id: StudioStep; label: string; number: string; desc: string }> = [
    { id: 'intake', label: 'Intake', number: '01', desc: 'Scan or import legacy record' },
    { id: 'fingerprint', label: 'Fingerprint', number: '02', desc: 'Normalized attribute vector' },
    { id: 'compare', label: 'Compare', number: '03', desc: 'Compare candidate records' },
    { id: 'govern', label: 'Review', number: '04', desc: 'Expert approval' },
    { id: 'publish', label: 'Publish', number: '05', desc: 'Preview approved identity' }
  ]

  const handleScanSuccess = () => {
    setIntakeCompleted(prev => ({ ...prev, [selectedCaseKey]: true }))
    setCurrentStep('fingerprint')
  }

  const handleApprove = () => {
    if (isGuest) return
    setApprovalStatus(prev => ({
      ...prev,
      [selectedCaseKey]: 'approved'
    }))
  }

  const handleReject = () => {
    if (isGuest) return
    setApprovalStatus(prev => ({
      ...prev,
      [selectedCaseKey]: 'rejected'
    }))
  }

  const handleResetApproval = () => {
    setApprovalStatus(prev => ({
      ...prev,
      [selectedCaseKey]: 'pending'
    }))
  }

  return (
    <section id="resolution-studio" className="resolution-studio-section section-wrap">
      {/* Studio Header */}
      <div className="section-heading">
        <div className="eyebrow-badge">
          <span className="badge-pulse" />
          <span className="eyebrow-text">Resolution Workspace</span>
        </div>
        <h2>Material Resolution Studio</h2>
        <p className="section-subtext">
          Resolve a material identity through technical evidence, conflict controls, and expert approval—without losing the original source record.
        </p>
        <div className="disclaimer-note">
          <Info size={14} />
          <span>AI suggests candidates; authorized experts approve the final match.</span>
        </div>
      </div>

      <div className="command-center">
        <div className="command-center-head">
          <div>
            <span className="step-tag">Resolution workflow</span>
            <h3>Compare records, then review the result</h3>
            <p>KYNEX compares candidate identities, isolates conflicts, and keeps source records unchanged until an expert approves the result.</p>
          </div>
          <span className="command-center-kicker">Reviewable workspace</span>
        </div>
        <div className="workspace-status-bar" aria-label="Workspace status">
          <div className="workspace-status-copy">
            <span className="workspace-status-dot" />
            <div>
              <strong>Governed workspace online</strong>
              <span>Connected material records · source-safe operating mode</span>
            </div>
          </div>
          <div className="workspace-status-chips">
            <span className="workspace-status-chip good"><CheckCircle2 size={13} /> API healthy</span>
            <span className="workspace-status-chip neutral"><Lock size={13} /> No ERP overwrite</span>
            <span className="workspace-status-chip warning"><ShieldAlert size={13} /> Expert approval required</span>
          </div>
        </div>

        <div className="workspace-overview-grid" aria-label="Resolution workspace overview">
          <article className="workspace-overview-card featured">
            <span className="overview-card-label">Active resolution set</span>
            <strong>GV-04182</strong>
            <span>SS gate valve · DN50 · PN16</span>
            <div className="overview-progress"><i style={{ width: '68%' }} /></div>
            <small>Evidence session 3 of 5 checkpoints ready</small>
          </article>
          <article className="workspace-overview-card">
            <span className="overview-card-label">Candidate landscape</span>
            <strong>3 records</strong>
            <span>Across CPCL · SAIL · NTPC</span>
            <div className="overview-mini-list"><b><i className="mini-dot olive" /> 1 reference</b><b><i className="mini-dot brass" /> 1 near match</b><b><i className="mini-dot copper" /> 1 conflict</b></div>
          </article>
          <article className="workspace-overview-card">
            <span className="overview-card-label">Safety posture</span>
            <strong>1 blocker</strong>
            <span>Pressure class conflict isolated</span>
            <div className="overview-safety-line"><ShieldAlert size={14} /> Automatic merge paused</div>
          </article>
          <article className="workspace-overview-card">
            <span className="overview-card-label">Governed output</span>
            <strong>Pending review</strong>
            <span>CNMC-VALVE-GATE-SS-050-PN16</span>
            <div className="overview-safety-line muted"><Lock size={14} /> Native code retained</div>
          </article>
        </div>

        <LiveEnginePanel />
      </div>

      <div className="studio-walkthrough-head">
        <span className="step-tag">Guided walkthrough</span>
        <h3>Five-step evidence session</h3>
        <p>Use a labelled case to show intake, fingerprinting, conflict isolation, expert sign-off, and the Material Passport.</p>
      </div>

      {/* Material Case Switcher (Primary workspace is Gate Valve) */}
      <div className="studio-material-picker" role="tablist" aria-label="Select workspace material case">
        <span className="picker-label">Active material set</span>
        {Object.values(MATERIAL_CASES).map(mc => (
          <button
            key={mc.id}
            role="tab"
            aria-selected={selectedCaseKey === mc.id}
            className={`case-tab-btn ${selectedCaseKey === mc.id ? 'active' : ''}`}
            onClick={() => {
              setSelectedCaseKey(mc.id)
              setUncertainworkspace(false)
              setClarificationSent(false)
              setCurrentStep('intake')
            }}
          >
            <b>{mc.title}</b>
            <small>{mc.recommendedCode}</small>
          </button>
        ))}
        <button
          className={uncertainworkspace ? 'case-tab-btn active uncertain-case-tab' : 'case-tab-btn uncertain-case-tab'}
          role="tab"
          aria-selected={uncertainworkspace}
          onClick={() => {
            setUncertainworkspace(true)
            setClarificationSent(false)
            setCurrentStep('compare')
          }}
        >
          <b>Uncertain record</b>
          <small>Clarification required</small>
        </button>
      </div>

      {/* 5-Step Progress Rail */}
      <div className="studio-progress-rail" role="navigation" aria-label="Studio 5-step pipeline">
        {stepsList.map((step, idx) => {
          const isCurrent = currentStep === step.id
          const stepOrder: StudioStep[] = ['intake', 'fingerprint', 'compare', 'govern', 'publish']
          const currentIdx = stepOrder.indexOf(currentStep)
          const isDone = currentIdx > idx
          const isLocked = idx > currentIdx + 1 || (step.id === 'publish' && currentStatus !== 'approved')

          return (
            <button
              key={step.id}
              className={`rail-step-btn ${isCurrent ? 'active' : ''} ${isDone ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}
              disabled={isLocked}
              onClick={() => setCurrentStep(step.id)}
              title={isLocked ? 'Finish the previous step first' : undefined}
            >
              <div className="rail-step-num">
                {isDone ? <Check size={14} strokeWidth={3} /> : isLocked ? <Lock size={13} /> : step.number}
              </div>
              <div className="rail-step-info">
                <span className="rail-step-title">{step.label}</span>
                <small className="rail-step-desc">{step.desc}</small>
              </div>
              {idx < stepsList.length - 1 && <div className="rail-connector" />}
            </button>
          )
        })}
      </div>

      {/* Main Studio Viewport Card */}
      <div className="studio-viewport-card">
        {/* STEP 1: INTAKE VIEW */}
        {currentStep === 'intake' && (
          <motion.div
            key="intake-step"
            className="studio-step-content intake-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="step-view-header">
              <div>
                <span className="step-tag">Step 01 · Intake Channel</span>
                <h3>Select Intake Method for Legacy Catalog Record</h3>
                <p>run field QR scanning or ERP batch upload to retrieve native CPSE material master attributes.</p>
              </div>
            </div>

            {/* Two Clear Input Tiles */}
            <div className="intake-tiles-grid">
              {/* Tile 1: Import CPSE Export */}
              <div
                className="intake-tile upload-tile"
                tabIndex={0}
                role="button"
                onClick={() => {
                  setIntakeCompleted(prev => ({ ...prev, [selectedCaseKey]: true }))
                  setCurrentStep('fingerprint')
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setIntakeCompleted(prev => ({ ...prev, [selectedCaseKey]: true }))
                    setCurrentStep('fingerprint')
                  }
                }}
              >
                <div className="tile-icon-wrap"><FileSpreadsheet size={32} /></div>
                <h4>Import CPSE Export</h4>
                <p>run batch ingestion from SAP S/4HANA (MARA/MARC export) or Oracle SCM catalog CSV.</p>
                <div className="tile-badge-strip">
                  <span>SAP CSV Format</span>
                  <span>Auto-Parse</span>
                </div>
                <button className="button outline compact full-width">
                  Load ERP Record <ArrowRight size={14} />
                </button>
              </div>

              {/* Tile 2: Scan Label / QR */}
              <div
                className="intake-tile scan-tile"
                tabIndex={0}
                role="button"
                onClick={() => setScanModalOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setScanModalOpen(true)
                  }
                }}
              >
                <div className="tile-icon-wrap brass"><QrCode size={32} /></div>
                <h4>Scan Label / QR</h4>
                <p>Open physical bin scanner to run warehouse QR / barcode acquisition via sample scan or camera.</p>
                <div className="tile-badge-strip">
                  <span>Physical QR</span>
                  <span>Barcode 128</span>
                </div>
                <button className="button primary compact full-width">
                  Open Scan Intake Modal <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Loaded Legacy Record Summary Card */}
            <div className="loaded-legacy-summary">
              <div className="legacy-summary-head">
                <span className="legacy-dot" />
                <span>Retrieved Baseline CPSE Record</span>
                <span className="source-erp-pill">{currentCase.intakeSample.sourceSystem}</span>
              </div>
              <div className="legacy-summary-grid">
                <div>
                  <small>Originating CPSE</small>
                  <strong>{currentCase.intakeSample.org} ({currentCase.intakeSample.plant})</strong>
                </div>
                <div>
                  <small>Legacy Code</small>
                  <code>{currentCase.intakeSample.code}</code>
                </div>
                <div>
                  <small>Raw Description</small>
                  <strong className="desc-highlight">{currentCase.intakeSample.description}</strong>
                </div>
                <div>
                  <small>UOM</small>
                  <span>{currentCase.intakeSample.uom}</span>
                </div>
              </div>
              <div className="intake-cta-strip">
                <span className="intake-disclaimer-text">
                  <ShieldAlert size={14} /> Intake only anchors native record; identity equivalence is proved in subsequent steps.
                </span>
                <button className="button primary" onClick={() => setCurrentStep('fingerprint')}>
                  Proceed to Fingerprint Extraction <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 2: FINGERPRINT VIEW */}
        {currentStep === 'fingerprint' && (
          <motion.div
            key="fingerprint-step"
            className="studio-step-content fingerprint-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="step-view-header">
              <div>
                <span className="step-tag">Step 02 · Structured Material Fingerprint</span>
                <h3>Explainable Attribute Extraction & Unit Normalization</h3>
                <p>Dissect unstructured text descriptions into standardized technical vectors with verified international taxonomy references.</p>
              </div>
              <button
                className="button outline compact"
                onClick={() => setUnitNormalized(!unitNormalized)}
                title="Toggle between raw extracted units and normalized standard"
              >
                <RotateCcw size={14} /> {unitNormalized ? 'Show Raw Units' : 'Normalize Units'}
              </button>
            </div>

            {/* Interactive Unit Normalization Interaction Banner */}
            <div className="unit-normalization-widget">
              <div className="un-left">
                <SlidersHorizontal size={20} className="un-icon" />
                <div>
                  <strong>Unit Normalization Interaction:</strong>
                  <span className="un-conversion-text">
                    {unitNormalized
                      ? '2 in (Imperial Nominal Bore) → 50.8 mm (Normalized to 50 mm / DN50 nominal standard rule)'
                      : '2 in (Raw Legacy Token — Non-harmonized)'}
                  </span>
                </div>
              </div>
              <span className="un-status-pill">{unitNormalized ? 'Normalized (ISO 6708)' : 'Raw Imperial'}</span>
            </div>

            {/* Structured Editable Attribute Chips */}
            <div className="fingerprint-chips-grid">
              {currentCase.fingerprint.attributes.map(chip => {
                const isEditing = activeEditingChip === chip.id
                const currentValue = editedAttributes[chip.id] || (unitNormalized ? chip.normalizedValue : chip.rawValue)

                return (
                  <div
                    key={chip.id}
                    className={`fingerprint-attribute-card ${isEditing ? 'editing' : ''}`}
                    onClick={() => setActiveEditingChip(chip.id)}
                  >
                    <div className="attr-chip-top">
                      <span className="attr-chip-label">{chip.label}</span>
                      <span className="attr-chip-conf">{chip.confidence}% Confidence</span>
                    </div>

                    {isEditing ? (
                      <div className="attr-edit-box" onClick={e => e.stopPropagation()}>
                        <input
                          type="text"
                          className="attr-inline-input"
                          value={currentValue}
                          onChange={(e) => setEditedAttributes({ ...editedAttributes, [chip.id]: e.target.value })}
                          autoFocus
                        />
                        <button
                          className="btn-save-chip"
                          onClick={() => setActiveEditingChip(null)}
                        >
                          <Check size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="attr-chip-body">
                        <strong className="attr-chip-val">{currentValue}</strong>
                        <button className="attr-chip-edit-btn" title="Edit attribute chip">
                          <Edit3 size={12} />
                        </button>
                      </div>
                    )}

                    <div className="attr-chip-footer">
                      <small className="attr-std-ref">{chip.standardRef}</small>
                      {chip.isNormalized && unitNormalized && (
                        <span className="attr-norm-badge">Normalized</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Navigation buttons */}
            <div className="step-navigation-footer">
              <button className="button outline" onClick={() => setCurrentStep('intake')}>
                <ArrowLeft size={16} /> Back to Intake
              </button>
              <button className="button primary" onClick={() => setCurrentStep('compare')}>
                Compare Candidates & Graph <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: COMPARE VIEW */}
        {currentStep === 'compare' && (
          <motion.div
            key="compare-step"
            className="studio-step-content compare-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="step-view-header">
              <div>
                <span className="step-tag">Step 03 · Cross-CPSE Candidate Concordance</span>
                <h3>{uncertainworkspace ? 'Insufficient Evidence Review' : 'Multi-Enterprise Candidate Group Comparison'}</h3>
                <p>{uncertainworkspace ? 'The engine abstains when required technical attributes are missing instead of inventing a common code.' : 'Evaluates records from CPCL, SAIL, and NTPC across 5 explicit dimensions with safety conflict quarantine.'}</p>
              </div>
              {uncertainworkspace ? (
                <span className="evidence-deferred-note"><Info size={14} /> Evidence graph deferred until required attributes are supplied</span>
              ) : (
                <button className="button primary compact" onClick={() => setEvidenceModalOpen(true)}>
                  <Network size={16} /> Open Interactive Evidence Graph
                </button>
              )}
            </div>

            {!uncertainworkspace && (
              <div className="comparison-summary-strip" aria-label="Candidate comparison summary">
                <div className="comparison-summary-main">
                  <span className="comparison-summary-kicker">Decision snapshot</span>
                  <strong>2 candidates enter review · 1 remains quarantined</strong>
                  <span>Technical evidence, not similarity alone, determines the route.</span>
                </div>
                <div className="comparison-summary-metrics">
                  <span><b>85.7%</b> best evidence fit</span>
                  <span><b>5/5</b> dimensions evaluated</span>
                  <span className="risk"><b>1</b> blocking variance</span>
                </div>
                <div className="comparison-legend" aria-label="Evidence legend">
                  <span><i className="legend-dot reference" /> Reference</span>
                  <span><i className="legend-dot match" /> Reviewable</span>
                  <span><i className="legend-dot conflict" /> Quarantined</span>
                </div>
              </div>
            )}

            {/* Candidates Concordance Cards */}
            {uncertainworkspace && (
              <div className="uncertain-review-card">
                <div className="uncertain-review-head">
                  <div>
                    <span className="uncertain-kicker">Responsible abstention</span>
                    <h4>No confident common-code recommendation</h4>
                    <p>Similarity is not enough to establish technical equivalence. This record is routed for clarification.</p>
                  </div>
                  <span className="uncertain-score"><Info size={14} /> Evidence incomplete</span>
                </div>
                <div className="uncertain-record-grid">
                  <div><small>Source record</small><strong>CPCL-VLV-04182</strong><span>SS gate valve · DN50 · PN16</span></div>
                  <div><small>Candidate record</small><strong>SAIL-VALVE-G50-16</strong><span>Stainless valve · 50 mm · pressure rating missing</span></div>
                  <div><small>Missing evidence</small><strong>2 blocking attributes</strong><span>Material grade and pressure class</span></div>
                </div>
                <div className="uncertain-action-row">
                  <span><ShieldAlert size={15} /> Automatic harmonization is paused until technical evidence is complete.</span>
                  <button className="button outline compact" onClick={() => setClarificationSent(true)}>
                    {clarificationSent ? <><CheckCircle2 size={14} /> Sent to clarification queue</> : <>Request clarification <ArrowRight size={14} /></>}
                  </button>
                </div>
              </div>
            )}

            <div className={uncertainworkspace ? 'candidate-cards-grid is-hidden' : 'candidate-cards-grid'}>
              {currentCase.candidates.map(cand => (
                <div
                  key={cand.id}
                  className={`candidate-eval-card ${cand.isConflict ? 'is-conflict' : cand.relationship === 'Reference record' ? 'is-reference' : 'is-near'}`}
                >
                  <div className="cand-head">
                    <div className="cand-org-block">
                      <span className="cand-org-tag">{cand.org}</span>
                      <code className="cand-code">{cand.code}</code>
                    </div>
                    <span className={`cand-rel-pill ${cand.isConflict ? 'conflict' : cand.relationship === 'Reference record' ? 'reference' : 'match'}`}>
                      {cand.relationship}
                    </span>
                  </div>

                  <strong className="cand-name-text">{cand.name}</strong>
                  <p className="cand-note-text">{cand.relationshipNote}</p>

                  {/* Concordance 5-Bar Breakdown (All 5 Explicit Dimensions) */}
                  <div className="concordance-bars-wrap">
                    <div className="conc-row">
                      <span>1. Lexical Match</span>
                      <div className="bar-bg"><div className="bar-fill" style={{ width: `${cand.concordance.lexical}%` }} /></div>
                      <b>{cand.concordance.lexical}%</b>
                    </div>
                    <div className="conc-row">
                      <span>2. Technical Attributes</span>
                      <div className="bar-bg"><div className={`bar-fill ${cand.isConflict ? 'red' : ''}`} style={{ width: `${cand.concordance.technicalAttributes}%` }} /></div>
                      <b>{cand.concordance.technicalAttributes}%</b>
                    </div>
                    <div className="conc-row">
                      <span>3. Taxonomy Alignment</span>
                      <div className="bar-bg"><div className="bar-fill" style={{ width: `${cand.concordance.taxonomy}%` }} /></div>
                      <b>{cand.concordance.taxonomy}%</b>
                    </div>
                    <div className="conc-row">
                      <span>4. Unit Normalization</span>
                      <div className="bar-bg"><div className="bar-fill" style={{ width: `${cand.concordance.unit}%` }} /></div>
                      <b>{cand.concordance.unit}%</b>
                    </div>
                    <div className="conc-row">
                      <span>5. Source Lineage</span>
                      <div className="bar-bg"><div className="bar-fill" style={{ width: `${cand.concordance.sourceLineage}%` }} /></div>
                      <b>{cand.concordance.sourceLineage}%</b>
                    </div>
                  </div>

                  {/* Lineage & Traceability Summary */}
                  <div className="lineage-traceability-note">
                    <Lock size={12} />
                    <span><strong>Traceability:</strong> Native {cand.erpSystem} pointer preserved (0 database overwrites).</span>
                  </div>

                  {/* Conflict Quarantine Notice or Verified Pill */}
                  {cand.isConflict ? (
                    <div className="conflict-quarantine-box">
                      <AlertTriangle size={15} />
                      <span><strong>Conflict — do not merge:</strong> High-risk technical variance isolated.</span>
                    </div>
                  ) : (
                    <div className="candidate-verified-box">
                      <CheckCircle2 size={15} />
                      <span>Eligible for expert review — evidence complete.</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="compatibility-envelope">
              <div className="compatibility-envelope-head">
                <div><span className="step-tag">Decision guardrail</span><h4>Material Compatibility Envelope</h4><p>Similarity proposes a candidate; blocking attributes determine whether it can enter expert review.</p></div>
                <span className="envelope-badge"><ShieldCheck size={14} /> Rule-based safety gate</span>
              </div>
              <div className="compatibility-columns">
                <div className="compatibility-safe"><span className="compatibility-column-label">Within the safe envelope</span>{compatibilityEnvelope.safe.map(item => <span key={item}><CheckCircle2 size={14} /> {item}</span>)}</div>
                <div className="compatibility-blockers"><span className="compatibility-column-label">Blocking attributes</span>{compatibilityEnvelope.blockers.map(item => <span key={item}><ShieldAlert size={14} /> {item}</span>)}</div>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="step-navigation-footer">
              <button className="button outline" onClick={() => setCurrentStep('fingerprint')}>
                <ArrowLeft size={16} /> Back to Fingerprint
              </button>
              <button className="button primary" disabled={uncertainworkspace} onClick={() => setCurrentStep('govern')}>
                {uncertainworkspace ? 'Clarification required before governance' : 'Proceed to Governance Review'} <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: GOVERN VIEW */}
        {currentStep === 'govern' && (
          <motion.div
            key="govern-step"
            className="studio-step-content govern-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="step-view-header">
              <div>
                <span className="step-tag">Step 04 · Human-in-the-Loop Governance</span>
                <h3>Domain Expert Decision & Audit Queue</h3>
                <p>AI compiles candidate Common National Material Code; authorized master-data officer reviews and signs off.</p>
              </div>
            </div>

            {/* Review Decision Workspace */}
            <div className="govern-review-workspace">
              {/* Governed Code Banner */}
              <div className="proposed-code-card">
                <span className="code-pre-label">Deterministic Synthesized Code</span>
                <h2 className="recommended-cnmc-title">{currentCase.recommendedCode}</h2>
                <div className="code-meta-chips">
                  <span className="meta-chip"><CheckCircle2 size={14} /> Evidence fit · 85.7%</span>
                  <span className="meta-chip"><Lock size={14} /> Native records retained</span>
                  <span className="meta-chip"><Network size={14} /> 2 CPSEs Consolidated · 1 Quarantined</span>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="decision-actions-panel">
                <div className="current-status-display">
                  <span className="status-label">Current Validation Status:</span>
                  <div className={`status-badge-lg ${currentStatus}`}>
                    {currentStatus === 'approved' && <><CheckCircle2 size={18} /> <strong>Approved by Master Data Officer</strong> (Ready to Publish)</>}
                    {currentStatus === 'rejected' && <><AlertTriangle size={18} /> <strong>Rejected / Clarification Requested</strong></>}
                    {currentStatus === 'pending' && <><Info size={18} /> <strong>Pending Expert Review</strong></>}
                  </div>
                </div>

                <div className="decision-buttons-row">
                  <button
                    className={`btn-decision approve ${currentStatus === 'approved' ? 'active' : ''}`}
                    disabled={isGuest}
                    title={isGuest ? 'Guest preview: approval is disabled' : undefined}
                    onClick={handleApprove}
                  >
                    <ShieldCheck size={18} />
                    <span>{currentStatus === 'approved' ? 'Mapping Approved' : 'Approve Mapping'}</span>
                  </button>

                  <button
                    className={`btn-decision reject ${currentStatus === 'rejected' ? 'active' : ''}`}
                    disabled={isGuest}
                    title={isGuest ? 'Guest preview: review decisions are disabled' : undefined}
                    onClick={handleReject}
                  >
                    <X size={18} />
                    <span>Reject / Request Clarification</span>
                  </button>

                  {currentStatus !== 'pending' && (
                    <button className="button outline compact" onClick={handleResetApproval}>
                      <RotateCcw size={14} /> Reset Status
                    </button>
                  )}
                </div>
              </div>

              {/* Audit Log Table */}
              <div className="audit-log-section">
                <h4>Approval History (controlled)</h4>
                <div className="audit-table-wrap">
                  <table className="audit-table">
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>Actor / Role</th>
                        <th>Action</th>
                        <th>Target Identity</th>
                        <th>controlled Audit Ref</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>2026-08-25 14:32:00 UTC</td>
                        <td>AI Compiler (v2.4)</td>
                        <td>Candidate Compiled</td>
                        <td><code>{currentCase.recommendedCode}</code></td>
                        <td><code>AUDIT-REF: workspace-8F4C-91B</code></td>
                      </tr>
                      {currentStatus === 'approved' && (
                        <tr className="audit-row-approved">
                          <td>2026-08-25 18:28:46 IST</td>
                          <td>Sr. Master Data Officer (CPCL/GeM)</td>
                          <td><strong>Expert Approval Granted</strong></td>
                          <td><code>{currentCase.recommendedCode}</code></td>
                          <td><code>AUDIT-REF: workspace-3A1E-67E</code></td>
                        </tr>
                      )}
                      {currentStatus === 'rejected' && (
                        <tr className="audit-row-rejected">
                          <td>2026-08-25 18:28:46 IST</td>
                          <td>Sr. Master Data Officer (CPCL/GeM)</td>
                          <td><strong>Clarification Requested</strong></td>
                          <td><code>{currentCase.recommendedCode}</code></td>
                          <td><code>AUDIT-REF: workspace-4B2F-81C</code></td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="step-navigation-footer">
              <button className="button outline" onClick={() => setCurrentStep('compare')}>
                <ArrowLeft size={16} /> Back to Compare
              </button>
              <button
                className="button primary"
                onClick={() => setCurrentStep('publish')}
                title={currentStatus !== 'approved' ? 'Preview Draft or Certified Passport' : ''}
              >
                {currentStatus === 'approved' ? 'Publish Material Passport' : 'View Draft Passport'} <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 5: PUBLISH VIEW */}
        {currentStep === 'publish' && (
          <motion.div
            key="publish-step"
            className="studio-step-content publish-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <MaterialPassport
              materialCase={currentCase}
              approvalStatus={currentStatus}
              onBackToStudio={() => setCurrentStep('govern')}
            />
          </motion.div>
        )}
      </div>

      {/* Supporting Modals */}
      <ScanModal
        isOpen={scanModalOpen}
        onClose={() => setScanModalOpen(false)}
        materialCase={currentCase}
        onScanSuccess={handleScanSuccess}
      />

      <EvidenceGraph
        isOpen={evidenceModalOpen}
        onClose={() => setEvidenceModalOpen(false)}
        materialCase={currentCase}
      />
    </section>
  )
}
