const fs = require('fs');
const http = require('http');
const path = require('path');
const assert = require('assert');
const { buildServer } = require('../src/server');
const { dataFile } = require('../src/storage');

function request(server, method, route, body) {
  const address = server.address();
  const payload = body ? JSON.stringify(body) : null;

  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: address.port,
      path: route,
      method,
      headers: payload ? {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      } : {},
    }, (res) => {
      let raw = '';
      res.on('data', (chunk) => {
        raw += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: raw ? JSON.parse(raw) : null,
        });
      });
    });

    req.on('error', reject);
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

(async () => {
  fs.mkdirSync(path.dirname(dataFile), { recursive: true });
  fs.writeFileSync(dataFile, '[]\n', 'utf8');

  const server = buildServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

  try {
    const invalidCreate = await request(server, 'POST', '/api/leads', {
      name: '  ',
      phone: '',
    });
    assert.strictEqual(invalidCreate.status, 400);
    assert.strictEqual(invalidCreate.body.error, 'name and phone are required');

    const created = await request(server, 'POST', '/api/leads', {
      name: 'Alice',
      phone: '13800000000',
      company: 'Tokfinity',
      message: '需要演示',
    });
    assert.strictEqual(created.status, 201);
    assert.strictEqual(created.body.lead.name, 'Alice');
    assert.strictEqual(created.body.lead.phone, '13800000000');
    assert.strictEqual(created.body.lead.status, 'new');

    const list = await request(server, 'GET', '/api/admin/leads');
    assert.strictEqual(list.status, 200);
    assert.strictEqual(Array.isArray(list.body.leads), true);
    assert.strictEqual(list.body.leads.length, 1);
    assert.strictEqual(list.body.leads[0].id, created.body.lead.id);

    const invalidStatus = await request(server, 'PATCH', `/api/admin/leads/${created.body.lead.id}/status`, {
      status: 'pending',
    });
    assert.strictEqual(invalidStatus.status, 400);
    assert.strictEqual(invalidStatus.body.error, 'invalid status');

    const updated = await request(server, 'PATCH', `/api/admin/leads/${created.body.lead.id}/status`, {
      status: 'contacted',
    });
    assert.strictEqual(updated.status, 200);
    assert.strictEqual(updated.body.lead.id, created.body.lead.id);
    assert.strictEqual(updated.body.lead.status, 'contacted');

    const persisted = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    assert.strictEqual(persisted.length, 1);
    assert.strictEqual(persisted[0].status, 'contacted');

    console.log('leads api tests ok');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
