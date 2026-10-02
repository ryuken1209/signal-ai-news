import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useCollections } from '../../hooks/useCollections'

export default function AddToCollectionModal({ article, isOpen, onClose }) {
  const { user } = useAuth()
  const {
    collections,
    articleCollectionIds,
    createCollection,
    toggleArticleInCollection,
    loading,
  } = useCollections(article)

  const [newCollectionName, setNewCollectionName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  if (!isOpen) return null

  const handleCreateAndAdd = async (e) => {
    e.preventDefault()
    if (!newCollectionName.trim()) return
    setIsCreating(true)
    try {
      const created = await createCollection({
        name: newCollectionName.trim(),
        description: '',
        isPrivate: true,
      })
      if (created) {
        await toggleArticleInCollection(created.id)
        setNewCollectionName('')
      }
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
    >
      <div className="bg-surface border border-line rounded-sm max-w-sm w-full p-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-line mb-4">
          <h3 className="font-display text-lg text-text-primary">
            Save to Collection
          </h3>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-text-faint hover:text-text-primary transition-colors text-lg"
          >
            ×
          </button>
        </div>

        {!user ? (
          <div className="py-4 text-center">
            <p className="text-text-muted text-sm mb-4">
              Sign in to organize your articles into custom collections.
            </p>
            <Link
              to="/login"
              className="inline-block text-xs font-medium bg-signal text-ink px-4 py-2 rounded-sm hover:bg-signal/90 transition-colors"
            >
              Sign in
            </Link>
          </div>
        ) : loading ? (
          <div className="py-6 text-center font-mono text-xs text-text-faint animate-pulse">
            Loading collections…
          </div>
        ) : (
          <div className="space-y-4">
            {collections.length === 0 ? (
              <p className="text-text-faint text-xs italic">
                You don't have any collections yet. Create your first one below!
              </p>
            ) : (
              <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                {collections.map((col) => {
                  const inCol = articleCollectionIds.includes(col.id)
                  return (
                    <button
                      key={col.id}
                      onClick={() => toggleArticleInCollection(col.id)}
                      className="w-full flex items-center justify-between p-2 rounded-sm text-left hover:bg-ink transition-colors group"
                    >
                      <span className="text-sm text-text-primary group-hover:text-signal truncate mr-2">
                        📁 {col.name}
                      </span>
                      <span
                        className={`w-4 h-4 rounded-sm border flex items-center justify-center text-xs shrink-0 transition-colors ${
                          inCol
                            ? 'bg-signal border-signal text-ink font-bold'
                            : 'border-line text-transparent'
                        }`}
                      >
                        ✓
                      </span>
                    </button>
                  )
                })}
              </div>
            )}

            <form onSubmit={handleCreateAndAdd} className="pt-3 border-t border-line">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New collection name…"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  className="flex-1 bg-ink border border-line rounded-sm px-2.5 py-1.5 text-xs text-text-primary placeholder:text-text-faint outline-none focus:border-signal"
                />
                <button
                  type="submit"
                  disabled={isCreating || !newCollectionName.trim()}
                  className="text-xs font-medium border border-line hover:border-signal/60 hover:text-signal transition-colors px-3 py-1.5 rounded-sm disabled:opacity-40 shrink-0"
                >
                  {isCreating ? 'Creating…' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
