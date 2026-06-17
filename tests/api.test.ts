import { describe, it, expect, beforeAll } from 'vitest'
import Fastify from 'fastify'
import type { FastifyInstance } from 'fastify'
import { registerRoutes } from '../src/routes.js'

describe('Tech Solution API', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = Fastify()
    registerRoutes(app)
    await app.ready()
  })

  describe('POST /api/tech-solution/generate', () => {
    it('should generate a tech solution from valid requirements', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/tech-solution/generate',
        payload: {
          requirement: {
            title: 'Lead Collection Website',
            description: 'A web frontend and backend API for collecting sales leads',
            features: ['Lead form', 'Admin dashboard', 'Status tracking'],
            constraints: ['No database required for MVP']
          }
        }
      })

      expect(response.statusCode).toBe(200)
      const body = response.json()
      expect(body.success).toBe(true)
      expect(body.data).toBeDefined()
      expect(body.data.title).toContain('Lead Collection Website')
      expect(body.data.architecture).toBeDefined()
      expect(body.data.architecture.components.length).toBeGreaterThan(0)
      expect(body.data.techStack.length).toBeGreaterThan(0)
      expect(body.data.modules.length).toBeGreaterThan(0)
      expect(body.data.implementationPlan.length).toBeGreaterThan(0)
      expect(body.data.risks.length).toBeGreaterThan(0)
    })

    it('should return 400 when requirement is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/tech-solution/generate',
        payload: {}
      })

      expect(response.statusCode).toBe(400)
      const body = response.json()
      expect(body.success).toBe(false)
      expect(body.error).toBeDefined()
    })

    it('should return 400 when title is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/tech-solution/generate',
        payload: {
          requirement: { description: 'Some description' }
        }
      })

      expect(response.statusCode).toBe(400)
      const body = response.json()
      expect(body.success).toBe(false)
    })

    it('should return 400 when description is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/tech-solution/generate',
        payload: {
          requirement: { title: 'Some title' }
        }
      })

      expect(response.statusCode).toBe(400)
      const body = response.json()
      expect(body.success).toBe(false)
    })
  })

  describe('GET /api/tech-solution/:id', () => {
    it('should return 404 for non-existent solution', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/tech-solution/nonexistent'
      })

      expect(response.statusCode).toBe(404)
      const body = response.json()
      expect(body.success).toBe(false)
    })

    it('should retrieve a previously generated solution', async () => {
      // First, generate a solution
      const genResponse = await app.inject({
        method: 'POST',
        url: '/api/tech-solution/generate',
        payload: {
          requirement: {
            title: 'Test Project',
            description: 'A test backend API project'
          }
        }
      })

      const genBody = genResponse.json()
      const solutionId = genBody.data.id

      // Then retrieve it
      const getResponse = await app.inject({
        method: 'GET',
        url: `/api/tech-solution/${solutionId}`
      })

      expect(getResponse.statusCode).toBe(200)
      const getBody = getResponse.json()
      expect(getBody.success).toBe(true)
      expect(getBody.data.id).toBe(solutionId)
    })
  })

  describe('GET /api/tech-solution', () => {
    it('should list generated solutions', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/tech-solution'
      })

      expect(response.statusCode).toBe(200)
      const body = response.json()
      expect(body.success).toBe(true)
      expect(Array.isArray(body.data)).toBe(true)
    })
  })

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health'
      })

      expect(response.statusCode).toBe(200)
      const body = response.json()
      expect(body.status).toBe('ok')
      expect(body.service).toBe('tech-solution-api')
    })
  })
})
