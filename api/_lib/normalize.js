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
  let cleaned = url.replace(/&#038;/g, '&').replace(/&amp;/g, '&').trim()
  if (!/^https?:\/\//i.test(cleaned)) return null

  // Reject SVG icons/logos and tracking pixels
  if (/\.svg(\?.*)?$/i.test(cleaned)) return null
  if (/(pixel|beacon|spacer|blank\.gif|1x1|tracking)/i.test(cleaned)) return null

  // Reject author profile avatars & user portraits
  if (/(user\/profile_image|avatars?\/|author[s\-_/]|gravatar\.com)/i.test(cleaned)) return null

  // Reject favicons, site logos, social badges, buttons, emoji
  if (/(favicon|[-_]logo|logo[-_]|\/logo|site-logo|app-icon|emoji|\/badges?\/|\/buttons?\/)/i.test(cleaned)) return null

  // If Blogger/Googleusercontent has a tiny thumbnail dimension (/s72-c/ or /w72-h72/ or /s320/), upgrade to /s1600/
  if (/blogger\.googleusercontent\.com|googleusercontent\.com/i.test(cleaned)) {
    cleaned = cleaned.replace(/\/(s(?:72-c|[0-9]{2,3})|w[0-9]+-h[0-9]+)\//i, '/s1600/')
  }

  // If Dev.to image (either via media2.dev.to or direct S3), serve via Dev.to edge CDN proxy with crisp width
  if (/media2?\.dev\.to\/dynamic\/image/i.test(cleaned)) {
    const targetUrlMatch = cleaned.match(/https%3A%2F%2Fdev-to-uploads[^"'&\s]+/i)
    if (targetUrlMatch) {
      cleaned = `https://media2.dev.to/dynamic/image/width=1000,fit=scale-down,gravity=auto,format=auto/${targetUrlMatch[0]}`
    } else {
      cleaned = cleaned.replace(/width=\d+/i, 'width=1000')
    }
  } else if (/dev-to-uploads\.s3[.\-a-z0-9]*\.amazonaws\.com\/uploads\/articles/i.test(cleaned)) {
    cleaned = `https://media2.dev.to/dynamic/image/width=1000,fit=scale-down,gravity=auto,format=auto/${encodeURIComponent(cleaned)}`
  }

  return cleaned
}

function extractImage(item) {
  // 1. Check cover_image (used by Dev.to and others)
  if (item.cover_image) {
    const cleaned = cleanImageUrl(item.cover_image)
    if (cleaned) return cleaned
  }

  // 2. Check enclosure
  if (
    item.enclosure?.url &&
    (/^image\//i.test(item.enclosure.type || '') ||
      /\.(jpg|jpeg|png|webp|gif|avif)(\?.*)?$/i.test(item.enclosure.url))
  ) {
    const cleaned = cleanImageUrl(item.enclosure.url)
    if (cleaned) return cleaned
  }

  // 3. Check media:content (handles both array and object structures)
  const mediaContent = item.mediaContent || item['media:content']
  if (Array.isArray(mediaContent)) {
    for (const m of mediaContent) {
      const url = m?.$?.url || m?.url
      const cleaned = cleanImageUrl(url)
      if (cleaned) return cleaned
    }
  } else if (mediaContent?.$?.url || mediaContent?.url) {
    const cleaned = cleanImageUrl(mediaContent?.$?.url || mediaContent?.url)
    if (cleaned) return cleaned
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
          const cleaned = cleanImageUrl(url)
          if (cleaned) return cleaned
        }
      } else if (entry?.$?.url || entry?.url) {
        const cleaned = cleanImageUrl(entry?.$?.url || entry?.url)
        if (cleaned) return cleaned
      }
    }
  }

  // 5. Check media:thumbnail (handles both array and object structures)
  const mediaThumbnail = item.mediaThumbnail || item['media:thumbnail']
  if (Array.isArray(mediaThumbnail)) {
    for (const m of mediaThumbnail) {
      const url = m?.$?.url || m?.url
      const cleaned = cleanImageUrl(url)
      if (cleaned) return cleaned
    }
  } else if (mediaThumbnail?.$?.url || mediaThumbnail?.url) {
    const cleaned = cleanImageUrl(mediaThumbnail?.$?.url || mediaThumbnail?.url)
    if (cleaned) return cleaned
  }

  // 6. Check HTML content, contentEncoded, description, or summary for <img>
  const htmlCandidates = [
    item.contentEncoded,
    item['content:encoded'],
    item.content,
    item.description,
    item.summary,
  ].filter(Boolean)

  for (const html of htmlCandidates) {
    if (typeof html !== 'string') continue
    const imgMatches = html.matchAll(/<img[^>]+(?:src|data-src|data-orig-file)=["']([^"']+)["'][^>]*>/gi)
    for (const match of imgMatches) {
      const fullTag = match[0]
      const srcUrl = match[1]
      // Skip if tag indicates an avatar or tiny icon
      if (/(avatar|author|profile|crayons-avatar|favicon|icon)/i.test(fullTag)) continue
      // Skip if explicitly small dimensions in tag (e.g. width="32" or height="32")
      if (
        /width=["'](?:[1-9]|[1-9][0-9]|1[0-9]{2})["']/i.test(fullTag) &&
        !/width=["'][2-9][0-9]{2,}/i.test(fullTag)
      ) {
        continue
      }
      const cleaned = cleanImageUrl(srcUrl)
      if (cleaned) return cleaned
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
