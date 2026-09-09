import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, ChevronRight, Loader2, RefreshCw, ShieldAlert, Sparkles, XCircle } from 'lucide-react'
import { MATERIAL_CASES } from '../data/materialCases'
import { authFetch } from '../auth/authFetch'
import { useAuth } from '../auth/AuthProvider'

type Resolution = {
  requestId: string
  status: string
  decision: string
  fingerprint: { rawDescription: string; category: string | null; type: string | null; material: string | null; nominalDiameterMm: number | null; pressureClass: string | null; connection: string | null; uom: string | null; extractionConfidence: number; normalizationNotes: string[] }
  recommendation: { commonCode: string; matchedRecord: string; confidence: number; mlConfidence?: number; margin: number; rationale: string[] }
  outcome: { classKey: string; label: string; risk: string; nextAction: string; explanation: string; approvedSubstitution: boolean }
  risk: { score: number; level: string; criticalAttributes: string[]; missingAttributes: string[] }
  standards: { category: string; references: string[]; status: string; note: string }
  candidates: Array<{ id: string; org: string; code: string; description: string; commonCode: string; composite: number; lexical: number; attributeScore: number; conflicts: Array<{ field: string; query: unknown; candidate: unknown }>; relationship: string }>
  controls: { conflictFirewall: string; abstention: string; autoPublish: boolean; legacyOverwrite: boolean; expertApprovalRequired: boolean }
  evidence: { lexical: number; attribute: number; taxonomy: number; unit: number; margin: number; reasons: string[]; sourceLineage?: string }
}

const sampleDescription = 'SS GATE VALVE 2 IN PN16 FLG'
const api = (path: string) => path

function buildStaticDemoResolution(org: string, rawDescription: string): Resolution {
  const materialCase = MATERIAL_CASES['gate-valve']
  const candidates = materialCase.candidates.map((candidate) => ({
    id: candidate.id,
    org: candidate.org,
    code: candidate.code,
    description: candidate.name,
    commonCode: materialCase.recommendedCode,
    composite: candidate.concordance.composite,
    lexical: candidate.concordance.lexical,
    attributeScore: candidate.concordance.technicalAttributes,
    conflicts: candidate.isConflict ? [{ field: 'pressureClass', query: 'PN16', candidate: 'PN25' }] : [],
    relationship: candidate.relationship,
  }))
  const bestCandidate = candidates.find((candidate) => candidate.org !== org && candidate.conflicts.length === 0) || candidates[0]

  return {
    requestId: 'DEMO-STATIC-001',
    status: 'review_required',
    decision: 'candidate_review',
    fingerprint: {
      rawDescription,
      category: materialCase.fingerprint.category,
      type: materialCase.fingerprint.type,
      material: materialCase.fingerprint.material,
      nominalDiameterMm: 50,
      pressureClass: materialCase.fingerprint.pressureClass,
      connection: materialCase.fingerprint.endConnection,
      uom: materialCase.fingerprint.uom,
      extractionConfidence: materialCase.evidence.compositeScore,
      normalizationNotes: ['2 IN normalized to DN50 / 50 mm nominal size.', 'Static demo fixture; no source system was changed.'],
    },
    recommendation: {
      commonCode: materialCase.recommendedCode,
      matchedRecord: bestCandidate?.code || materialCase.intakeSample.code,
      confidence: materialCase.evidence.compositeScore,
      mlConfidence: materialCase.evidence.compositeScore,
      margin: 2.2,
      rationale: materialCase.evidence.reasons,
    },
    outcome: {
      classKey: 'identity_match',
      label: 'Reviewable candidate',
      risk: 'medium',
      nextAction: 'expert_review',
      explanation: 'Evidence supports a governed identity link, while the PN25 conflict remains quarantined.',
      approvedSubstitution: false,
    },
    risk: {
      score: 34,
      level: 'medium',
      criticalAttributes: ['pressureClass'],
      missingAttributes: [],
    },
    standards: {
      category: materialCase.category,
      references: [materialCase.fingerprint.standardClue, 'ASME B16.5', 'EN 1092-1'],
      status: 'reference_context',
      note: 'Static fixture for judge walkthrough; connect the API for persisted decisions.',
    },
    candidates,
    controls: {
      conflictFirewall: 'TRIGGERED',
      abstention: 'CLEAR',
      autoPublish: false,
      legacyOverwrite: false,
      expertApprovalRequired: true,
    },
    evidence: {
      lexical: materialCase.evidence.lexicalScore,
      attribute: materialCase.evidence.attributeScore,
      taxonomy: materialCase.evidence.taxonomyScore,
      unit: materialCase.evidence.unitScore,
      margin: 82,
      reasons: materialCase.evidence.reasons,
      sourceLineage: 'Static governed fixture · lineage retained',
    },
  }
}

export function LiveEnginePanel() {
  const { isGuest } = useAuth()
  const [description, setDescription] = useState(sampleDescription)
  const [org, setOrg] = useState('CPCL')
  const [resolution, setResolution] = useState<Resolution | null>(null)
  const [loading, setLoading] = useState(false)
  const [apiState, setApiState] = useState<'unknown' | 'online' | 'offline'>('unknown')
  const [decisionMessage, setDecisionMessage] = useState('')

  useEffect(() => {
    void checkHealth()
  }, [])

  const checkHealth = async () => {
    try {
      const response = await authFetch(api('/api/health'))
      const contentType = response.headers.get('content-type') || ''
      if (!response.ok || !contentType.includes('application/json')) throw new Error('JSON API unavailable')
      setApiState('online')
    } catch { setApiState('offline') }
  }

  const runResolution = async () => {
    setLoading(true); setDecisionMessage('')
    try {
      const response = await authFetch(api('/api/resolve'), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ org, rawDescription: description }) })
      if (!response.ok) throw new Error('Resolution API unavailable')
      setResolution(await response.json()); setApiState('online')
    } catch { setApiState('offline'); setResolution(buildStaticDemoResolution(org, description)); setDecisionMessage('Static demo mode: the API is offline, so this governed fixture is shown locally. No source system was changed.') } finally { setLoading(false) }
  }

  const recordDecision = async (action: 'approve' | 'approve_substitution' | 'reject' | 'request_clarification') => {
    if (isGuest) {
      setDecisionMessage('Guest preview mode: decisions are visible but publishing and external writes are disabled.')
      return
    }
    if (!resolution) return
    try {
      const response = await authFetch(api('/api/decisions'), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ requestId: resolution.requestId, action, role: 'material_master_officer', actor: 'workspace-material-master-expert', commonCode: resolution.recommendation.commonCode }) })
      if (!response.ok) throw new Error()
      setDecisionMessage(`Expert decision recorded: ${action.replace('_', ' ')}. Legacy records remain untouched.`)
    } catch { setDecisionMessage('Could not record the decision. Check that the API is running.') }
  }

  return (
    <div className="live-engine-panel">
      <div className="live-engine-head">
        <div>
          <span className="step-tag"><Sparkles size={13} /> Live Resolution Engine</span>
          <h3>Run governed material identity resolution</h3>
          <p>KYNEX extracts a technical fingerprint, separates identity from interchangeability, isolates unsafe similarity, and routes every uncertain decision to accountable review.</p>
        </div>
        <div className={`engine-status ${apiState}`}><span />{apiState === 'online' ? 'API online' : apiState === 'offline' ? 'API offline' : 'API not checked'}</div>
      </div>

      <div className="engine-input-grid">
        <label><span>Originating CPSE</span><input value={org} onChange={(e) => setOrg(e.target.value.toUpperCase())} /></label>
        <label className="engine-description"><span>Raw material description</span><input value={description} onChange={(e) => setDescription(e.target.value)} /></label>
        <button className="button primary" onClick={runResolution} disabled={loading}>{loading ? <Loader2 className="spin" size={16} /> : <ChevronRight size={16} />} {loading ? 'Resolving…' : 'Resolve material'}</button>
      </div>
      <div className="engine-actions"><button className="text-button" onClick={checkHealth}><RefreshCw size={13} /> Check API health</button><span>Local connected · controlled records · export-only ERP boundary</span></div>

      {decisionMessage && <div className="engine-decision-note"><ShieldAlert size={15} />{decisionMessage}</div>}

      {resolution && (
        <div className="engine-result-grid">
          <div className="engine-result-main">
            <div className="result-title-row"><div><span className="result-kicker">{resolution.requestId} · governed decision</span><h4>{resolution.recommendation.commonCode}</h4></div><span className={`decision-pill ${resolution.outcome.classKey}`}>{resolution.outcome.label}</span></div><div className={`outcome-banner ${resolution.outcome.risk}`}><div><strong>{resolution.outcome.explanation}</strong><span>Decision boundary: {resolution.outcome.nextAction.replaceAll('_', ' ')}</span></div><b>Risk {resolution.risk.score}/100</b></div>
            <div className="fingerprint-mini-grid">{[['Category', resolution.fingerprint.category], ['Type', resolution.fingerprint.type], ['Material', resolution.fingerprint.material], ['Diameter', resolution.fingerprint.nominalDiameterMm ? `${resolution.fingerprint.nominalDiameterMm} mm` : 'Missing'], ['Pressure', resolution.fingerprint.pressureClass || 'Missing'], ['Connection', resolution.fingerprint.connection || 'Missing']].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
            <div className="engine-reasons"><strong>Why this result?</strong>{resolution.recommendation.rationale.map((reason) => <p key={reason}><ChevronRight size={13} />{reason}</p>)}</div>
            <div className="engine-decision-actions"><button className="button primary compact" disabled={isGuest} title={isGuest ? 'Guest preview: publishing is disabled' : undefined} onClick={() => recordDecision('approve')}><CheckCircle2 size={14} /> Approve identity link</button>{resolution.outcome.classKey === 'functional_equivalence' && <button className="button copper compact" disabled={isGuest} title={isGuest ? 'Guest preview: publishing is disabled' : undefined} onClick={() => recordDecision('approve_substitution')}><CheckCircle2 size={14} /> Approve substitution</button>}<button className="button outline compact" disabled={isGuest} title={isGuest ? 'Guest preview: publishing is disabled' : undefined} onClick={() => recordDecision('request_clarification')}><AlertTriangle size={14} /> Request clarification</button><button className="button danger compact" disabled={isGuest} title={isGuest ? 'Guest preview: publishing is disabled' : undefined} onClick={() => recordDecision('reject')}><XCircle size={14} /> Reject / quarantine</button></div>
          </div>
          <div className="engine-side-column">
            <div className="control-card"><h5>Safety controls</h5><div><span>Conflict firewall</span><b className={resolution.controls.conflictFirewall === 'TRIGGERED' ? 'triggered' : 'clear'}>{resolution.controls.conflictFirewall}</b></div><div><span>Abstention gate</span><b className={resolution.controls.abstention === 'TRIGGERED' ? 'triggered' : 'clear'}>{resolution.controls.abstention}</b></div><div><span>Auto-publish</span><b className="clear">DISABLED</b></div><div><span>Legacy overwrite</span><b className="clear">DISABLED</b></div></div>
            <div className="score-card"><h5>Evidence scores</h5><Score label="Lexical" value={resolution.evidence.lexical} /><Score label="Typed attributes" value={resolution.evidence.attribute} /><Score label="Taxonomy" value={resolution.evidence.taxonomy} /><Score label="Candidate margin" value={resolution.evidence.margin} /></div><div className="standards-card"><h5>Standards context</h5><strong>{resolution.standards.category}</strong><span>{resolution.standards.references.length ? resolution.standards.references.join(' · ') : 'No reference family detected'}</span><small>{resolution.standards.note}</small><em>{resolution.evidence.sourceLineage}</em></div>
          </div>
          <div className="candidate-table-wrap"><h5>Candidate evidence matrix</h5><div className="candidate-table">{resolution.candidates.map((candidate) => <div className="candidate-row" key={candidate.id}><div><strong>{candidate.org} · {candidate.code}</strong><span>{candidate.description}</span></div><b>{candidate.composite}%</b><span className={candidate.conflicts.length ? 'conflict-text' : 'match-text'}>{candidate.conflicts.length ? `${candidate.conflicts.length} conflict${candidate.conflicts.length > 1 ? 's' : ''}` : candidate.relationship}</span></div>)}</div></div>
        </div>
      )}
    </div>
  )
}

function Score({ label, value }: { label: string; value: number }) { return <div className="score-line"><span>{label}</span><div><i style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div><b>{value}%</b></div> }
