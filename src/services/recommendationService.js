import { getArticles } from './newsService.js'
import {
  fetchFollowedTopics,
  fetchReadingHistory,
  fetchSavedArticles,
} from './userDataService.js'
import { supabase, isSupabaseConfigured } from '../lib/supabase.js'

/**
 * Deterministic recommendation scoring model:
 * - Followed topic match:               +40
 * - Category affinity (from history):   +25
 * - Saved story category match:         +20
 * - Liked story category match:         +15
 * - Trending score:                     +10
 * - Already read penalty:               -30
 */
export function rankArticlesForUser(articles, userSignals) {
  if (!Array.isArray(articles) || articles.length === 0) return []

  const {
    followedTopics = [],
    history = [],
    saved = [],
    likedArticleIds = new Set(),
    likedCategories = new Set(),
  } = userSignals || {}

  // Set of already read article IDs
  const readArticleIds = new Set(
    history.map((h) => h.article?.id || h.article_id).filter(Boolean)
  )

  // Frequency of categories read in history
  const readCategoryCounts = {}
  history.forEach((h) => {
    const cat = (h.article?.category || '').toLowerCase()
    if (cat) readCategoryCounts[cat] = (readCategoryCounts[cat] || 0) + 1
  })

  // Set of categories in saved articles
  const savedCategories = new Set(
    saved.map((s) => (s.article?.category || '').toLowerCase()).filter(Boolean)
  )

  // Normalized followed topics
  const normalizedFollows = followedTopics.map((t) => t.toLowerCase().trim())

  return articles
    .map((article) => {
      let score = 0
      let recommendationReason = ''

      const artCategory = (article.category || '').toLowerCase()
      const artTitle = (article.title || '').toLowerCase()
      const artTags = (article.tags || []).map((t) => (t || '').toLowerCase())

      // 1. Followed topic match (+40)
      const matchedFollowedTopic = normalizedFollows.find(
        (t) =>
          t === artCategory ||
          artTags.includes(t) ||
          artTitle.includes(t)
      )
      if (matchedFollowedTopic) {
        score += 40
        recommendationReason = `Because you follow #${article.category}`
      }

      // 2. Category affinity from reading history (+25)
      if (readCategoryCounts[artCategory]) {
        score += 25
        if (!recommendationReason) {
          recommendationReason = `Based on your reading in ${article.category}`
        }
      }

      // 3. Saved story category match (+20)
      if (savedCategories.has(artCategory)) {
        score += 20
        if (!recommendationReason) {
          recommendationReason = `Related to stories in your library`
        }
      }

      // 4. Liked story match (+15)
      if (likedArticleIds.has(article.id) || likedCategories.has(artCategory)) {
        score += 15
        if (!recommendationReason) {
          recommendationReason = `Matches stories you've liked`
        }
      }

      // 5. Trending score (+10)
      if (article.trending || (article.trendingScore && article.trendingScore > 10)) {
        score += 10
        if (!recommendationReason) {
          recommendationReason = `Trending across Signal`
        }
      }

      // 6. Already read penalty (-30)
      const isAlreadyRead = readArticleIds.has(article.id)
      if (isAlreadyRead) {
        score -= 30
      }

      if (!recommendationReason) {
        recommendationReason = `Recommended in ${article.category}`
      }

      return {
        ...article,
        recommendationScore: score,
        recommendationReason,
        isAlreadyRead,
      }
    })
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
}

/**
 * Loads all user signals and live articles, returning personalized recommendations.
 */
export async function getPersonalizedRecommendations(userId) {
  // Fetch live articles (from RSS feed /api/news)
  const { articles = [] } = await getArticles({ category: 'All' }).catch(() => ({ articles: [] }))

  if (!userId || !isSupabaseConfigured()) {
    return {
      articles,
      isPersonalized: false,
    }
  }

  try {
    // Parallel fetch of real user data
    const [followedTopics, history, saved, likesRes] = await Promise.all([
      fetchFollowedTopics(userId).catch(() => []),
      fetchReadingHistory(userId, 50).catch(() => []),
      fetchSavedArticles(userId).catch(() => []),
      supabase
        .from('likes')
        .select(`
          article_id,
          article:articles (category)
        `)
        .eq('user_id', userId)
        .catch(() => ({ data: [] })),
    ])

    const likedArticleIds = new Set((likesRes.data || []).map((l) => l.article_id).filter(Boolean))
    const likedCategories = new Set(
      (likesRes.data || [])
        .map((l) => (l.article?.category || '').toLowerCase())
        .filter(Boolean)
    )

    const userSignals = {
      followedTopics,
      history,
      saved,
      likedArticleIds,
      likedCategories,
    }

    const ranked = rankArticlesForUser(articles, userSignals)

    return {
      articles: ranked,
      isPersonalized: true,
      userSignalsSummary: {
        followedCount: followedTopics.length,
        historyCount: history.length,
        savedCount: saved.length,
      },
    }
  } catch (err) {
    console.error('[recommendationService] Error generating recommendations:', err)
    return {
      articles,
      isPersonalized: false,
    }
  }
}
