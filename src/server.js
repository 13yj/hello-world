const http = require('node:http');
const { URL } = require('node:url');
const { createLead, listLeads, updateLeadStatus } = require('./leadStore');

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) {
    return {};
  }
  try {
    return JSON.parse(raw);
  } catch {
    const err = new Error('Invalid JSON body');
    err.statusCode = 400;
    throw err;
  }
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
  });
  res.end(JSON.stringify(payload));
}

async function requestListener(req, res) {
  const url = new URL(req.url, 'http://127.0.0.1');
  const { method } = req;

  try {
    if (method === 'POST' && url.pathname === '/api/leads') {
      const lead = await createLead(await readJsonBody(req));
      return sendJson(res, 201, { data: lead });
    }

    if (method === 'GET' && url.pathname === '/api/admin/leads') {
      const leads = await listLeads();
      return sendJson(res, 200, { data: leads });
    }

    const match = url.pathname.match(/^\/api\/admin\/leads\/([^/]+)\/status$/);
    if (method === 'PATCH' && match) {
      const lead = await updateLeadStatus(match[1], (await readJsonBody(req)).status);
      return sendJson(res, 200, { data: lead });
    }

    return sendJson(res, 404, { error: 'Not found' });
  } catch (error) {
    return sendJson(res, error.statusCode || 500, {
      error: error.message || 'Internal server error',
    });
  }
}

function createServer() {
  return http.createServer(requestListener);
}

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  const server = createServer();
  server.listen(port, () => {
    console.log(`Server listening on http://127.0.0.1:${port}`);
  });
}

module.exports = {
  createServer,
};
