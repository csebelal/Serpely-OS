import express, { Router } from 'express';
import { resolveUserEmail, DEFAULT_ADMIN_EMAIL } from '../middleware/auth.middleware';

export interface StateRouterOptions {
  getUserWorkspace: (email: string) => any;
  saveUserWorkspace: (email: string, userDb: any) => Promise<void>;
  createInitialDb: () => any;
  adminEmails?: string[];
}

export function createStateRouter(options: StateRouterOptions): Router {
  const router = express.Router();
  const adminEmails = options.adminEmails || ['csebelal9@gmail.com', DEFAULT_ADMIN_EMAIL];

  const allowedKeys = [
    'brandProfile',
    'agents',
    'approvals',
    'geoScore',
    'campaigns',
    'contentList',
    'socialPosts',
    'emailCampaigns',
    'emailSequences',
    'leads',
    'communityMessages',
    'automations',
    'integrations',
    'memories',
    'connectedPages',
    'pagePosts',
    'reports',
    'webhookConfig',
    'webhookLogs',
    'scheduledQueue',
    'meetings',
    'messagingConfig'
  ];

  // GET /api/state
  router.get('/', (req, res) => {
    try {
      const userEmail = resolveUserEmail(req);
      const userDb = options.getUserWorkspace(userEmail);
      const filteredPages = (userDb.connectedPages || []).filter((p: any) => {
        if (!p.ownerEmail) return adminEmails.includes(userEmail);
        return p.ownerEmail.toLowerCase() === userEmail;
      });
      return res.json({ ...userDb, connectedPages: filteredPages });
    } catch (err: any) {
      console.error('[GET /api/state Error]:', err);
      return res.status(500).json({ error: 'Failed to retrieve workspace state' });
    }
  });

  // PUT /api/state
  router.put('/', async (req, res) => {
    try {
      const userEmail = resolveUserEmail(req);
      const userDb = options.getUserWorkspace(userEmail);
      const updates = req.body || {};

      for (const key of allowedKeys) {
        if (updates[key] !== undefined) {
          userDb[key] = updates[key];
        }
      }

      await options.saveUserWorkspace(userEmail, userDb);
      return res.json({ success: true, state: userDb });
    } catch (err: any) {
      console.error('[PUT /api/state Error]:', err);
      return res.status(500).json({ success: false, error: 'Failed to persist workspace state' });
    }
  });

  // POST /api/state/reset
  router.post('/reset', async (req, res) => {
    try {
      const userEmail = resolveUserEmail(req);
      const userDb = options.getUserWorkspace(userEmail);
      const preservedOAuth = userDb.oauthSessions;
      const freshDb = options.createInitialDb();
      freshDb.oauthSessions = preservedOAuth;

      await options.saveUserWorkspace(userEmail, freshDb);
      return res.json({ success: true, state: freshDb });
    } catch (err: any) {
      console.error('[POST /api/state/reset Error]:', err);
      return res.status(500).json({ success: false, error: 'Failed to reset workspace state' });
    }
  });

  return router;
}

export default createStateRouter;
