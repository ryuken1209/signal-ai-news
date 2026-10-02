import { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import { useCollections } from '../hooks/useCollections'

export default function Collections() {
  const { collections, loading, createCollection, deleteCollection } = useCollections()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPrivate, setIsPrivate] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    try {
      await createCollection({
        name: name.trim(),
        description: description.trim(),
        isPrivate,
      })
      setName('')
      setDescription('')
      setIsModalOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (e, collectionId, colName) => {
    e.preventDefault()
    e.stopPropagation()
    if (window.confirm(`Delete collection "${colName}"? Articles inside will not be deleted.`)) {
      await deleteCollection(collectionId)
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
              <span>Curated Dossiers</span>
            </div>
            <h1 className="font-display text-3xl sm:text-5xl text-text-primary tracking-tight font-normal">
              Collections
            </h1>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-signal text-ink font-mono text-xs uppercase tracking-wider font-semibold rounded-full hover:bg-signal/90 transition-all self-start sm:self-auto shadow-[0_0_14px_rgba(95,201,248,0.25)]"
          >
            <span>+</span> New Collection
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-surface/40 p-6 rounded-xl border border-line/60 h-48 space-y-4">
                <div className="h-5 w-1/2 bg-surface-subtle rounded" />
                <div className="h-3 w-3/4 bg-surface-subtle rounded" />
                <div className="h-4 w-1/4 bg-surface-subtle rounded mt-6" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && collections.length === 0 && (
          <div className="py-20 text-center max-w-md mx-auto rounded-xl border border-dashed border-line/80 bg-surface/20 p-8 my-8">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full border border-line flex items-center justify-center text-signal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h2 className="font-display text-2xl text-text-primary mb-2 font-normal">
              No curated folders yet
            </h2>
            <p className="text-text-muted text-xs sm:text-sm mb-6 leading-relaxed">
              Organize your research into thematic folders — like "LLM Inference", "Autonomous Agents", or "Weekend Reading".
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2.5 text-xs font-mono uppercase tracking-wider bg-signal text-ink font-semibold rounded-full hover:bg-signal/90 transition-all"
            >
              Create first collection
            </button>
          </div>
        )}

        {/* Collections Grid */}
        {!loading && collections.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((col) => {
              const articleCount = col.articles?.[0]?.count ?? col.article_count ?? 0
              return (
                <Link
                  key={col.id}
                  to={`/collections/${col.id}`}
                  className="group relative bg-surface/30 backdrop-blur-sm border border-line/70 hover:border-line-bright p-6 rounded-xl transition-all duration-300 flex flex-col justify-between card-lift"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-4">
                      <div className="w-9 h-9 rounded-lg bg-surface-subtle border border-line flex items-center justify-center text-text-muted group-hover:text-signal group-hover:border-signal/40 transition-colors">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                        </svg>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-text-faint uppercase px-2 py-0.5 border border-line/60 rounded-full bg-surface-subtle">
                          {col.is_private ? 'Private' : 'Public'}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(e, col.id, col.name)}
                          title="Delete collection"
                          className="text-text-faint hover:text-rose-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity p-1 font-mono"
                        >
                          ×
                        </button>
                      </div>
                    </div>

                    <h2 className="font-display text-xl text-text-primary group-hover:text-signal transition-colors mb-2 line-clamp-1 font-normal">
                      {col.name}
                    </h2>

                    {col.description ? (
                      <p className="text-text-muted text-xs line-clamp-2 leading-relaxed mb-6 font-normal">
                        {col.description}
                      </p>
                    ) : (
                      <p className="text-text-faint text-xs italic mb-6">
                        No description provided
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-line/60 flex items-center justify-between font-mono text-xs text-text-faint">
                    <span>
                      {articleCount} {articleCount === 1 ? 'story' : 'stories'}
                    </span>
                    <span className="text-signal group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      <span>Open</span>
                      <span>→</span>
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Create Modal */}
        {isModalOpen && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-sm"
          >
            <div className="bg-surface border border-line rounded-sm max-w-md w-full p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-line mb-5">
                <h3 className="font-display text-xl text-text-primary">
                  Create Collection
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-text-faint hover:text-text-primary text-xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block font-mono text-xs text-text-muted uppercase tracking-wide mb-1.5">
                    Collection Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AI Research Papers"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-ink border border-line rounded-sm px-3 py-2 text-sm text-text-primary placeholder:text-text-faint outline-none focus:border-signal"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs text-text-muted uppercase tracking-wide mb-1.5">
                    Description (optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="What is this collection about?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-ink border border-line rounded-sm px-3 py-2 text-sm text-text-primary placeholder:text-text-faint outline-none focus:border-signal resize-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="rounded border-line bg-ink text-signal focus:ring-0"
                  />
                  <label htmlFor="isPrivate" className="text-xs text-text-muted">
                    Make this collection private (only you can see it)
                  </label>
                </div>

                <div className="pt-4 border-t border-line flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-mono text-text-faint hover:text-text-primary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !name.trim()}
                    className="px-5 py-2 text-xs font-mono uppercase tracking-wider bg-signal text-ink font-semibold rounded-sm hover:bg-signal/90 transition-colors disabled:opacity-40"
                  >
                    {submitting ? 'Creating…' : 'Create Collection'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
