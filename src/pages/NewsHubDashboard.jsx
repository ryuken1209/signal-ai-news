import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import { useAuth } from '../hooks/useAuth'
import { fetchDashboardData } from '../services/userDataService'
import { getPersonalizedRecommendations } from '../services/recommendationService'
import { formatRelativeTime } from '../data/sampleArticles'

export default function Dashboard() {
  const { user, profile, isConfigured } = useAuth()
  const [data, setData] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!user || !isConfigured) {
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const [res, recsRes] = await Promise.all([
          fetchDashboardData(user.id),
          getPersonalizedRecommendations(user.id).catch(() => ({ articles: [] })),
        ])
        if (!cancelled) {
          setData(res)
          setRecommendations((recsRes.articles || []).slice(0, 4))
        }
      } catch (err) {
        console.error('[Dashboard] Load error:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [user, isConfigured])

  const displayName = profile?.display_name || user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Reader'
  const stats = data?.stats || { saved: 0, liked: 0, read: 0, collections: 0, topics: 0 }

  const topTopics = useMemo(() => {
    const counts = {}
    ;(data?.recentRead || []).forEach((item) => {
      const cat = item.article?.category
      if (cat) counts[cat] = (counts[cat] || 0) + 1
    })
    ;(data?.followedTopics || []).forEach((topic) => {
      const name = topic.topic_name || topic
      counts[name] = (counts[name] || 0) + 2
    })
    return Object.entries(counts)
      .map(([name, weight]) => ({ name, weight }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 6)
  }, [data])

  return (
    <div className="min-h-screen flex flex-col page-transition">
      <Header />

      <main className="max-w-content mx-auto px-5 sm:px-8 py-12 flex-1 w-full">
        {/* Editorial Journal Welcome Header */}
        <div className="border-b border-line pb-8 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 font-mono text-xs uppercase tracking-widest text-signal">
                <span className="w-1.5 h-1.5 rounded-full bg-signal animate-pulse-subtle" />
                <span>Personal Reading Journal</span>
              </div>
              <h1 className="font-display text-3xl sm:text-5xl text-text-primary tracking-tight font-normal">
                {displayName}'s Notebook
              </h1>
            </div>
            <div className="font-mono text-xs text-text-faint flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-surface-subtle border border-line/70">
                Signal Member
              </span>
            </div>
          </div>
        </div>

        {/* Minimalist Typographic Reading Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 sm:gap-8 pb-10 mb-12 border-b border-line/70">
          <TypographicStat
            label="Stories Read"
            value={stats.read}
            link="/history"
          />
          <TypographicStat
            label="Saved Library"
            value={stats.saved}
            link="/saved"
          />
          <TypographicStat
            label="Stories Liked"
            value={stats.liked}
          />
          <TypographicStat
            label="Collections"
            value={stats.collections}
            link="/collections"
          />
          <TypographicStat
            label="Topics Followed"
            value={stats.topics}
            link="/profile"
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-6">
            <div className="h-6 w-48 bg-surface-subtle rounded-full animate-pulse" />
            <div className="h-48 bg-surface-subtle/40 rounded-xl border border-line/60 animate-pulse" />
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left 8 Columns: Journal Stream */}
            <div className="lg:col-span-8 space-y-12">
              {/* Curated Recommendations */}
              <section>
                <div className="flex items-center justify-between pb-3 border-b border-line/80 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-signal text-xs">✦</span>
                    <h2 className="font-display text-2xl text-text-primary font-normal">
                      Curated For Your Interests
                    </h2>
                  </div>
                  <Link
                    to="/for-you"
                    className="font-mono text-xs text-text-muted hover:text-signal transition-colors inline-flex items-center gap-1 group"
                  >
                    <span>Explore feed</span>
                    <span className="transition-transform group-hover:translate-x-0.5">→</span>
                  </Link>
                </div>

                {!recommendations.length ? (
                  <div className="py-8 px-6 rounded-xl border border-dashed border-line/80 bg-surface/20 text-center">
                    <p className="text-text-muted text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                      Follow topics and explore articles to train your personal reading suggestions.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recommendations.map((art) => (
                      <div
                        key={art.id}
                        className="p-4 rounded-lg border border-line/60 bg-surface/25 hover:border-line-bright hover:bg-surface/45 transition-all duration-200 card-lift flex flex-col sm:flex-row sm:items-baseline justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          {art.recommendationReason && (
                            <span className="inline-block font-mono text-[10px] text-signal px-2 py-0.5 rounded-full bg-signal-muted border border-signal/25 mb-1.5 font-medium">
                              {art.recommendationReason}
                            </span>
                          )}
                          <Link
                            to={`/article/${art.id}`}
                            className="text-base font-display text-text-primary hover:text-signal transition-colors line-clamp-1 block font-normal"
                          >
                            {art.title}
                          </Link>
                          <div className="flex items-center gap-2 mt-1 font-mono text-xs text-text-faint">
                            <span>{art.category}</span>
                            <span>·</span>
                            <span>{art.source}</span>
                          </div>
                        </div>
                        <span className="font-mono text-xs text-text-faint shrink-0 px-2 py-0.5 rounded bg-surface-subtle">
                          {art.readingTimeMin || 4}m read
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Recent Reading Log */}
              <section>
                <div className="flex items-center justify-between pb-3 border-b border-line/80 mb-6">
                  <h2 className="font-display text-2xl text-text-primary font-normal">
                    Reading Log
                  </h2>
                  <Link
                    to="/history"
                    className="font-mono text-xs text-text-muted hover:text-signal transition-colors inline-flex items-center gap-1 group"
                  >
                    <span>Full history</span>
                    <span className="transition-transform group-hover:translate-x-0.5">→</span>
                  </Link>
                </div>

                {!data?.recentRead?.length ? (
                  <div className="py-8 px-6 rounded-xl border border-dashed border-line/80 bg-surface/20 text-center">
                    <p className="text-text-muted text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                      Your journal is waiting for its first entry. Read any article from the feed to begin tracking.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-line/60">
                    {data.recentRead.map((item) => {
                      const art = item.article
                      if (!art) return null
                      return (
                        <div
                          key={item.id}
                          className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4 group"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1 font-mono text-[11px] text-text-faint">
                              <span className="text-signal font-medium">{art.category}</span>
                              <span>·</span>
                              <span className="truncate">{art.source}</span>
                            </div>
                            <Link
                              to={`/article/${art.id}`}
                              className="font-display text-base text-text-primary group-hover:text-signal transition-colors line-clamp-1 font-normal"
                            >
                              {art.title}
                            </Link>
                          </div>
                          <span className="font-mono text-xs text-text-faint shrink-0 pt-1">
                            {formatRelativeTime(item.read_at)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>

              {/* Saved For Later */}
              <section>
                <div className="flex items-center justify-between pb-3 border-b border-line/80 mb-6">
                  <h2 className="font-display text-2xl text-text-primary font-normal">
                    Saved In Library
                  </h2>
                  <Link
                    to="/saved"
                    className="font-mono text-xs text-text-muted hover:text-signal transition-colors inline-flex items-center gap-1 group"
                  >
                    <span>All bookmarks</span>
                    <span className="transition-transform group-hover:translate-x-0.5">→</span>
                  </Link>
                </div>

                {!data?.recentSaved?.length ? (
                  <div className="py-8 px-6 rounded-xl border border-dashed border-line/80 bg-surface/20 text-center">
                    <p className="text-text-muted text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                      No bookmarks saved yet. Click the bookmark icon on any card to save it for later.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-line/60">
                    {data.recentSaved.map((item) => {
                      const art = item.article
                      if (!art) return null
                      return (
                        <div
                          key={item.id}
                          className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4 group"
                        >
                          <div className="min-w-0 flex-1">
                            <span className="font-mono text-[11px] text-signal font-medium uppercase mr-2">
                              {art.category || 'AI'}
                            </span>
                            <Link
                              to={`/article/${art.id}`}
                              className="font-display text-base text-text-primary group-hover:text-signal transition-colors line-clamp-1 font-normal"
                            >
                              {art.title}
                            </Link>
                          </div>
                          <span className="font-mono text-xs text-text-faint shrink-0 pt-1">
                            {formatRelativeTime(item.created_at)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>
            </div>

            {/* Right 4 Columns: Reading Atmosphere & Topics */}
            <div className="lg:col-span-4 space-y-8">
              {/* Topics Breakdown */}
              <div className="p-6 rounded-xl border border-line/80 bg-surface/30 backdrop-blur-sm">
                <div className="flex items-center justify-between pb-3 border-b border-line/60 mb-4">
                  <h3 className="font-mono text-xs uppercase tracking-wider text-text-muted font-semibold">
                    Core Interests
                  </h3>
                  <Link to="/profile" className="font-mono text-[11px] text-signal hover:underline">
                    Edit topics
                  </Link>
                </div>

                {!topTopics.length ? (
                  <p className="text-text-faint text-xs leading-relaxed">
                    Follow categories on the feed to calibrate your interest breakdown.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {topTopics.map((topic) => (
                      <Link
                        key={topic.name}
                        to={`/?category=${encodeURIComponent(topic.name)}`}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-surface-subtle/60 border border-line/60 hover:border-signal/50 text-xs font-mono text-text-muted hover:text-signal transition-all"
                      >
                        <span className="font-medium">#{topic.name}</span>
                        <span className="text-[11px] text-text-faint">
                          {topic.weight} reads
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Direct Journal Navigation */}
              <div className="p-6 rounded-xl border border-line/80 bg-surface/30 backdrop-blur-sm">
                <h3 className="font-mono text-xs uppercase tracking-wider text-text-muted mb-4 font-semibold">
                  Library Navigation
                </h3>
                <div className="space-y-2 font-mono text-xs">
                  <JournalNavLink to="/for-you" label="✦ For You Stream" />
                  <JournalNavLink to="/saved" label="Bookmark Library" />
                  <JournalNavLink to="/collections" label="Curated Collections" />
                  <JournalNavLink to="/history" label="Reading History Log" />
                  <JournalNavLink to="/profile" label="Account & Preferences" />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

function TypographicStat({ label, value, link }) {
  const content = (
    <div className="group cursor-pointer">
      <div className="font-display text-4xl sm:text-5xl text-text-primary group-hover:text-signal transition-colors font-normal tracking-tight">
        {value}
      </div>
      <div className="font-mono text-[11px] text-text-faint group-hover:text-text-muted transition-colors uppercase tracking-wider mt-1.5">
        {label}
      </div>
    </div>
  )

  if (link) {
    return <Link to={link}>{content}</Link>
  }
  return content
}

function JournalNavLink({ to, label }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between p-2.5 rounded-lg bg-surface-subtle/50 hover:bg-surface-hover hover:text-signal transition-all border border-line/40 hover:border-line group text-text-muted"
    >
      <span>{label}</span>
      <span className="text-text-faint group-hover:text-signal transition-transform group-hover:translate-x-0.5">→</span>
    </Link>
  )
}
