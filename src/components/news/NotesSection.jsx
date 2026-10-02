import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useNotes } from '../../hooks/useNotes'

export default function NotesSection({ article }) {
  const { user } = useAuth()
  const { note, loading, saving, saveNote, deleteNote } = useNotes(article)
  const [content, setContent] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (note) {
      setContent(note.content || '')
      setIsEditing(false)
    } else {
      setContent('')
      setIsEditing(false)
    }
  }, [note])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!content.trim()) return
    await saveNote(content)
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (window.confirm('Delete this note?')) {
      await deleteNote()
      setContent('')
      setIsEditing(false)
    }
  }

  return (
    <div className="border-t border-line mt-10 pt-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="font-mono text-xs text-text-faint uppercase tracking-wide">
            Private Notes
          </h2>
          <span className="font-mono text-[10px] text-text-faint bg-surface border border-line px-1.5 py-0.5 rounded-sm">
            🔒 Only you can see this
          </span>
        </div>

        {note && !isEditing && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs font-mono text-text-muted hover:text-signal transition-colors"
            >
              Edit
            </button>
            <span className="text-text-faint text-xs">·</span>
            <button
              onClick={handleDelete}
              disabled={saving}
              className="text-xs font-mono text-red-400 hover:text-red-300 transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {!user ? (
        <div className="p-4 border border-dashed border-line rounded-sm bg-surface/40 text-center">
          <p className="text-text-muted text-sm mb-2">
            Sign in to write private notes, insights, and key takeaways for this story.
          </p>
          <Link
            to="/login"
            className="inline-block text-xs font-medium border border-line hover:border-signal/60 hover:text-signal transition-colors rounded-sm px-3 py-1.5"
          >
            Sign in to add notes
          </Link>
        </div>
      ) : loading ? (
        <div className="h-24 bg-surface/50 border border-line rounded-sm animate-pulse" />
      ) : note && !isEditing ? (
        <div className="bg-surface border border-line rounded-sm p-4">
          <p className="text-text-primary text-sm whitespace-pre-wrap leading-relaxed">
            {note.content}
          </p>
          <div className="mt-3 pt-2 border-t border-line/60 flex items-center justify-between text-[11px] font-mono text-text-faint">
            <span>
              Updated {new Date(note.updated_at || note.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write personal thoughts, takeaways, or research notes on this story…"
            rows={4}
            required
            className="w-full bg-surface border border-line rounded-sm p-3 text-sm text-text-primary placeholder:text-text-faint outline-none focus:border-signal transition-colors resize-y min-h-[90px]"
          />
          <div className="flex items-center justify-end gap-2">
            {note && (
              <button
                type="button"
                onClick={() => {
                  setContent(note.content || '')
                  setIsEditing(false)
                }}
                className="text-xs font-mono text-text-faint hover:text-text-primary transition-colors px-3 py-1.5"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={saving || !content.trim()}
              className="text-xs font-medium bg-signal text-ink hover:bg-signal/90 transition-colors rounded-sm px-4 py-1.5 disabled:opacity-40"
            >
              {saving ? 'Saving…' : note ? 'Update note' : 'Save note'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
