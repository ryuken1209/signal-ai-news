import { createClient } from '@supabase/supabase-js'

// In-memory lock map to prevent duplicate simultaneous provider requests for the same article
const inFlightRequests = new Map()

// Helper to get Supabase client server-side if configured
function getServerSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY

  if (!url || !key) return null
  return createClient(url, key, {
    auth: { persistSession: false },
  })
}

// System prompt to enforce structured, factual, and restrained output
const SYSTEM_PROMPT = `You are an expert editorial technology analyst for "Signal", a premier publication covering artificial intelligence and modern technology.
Your task is to analyze the provided article information and generate a concise, highly factual, and accessible briefing.

STRICT REQUIREMENTS:
1. Base all statements ONLY on the provided title, description, and source context. Never invent details, facts, or claims not supported by the input.
2. Return ONLY a single valid JSON object with EXACTLY this structure:
{
  "summary": "2 to 4 concise, factual sentences capturing the core news.",
  "keyPoints": [
    "First factual key takeaway",
    "Second factual key takeaway",
    "Third factual key takeaway"
  ],
  "explainSimply": "A clear, beginner-friendly explanation of technical concepts without childish language.",
  "whyItMatters": "Practical significance explaining who may be affected and potential implications, clearly distinguishing facts from possibilities.",
  "topics": ["Topic1", "Topic2", "Topic3"]
}
3. 'keyPoints' must be an array of 3 to 6 short, bullet-ready strings.
4. 'topics' must be 2 to 5 normalized topic tags (e.g., "AI", "LLMs", "Robotics", "Research", "Cybersecurity").
5. Do NOT output any markdown ticks (\`\`\`json) or extra text outside the JSON.`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { articleId, title, description, category, source, url } = req.body || {}

  if (!articleId) {
    return res.status(400).json({ error: 'articleId is required' })
  }

  // 1. Check Supabase cache FIRST
  const supabase = getServerSupabase()
  if (supabase) {
    try {
      const { data: cached } = await supabase
        .from('article_ai')
        .select('*')
        .eq('article_id', String(articleId))
        .maybeSingle()

      if (cached && cached.summary) {
        return res.status(200).json({
          configured: true,
          isCached: true,
          aiBrief: {
            summary: cached.summary,
            keyPoints: Array.isArray(cached.key_points) ? cached.key_points : [],
            explainSimply: cached.explain_simply || '',
            whyItMatters: cached.why_it_matters || '',
            topics: Array.isArray(cached.topics) ? cached.topics : [],
            model: cached.model || 'cached',
            createdAt: cached.created_at,
          },
        })
      }
    } catch (cacheErr) {
      console.warn('[api/ai/article] Cache check error:', cacheErr.message)
    }
  }

  // 2. Concurrency deduplication: Wait if this article is already being processed
  if (inFlightRequests.has(articleId)) {
    try {
      const result = await inFlightRequests.get(articleId)
      return res.status(200).json(result)
    } catch (err) {
      return res.status(500).json({ error: err.message || 'Generation failed' })
    }
  }

  // 3. Check for configured AI keys strictly on server
  const geminiKey = process.env.GEMINI_API_KEY || (process.env.AI_API_KEY?.startsWith('AIza') ? process.env.AI_API_KEY : null)
  const openaiKey = process.env.OPENAI_API_KEY || (process.env.AI_API_KEY?.startsWith('sk-') ? process.env.AI_API_KEY : null)
  const genericKey = process.env.AI_API_KEY

  if (!geminiKey && !openaiKey && !genericKey) {
    return res.status(200).json({
      configured: false,
      error: 'AI provider not configured on server',
    })
  }

  // 4. Execute AI Generation with in-flight lock
  const generationPromise = (async () => {
    const articleContext = `ARTICLE TITLE: ${title || 'Untitled'}
CATEGORY: ${category || 'Technology'}
SOURCE: ${source || 'Unknown'}
URL: ${url || ''}
CONTENT / DESCRIPTION:
${description || 'No detailed description available.'}`

    let parsed = null
    let modelName = 'ai-assistant'

    if (geminiKey || (genericKey && !openaiKey)) {
      const keyToUse = geminiKey || genericKey
      modelName = 'gemini-1.5-flash'
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(keyToUse)}`

      const payload = {
        contents: [
          {
            parts: [
              { text: SYSTEM_PROMPT },
              { text: `Please analyze this article:\n\n${articleContext}` },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 800,
          responseMimeType: 'application/json',
        },
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errText = await response.text()
        throw new Error(`Gemini API returned status ${response.status}: ${errText.slice(0, 150)}`)
      }

      const json = await response.json()
      const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text
      if (!rawText) throw new Error('Empty response from AI provider')

      parsed = JSON.parse(rawText)
    } else if (openaiKey) {
      modelName = 'gpt-4o-mini'
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: `Please analyze this article:\n\n${articleContext}` },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2,
          max_tokens: 800,
        }),
      })

      if (!response.ok) {
        const errText = await response.text()
        throw new Error(`OpenAI API returned status ${response.status}: ${errText.slice(0, 150)}`)
      }

      const json = await response.json()
      const rawText = json.choices?.[0]?.message?.content
      if (!rawText) throw new Error('Empty response from OpenAI')

      parsed = JSON.parse(rawText)
    }

    // 5. Strict Validation of AI output
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Malformed AI response: output is not a JSON object')
    }

    if (!parsed.summary || typeof parsed.summary !== 'string' || parsed.summary.trim().length < 20) {
      throw new Error('Malformed AI response: missing or invalid summary')
    }

    const keyPoints = Array.isArray(parsed.keyPoints)
      ? parsed.keyPoints.map((p) => String(p).trim()).filter(Boolean)
      : []

    const explainSimply = typeof parsed.explainSimply === 'string' ? parsed.explainSimply.trim() : ''
    const whyItMatters = typeof parsed.whyItMatters === 'string' ? parsed.whyItMatters.trim() : ''
    const topics = Array.isArray(parsed.topics)
      ? parsed.topics.map((t) => String(t).trim().replace(/^#/, '')).filter(Boolean)
      : [category || 'Technology']

    const validatedAiBrief = {
      summary: parsed.summary.trim(),
      keyPoints,
      explainSimply,
      whyItMatters,
      topics,
      model: modelName,
      createdAt: new Date().toISOString(),
    }

    // 6. Save to Supabase cache
    if (supabase) {
      try {
        await supabase.from('article_ai').upsert(
          {
            article_id: String(articleId),
            summary: validatedAiBrief.summary,
            key_points: validatedAiBrief.keyPoints,
            explain_simply: validatedAiBrief.explainSimply,
            why_it_matters: validatedAiBrief.whyItMatters,
            topics: validatedAiBrief.topics,
            model: validatedAiBrief.model,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'article_id' }
        )
      } catch (saveErr) {
        console.warn('[api/ai/article] Failed to save AI brief to Supabase:', saveErr.message)
      }
    }

    return {
      configured: true,
      isCached: false,
      aiBrief: validatedAiBrief,
    }
  })()

  inFlightRequests.set(articleId, generationPromise)

  try {
    const output = await generationPromise
    return res.status(200).json(output)
  } catch (err) {
    console.error('[api/ai/article] Error generating brief:', err.message)
    return res.status(500).json({
      configured: true,
      error: 'AI brief generation failed',
      message: err.message,
    })
  } finally {
    inFlightRequests.delete(articleId)
  }
}
