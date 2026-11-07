import { describe, it, expect, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import { createMeetingsRouter } from '../src/routes/meetings.routes';

describe('Meetings Router', () => {
  function createTestApp() {
    const mockWorkspace: any = {
      meetings: [
        {
          id: 'meet-1',
          title: 'Existing Strategy Call',
          scheduledDate: '2026-11-10',
          scheduledTime: '10:00 AM',
          durationMinutes: 30,
          platform: 'google_meet',
          meetingUrl: 'https://meet.google.com/test-1',
          clientName: 'Alice',
          clientEmail: 'alice@example.com',
          status: 'scheduled'
        }
      ],
      leads: [
        { id: 'lead-1', name: 'Bob', status: 'qualified' }
      ]
    };

    let saved = false;

    const router = createMeetingsRouter({
      getUserWorkspace: () => mockWorkspace,
      saveUserWorkspace: async () => { saved = true; }
    });

    const app = express();
    app.use(express.json());
    app.use('/api/meetings', router);

    return { app, mockWorkspace, wasSaved: () => saved };
  }

  it('GET /api/meetings returns user meetings', async () => {
    const { app } = createTestApp();
    const res = await request(app).get('/api/meetings');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.meetings).toHaveLength(1);
    expect(res.body.meetings[0].title).toBe('Existing Strategy Call');
  });

  it('POST /api/meetings schedules a new meeting and saves workspace', async () => {
    const { app, wasSaved } = createTestApp();
    const res = await request(app)
      .post('/api/meetings')
      .send({
        title: 'New Client Onboarding',
        clientName: 'Charlie',
        clientEmail: 'charlie@enterprise.com',
        scheduledDate: '2026-11-12'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.meeting.title).toBe('New Client Onboarding');
    expect(wasSaved()).toBe(true);
  });

  it('PUT /api/meetings/:id updates an existing meeting', async () => {
    const { app } = createTestApp();
    const res = await request(app)
      .put('/api/meetings/meet-1')
      .send({ status: 'confirmed' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.meeting.status).toBe('confirmed');
  });

  it('DELETE /api/meetings/:id removes the meeting', async () => {
    const { app, mockWorkspace } = createTestApp();
    const res = await request(app).delete('/api/meetings/meet-1');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockWorkspace.meetings).toHaveLength(0);
  });
});
