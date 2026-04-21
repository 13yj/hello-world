import { createLead, deleteLead, listLeads, updateLead } from './store.js';

export const registerLeadRoutes = (app: { get: Function; post: Function; patch: Function; delete: Function }) => {
  app.get('/api/leads', async () => listLeads());
  app.post('/api/leads', async (request: { body: unknown }) => createLead(request.body as never));
  app.patch('/api/leads/:id', async (request: { params: { id: string }; body: unknown }) => updateLead(request.params.id, request.body as never));
  app.delete('/api/leads/:id', async (request: { params: { id: string } }) => ({ success: deleteLead(request.params.id) }));
};
