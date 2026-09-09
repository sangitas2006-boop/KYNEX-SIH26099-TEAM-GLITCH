import { ArrowRight } from 'lucide-react'

const highlights = [
  'Find the attribute that changes the answer',
  'Read the context behind a code',
  'Compare like-for-like before grouping',
  'Pause on an incomplete technical record',
  'Know what a reviewer changed',
]

export function KynexHighlightsList() {
  return (
    <aside className="kynex-highlights" aria-label="KYNEX decision highlights">
      <div className="kynex-highlights-list">
        {highlights.map((highlight) => (
          <a className="kynex-highlight-item" href="#/resolve" key={highlight}>
            <span className="kynex-highlight-arrow" aria-hidden="true"><ArrowRight size={14} strokeWidth={2.5} /></span>
            <span>{highlight}</span>
          </a>
        ))}
      </div>
    </aside>
  )
}
