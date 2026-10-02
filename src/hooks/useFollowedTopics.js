import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import {
  fetchFollowedTopics,
  followTopic as followService,
  unfollowTopic as unfollowService,
} from '../services/userDataService'
import { notify } from '../utils/toast'

export function useFollowedTopics() {
  const { user, isConfigured } = useAuth()
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(false)

  const loadTopics = useCallback(async () => {
    if (!user || !isConfigured) {
      setTopics([])
      return
    }
    setLoading(true)
    try {
      const data = await fetchFollowedTopics(user.id)
      setTopics(data)
    } catch (err) {
      console.error('[useFollowedTopics] Load error:', err)
    } finally {
      setLoading(false)
    }
  }, [user, isConfigured])

  useEffect(() => {
    loadTopics()
  }, [loadTopics])

  const isFollowing = useCallback(
    (topic) => {
      if (!topic) return false
      return topics.some((t) => t.toLowerCase() === topic.trim().toLowerCase())
    },
    [topics]
  )

  const toggleFollow = useCallback(
    async (topic) => {
      if (!topic) return
      const cleanTopic = topic.trim()

      if (!user) {
        notify('Sign in to follow topics')
        return
      }

      if (!isConfigured) {
        notify('Supabase credentials needed in .env to follow topics')
        return
      }

      const following = isFollowing(cleanTopic)
      const nextTopics = following
        ? topics.filter((t) => t.toLowerCase() !== cleanTopic.toLowerCase())
        : [...topics, cleanTopic]

      // Optimistic update
      setTopics(nextTopics)

      try {
        if (following) {
          await unfollowService(user.id, cleanTopic)
          notify(`Unfollowed ${cleanTopic}`)
        } else {
          await followService(user.id, cleanTopic)
          notify(`Now following ${cleanTopic}`)
        }
      } catch (err) {
        console.error('[useFollowedTopics] Toggle error:', err)
        setTopics(topics) // rollback
        notify('Could not update followed topic')
      }
    },
    [user, isConfigured, isFollowing, topics]
  )

  return { topics, loading, isFollowing, toggleFollow, loadTopics }
}
