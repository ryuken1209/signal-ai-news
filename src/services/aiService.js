import { supabase, isSupabaseConfigured } from '../lib/supabase'

const AI_FETCH_TIMEOUT_MS = 20_000

export async function fetchArticleAiBrief(article, forceRefresh = false) {
  if (!article || !article.id) {
    return { configured: true, aiBrief: null, error: 'Article information is missing' }
  }

  // 1. Client-side cache check from Supabase if not forcing refresh
  if (!forceRefresh && isSupabaseConfigured()) {
    try {
      const { data: cached, error: cacheErr } = await supabase
        .from('article_ai')
        .select('*')
        .eq('article_id', String(article.id))
        .maybeSingle()

      if (!cacheErr && cached && cached.summary) {
        return {
          configured: true,
          isCached: true,
          aiBrief: {
            summary: cached.summary,
            keyPoints: Array.isArray(cached.key_points) ? cached.key_points : [],
            explainSimply: cached.explain_simply || '',
            whyItMatters: cached.why_it_matters || '',
            topics: Array.isArray(cached.topics) ? cached.topics : [],
            model: cached.model || 'cached',
            createdAt: cached.created_at,
          },
          error: null,
        }
      }
    } catch (err) {
      console.warn('[aiService] Supabase cache read warning:', err)
    }
  }

  // 2. Call server-side /api/ai/article endpoint
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), AI_FETCH_TIMEOUT_MS)

  try {
    const response = await fetch('/api/ai/article', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        articleId: article.id,
        title: article.title,
        description: article.description,
        category: article.category,
        source: article.source,
        url: article.sourceUrl || article.url,
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        configured: errorData.configured !== false,
        aiBrief: null,
        error: errorData.message || errorData.error || `Server returned ${response.status}`,
      }
    }

    const data = await response.json()

    if (data.configured === false) {
      return {
        configured: false,
        aiBrief: null,
        error: data.error || 'AI provider not configured',
      }
    }

    if (!data.aiBrief || typeof data.aiBrief !== 'object') {
      return {
        configured: true,
        aiBrief: null,
        error: 'Received invalid AI response format',
      }
    }

    return {
      configured: true,
      isCached: Boolean(data.isCached),
      aiBrief: data.aiBrief,
      error: null,
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      return {
        configured: true,
        aiBrief: null,
        error: 'AI analysis timed out. Please retry.',
      }
    }

    // In plain Vite dev without Vercel serverless /api/ routes
    console.warn('[aiService] API request failed:', err.message)
    return {
      configured: false,
      aiBrief: null,
      error: 'AI endpoint is currently unreachable. Start with `vercel dev` for serverless AI.',
    }
  } finally {
    clearTimeout(timeoutId)
  }
}
