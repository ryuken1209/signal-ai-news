import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import ArticleCard from '../components/news/ArticleCard'
import {
  fetchCollectionDetails,
  updateCollection,
  deleteCollection,
  removeArticleFromCollection,
} from '../services/userDataService'
import { notify } from '../utils/toast'

export default function CollectionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [collection, setCollection] = useState(null)
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editPrivate, setEditPrivate] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const data = await fetchCollectionDetails(id)
        if (!cancelled && data) {
          setCollection(data.collection)
          setArticles(data.articles || [])
          setEditName(data.collection.name)
          setEditDesc(data.collection.description || '')
          setEditPrivate(data.collection.is_private)
        }
      } catch (err) {
        console.error('[CollectionDetail] Failed to load:', err)
        notify('Failed to load collection')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [id])

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!editName.trim()) return
    setSaving(true)
    try {
      const updated = await updateCollection(id, {
        name: editName.trim(),
        description: editDesc.trim(),
        isPrivate: editPrivate,
      })
      if (updated) {
        setCollection((prev) => ({
          ...prev,
          name: updated.name,
          description: updated.description,
          is_private: updated.is_private,
        }))
        setIsEditing(false)
        notify('Collection updated')
      }
    } catch (err) {
      console.error('[CollectionDetail] Update error:', err)
      notify('Failed to update collection')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm(`Delete this collection? The articles will remain saved.`)) {
      try {
        await deleteCollection(id)
        notify('Collection deleted')
        navigate('/collections')
      } catch (err) {
        console.error('[CollectionDetail] Delete error:', err)
        notify('Failed to delete collection')
      }
    }
  }

  const handleRemoveArticle = async (articleId) => {
    const prev = articles
    setArticles((items) => items.filter((a) => a.id !== articleId))
    try {
      await removeArticleFromCollection(id, articleId)
      notify('Article removed from collection')
    } catch (err) {
      console.error('[CollectionDetail] Remove article error:', err)
      setArticles(prev)
      notify('Failed to remove article')
    }
  }

  return (
    <div className="min-h-screen flex flex-col page-transition">
      <Header />

      <main className="max-w-content mx-auto px-5 sm:px-8 py-10 flex-1 w-full">
        <Link
          to="/collections"
          className="inline-flex items-center gap-1 font-mono text-xs text-text-faint hover:text-signal transition-colors mb-8"
        >
          ← Back to collections
        </Link>

        {loading && (
          <div className="animate-pulse max-w-xl">
            <div className="h-4 w-32 bg-surface rounded-sm mb-3" />
            <div className="h-8 w-64 bg-surface rounded-sm mb-4" />
            <div className="h-4 w-full bg-surface rounded-sm mb-8" />
          </div>
        )}

        {!loading && !collection && (
          <div className="py-20 text-center border border-dashed border-line rounded-sm">
            <h2 className="font-display text-xl text-text-primary mb-2">
              Collection not found
            </h2>
            <p className="text-text-muted text-sm mb-4">
              It may have been removed or you don't have permission to view it.
            </p>
            <Link
              to="/collections"
              className="font-mono text-xs text-signal hover:underline"
            >
              Back to Collections
            </Link>
          </div>
        )}

        {!loading && collection && (
          <div>
            {/* Header Area */}
            <div className="border-b border-line pb-6 mb-8">
              {!isEditing ? (
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-xs uppercase tracking-widest text-signal">
                        Collection
                      </span>
                      <span className="text-text-faint font-mono text-xs">·</span>
                      <span className="font-mono text-[10px] text-text-faint uppercase px-1.5 py-0.5 border border-line rounded">
                        {collection.is_private ? 'Private' : 'Public'}
                      </span>
                    </div>

                    <h1 className="font-display text-3xl sm:text-4xl text-text-primary mb-2">
                      {collection.name}
                    </h1>

                    {collection.description && (
                      <p className="text-text-muted text-sm max-w-2xl leading-relaxed mb-3">
                        {collection.description}
                      </p>
                    )}

                    <p className="font-mono text-xs text-text-faint">
                      {articles.length} {articles.length === 1 ? 'article' : 'articles'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-3 py-1.5 border border-line hover:border-signal/60 hover:text-signal text-xs font-mono rounded-sm transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-3 py-1.5 border border-line hover:border-rose-400/60 hover:text-rose-400 text-xs font-mono rounded-sm transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                /* Edit Form */
                <form onSubmit={handleUpdate} className="max-w-xl space-y-3 bg-surface p-5 rounded-sm border border-line">
                  <div>
                    <label className="block font-mono text-xs text-text-muted uppercase tracking-wide mb-1">
                      Collection Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-ink border border-line rounded-sm px-3 py-1.5 text-sm text-text-primary outline-none focus:border-signal"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-text-muted uppercase tracking-wide mb-1">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      className="w-full bg-ink border border-line rounded-sm px-3 py-1.5 text-sm text-text-primary outline-none focus:border-signal resize-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="editPrivateCheck"
                      checked={editPrivate}
                      onChange={(e) => setEditPrivate(e.target.checked)}
                      className="rounded border-line bg-ink text-signal focus:ring-0"
                    />
                    <label htmlFor="editPrivateCheck" className="text-xs text-text-muted">
                      Keep this collection private
                    </label>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={saving || !editName.trim()}
                      className="px-4 py-1.5 bg-signal text-ink font-mono text-xs font-semibold rounded-sm hover:bg-signal/90 transition-colors disabled:opacity-40"
                    >
                      {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 text-xs font-mono text-text-faint hover:text-text-primary transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Articles List */}
            {articles.length === 0 ? (
              <div className="py-20 text-center max-w-md mx-auto">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full border border-line flex items-center justify-center text-xl text-text-faint">
                  📰
                </div>
                <h2 className="font-display text-2xl text-text-primary mb-2">
                  No articles in this collection yet
                </h2>
                <p className="text-text-muted text-sm mb-6 leading-relaxed">
                  Browse the latest AI & tech stories and tap "Add to Collection" to organize them here.
                </p>
                <Link
                  to="/"
                  className="inline-block px-5 py-2 text-xs font-mono uppercase tracking-wider bg-signal text-ink font-semibold rounded-sm hover:bg-signal/90 transition-colors"
                >
                  Explore stories
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article) => (
                  <div key={article.id} className="relative group">
                    <ArticleCard article={article} />
                    <button
                      onClick={() => handleRemoveArticle(article.id)}
                      title="Remove from collection"
                      className="absolute top-2 right-2 z-20 px-2 py-1 bg-ink/90 backdrop-blur-sm border border-line text-text-faint hover:text-rose-400 hover:border-rose-400/50 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
