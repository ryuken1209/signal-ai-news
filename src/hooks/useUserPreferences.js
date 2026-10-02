import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { fetchUserPreferences, updateUserPreferences } from '../services/userDataService'
import { notify } from '../utils/toast'

export function useUserPreferences() {
  const { user, isConfigured } = useAuth()
  const [preferences, setPreferences] = useState({ theme: 'dark', email_digest: false })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    if (!user || !isConfigured) return

    setLoading(true)
    fetchUserPreferences(user.id)
      .then((data) => {
        if (!cancelled && data) {
          setPreferences({
            theme: data.theme || 'dark',
            email_digest: Boolean(data.email_digest),
            ...data.preferences,
          })
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [user, isConfigured])

  const setPreference = useCallback(
    async (key, value) => {
      const next = { ...preferences, [key]: value }
      setPreferences(next)

      if (!user || !isConfigured) return

      try {
        await updateUserPreferences(user.id, { [key]: value })
        notify('Preferences updated')
      } catch (err) {
        console.error('[useUserPreferences] Update error:', err)
        notify('Failed to save preference')
      }
    },
    [preferences, user, isConfigured]
  )

  return { preferences, loading, setPreference }
}
