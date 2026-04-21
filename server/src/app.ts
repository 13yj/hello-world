import Fastify, { type FastifyInstance } from 'fastify'
import { createLead, getAllLeads, updateLeadStatus } from './store.js'
import type { CreateLeadInput, UpdateLeadStatusInput } from './types.js'

export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: false })

  // POST /api/leads - Create a new lead
  app.post<{ Body: CreateLeadInput }>('/api/leads', async (request, reply) => {
    const { name, phone, company, message } = request.body ?? {}

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return reply.status(400).send({ error: 'name is required' })
    }
    if (!phone || typeof phone !== 'string' || phone.trim() === '') {
      return reply.status(400).send({ error: 'phone is required' })
    }

    const lead = await createLead({
      name: name.trim(),
      phone: phone.trim(),
      company: company?.trim(),
      message: message?.trim(),
    })

    return reply.status(201).send(lead)
  })

  // GET /api/admin/leads - Get all leads
  app.get('/api/admin/leads', async (_request, reply) => {
    const leads = await getAllLeads()
    return reply.send(leads)
  })

  // PATCH /api/admin/leads/:id/status - Update lead status
  app.patch<{
    Params: { id: string }
    Body: UpdateLeadStatusInput
  }>('/api/admin/leads/:id/status', async (request, reply) => {
    const { id } = request.params
    const { status } = request.body ?? {}

    if (!status || !['new', 'contacted', 'closed'].includes(status)) {
      return reply.status(400).send({ error: 'Invalid status' })
    }

    const lead = await updateLeadStatus(id, status)
    if (!lead) {
      return reply.status(404).send({ error: 'Lead not found' })
    }

    return reply.send(lead)
  })

  return app
}
