import { Link } from 'react-router-dom'
import { formatRelativeTime } from '../../data/sampleArticles'
import BookmarkButton from '../ui/BookmarkButton'
import LikeButton from '../ui/LikeButton'
import ArticleImage from './ArticleImage'

export default function FeaturedArticle({ article }) {
  if (!article) return null

  const isTrending = article.trending || (article.trendingScore && article.trendingScore > 0)

  return (
    <article className="relative mb-12 group overflow-hidden rounded-xl border border-line/80 bg-surface/30 hover:border-line-bright transition-all duration-500 card-lift">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Cinematic Image Frame (7 columns on desktop) */}
        <div className="lg:col-span-7 relative overflow-hidden h-[260px] sm:h-[380px] lg:h-[450px]">
          <Link
            to={`/article/${article.id}`}
            className="block w-full h-full overflow-hidden"
            tabIndex={-1}
            aria-hidden="true"
          >
            <ArticleImage
              src={article.imageUrl}
              alt={article.title}
              category={article.category}
              className="w-full h-full object-cover img-zoom"
              priority={true}
              fetchPriority="high"
            />
            {/* Subtle Gradient Scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-ink/20 lg:to-surface/70 pointer-events-none" />
          </Link>

          {/* Floating Category Badge over image on mobile */}
          <div className="absolute top-4 left-4 lg:hidden">
            <span className="font-mono text-[11px] px-2.5 py-1 rounded-full bg-ink/85 backdrop-blur-md border border-line/80 text-signal font-medium shadow-md">
              {article.category}
            </span>
          </div>
        </div>

        {/* Editorial Story Details (5 columns on desktop) */}
        <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-surface/40 backdrop-blur-sm border-t lg:border-t-0 lg:border-l border-line/70">
          <div>
            {/* Top Metadata Row with Staggered Entrance */}
            <div className="hidden lg:flex items-center gap-2.5 mb-4 font-mono text-xs text-text-faint flex-wrap animate-fade-in">
              <span className="text-signal px-2.5 py-0.5 rounded-full bg-signal-muted font-medium border border-signal/30">
                {article.category}
              </span>
              <span>·</span>
              <span className="text-text-muted">{article.source}</span>
              <span>·</span>
              <span>{formatRelativeTime(article.publishedAt)}</span>
              {isTrending && (
                <>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1 text-amber font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse-subtle" />
                    Trending
                  </span>
                </>
              )}
            </div>

            {/* Mobile Metadata Row */}
            <div className="flex lg:hidden items-center gap-2 mb-3 font-mono text-xs text-text-faint">
              <span className="text-text-muted">{article.source}</span>
              <span>·</span>
              <span>{formatRelativeTime(article.publishedAt)}</span>
              {isTrending && (
                <>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1 text-amber">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse-subtle" />
                    Trending
                  </span>
                </>
              )}
            </div>

            {/* Editorial Headline */}
            <Link to={`/article/${article.id}`} className="block group/title">
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl leading-[1.12] text-text-primary group-hover/title:text-signal transition-colors duration-250 tracking-tight mb-4 font-normal">
                {article.title}
              </h2>
            </Link>

            {/* Description */}
            <p className="text-text-muted text-sm sm:text-base leading-relaxed line-clamp-3 mb-6 font-normal">
              {article.description}
            </p>
          </div>

          {/* Footer Action Bar */}
          <div className="pt-4 border-t border-line/60 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 font-mono text-xs text-text-faint">
              <span className="px-2 py-0.5 rounded bg-surface-subtle border border-line/50">
                {article.readingTimeMin} min read
              </span>
              <span className="hidden sm:inline text-text-faint/70">
                Full coverage available
              </span>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <LikeButton article={article} />
              <BookmarkButton article={article} />
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
