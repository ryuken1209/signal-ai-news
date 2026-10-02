import { Link } from 'react-router-dom'
import { formatRelativeTime } from '../../data/sampleArticles'
import BookmarkButton from '../ui/BookmarkButton'
import LikeButton from '../ui/LikeButton'
import ArticleImage from './ArticleImage'

export default function ArticleCard({
  article,
  variant = 'grid',
  priority = false,
  fetchPriority = 'auto',
}) {
  if (!article) return null

  const isTrending = article.trending || (article.trendingScore && article.trendingScore > 0)

  // Wide panoramic variant for magazine rhythm breaks
  if (variant === 'wide') {
    return (
      <article className="group relative overflow-hidden rounded-xl border border-line/80 bg-surface/35 hover:border-line-bright transition-all duration-400 card-lift">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
          <div className="md:col-span-6 lg:col-span-7 relative overflow-hidden h-56 sm:h-72 md:h-full min-h-[220px]">
            <Link to={`/article/${article.id}`} className="block w-full h-full" tabIndex={-1} aria-hidden="true">
              <ArticleImage
                src={article.imageUrl}
                alt={article.title}
                category={article.category}
                className="w-full h-full object-cover img-zoom"
                priority={priority}
                fetchPriority={fetchPriority}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-surface/80 pointer-events-none" />
            </Link>
          </div>
          <div className="md:col-span-6 lg:col-span-5 p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3 font-mono text-xs text-text-faint">
                <span className="text-signal px-2 py-0.5 rounded-full bg-signal-muted text-[11px] font-medium border border-signal/25">
                  {article.category}
                </span>
                <span>·</span>
                <span className="text-text-muted">{article.source}</span>
                <span>·</span>
                <span>{formatRelativeTime(article.publishedAt)}</span>
              </div>
              <Link to={`/article/${article.id}`} className="block">
                <h3 className="font-display text-xl sm:text-2xl leading-snug text-text-primary group-hover:text-signal transition-colors mb-2.5">
                  {article.title}
                </h3>
              </Link>
              <p className="text-text-muted text-xs sm:text-sm leading-relaxed line-clamp-3 mb-4">
                {article.description}
              </p>
            </div>
            <div className="pt-3 border-t border-line/60 flex items-center justify-between">
              <span className="font-mono text-xs text-text-faint">{article.readingTimeMin} min read</span>
              <div className="flex items-center gap-2.5">
                <LikeButton article={article} />
                <BookmarkButton article={article} />
              </div>
            </div>
          </div>
        </div>
      </article>
    )
  }

  // Row variant (compact list, used in search or secondary side columns)
  if (variant === 'row') {
    return (
      <article className="group relative flex gap-4 p-4 rounded-lg border border-line/60 bg-surface/25 hover:border-line-bright hover:bg-surface/50 transition-all duration-300 card-lift">
        <Link to={`/article/${article.id}`} className="w-28 sm:w-36 h-24 sm:h-28 shrink-0 overflow-hidden rounded-md border border-line/60 relative" tabIndex={-1} aria-hidden="true">
          <ArticleImage
            src={article.imageUrl}
            alt={article.title}
            category={article.category}
            className="w-full h-full object-cover img-zoom"
            priority={priority}
            fetchPriority={fetchPriority}
          />
        </Link>
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5 font-mono text-[11px] text-text-faint">
              <span className="text-signal font-medium">{article.category}</span>
              <span>·</span>
              <span className="truncate">{article.source}</span>
              <span>·</span>
              <span>{formatRelativeTime(article.publishedAt)}</span>
            </div>
            <Link to={`/article/${article.id}`}>
              <h3 className="font-display text-base sm:text-lg leading-snug text-text-primary group-hover:text-signal transition-colors line-clamp-2 mb-1">
                {article.title}
              </h3>
            </Link>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="font-mono text-[11px] text-text-faint">{article.readingTimeMin} min read</span>
            <div className="flex items-center gap-2">
              <LikeButton article={article} />
              <BookmarkButton article={article} />
            </div>
          </div>
        </div>
      </article>
    )
  }

  // Standard Magazine Grid Card (Default)
  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-line/70 bg-surface/35 hover:border-line-bright hover:bg-surface/60 transition-all duration-400 card-lift h-full">
      <div>
        {/* Card Image Banner */}
        <div className="relative w-full aspect-[16/10] overflow-hidden bg-surface-subtle border-b border-line/50">
          <Link
            to={`/article/${article.id}`}
            className="block w-full h-full"
            tabIndex={-1}
            aria-hidden="true"
          >
            <ArticleImage
              src={article.imageUrl}
              alt={article.title}
              category={article.category}
              className="w-full h-full object-cover img-zoom"
              priority={priority}
              fetchPriority={fetchPriority}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity pointer-events-none" />
          </Link>

          {/* Floating Category Pill */}
          <div className="absolute top-3 left-3 pointer-events-none">
            <span className="font-mono text-[10px] tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-ink/80 backdrop-blur-md border border-line/80 text-signal font-medium shadow-sm">
              {article.category}
            </span>
          </div>

          {isTrending && (
            <div className="absolute top-3 right-3 pointer-events-none">
              <span className="font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full bg-ink/80 backdrop-blur-md border border-amber/40 text-amber font-medium inline-flex items-center gap-1 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse-subtle" />
                Hot
              </span>
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2.5 font-mono text-xs text-text-faint">
            <span className="text-text-muted truncate max-w-[120px]">{article.source}</span>
            <span>·</span>
            <span>{formatRelativeTime(article.publishedAt)}</span>
          </div>

          <Link to={`/article/${article.id}`} className="block group/link">
            <h3 className="font-display text-lg sm:text-xl leading-snug text-text-primary group-hover/link:text-signal transition-colors line-clamp-2 mb-2 font-normal">
              {article.title}
            </h3>
          </Link>

          <p className="text-text-muted text-xs sm:text-sm leading-relaxed line-clamp-2 mb-4 font-normal">
            {article.description}
          </p>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-5 pb-4 pt-3 border-t border-line/50 flex items-center justify-between text-text-faint">
        <div className="flex items-center gap-2 font-mono text-xs">
          <span>{article.readingTimeMin} min read</span>
          {(article.tags || []).length > 0 && (
            <span className="text-text-faint/70 truncate max-w-[100px] hidden sm:inline">
              #{article.tags[0]}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <LikeButton article={article} />
          <BookmarkButton article={article} />
        </div>
      </div>
    </article>
  )
}
