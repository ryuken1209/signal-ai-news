import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from './useAuth'
import { useFollowedTopics } from './useFollowedTopics'
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  syncFollowedTopicNotifications,
} from '../services/notificationService'
import { getArticles } from '../services/newsService'

export function useNotifications() {
  const { user, isConfigured } = useAuth()
  const { topics } = useFollowedTopics()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!user || !isConfigured) {
      setNotifications([])
      return
    }

    setLoading(true)
    try {
      const data = await fetchNotifications(user.id)
      setNotifications(data)

      // Background check for followed topics new articles
      if (topics.length > 0) {
        const { articles = [] } = await getArticles().catch(() => ({ articles: [] }))
        const newNotifs = await syncFollowedTopicNotifications(user.id, topics, articles)
        if (newNotifs.length > 0) {
          setNotifications((prev) => [...newNotifs, ...prev])
        }
      }
    } catch (err) {
      console.warn('[useNotifications] Error loading notifications:', err)
    } finally {
      setLoading(false)
    }
  }, [user, isConfigured, topics])

  useEffect(() => {
    load()
  }, [load])

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length
  }, [notifications])

  const markAsRead = useCallback(
    async (notificationId) => {
      if (!user) return
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      )
      await markNotificationAsRead(user.id, notificationId)
    },
    [user]
  )

  const markAllAsRead = useCallback(async () => {
    if (!user) return
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    await markAllNotificationsAsRead(user.id)
  }, [user])

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: load,
  }
}
