import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useNotifications } from '../../hooks/useNotifications'
import { formatRelativeTime } from '../../data/sampleArticles'

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') setIsOpen(false)
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <div className="relative" ref={menuRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Notifications"
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="relative p-2 text-text-faint hover:text-text-primary transition-all rounded-full hover:bg-surface-hover border border-transparent hover:border-line/60"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute 0 right-0 min-w-[15px] h-[15px] px-1 rounded-full bg-signal text-ink font-mono text-[9px] font-bold flex items-center justify-center leading-none shadow-[0_0_8px_rgba(95,201,248,0.6)]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Frosted Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface-elevated/95 backdrop-blur-xl border border-line rounded-xl shadow-2xl z-50 animate-scale-subtle overflow-hidden">
          {/* Header */}
          <div className="p-3.5 border-b border-line/80 flex items-center justify-between bg-surface/30">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-text-primary font-semibold">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="font-mono text-[10px] text-signal bg-signal-muted px-2 py-0.5 rounded-full border border-signal/30 font-medium">
                  {unreadCount} unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[11px] font-mono text-text-faint hover:text-signal transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-line/50">
            {notifications.length === 0 ? (
              <div className="py-8 text-center px-4">
                <p className="font-mono text-xs text-text-faint">
                  You're all caught up.
                </p>
                <p className="text-[11px] text-text-faint mt-1">
                  Stories matching your followed topics will alert here.
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isUnread = !notif.read
                const linkTarget = notif.article_id ? `/article/${notif.article_id}` : null

                const content = (
                  <div
                    className={`p-3.5 text-left transition-colors flex items-start gap-2.5 ${
                      isUnread ? 'bg-signal/5 hover:bg-signal/10' : 'hover:bg-surface-hover'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${
                        isUnread ? 'bg-signal shadow-[0_0_6px_rgba(95,201,248,0.7)]' : 'bg-text-faint/30'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-text-primary mb-0.5 line-clamp-1">
                        {notif.title}
                      </p>
                      {notif.message && (
                        <p className="text-[11px] text-text-muted line-clamp-2 leading-relaxed mb-1">
                          {notif.message}
                        </p>
                      )}
                      <span className="font-mono text-[10px] text-text-faint">
                        {formatRelativeTime(notif.created_at)}
                      </span>
                    </div>
                  </div>
                )

                if (linkTarget) {
                  return (
                    <Link
                      key={notif.id}
                      to={linkTarget}
                      onClick={() => {
                        markAsRead(notif.id)
                        setIsOpen(false)
                      }}
                      className="block"
                    >
                      {content}
                    </Link>
                  )
                }

                return (
                  <div
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className="cursor-pointer"
                  >
                    {content}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
