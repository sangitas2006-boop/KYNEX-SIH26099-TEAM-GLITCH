import { motion, useReducedMotion } from 'framer-motion'
import { Activity, CheckCircle2, Database, ShieldAlert, ShieldCheck, TrendingUp } from 'lucide-react'

const benchmarkMetrics = [
  { label: 'Top-3 recall', value: 100, display: '100%', detail: 'Expected item found in top three', tone: 'blue' },
  { label: 'Abstention capture', value: 100, display: '100%', detail: '2 / 2 labelled abstention cases', tone: 'brass' },
  { label: 'Accuracy', value: 85.7, display: '85.7%', detail: '6 / 7 identity-labelled rows', tone: 'olive' },
  { label: 'Unseen-entity accuracy', value: 0, display: '0%', detail: 'Generalization gap · single eligible row', tone: 'copper', caveat: true },
] as const

export function CredibilityEvidencePanel() {
  const reduceMotion = useReducedMotion()

  return (
    <section className="credibility-evidence-panel" aria-labelledby="credibility-heading">
      <div className="credibility-panel-header">
        <div>
          <span className="eyebrow-badge"><span className="badge-pulse" /><span className="eyebrow-text">Operational evidence</span></span>
          <h3 id="credibility-heading">Credibility is measurable, not decorative.</h3>
          <p>KYNEX makes technical decisions inspectable through visible controls, evidence trails, and accountable reviewer outcomes.</p>
        </div>
        <div className="credibility-source-stamp">
          <span><i className="telemetry-dot" /> EVIDENCE MODE</span>
          <strong>WORKSPACE GV-04182</strong>
          <small>Evidence workspace</small>
        </div>
      </div>

      <div className="credibility-kpi-grid" aria-label="KYNEX credibility indicators">
        <article className="credibility-kpi-card accent-blue">
          <div className="credibility-kpi-top"><span>Evidence dimensions</span><Database size={16} /></div>
          <strong>5/5</strong>
          <span>Lexical · technical · taxonomy · unit · lineage</span>
          <div className="kpi-sparkline"><i style={{ width: '100%' }} /></div>
        </article>
        <article className="credibility-kpi-card accent-olive">
          <div className="credibility-kpi-top"><span>Reviewable candidates</span><CheckCircle2 size={16} /></div>
          <strong>2 of 3</strong>
          <span>Routed to expert review</span>
          <div className="kpi-sparkline"><i style={{ width: '67%' }} /></div>
        </article>
        <article className="credibility-kpi-card accent-copper">
          <div className="credibility-kpi-top"><span>Safety blockers</span><ShieldAlert size={16} /></div>
          <strong>1 isolated</strong>
          <span>PN25 versus PN16 conflict quarantined</span>
          <div className="kpi-sparkline"><i style={{ width: '34%' }} /></div>
        </article>
        <article className="credibility-kpi-card accent-brass">
          <div className="credibility-kpi-top"><span>ERP overwrite path</span><ShieldCheck size={16} /></div>
          <strong>0</strong>
          <span>Native identifiers remain preserved</span>
          <div className="kpi-sparkline"><i style={{ width: '100%' }} /></div>
        </article>
      </div>

      <div className="credibility-chart-grid">
        <article className="credibility-chart-card coverage-chart-card">
          <div className="chart-card-header">
            <div><span className="chart-kicker"><Activity size={13} /> benchmark evidence</span><h4>Measured signals from the development set</h4></div>
            <span className="chart-caption">Report · 11 rows</span>
          </div>
          <div className="benchmark-chart" role="img" aria-label="Development benchmark results: 85.7 percent accuracy, 100 percent top-3 recall, 100 percent abstention capture, and 0 percent unseen-entity accuracy">
            <div className="benchmark-scale" aria-hidden="true"><span>0%</span><span>50%</span><span>100%</span></div>
            <div className="benchmark-bars">
              {benchmarkMetrics.map((metric, index) => (
                <div className={`benchmark-metric ${metric.tone}${'caveat' in metric && metric.caveat ? ' has-caveat' : ''}`} key={metric.label}>
                  <div className="benchmark-metric-heading"><span>{metric.label}</span><strong>{metric.display}</strong></div>
                  <div className="benchmark-track"><motion.i
                    initial={reduceMotion ? false : { scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: .7, delay: index * .08, ease: 'easeOut' }}
                    style={{ width: `${metric.value}%` }}
                  /></div>
                  <small>{metric.detail}{'caveat' in metric && metric.caveat && <em className="benchmark-caveat-pill">0 / 1 eligible row</em>}</small>
                </div>
              ))}
            </div>
          </div>
          <p className="chart-footnote"><strong className="chart-footnote-strong">Small-sample development set — 11 rows total, the unseen-entity figure rests on a single eligible row (0 / 1).</strong> These are development measurements, not CPSE-wide outcomes, and the unseen-entity result is an explicit generalization gap.</p>
        </article>

        <article className="credibility-chart-card routing-chart-card">
          <div className="chart-card-header">
            <div><span className="chart-kicker"><TrendingUp size={13} /> review routing</span><h4>Every outcome has a visible route</h4></div>
            <span className="chart-caption">Current resolution set</span>
          </div>
          <div className="routing-bars">
            <div className="routing-row"><div><span>Reviewable</span><b>2</b></div><div className="routing-track"><i className="olive" style={{ width: '67%' }} /></div></div>
            <div className="routing-row"><div><span>Quarantined</span><b>1</b></div><div className="routing-track"><i className="copper" style={{ width: '34%' }} /></div></div>
            <div className="routing-row"><div><span>Abstained</span><b>0</b></div><div className="routing-track"><i className="blue" style={{ width: '8%' }} /></div></div>
          </div>
          <div className="routing-summary"><ShieldCheck size={15} /><span>Rule gate active</span><strong>no silent merge</strong></div>
          <p className="chart-footnote">Every outcome is routed by evidence and governed review—not by an opaque similarity score.</p>
        </article>
      </div>

      <div className="credibility-control-strip">
        <span className="control-strip-label">Product controls</span>
        <span><CheckCircle2 size={14} /> Source lineage retained</span>
        <span><CheckCircle2 size={14} /> Conflicts quarantined</span>
        <span><CheckCircle2 size={14} /> Expert sign-off required</span>
        <span><CheckCircle2 size={14} /> Export-only boundary</span>
      </div>
    </section>
  )
}
