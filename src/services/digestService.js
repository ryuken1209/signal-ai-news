import { fetchFollowedTopics } from './userDataService'
import { getArticles } from './newsService'

/**
 * Daily Briefing Digest Foundation
 *
 * Compiles a structured editorial digest for a user based on their followed topics
 * and top trending stories.
 *
 * Note: Scheduled delivery (via Vercel Cron or GitHub Actions) and actual SMTP/API
 * email dispatch requires an external email provider (e.g. Resend, SendGrid, or Postmark)
 * configured with an API key (e.g. RESEND_API_KEY). Signal will never pretend an email
 * was dispatched if no email provider is configured.
 */
export async function generateDailyDigestForUser(userId) {
  if (!userId) return null

  const [followedTopics, { articles = [] }] = await Promise.all([
    fetchFollowedTopics(userId).catch(() => []),
    getArticles({ category: 'All' }).catch(() => ({ articles: [] })),
  ])

  const normalizedFollows = followedTopics.map((t) => t.toLowerCase().trim())

  // Match stories against followed topics
  const matchingStories = articles.filter((article) => {
    const cat = (article.category || '').toLowerCase().trim()
    const tags = (article.tags || []).map((t) => (t || '').toLowerCase())
    return normalizedFollows.includes(cat) || tags.some((t) => normalizedFollows.includes(t))
  })

  // Fallback to top trending if no matching followed topic stories
  const selectedStories = matchingStories.length >= 3
    ? matchingStories.slice(0, 5)
    : articles.slice(0, 5)

  return {
    userId,
    generatedAt: new Date().toISOString(),
    recipientTopics: followedTopics,
    storyCount: selectedStories.length,
    stories: selectedStories.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      source: s.source,
      category: s.category,
      url: s.url || s.sourceUrl,
    })),
    emailProviderConfigured: Boolean(
      typeof process !== 'undefined' && (process.env?.RESEND_API_KEY || process.env?.SENDGRID_API_KEY)
    ),
  }
}
