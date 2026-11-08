import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';

describe('LinkedIn Page Selection and State Routing', () => {
  function createPageTestApp() {
    const mockDb: any = {
      connectedPages: [
        {
          id: 'page-li-person-123',
          platform: 'LinkedIn',
          pageName: 'John Doe (Personal Profile)',
          externalPageId: 'urn:li:person:123',
          followersCount: 500,
          accountType: 'personal',
          isSelected: true
        },
        {
          id: 'page-li-org-456',
          platform: 'LinkedIn',
          pageName: 'Acme Corp (Company Page)',
          externalPageId: 'urn:li:organization:456',
          followersCount: 1200,
          accountType: 'organization',
          isSelected: false
        }
      ],
      oauthSessions: {
        linkedin: {
          pageId: 'urn:li:person:123',
          authorUrn: 'urn:li:person:123',
          pageName: 'John Doe (Personal Profile)'
        },
        credentials: {}
      }
    };

    const app = express();
    app.use(express.json());

    // Page selection route
    app.post('/api/social/pages/select', (req, res) => {
      const { pageId } = req.body || {};
      if (!pageId) return res.status(400).json({ error: 'Missing pageId' });

      const target = mockDb.connectedPages.find((p: any) => p.id === pageId || p.externalPageId === pageId);
      if (!target) return res.status(404).json({ error: 'Page not found' });

      mockDb.connectedPages.forEach((p: any) => {
        p.isSelected = p.id === target.id;
      });
      mockDb.oauthSessions.linkedin.pageId = target.externalPageId;
      mockDb.oauthSessions.linkedin.authorUrn = target.externalPageId;
      mockDb.oauthSessions.linkedin.pageName = target.pageName;

      return res.json({
        success: true,
        activePage: target,
        connectedPages: mockDb.connectedPages
      });
    });

    return { app, mockDb };
  }

  it('selects active LinkedIn page and updates session authorUrn', async () => {
    const { app, mockDb } = createPageTestApp();

    const res = await request(app)
      .post('/api/social/pages/select')
      .send({ pageId: 'page-li-org-456' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.activePage.pageName).toBe('Acme Corp (Company Page)');
    expect(mockDb.oauthSessions.linkedin.authorUrn).toBe('urn:li:organization:456');

    // Personal profile should now have isSelected: false
    const personal = mockDb.connectedPages.find((p: any) => p.id === 'page-li-person-123');
    expect(personal.isSelected).toBe(false);

    // Organization page should now have isSelected: true
    const org = mockDb.connectedPages.find((p: any) => p.id === 'page-li-org-456');
    expect(org.isSelected).toBe(true);
  });

  it('returns 404 if requested pageId does not exist', async () => {
    const { app } = createPageTestApp();

    const res = await request(app)
      .post('/api/social/pages/select')
      .send({ pageId: 'nonexistent-page-id' });

    expect(res.status).toBe(404);
  });
});
