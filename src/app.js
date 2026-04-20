import express from 'express';
import { randomUUID } from 'node:crypto';

const VALID_STATUSES = new Set(['new', 'contacted', 'closed']);

export function createApp() {
  const app = express();
  const leads = [];

  app.use(express.json());

  app.post('/api/leads', (req, res) => {
    const { name, phone, company = '', message = '' } = req.body ?? {};

    if (!name || !phone) {
      return res.status(400).json({
        error: 'name and phone are required',
      });
    }

    const now = new Date().toISOString();
    const lead = {
      id: randomUUID(),
      name,
      phone,
      company,
      message,
      status: 'new',
      createdAt: now,
      updatedAt: now,
    };

    leads.push(lead);
    return res.status(201).json(lead);
  });

  app.get('/api/admin/leads', (_req, res) => {
    res.json(leads);
  });

  app.patch('/api/admin/leads/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body ?? {};

    if (!VALID_STATUSES.has(status)) {
      return res.status(400).json({
        error: 'invalid status',
      });
    }

    const lead = leads.find((item) => item.id === id);
    if (!lead) {
      return res.status(404).json({
        error: 'lead not found',
      });
    }

    lead.status = status;
    lead.updatedAt = new Date().toISOString();
    return res.json(lead);
  });

  return app;
}
