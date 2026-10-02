import { useEffect, useMemo, useState, useCallback } from 'react'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import FeaturedArticle from '../components/news/FeaturedArticle'
import ArticleGrid from '../components/news/ArticleGrid'
import ArticleSkeleton from '../components/news/ArticleSkeleton'
import { getArticles } from '../services/newsService'
import { CATEGORIES } from '../data/sampleArticles'
import { useFollowedTopics } from '../hooks/useFollowedTopics'
import { prewarmVisibleImages } from '../utils/imagePreloader'

const FILTERS = ['All', ...CATEGORIES, 'Trending']

export default function Home() {
  const { isFollowing, toggleFollow } = useFollowedTopics()
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [articles, setArticles] = useState([])
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [isFallback, setIsFallback] = useState(false)
  const [sourceErrors, setSourceErrors] = useState([])

  const refreshArticles = useCallback(async () => {
    setStatus('loading')
    try {
      const isTrending = activeCategory === 'Trending'
      const data = await getArticles({
        category: isTrending ? 'All' : activeCategory,
        trending: isTrending,
      })
      const items = data.articles || []
      if (items.length > 0) {
        await prewarmVisibleImages(items, { max: 3, timeoutMs: 350 })
      }
      setArticles(items)
      setIsFallback(Boolean(data.isFallback))
      setSourceErrors(data.sourceErrors || [])
      setStatus('ready')
    } catch (err) {
      console.error('Failed to refresh articles:', err)
      setStatus('error')
    }
  }, [activeCategory])

  useEffect(() => {
    let cancelled = false
    const isTrending = activeCategory === 'Trending'
    getArticles({
      category: isTrending ? 'All' : activeCategory,
      trending: isTrending,
    })
      .then(async (data) => {
        if (!cancelled) {
          const items = data.articles || []
          if (items.length > 0) {
            await prewarmVisibleImages(items, { max: 3, timeoutMs: 350 })
          }
          if (!cancelled) {
            setArticles(items)
            setIsFallback(Boolean(data.isFallback))
            setSourceErrors(data.sourceErrors || [])
            setStatus('ready')
          }
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('Failed to load articles:', err)
          setStatus('error')
        }
      })
    return () => {
      cancelled = true
    }
  }, [activeCategory])

  const featured = useMemo(() => {
    if (!articles || articles.length === 0) return null
    // Prioritize an article that has a high-quality image for the prominent visual hero slot
    return articles.find((a) => Boolean(a.imageUrl)) || articles[0]
  }, [articles])

  const feedArticles = useMemo(() => {
    const hasSearch = Boolean(search.trim())
    // When searching or in filtered categories, keep all matching articles.
    // When browsing the "All" category without search, separate out the chosen featured article.
    let list =
      activeCategory === 'All' && !hasSearch && featured
        ? articles.filter((a) => a.id !== featured.id)
        : articles

    if (hasSearch) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (a) =>
          (a.title || '').toLowerCase().includes(q) ||
          (a.description || '').toLowerCase().includes(q) ||
          (a.category || '').toLowerCase().includes(q) ||
          (a.source || '').toLowerCase().includes(q) ||
          (a.tags || []).some((t) => (t || '').toLowerCase().includes(q))
      )
    }

    return list
  }, [articles, activeCategory, search, featured])

  return (
    <div className="min-h-screen flex flex-col page-transition">
      <Header
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat)
          setSearch('')
        }}
        searchValue={search}
        onSearchChange={setSearch}
        categoryOptions={FILTERS}
      />

      <main className="max-w-content mx-auto px-5 sm:px-8 py-10 flex-1 w-full">
        {isFallback && (
          <div className="mb-6 border border-amber/40 bg-amber/5 text-amber text-sm rounded-sm px-4 py-2.5 font-mono">
            Showing local sample data — /api/news isn't reachable from plain
            `vite dev`. Run `vercel dev` to see live articles.
          </div>
        )}

        {!isFallback && sourceErrors.length > 0 && (
          <div className="mb-6 border border-line bg-surface text-text-muted text-xs rounded-sm px-4 py-2.5 font-mono">
            {sourceErrors.length} source{sourceErrors.length !== 1 ? 's' : ''}{' '}
            temporarily unavailable ({sourceErrors.map((e) => e.source).join(', ')}) —
            showing results from the rest.
          </div>
        )}

        {status === 'ready' && activeCategory === 'All' && !search && featured && (
          <div className="relative">
            {/* Expansive environmental atmospheric lighting behind hero */}
            <div
              className="absolute -top-24 left-1/2 -translate-x-1/2 w-[140%] max-w-6xl h-[620px] bg-[radial-gradient(ellipse_115%_80%_at_50%_35%,rgba(95,201,248,0.055)_0%,rgba(35,100,180,0.02)_45%,transparent_80%)] pointer-events-none -z-10"
              aria-hidden="true"
            />
            <FeaturedArticle key={featured.id} article={featured} />
          </div>
        )}

        {/* Stream Header & Controls */}
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-line/60 relative after:absolute after:bottom-0 after:left-0 after:w-36 after:h-[1px] after:bg-gradient-to-r after:from-signal/30 after:to-transparent">
          <div className="flex items-center gap-3">
            <h2 className="font-mono text-xs text-text-primary uppercase tracking-wider font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-signal" />
              {search
                ? `Results for "${search}"`
                : activeCategory === 'All'
                ? 'Latest Stories'
                : activeCategory}
            </h2>

            {activeCategory !== 'All' && activeCategory !== 'Trending' && !search && (
              <button
                type="button"
                onClick={() => toggleFollow(activeCategory)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono transition-all duration-150 ${
                  isFollowing(activeCategory)
                    ? 'bg-signal-muted text-signal border border-signal/40 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-400/40'
                    : 'border border-line text-text-muted hover:border-signal/60 hover:text-signal bg-surface-subtle/50'
                }`}
                title={isFollowing(activeCategory) ? 'Click to unfollow' : 'Follow this topic'}
              >
                {isFollowing(activeCategory) ? '✓ Following' : '+ Follow'}
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {status === 'ready' && (
              <span className="font-mono text-xs text-text-faint hidden sm:inline">
                {feedArticles.length} {feedArticles.length === 1 ? 'story' : 'stories'}
              </span>
            )}
            <button
              onClick={refreshArticles}
              disabled={status === 'loading'}
              className="inline-flex items-center gap-1.5 font-mono text-xs text-text-muted hover:text-signal transition-colors disabled:opacity-40 px-2.5 py-1 rounded-full border border-line/60 hover:border-signal/50 bg-surface-subtle/40"
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className={status === 'loading' ? 'animate-spin' : ''}
              >
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 21h5v-5" />
              </svg>
              <span>{status === 'loading' ? 'Syncing…' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {status === 'loading' && (
          <ArticleSkeleton showLead={activeCategory === 'All' && !search} />
        )}

        {status === 'error' && (
          <div className="py-20 text-center border border-dashed border-line rounded-xl bg-surface/20">
            <div className="w-10 h-10 rounded-full bg-surface-subtle border border-line flex items-center justify-center mx-auto mb-3 text-rose-400 font-mono text-sm">
              !
            </div>
            <p className="font-display text-xl text-text-primary mb-1.5">
              Couldn't load feed
            </p>
            <p className="text-text-muted text-xs sm:text-sm max-w-sm mx-auto mb-5 leading-relaxed">
              We encountered an issue connecting to the live news feeds.
            </p>
            <button
              onClick={refreshArticles}
              className="text-xs font-mono uppercase tracking-wider border border-line hover:border-signal text-text-primary hover:text-signal transition-colors rounded-full px-5 py-2 bg-surface-subtle"
            >
              Try again
            </button>
          </div>
        )}

        {status === 'ready' && <ArticleGrid articles={feedArticles} />}
      </main>

      <Footer />
    </div>
  )
}
