import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { checkIsArticleSaved, saveArticle, unsaveArticle } from '../services/userDataService'
import { notify } from '../utils/toast'

export function useSavedArticle(article) {
  const { user, isConfigured } = useAuth()
  const articleId = article?.id
  const [isSaved, setIsSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    if (!user || !articleId || !isConfigured) {
      setIsSaved(false)
      return
    }

    checkIsArticleSaved(user.id, articleId)
      .then((saved) => {
        if (!cancelled) setIsSaved(saved)
      })
      .catch((err) => {
        console.warn('[useSavedArticle] Check error:', err)
      })

    return () => {
      cancelled = true
    }
  }, [user, articleId, isConfigured])

  const toggleSave = useCallback(
    async (e) => {
      if (e?.preventDefault) e.preventDefault()
      if (e?.stopPropagation) e.stopPropagation()

      if (!user) {
        notify('Sign in to save articles')
        return
      }

      if (!isConfigured) {
        notify('Supabase credentials needed in .env to save articles')
        return
      }

      if (loading || !article) return

      setLoading(true)
      const nextSaved = !isSaved
      setIsSaved(nextSaved) // optimistic update

      try {
        if (nextSaved) {
          await saveArticle(user.id, article)
          notify('Article saved to your bookmarks')
        } else {
          await unsaveArticle(user.id, article.id)
          notify('Article removed from bookmarks')
        }
      } catch (err) {
        console.error('[useSavedArticle] Toggle error:', err)
        setIsSaved(!nextSaved) // rollback
        notify('Could not update saved status')
      } finally {
        setLoading(false)
      }
    },
    [user, isConfigured, loading, article, isSaved]
  )

  return { isSaved, toggleSave, loading }
}
