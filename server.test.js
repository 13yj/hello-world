const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const { server, writeLeads, leadsFile } = require('./server');

let app;
let baseUrl;

test.before(async () => {
  writeLeads([]);
  app = server.listen(0);
  await new Promise((resolve) => app.once('listening', resolve));
  const address = app.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

test.after(async () => {
  await new Promise((resolve, reject) => {
    app.close((error) => (error ? reject(error) : resolve()));
  });
});

test('creates, lists and updates leads with admin api', async () => {
  const createResponse = await fetch(`${baseUrl}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Alice',
      phone: '13800000000',
      company: 'Tokfinity',
      message: 'Need a demo'
    })
  });

  assert.equal(createResponse.status, 201);
  const created = await createResponse.json();
  assert.equal(created.data.status, 'new');

  const listResponse = await fetch(`${baseUrl}/api/admin/leads`);
  assert.equal(listResponse.status, 200);
  const listPayload = await listResponse.json();
  assert.equal(listPayload.data.length, 1);
  assert.equal(listPayload.data[0].name, 'Alice');

  const updateResponse = await fetch(`${baseUrl}/api/admin/leads/${created.data.id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'contacted' })
  });

  assert.equal(updateResponse.status, 200);
  const updated = await updateResponse.json();
  assert.equal(updated.data.status, 'contacted');

  const persisted = JSON.parse(await fs.readFile(leadsFile, 'utf8'));
  assert.equal(persisted[0].status, 'contacted');
});

test('serves admin page and rejects invalid status values', async () => {
  writeLeads([]);

  const createResponse = await fetch(`${baseUrl}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Bob', phone: '13900000000' })
  });
  const created = await createResponse.json();

  const pageResponse = await fetch(`${baseUrl}/admin`);
  assert.equal(pageResponse.status, 200);
  const pageHtml = await pageResponse.text();
  assert.match(pageHtml, /线索列表/);

  const invalidStatusResponse = await fetch(`${baseUrl}/api/admin/leads/${created.data.id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'pending' })
  });

  assert.equal(invalidStatusResponse.status, 400);
});
