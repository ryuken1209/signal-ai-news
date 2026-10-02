import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

function apiDevMiddleware() {
  return {
    name: 'api-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)

        // Route: /api/news
        if (url.pathname === '/api/news') {
          try {
            const { getArticles } = await import('./api/_lib/aggregate.js')
            const category = url.searchParams.get('category')
            const trending = url.searchParams.get('trending') === 'true'
            const result = await getArticles({ category, trending })
            res.setHeader('Content-Type', 'application/json')
            res.end(
              JSON.stringify({
                articles: result.articles,
                fetchedAt: new Date().toISOString(),
                sourcesQueried: result.sourcesQueried,
                sourceErrors: result.errors,
              })
            )
            return
          } catch (err) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: err.message }))
            return
          }
        }

        // Route: /api/ai/article
        if (url.pathname === '/api/ai/article') {
          try {
            const handlerModule = await import('./api/ai/article.js')
            const handler = handlerModule.default
            let body = ''
            req.on('data', (chunk) => {
              body += chunk
            })
            req.on('end', async () => {
              try {
                req.body = body ? JSON.parse(body) : {}
                const fakeRes = {
                  setHeader(k, v) {
                    res.setHeader(k, v)
                  },
                  status(code) {
                    res.statusCode = code
                    return this
                  },
                  json(payload) {
                    res.setHeader('Content-Type', 'application/json')
                    res.end(JSON.stringify(payload))
                  },
                }
                await handler(req, fakeRes)
              } catch (e) {
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: e.message }))
              }
            })
            return
          } catch (err) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: err.message }))
            return
          }
        }

        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiDevMiddleware()],
})
