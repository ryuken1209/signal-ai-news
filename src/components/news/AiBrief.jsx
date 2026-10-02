import { Link } from 'react-router-dom'
import { useArticleAi } from '../../hooks/useArticleAi'

export default function AiBrief({ article }) {
  const { aiBrief, loading, error, isConfigured, isCached, generateBrief } = useArticleAi(article)

  return (
    <section className="my-10 relative overflow-hidden rounded-xl border border-line bg-surface/35 backdrop-blur-md shadow-2xl">
      {/* Top Subtle Cyan Gradient Accent Line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-signal/70 to-transparent" />

      {/* Intelligence Panel Header */}
      <div className="p-5 sm:p-6 border-b border-line/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface/20">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-signal animate-pulse-subtle shadow-[0_0_8px_rgba(95,201,248,0.7)]" />
          <h2 className="font-mono text-xs uppercase tracking-widest text-signal font-semibold">
            AI Intelligence Brief
          </h2>
          <span className="text-text-faint font-mono text-xs">·</span>
          <span className="font-mono text-[10px] text-text-muted bg-surface-subtle px-2.5 py-0.5 rounded-full border border-line/80">
            {isCached ? 'Verified Cache' : 'Synthesized'}
          </span>
        </div>

        <span className="font-mono text-[11px] text-text-faint">
          Automated editorial synthesis
        </span>
      </div>

      {/* Intelligent Loading State */}
      {loading && (
        <div className="p-6 sm:p-8 space-y-6 relative overflow-hidden">
          {/* Moving Gradient Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-signal/10 via-signal to-signal/10 animate-shimmer bg-[length:200%_100%]" />

          <div className="flex items-center gap-3 font-mono text-xs text-signal">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-signal animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-signal animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-signal animate-bounce [animation-delay:300ms]" />
            </div>
            <span>Analyzing story details &amp; technical implications…</span>
          </div>

          <div className="space-y-3 animate-pulse">
            <div className="h-3 w-32 bg-surface-subtle rounded-full" />
            <div className="h-4 w-full bg-surface-subtle rounded" />
            <div className="h-4 w-5/6 bg-surface-subtle rounded" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="h-24 bg-surface-subtle/70 rounded-lg p-4 animate-pulse" />
            <div className="h-24 bg-surface-subtle/70 rounded-lg p-4 animate-pulse" />
          </div>
        </div>
      )}

      {/* Provider Not Configured (Honest Fallback) */}
      {!loading && !isConfigured && (
        <div className="p-8 sm:p-10 text-center bg-surface/20">
          <div className="w-10 h-10 rounded-full border border-line bg-ink/70 mx-auto flex items-center justify-center text-xs text-signal mb-3 font-mono font-semibold">
            AI
          </div>
          <h3 className="font-display text-lg text-text-primary mb-1.5">
            AI Intelligence Provider Not Configured
          </h3>
          <p className="text-text-muted text-xs sm:text-sm max-w-md mx-auto mb-5 leading-relaxed">
            Instant executive summaries, simplified technical breakdowns, and implications require an AI API key (Google Gemini or OpenAI) configured in the server environment.
          </p>
          <div className="inline-flex items-center gap-2 font-mono text-[11px] text-text-faint bg-ink/80 px-3.5 py-1.5 rounded-full border border-line/70">
            <span>Set <code className="text-signal">AI_API_KEY</code> server-side</span>
          </div>
        </div>
      )}

      {/* Error State with Retry */}
      {!loading && isConfigured && error && (
        <div className="p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface/20">
          <div>
            <p className="font-display text-base text-text-primary mb-1">
              AI Brief temporarily unavailable
            </p>
            <p className="text-text-muted text-xs">
              {error}
            </p>
          </div>
          <button
            onClick={() => generateBrief(true)}
            className="px-4 py-1.5 bg-surface-subtle border border-line hover:border-signal text-xs font-mono text-text-primary hover:text-signal rounded-full transition-colors shrink-0"
          >
            Retry analysis
          </button>
        </div>
      )}

      {/* Valid AI Brief Output */}
      {!loading && isConfigured && !error && aiBrief && (
        <div className="p-6 sm:p-8 space-y-7">
          {/* Executive Summary */}
          <div>
            <h3 className="font-mono text-xs text-text-faint uppercase tracking-wider mb-2.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-signal" />
              <span>Executive Summary</span>
            </h3>
            <p className="text-text-primary text-sm sm:text-base leading-relaxed font-normal">
              {aiBrief.summary}
            </p>
          </div>

          {/* Key Points */}
          {aiBrief.keyPoints?.length > 0 && (
            <div>
              <h3 className="font-mono text-xs text-text-faint uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-signal" />
                <span>Key Points</span>
              </h3>
              <ul className="space-y-2.5 text-sm text-text-muted">
                {aiBrief.keyPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-3 leading-relaxed">
                    <span className="font-mono text-signal text-xs mt-1 select-none">
                      •
                    </span>
                    <span className="text-text-primary/90">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Two-Column Structured Insights: Explain Simply & Why It Matters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-line/60">
            {/* Explain Simply */}
            {aiBrief.explainSimply && (
              <div className="bg-ink/50 p-4 sm:p-5 rounded-lg border border-amber/25 relative overflow-hidden">
                <div className="h-[2px] w-12 bg-amber/60 rounded-full mb-3" />
                <h4 className="font-mono text-xs text-amber uppercase tracking-wider mb-2 flex items-center gap-1.5 font-medium">
                  <span>Explain Simply</span>
                </h4>
                <p className="text-text-muted text-xs sm:text-sm leading-relaxed">
                  {aiBrief.explainSimply}
                </p>
              </div>
            )}

            {/* Why It Matters */}
            {aiBrief.whyItMatters && (
              <div className="bg-ink/50 p-4 sm:p-5 rounded-lg border border-signal/25 relative overflow-hidden">
                <div className="h-[2px] w-12 bg-signal/60 rounded-full mb-3" />
                <h4 className="font-mono text-xs text-signal uppercase tracking-wider mb-2 flex items-center gap-1.5 font-medium">
                  <span>Why It Matters</span>
                </h4>
                <p className="text-text-muted text-xs sm:text-sm leading-relaxed">
                  {aiBrief.whyItMatters}
                </p>
              </div>
            )}
          </div>

          {/* Extracted Topic Tags */}
          {aiBrief.topics?.length > 0 && (
            <div className="pt-3 border-t border-line/60 flex items-center flex-wrap gap-2">
              <span className="font-mono text-xs text-text-faint uppercase tracking-wider mr-1">
                Topics:
              </span>
              {aiBrief.topics.map((tag) => (
                <Link
                  key={tag}
                  to={`/?category=${encodeURIComponent(tag)}`}
                  className="px-3 py-1 bg-surface-subtle border border-line/70 hover:border-signal/50 text-xs font-mono text-text-muted hover:text-signal rounded-full transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* Disclaimer Footer */}
          <div className="pt-3 border-t border-line/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] font-mono text-text-faint">
            <span>
              Engine: {aiBrief.model || 'signal-ai-v1'}
            </span>
            <span>
              Editorial synthesis · Verify critical metrics with primary source
            </span>
          </div>
        </div>
      )}
    </section>
  )
}
