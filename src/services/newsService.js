// Production news comes from GET /api/news, a serverless function that
// aggregates and normalizes live RSS feeds server-side (see api/news.js).
//
// sampleArticles.js is imported ONLY as a local-dev fallback for when
// `npm run dev` is used without `vercel dev` (plain Vite can't serve
// /api routes). It is never used in production, and the UI always shows
// a visible banner when fallback data is on screen — see Home.jsx.

import { sampleArticles } from '../data/sampleArticles.js'
import { preloadInitialImages } from '../utils/imagePreloader.js'

const FETCH_TIMEOUT_MS = 10_000

async function fetchWithTimeout(url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) {
      throw new Error(`News API responded with ${res.status}`)
    }
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

export async function getArticles({ category, trending } = {}) {
  const params = new URLSearchParams()
  if (category && category !== 'All') params.set('category', category)
  if (trending) params.set('trending', 'true')

  try {
    const data = await fetchWithTimeout(`/api/news?${params.toString()}`)
    const articles = data.articles || []
    if (articles.length > 0) {
      preloadInitialImages(articles, 6)
    }
    return {
      articles,
      isFallback: false,
      sourceErrors: data.sourceErrors || [],
    }
  } catch (err) {
    // Only ever fall back in local dev (plain `vite dev`, no /api routes
    // available). In a real deployment this rethrows and the UI shows a
    // proper error state instead of silently substituting fake news.
    if (import.meta.env.DEV) {
      console.warn(
        '[newsService] /api/news unavailable — using local sample data. ' +
          'Run `vercel dev` instead of `vite dev` to test the real endpoint.',
        err
      )
      let list = sampleArticles
      if (category && category !== 'All' && category !== 'Trending') {
        list = list.filter((a) => a.category === category)
      }
      if (trending || category === 'Trending') {
        list = list.filter((a) => a.trending)
      }
      const unified = list.map((a) => ({
        id: a.id,
        title: a.title,
        description: a.summary,
        url: null,
        source: a.source,
        sourceUrl: null,
        imageUrl: null,
        publishedAt: a.publishedAt,
        category: a.category,
        tags: a.tags,
        readingTimeMin: a.readingTimeMin,
        trending: Boolean(a.trending),
      }))
      return { articles: unified, isFallback: true, sourceErrors: [] }
    }
    throw err
  }
}

export async function getArticleById(id) {
  // No single-article endpoint yet — fetch the aggregated list and find it.
  // Fine at this volume; revisit if/when articles move into Supabase with
  // real per-id lookups (Phase 3).
  const { articles, isFallback } = await getArticles({})
  const article = articles.find((a) => a.id === id)
  if (!article) throw new Error('Article not found')
  return { article, isFallback }
}
