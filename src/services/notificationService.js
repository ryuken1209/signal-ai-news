import { supabase, isSupabaseConfigured } from '../lib/supabase'

export async function fetchNotifications(userId, limit = 20) {
  if (!isSupabaseConfigured() || !userId) return []

  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.warn('[notificationService] fetchNotifications warning:', error.message)
      return []
    }

    return data || []
  } catch (err) {
    console.error('[notificationService] fetchNotifications error:', err)
    return []
  }
}

export async function markNotificationAsRead(userId, notificationId) {
  if (!isSupabaseConfigured() || !userId || !notificationId) return false

  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .eq('user_id', userId)

    if (error) throw error
    return true
  } catch (err) {
    console.error('[notificationService] markNotificationAsRead error:', err)
    return false
  }
}

export async function markAllNotificationsAsRead(userId) {
  if (!isSupabaseConfigured() || !userId) return false

  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)

    if (error) throw error
    return true
  } catch (err) {
    console.error('[notificationService] markAllNotificationsAsRead error:', err)
    return false
  }
}

/**
 * Checks latest live articles against followed topics and creates notification rows for any new matches.
 * Uses strict deduplication to prevent generating duplicate notifications on refreshes.
 */
export async function syncFollowedTopicNotifications(userId, followedTopics = [], articles = []) {
  if (!isSupabaseConfigured() || !userId || followedTopics.length === 0 || articles.length === 0) {
    return []
  }

  try {
    // 1. Get existing notifications to prevent duplicates
    const { data: existing } = await supabase
      .from('notifications')
      .select('article_id')
      .eq('user_id', userId)

    const existingArticleIds = new Set((existing || []).map((n) => n.article_id).filter(Boolean))

    const normalizedFollows = followedTopics.map((t) => t.toLowerCase().trim())
    const newNotifications = []

    // 2. Find articles matching followed topics that haven't been notified yet (limit to 3 newest)
    for (const article of articles.slice(0, 15)) {
      if (!article.id || existingArticleIds.has(article.id)) continue

      const artCategory = (article.category || '').toLowerCase().trim()
      const matched = normalizedFollows.includes(artCategory)

      if (matched) {
        newNotifications.push({
          user_id: userId,
          type: 'followed_topic',
          title: `New story in #${article.category}`,
          message: article.title,
          article_id: String(article.id),
          read: false,
        })
        existingArticleIds.add(article.id)

        if (newNotifications.length >= 3) break
      }
    }

    if (newNotifications.length > 0) {
      const { data: inserted, error } = await supabase
        .from('notifications')
        .insert(newNotifications)
        .select()

      if (error) {
        console.warn('[notificationService] sync notifications warning:', error.message)
        return []
      }
      return inserted || []
    }

    return []
  } catch (err) {
    console.warn('[notificationService] syncFollowedTopicNotifications error:', err.message)
    return []
  }
}
