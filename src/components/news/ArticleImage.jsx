import { useState, useRef, useEffect } from 'react'
import { isImageCached, markImageLoaded } from '../../utils/imagePreloader'

export default function ArticleImage({
  src,
  alt,
  category,
  className = '',
  priority = false,
  fetchPriority = 'auto',
}) {
  const isInitiallyCached = isImageCached(src)
  const [prevSrc, setPrevSrc] = useState(src)
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(isInitiallyCached)
  const imgRef = useRef(null)

  if (src !== prevSrc) {
    setPrevSrc(src)
    setFailed(false)
    setLoaded(isImageCached(src))
  }

  // Fast-path: check if browser already completed image loading from disk/memory cache
  useEffect(() => {
    if (!src || failed || loaded) return
    const img = imgRef.current
    if (img && img.complete && img.naturalWidth > 0) {
      markImageLoaded(src)
      setLoaded(true)
    }
  }, [src, failed, loaded])

  if (!src || failed) {
    return (
      <div
        className={`relative flex items-center justify-center bg-surface-subtle border border-line/60 overflow-hidden ${className}`}
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[radial-gradient(#242B35_1px,transparent_1px)] [background-size:12px_12px] opacity-40" />
        <div className="relative z-10 flex flex-col items-center gap-1.5 px-3 py-2 text-center">
          <span className="w-6 h-0.5 bg-signal/50 rounded-full mb-0.5" />
          <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest font-medium">
            {category || 'Signal'}
          </span>
        </div>
      </div>
    )
  }

  const effectiveFetchPriority =
    fetchPriority !== 'auto' ? fetchPriority : priority ? 'high' : 'auto'

  return (
    <div className={`relative overflow-hidden bg-surface-subtle ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-surface-subtle animate-pulse pointer-events-none" />
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt || ''}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={effectiveFetchPriority}
        decoding="async"
        onLoad={() => {
          markImageLoaded(src)
          setLoaded(true)
        }}
        onError={() => setFailed(true)}
        className={`w-full h-full object-cover ${
          loaded ? 'opacity-100' : 'opacity-0'
        } ${isInitiallyCached ? '' : 'transition-opacity duration-150 ease-out'}`}
      />
    </div>
  )
}
