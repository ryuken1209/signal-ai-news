import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { ensureArticleInSupabase } from './articleSync'

// ============================================================================
// 1. SAVED ARTICLES (BOOKMARKS)
// ============================================================================

export async function fetchSavedArticles(userId) {
  if (!isSupabaseConfigured() || !userId) return []
  const { data, error } = await supabase
    .from('saved_articles')
    .select(`
      id,
      created_at,
      article:articles (
        id,
        title,
        description,
        url,
        source,
        source_url,
        image_url,
        published_at,
        category,
        reading_time_min
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[userDataService] fetchSavedArticles error:', error)
    throw error
  }

  // Format into standard unified article format
  return (data || [])
    .filter((item) => item.article)
    .map((item) => ({
      id: item.article.id,
      title: item.article.title,
      description: item.article.description,
      url: item.article.url,
      source: item.article.source,
      sourceUrl: item.article.source_url,
      imageUrl: item.article.image_url,
      publishedAt: item.article.published_at,
      category: item.article.category,
      readingTimeMin: item.article.reading_time_min,
      savedAt: item.created_at,
      bookmarkId: item.id,
    }))
}

export async function checkIsArticleSaved(userId, articleId) {
  if (!isSupabaseConfigured() || !userId || !articleId) return false
  const { data } = await supabase
    .from('saved_articles')
    .select('id')
    .eq('user_id', userId)
    .eq('article_id', String(articleId))
    .maybeSingle()
  return Boolean(data)
}

export async function saveArticle(userId, article) {
  if (!isSupabaseConfigured() || !userId || !article) return false
  const syncResult = await ensureArticleInSupabase(article)
  const targetId = syncResult.articleId || String(article.id)

  const { error } = await supabase
    .from('saved_articles')
    .insert({ user_id: userId, article_id: targetId })

  if (error && error.code !== '23505') {
    console.error('[userDataService] saveArticle error:', error)
    throw error
  }
  return true
}

export async function unsaveArticle(userId, articleId) {
  if (!isSupabaseConfigured() || !userId || !articleId) return false
  const { error } = await supabase
    .from('saved_articles')
    .delete()
    .eq('user_id', userId)
    .eq('article_id', String(articleId))

  if (error) {
    console.error('[userDataService] unsaveArticle error:', error)
    throw error
  }
}

export const removeSavedArticle = unsaveArticle

// ============================================================================
// 2. LIKES
// ============================================================================

export async function fetchArticleLikeInfo(userId, articleId) {
  if (!isSupabaseConfigured() || !articleId) return { count: 0, isLiked: false }

  // Real COUNT query from Supabase
  const countPromise = supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('article_id', String(articleId))

  const userPromise = userId
    ? supabase
        .from('likes')
        .select('id')
        .eq('user_id', userId)
        .eq('article_id', String(articleId))
        .maybeSingle()
    : Promise.resolve({ data: null })

  const [countRes, userRes] = await Promise.all([countPromise, userPromise])

  return {
    count: countRes.count || 0,
    isLiked: Boolean(userRes?.data),
  }
}

export async function likeArticle(userId, article) {
  if (!isSupabaseConfigured() || !userId || !article) return false
  const syncResult = await ensureArticleInSupabase(article)
  const targetId = syncResult.articleId || String(article.id)

  const { error } = await supabase
    .from('likes')
    .insert({ user_id: userId, article_id: targetId })

  if (error && error.code !== '23505') {
    console.error('[userDataService] likeArticle error:', error)
    throw error
  }
  return true
}

export async function unlikeArticle(userId, articleId) {
  if (!isSupabaseConfigured() || !userId || !articleId) return false
  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('user_id', userId)
    .eq('article_id', String(articleId))

  if (error) {
    console.error('[userDataService] unlikeArticle error:', error)
    throw error
  }
  return true
}

// ============================================================================
// 3. NOTES
// ============================================================================

export async function fetchArticleNote(userId, articleId) {
  if (!isSupabaseConfigured() || !userId || !articleId) return null
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .eq('article_id', String(articleId))
    .maybeSingle()

  if (error) {
    console.error('[userDataService] fetchArticleNote error:', error)
    return null
  }
  return data
}

export async function saveArticleNote(userId, article, content) {
  if (!isSupabaseConfigured() || !userId || !article) return null
  const syncResult = await ensureArticleInSupabase(article)
  const targetId = syncResult.articleId || String(article.id)

  const { data, error } = await supabase
    .from('notes')
    .upsert(
      {
        user_id: userId,
        article_id: targetId,
        content,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,article_id' }
    )
    .select()
    .single()

  if (error) {
    console.error('[userDataService] saveArticleNote error:', error)
    throw error
  }
  return data
}

export async function deleteArticleNote(userId, articleId) {
  if (!isSupabaseConfigured() || !userId || !articleId) return false
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('user_id', userId)
    .eq('article_id', String(articleId))

  if (error) {
    console.error('[userDataService] deleteArticleNote error:', error)
    throw error
  }
  return true
}

// ============================================================================
// 4. COLLECTIONS
// ============================================================================

export async function fetchCollections(userId) {
  if (!isSupabaseConfigured() || !userId) return []
  const { data, error } = await supabase
    .from('collections')
    .select(`
      id,
      name,
      description,
      is_private,
      created_at,
      updated_at,
      collection_articles (count)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[userDataService] fetchCollections error:', error)
    throw error
  }

  return (data || []).map((col) => ({
    id: col.id,
    name: col.name,
    description: col.description,
    isPrivate: col.is_private,
    createdAt: col.created_at,
    articleCount: col.collection_articles?.[0]?.count || 0,
  }))
}

export async function createCollection(userId, { name, description = '', isPrivate = true }) {
  if (!isSupabaseConfigured() || !userId) return null
  const { data, error } = await supabase
    .from('collections')
    .insert({
      user_id: userId,
      name,
      description,
      is_private: isPrivate,
    })
    .select()
    .single()

  if (error) {
    console.error('[userDataService] createCollection error:', error)
    throw error
  }
  return data
}

export async function updateCollection(collectionId, { name, description, isPrivate }) {
  if (!isSupabaseConfigured()) return null
  const updates = { updated_at: new Date().toISOString() }
  if (name !== undefined) updates.name = name
  if (description !== undefined) updates.description = description
  if (isPrivate !== undefined) updates.is_private = isPrivate

  const { data, error } = await supabase
    .from('collections')
    .update(updates)
    .eq('id', collectionId)
    .select()
    .single()

  if (error) {
    console.error('[userDataService] updateCollection error:', error)
    throw error
  }
  return data
}

export async function deleteCollection(collectionId) {
  if (!isSupabaseConfigured()) return false
  const { error } = await supabase
    .from('collections')
    .delete()
    .eq('id', collectionId)

  if (error) {
    console.error('[userDataService] deleteCollection error:', error)
    throw error
  }
  return true
}

export async function fetchCollectionDetails(collectionId) {
  if (!isSupabaseConfigured() || !collectionId) return null
  const { data: collection, error: colError } = await supabase
    .from('collections')
    .select('*')
    .eq('id', collectionId)
    .single()

  if (colError) throw colError

  const { data: articlesData, error: artError } = await supabase
    .from('collection_articles')
    .select(`
      added_at,
      article:articles (
        id,
        title,
        description,
        url,
        source,
        source_url,
        image_url,
        published_at,
        category,
        reading_time_min
      )
    `)
    .eq('collection_id', collectionId)
    .order('added_at', { ascending: false })

  if (artError) throw artError

  const articles = (articlesData || [])
    .filter((item) => item.article)
    .map((item) => ({
      id: item.article.id,
      title: item.article.title,
      description: item.article.description,
      url: item.article.url,
      source: item.article.source,
      sourceUrl: item.article.source_url,
      imageUrl: item.article.image_url,
      publishedAt: item.article.published_at,
      category: item.article.category,
      readingTimeMin: item.article.reading_time_min,
      addedAt: item.added_at,
    }))

  return { ...collection, articles }
}

export async function addArticleToCollection(collectionId, article) {
  if (!isSupabaseConfigured() || !collectionId || !article) return false
  const syncResult = await ensureArticleInSupabase(article)
  const targetId = syncResult.articleId || String(article.id)

  const { error } = await supabase
    .from('collection_articles')
    .insert({ collection_id: collectionId, article_id: targetId })

  if (error && error.code !== '23505') {
    console.error('[userDataService] addArticleToCollection error:', error)
    throw error
  }
  return true
}

export async function removeArticleFromCollection(collectionId, articleId) {
  if (!isSupabaseConfigured() || !collectionId || !articleId) return false
  const { error } = await supabase
    .from('collection_articles')
    .delete()
    .eq('collection_id', collectionId)
    .eq('article_id', String(articleId))

  if (error) {
    console.error('[userDataService] removeArticleFromCollection error:', error)
    throw error
  }
  return true
}

export async function fetchArticleCollectionIds(userId, articleId) {
  if (!isSupabaseConfigured() || !userId || !articleId) return []
  const { data, error } = await supabase
    .from('collection_articles')
    .select('collection_id, collections!inner(user_id)')
    .eq('article_id', String(articleId))
    .eq('collections.user_id', userId)

  if (error) {
    console.warn('[userDataService] fetchArticleCollectionIds warning:', error)
    return []
  }
  return (data || []).map((row) => row.collection_id)
}

// ============================================================================
// 5. READING HISTORY
// ============================================================================

export async function recordReadingEvent(userId, article, progressPercent = 100) {
  if (!isSupabaseConfigured() || !userId || !article) return false
  const syncResult = await ensureArticleInSupabase(article)
  const targetId = syncResult.articleId || String(article.id)

  // Upsert on (user_id, article_id) updates read_at and progress instead of creating duplicate rows
  const { error } = await supabase
    .from('reading_history')
    .upsert(
      {
        user_id: userId,
        article_id: targetId,
        progress_percent: progressPercent,
        read_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,article_id' }
    )

  if (error) {
    console.warn('[userDataService] recordReadingEvent warning:', error.message)
    return false
  }
  return true
}

export async function fetchReadingHistory(userId, limit = 50) {
  if (!isSupabaseConfigured() || !userId) return []
  const { data, error } = await supabase
    .from('reading_history')
    .select(`
      id,
      progress_percent,
      read_at,
      article:articles (
        id,
        title,
        description,
        url,
        source,
        source_url,
        image_url,
        published_at,
        category,
        reading_time_min
      )
    `)
    .eq('user_id', userId)
    .order('read_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[userDataService] fetchReadingHistory error:', error)
    throw error
  }

  return (data || [])
    .filter((item) => item.article)
    .map((item) => ({
      id: item.article.id,
      title: item.article.title,
      description: item.article.description,
      url: item.article.url,
      source: item.article.source,
      sourceUrl: item.article.source_url,
      imageUrl: item.article.image_url,
      publishedAt: item.article.published_at,
      category: item.article.category,
      readingTimeMin: item.article.reading_time_min,
      readAt: item.read_at,
      progressPercent: item.progress_percent,
      historyId: item.id,
    }))
}

export async function clearReadingHistory(userId) {
  if (!isSupabaseConfigured() || !userId) return false
  const { error } = await supabase
    .from('reading_history')
    .delete()
    .eq('user_id', userId)

  if (error) {
    console.error('[userDataService] clearReadingHistory error:', error)
    throw error
  }
  return true
}

// ============================================================================
// 6. FOLLOWED TOPICS
// ============================================================================

export async function fetchFollowedTopics(userId) {
  if (!isSupabaseConfigured() || !userId) return []
  const { data, error } = await supabase
    .from('followed_topics')
    .select('topic, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.warn('[userDataService] fetchFollowedTopics warning:', error)
    return []
  }
  return (data || []).map((row) => row.topic)
}

export async function followTopic(userId, topic) {
  if (!isSupabaseConfigured() || !userId || !topic) return false
  const { error } = await supabase
    .from('followed_topics')
    .insert({ user_id: userId, topic: topic.trim() })

  if (error && error.code !== '23505') {
    console.error('[userDataService] followTopic error:', error)
    throw error
  }
  return true
}

export async function unfollowTopic(userId, topic) {
  if (!isSupabaseConfigured() || !userId || !topic) return false
  const { error } = await supabase
    .from('followed_topics')
    .delete()
    .eq('user_id', userId)
    .eq('topic', topic.trim())

  if (error) {
    console.error('[userDataService] unfollowTopic error:', error)
    throw error
  }
  return true
}

// ============================================================================
// 7. USER PREFERENCES
// ============================================================================

export async function fetchUserPreferences(userId) {
  if (!isSupabaseConfigured() || !userId) return { theme: 'dark', email_digest: false }
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.warn('[userDataService] fetchUserPreferences warning:', error)
    return { theme: 'dark', email_digest: false }
  }
  return data || { theme: 'dark', email_digest: false }
}

export async function updateUserPreferences(userId, updates) {
  if (!isSupabaseConfigured() || !userId) return false
  const { error } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: userId,
      ...updates,
      updated_at: new Date().toISOString(),
    })

  if (error) {
    console.error('[userDataService] updateUserPreferences error:', error)
    throw error
  }
  return true
}

// ============================================================================
// 8. PROFILE UPDATE
// ============================================================================

export async function updateUserProfile(userId, { displayName, username, avatarUrl }) {
  if (!isSupabaseConfigured() || !userId) return null
  const updates = { updated_at: new Date().toISOString() }
  if (displayName !== undefined) updates.display_name = displayName
  if (username !== undefined) updates.username = username
  if (avatarUrl !== undefined) updates.avatar_url = avatarUrl

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('[userDataService] updateUserProfile error:', error)
    throw error
  }
  return data
}

// ============================================================================
// 9. DASHBOARD METRICS (Strictly real data)
// ============================================================================

export async function fetchDashboardData(userId) {
  if (!isSupabaseConfigured() || !userId) {
    return {
      stats: { saved: 0, liked: 0, read: 0, collections: 0, topics: 0 },
      recentSaved: [],
      recentRead: [],
      followedTopics: [],
    }
  }

  // Run real COUNT queries in parallel
  const [
    savedRes,
    likedRes,
    readRes,
    colRes,
    topicRes,
    recentSaved,
    recentRead,
    followedTopics,
  ] = await Promise.all([
    supabase.from('saved_articles').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('likes').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('reading_history').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('collections').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('followed_topics').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    fetchSavedArticles(userId).then((items) => items.slice(0, 5)).catch(() => []),
    fetchReadingHistory(userId, 5).catch(() => []),
    fetchFollowedTopics(userId).catch(() => []),
  ])

  return {
    stats: {
      saved: savedRes.count || 0,
      liked: likedRes.count || 0,
      read: readRes.count || 0,
      collections: colRes.count || 0,
      topics: topicRes.count || 0,
    },
    recentSaved,
    recentRead,
    followedTopics,
  }
}
