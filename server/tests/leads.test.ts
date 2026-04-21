import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { buildApp } from '../src/app.js'
import { writeFile, rm, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import type { FastifyInstance } from 'fastify'

const DATA_DIR = path.resolve(process.cwd(), 'data')
const DATA_FILE = path.join(DATA_DIR, 'leads.json')

let app: FastifyInstance

beforeEach(async () => {
  // Reset data file before each test
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true })
  }
  await writeFile(DATA_FILE, JSON.stringify([], null, 2), 'utf-8')
  app = buildApp()
  await app.ready()
})

afterEach(async () => {
  await app.close()
  // Clean up data file
  if (existsSync(DATA_FILE)) {
    await rm(DATA_FILE)
  }
})

describe('POST /api/leads', () => {
  it('should create a lead with valid data', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/leads',
      payload: {
        name: 'John Doe',
        phone: '13800138000',
        company: 'Acme Corp',
        message: 'Interested in your product',
      },
    })

    expect(res.statusCode).toBe(201)
    const body = res.json()
    expect(body.id).toBeDefined()
    expect(body.name).toBe('John Doe')
    expect(body.phone).toBe('13800138000')
    expect(body.company).toBe('Acme Corp')
    expect(body.message).toBe('Interested in your product')
    expect(body.status).toBe('new')
    expect(body.createdAt).toBeDefined()
    expect(body.updatedAt).toBeDefined()
  })

  it('should create a lead with only required fields', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/leads',
      payload: {
        name: 'Jane',
        phone: '13900139000',
      },
    })

    expect(res.statusCode).toBe(201)
    const body = res.json()
    expect(body.name).toBe('Jane')
    expect(body.phone).toBe('13900139000')
    expect(body.company).toBe('')
    expect(body.message).toBe('')
  })

  it('should return 400 when name is missing', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/leads',
      payload: {
        phone: '13800138000',
      },
    })

    expect(res.statusCode).toBe(400)
    const body = res.json()
    expect(body.error).toBe('name is required')
  })

  it('should return 400 when phone is missing', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/leads',
      payload: {
        name: 'John',
      },
    })

    expect(res.statusCode).toBe(400)
    const body = res.json()
    expect(body.error).toBe('phone is required')
  })

  it('should return 400 when name is empty string', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/leads',
      payload: {
        name: '   ',
        phone: '13800138000',
      },
    })

    expect(res.statusCode).toBe(400)
    const body = res.json()
    expect(body.error).toBe('name is required')
  })
})

describe('GET /api/admin/leads', () => {
  it('should return empty array when no leads exist', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/admin/leads',
    })

    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual([])
  })

  it('should return all leads', async () => {
    // Create two leads
    await app.inject({
      method: 'POST',
      url: '/api/leads',
      payload: { name: 'Lead 1', phone: '111' },
    })
    await app.inject({
      method: 'POST',
      url: '/api/leads',
      payload: { name: 'Lead 2', phone: '222' },
    })

    const res = await app.inject({
      method: 'GET',
      url: '/api/admin/leads',
    })

    expect(res.statusCode).toBe(200)
    const leads = res.json()
    expect(leads).toHaveLength(2)
    expect(leads[0].name).toBe('Lead 1')
    expect(leads[1].name).toBe('Lead 2')
  })
})

describe('PATCH /api/admin/leads/:id/status', () => {
  it('should update lead status', async () => {
    // Create a lead first
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/leads',
      payload: { name: 'Test', phone: '123' },
    })
    const lead = createRes.json()

    const res = await app.inject({
      method: 'PATCH',
      url: `/api/admin/leads/${lead.id}/status`,
      payload: { status: 'contacted' },
    })

    expect(res.statusCode).toBe(200)
    const updated = res.json()
    expect(updated.status).toBe('contacted')
    expect(updated.id).toBe(lead.id)
    expect(new Date(updated.updatedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(lead.updatedAt).getTime()
    )
  })

  it('should update status to closed', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/leads',
      payload: { name: 'Test', phone: '123' },
    })
    const lead = createRes.json()

    const res = await app.inject({
      method: 'PATCH',
      url: `/api/admin/leads/${lead.id}/status`,
      payload: { status: 'closed' },
    })

    expect(res.statusCode).toBe(200)
    expect(res.json().status).toBe('closed')
  })

  it('should return 400 for invalid status', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/leads',
      payload: { name: 'Test', phone: '123' },
    })
    const lead = createRes.json()

    const res = await app.inject({
      method: 'PATCH',
      url: `/api/admin/leads/${lead.id}/status`,
      payload: { status: 'invalid' },
    })

    expect(res.statusCode).toBe(400)
    expect(res.json().error).toBe('Invalid status')
  })

  it('should return 404 for non-existent lead', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/admin/leads/non-existent-id/status',
      payload: { status: 'contacted' },
    })

    expect(res.statusCode).toBe(404)
    expect(res.json().error).toBe('Lead not found')
  })
})
