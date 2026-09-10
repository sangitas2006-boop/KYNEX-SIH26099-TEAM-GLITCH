import { lazy, Suspense, useState, useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight, CheckCircle2, ChevronDown, Database,
  Menu, Network, QrCode, ShieldCheck, Sparkles, X,
  FileCheck2, SlidersHorizontal, Lock, Check, ExternalLink,
  FolderUp, Binary, Info, Key
} from 'lucide-react'
import './styles.css'
import './ui-polish.css'
import './media-fallback.css'
import { PrivacyModeModal } from './components/PrivacyModeModal'
import { NexusAssistant } from './components/NexusAssistant'
import { CredibilityEvidencePanel } from './components/CredibilityEvidencePanel'
import { MATERIAL_CASES } from './data/materialCases'
import { MediaErrorBoundary } from './components/MediaErrorBoundary'
import { KynexHighlightsList } from './components/KynexHighlightsList'
import { AuthProvider, useAuth } from './auth/AuthProvider'
import { LoginPage } from './auth/LoginPage'
import type { PlatformRoute } from './PlatformRoutes'

const MaterialFingerprintGraph = lazy(() =>
  import('./components/MaterialFingerprintGraph').then(({ MaterialFingerprintGraph: Graph }) => ({ default: Graph })),
)
const PlatformRoutes = lazy(() => import('./PlatformRoutes').then(({ PlatformRoutes: Routes }) => ({ default: Routes })))

type AppRoute = 'home' | PlatformRoute | 'not-found'

const routeTitles: Record<AppRoute, string> = {
  home: 'KYNEX — Material Identity Resolution Platform',
  resolve: 'Resolve a Material — KYNEX',
  review: 'Review Queue — KYNEX',
  migration: 'Migration Preview — KYNEX',
  governance: 'Governance & Audit — KYNEX',
  evidence: 'Evidence & Method — KYNEX',
  'not-found': 'Page Not Found — KYNEX',
}

function readPlatformRoute(): AppRoute {
  const route = window.location.hash.replace(/^#\/?/, '').split('?')[0]
  if (!route) return 'home'
  return ['resolve', 'review', 'migration', 'governance', 'evidence'].includes(route) ? route as PlatformRoute : 'not-found'
}

function NotFoundPage() {
  return (
    <div className="platform-app not-found-page">
      <main className="route-main not-found-main">
        <div className="route-intro">
          <div>
            <span className="route-eyebrow">KYNEX navigation</span>
            <h1>This route does not exist.</h1>
            <p>The page may have moved, or the link may be incomplete. Return to the KYNEX workspace and continue from a known route.</p>
            <a className="button primary compact" href="#/">Return to KYNEX <ArrowRight size={14} /></a>
          </div>
          <span className="route-status"><i />404 · Not found</span>
        </div>
      </main>
    </div>
  )
}

function DeferredMaterialFingerprintGraph() {
  const [shouldLoad, setShouldLoad] = useState(false)
  const graphHostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = graphHostRef.current
    if (!host) return

    let timer: number | undefined
    const loadGraph = () => setShouldLoad(true)
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      timer = window.setTimeout(loadGraph, 900)
      observer.disconnect()
    }, { rootMargin: '500px' })

    observer.observe(host)
    return () => {
      observer.disconnect()
      if (timer) window.clearTimeout(timer)
    }
  }, [])

  return (
    <div ref={graphHostRef} className="material-graph-host">
      {shouldLoad ? (
        <MediaErrorBoundary
          fallback={(
            <div className="media-fallback" role="status">
              <span className="media-fallback-mark"><Network size={18} /></span>
              <strong>Interactive model unavailable</strong>
              <span>The evidence workflow remains available below.</span>
            </div>
          )}
        >
          <Suspense
            fallback={(
              <div className="media-fallback" role="status">
                <span className="media-fallback-mark"><Network size={18} /></span>
                <strong>Loading material model…</strong>
                <span>Preparing the interactive evidence view.</span>
              </div>
            )}
          >
            <MaterialFingerprintGraph />
          </Suspense>
        </MediaErrorBoundary>
      ) : (
        <div className="media-fallback" role="status">
          <span className="media-fallback-mark"><Network size={18} /></span>
          <strong>Preparing material model…</strong>
          <span>The evidence workflow remains available below.</span>
        </div>
      )}
    </div>
  )
}

function App() {
  const { mode, isGuest, user, signOut } = useAuth()
  const [platformRoute, setPlatformRoute] = useState<AppRoute>(() => readPlatformRoute())
  const [menuOpen, setMenuOpen] = useState(false)
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('top')
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const heroVideoRef = useRef<HTMLVideoElement>(null)

  const heroCase = MATERIAL_CASES['gate-valve']

  // Handle prefers-reduced-motion media query
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    const handleRouteChange = () => setPlatformRoute(readPlatformRoute())
    window.addEventListener('hashchange', handleRouteChange)
    return () => window.removeEventListener('hashchange', handleRouteChange)
  }, [])

  useEffect(() => {
    document.title = routeTitles[platformRoute]
  }, [platformRoute])

  // Play the opening story on every page load. Once complete, retain the final frame as the hero atmosphere.
  useEffect(() => {
    const video = heroVideoRef.current
    if (!video) return

    if (prefersReducedMotion) {
      video.pause()
      return
    }

    video.currentTime = 0
    video.playbackRate = 0.58
    video.play().catch(() => {
      // Browser autoplay policies may prevent playback; the static atmosphere remains complete.
    })

    return () => video.pause()
  }, [prefersReducedMotion])

  const handleHeroVideoEnd = () => {
    const video = heroVideoRef.current
    if (!video || !Number.isFinite(video.duration)) return
    // Preserve the composed final shot rather than fading it out or restarting the story.
    video.currentTime = Math.max(0, video.duration - 0.06)
    video.pause()
  }

  // Scroll spy to highlight active section in navigation
  useEffect(() => {
    const sections = ['top', 'resolution-studio', 'migration-sandbox', 'how-it-works', 'governance', 'impact']
    const handleScroll = () => {
      const scrollPos = window.scrollY + 140
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId)
        if (el) {
          const top = el.offsetTop
          const height = el.offsetHeight
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sectionId)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  if (mode === 'loading') return <div className="route-loading">Preparing secure KYNEX access…</div>
  if (mode === 'signed_out') return <LoginPage />
  if (platformRoute === 'not-found') return <NotFoundPage />
  if (platformRoute !== 'home') return <Suspense fallback={<div className="route-loading">Loading KYNEX workspace…</div>}><PlatformRoutes route={platformRoute} /></Suspense>

  return (
    <div className="app-container">
      <a href="#resolution-studio" className="skip-link">Skip to Resolution Studio</a>

      {/* Header & Navigation */}
      <header className="nav-shell">
        <div className="brand-line" aria-hidden="true" />
        <div className="nav-inner">
        <a className="brand" href="#top" aria-label="KYNEX Home">
          <span className="brand-mark"><img src="/kynex-logo.png" alt="" /></span>
          <span className="brand-text">
            <strong>KYNEX</strong>
            <small>Material Identity Resolution Platform</small>
          </span>
        </a>

        <nav className="desktop-nav" aria-label="Primary navigation">
          <a href="#/resolve">Resolve</a>
          <a href="#/review">Review queue</a>
          <a href="#/migration">Migration</a>
          <a href="#/governance">Governance</a>
          <a href="#/evidence">Evidence</a>
        </nav>

        <div className="nav-actions">
          <button
            className="button outline compact"
            onClick={() => setPrivacyModalOpen(true)}
            aria-label="View Privacy-Preserving Match Protocol"
          >
            <Lock size={14} /> Privacy
          </button>

          <button
            className="button primary compact"
            onClick={() => { window.location.hash = '/resolve' }}
            aria-label="Enter Interactive Resolution Workspace"
          >
            Open workspace <ArrowRight size={14} />
          </button>

          <div className="auth-session-controls">
            <span className="auth-session-label">{isGuest ? 'Guest demo' : user?.email || 'Signed in'}</span>
            <button className="button outline compact" onClick={() => { void signOut() }}>Sign out</button>
          </div>

          <button
            className="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              className="mobile-nav"
              aria-label="Mobile primary navigation"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <a href="#/resolve" onClick={() => setMenuOpen(false)}>Resolve a material</a>
              <a href="#/review" onClick={() => setMenuOpen(false)}>Review queue</a>
              <a href="#/migration" onClick={() => setMenuOpen(false)}>Migration preview</a>
              <a href="#/governance" onClick={() => setMenuOpen(false)}>Governance & audit</a>
              <a href="#/evidence" onClick={() => setMenuOpen(false)}>Evidence & method</a>
              <div className="mobile-nav-cta">
                <button
                  className="button outline full-width"
                  onClick={() => {
                    setMenuOpen(false)
                    setPrivacyModalOpen(true)
                  }}
                >
                  <Lock size={15} /> Privacy Protocol
                </button>
                <button
                  className="button primary full-width"
                  onClick={() => {
                    setMenuOpen(false)
                    window.location.hash = '/resolve'
                  }}
                >
                  Open resolution workspace <ArrowRight size={16} />
                </button>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
        </div>
      </header>

      {/* Hero Section */}
      <section id="top" className="hero-container">
        {/* Subtle Background Video & Atmospheric Scrim Layer */}
        <div className="hero-atmosphere-backdrop" aria-hidden="true">
          <div className="hero-static-poster" />
          {!prefersReducedMotion && (
            <video
              ref={heroVideoRef}
              className="hero-story-video"
              src="./hero-material-intelligence.mp4"
              muted
              playsInline
              preload="metadata"
              onLoadedMetadata={(event) => {
                event.currentTarget.playbackRate = 0.58
              }}
              onError={(event) => {
                event.currentTarget.style.display = 'none'
              }}
              onEnded={handleHeroVideoEnd}
            />
          )}
          <div className="hero-gradient-overlay" />
          <div className="hero-vignette-bottom" />
        </div>

        <div className="hero-outcome-note">
          <span><ShieldCheck size={12} /> EVIDENCE GATE</span>
          <strong>Publish only after review</strong>
        </div>

        <div className="hero section-wrap">
          <div className="hero-copy">
          <div className="eyebrow-badge">
            <span className="badge-pulse" />
            <span className="eyebrow-text">A clearer way to compare material records</span>
          </div>

          <h1>
            One material identity.<br />
            <span>Proven by evidence.</span>
          </h1>

          <p className="lede">
            KYNEX helps teams compare inconsistent CPSE material records, keep the original codes intact, and send uncertain matches to an expert.
          </p>

          <div className="hero-actions">
            <a className="button primary" href="#/resolve">
              Resolve a material <ArrowRight size={18} />
            </a>
            <a className="button outline" href="#/migration">
              Preview a migration
            </a>
          </div>

          <div className="hero-proof-strip" role="list">
            <article role="listitem">
              <b>Expert decision</b>
              <span>A reviewer approves the final mapping</span>
            </article>
            <article role="listitem">
              <b>Source records stay intact</b>
              <span>No silent changes to the source system</span>
            </article>
            <article role="listitem">
              <b>Safety checks</b>
              <span>Conflicting specifications are held back</span>
            </article>
          </div>
        </div>

        {/* Live Material Resolution Canvas */}
        <div className="hero-resolution-canvas" aria-label="Live material resolution operational">
          <div className="canvas-background-stage">
            <div className="core-canvas">
              <DeferredMaterialFingerprintGraph />
            </div>
          </div>

          {/* Converging 3 Source Legacy Cards */}
          <div className="converging-sources-stack">
            <motion.div
              className="hero-source-card copper"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <div className="source-card-head">
                <span className="source-org-tag">CPCL</span>
                <code>CPCL-VLV-04182</code>
              </div>
              <span className="source-name">SS GATE VALVE 2 IN PN16</span>
            </motion.div>

            <motion.div
              className="hero-source-card olive"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
            >
              <div className="source-card-head">
                <span className="source-org-tag">SAIL</span>
                <code>SAIL-VALVE-G50-16</code>
              </div>
              <span className="source-name">GATE VLV SS316 DN50 PN16 FLANGED</span>
            </motion.div>

            <motion.div
              className="hero-source-card conflict-source"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <div className="source-card-head">
                <span className="source-org-tag conflict">NTPC</span>
                <code>NTPC-VLV-3307</code>
              </div>
              <span className="source-name">VALVE GATE 50MM SS PN25 FLG</span>
              <span className="source-meta-tag conflict-alert">⚠️ Conflict — Do Not Merge · PN25</span>
            </motion.div>
          </div>

          {/* Unified Governed Output Card */}
          <motion.div
            className="hero-output-card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
          >
            <div className="output-card-top">
              <span className="output-label">Governed Common National Material Code</span>
            </div>
            <strong className="output-code-title">CNMC-VALVE-GATE-SS-050-PN16</strong>
            <div className="output-footer-strip">
              <span className="output-review-status">
                <ShieldCheck size={14} /> Expert review required
              </span>
              <span className="output-lineage-status">
                <Lock size={13} /> Native Codes Retained
              </span>
            </div>
          </motion.div>

        </div>
        </div>
      </section>

      {/* Expectation-setting primer: calibrates what is implemented versus pilot-validated. */}
      <section className="prototype-primer section-wrap" aria-labelledby="primer-title">
        <div className="primer-frame">
          <div className="primer-main">
            <span className="primer-kicker">How to read this prototype</span>
            <h2 id="primer-title">What's real, what's simulated.</h2>
            <p>
              <strong>Real:</strong> the resolution workflow runs end-to-end on a labelled development set — intake, typed attributes, conflict checks, expert review, audit trail, and benchmark execution.
            </p>
            <p>
              <strong>Not yet validated:</strong> live ERP connections, CPSE-scale data, managed Supabase/SSO deployment, and pilot outcome metrics are out of scope for this build; they are flagged for validation with an authorized CPSE pilot. <a href="#/evidence">Full evidence and method <ArrowRight size={12} /></a>
            </p>
          </div>
          <div className="primer-side">
            <span><Info size={13} /> Development fixture</span>
            <span><Database size={13} /> 11-row labelled benchmark</span>
            <span><Lock size={13} /> No source system is modified</span>
            <a className="button outline compact" href="#/evidence">Evidence and method <ArrowRight size={13} /></a>
          </div>
        </div>
      </section>

      {/* Product architecture preview: the home page explains the platform; routes perform the work. */}
      <section className="home-platform-preview section-wrap" aria-labelledby="platform-preview-title">
        <div className="home-platform-layout">
          <div className="section-heading home-platform-heading">
            <div className="eyebrow-badge"><span className="eyebrow-text">How the product is used</span></div>
            <h2 id="platform-preview-title">From scattered records to a decision someone can review.</h2>
            <p>Start with a record, inspect the evidence, send difficult cases to review, and export only approved mappings.</p>
            <div className="home-platform-actions"><a className="button primary compact" href="#/resolve">Open resolution workspace <ArrowRight size={14} /></a><a className="button outline compact" href="#/governance">See governance controls <ShieldCheck size={14} /></a></div>
          </div>
          <KynexHighlightsList />
        </div>
        <div className="home-route-card-grid">
          <a className="home-route-card featured" href="#/resolve"><span className="home-route-index">01</span><strong>Resolve</strong><span>See the guided session: evidence in, conflicting specs held, a reviewer signs off.</span><ArrowRight size={16} /></a>
          <a className="home-route-card" href="#/review"><span className="home-route-index">02</span><strong>Review queue</strong><span>Send conflicts and uncertain matches to the right reviewer.</span><ArrowRight size={16} /></a>
          <a className="home-route-card" href="#/migration"><span className="home-route-index">03</span><strong>Migration preview</strong><span>Check aliases and export boundaries before anything leaves the workspace.</span><ArrowRight size={16} /></a>
        </div>
      </section>

      {/* SECTION 1: 4-STEP METHOD */}
      <section id="how-it-works" className="how section-wrap">
        <div className="section-heading">
          <div className="eyebrow-badge">
            <span className="eyebrow-text">How a record moves through KYNEX</span>
          </div>
          <h2>A practical path from record to reviewed identity</h2>
          <p>
            KYNEX works alongside existing catalogs. It adds a reviewable identity layer without replacing source records or requiring a monolithic migration.
          </p>
        </div>

        <div className="steps-grid">
          {[
            {
              step: '01',
              title: 'Bring in the source record',
              desc: 'Import an ERP export or scan a QR/barcode. The native catalog ID and source context stay attached to the record.',
              icon: <FolderUp size={22} />
            },
            {
              step: '02',
              title: 'Describe the material in structured terms',
              desc: 'Turn inconsistent descriptions into reviewable attributes and normalized units, such as 2" → 50 mm, before a reviewer validates the match.',
              icon: <Binary size={22} />
            },
            {
              step: '03',
              title: 'Compare candidates and isolate conflicts',
              desc: 'Compare candidates across wording, taxonomy, dimensions, and material attributes. Hold conflicting specifications for expert review.',
              icon: <SlidersHorizontal size={22} />
            },
            {
              step: '04',
              title: 'Approve the mapping and keep its record',
              desc: 'A material officer reviews the evidence and approves the mapping. The Material Passport keeps the aliases, approval status, and decision history together.',
              icon: <ShieldCheck size={22} />
            }
          ].map((item) => (
            <article className="step-card" key={item.step}>
              <div className="step-header">
                <span className="step-number">{item.step}</span>
                <span className="step-icon">{item.icon}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* SECTION 4: GOVERNANCE & INTEGRITY RULES */}
      <section id="governance" className="governance">
        <div className="section-wrap governance-grid">
          <div className="governance-info">
            <p className="eyebrow light">Why the controls matter</p>
            <h2>A recommendation is not a final decision.</h2>
            <p className="governance-lede">
              In heavy industry, a wrong substitution can create operational and safety risk. KYNEX shows the evidence, holds back conflicts, and keeps publication with an authorized reviewer.
            </p>
            <div className="governance-quote">
              <blockquote>
                "The system can find candidates. A material expert decides what is safe to publish, with the source record and decision history kept intact."
              </blockquote>
            </div>
          </div>

          <div className="governance-points">
            <div className="gov-card">
              <div className="gov-icon"><SlidersHorizontal size={22} /></div>
              <div>
                <h4>Evidence you can inspect</h4>
                <p>Each match exposes its supporting attributes and checks instead of reducing the decision to one unexplained score.</p>
              </div>
            </div>

            <div className="gov-card">
              <div className="gov-icon"><Database size={22} /></div>
              <div>
                <h4>Keep the original codes</h4>
                <p>Original material codes and source aliases stay attached to every mapping, so teams can trace the result back to the source system.</p>
              </div>
            </div>

            <div className="gov-card">
              <div className="gov-icon"><ShieldCheck size={22} /></div>
              <div>
                <h4>Review before publishing</h4>
                <p>Ambiguous matches go to review. Approval history and Material Passport verification make the final mapping accountable.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: NATIONAL IMPACT */}
      <section id="impact" className="impact section-wrap">
        <div className="section-heading">
          <div className="eyebrow-badge">
            <span className="eyebrow-text">About the platform</span>
          </div>
          <h2>A shared reference layer for industrial material records</h2>
          <p>
            KYNEX connects material catalogs, standards evidence, and procurement workflows while keeping source lineage and technical decisions visible.
          </p>
        </div>

        <div className="about-product-frame" aria-label="KYNEX operating model">
          <div className="about-product-intro">
            <span className="about-product-kicker">The workflow in brief</span>
            <h3>Bring the record in. Show the reasoning. Keep control.</h3>
            <p>Material, procurement, and data teams can resolve identity without abandoning the systems, standards, or approval controls they already use.</p>
          </div>
          <div className="about-trust-stack">
            <article className="about-trust-item">
              <span className="about-trust-index">01</span>
              <div><strong>Start with the record</strong><span>Bring together the description, technical attributes, aliases, and source context.</span></div>
              <Database size={18} />
            </article>
            <article className="about-trust-item">
              <span className="about-trust-index">02</span>
              <div><strong>Show the reasoning</strong><span>Compare candidates across explicit dimensions rather than hiding the reasoning behind one score.</span></div>
              <Network size={18} />
            </article>
            <article className="about-trust-item">
              <span className="about-trust-index">03</span>
              <div><strong>Publish with accountability</strong><span>Route conflicts and approvals through named reviewers and a visible audit trail.</span></div>
              <ShieldCheck size={18} />
            </article>
          </div>
        </div>

        <div className="national-context-strip" aria-label="Public procurement context">
          <article className="national-context-card">
            <span>GeM context</span>
            <strong>Catalog discovery and procurement</strong>
            <p>Use the identity layer to support authorized catalog discovery, sourcing, and procurement workflows.</p>
            <a href="https://gem.gov.in/aboutus" target="_blank" rel="noreferrer">Official GeM context <ExternalLink size={11} /></a>
          </article>
          <article className="national-context-card">
            <span>DPE context</span>
            <strong>Accountability across CPSEs</strong>
            <p>Approval history, source context, and abstention make harmonization easier to review across participating public enterprises.</p>
            <a href="https://dpe.gov.in/" target="_blank" rel="noreferrer">Official DPE context <ExternalLink size={11} /></a>
          </article>
          <article className="national-context-card">
            <span>Make in India context</span>
            <strong>More careful procurement analysis</strong>
            <p>Technical identity and conflict checks can support procurement analysis without claiming policy compliance automatically.</p>
            <a href="https://www.dpiit.gov.in/ministry/about-us/details/Title%3DPublic-Procurement-%28Preference-to-Make-in-India%29-Order%2C-2017-ITMwETMtQWa" target="_blank" rel="noreferrer">Official policy context <ExternalLink size={11} /></a>
          </article>
        </div>

        <CredibilityEvidencePanel />

        <div className="safety-story-panel">
          <div className="unsafe">
            <b>Before — similar names, different risks</b>
            <h3>Similar names can hide important differences.</h3>
            <p>Descriptions remain scattered across plants and systems. A single similarity score can miss pressure class, size, grade, or functional conflicts.</p>
          </div>
          <div className="safe">
            <b>After — reviewed and reversible</b>
            <h3>Candidates are surfaced, conflicts are held back, and approved mappings move forward.</h3>
            <p>Source codes remain intact. Critical conflicts are blocked, uncertain rows can abstain, and only approved mappings receive a Material Passport.</p>
          </div>
        </div>

        <div className="impact-cards">
          <article className="impact-card">
            <div className="impact-icon"><Sparkles size={24} /></div>
            <h3>Find related records across catalogs</h3>
            <p>Surface possible relationships across participating catalogs without silently changing an ERP record.</p>
          </article>

          <article className="impact-card">
            <div className="impact-icon"><Network size={24} /></div>
            <h3>Support procurement review</h3>
            <p>Use approved identities, preserved aliases, and technical evidence alongside existing procurement and inventory processes.</p>
          </article>

          <article className="impact-card">
            <div className="impact-icon"><CheckCircle2 size={24} /></div>
            <h3>Measure value in a CPSE pilot</h3>
            <p>Start with labelled records and reviewer outcomes. Measure recall, unsafe-merge prevention, abstention quality, cycle time, and inventory visibility before making impact claims.</p>
          </article>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-shell">
        <div className="footer-content section-wrap">
          <div className="footer-brand">
            <div className="brand">
              <span className="brand-mark"><img src="/kynex-logo.png" alt="" /></span>
              <span className="brand-text">
                <strong>KYNEX</strong>
                <small>Material Identity Resolution Platform</small>
              </span>
            </div>
            <p className="footer-tagline">
              A shared, reviewable reference for material identity.
            </p>
            <div className="footer-disclaimer-box">
              <p>
                Material records, source aliases, and approval history stay traceable throughout the workflow.</p>
            </div>
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <b>Platform Navigation</b>
              <a href="#/resolve">Resolve a material</a>
              <a href="#/review">Review queue</a>
              <a href="#/migration">Migration preview</a>
              <a href="#/governance">Governance & audit</a>
              <a href="#/evidence">Evidence & method</a>
            </div>
            <div className="footer-column">
              <b>Platform Capabilities</b>
              <span>Inspectable evidence graph</span>
              <span>Expert review</span>
              <span>Source-safe mappings</span>
              <span>Traceable Material Passport</span>
            </div>
          </div>
        </div>

        <div className="footer-endmark" aria-label="KYNEX">
          <span className="footer-endmark-word">KYNEX</span>
          <span className="footer-endmark-symbol" aria-hidden="true">✳</span>
          <span className="footer-endmark-dot" aria-hidden="true">.</span>
        </div>

        <div className="footer-bottom section-wrap">
          <span>© 2026 KYNEX · Material Identity Resolution Platform</span>
          <a href="#top" className="back-to-top">
            Back to top <ChevronDown size={15} style={{ transform: 'rotate(180deg)' }} />
          </a>
        </div>
      </footer>

      {/* Supporting Privacy Mode Modal */}
      <PrivacyModeModal
        isOpen={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
      />
      <NexusAssistant />
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <App />
  </AuthProvider>,
)
