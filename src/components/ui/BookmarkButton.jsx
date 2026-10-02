import { useSavedArticle } from '../../hooks/useSavedArticle'

export default function BookmarkButton({ article, className = '', showLabel = false }) {
  const { isSaved, toggleSave, loading } = useSavedArticle(article)

  return (
    <button
      onClick={toggleSave}
      disabled={loading}
      aria-label={isSaved ? 'Remove from saved' : 'Save article'}
      title={isSaved ? 'Saved to bookmarks' : 'Save article'}
      className={`inline-flex items-center gap-1.5 transition-colors duration-150 disabled:opacity-50 ${
        isSaved
          ? 'text-signal hover:text-signal/80'
          : 'text-text-faint hover:text-signal'
      } ${className}`}
    >
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill={isSaved ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        className={`transition-transform duration-150 ${isSaved ? 'scale-105' : 'scale-100'}`}
      >
        <path d="M19 21 12 16.5 5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
      {showLabel && (
        <span className="text-sm font-medium">
          {isSaved ? 'Saved' : 'Save'}
        </span>
      )}
    </button>
  )
}
