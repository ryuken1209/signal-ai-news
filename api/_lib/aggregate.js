import Parser from 'rss-parser'
import { sourcesForCategory } from './sources.js'
import { normalizeItem } from './normalize.js'

const parser = new Parser({
  timeout: 8000,
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Signal/1.0',
    Accept: 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
  },
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['media:group', 'mediaGroup'],
      ['content:encoded', 'contentEncoded'],
      ['cover_image', 'cover_image'],
    ],
  },
})
const MAX_ITEMS_PER_FEED = 15

async function fetchFeed(source) {
  const feed = await parser.parseURL(source.url)
  return (feed.items || [])
    .slice(0, MAX_ITEMS_PER_FEED)
    .map((item) => normalizeItem(item, source))
    .filter(Boolean)
}

function dedupe(articles) {
  const seenUrls = new Set()
  const seenTitles = new Set()
  const result = []

  for (const article of articles) {
    const titleKey = article.title.toLowerCase().trim()
    if (seenUrls.has(article.url) || seenTitles.has(titleKey)) continue
    seenUrls.add(article.url)
    seenTitles.add(titleKey)
    result.push(article)
  }

  return result
}

// Trending score, Phase 2 version: recency only. This is intentionally
// simple and documented as such — Phase 6 adds saves/likes/reads once
// those signals exist in Supabase, replacing this function's body without
// changing its interface.
function trendingScore(article) {
  const ageHours = (Date.now() - new Date(article.publishedAt).getTime()) / 3_600_000
  return Math.max(0, 48 - ageHours) // linear decay over 48h, floors at 0
}

export async function getArticles({ category, trending } = {}) {
  const sources = sourcesForCategory(category)

  const settled = await Promise.allSettled(sources.map(fetchFeed))

  const articles = []
  const errors = []

  settled.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      articles.push(...result.value)
    } else {
      errors.push({
        source: sources[i].name,
        url: sources[i].url,
        message: result.reason?.message || 'Unknown fetch error',
      })
    }
  })

  let deduped = dedupe(articles)

  if (trending) {
    deduped = deduped
      .map((a) => ({ ...a, trending: true, trendingScore: trendingScore(a) }))
      .sort((a, b) => b.trendingScore - a.trendingScore)
  } else {
    deduped.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
  }

  return { articles: deduped, errors, sourcesQueried: sources.length }
}
