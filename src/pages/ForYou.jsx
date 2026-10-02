import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import ArticleCard from '../components/news/ArticleCard'
import ArticleSkeleton from '../components/news/ArticleSkeleton'
import { useAuth } from '../hooks/useAuth'
import { getPersonalizedRecommendations } from '../services/recommendationService'
import { preloadInitialImages } from '../utils/imagePreloader'

export default function ForYou() {
  const { user } = useAuth()
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    getPersonalizedRecommendations(user?.id)
      .then((res) => {
        if (!cancelled) {
          const list = res.articles || []
          if (list.length > 0) {
            preloadInitialImages(list, 6)
          }
          setArticles(list)
        }
      })
      .catch((err) => {
        console.error('[ForYou] Failed to load recommendations:', err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [user])

  const displayedArticles = filterUnreadOnly
    ? articles.filter((a) => !a.isAlreadyRead)
    : articles

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
                <span>Personalized Stream</span>
              </div>
              <h1 className="font-display text-3xl sm:text-5xl text-text-primary tracking-tight font-normal">
                For You
              </h1>
              <p className="text-text-muted text-xs sm:text-sm mt-2 max-w-xl leading-relaxed">
                {user
                  ? "Stories selected from your personal reading telemetry, saved articles, and followed technology domains."
                  : 'Sign in to activate tailored recommendations based on topics you follow and articles you read.'}
              </p>
            </div>

            {user && (
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-text-muted hover:text-text-primary transition-colors px-3 py-1.5 rounded-full border border-line bg-surface-subtle/60">
                  <input
                    type="checkbox"
                    checked={filterUnreadOnly}
                    onChange={(e) => setFilterUnreadOnly(e.target.checked)}
                    className="rounded border-line bg-ink text-signal focus:ring-0 accent-signal"
                  />
                  <span>Unread only</span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Logged-Out Invitation Banner */}
        {!user && (
          <div className="relative overflow-hidden rounded-xl border border-line bg-surface/40 backdrop-blur-md p-6 sm:p-8 mb-12 shadow-xl">
            <div className="h-[2px] w-24 bg-signal/60 rounded-full mb-4" />
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <h2 className="font-display text-xl sm:text-2xl text-text-primary mb-2 font-normal">
                  Unlock your tailored reading radar
                </h2>
                <p className="text-text-muted text-xs sm:text-sm leading-relaxed max-w-xl">
                  Signal uses real user interactions — followed categories, saved stories, and private reading history — to prioritize breakthroughs without algorithmic noise or ads.
                </p>
              </div>
              <Link
                to="/login"
                className="px-6 py-2.5 text-xs font-mono uppercase tracking-wider bg-signal text-ink font-semibold rounded-full hover:bg-signal/90 transition-all shrink-0 shadow-[0_0_16px_rgba(95,201,248,0.25)]"
              >
                Sign In / Join
              </Link>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && <ArticleSkeleton showLead={false} count={6} />}

        {/* Empty State */}
        {!loading && displayedArticles.length === 0 && (
          <div className="py-20 text-center max-w-md mx-auto rounded-xl border border-dashed border-line/80 bg-surface/20 p-8 my-8">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full border border-line flex items-center justify-center text-xl text-signal font-mono">
              ✦
            </div>
            <h2 className="font-display text-2xl text-text-primary mb-2 font-normal">
              No matching stories
            </h2>
            <p className="text-text-muted text-xs sm:text-sm mb-6 leading-relaxed">
              {filterUnreadOnly
                ? "You've read all the stories in your personalized feed! Toggle off 'Unread only' to see everything."
                : 'Explore the live stream and follow topics you care about to build your tailored feed.'}
            </p>
            {filterUnreadOnly ? (
              <button
                onClick={() => setFilterUnreadOnly(false)}
                className="px-4 py-2 text-xs font-mono bg-surface border border-line hover:border-signal text-text-primary rounded-full transition-colors"
              >
                Show all stories
              </button>
            ) : (
              <Link
                to="/"
                className="px-6 py-2.5 text-xs font-mono uppercase tracking-wider bg-signal text-ink font-semibold rounded-full hover:bg-signal/90 transition-colors inline-block"
              >
                Browse main stream
              </Link>
            )}
          </div>
        )}

        {/* Personalized Magazine Grid */}
        {!loading && displayedArticles.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedArticles.map((article, idx) => (
              <div key={article.id} className="flex flex-col justify-between h-full">
                {user && article.recommendationReason && (
                  <div className="mb-2">
                    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-signal px-2.5 py-0.5 rounded-full bg-signal-muted border border-signal/25 font-medium">
                      <span>✦</span>
                      <span>{article.recommendationReason}</span>
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <ArticleCard
                    article={article}
                    variant="grid"
                    priority={idx < 3}
                    fetchPriority={idx === 0 ? 'high' : 'auto'}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
