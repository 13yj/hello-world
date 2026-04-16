const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const { validateLead, readLeads, writeLeads, leadsFile } = require('./server');

test('validateLead rejects missing required fields', () => {
  assert.deepEqual(validateLead({ name: '', phone: '' }), {
    ok: false,
    message: '请输入姓名。'
  });

  assert.deepEqual(validateLead({ name: 'Alice', phone: '' }), {
    ok: false,
    message: '请输入手机号。'
  });
});

test('validateLead trims and accepts valid payload', () => {
  const result = validateLead({
    name: ' Alice ',
    phone: ' 13800138000 ',
    company: ' Demo Corp ',
    message: ' Hello '
  });

  assert.equal(result.ok, true);
  assert.deepEqual(result.value, {
    name: 'Alice',
    phone: '13800138000',
    company: 'Demo Corp',
    message: 'Hello'
  });
});

test('lead storage reads and writes json file', () => {
  const original = fs.readFileSync(leadsFile, 'utf8');

  try {
    const sample = [{ id: '1', name: 'A', phone: '1', company: '', message: '', status: 'new', createdAt: 'x', updatedAt: 'x' }];
    writeLeads(sample);
    assert.deepEqual(readLeads(), sample);
  } finally {
    fs.writeFileSync(leadsFile, original, 'utf8');
  }
});
