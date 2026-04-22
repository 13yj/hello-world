const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'leads.json');
const VALID_STATUSES = ['new', 'contacted', 'closed'];

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, '[]\n', 'utf8');
  }
}

async function readLeads() {
  await ensureStore();
  const raw = await fs.readFile(DATA_FILE, 'utf8');
  const parsed = JSON.parse(raw || '[]');
  return Array.isArray(parsed) ? parsed : [];
}

async function writeLeads(leads) {
  await ensureStore();
  await fs.writeFile(DATA_FILE, `${JSON.stringify(leads, null, 2)}\n`, 'utf8');
}

function validateLeadInput(payload) {
  if (!payload || typeof payload !== 'object') {
    return 'Invalid request body';
  }
  if (!String(payload.name || '').trim()) {
    return 'name is required';
  }
  if (!String(payload.phone || '').trim()) {
    return 'phone is required';
  }
  return '';
}

function normalizeLeadInput(payload) {
  return {
    name: String(payload.name || '').trim(),
    phone: String(payload.phone || '').trim(),
    company: String(payload.company || '').trim(),
    message: String(payload.message || '').trim(),
  };
}

async function createLead(payload) {
  const error = validateLeadInput(payload);
  if (error) {
    const err = new Error(error);
    err.statusCode = 400;
    throw err;
  }

  const input = normalizeLeadInput(payload);
  const now = new Date().toISOString();
  const lead = {
    id: crypto.randomUUID(),
    ...input,
    status: 'new',
    createdAt: now,
    updatedAt: now,
  };

  const leads = await readLeads();
  leads.unshift(lead);
  await writeLeads(leads);
  return lead;
}

async function listLeads() {
  return readLeads();
}

async function updateLeadStatus(id, status) {
  if (!VALID_STATUSES.includes(status)) {
    const err = new Error('status must be one of: new, contacted, closed');
    err.statusCode = 400;
    throw err;
  }

  const leads = await readLeads();
  const lead = leads.find((item) => item.id === id);
  if (!lead) {
    const err = new Error('Lead not found');
    err.statusCode = 404;
    throw err;
  }

  lead.status = status;
  lead.updatedAt = new Date().toISOString();
  await writeLeads(leads);
  return lead;
}

module.exports = {
  DATA_FILE,
  VALID_STATUSES,
  createLead,
  listLeads,
  updateLeadStatus,
  writeLeads,
};
