// Registry of RSS sources per category. All confirmed publicly available,
// no API key required, standard RSS licensing (headline/summary/link only —
// we never store or serve full article bodies).
//
// To add a source: add one entry here. Nothing else needs to change —
// normalize.js and news.js are source-agnostic.

export const SOURCES = [
  {
    name: 'TechCrunch',
    category: 'AI',
    url: 'https://techcrunch.com/category/artificial-intelligence/feed/',
  },
  {
    name: 'Hugging Face Blog',
    category: 'AI',
    url: 'https://huggingface.co/blog/feed.xml',
  },
  {
    name: 'The Verge',
    category: 'Technology',
    url: 'https://www.theverge.com/rss/index.xml',
  },
  {
    name: 'Ars Technica',
    category: 'Technology',
    url: 'https://feeds.arstechnica.com/arstechnica/index',
  },
  {
    name: 'TechCrunch',
    category: 'Startups',
    url: 'https://techcrunch.com/category/startups/feed/',
  },
  {
    name: 'Dev.to',
    category: 'Programming',
    url: 'https://dev.to/feed',
  },
  {
    name: 'GitHub Blog',
    category: 'Programming',
    url: 'https://github.blog/feed/',
  },
  {
    name: 'arXiv (cs.AI)',
    category: 'Research',
    url: 'https://rss.arxiv.org/rss/cs.AI',
  },
  {
    name: 'arXiv (cs.LG)',
    category: 'Research',
    url: 'https://rss.arxiv.org/rss/cs.LG',
  },
  {
    name: 'The Hacker News',
    category: 'Cybersecurity',
    url: 'https://feeds.feedburner.com/TheHackersNews',
  },
]

export const CATEGORIES = [...new Set(SOURCES.map((s) => s.category))]

export function sourcesForCategory(category) {
  if (!category || category === 'All' || category === 'Trending') {
    return SOURCES
  }
  return SOURCES.filter((s) => s.category === category)
}
