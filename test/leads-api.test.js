const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const { createServer } = require('../src/server');
const { DATA_FILE, writeLeads } = require('../src/leadStore');

let server;
let baseUrl;

test.before(async () => {
  await writeLeads([]);
  server = createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

test.after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});

test('creates, lists and updates leads with file persistence', async () => {
  const createResponse = await fetch(`${baseUrl}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Alice',
      phone: '13800000000',
      company: 'Tokfinity',
      message: 'Need a demo',
    }),
  });

  assert.equal(createResponse.status, 201);
  const created = await createResponse.json();
  assert.equal(created.data.name, 'Alice');
  assert.equal(created.data.status, 'new');

  const listResponse = await fetch(`${baseUrl}/api/admin/leads`);
  assert.equal(listResponse.status, 200);
  const listed = await listResponse.json();
  assert.equal(listed.data.length, 1);
  assert.equal(listed.data[0].id, created.data.id);

  const patchResponse = await fetch(`${baseUrl}/api/admin/leads/${created.data.id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'contacted' }),
  });

  assert.equal(patchResponse.status, 200);
  const updated = await patchResponse.json();
  assert.equal(updated.data.status, 'contacted');

  const rawFile = await fs.readFile(DATA_FILE, 'utf8');
  const persisted = JSON.parse(rawFile);
  assert.equal(persisted.length, 1);
  assert.equal(persisted[0].status, 'contacted');
});

test('rejects invalid lead creation and invalid status update', async () => {
  const invalidCreate = await fetch(`${baseUrl}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '13800000000' }),
  });
  assert.equal(invalidCreate.status, 400);

  const createResponse = await fetch(`${baseUrl}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Bob', phone: '13900000000' }),
  });
  const created = await createResponse.json();

  const invalidStatus = await fetch(`${baseUrl}/api/admin/leads/${created.data.id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'pending' }),
  });
  assert.equal(invalidStatus.status, 400);
});
