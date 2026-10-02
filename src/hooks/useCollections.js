import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import {
  fetchCollections,
  createCollection as createService,
  updateCollection as updateService,
  deleteCollection as deleteService,
  addArticleToCollection,
  removeArticleFromCollection,
  fetchArticleCollectionIds,
} from '../services/userDataService'
import { notify } from '../utils/toast'

export function useCollections(article = null) {
  const { user, isConfigured } = useAuth()
  const [collections, setCollections] = useState([])
  const [articleCollectionIds, setArticleCollectionIds] = useState([])
  const [loading, setLoading] = useState(false)

  const loadCollections = useCallback(async () => {
    if (!user || !isConfigured) {
      setCollections([])
      return
    }
    setLoading(true)
    try {
      const data = await fetchCollections(user.id)
      setCollections(data)
    } catch (err) {
      console.error('[useCollections] Load error:', err)
    } finally {
      setLoading(false)
    }
  }, [user, isConfigured])

  useEffect(() => {
    loadCollections()
  }, [loadCollections])

  // If article is passed, fetch which collections already have it
  useEffect(() => {
    if (!user || !article?.id || !isConfigured) {
      setArticleCollectionIds([])
      return
    }
    fetchArticleCollectionIds(user.id, article.id).then((ids) => {
      setArticleCollectionIds(ids)
    })
  }, [user, article?.id, isConfigured])

  const createCollection = useCallback(
    async ({ name, description, isPrivate }) => {
      if (!user) {
        notify('Sign in to create collections')
        return null
      }
      try {
        const created = await createService(user.id, { name, description, isPrivate })
        setCollections((prev) => [
          {
            id: created.id,
            name: created.name,
            description: created.description,
            isPrivate: created.is_private,
            createdAt: created.created_at,
            articleCount: 0,
          },
          ...prev,
        ])
        notify(`Collection "${name}" created`)
        return created
      } catch (err) {
        console.error('[useCollections] Create error:', err)
        notify('Failed to create collection')
        throw err
      }
    },
    [user]
  )

  const updateCollection = useCallback(async (collectionId, updates) => {
    try {
      const updated = await updateService(collectionId, updates)
      setCollections((prev) =>
        prev.map((c) =>
          c.id === collectionId
            ? {
                ...c,
                name: updated.name,
                description: updated.description,
                isPrivate: updated.is_private,
              }
            : c
        )
      )
      notify('Collection updated')
      return updated
    } catch (err) {
      console.error('[useCollections] Update error:', err)
      notify('Failed to update collection')
      throw err
    }
  }, [])

  const deleteCollection = useCallback(async (collectionId) => {
    try {
      await deleteService(collectionId)
      setCollections((prev) => prev.filter((c) => c.id !== collectionId))
      notify('Collection deleted')
      return true
    } catch (err) {
      console.error('[useCollections] Delete error:', err)
      notify('Failed to delete collection')
      return false
    }
  }, [])

  const toggleArticleInCollection = useCallback(
    async (collectionId) => {
      if (!article) return
      const isPresent = articleCollectionIds.includes(collectionId)

      if (isPresent) {
        await removeArticleFromCollection(collectionId, article.id)
        setArticleCollectionIds((prev) => prev.filter((id) => id !== collectionId))
        setCollections((prev) =>
          prev.map((c) =>
            c.id === collectionId ? { ...c, articleCount: Math.max(0, c.articleCount - 1) } : c
          )
        )
        notify('Removed from collection')
      } else {
        await addArticleToCollection(collectionId, article)
        setArticleCollectionIds((prev) => [...prev, collectionId])
        setCollections((prev) =>
          prev.map((c) => (c.id === collectionId ? { ...c, articleCount: c.articleCount + 1 } : c))
        )
        notify('Added to collection')
      }
    },
    [article, articleCollectionIds]
  )

  return {
    collections,
    articleCollectionIds,
    loading,
    loadCollections,
    createCollection,
    updateCollection,
    deleteCollection,
    toggleArticleInCollection,
  }
}
