import { useMemo } from 'react'
import ArticleCard from './ArticleCard'

export default function ArticleGrid({ articles = [], isHeroPresent = true }) {
  // Set of article IDs that belong to the initial viewport or partially visible area.
  // 1. Any of the first 8 articles in the feed that actually have images.
  // 2. Any article in the initial layout tiers (first 10 cards: Tier 1, 2, 3, and Tier 4 row 1).
  const eagerImageIds = useMemo(() => {
    const withImages = articles.filter((a) => Boolean(a.imageUrl)).slice(0, 8)
    const initialTiers = articles.slice(0, 10)
    return new Set([...withImages.map((a) => a.id), ...initialTiers.map((a) => a.id)])
  }, [articles])

  if (!articles || articles.length === 0) {
    return (
      <div className="py-20 text-center border border-dashed border-line/80 rounded-xl bg-surface/20 my-6">
        <div className="w-10 h-10 rounded-full bg-surface-subtle border border-line flex items-center justify-center mx-auto mb-3 text-signal font-mono text-sm">
          ✦
        </div>
        <p className="font-display text-xl text-text-primary mb-1.5">
          No stories found in this section
        </p>
        <p className="text-text-muted text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
          Try exploring a different category, adjusting your search keywords, or refreshing the live stream.
        </p>
      </div>
    )
  }

  // If fewer than 4 stories, render a clean standard grid with eager loading
  if (articles.length < 4) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article, idx) => (
          <ArticleCard
            key={article.id}
            article={article}
            variant="grid"
            priority={true}
            fetchPriority={idx === 0 && !isHeroPresent ? 'high' : 'auto'}
          />
        ))}
      </div>
    )
  }

  // Segment articles to construct magazine editorial rhythm
  // Tier 1: Lead story (focal card) + 2 side stories (3 visible cards)
  const leadStory = articles[0]
  const sideStories = articles.slice(1, 3)

  // Tier 2: 3-column balanced cards (3 visible cards)
  const middleGrid = articles.slice(3, 6)

  // Tier 3: Panoramic full-width feature story (visible/partially visible at fold)
  const wideStory = articles[6]

  // Tier 4: Remaining stories in multi-column grid
  const remainingStories = articles.slice(7)

  return (
    <div className="space-y-8">
      {/* Tier 1: Asymmetrical Lead + Stacked Side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {leadStory && (
          <div className="lg:col-span-7">
            <ArticleCard
              key={leadStory.id}
              article={leadStory}
              variant="grid"
              priority={true}
              fetchPriority={isHeroPresent ? 'auto' : 'high'}
            />
          </div>
        )}
        {sideStories.length > 0 && (
          <div className="lg:col-span-5 flex flex-col gap-5 justify-between">
            {sideStories.map((story) => (
              <div key={story.id} className="flex-1">
                <ArticleCard
                  article={story}
                  variant="row"
                  priority={true}
                  fetchPriority="auto"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tier 2: 3-Column Magazine Row (Visible above/at fold - eager loaded) */}
      {middleGrid.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {middleGrid.map((story) => (
            <ArticleCard
              key={story.id}
              article={story}
              variant="grid"
              priority={true}
              fetchPriority="auto"
            />
          ))}
        </div>
      )}

      {/* Tier 3: Panoramic Wide Feature Break with Subtle Cool Depth */}
      {wideStory && (
        <div className="pt-2 relative">
          <div
            className="absolute -inset-x-8 -inset-y-6 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(95,201,248,0.025),transparent_75%)] pointer-events-none -z-10"
            aria-hidden="true"
          />
          <ArticleCard
            key={wideStory.id}
            article={wideStory}
            variant="wide"
            priority={eagerImageIds.has(wideStory.id)}
            fetchPriority="auto"
          />
        </div>
      )}

      {/* Tier 4: Remaining Stories Grid (Eager for top rows in viewport, lazy for rest) */}
      {remainingStories.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {remainingStories.map((story) => (
            <ArticleCard
              key={story.id}
              article={story}
              variant="grid"
              priority={eagerImageIds.has(story.id)}
              fetchPriority="auto"
            />
          ))}
        </div>
      )}
    </div>
  )
}
