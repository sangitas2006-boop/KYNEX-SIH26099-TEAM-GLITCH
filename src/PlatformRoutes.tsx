import type { ReactNode } from 'react'
import { ArrowRight, CheckCircle2, Database, ExternalLink, FileCheck2, Lock, Network, ShieldAlert, ShieldCheck } from 'lucide-react'
import { MigrationSandbox } from './components/MigrationSandbox'
import { OperationsConsole } from './components/OperationsConsole'
import { ResolutionStudio } from './components/ResolutionStudio'
import { useAuth } from './auth/AuthProvider'

export type PlatformRoute = 'resolve' | 'review' | 'migration' | 'governance' | 'evidence'

const navItems: Array<{ href: string; label: string }> = [
  { href: '#/', label: 'Home' },
  { href: '#/resolve', label: 'Resolve' },
  { href: '#/review', label: 'Review queue' },
  { href: '#/migration', label: 'Migration' },
  { href: '#/governance', label: 'Governance' },
  { href: '#/evidence', label: 'Evidence' },
]

function PlatformHeader() {
  const { isGuest, user, signOut } = useAuth()
  return (
    <header className="platform-header">
      <a className="platform-brand" href="#/" aria-label="KYNEX home">
        <span className="platform-brand-mark"><img src="/kynex-logo.png" alt="" /></span>
        <span><strong>KYNEX</strong><small>Material identity platform</small></span>
      </a>
      <nav className="platform-nav" aria-label="KYNEX platform navigation">
        {navItems.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
      </nav>
      <div className="auth-session-controls">
        <span className="auth-session-label">{isGuest ? 'Guest demo' : user?.email || 'Signed in'}</span>
        <button className="button outline compact" onClick={() => { void signOut() }}>Sign out</button>
      </div>
      <a className="button primary compact" href="#/resolve">Open workspace <ArrowRight size={14} /></a>
    </header>
  )
}

function PlatformFooter() {
  return (
    <footer className="platform-footer">
      <div className="platform-footer-brand"><img src="/kynex-logo.png" alt="" /><span><strong>KYNEX</strong><small>Reviewable material identity resolution.</small></span></div>
      <div className="platform-footer-links"><a href="#/governance">Governance</a><a href="#/evidence">Evidence</a><a href="https://www.sih.gov.in/sih2023-grand-finale-result" target="_blank" rel="noreferrer">SIH context <ExternalLink size={11} /></a></div>
    </footer>
  )
}

function RouteIntro({ eyebrow, title, description, status }: { eyebrow: string; title: string; description: string; status?: string }) {
  return <div className="route-intro"><div><span className="route-eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{status && <span className="route-status"><i />{status}</span>}</div>
}

function GovernancePage() {
  const controls = [
    ['Conflict check', 'Stops an automatic merge when critical technical attributes disagree.', ShieldAlert],
    ['Expert approval', 'Only an authorized material expert can publish the final mapping.', CheckCircle2],
    ['Source records stay intact', 'Native codes and aliases remain attached throughout the workflow.', Lock],
    ['Decision history', 'The recommendation, reviewer, decision, and mapping version remain traceable.', FileCheck2],
  ] as const
  return <>
    <RouteIntro eyebrow="Governance controls" title="Keep responsibility with the decision." description="KYNEX separates candidate discovery from publication. It does not silently merge, overwrite, or publish a match when critical technical attributes disagree." status="Review before publish" />
    <section className="route-panel governance-route-grid">
      <div className="route-panel-copy"><span className="route-kicker">The KYNEX safety boundary</span><h2>Show the reasoning before anything is published.</h2><p>Material identity is not determined by wording alone. Pressure class, metallurgy, dimensions, standards, and source context can change whether a match is safe.</p><a className="button primary compact" href="#/resolve">Review a material <ArrowRight size={14} /></a></div>
      <div className="route-control-list">{controls.map(([title, text, Icon]) => <article key={title}><span className="route-control-icon"><Icon size={17} /></span><div><strong>{title}</strong><p>{text}</p></div></article>)}</div>
    </section>
    <section className="route-panel route-timeline"><div><span className="route-kicker">Decision lifecycle</span><h2>Make responsibility visible.</h2></div><div className="timeline-row"><span>01</span><b>Imported</b><small>Source record and lineage anchored</small><span>02</span><b>Compared</b><small>Typed attributes and candidates evaluated</small><span>03</span><b>Reviewed</b><small>Conflict or low-margin case routed to an expert</small><span>04</span><b>Published</b><small>Approved identity exported without source overwrite</small></div></section>
  </>
}

function EvidencePage() {
  return <>
    <RouteIntro eyebrow="Evidence and method" title="Inspect how each decision is supported." description="See what is implemented in the development fixture, what the backend records, and what still requires evidence from an authorized CPSE pilot." status="Claims clearly separated" />
    <section className="route-panel proof-stack"><div><span className="route-kicker">What the system does</span><h2>Each step has a clear role.</h2></div><div className="proof-stack-grid"><article><Database size={17} /><strong>Input boundary</strong><span>CSV / ERP export ingestion</span></article><article><Network size={17} /><strong>Resolution</strong><span>Typed attributes and candidate evidence</span></article><article><ShieldAlert size={17} /><strong>Safety</strong><span>Conflict firewall and abstention</span></article><article><ShieldCheck size={17} /><strong>Governance</strong><span>Expert decision and audit trail</span></article><article><Lock size={17} /><strong>Output boundary</strong><span>Export-only, no legacy overwrite</span></article></div></section>
    <OperationsConsole initialTab="evidence" />
  </>
}

export function PlatformRoutes({ route }: { route: PlatformRoute }) {
  let content: ReactNode = null
  if (route === 'resolve') content = <><RouteIntro eyebrow="Resolution workspace" title="One record in. One reviewed identity out." description="Five checkpoints: enter a description, review its typed attributes, compare candidates, isolate conflicts, then approve — the source system stays untouched." status="Controlled workspace" /><ResolutionStudio /></>
  if (route === 'review') content = <><RouteIntro eyebrow="Review queue" title="Review the decisions that need you." description="Conflicts and uncertain matches wait here. Clarify, approve, or quarantine them with a visible decision history." status="Needs review" /><OperationsConsole initialTab="reviews" /></>
  if (route === 'migration') content = <><RouteIntro eyebrow="Migration preview" title="See the impact before changing anything." description="Preview common identities, retained aliases, held conflicts, and the export boundary before an approved mapping reaches an enterprise system." status="Preview only" /><MigrationSandbox /></>
  if (route === 'governance') content = <GovernancePage />
  if (route === 'evidence') content = <EvidencePage />
  return <div className="platform-app"><PlatformHeader /><main className="route-main">{content}</main><PlatformFooter /></div>
}
