/**
 * Code Generation Service - HTTP Server
 * Exposes the code generation service via a Fastify API
 */

import Fastify from 'fastify'
import { generateCode } from './service.js'
import { parseDocument } from './parsers/document-parser.js'
import type { GenerationRequest } from './types.js'

const app = Fastify({ logger: true })

/** Health check endpoint */
app.get('/health', async () => {
  return { status: 'ok', service: 'code-generation-service' }
})

/**
 * POST /api/generate
 * Generate code from a technical document
 *
 * Body: { document: string, outputDir?: string, modules?: string[] }
 */
app.post<{ Body: GenerationRequest }>('/api/generate', async (req, reply) => {
  const { document, outputDir, modules } = req.body

  if (!document || typeof document !== 'string') {
    return reply.status(400).send({
      success: false,
      error: 'Missing or invalid "document" field. Provide the technical document as a markdown string.',
    })
  }

  const result = generateCode({ document, outputDir, modules })
  const status = result.success ? 200 : 422
  return reply.status(status).send(result)
})

/**
 * POST /api/parse
 * Parse a technical document without generating code
 *
 * Body: { document: string }
 */
app.post<{ Body: { document: string } }>('/api/parse', async (req, reply) => {
  const { document } = req.body

  if (!document || typeof document !== 'string') {
    return reply.status(400).send({
      success: false,
      error: 'Missing or invalid "document" field.',
    })
  }

  const parsed = parseDocument(document)
  return reply.send({ success: true, data: parsed })
})

/**
 * GET /api/templates
 * List available template types
 */
app.get('/api/templates', async () => {
  return {
    templates: [
      { type: 'crud', description: 'CRUD model, store, and route files' },
      { type: 'form-page', description: 'React form page component' },
      { type: 'list-page', description: 'React list page component' },
      { type: 'basic-page', description: 'Basic React page component' },
    ],
  }
})

// Start server
const PORT = parseInt(process.env.PORT || '3100', 10)

app.listen({ port: PORT, host: '0.0.0.0' }).then((address) => {
  console.log(`Code generation service listening at ${address}`)
}).catch((err) => {
  app.log.error(err)
  process.exit(1)
})

export default app
