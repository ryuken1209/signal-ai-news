import { getArticles } from './_lib/aggregate.js'

// Runs server-side on Vercel. Nothing here is a secret (RSS needs no key),
// but the fetch still has to happen here rather than in the browser: most
// of these feeds don't send CORS headers, so a direct browser fetch would
// be blocked regardless.

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { category, trending } = req.query

  try {
    const { articles, errors, sourcesQueried } = await getArticles({
      category,
      trending: trending === 'true',
    })

    // Real caching layer: Vercel's CDN serves this response for up to 10
    // minutes and can serve a stale copy for another 5 while refreshing in
    // the background, so a burst of visitors doesn't refetch every source
    // per request. This is the actual cache — there is no in-memory cache
    // in this function, since serverless instances are not guaranteed to
    // stay warm between requests.
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=300')

    return res.status(200).json({
      articles,
      fetchedAt: new Date().toISOString(),
      sourcesQueried,
      sourceErrors: errors, // present but non-fatal — partial results still return 200
    })
  } catch (err) {
    return res.status(500).json({
      error: 'Failed to fetch news',
      message: err.message,
    })
  }
}
