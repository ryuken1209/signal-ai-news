import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import { useAuth } from '../hooks/useAuth'
import { notify } from '../utils/toast'

export default function Login() {
  const { user, signIn, signUp, signOut, resetPassword, isConfigured } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [mode, setMode] = useState('signin') // 'signin' | 'signup' | 'forgot'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    if (!isConfigured) {
      setError(
        'Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file to enable real accounts.'
      )
      return
    }

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }

    if (mode !== 'forgot' && (!password || password.length < 6)) {
      setError('Password must be at least 6 characters long.')
      return
    }

    setLoading(true)

    try {
      if (mode === 'signin') {
        await signIn({ email: email.trim(), password })
        notify('Signed in successfully')
        navigate(from, { replace: true })
      } else if (mode === 'signup') {
        const data = await signUp({
          email: email.trim(),
          password,
          displayName: displayName.trim(),
        })
        if (data.session) {
          notify('Account created and signed in!')
          navigate(from, { replace: true })
        } else {
          setSuccessMessage(
            'Account created! Please check your email to confirm your registration before signing in.'
          )
          notify('Verification email sent')
        }
      } else if (mode === 'forgot') {
        await resetPassword(email.trim())
        setSuccessMessage(
          'Password reset instructions have been sent to your email.'
        )
        notify('Reset email sent')
      }
    } catch (err) {
      console.error('[Auth Error]', err)
      setError(err.message || 'An error occurred during authentication.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      notify('Signed out')
    } catch (err) {
      console.error('Sign out error:', err)
    }
  }

  return (
    <div className="min-h-screen flex flex-col page-transition">
      <Header />

      <main className="max-w-content mx-auto px-5 sm:px-8 py-16 flex-1 w-full flex justify-center items-center">
        <div className="max-w-md w-full bg-surface/35 backdrop-blur-xl border border-line/80 rounded-2xl p-7 sm:p-9 shadow-2xl relative overflow-hidden">
          <div className="h-[2px] w-16 bg-signal/70 rounded-full mb-6" />

          {!isConfigured && (
            <div className="mb-6 p-4 border border-amber/40 bg-amber/5 text-amber text-xs rounded-xl font-mono leading-relaxed">
              <p className="font-semibold mb-1">Supabase credentials needed</p>
              <p className="text-text-muted">
                Add <code className="text-text-primary">VITE_SUPABASE_URL</code> and{' '}
                <code className="text-text-primary">VITE_SUPABASE_ANON_KEY</code> to your{' '}
                <code className="text-text-primary">.env</code> file to activate real user accounts. See SUPABASE_SETUP.md for instructions.
              </p>
            </div>
          )}

          {user ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-signal-muted border border-signal/30 flex items-center justify-center text-signal font-mono text-lg font-semibold mb-4">
                {user.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <h1 className="font-display text-2xl sm:text-3xl text-text-primary mb-1 font-normal">
                You are signed in
              </h1>
              <p className="font-mono text-xs text-text-muted mb-8">
                {user.email}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/"
                  className="w-full sm:w-auto text-xs font-mono uppercase tracking-wider bg-signal text-ink font-semibold px-6 py-2.5 rounded-full hover:bg-signal/90 transition-all text-center shadow-[0_0_12px_rgba(95,201,248,0.25)]"
                >
                  Go to feed
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full sm:w-auto text-xs font-mono uppercase tracking-wider border border-line hover:border-text-muted text-text-muted hover:text-text-primary transition-colors px-6 py-2.5 rounded-full bg-surface-subtle"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h1 className="font-display text-2xl sm:text-3xl text-text-primary mb-2 font-normal">
                  {mode === 'signin' && 'Welcome back'}
                  {mode === 'signup' && 'Create an account'}
                  {mode === 'forgot' && 'Reset your password'}
                </h1>
                <p className="text-text-muted text-xs sm:text-sm leading-relaxed">
                  {mode === 'signin' && 'Sign in to sync saved articles, private notes, and topics.'}
                  {mode === 'signup' && 'Join Signal to personalize your technology news feed.'}
                  {mode === 'forgot' && "Enter your email and we'll send you a recovery link."}
                </p>
              </div>

              {/* Mode Selector Tabs */}
              {mode !== 'forgot' && (
                <div className="flex border-b border-line/60 mb-6 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin')
                      setError(null)
                      setSuccessMessage(null)
                    }}
                    className={`pb-2.5 px-3 font-medium transition-colors border-b-2 -mb-[1px] ${
                      mode === 'signin'
                        ? 'border-signal text-signal'
                        : 'border-transparent text-text-muted hover:text-text-primary'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup')
                      setError(null)
                      setSuccessMessage(null)
                    }}
                    className={`pb-2.5 px-3 font-medium transition-colors border-b-2 -mb-[1px] ${
                      mode === 'signup'
                        ? 'border-signal text-signal'
                        : 'border-transparent text-text-muted hover:text-text-primary'
                    }`}
                  >
                    Create Account
                  </button>
                </div>
              )}

              {error && (
                <div className="mb-5 p-3.5 border border-rose-500/40 bg-rose-500/10 text-rose-300 text-xs rounded-xl font-mono leading-relaxed">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="mb-5 p-3.5 border border-signal/40 bg-signal-muted text-signal text-xs rounded-xl font-mono leading-relaxed">
                  {successMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <label
                      htmlFor="displayName"
                      className="block font-mono text-xs text-text-faint uppercase tracking-wide mb-1.5"
                    >
                      Display Name
                    </label>
                    <input
                      id="displayName"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Ada Lovelace"
                      className="w-full bg-surface-subtle border border-line rounded-lg px-3.5 py-2 text-sm text-text-primary placeholder:text-text-faint focus:border-signal/80 outline-none transition-colors"
                    />
                  </div>
                )}

                <div>
                  <label
                    htmlFor="email"
                    className="block font-mono text-xs text-text-faint uppercase tracking-wide mb-1.5"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full bg-surface-subtle border border-line rounded-lg px-3.5 py-2 text-sm text-text-primary placeholder:text-text-faint focus:border-signal/80 outline-none transition-colors"
                  />
                </div>

                {mode !== 'forgot' && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="password"
                        className="block font-mono text-xs text-text-faint uppercase tracking-wide"
                      >
                        Password
                      </label>
                      {mode === 'signin' && (
                        <button
                          type="button"
                          onClick={() => {
                            setMode('forgot')
                            setError(null)
                            setSuccessMessage(null)
                          }}
                          className="font-mono text-xs text-text-faint hover:text-signal transition-colors"
                        >
                          Forgot?
                        </button>
                      )}
                    </div>
                    <input
                      id="password"
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-ink border border-line rounded-sm px-3 py-2 text-sm text-text-primary placeholder:text-text-faint focus:border-signal outline-none transition-colors"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !isConfigured}
                  className="w-full bg-signal text-ink font-medium text-sm py-2.5 rounded-sm hover:bg-signal/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading && (
                    <span className="inline-block w-3.5 h-3.5 border-2 border-ink border-t-transparent rounded-full animate-spin" />
                  )}
                  {!isConfigured
                    ? 'Connect Supabase to continue'
                    : mode === 'signin'
                    ? loading ? 'Signing in…' : 'Sign in'
                    : mode === 'signup'
                    ? loading ? 'Creating account…' : 'Create account'
                    : loading ? 'Sending link…' : 'Send reset instructions'}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-line text-center">
                {mode === 'forgot' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin')
                      setError(null)
                      setSuccessMessage(null)
                    }}
                    className="font-mono text-xs text-text-faint hover:text-signal transition-colors"
                  >
                    ← Back to sign in
                  </button>
                ) : (
                  <Link
                    to="/"
                    className="font-mono text-xs text-text-faint hover:text-signal transition-colors"
                  >
                    ← Back to feed
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
