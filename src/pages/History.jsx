import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import ArticleImage from '../components/news/ArticleImage'
import BookmarkButton from '../components/ui/BookmarkButton'
import LikeButton from '../components/ui/LikeButton'
import { useReadingHistory } from '../hooks/useReadingHistory'
import { formatRelativeTime } from '../data/sampleArticles'
import { preloadInitialImages } from '../utils/imagePreloader'

export default function History() {
  const { history, loading, loadHistory, clearHistory } = useReadingHistory()

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  useEffect(() => {
    if (history && history.length > 0) {
      preloadInitialImages(
        history.map((item) => item.articles?.image_url).filter(Boolean),
        4
      )
    }
  }, [history])

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear your entire reading history?')) {
      clearHistory()
    }
  }

  return (
    <div className="min-h-screen flex flex-col page-transition">
      <Header />

      <main className="max-w-content mx-auto px-5 sm:px-8 py-10 flex-1 w-full">
        {/* Page Header */}
        <div className="border-b border-line pb-8 mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 font-mono text-xs uppercase tracking-widest text-signal">
              <span className="w-1.5 h-1.5 rounded-full bg-signal animate-pulse-subtle" />
              <span>Telemetry Archive</span>
            </div>
            <h1 className="font-display text-3xl sm:text-5xl text-text-primary tracking-tight font-normal">
              Reading History
            </h1>
          </div>

          {history.length > 0 && (
            <div className="flex items-center gap-4">
              <span className="font-mono text-xs text-text-faint">
                <span className="text-text-primary font-medium">{history.length}</span> {history.length === 1 ? 'story read' : 'stories read'}
              </span>
              <button
                onClick={handleClear}
                className="px-3.5 py-1.5 border border-line/80 hover:border-rose-400/60 hover:text-rose-400 text-xs font-mono rounded-full transition-colors bg-surface-subtle/50"
              >
                Clear History
              </button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4 max-w-3xl">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-surface/35 p-4 rounded-xl border border-line/60 flex gap-4">
                <div className="w-28 sm:w-36 h-24 bg-surface-subtle rounded-lg shrink-0" />
                <div className="flex-1 space-y-2.5 py-1">
                  <div className="h-3 w-32 bg-surface-subtle rounded-full" />
                  <div className="h-5 w-5/6 bg-surface-subtle rounded" />
                  <div className="h-3.5 w-2/3 bg-surface-subtle rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && history.length === 0 && (
          <div className="py-20 text-center max-w-md mx-auto rounded-xl border border-dashed border-line/80 bg-surface/20 p-8 my-8">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full border border-line flex items-center justify-center text-signal font-mono text-sm">
              ⏱
            </div>
            <h2 className="font-display text-2xl text-text-primary mb-2 font-normal">
              No reading history yet
            </h2>
            <p className="text-text-muted text-xs sm:text-sm mb-6 leading-relaxed">
              Stories you explore across the platform are logged here so you never lose track of breakthrough ideas.
            </p>
            <Link
              to="/"
              className="inline-block px-6 py-2.5 text-xs font-mono uppercase tracking-wider bg-signal text-ink font-semibold rounded-full hover:bg-signal/90 transition-all"
            >
              Start reading
            </Link>
          </div>
        )}

        {/* Timeline List */}
        {!loading && history.length > 0 && (
          <div className="max-w-3xl space-y-4">
            {history.map((item, idx) => {
              const art = item.article
              if (!art) return null

              const articleObj = {
                id: art.id,
                title: art.title,
                description: art.description,
                source: art.source || 'Signal',
                sourceUrl: art.source_url || art.url,
                category: art.category || 'AI',
                imageUrl: art.image_url,
                publishedAt: art.published_at,
                readingTimeMin: art.reading_time_min || 4,
              }

              return (
                <div
                  key={item.id}
                  className="group bg-surface/30 backdrop-blur-sm border border-line/70 hover:border-line-bright p-4 rounded-xl transition-all duration-300 flex flex-col sm:flex-row gap-4 items-start card-lift"
                >
                  <Link
                    to={`/article/${art.id}`}
                    className="w-full sm:w-36 h-24 shrink-0 overflow-hidden rounded-lg bg-surface-subtle block relative border border-line/50"
                  >
                    <ArticleImage
                      src={art.image_url}
                      alt={art.title}
                      category={art.category}
                      className="w-full h-full object-cover img-zoom"
                      priority={idx < 3}
                      fetchPriority={idx === 0 ? 'high' : 'auto'}
                    />
                  </Link>

                  <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5 font-mono text-[11px] text-text-faint flex-wrap">
                        <span className="text-signal font-medium">{art.category}</span>
                        <span>·</span>
                        <span className="text-text-muted">{art.source}</span>
                        <span>·</span>
                        <span>Read {formatRelativeTime(item.read_at)}</span>
                      </div>

                      <Link to={`/article/${art.id}`} className="block">
                        <h2 className="font-display text-lg leading-snug text-text-primary group-hover:text-signal transition-colors line-clamp-2 mb-1.5 font-normal">
                          {art.title}
                        </h2>
                      </Link>

                      {art.description && (
                        <p className="text-text-muted text-xs line-clamp-1 leading-relaxed mb-2 font-normal">
                          {art.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-line/50 text-text-faint font-mono text-xs">
                      <span>{art.reading_time_min || 4} min read</span>
                      <div className="flex items-center gap-2.5">
                        <LikeButton article={articleObj} />
                        <BookmarkButton article={articleObj} />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
