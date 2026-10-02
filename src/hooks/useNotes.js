import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { fetchArticleNote, saveArticleNote, deleteArticleNote } from '../services/userDataService'
import { notify } from '../utils/toast'

export function useNotes(article) {
  const { user, isConfigured } = useAuth()
  const articleId = article?.id
  const [note, setNote] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    if (!user || !articleId || !isConfigured) {
      setNote(null)
      return
    }

    setLoading(true)
    fetchArticleNote(user.id, articleId)
      .then((data) => {
        if (!cancelled) setNote(data)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [user, articleId, isConfigured])

  const saveNote = useCallback(
    async (content) => {
      if (!user) {
        notify('Sign in to save notes')
        return null
      }
      if (!isConfigured) {
        notify('Supabase credentials needed in .env to save notes')
        return null
      }
      if (!content.trim()) return null

      setSaving(true)
      try {
        const saved = await saveArticleNote(user.id, article, content.trim())
        setNote(saved)
        notify('Note saved')
        return saved
      } catch (err) {
        console.error('[useNotes] Save error:', err)
        notify('Failed to save note')
        throw err
      } finally {
        setSaving(false)
      }
    },
    [user, isConfigured, article]
  )

  const deleteNote = useCallback(async () => {
    if (!user || !articleId) return false
    setSaving(true)
    try {
      await deleteArticleNote(user.id, articleId)
      setNote(null)
      notify('Note removed')
      return true
    } catch (err) {
      console.error('[useNotes] Delete error:', err)
      notify('Failed to delete note')
      return false
    } finally {
      setSaving(false)
    }
  }, [user, articleId])

  return { note, loading, saving, saveNote, deleteNote }
}
