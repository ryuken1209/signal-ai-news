import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import {
  recordReadingEvent,
  fetchReadingHistory,
  clearReadingHistory as clearHistoryService,
} from '../services/userDataService'
import { notify } from '../utils/toast'

export function useReadingHistory(article = null) {
  const { user, isConfigured } = useAuth()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)

  // Auto-record reading event when an article is opened
  useEffect(() => {
    if (!user || !article?.id || !isConfigured) return
    recordReadingEvent(user.id, article, 100)
  }, [user, article, isConfigured])

  const loadHistory = useCallback(async () => {
    if (!user || !isConfigured) {
      setHistory([])
      return
    }
    setLoading(true)
    try {
      const data = await fetchReadingHistory(user.id)
      setHistory(data)
    } catch (err) {
      console.error('[useReadingHistory] Load error:', err)
    } finally {
      setLoading(false)
    }
  }, [user, isConfigured])

  const clearHistory = useCallback(async () => {
    if (!user || !isConfigured) return
    try {
      await clearHistoryService(user.id)
      setHistory([])
      notify('Reading history cleared')
    } catch (err) {
      console.error('[useReadingHistory] Clear error:', err)
      notify('Failed to clear reading history')
    }
  }, [user, isConfigured])

  return { history, loading, loadHistory, clearHistory }
}
