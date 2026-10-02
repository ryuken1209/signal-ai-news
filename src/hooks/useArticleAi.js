import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchArticleAiBrief } from '../services/aiService'

export function useArticleAi(article) {
  const [aiBrief, setAiBrief] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isConfigured, setIsConfigured] = useState(true)
  const [isCached, setIsCached] = useState(false)

  const articleId = article?.id
  const articleIdRef = useRef(articleId)

  useEffect(() => {
    articleIdRef.current = articleId
  }, [articleId])

  const generateBrief = useCallback(
    async (force = false) => {
      if (!article || !article.id) return

      setLoading(true)
      setError(null)

      try {
        const result = await fetchArticleAiBrief(article, force)
        // Check if active article changed during network request
        if (articleIdRef.current !== article.id) return

        setIsConfigured(result.configured)
        setIsCached(Boolean(result.isCached))

        if (result.error) {
          setError(result.error)
          setAiBrief(null)
        } else {
          setAiBrief(result.aiBrief)
          setError(null)
        }
      } catch (err) {
        if (articleIdRef.current === article.id) {
          setError(err.message || 'Failed to load AI brief')
          setAiBrief(null)
        }
      } finally {
        if (articleIdRef.current === article.id) {
          setLoading(false)
        }
      }
    },
    [article]
  )

  useEffect(() => {
    if (!articleId) {
      setAiBrief(null)
      setLoading(false)
      setError(null)
      return
    }

    generateBrief(false)
  }, [articleId, generateBrief])

  return {
    aiBrief,
    loading,
    error,
    isConfigured,
    isCached,
    generateBrief,
  }
}
