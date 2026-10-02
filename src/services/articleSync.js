import { supabase, isSupabaseConfigured } from '../lib/supabase'

/**
 * Safely ensures that an RSS article exists in the Supabase `articles` table
 * before user actions (save, like, note, reading history) reference it.
 * Uses the stable Phase 2 article `id` as the primary conflict target.
 */
export async function ensureArticleInSupabase(article) {
  if (!isSupabaseConfigured() || !article || !article.id) {
    return { success: false, articleId: article?.id || null }
  }

  const record = {
    id: String(article.id),
    title: article.title || 'Untitled',
    description: article.description || null,
    url: article.url || article.sourceUrl || `https://signal.news/article/${article.id}`,
    source: article.source || 'Signal Feed',
    source_url: article.sourceUrl || article.url || null,
    image_url: article.imageUrl || null,
    published_at: article.publishedAt || new Date().toISOString(),
    category: article.category || 'General',
    reading_time_min: Number(article.readingTimeMin) || 2,
  }

  try {
    const { error } = await supabase
      .from('articles')
      .upsert(record, { onConflict: 'id', ignoreDuplicates: true })

    if (error) {
      // If error was a unique URL conflict with a different ID, fetch the existing ID
      if (error.code === '23505' && error.message?.includes('articles_url_key')) {
        const { data: existing } = await supabase
          .from('articles')
          .select('id')
          .eq('url', record.url)
          .maybeSingle()
        if (existing?.id) {
          return { success: true, articleId: existing.id }
        }
      }
      console.warn('[articleSync] Upsert article warning:', error.message)
      return { success: false, error, articleId: record.id }
    }

    return { success: true, articleId: record.id }
  } catch (err) {
    console.warn('[articleSync] Error syncing article:', err)
    return { success: false, error: err, articleId: record.id }
  }
}
