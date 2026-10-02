import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import BookmarkButton from '../components/ui/BookmarkButton'
import LikeButton from '../components/ui/LikeButton'
import NotesSection from '../components/news/NotesSection'
import AddToCollectionModal from '../components/news/AddToCollectionModal'
import AiBrief from '../components/news/AiBrief'
import ArticleImage from '../components/news/ArticleImage'
import { getArticleById } from '../services/newsService'
import { formatRelativeTime } from '../data/sampleArticles'
import { useReadingHistory } from '../hooks/useReadingHistory'

export default function Article() {
  const { id } = useParams()
  const [article, setArticle] = useState(null)
  const [isFallback, setIsFallback] = useState(false)
  const [status, setStatus] = useState('loading')
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false)

  const [prevId, setPrevId] = useState(id)
  if (id !== prevId) {
    setPrevId(id)
    setStatus('loading')
  }

  useEffect(() => {
    let cancelled = false
    getArticleById(id)
      .then((data) => {
        if (!cancelled) {
          setArticle(data.article)
          setIsFallback(data.isFallback)
          setStatus('ready')
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [id])

  // Automatically records reading event to Supabase when article is ready
  useReadingHistory(article)

  return (
    <div className="min-h-screen flex flex-col page-transition">
      <Header />

      <main className="relative max-w-3xl mx-auto px-5 sm:px-8 py-10 flex-1 w-full">
        {/* Subtle reading atmosphere beacon - above content, not behind paragraphs */}
        <div
          className="absolute -top-8 left-1/2 -translate-x-1/2 w-full max-w-xl h-52 bg-[radial-gradient(ellipse_60%_45%_at_50%_20%,rgba(95,201,248,0.055)_0%,rgba(35,110,190,0.02)_50%,transparent_75%)] pointer-events-none -z-10"
          aria-hidden="true"
        />
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-text-faint hover:text-signal transition-colors mb-8 group"
        >
          <span className="transition-transform duration-200 group-hover:-translate-x-1">←</span>
          <span>Back to stream</span>
        </Link>

        {status === 'loading' && (
          <div className="animate-pulse space-y-6">
            <div className="h-4 w-40 bg-surface-subtle rounded-full" />
            <div className="h-10 w-full bg-surface-subtle rounded" />
            <div className="h-10 w-4/5 bg-surface-subtle rounded" />
            <div className="h-72 w-full bg-surface-subtle rounded-xl" />
            <div className="h-4 w-full bg-surface-subtle rounded" />
            <div className="h-4 w-5/6 bg-surface-subtle rounded" />
          </div>
        )}

        {status === 'error' && (
          <div className="py-24 text-center border border-dashed border-line rounded-xl bg-surface/20">
            <div className="w-10 h-10 rounded-full bg-surface-subtle border border-line flex items-center justify-center mx-auto mb-3 text-signal font-mono text-sm">
              ?
            </div>
            <p className="font-display text-2xl text-text-primary mb-1.5 font-normal">
              Story not found
            </p>
            <p className="text-text-muted text-xs sm:text-sm max-w-sm mx-auto mb-6 leading-relaxed">
              This story may have aged out of the feed, or the link has changed.
            </p>
            <Link
              to="/"
              className="text-xs font-mono uppercase tracking-wider border border-line hover:border-signal text-text-primary hover:text-signal transition-colors rounded-full px-5 py-2 bg-surface-subtle"
            >
              Return to newsfeed
            </Link>
          </div>
        )}

        {status === 'ready' && article && (
          <article className="animate-fade-in">
            {isFallback && (
              <div className="mb-6 border border-amber/40 bg-amber/5 text-amber text-xs rounded-lg px-4 py-2.5 font-mono">
                Showing local sample data — run `vercel dev` for live articles.
              </div>
            )}

            {/* Metadata Top Row */}
            <div className="flex items-center gap-2.5 mb-4 font-mono text-xs text-text-faint flex-wrap">
              <span className="text-signal px-3 py-0.5 rounded-full bg-signal-muted font-medium border border-signal/30 text-[11px]">
                {article.category}
              </span>
              <span>·</span>
              <span className="text-text-muted">{article.source}</span>
              <span>·</span>
              <span>{formatRelativeTime(article.publishedAt)}</span>
              <span>·</span>
              <span className="px-2 py-0.5 rounded bg-surface-subtle border border-line/60">
                {article.readingTimeMin} min read
              </span>
            </div>

            {/* Large Editorial Headline */}
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl leading-[1.12] text-text-primary mb-6 font-normal tracking-tight">
              {article.title}
            </h1>

            {/* Cinematic Hero Image */}
            <div className="w-full h-64 sm:h-[380px] lg:h-[440px] rounded-xl overflow-hidden border border-line/80 mb-8 shadow-2xl relative">
              <ArticleImage
                src={article.imageUrl}
                alt={article.title}
                category={article.category}
                className="w-full h-full object-cover"
                priority={true}
                fetchPriority="high"
              />
            </div>

            {/* Sleek Action Bar */}
            <div className="flex items-center flex-wrap gap-4 mb-8 py-3.5 px-4 rounded-lg bg-surface/35 border border-line/70">
              <div className="flex items-center gap-2">
                <BookmarkButton article={article} showLabel />
              </div>

              <div className="w-px h-4 bg-line/60" />

              <div className="flex items-center gap-2">
                <LikeButton article={article} showLabel alwaysShowCount />
              </div>

              <div className="w-px h-4 bg-line/60" />

              <button
                type="button"
                onClick={() => setIsCollectionModalOpen(true)}
                className="text-xs text-text-faint hover:text-signal transition-colors inline-flex items-center gap-1.5 font-mono"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
                <span>Save to Collection</span>
              </button>

              {article.sourceUrl && (
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-xs font-mono text-text-muted hover:text-signal transition-colors inline-flex items-center gap-1 bg-surface-subtle/80 hover:bg-surface-hover px-3 py-1 rounded-full border border-line/60"
                >
                  <span>Source coverage</span>
                  <span className="text-[10px]">↗</span>
                </a>
              )}
            </div>

            {/* Editorial Lead Description */}
            <div className="my-8 pl-5 border-l-2 border-signal/50">
              <p className="text-text-primary/90 text-lg sm:text-xl leading-relaxed font-sans">
                {article.description}
              </p>
            </div>

            {/* AI Brief Intelligence Panel */}
            <AiBrief article={article} />

            {/* Private Notes Section */}
            <NotesSection article={article} />

            <AddToCollectionModal
              article={article}
              isOpen={isCollectionModalOpen}
              onClose={() => setIsCollectionModalOpen(false)}
            />
          </article>
        )}
      </main>

      <Footer />
    </div>
  )
}
