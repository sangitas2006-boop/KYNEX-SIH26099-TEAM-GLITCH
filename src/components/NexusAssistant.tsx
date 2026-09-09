import { FormEvent, useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Bot, Send, ShieldCheck, Sparkles, X } from 'lucide-react'

type NexusContext = {
  title: string
  prompt: string
  suggestions: string[]
}

type NexusAnswer = {
  tag: string
  headline: string
  text: string
}

type KnowledgeItem = NexusAnswer & {
  keywords: string[]
  contexts?: string[]
}

const CONTEXTS: Record<string, NexusContext> = {
  'resolution-studio': {
    title: 'Resolution Studio',
    prompt: 'Ask about the evidence, candidate ranking, conflicts, or the next governed decision.',
    suggestions: ['Why was this candidate quarantined?', 'What evidence creates a match?', 'What happens after expert approval?'],
  },
  'migration-sandbox': {
    title: 'Migration Sandbox',
    prompt: 'Ask what changes, what stays untouched, and how a mapping reaches an enterprise system.',
    suggestions: ['What changes in the migration preview?', 'Are legacy codes deleted?', 'How can this be rolled back?'],
  },
  governance: {
    title: 'Governance & Safety',
    prompt: 'Ask about technical guardrails, accountable roles, auditability, or privacy boundaries.',
    suggestions: ['Can AI publish a match by itself?', 'What blocks an unsafe merge?', 'What is recorded in the audit trail?'],
  },
  impact: {
    title: 'About KYNEX',
    prompt: 'Ask about the problem, evidence, readiness, deployment, or the limits of the current prototype.',
    suggestions: ['What problem does KYNEX solve?', 'Is this production-ready?', 'What does the current benchmark prove?'],
  },
  default: {
    title: 'Material Intelligence Guide',
    prompt: 'Ask a question about KYNEX and I will answer from the verified product and evaluation context.',
    suggestions: ['What does KYNEX actually do?', 'How does the Conflict Firewall work?', 'What evidence is still missing?'],
  },
}

const KNOWLEDGE: KnowledgeItem[] = [
  {
    tag: 'Product purpose',
    headline: 'KYNEX is a governed identity layer',
    text: 'KYNEX reconciles inconsistent material descriptions and codes across CPSE catalogues. It preserves each native record, builds a typed technical fingerprint, proposes candidates, blocks unsafe similarities, and sends uncertain cases to an accountable expert instead of silently changing an ERP record.',
    keywords: ['what does kynex do', 'what is kynex', 'problem', 'solve', 'purpose', 'identity layer', 'material codes'],
  },
  {
    tag: 'Resolution workflow',
    headline: 'The workflow separates discovery from publication',
    text: 'A source record is ingested with its lineage, normalized into typed attributes, compared against candidates, checked by the Conflict Firewall, and then either proposed, quarantined, or abstained. Only an authorized material expert can publish the governed identity.',
    keywords: ['workflow', 'how does it work', 'process', 'steps', 'resolve', 'candidate', 'publish', 'decision'],
    contexts: ['resolution-studio', 'governance'],
  },
  {
    tag: 'Safety rule',
    headline: 'Critical technical disagreement blocks automatic merging',
    text: 'A high text similarity is not enough. Differences in pressure class, material, nominal diameter, or item type can make a substitution unsafe. For example, a PN25 candidate is quarantined rather than merged with a PN16 identity until an expert reviews the evidence.',
    keywords: ['conflict', 'quarantine', 'unsafe', 'pressure', 'pn16', 'pn25', 'block', 'firewall', 'safety'],
    contexts: ['resolution-studio', 'governance'],
  },
  {
    tag: 'Evidence model',
    headline: 'A match is supported by multiple evidence signals',
    text: 'KYNEX combines lexical overlap, typed technical attributes, taxonomy alignment, unit agreement, and source lineage. The score proposes a candidate, but deterministic critical-field rules can veto it. Confidence is not treated as permission to publish.',
    keywords: ['evidence', 'match', 'score', 'confidence', 'technical', 'taxonomy', 'unit', 'lineage', 'fingerprint'],
    contexts: ['resolution-studio'],
  },
  {
    tag: 'Governed identity',
    headline: 'The common code is proposed, then reviewed',
    text: 'KYNEX normalizes the verified material family and technical attributes to propose a readable common identity. The result keeps the original CPSE codes and aliases linked to the mapping, along with the reviewer, decision status, evidence, and mapping version.',
    keywords: ['common code', 'common identity', 'cnmc', 'created', 'alias', 'traceable', 'original code'],
  },
  {
    tag: 'Migration boundary',
    headline: 'Migration preview is non-destructive',
    text: 'The sandbox previews harmonized identities, retained aliases, quarantined conflicts, and export contents before any governed mapping leaves the workspace. Native ERP records are not overwritten by this prototype, and a production integration would require an explicit authorized export boundary.',
    keywords: ['migration', 'sandbox', 'export', 'overwrite', 'delete', 'legacy code', 'rollback', 'change'],
    contexts: ['migration-sandbox'],
  },
  {
    tag: 'Human control',
    headline: 'AI recommends; material experts decide',
    text: 'The assistant and matching engine can explain evidence and recommend candidates, but they do not have authority to publish a critical identity. Review actions are role-gated, audit logged, and designed to keep technical accountability with an authorized material-master officer.',
    keywords: ['ai publish', 'ai decide', 'expert', 'human', 'approval', 'role', 'review', 'accountable', 'who decides'],
    contexts: ['governance', 'resolution-studio'],
  },
  {
    tag: 'Audit trail',
    headline: 'The decision remains explainable after publication',
    text: 'The governed record can retain the request, source lineage, normalized attributes, candidate evidence, reviewer identity and role, timestamp, model or rule revision, decision, and the Conflict Firewall rule that caused quarantine. This creates a defensible path from source record to approved mapping.',
    keywords: ['audit', 'audit trail', 'recorded', 'traceability', 'timestamp', 'reviewer', 'history'],
    contexts: ['governance'],
  },
  {
    tag: 'Privacy boundary',
    headline: 'Commercial history stays inside the source environment',
    text: 'The connected architecture is designed to exchange only the technical attributes needed for comparison—such as type, metallurgy, dimensions, pressure rating, and standards. Purchase prices, supplier vendor codes, contracts, and tender terms remain in their native ERP or controlled source environment.',
    keywords: ['privacy', 'private', 'commercial', 'price', 'supplier', 'contract', 'vendor', 'zero knowledge', 'hash', 'data leave'],
  },
  {
    tag: 'Evaluation evidence',
    headline: 'The current benchmark is useful but intentionally small',
    text: 'The labelled development set has 11 rows: 7 identity-labelled rows and 4 safety cases. It reports 85.7% accuracy on eligible identity rows, 100% top-3 recall, 100% abstention capture, and 0% unseen-entity accuracy. These are development measurements, not CPSE-wide performance claims; the unseen-entity result is an explicit generalization gap.',
    keywords: ['benchmark', 'evaluation', 'accuracy', '85.7', 'top 3', 'recall', 'abstention', 'unseen', '0%', 'results', 'prove'],
    contexts: ['impact'],
  },
  {
    tag: 'Readiness',
    headline: 'The application is executable, but pilot validation remains',
    text: 'The current implementation supports CSV or ERP-export ingestion, SQLite persistence, benchmark execution, review queues, audit events, evidence context, and export boundaries. A real CPSE deployment still needs authorized data, reviewer-adjudicated labels, authentication, security controls, managed persistence, and pilot measurement.',
    keywords: ['production ready', 'production', 'ready', 'deployment', 'pilot', 'real', 'authorized data', 'integration', 'live sap', 'live erp'],
    contexts: ['impact', 'migration-sandbox'],
  },
  {
    tag: 'QR and field use',
    headline: 'QR intake anchors a record; it does not prove equivalence',
    text: 'A QR code or barcode can retrieve a legacy material record or an approved passport in a field workflow. Scanning identifies the record to inspect; technical equivalence still depends on the fingerprint, evidence checks, conflict rules, and expert governance.',
    keywords: ['qr', 'barcode', 'scan', 'field', 'passport', 'retrieve'],
  },
  {
    tag: 'Impact measurement',
    headline: 'Impact must be measured in an authorized pilot',
    text: 'The report defines future pilot measures such as search time, mapping coverage, duplicate prevention, review time, completeness, drift, false merges, unsafe similarities, abstentions, and reviewer overrides. External inventory-reduction figures are scenario hypotheses, not KYNEX outcomes.',
    keywords: ['impact', 'savings', 'economic', 'inventory', 'kpi', 'measure', 'reduction', 'outcome'],
    contexts: ['impact'],
  },
  {
    tag: 'Guide capability',
    headline: 'I can explain the verified KYNEX workflow',
    text: 'Try asking me about matching, technical conflicts, evidence, migration, privacy, governance, evaluation results, pilot readiness, QR intake, or what remains unproven. I will say when a question goes beyond the current evidence instead of inventing a claim.',
    keywords: ['hello', 'hi', 'help', 'what can you', 'ask', 'guide'],
  },
]

function answerQuestion(query: string, contextKey: string): NexusAnswer {
  const normalized = query.toLowerCase().replace(/[^a-z0-9% ]/g, ' ').replace(/\s+/g, ' ').trim()
  const context = CONTEXTS[contextKey] || CONTEXTS.default
  let best: { item: KnowledgeItem; keywordScore: number; score: number } | null = null

  for (const item of KNOWLEDGE) {
    const keywordScore = item.keywords.reduce((score, keyword) => score + (normalized.includes(keyword) ? (keyword.includes(' ') ? 3 : 1) : 0), 0)
    // Context may refine a relevant question, but it can never create a match by itself.
    const contextScore = keywordScore > 0 && item.contexts?.includes(contextKey) ? 2 : 0
    const score = keywordScore + contextScore
    if (!best || score > best.score) best = { item, keywordScore, score }
  }

  if (best && best.keywordScore > 0) {
    return { tag: best.item.tag, headline: best.item.headline, text: best.item.text }
  }

  return {
    tag: 'Not supported',
    headline: 'Sorry, I don’t know that.',
    text: 'I am made to answer questions about KYNEX material matching, evidence, safety, governance, privacy, migration, evaluation, and pilot readiness. Please ask me about one of those topics.',
  }
}

export function NexusAssistant() {
  const [isVisible, setIsVisible] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [contextKey, setContextKey] = useState('default')
  const [question, setQuestion] = useState('')
  const [askedQuestion, setAskedQuestion] = useState<string | null>(null)
  const [answer, setAnswer] = useState<NexusAnswer | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const sectionIds = ['resolution-studio', 'migration-sandbox', 'how-it-works', 'governance', 'impact']
    const onScroll = () => {
      const showAfter = Math.max(260, window.innerHeight * 0.38)
      setIsVisible(window.scrollY > showAfter)

      const viewportProbe = window.scrollY + window.innerHeight * 0.44
      let nextContext = 'default'
      for (const id of sectionIds) {
        const section = document.getElementById(id)
        if (section && viewportProbe >= section.offsetTop && viewportProbe < section.offsetTop + section.offsetHeight) {
          nextContext = CONTEXTS[id] ? id : 'default'
          break
        }
      }
      setContextKey(nextContext)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  useEffect(() => {
    setAskedQuestion(null)
    setAnswer(null)
    setQuestion('')
  }, [contextKey])

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        triggerRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    panelRef.current?.focus()
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen])

  const context = CONTEXTS[contextKey] || CONTEXTS.default
  const closePanel = () => {
    setIsOpen(false)
    triggerRef.current?.focus()
  }

  const askQuestion = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return
    setAskedQuestion(trimmed)
    setAnswer(answerQuestion(trimmed, contextKey))
    setQuestion('')
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    askQuestion(question)
  }

  return (
    <aside className={`nexus-assistant ${isVisible ? 'is-visible' : ''}`} aria-label="NEXUS Material Intelligence Guide">
      {isOpen && (
        <div id="nexus-guide-panel" className="nexus-panel" ref={panelRef} tabIndex={-1} role="dialog" aria-modal="false" aria-labelledby="nexus-title">
          <div className="nexus-panel-head">
            <div className="nexus-identity">
              <span className="nexus-mini-mark"><Sparkles size={14} /></span>
              <div>
                <strong id="nexus-title">NEXUS</strong>
                <span>Grounded material intelligence</span>
              </div>
            </div>
            <button className="nexus-close" onClick={closePanel} aria-label="Close NEXUS guide"><X size={17} /></button>
          </div>

          <div className="nexus-context">
            <span><ShieldCheck size={13} /> Context-aware connected guide</span>
            <h3>{context.title}</h3>
            <p>{context.prompt}</p>
          </div>

          <div className="nexus-conversation" aria-live="polite">
            {answer && askedQuestion ? (
              <div className="nexus-answer-stack">
                <p className="nexus-user-question">{askedQuestion}</p>
                <div className="nexus-answer-card">
                  <span className="nexus-answer-tag">{answer.tag}</span>
                  <strong>{answer.headline}</strong>
                  <p className="nexus-answer">{answer.text}</p>
                </div>
              </div>
            ) : (
              <div className="nexus-welcome">
                <span className="nexus-welcome-mark"><Bot size={15} /></span>
                <div><strong>Ask me about this workflow</strong><p>Use your own words. I answer from the verified KYNEX product and evaluation context.</p></div>
              </div>
            )}
          </div>

          <form className="nexus-ask-form" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              value={question}
              onChange={event => setQuestion(event.target.value)}
              placeholder="Ask a question…"
              aria-label="Ask NEXUS a question"
            />
            <button type="submit" disabled={!question.trim()} aria-label="Ask NEXUS"><Send size={15} /></button>
          </form>

          <div className="nexus-suggestions" aria-label="Suggested questions">
            <div className="nexus-suggestions-label">Try asking</div>
            {context.suggestions.map(suggestion => (
              <button key={suggestion} onClick={() => askQuestion(suggestion)}>
                <span>{suggestion}</span><ArrowUpRight size={14} />
              </button>
            ))}
          </div>

          <p className="nexus-integrity-note"><ShieldCheck size={12} /> Grounded in controlled material-resolution scenarios; unsupported claims are flagged instead of fabricated.</p>
        </div>
      )}

      <div className="nexus-launch-wrap">
        <span className="nexus-tooltip">Ask NEXUS about this workflow</span>
        <button
          ref={triggerRef}
          className="nexus-orb-button"
          onClick={() => setIsOpen(open => !open)}
          aria-expanded={isOpen}
          aria-controls="nexus-guide-panel"
          aria-label="Open NEXUS Material Intelligence Guide"
        >
          <span className="nexus-orbit orbit-a" />
          <span className="nexus-orbit orbit-b" />
          <span className="nexus-core"><Bot size={21} strokeWidth={1.8} /></span>
          <span className="nexus-scan-line" />
        </button>
        <span className="nexus-name">NEXUS</span>
      </div>
    </aside>
  )
}
