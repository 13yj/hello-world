import http from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, 'public');
const dataDir = path.join(__dirname, 'data');
const leadsFile = path.join(dataDir, 'leads.json');
const port = Number(process.env.PORT || 3000);

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8'
};

async function ensureStorage() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(leadsFile);
  } catch {
    await fs.writeFile(leadsFile, '[]\n', 'utf8');
  }
}

async function readLeads() {
  await ensureStorage();
  const raw = await fs.readFile(leadsFile, 'utf8');
  return JSON.parse(raw || '[]');
}

async function writeLeads(leads) {
  await ensureStorage();
  await fs.writeFile(leadsFile, JSON.stringify(leads, null, 2) + '\n', 'utf8');
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

async function parseBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

function validateLead(payload) {
  const name = String(payload?.name || '').trim();
  const phone = String(payload?.phone || '').trim();
  const company = String(payload?.company || '').trim();
  const message = String(payload?.message || '').trim();

  if (!name) return { ok: false, error: '姓名为必填项' };
  if (!phone) return { ok: false, error: '手机号为必填项' };

  return {
    ok: true,
    data: { name, phone, company, message }
  };
}

async function handleCreateLead(req, res) {
  try {
    const payload = await parseBody(req);
    const validation = validateLead(payload);
    if (!validation.ok) {
      return sendJson(res, 400, { message: validation.error });
    }

    const now = new Date().toISOString();
    const lead = {
      id: crypto.randomUUID(),
      ...validation.data,
      status: 'new',
      createdAt: now,
      updatedAt: now
    };

    const leads = await readLeads();
    leads.push(lead);
    await writeLeads(leads);

    return sendJson(res, 201, {
      message: '提交成功',
      data: lead
    });
  } catch (error) {
    return sendJson(res, 500, {
      message: '提交失败，请稍后重试'
    });
  }
}

async function serveStatic(res, requestPath) {
  const safePath = requestPath === '/' ? '/index.html' : requestPath;
  const filePath = path.join(publicDir, safePath);

  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  try {
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) {
      return serveStatic(res, path.join(safePath, 'index.html'));
    }

    const ext = path.extname(filePath);
    const content = await fs.readFile(filePath);
    res.writeHead(200, {
      'Content-Type': contentTypes[ext] || 'application/octet-stream'
    });
    res.end(content);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'POST' && url.pathname === '/api/leads') {
    return handleCreateLead(req, res);
  }

  if (req.method === 'GET') {
    return serveStatic(res, url.pathname);
  }

  res.writeHead(405, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify({ message: 'Method Not Allowed' }));
});

await ensureStorage();
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
