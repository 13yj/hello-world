const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { URL } = require('node:url');

const PORT = Number(process.env.PORT || 3000);
const publicDir = path.join(__dirname, 'public');
const dataDir = path.join(__dirname, 'data');
const leadsFile = path.join(dataDir, 'leads.json');
const VALID_STATUSES = ['new', 'contacted', 'closed'];

function ensureLeadsFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(leadsFile)) {
    fs.writeFileSync(leadsFile, '[]\n', 'utf8');
  }
}

function readLeads() {
  ensureLeadsFile();
  const raw = fs.readFileSync(leadsFile, 'utf8');
  const parsed = JSON.parse(raw || '[]');
  return Array.isArray(parsed) ? parsed : [];
}

function writeLeads(leads) {
  ensureLeadsFile();
  fs.writeFileSync(leadsFile, `${JSON.stringify(leads, null, 2)}\n`, 'utf8');
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8'
  });
  res.end(JSON.stringify(payload));
}

function serveStaticFile(res, filePath, contentType) {
  fs.readFile(filePath, (error, content) => {
    if (error) {
      sendJson(res, 500, { message: '服务器暂时不可用，请稍后重试。' });
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
}

async function collectBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1e6) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });

    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function validateLead(input) {
  const name = String(input.name || '').trim();
  const phone = String(input.phone || '').trim();
  const company = String(input.company || '').trim();
  const message = String(input.message || '').trim();

  if (!name) {
    return { ok: false, message: '请输入姓名。' };
  }

  if (!phone) {
    return { ok: false, message: '请输入手机号。' };
  }

  return {
    ok: true,
    value: { name, phone, company, message }
  };
}

function updateLeadStatus(id, status) {
  if (!VALID_STATUSES.includes(status)) {
    return { ok: false, statusCode: 400, message: '状态无效。' };
  }

  const leads = readLeads();
  const lead = leads.find((item) => item.id === id);

  if (!lead) {
    return { ok: false, statusCode: 404, message: '线索不存在。' };
  }

  lead.status = status;
  lead.updatedAt = new Date().toISOString();
  writeLeads(leads);

  return { ok: true, value: lead };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');

  if (req.method === 'GET' && url.pathname === '/') {
    return serveStaticFile(res, path.join(publicDir, 'index.html'), 'text/html; charset=utf-8');
  }

  if (req.method === 'GET' && url.pathname === '/admin') {
    return serveStaticFile(res, path.join(publicDir, 'admin.html'), 'text/html; charset=utf-8');
  }

  if (req.method === 'GET' && url.pathname === '/styles.css') {
    return serveStaticFile(res, path.join(publicDir, 'styles.css'), 'text/css; charset=utf-8');
  }

  if (req.method === 'POST' && url.pathname === '/api/leads') {
    try {
      const rawBody = await collectBody(req);
      const parsedBody = rawBody ? JSON.parse(rawBody) : {};
      const validation = validateLead(parsedBody);

      if (!validation.ok) {
        return sendJson(res, 400, { message: validation.message });
      }

      const timestamp = new Date().toISOString();
      const lead = {
        id: randomUUID(),
        ...validation.value,
        status: 'new',
        createdAt: timestamp,
        updatedAt: timestamp
      };

      const leads = readLeads();
      leads.unshift(lead);
      writeLeads(leads);

      return sendJson(res, 201, {
        message: '提交成功，我们会尽快与您联系。',
        data: lead
      });
    } catch (error) {
      if (error instanceof SyntaxError) {
        return sendJson(res, 400, { message: '请求格式不正确。' });
      }

      return sendJson(res, 500, { message: '提交失败，请稍后重试。' });
    }
  }

  if (req.method === 'GET' && url.pathname === '/api/admin/leads') {
    return sendJson(res, 200, { data: readLeads() });
  }

  const statusMatch = url.pathname.match(/^\/api\/admin\/leads\/([^/]+)\/status$/);
  if (req.method === 'PATCH' && statusMatch) {
    try {
      const rawBody = await collectBody(req);
      const parsedBody = rawBody ? JSON.parse(rawBody) : {};
      const result = updateLeadStatus(statusMatch[1], parsedBody.status);

      if (!result.ok) {
        return sendJson(res, result.statusCode, { message: result.message });
      }

      return sendJson(res, 200, {
        message: '状态更新成功。',
        data: result.value
      });
    } catch (error) {
      if (error instanceof SyntaxError) {
        return sendJson(res, 400, { message: '请求格式不正确。' });
      }

      return sendJson(res, 500, { message: '状态更新失败，请稍后重试。' });
    }
  }

  return sendJson(res, 404, { message: 'Not Found' });
});

ensureLeadsFile();

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

module.exports = {
  server,
  validateLead,
  readLeads,
  writeLeads,
  updateLeadStatus,
  leadsFile,
  VALID_STATUSES
};
