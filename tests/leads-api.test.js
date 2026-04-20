import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

describe('leads api', () => {
  it('validates required fields for POST /api/leads', async () => {
    const app = createApp();

    const response = await request(app)
      .post('/api/leads')
      .send({ company: 'Tokfinity' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'name and phone are required',
    });
  });

  it('creates a lead successfully', async () => {
    const app = createApp();

    const response = await request(app)
      .post('/api/leads')
      .send({
        name: 'Alice',
        phone: '13800000000',
        company: 'Tokfinity',
        message: 'Need a demo',
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      name: 'Alice',
      phone: '13800000000',
      company: 'Tokfinity',
      message: 'Need a demo',
      status: 'new',
    });
    expect(response.body.id).toBeTypeOf('string');
    expect(response.body.createdAt).toBeTypeOf('string');
    expect(response.body.updatedAt).toBeTypeOf('string');
  });

  it('returns created leads in GET /api/admin/leads', async () => {
    const app = createApp();

    await request(app).post('/api/leads').send({
      name: 'Bob',
      phone: '13900000000',
      company: 'Acme',
      message: 'Call me back',
    });

    const response = await request(app).get('/api/admin/leads');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toMatchObject({
      name: 'Bob',
      phone: '13900000000',
      status: 'new',
    });
  });

  it('rejects invalid status values', async () => {
    const app = createApp();

    const created = await request(app).post('/api/leads').send({
      name: 'Carol',
      phone: '13700000000',
    });

    const response = await request(app)
      .patch(`/api/admin/leads/${created.body.id}/status`)
      .send({ status: 'invalid' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'invalid status',
    });
  });

  it('updates lead status successfully', async () => {
    const app = createApp();

    const created = await request(app).post('/api/leads').send({
      name: 'Dave',
      phone: '13600000000',
    });

    const response = await request(app)
      .patch(`/api/admin/leads/${created.body.id}/status`)
      .send({ status: 'contacted' });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: created.body.id,
      status: 'contacted',
      name: 'Dave',
      phone: '13600000000',
    });
    expect(new Date(response.body.updatedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(response.body.createdAt).getTime(),
    );
  });
});
