import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Layers, ArrowRight, ShieldCheck, Database, Lock, AlertTriangle,
  CheckCircle2, Sparkles, RefreshCw, FileSpreadsheet, SlidersHorizontal
} from 'lucide-react'
import { SANDBOX_SCENARIOS, type SandboxScenario } from '../data/materialCases'

export function MigrationSandbox() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('gate-valve')
  const scenario = SANDBOX_SCENARIOS.find(s => s.id === selectedScenarioId) || SANDBOX_SCENARIOS[0]

  return (
    <section id="migration-sandbox" className="migration-sandbox-section section-wrap">
      {/* Section Header */}
      <div className="section-heading">
        <div className="eyebrow-badge">
          <span className="badge-pulse" />
          <span className="eyebrow-text">Master Data workspace</span>
        </div>
        <h2>Migration Sandbox</h2>
        <p className="section-subtext">
          Preview a mapping before it reaches a master-data system. Run code resolution without replacing source records or disrupting an ERP schema.
        </p>
      </div>

      {/* Scenario Selector Tabs */}
      <div className="sandbox-scenario-switcher" role="tablist" aria-label="Select migration test case">
        {SANDBOX_SCENARIOS.map(sc => (
          <button
            key={sc.id}
            role="tab"
            aria-selected={selectedScenarioId === sc.id}
            className={`sandbox-tab-btn ${selectedScenarioId === sc.id ? 'active' : ''}`}
            onClick={() => setSelectedScenarioId(sc.id)}
          >
            <Layers size={16} />
            <span>{sc.title}</span>
          </button>
        ))}
      </div>
      <p className="sandbox-scenario-hint"><ArrowRight size={14} /> Select a scenario to compare its before and after state.</p>

      {/* Interactive Before / After Matrix */}
      <div className="sandbox-comparison-matrix">
        {/* LEFT: BEFORE (Legacy Siloed State) */}
        <div className="sandbox-column before-column">
          <div className="column-top-label">
            <span className="status-indicator-dot red" />
            <div>
              <h3>Legacy Disparate State (Before)</h3>
              <small>Fragmented CPSE ERP Silos & Inconsistent Naming</small>
            </div>
          </div>

          <div className="sandbox-cards-container">
            <div className="sandbox-box legacy-silo-box">
              <span className="box-section-lbl">Disparate Source Records</span>
              <div className="silo-records-list">
                {scenario.legacyCodes.map(rec => (
                  <div className="silo-item" key={rec.code}>
                    <div className="silo-org-row">
                      <span className="silo-org-badge">{rec.org}</span>
                      <span className="silo-erp-tag">{rec.erp}</span>
                    </div>
                    <code className="silo-code">{rec.code}</code>
                    <strong className="silo-desc">{rec.desc}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Unresolved Conflict Card */}
            <div className="sandbox-box conflict-silo-box">
              <div className="conflict-box-header">
                <AlertTriangle size={16} className="alert-icon" />
                <span className="box-section-lbl alert">Incompatible Variant (Risk Factor)</span>
              </div>
              <div className="conflict-item">
                <div className="silo-org-row">
                  <span className="silo-org-badge conflict">{scenario.quarantinedConflict.org}</span>
                  <code className="silo-code">{scenario.quarantinedConflict.code}</code>
                </div>
                <strong className="silo-desc">{scenario.quarantinedConflict.desc}</strong>
                <p className="conflict-reason-text">
                  ⚠️ <strong>Quarantine Rationale:</strong> {scenario.quarantinedConflict.reason}
                </p>
              </div>
            </div>
          </div>

          <div className="column-bottom-callout before">
            <small>⚠️ Duplicate procurement tenders, localized stock hoarding, zero cross-plant visibility.</small>
          </div>
        </div>

        {/* CENTER: RESOLUTION TRANSFORMATION ENGINE */}
        <div className="sandbox-engine-divider">
          <div className="engine-pulse-line" />
          <div className="engine-center-badge">
            <Sparkles size={20} />
            <span>KYNEX</span>
          </div>
          <div className="engine-pulse-line" />
        </div>

        {/* RIGHT: AFTER (Governed Federated Identity) */}
        <div className="sandbox-column after-column">
          <div className="column-top-label">
            <span className="status-indicator-dot green" />
            <div>
              <h3>Governed Common State (After)</h3>
              <small>Non-Destructive Mapping · Export Boundary</small>
            </div>
          </div>

          <div className="sandbox-cards-container">
            {/* Recommended Unified CNMC */}
            <div className="sandbox-box unified-cnmc-box">
              <span className="box-section-lbl success">Harmonized Common National Identity</span>
              <div className="cnmc-highlight-card">
                <span className="cnmc-pill-badge">Recommended Master Code</span>
                <h4 className="cnmc-code-title">{scenario.recommendedCNMC}</h4>
                <div className="cnmc-lineage-retained">
                  <CheckCircle2 size={15} />
                  <span><strong>{scenario.metrics.retainedCount} Legacy Codes Retained</strong> in native CPSE ERPs</span>
                </div>
              </div>
            </div>

            {/* Zero Overwrite Guarantee Card */}
            <div className="sandbox-box non-destructive-box">
              <div className="nd-header">
                <Lock size={16} />
                <span className="box-section-lbl">Non-Destructive Design Pattern</span>
              </div>
              <ul className="nd-points-list">
                <li>
                  <CheckCircle2 size={15} className="nd-check" />
                  <span><strong>No overwrite in this workspace:</strong> CPCL & SAIL retain native part numbers.</span>
                </li>
                <li>
                  <CheckCircle2 size={15} className="nd-check" />
                  <span><strong>Conflict Isolated:</strong> {scenario.quarantinedConflict.org} code quarantined from dangerous substitution.</span>
                </li>
                <li>
                  <CheckCircle2 size={15} className="nd-check" />
                  <span><strong>Shared stock discovery:</strong> Preserved mappings support authorized cross-CPSE inventory analysis.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Sandbox Metrics Strip */}
          <div className="sandbox-metrics-bar">
            <div className="s-metric">
              <small>Harmonization Ratio</small>
              <strong>{scenario.metrics.consolidatedRatio}</strong>
            </div>
            <div className="s-metric">
              <small>Integration Changes</small>
              <strong className="text-olive">export-only</strong>
            </div>
            <div className="s-metric">
              <small>Lineage Traceability</small>
              <strong className="text-brass">controlled</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
