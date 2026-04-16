const fs = require('fs');
const assert = require('assert');
const http = require('http');
const path = require('path');
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
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body: raw, headers: res.headers }));
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

(async () => {
  fs.mkdirSync(path.dirname(dataFile), { recursive: true });
  fs.writeFileSync(dataFile, '[]\n', 'utf8');

  const server = buildServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

  try {
    const home = await request(server, 'GET', '/');
    assert.strictEqual(home.status, 200);
    assert.match(home.body, /线索官网与后台一体化 MVP/);

    const invalid = await request(server, 'POST', '/api/leads', { name: '', phone: '' });
    assert.strictEqual(invalid.status, 400);

    const created = await request(server, 'POST', '/api/leads', {
      name: 'Alice',
      phone: '13800000000',
      company: 'Tokfinity',
      message: '需要演示',
    });
    assert.strictEqual(created.status, 201);
    const createdLead = JSON.parse(created.body).lead;
    assert.strictEqual(createdLead.status, 'new');

    const adminPage = await request(server, 'GET', '/admin');
    assert.strictEqual(adminPage.status, 200);
    assert.match(adminPage.body, /Alice/);

    const list = await request(server, 'GET', '/api/admin/leads');
    assert.strictEqual(list.status, 200);
    const leads = JSON.parse(list.body).leads;
    assert.strictEqual(leads.length, 1);
    assert.strictEqual(leads[0].name, 'Alice');

    const updated = await request(server, 'PATCH', `/api/admin/leads/${createdLead.id}/status`, { status: 'contacted' });
    assert.strictEqual(updated.status, 200);
    assert.strictEqual(JSON.parse(updated.body).lead.status, 'contacted');

    const reloaded = await request(server, 'GET', '/api/admin/leads');
    assert.strictEqual(JSON.parse(reloaded.body).leads[0].status, 'contacted');

    console.log('mvp flow ok');
  } finally {
    server.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
