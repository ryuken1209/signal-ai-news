import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import ArticleCard from '../components/news/ArticleCard'
import ArticleSkeleton from '../components/news/ArticleSkeleton'
import { useAuth } from '../hooks/useAuth'
import { fetchSavedArticles, removeSavedArticle } from '../services/userDataService'
import { notify } from '../utils/toast'

export default function Saved() {
  const { user, isConfigured } = useAuth()
  const [savedItems, setSavedItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterCategory, setFilterCategory] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!user || !isConfigured) {
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const data = await fetchSavedArticles(user.id)
        if (!cancelled) {
          setSavedItems(data)
        }
      } catch (err) {
        console.error('[Saved] Error fetching saved articles:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [user, isConfigured])

  const handleUnsave = async (articleId) => {
    if (!user) return
    const prev = savedItems
    setSavedItems((items) => items.filter((item) => item.article_id !== articleId && item.article?.id !== articleId))
    try {
      await removeSavedArticle(user.id, articleId)
      notify('Article removed from saved')
    } catch (err) {
      console.error('[Saved] Failed to remove saved article:', err)
      setSavedItems(prev)
      notify('Failed to remove article')
    }
  }

  const articles = useMemo(() => {
    return savedItems
      .map((item) => {
        if (!item.article) return null
        return {
          id: item.article.id,
          title: item.article.title,
          description: item.article.description,
          source: item.article.source_name || item.article.source || 'Unknown',
          sourceUrl: item.article.url,
          category: item.article.category || 'AI',
          imageUrl: item.article.image_url,
          publishedAt: item.article.published_at || item.created_at,
          readingTimeMin: item.article.reading_time_minutes || 4,
          savedAt: item.created_at,
        }
      })
      .filter(Boolean)
  }, [savedItems])

  const categories = useMemo(() => {
    const set = new Set(articles.map((a) => a.category))
    return ['ALL', ...Array.from(set)]
  }, [articles])

  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {
      const matchCat = filterCategory === 'ALL' || a.category.toLowerCase() === filterCategory.toLowerCase()
      const matchSearch =
        !searchQuery.trim() ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.source.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCat && matchSearch
    })
  }, [articles, filterCategory, searchQuery])

  return (
    <div className="min-h-screen flex flex-col page-transition">
      <Header />

      <main className="max-w-content mx-auto px-5 sm:px-8 py-10 flex-1 w-full">
        {/* Page Header */}
        <div className="border-b border-line pb-8 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 font-mono text-xs uppercase tracking-widest text-signal">
                <span className="w-1.5 h-1.5 rounded-full bg-signal animate-pulse-subtle" />
                <span>Personal Library</span>
              </div>
              <h1 className="font-display text-3xl sm:text-5xl text-text-primary tracking-tight font-normal">
                Saved Articles
              </h1>
            </div>
            <p className="font-mono text-xs text-text-faint">
              <span className="text-text-primary font-medium">{articles.length}</span> {articles.length === 1 ? 'article' : 'articles'} in your archive
            </p>
          </div>

          {/* Filter & Search Bar */}
          {articles.length > 0 && (
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              {/* Category pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-3.5 py-1 rounded-full text-xs font-mono transition-all duration-200 shrink-0 ${
                      filterCategory === cat
                        ? 'bg-signal text-ink font-semibold shadow-[0_0_10px_rgba(95,201,248,0.3)]'
                        : 'text-text-muted hover:text-text-primary bg-surface-subtle hover:bg-surface-hover border border-line/60'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative sm:w-64">
                <input
                  type="text"
                  placeholder="Search in library…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface-subtle border border-line rounded-full px-3.5 py-1.5 text-xs text-text-primary placeholder:text-text-faint outline-none focus:border-signal/70 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2 text-text-faint hover:text-text-primary text-xs font-mono"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && <ArticleSkeleton showLead={false} count={6} />}

        {/* Empty State: No Saved Articles at all */}
        {!loading && articles.length === 0 && (
          <div className="py-20 text-center max-w-md mx-auto rounded-xl border border-dashed border-line/80 bg-surface/20 p-8 my-8">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full border border-line flex items-center justify-center text-signal font-mono text-sm">
              🔖
            </div>
            <h2 className="font-display text-2xl text-text-primary mb-2 font-normal">
              Your library is empty
            </h2>
            <p className="text-text-muted text-xs sm:text-sm mb-6 leading-relaxed">
              Whenever you encounter a story you want to study or reference later, tap the bookmark icon to file it here.
            </p>
            <Link
              to="/"
              className="inline-block px-6 py-2.5 text-xs font-mono uppercase tracking-wider bg-signal text-ink font-semibold rounded-full hover:bg-signal/90 transition-all"
            >
              Browse live stream
            </Link>
          </div>
        )}

        {/* Empty State: Filter matched nothing */}
        {!loading && articles.length > 0 && filteredArticles.length === 0 && (
          <div className="py-16 text-center rounded-xl border border-dashed border-line/80 bg-surface/20 p-8">
            <p className="font-display text-lg text-text-primary mb-1">
              No matching stories found
            </p>
            <p className="text-text-muted text-xs mb-4">
              Try changing your filter category or searching for another keyword.
            </p>
            <button
              onClick={() => {
                setFilterCategory('ALL')
                setSearchQuery('')
              }}
              className="text-xs font-mono text-signal hover:underline"
            >
              Reset filters
            </button>
          </div>
        )}

        {/* Saved Articles Grid */}
        {!loading && filteredArticles.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <div key={article.id} className="relative group flex flex-col justify-between h-full">
                <div className="flex-1">
                  <ArticleCard article={article} variant="grid" />
                </div>
                <button
                  onClick={() => handleUnsave(article.id)}
                  title="Remove from saved"
                  className="absolute top-3 right-3 z-20 px-2.5 py-1 bg-ink/90 backdrop-blur-md border border-line/80 text-text-faint hover:text-rose-400 hover:border-rose-400/50 rounded-full text-[11px] font-mono opacity-0 group-hover:opacity-100 transition-all shadow-md"
                >
                  Unsave
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
