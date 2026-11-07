import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import { createHealthRouter } from '../src/routes/health.routes';

describe('Health Probe Router', () => {
  it('returns 200 OK and healthy status metrics payload', async () => {
    const app = express();
    app.use('/api/health', createHealthRouter({ 
      getActiveWorkspacesCount: () => 3,
      skipDbPing: true 
    }));

    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.service).toBe('sincly-marketing-os');
    expect(res.body.status).toBe('healthy');
    expect(res.body.uptime).toBeDefined();
    expect(res.body.uptime.seconds).toBeGreaterThanOrEqual(0);
    expect(res.body.memory).toBeDefined();
    expect(res.body.system).toBeDefined();
    expect(res.body.database).toBeDefined();
    expect(res.body.activeWorkspaces).toBe(3);
  });
});
