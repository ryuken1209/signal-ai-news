import { useEffect, useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { AuthContext } from './authContextDef'

export function AuthProvider({ children }) {
  const configured = isSupabaseConfigured()
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(configured)

  const fetchProfile = useCallback(async (userId) => {
    if (!configured || !userId) {
      setProfile(null)
      return null
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.warn('[AuthContext] Could not fetch profile:', error.message)
        return null
      }
      setProfile(data)
      return data
    } catch (err) {
      console.warn('[AuthContext] Profile fetch error:', err)
      return null
    }
  }, [configured])

  useEffect(() => {
    if (!configured) return

    let isMounted = true

    // Initial session check
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!isMounted) return
      setSession(initialSession)
      setUser(initialSession?.user ?? null)
      if (initialSession?.user) {
        fetchProfile(initialSession.user.id).finally(() => {
          if (isMounted) setLoading(false)
        })
      } else {
        setLoading(false)
      }
    })

    // Listen for auth state changes (sign in, sign out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!isMounted) return
      setSession(currentSession)
      setUser(currentSession?.user ?? null)
      if (currentSession?.user) {
        await fetchProfile(currentSession.user.id)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [configured, fetchProfile])

  const signIn = async ({ email, password }) => {
    if (!configured) {
      throw new Error(
        'Supabase is not configured yet. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
      )
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  const signUp = async ({ email, password, displayName, username }) => {
    if (!configured) {
      throw new Error(
        'Supabase is not configured yet. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
      )
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName || email.split('@')[0],
          username: username || email.split('@')[0],
        },
      },
    })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    if (!configured) {
      setUser(null)
      setSession(null)
      setProfile(null)
      return
    }
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
    setSession(null)
    setProfile(null)
  }

  const resetPassword = async (email) => {
    if (!configured) {
      throw new Error(
        'Supabase is not configured yet. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
      )
    }
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    })
    if (error) throw error
    return data
  }

  const value = {
    user,
    session,
    profile,
    loading,
    isConfigured: configured,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshProfile: () => (user ? fetchProfile(user.id) : Promise.resolve(null)),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
