import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CATEGORIES } from '../../data/sampleArticles'
import { useAuth } from '../../hooks/useAuth'
import { notify } from '../../utils/toast'
import NotificationBell from '../notifications/NotificationBell'

export default function Header({
  activeCategory,
  onSelectCategory,
  searchValue,
  onSearchChange,
  categoryOptions,
}) {
  const { user, profile, signOut } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const dropdownRef = useRef(null)
  const searchInputRef = useRef(null)

  const showSearch = typeof onSearchChange === 'function'
  const pills = categoryOptions || ['All', ...CATEGORIES]

  // Track scroll position for dynamic backdrop blur and shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 16)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownOpen])

  // Keyboard shortcut (Cmd+K / Ctrl+K) to focus search
  useEffect(() => {
    if (!showSearch) return

    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showSearch])

  const handleSignOut = async () => {
    try {
      await signOut()
      setDropdownOpen(false)
      notify('Signed out')
    } catch (err) {
      console.error('Sign out error:', err)
    }
  }

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Account'
  const userInitial = (displayName[0] || 'U').toUpperCase()
  const isMac = typeof window !== 'undefined' && navigator.platform?.toUpperCase().indexOf('MAC') >= 0

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-ink/85 backdrop-blur-xl border-b border-line/60 shadow-[0_8px_32px_rgba(0,0,0,0.4)] py-0'
          : 'bg-ink/65 backdrop-blur-md border-b border-line/35 shadow-[0_4px_20px_rgba(0,0,0,0.15)] py-0'
      }`}
    >
      <div className="max-w-content mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between py-4 gap-4">
          {/* Brand & Editorial Tag */}
          <div className="flex items-center gap-5 shrink-0">
            <Link to="/" className="group flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-signal animate-pulse-subtle shadow-[0_0_8px_rgba(95,201,248,0.6)]" />
              <h1 className="font-display text-2xl tracking-tight text-text-primary group-hover:text-signal transition-colors font-medium">
                Signal
              </h1>
              <span className="hidden md:inline font-mono text-[11px] text-text-faint tracking-wider pl-1 border-l border-line/60">
                AI &amp; TECH RADAR
              </span>
            </Link>

            <Link
              to="/for-you"
              className="font-mono text-xs text-text-muted hover:text-signal transition-all hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-subtle/70 border border-line hover:border-signal/50 hover:bg-surface-hover"
            >
              <span className="text-signal text-xs">✦</span>
              <span>For You</span>
            </Link>
          </div>

          {/* Controls: Search, Notifications, Account */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {showSearch && (
              <div className="relative flex items-center border border-line/80 hover:border-line-bright rounded-full px-3 py-1.5 text-sm text-text-muted focus-within:border-signal/70 focus-within:bg-surface/90 bg-surface/50 transition-all duration-200">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  className="shrink-0 text-text-faint"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchValue ?? ''}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search stories"
                  className="bg-transparent outline-none placeholder:text-text-faint w-24 sm:w-44 focus:w-36 sm:focus:w-56 transition-all duration-250 text-xs sm:text-sm pl-2 pr-1 text-text-primary"
                />
                {searchValue ? (
                  <button
                    onClick={() => onSearchChange('')}
                    aria-label="Clear search"
                    className="text-text-faint hover:text-text-primary transition-colors text-xs font-mono px-1"
                  >
                    ×
                  </button>
                ) : (
                  <span className="hidden lg:inline-block font-mono text-[10px] text-text-faint bg-ink/60 px-1.5 py-0.5 rounded border border-line/60 select-none">
                    {isMac ? '⌘K' : 'Ctrl K'}
                  </span>
                )}
              </div>
            )}

            {user && <NotificationBell />}

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                  className="flex items-center gap-2 border border-line hover:border-signal/50 rounded-full px-2.5 py-1 transition-all bg-surface-subtle/60 hover:bg-surface-hover group"
                >
                  <span className="w-5 h-5 rounded-full bg-signal/15 text-signal font-mono text-[11px] flex items-center justify-center font-semibold">
                    {userInitial}
                  </span>
                  <span className="text-xs font-mono text-text-muted group-hover:text-text-primary max-w-[100px] truncate hidden sm:inline">
                    {displayName}
                  </span>
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className={`text-text-faint transition-transform duration-200 ${
                      dropdownOpen ? 'rotate-180 text-signal' : ''
                    }`}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-surface-elevated/95 backdrop-blur-xl border border-line rounded-lg shadow-2xl py-2 z-50 animate-scale-subtle">
                    <div className="px-3.5 py-2.5 border-b border-line/80">
                      <p className="text-xs font-medium text-text-primary truncate">
                        {displayName}
                      </p>
                      <p className="text-[11px] font-mono text-text-faint truncate mt-0.5">
                        {user.email}
                      </p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/for-you"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
                      >
                        <span className="text-signal text-xs">✦</span>
                        <span>For You Feed</span>
                      </Link>
                      <Link
                        to="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-faint">
                          <rect width="18" height="18" x="3" y="3" rx="2" />
                          <path d="M3 9h18M9 21V9" />
                        </svg>
                        <span>Reader Journal</span>
                      </Link>
                      <Link
                        to="/saved"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-faint">
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                        <span>Saved Articles</span>
                      </Link>
                      <Link
                        to="/collections"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-faint">
                          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                        </svg>
                        <span>Collections</span>
                      </Link>
                      <Link
                        to="/history"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-faint">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 6v6l4 2" />
                        </svg>
                        <span>Reading History</span>
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-faint">
                          <circle cx="12" cy="12" r="3" />
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                        <span>Profile &amp; Settings</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-line/80">
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-3.5 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="text-xs font-mono uppercase tracking-wider border border-line hover:border-signal/70 hover:text-signal text-text-primary transition-all rounded-full px-4 py-1.5 bg-surface-subtle/50 hover:bg-surface-hover"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>

        {/* Minimalist Editorial Category Navigation */}
        {onSelectCategory && (
          <nav className="flex items-center gap-1.5 overflow-x-auto pb-3 pt-1 -mx-1 px-1 scrollbar-none">
            {pills.map((cat) => (
              <CategoryPill
                key={cat}
                label={cat}
                isActive={activeCategory === cat}
                onClick={() => onSelectCategory(cat)}
              />
            ))}
          </nav>
        )}
      </div>
    </header>
  )
}

function CategoryPill({ label, isActive, onClick }) {
  const isTrending = label === 'Trending'

  return (
    <button
      onClick={onClick}
      className={`shrink-0 text-xs font-mono px-3 py-1 rounded-full transition-all duration-200 relative ${
        isActive
          ? 'text-ink bg-signal font-semibold shadow-[0_0_12px_rgba(95,201,248,0.35)]'
          : 'text-text-muted hover:text-text-primary hover:bg-surface-hover/80 border border-transparent hover:border-line/60'
      }`}
    >
      <span className="flex items-center gap-1.5">
        {isTrending && (
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isActive ? 'bg-ink' : 'bg-amber animate-pulse-subtle'
            }`}
          />
        )}
        {label}
      </span>
    </button>
  )
}
