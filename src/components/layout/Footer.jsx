import { Link } from 'react-router-dom'
import { CATEGORIES } from '../../data/sampleArticles'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative mt-24 border-t border-line/40 bg-[#040609] shadow-[0_-20px_50px_rgba(0,0,0,0.8)] before:absolute before:inset-x-0 before:-top-16 before:h-16 before:bg-gradient-to-b before:from-transparent before:to-[#040609] before:pointer-events-none">
      <div className="relative z-10 max-w-content mx-auto px-5 sm:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-line/60">
          {/* Brand & Editorial Mission (6 cols) */}
          <div className="md:col-span-6 space-y-3">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <span className="w-2 h-2 rounded-full bg-signal animate-pulse-subtle shadow-[0_0_8px_rgba(95,201,248,0.6)]" />
              <span className="font-display text-2xl tracking-tight text-text-primary group-hover:text-signal transition-colors font-medium">
                Signal
              </span>
            </Link>
            <p className="text-text-muted text-xs sm:text-sm max-w-md leading-relaxed font-normal">
              An intelligent radar for artificial intelligence and technology breakthroughs.
              Synthesized from primary RSS sources, curated for deep readers, researchers, and engineers.
            </p>
          </div>

          {/* Core Topics (3 cols) */}
          <div className="md:col-span-3 space-y-2.5">
            <h3 className="font-mono text-xs uppercase tracking-widest text-text-muted font-semibold">
              Topics
            </h3>
            <ul className="space-y-1.5 font-mono text-xs">
              {CATEGORIES.slice(0, 5).map((cat) => (
                <li key={cat}>
                  <Link
                    to={`/?category=${encodeURIComponent(cat)}`}
                    className="text-text-faint hover:text-signal transition-colors"
                  >
                    #{cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation & Telemetry (3 cols) */}
          <div className="md:col-span-3 space-y-2.5">
            <h3 className="font-mono text-xs uppercase tracking-widest text-text-muted font-semibold">
              Radar
            </h3>
            <ul className="space-y-1.5 font-mono text-xs">
              <li>
                <Link to="/for-you" className="text-text-faint hover:text-signal transition-colors">
                  ✦ For You Stream
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-text-faint hover:text-signal transition-colors">
                  Reader Journal
                </Link>
              </li>
              <li>
                <Link to="/saved" className="text-text-faint hover:text-signal transition-colors">
                  Saved Library
                </Link>
              </li>
              <li>
                <Link to="/collections" className="text-text-faint hover:text-signal transition-colors">
                  Collections
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Metadata & Status Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-[11px] text-text-faint">
          <div className="flex items-center gap-3 flex-wrap">
            <span>© {currentYear} Signal Intelligence</span>
            <span>·</span>
            <span>Primary Sources Attributed</span>
            <span>·</span>
            <span>Encrypted Privacy</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-subtle" />
            <span className="text-emerald-400/90 font-medium">10 Feeds Operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
