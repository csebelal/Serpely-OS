import express, { Router, Request, Response } from 'express';
import { MeetingItem, MeetingType, MeetingStatus, MeetingPlatform } from '../types';
import { resolveUserEmail } from '../middleware/auth.middleware';
import { notifyMeetingScheduled, notifyMeetingReminder } from '../integrations/messagingEngine';

export interface MeetingsRouterOptions {
  getUserWorkspace: (email: string) => any;
  saveUserWorkspace: (email: string, db: any) => Promise<void> | void;
}

export function createMeetingsRouter(options: MeetingsRouterOptions): Router {
  const router = express.Router();

  // GET /api/meetings
  router.get('/', (req: Request, res: Response) => {
    try {
      const email = resolveUserEmail(req);
      const userDb = options.getUserWorkspace(email);
      return res.json({ success: true, meetings: userDb.meetings || [] });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Failed to fetch meetings' });
    }
  });

  // POST /api/meetings
  router.post('/', async (req: Request, res: Response) => {
    try {
      const email = resolveUserEmail(req);
      const userDb = options.getUserWorkspace(email);
      const meetingData: Partial<MeetingItem> = req.body || {};
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 86400000);
      const defaultDate = tomorrow.toISOString().split('T')[0];

      const newMeeting: MeetingItem = {
        id: meetingData.id || `meet-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: meetingData.title || 'Client Discovery & Strategy Audit',
        type: (meetingData.type as MeetingType) || 'strategy_audit',
        status: (meetingData.status as MeetingStatus) || 'scheduled',
        platform: (meetingData.platform as MeetingPlatform) || 'google_meet',
        meetingUrl: meetingData.meetingUrl || `https://meet.google.com/snc-${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 5)}`,
        scheduledDate: meetingData.scheduledDate || defaultDate,
        scheduledTime: meetingData.scheduledTime || '03:00 PM',
        durationMinutes: Number(meetingData.durationMinutes) || 45,
        timezone: meetingData.timezone || 'Asia/Dhaka (GMT+6)',
        agenda: meetingData.agenda || 'Omnichannel social and authority pipeline review.',
        notes: meetingData.notes || '',
        leadId: meetingData.leadId,
        clientName: meetingData.clientName || 'Prospective Partner',
        clientEmail: meetingData.clientEmail || 'partner@enterprise.com',
        clientCompany: meetingData.clientCompany,
        clientPhone: meetingData.clientPhone,
        notifySlack: meetingData.notifySlack ?? true,
        notifyDiscord: meetingData.notifyDiscord ?? true,
        notifyEmail: meetingData.notifyEmail ?? true,
        createdAt: new Date().toISOString()
      };

      if (!Array.isArray(userDb.meetings)) {
        userDb.meetings = [];
      }
      userDb.meetings.unshift(newMeeting);

      if (newMeeting.leadId && Array.isArray(userDb.leads)) {
        const lead = userDb.leads.find((l: any) => l.id === newMeeting.leadId);
        if (lead && lead.status === 'qualified') {
          lead.status = 'contacted';
        }
      }

      let notificationResults: any = null;
      if (userDb.messagingConfig) {
        notificationResults = await notifyMeetingScheduled({
          meeting: newMeeting,
          brandName: userDb.brandProfile?.name || 'Sincly Authority Team',
          slackConfig: userDb.messagingConfig.slack,
          discordConfig: userDb.messagingConfig.discord
        });
      }

      await options.saveUserWorkspace(email, userDb);
      return res.json({ success: true, meeting: newMeeting, notificationResults, state: userDb });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Failed to schedule meeting' });
    }
  });

  // PUT /api/meetings/:id
  router.put('/:id', async (req: Request, res: Response) => {
    try {
      const email = resolveUserEmail(req);
      const userDb = options.getUserWorkspace(email);
      const { id } = req.params;
      const updates = req.body || {};

      if (!Array.isArray(userDb.meetings)) {
        userDb.meetings = [];
      }
      const index = userDb.meetings.findIndex((m: any) => m.id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Meeting not found' });
      }

      userDb.meetings[index] = { ...userDb.meetings[index], ...updates, updatedAt: new Date().toISOString() };
      await options.saveUserWorkspace(email, userDb);
      return res.json({ success: true, meeting: userDb.meetings[index], state: userDb });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Failed to update meeting' });
    }
  });

  // DELETE /api/meetings/:id
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const email = resolveUserEmail(req);
      const userDb = options.getUserWorkspace(email);
      const { id } = req.params;

      if (!Array.isArray(userDb.meetings)) {
        userDb.meetings = [];
      }
      userDb.meetings = userDb.meetings.filter((m: any) => m.id !== id);
      await options.saveUserWorkspace(email, userDb);
      return res.json({ success: true, message: 'Meeting deleted successfully', state: userDb });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Failed to delete meeting' });
    }
  });

  // POST /api/meetings/:id/remind
  router.post('/:id/remind', async (req: Request, res: Response) => {
    try {
      const email = resolveUserEmail(req);
      const userDb = options.getUserWorkspace(email);
      const { id } = req.params;

      const meeting = (userDb.meetings || []).find((m: any) => m.id === id);
      if (!meeting) {
        return res.status(404).json({ success: false, error: 'Meeting not found' });
      }

      const results = await notifyMeetingReminder({
        meeting,
        brandName: userDb.brandProfile?.name || 'Sincly Authority Team',
        slackConfig: userDb.messagingConfig?.slack,
        discordConfig: userDb.messagingConfig?.discord,
        minutesBefore: req.body?.minutesBefore || 15
      });

      return res.json({ success: true, results, meeting });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Failed to dispatch reminder' });
    }
  });

  return router;
}

export default createMeetingsRouter;
