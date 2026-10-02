import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { fetchArticleLikeInfo, likeArticle, unlikeArticle } from '../services/userDataService'
import { notify } from '../utils/toast'

export function useLike(article) {
  const { user, isConfigured } = useAuth()
  const articleId = article?.id
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    if (!articleId || !isConfigured) {
      setIsLiked(false)
      setLikeCount(0)
      return
    }

    fetchArticleLikeInfo(user?.id, articleId)
      .then((info) => {
        if (!cancelled) {
          setIsLiked(info.isLiked)
          setLikeCount(info.count)
        }
      })
      .catch((err) => {
        console.warn('[useLike] Fetch error:', err)
      })

    return () => {
      cancelled = true
    }
  }, [user?.id, articleId, isConfigured])

  const toggleLike = useCallback(
    async (e) => {
      if (e?.preventDefault) e.preventDefault()
      if (e?.stopPropagation) e.stopPropagation()

      if (!user) {
        notify('Sign in to like articles')
        return
      }

      if (!isConfigured) {
        notify('Supabase credentials needed in .env to like articles')
        return
      }

      if (loading || !article) return

      setLoading(true)
      const nextLiked = !isLiked
      const nextCount = Math.max(0, likeCount + (nextLiked ? 1 : -1))

      // Optimistic update
      setIsLiked(nextLiked)
      setLikeCount(nextCount)

      try {
        if (nextLiked) {
          await likeArticle(user.id, article)
        } else {
          await unlikeArticle(user.id, article.id)
        }
      } catch (err) {
        console.error('[useLike] Toggle error:', err)
        // Rollback
        setIsLiked(!nextLiked)
        setLikeCount(likeCount)
        notify('Could not update like')
      } finally {
        setLoading(false)
      }
    },
    [user, isConfigured, loading, article, isLiked, likeCount]
  )

  return { isLiked, likeCount, toggleLike, loading }
}
