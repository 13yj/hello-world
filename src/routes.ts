import type { FastifyInstance } from 'fastify'
import { TechSolutionGenerator } from './generator.js'
import { SolutionStore } from './store.js'
import type { GenerateSolutionRequest, GenerateSolutionResponse } from './types.js'

export function registerRoutes(app: FastifyInstance): void {
  const generator = new TechSolutionGenerator()
  const store = new SolutionStore()

  /** POST /api/tech-solution/generate - Generate a tech solution from product requirements */
  app.post<{ Body: GenerateSolutionRequest }>('/api/tech-solution/generate', async (request, reply) => {
    const body = request.body

    if (!body || !body.requirement) {
      return reply.status(400).send({
        success: false,
        error: 'Missing required field: requirement'
      } satisfies GenerateSolutionResponse)
    }

    const { requirement } = body

    if (!requirement.title || typeof requirement.title !== 'string') {
      return reply.status(400).send({
        success: false,
        error: 'requirement.title is required and must be a string'
      } satisfies GenerateSolutionResponse)
    }

    if (!requirement.description || typeof requirement.description !== 'string') {
      return reply.status(400).send({
        success: false,
        error: 'requirement.description is required and must be a string'
      } satisfies GenerateSolutionResponse)
    }

    try {
      const solution = await generator.generate(requirement)
      store.save(solution)
      return reply.status(200).send({
        success: true,
        data: solution
      } satisfies GenerateSolutionResponse)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      return reply.status(500).send({
        success: false,
        error: `Generation failed: ${message}`
      } satisfies GenerateSolutionResponse)
    }
  })

  /** GET /api/tech-solution/:id - Get a generated solution by ID */
  app.get<{ Params: { id: string } }>('/api/tech-solution/:id', async (request, reply) => {
    const { id } = request.params
    const solution = store.get(id)

    if (!solution) {
      return reply.status(404).send({
        success: false,
        error: `Solution not found: ${id}`
      } satisfies GenerateSolutionResponse)
    }

    return reply.status(200).send({
      success: true,
      data: solution
    } satisfies GenerateSolutionResponse)
  })

  /** GET /api/tech-solution - List all generated solutions */
  app.get('/api/tech-solution', async (_request, reply) => {
    const solutions = store.list()
    return reply.status(200).send({
      success: true,
      data: solutions
    })
  })

  /** GET /health - Health check */
  app.get('/health', async () => {
    return { status: 'ok', service: 'tech-solution-api' }
  })
}
