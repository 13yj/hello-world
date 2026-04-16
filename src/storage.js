const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const dataDir = path.join(__dirname, '..', 'data');
const dataFile = path.join(dataDir, 'leads.json');

function ensureStore() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, '[]\n', 'utf8');
  }
}

function readLeads() {
  ensureStore();
  const raw = fs.readFileSync(dataFile, 'utf8');
  const parsed = JSON.parse(raw || '[]');
  return Array.isArray(parsed) ? parsed : [];
}

function writeLeads(leads) {
  ensureStore();
  fs.writeFileSync(dataFile, `${JSON.stringify(leads, null, 2)}\n`, 'utf8');
}

function createLead(input) {
  const now = new Date().toISOString();
  const lead = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    phone: input.phone.trim(),
    company: (input.company || '').trim(),
    message: (input.message || '').trim(),
    status: 'new',
    createdAt: now,
    updatedAt: now,
  };
  const leads = readLeads();
  leads.unshift(lead);
  writeLeads(leads);
  return lead;
}

function updateLeadStatus(id, status) {
  const leads = readLeads();
  const lead = leads.find((item) => item.id === id);
  if (!lead) {
    return null;
  }
  lead.status = status;
  lead.updatedAt = new Date().toISOString();
  writeLeads(leads);
  return lead;
}

module.exports = {
  dataFile,
  readLeads,
  createLead,
  updateLeadStatus,
};
