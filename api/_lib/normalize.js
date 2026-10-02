// Turns whatever shape rss-parser hands back for a given feed into one
// consistent Article shape the frontend can rely on, regardless of source.

const WORDS_PER_MINUTE = 200

// Small, dependency-free string hash — stable across requests, so the same
// article gets the same id every time (important once bookmarks/notes/
// reading-history key off article id in later phases).
// Uses unsigned 32-bit integer conversion (>>> 0) to prevent negative/positive collision.
function hashId(input) {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i)
    hash |= 0
  }
  return (hash >>> 0).toString(36)
}

function stripHtml(html = '') {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#038;/g, '&')
    .replace(/&#8216;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, ' ')
    .trim()
}

function cleanImageUrl(url) {
  if (!url || typeof url !== 'string') return null
  const cleaned = url.replace(/&#038;/g, '&').replace(/&amp;/g, '&').trim()
  if (!/^https?:\/\//i.test(cleaned)) return null
  return cleaned
}

function extractImage(item) {
  // 1. Check enclosure
  if (
    item.enclosure?.url &&
    (/^image\//i.test(item.enclosure.type || '') ||
      /\.(jpg|jpeg|png|webp|gif|avif)(\?.*)?$/i.test(item.enclosure.url))
  ) {
    return cleanImageUrl(item.enclosure.url)
  }

  // 2. Check media:content (handles both array and object structures)
  const mediaContent = item.mediaContent || item['media:content']
  if (Array.isArray(mediaContent)) {
    for (const m of mediaContent) {
      const url = m?.$?.url || m?.url
      if (url) return cleanImageUrl(url)
    }
  } else if (mediaContent?.$?.url || mediaContent?.url) {
    return cleanImageUrl(mediaContent?.$?.url || mediaContent?.url)
  }

  // 3. Check media:thumbnail (handles both array and object structures)
  const mediaThumbnail = item.mediaThumbnail || item['media:thumbnail']
  if (Array.isArray(mediaThumbnail)) {
    for (const m of mediaThumbnail) {
      const url = m?.$?.url || m?.url
      if (url) return cleanImageUrl(url)
    }
  } else if (mediaThumbnail?.$?.url || mediaThumbnail?.url) {
    return cleanImageUrl(mediaThumbnail?.$?.url || mediaThumbnail?.url)
  }

  // 4. Check media:group (often in YouTube or Atom feeds)
  const mediaGroup = item.mediaGroup || item['media:group']
  if (mediaGroup) {
    const groupItems = [
      mediaGroup.mediaContent || mediaGroup['media:content'],
      mediaGroup.mediaThumbnail || mediaGroup['media:thumbnail'],
    ]
    for (const entry of groupItems) {
      if (Array.isArray(entry)) {
        for (const m of entry) {
          const url = m?.$?.url || m?.url
          if (url) return cleanImageUrl(url)
        }
      } else if (entry?.$?.url || entry?.url) {
        return cleanImageUrl(entry?.$?.url || entry?.url)
      }
    }
  }

  // 5. Check HTML content, contentEncoded, description, or summary for <img>
  const htmlCandidates = [
    item.contentEncoded,
    item['content:encoded'],
    item.content,
    item.description,
    item.summary,
  ].filter(Boolean)

  for (const html of htmlCandidates) {
    if (typeof html !== 'string') continue
    const match = html.match(/<img[^>]+(?:src|data-src|data-orig-file)=["']([^"']+)["']/i)
    if (match && match[1]) {
      // avoid 1x1 tracking pixels
      if (!match[0].includes('width="1"') && !match[0].includes("width='1'")) {
        const cleaned = cleanImageUrl(match[1])
        if (cleaned) return cleaned
      }
    }
  }

  return null
}

function normalizeUrl(url) {
  try {
    const u = new URL(url)
    // strip common tracking params so the same article via different
    // campaign links still dedupes to one entry
    ;['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(
      (p) => u.searchParams.delete(p)
    )
    return u.toString()
  } catch {
    return url
  }
}

function estimateReadingTime(item, source) {
  const fullText = stripHtml(
    item.contentEncoded || item['content:encoded'] || item.content || item.summary || item.contentSnippet || ''
  )
  const words = fullText.split(/\s+/).filter(Boolean).length
  if (words > 250) {
    return Math.max(2, Math.min(15, Math.round(words / WORDS_PER_MINUTE)))
  }
  // Category-based baseline when feeds provide only short blurbs
  const baselineByCategory = {
    Research: 7,
    Programming: 6,
    AI: 5,
    Startups: 4,
    Cybersecurity: 5,
    Technology: 5,
  }
  return baselineByCategory[source.category] || 5
}

export function normalizeItem(item, source) {
  if (!item.link) return null // can't produce a usable article with no URL

  const url = normalizeUrl(item.link)
  const rawDescription = item.contentSnippet || item.summary || item.content || ''
  const description = stripHtml(rawDescription).slice(0, 400)

  const rawDate = item.isoDate || item.pubDate
  const parsedDate = rawDate ? new Date(rawDate) : null
  const publishedAt =
    parsedDate && !isNaN(parsedDate.getTime())
      ? parsedDate.toISOString()
      : new Date().toISOString() // malformed/missing date — treat as just-seen rather than crash or corrupt sort order

  return {
    id: hashId(url),
    title: stripHtml(item.title || 'Untitled'),
    description,
    url,
    source: source.name,
    sourceUrl: url,
    imageUrl: extractImage(item),
    publishedAt,
    category: source.category,
    tags: (item.categories || []).slice(0, 5),
    readingTimeMin: estimateReadingTime(item, source),
  }
}
