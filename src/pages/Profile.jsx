import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import { useAuth } from '../hooks/useAuth'
import { updateUserProfile } from '../services/userDataService'
import { useUserPreferences } from '../hooks/useUserPreferences'
import { useFollowedTopics } from '../hooks/useFollowedTopics'
import { notify } from '../utils/toast'

export default function Profile() {
  const { user, profile, refreshProfile, signOut } = useAuth()
  const navigate = useNavigate()
  const { preferences, setPreference } = useUserPreferences()
  const { topics, toggleFollow, loading: topicsLoading } = useFollowedTopics()

  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '')
      setUsername(profile.username || '')
      setAvatarUrl(profile.avatar_url || '')
    } else if (user) {
      setDisplayName(user.user_metadata?.display_name || '')
      setUsername(user.user_metadata?.username || user.email?.split('@')[0] || '')
    }
  }, [profile, user])

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    try {
      await updateUserProfile(user.id, {
        displayName: displayName.trim(),
        username: username.trim(),
        avatarUrl: avatarUrl.trim(),
      })
      await refreshProfile()
      notify('Profile updated successfully')
    } catch (err) {
      console.error('[Profile] Save error:', err)
      notify('Failed to save profile changes')
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      try {
        await signOut()
        notify('Signed out successfully')
        navigate('/')
      } catch (err) {
        console.error('[Profile] Sign out error:', err)
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col page-transition">
      <Header />

      <main className="max-w-content mx-auto px-5 sm:px-8 py-10 flex-1 w-full">
        {/* Page Header */}
        <div className="border-b border-line pb-8 mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 font-mono text-xs uppercase tracking-widest text-signal">
              <span className="w-1.5 h-1.5 rounded-full bg-signal animate-pulse-subtle" />
              <span>Reader Account</span>
            </div>
            <h1 className="font-display text-3xl sm:text-5xl text-text-primary tracking-tight font-normal">
              Profile &amp; Settings
            </h1>
          </div>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 border border-line/80 hover:border-rose-400/60 hover:text-rose-400 text-xs font-mono rounded-full transition-colors self-start sm:self-auto bg-surface-subtle/50"
          >
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl">
          {/* Left 2 Cols: Profile Form & Preferences */}
          <div className="lg:col-span-2 space-y-8">
            {/* Identity Form */}
            <section className="bg-surface/30 backdrop-blur-sm border border-line/80 rounded-xl p-6 sm:p-8">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-line/60">
                {/* Large Avatar */}
                <div className="w-16 h-16 rounded-full overflow-hidden bg-surface-subtle border border-line flex items-center justify-center text-signal font-mono text-xl font-semibold shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span>{(displayName[0] || user?.email?.[0] || 'U').toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <h2 className="font-display text-xl text-text-primary font-normal">
                    {displayName || 'Reader Identity'}
                  </h2>
                  <p className="font-mono text-xs text-text-faint">
                    {user?.email}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-5">
                {/* Email (Read-Only) */}
                <div>
                  <label className="block font-mono text-xs text-text-muted uppercase tracking-wide mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full bg-surface-subtle/60 border border-line/60 rounded-lg px-3.5 py-2 text-sm text-text-muted cursor-not-allowed outline-none font-mono"
                  />
                  <p className="text-[11px] font-mono text-text-faint mt-1">
                    Managed securely via Supabase Auth. Never disclosed publicly.
                  </p>
                </div>

                {/* Display Name */}
                <div>
                  <label className="block font-mono text-xs text-text-muted uppercase tracking-wide mb-1.5">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Maya Chen"
                    className="w-full bg-surface-subtle border border-line rounded-lg px-3.5 py-2 text-sm text-text-primary placeholder:text-text-faint outline-none focus:border-signal/80 transition-colors"
                  />
                </div>

                {/* Username */}
                <div>
                  <label className="block font-mono text-xs text-text-muted uppercase tracking-wide mb-1.5">
                    Username
                  </label>
                  <div className="flex items-center">
                    <span className="bg-surface-subtle border-y border-l border-line px-3 py-2 text-sm text-text-faint font-mono rounded-l-lg">
                      @
                    </span>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="mayachen"
                      className="flex-1 bg-surface-subtle border border-line rounded-r-lg px-3.5 py-2 text-sm text-text-primary placeholder:text-text-faint outline-none focus:border-signal/80 transition-colors"
                    />
                  </div>
                </div>

                {/* Avatar URL */}
                <div>
                  <label className="block font-mono text-xs text-text-muted uppercase tracking-wide mb-1.5">
                    Avatar Image URL (optional)
                  </label>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-surface-subtle border border-line rounded-lg px-3.5 py-2 text-sm text-text-primary placeholder:text-text-faint outline-none focus:border-signal/80 transition-colors font-mono text-xs"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 text-xs font-mono uppercase tracking-wider bg-signal text-ink font-semibold rounded-full hover:bg-signal/90 transition-all disabled:opacity-40 shadow-[0_0_14px_rgba(95,201,248,0.25)]"
                  >
                    {saving ? 'Saving changes…' : 'Save Profile'}
                  </button>
                </div>
              </form>
            </section>

            {/* Reading Preferences */}
            <section className="bg-surface/30 backdrop-blur-sm border border-line/80 rounded-xl p-6 sm:p-8">
              <h2 className="font-display text-xl text-text-primary mb-1 font-normal">
                Reading Preferences
              </h2>
              <p className="text-text-muted text-xs mb-6">
                Personalize your reading atmosphere and delivery channels.
              </p>

              <div className="space-y-5 divide-y divide-line/60">
                {/* Theme Selector */}
                <div className="pt-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      Interface Theme
                    </p>
                    <p className="text-xs text-text-faint">
                      High-contrast Signal editorial dark mode
                    </p>
                  </div>
                  <select
                    value={preferences.theme || 'dark'}
                    onChange={(e) => setPreference('theme', e.target.value)}
                    className="bg-surface-subtle border border-line rounded-lg px-3 py-1.5 text-xs text-text-primary outline-none focus:border-signal font-mono"
                  >
                    <option value="dark">Dark (Signal Editorial)</option>
                    <option value="system">System Default</option>
                  </select>
                </div>

                {/* Email Digest Toggle */}
                <div className="pt-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      Weekly Digest
                    </p>
                    <p className="text-xs text-text-faint">
                      Receive weekly curated breakthroughs based on your topics
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(preferences.email_digest)}
                      onChange={(e) => setPreference('email_digest', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-surface-subtle peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-primary after:border-line after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-signal border border-line" />
                  </label>
                </div>
              </div>
            </section>
          </div>

          {/* Right 1 Col: Followed Topics & Quick Info */}
          <div className="space-y-6">
            <section className="bg-surface/30 backdrop-blur-sm border border-line/80 rounded-xl p-6">
              <div className="flex items-center justify-between pb-3 border-b border-line/60 mb-3">
                <h3 className="font-mono text-xs uppercase tracking-wider text-text-muted font-semibold">
                  Followed Topics ({topics.length})
                </h3>
              </div>
              <p className="text-xs text-text-faint mb-4 leading-relaxed">
                Categories you follow influence your recommendations and notification alerts.
              </p>

              {topicsLoading ? (
                <div className="font-mono text-xs text-text-faint animate-pulse py-2">
                  Loading topics…
                </div>
              ) : topics.length === 0 ? (
                <div className="py-4 text-center">
                  <p className="text-xs text-text-faint italic mb-3">
                    You haven't followed any categories yet.
                  </p>
                  <Link
                    to="/"
                    className="font-mono text-xs text-signal hover:underline"
                  >
                    Browse stream to follow →
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {topics.map((topic) => (
                    <div
                      key={topic}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-surface-subtle/60 border border-line/60"
                    >
                      <span className="font-mono text-xs text-text-primary font-medium">
                        #{topic}
                      </span>
                      <button
                        onClick={() => toggleFollow(topic)}
                        className="text-[11px] font-mono text-text-faint hover:text-rose-400 transition-colors"
                      >
                        Unfollow
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <div className="bg-surface/30 backdrop-blur-sm border border-line/80 rounded-xl p-6">
              <h3 className="font-mono text-xs uppercase tracking-wider text-text-muted mb-2 font-semibold">
                Account Status
              </h3>
              <p className="font-mono text-xs text-signal mb-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-signal" />
                <span>Synchronized &amp; Encrypted</span>
              </p>
              <p className="text-xs text-text-faint leading-relaxed">
                Your bookmarks, notes, likes, reading history, and custom collections are preserved in your private Supabase storage.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
