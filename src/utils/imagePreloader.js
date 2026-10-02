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
 * Preload an array of image URLs safely without creating duplicate requests.
 *
 * @param {Array<Object|string>} articlesOrUrls - List of articles or image URL strings
 * @param {number} limit - Maximum number of images to preload
 */
export function preloadInitialImages(articlesOrUrls = [], limit = 4) {
  if (!Array.isArray(articlesOrUrls) || articlesOrUrls.length === 0) return

  const urls = articlesOrUrls
    .map((item) => (typeof item === 'string' ? item : item?.imageUrl))
    .filter((url) => Boolean(url && typeof url === 'string'))
    .slice(0, limit)

  urls.forEach((url) => {
    if (loadedImageUrls.has(url)) return

    try {
      const img = new Image()
      img.referrerPolicy = 'no-referrer'
      img.decoding = 'async'
      img.onload = () => {
        loadedImageUrls.add(url)
      }
      img.src = url
    } catch {
      // Ignore background preload errors
    }
  })
}

/**
 * Non-blocking no-op compatibility resolver.
 * Images are rendered eagerly directly in the DOM where the browser's native
 * image pipeline handles priority, decoding, and caching without artificial delays.
 */
export function prewarmVisibleImages() {
  return Promise.resolve()
}
