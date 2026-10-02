// Module-level set tracking successfully loaded/cached image URLs
const loadedImageUrls = new Set()

/**
 * Check if an image URL has already been loaded or preloaded.
 */
export function isImageCached(url) {
  if (!url || typeof url !== 'string') return false
  return loadedImageUrls.has(url)
}

/**
 * Record that an image has successfully loaded.
 */
export function markImageLoaded(url) {
  if (!url || typeof url !== 'string') return
  loadedImageUrls.add(url)
}

/**
 * Preload high-priority images for the initial viewport.
 * Dispatches async browser network requests immediately as soon as article data arrives.
 *
 * @param {Array<Object|string>} articlesOrUrls - List of articles or image URL strings
 * @param {number} limit - Maximum number of images to preload (default 6)
 */
export function preloadInitialImages(articlesOrUrls = [], limit = 6) {
  if (!Array.isArray(articlesOrUrls) || articlesOrUrls.length === 0) return

  const urls = articlesOrUrls
    .map((item) => (typeof item === 'string' ? item : item?.imageUrl))
    .filter((url) => Boolean(url && typeof url === 'string'))
    .slice(0, limit)

  urls.forEach((url, index) => {
    if (loadedImageUrls.has(url)) return

    try {
      const img = new Image()
      img.referrerPolicy = 'no-referrer'
      img.decoding = 'async'
      if ('fetchPriority' in img) {
        // Hero image gets 'high', top visible cards get 'high', rest 'auto'
        img.fetchPriority = index === 0 ? 'high' : index < 3 ? 'high' : 'auto'
      }
      img.onload = () => {
        loadedImageUrls.add(url)
      }
      img.onerror = () => {
        // Do not cache failed URLs
      }
      img.src = url
    } catch {
      // Ignore background preload errors; component will handle load/error gracefully
    }
  })
}

/**
 * Pre-warm critical above-the-fold images before revealing the page.
 * Waits for the hero and top visible images with a strict, fast timeout so the UI
 * is never blocked while ensuring the first visible screen has images ready.
 *
 * @param {Array<Object|string>} articlesOrUrls - List of articles or image URL strings
 * @param {Object} options
 * @param {number} options.max - Number of critical images to await (default 2)
 * @param {number} options.timeoutMs - Strict upper bound timeout in ms (default 350)
 * @returns {Promise<void>}
 */
export function prewarmVisibleImages(articlesOrUrls = [], { max = 2, timeoutMs = 350 } = {}) {
  if (!Array.isArray(articlesOrUrls) || articlesOrUrls.length === 0) {
    return Promise.resolve()
  }

  // Preload up to 6 images in parallel in background
  preloadInitialImages(articlesOrUrls, 6)

  const criticalUrls = articlesOrUrls
    .map((item) => (typeof item === 'string' ? item : item?.imageUrl))
    .filter((url) => Boolean(url && typeof url === 'string'))
    .slice(0, max)

  if (criticalUrls.length === 0) return Promise.resolve()

  const imagePromises = criticalUrls.map((url) => {
    if (loadedImageUrls.has(url)) return Promise.resolve()

    return new Promise((resolve) => {
      const img = new Image()
      img.referrerPolicy = 'no-referrer'
      img.decoding = 'async'
      if ('fetchPriority' in img) {
        img.fetchPriority = 'high'
      }
      img.onload = () => {
        loadedImageUrls.add(url)
        resolve()
      }
      img.onerror = () => {
        resolve() // Resolve so broken images never block the page
      }
      img.src = url
    })
  })

  const timeoutPromise = new Promise((resolve) => setTimeout(resolve, timeoutMs))

  return Promise.race([Promise.all(imagePromises), timeoutPromise]).then(() => undefined)
}
