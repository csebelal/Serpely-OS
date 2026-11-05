import type { IncomingMessage, ServerResponse } from 'http';
import { GoogleGenAI } from '@google/genai';
import {
  mockAgents,
  mockCampaigns,
  mockApprovals,
  mockContentList,
  mockCommunityMessages,
  mockLeads,
  mockMemories,
  mockBrandProfile
} from '../data/mock-data';
import { planOrchestration } from '../services/ai-orchestrator';

// Initialize Gemini if key is provided in environment
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

function parseJsonBody<T>(req: IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, statusCode: number, data: unknown) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

export async function handleApiRequest(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const url = req.url || '';
  if (!url.startsWith('/api')) {
    return false;
  }

  const method = req.method || 'GET';
  const cleanPath = url.split('?')[0].replace(/\/+$/, '');

  try {
    // 1. GET /api -> Health Check
    if (cleanPath === '/api' && method === 'GET') {
      sendJson(res, 200, {
        status: 'ok',
        service: 'Serpely AI Marketing OS',
        version: '1.0',
        brand: mockBrandProfile.name,
        tagline: mockBrandProfile.tagline,
        agentsCount: mockAgents.length,
        hasGeminiApiKey: !!process.env.GEMINI_API_KEY
      });
      return true;
    }

    // 2. GET /api/agents
    if (cleanPath === '/api/agents' && method === 'GET') {
      sendJson(res, 200, {
        agents: mockAgents,
        orchestrator: { status: 'active', model: 'gemini-3.8-flash' },
        total: mockAgents.length
      });
      return true;
    }

    // 3. GET /api/campaigns
    if (cleanPath === '/api/campaigns' && method === 'GET') {
      sendJson(res, 200, {
        campaigns: mockCampaigns,
        total: mockCampaigns.length,
        byStatus: {
          running: mockCampaigns.filter(c => c.status === 'running').length,
          review: mockCampaigns.filter(c => c.status === 'review').length,
          content_creation: mockCampaigns.filter(c => c.status === 'content_creation').length,
          planning: mockCampaigns.filter(c => c.status === 'planning').length,
          completed: mockCampaigns.filter(c => c.status === 'completed').length
        }
      });
      return true;
    }

    // 4. GET & POST /api/content
    if (cleanPath === '/api/content') {
      if (method === 'GET') {
        sendJson(res, 200, {
          content: mockContentList,
          total: mockContentList.length,
          pendingApproval: mockContentList.filter(c => c.status === 'pending_approval').length
        });
        return true;
      }
      if (method === 'POST') {
        const body = await parseJsonBody<any>(req);
        const newItem = {
          id: `ct-${Date.now()}`,
          title: body.title || 'Untitled Post',
          type: body.type || 'linkedin-post',
          platform: body.platform || 'LinkedIn',
          status: 'draft',
          body: body.body || '',
          authorAgent: body.agent || 'content',
          createdAt: new Date().toISOString().split('T')[0],
          tags: body.tags || ['Organic']
        };
        sendJson(res, 201, {
          item: newItem,
          event: 'content.created',
          message: 'Content created successfully. Auto-approved as draft (low risk).'
        });
        return true;
      }
    }

    // 5. GET & POST /api/approvals
    if (cleanPath === '/api/approvals') {
      if (method === 'GET') {
        sendJson(res, 200, {
          approvals: mockApprovals,
          pending: mockApprovals.filter(a => a.status === 'pending').length
        });
        return true;
      }
      if (method === 'POST') {
        const body = await parseJsonBody<any>(req);
        const riskLevel =
          body.contentType === 'ad-copy' || body.contentType === 'email'
            ? 'high'
            : body.platform
            ? 'medium'
            : 'low';

        const newApproval = {
          id: `ap-${Date.now()}`,
          title: body.title || 'Submitted Item',
          agent: body.agent || 'orchestrator',
          contentType: body.contentType || 'social-post',
          platform: body.platform || 'LinkedIn',
          riskLevel,
          status: 'pending',
          campaign: body.campaign || 'General Distribution',
          submittedAt: 'Just now',
          preview: body.preview || '',
          riskReason:
            riskLevel === 'high'
              ? 'Ad spend or direct customer communication requires explicit human approval.'
              : 'Public brand representation review.'
        };
        sendJson(res, 201, {
          item: newApproval,
          riskLevel,
          status: 'pending',
          event: 'approval.required'
        });
        return true;
      }
    }

    // 6. POST /api/chat & /api/orchestrate
    if ((cleanPath === '/api/chat' || cleanPath === '/api/orchestrate') && method === 'POST') {
      const body = await parseJsonBody<{ prompt: string }>(req);
      const userPrompt = body.prompt || '';

      const orchestration = planOrchestration(userPrompt);

      let aiGeneratedText = '';
      if (aiClient && userPrompt.trim()) {
        try {
          const geminiResponse = await aiClient.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: `You are the AI Marketing Orchestrator for Serpely (serpely.com - Agentic SEO for the AI-First Web).
User request: "${userPrompt}"

Write a concise, high-impact executive briefing (2-3 short paragraphs) acknowledging the plan, highlighting which specialized agents will execute it, and stating the exact human approval gate before any publishing or ad spend occurs. Keep tone professional, authoritative, and direct.`
          });
          aiGeneratedText = geminiResponse.text || '';
        } catch (geminiErr) {
          console.error('Gemini generateContent error:', geminiErr);
        }
      }

      if (!aiGeneratedText) {
        aiGeneratedText = `I have decomposed your request: "${userPrompt}" into a structured execution pipeline across our specialized agents. 

${orchestration.summary}

Our AI Orchestrator has inserted an explicit Human Approval Gate before any high-risk action (publishing, ad budget activation, or external emails). You retain complete final sign-off.`;
      }

      sendJson(res, 200, {
        route: { agent: orchestration.primaryAgent, reason: `Targeted intent matching ${orchestration.primaryAgent} capabilities` },
        message: {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: aiGeneratedText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timeline: orchestration.steps
        },
        meta: {
          orchestratorVersion: '1.0',
          requiresApproval: orchestration.steps.some(s => s.status === 'approval'),
          auditEvent: 'orchestrator.dispatch',
          providerUsed: aiClient ? 'gemini-3.8-flash' : 'simulated-orchestrator'
        }
      });
      return true;
    }

    // 7. GET & POST /api/community
    if (cleanPath === '/api/community') {
      if (method === 'GET') {
        sendJson(res, 200, {
          messages: mockCommunityMessages,
          total: mockCommunityMessages.length,
          pending: mockCommunityMessages.filter(m => m.status === 'pending').length
        });
        return true;
      }
      if (method === 'POST') {
        const body = await parseJsonBody<any>(req);
        const msg = body.message || '';

        let intent = 'question';
        if (/\b(cost|price|quote|buy|purchase|enterprise|urgent)\b/i.test(msg)) {
          intent = 'high-priority-lead';
        } else if (/\b(trial|demo|availability|contact|whatsapp|call)\b/i.test(msg)) {
          intent = 'buying-signal';
        } else if (/buy cheap|click here|promotion|spam/i.test(msg)) {
          intent = 'spam';
        }

        const requiresApproval = intent === 'buying-signal' || intent === 'high-priority-lead';
        sendJson(res, 201, {
          message: {
            id: `cm-${Date.now()}`,
            sender: body.sender || 'Anonymous User',
            platform: body.platform || 'LinkedIn',
            type: body.type || 'comment',
            message: msg,
            timestamp: 'Just now',
            intent,
            sentiment: 'curious',
            requiresApproval,
            status: 'pending'
          },
          event: 'comment.received',
          leadCreated: requiresApproval,
          approvalRequired: requiresApproval
        });
        return true;
      }
    }

    // 8. GET & POST /api/leads
    if (cleanPath === '/api/leads') {
      if (method === 'GET') {
        sendJson(res, 200, {
          leads: mockLeads,
          total: mockLeads.length,
          highPriority: mockLeads.filter(l => l.intent === 'high-priority-lead').length
        });
        return true;
      }
      if (method === 'POST') {
        const body = await parseJsonBody<any>(req);
        const buyingSignals = (body.message || '').match(
          /\b(cost|price|quote|demo|trial|buy|purchase|whatsapp|call|contact|availability|enterprise|urgent)\b/gi
        ) || [];

        const intent = buyingSignals.length >= 2 ? 'high-priority-lead' : buyingSignals.length === 1 ? 'buying-signal' : 'interested';
        const newLead = {
          id: `ld-${Date.now()}`,
          name: body.name || 'New Prospect',
          company: body.company || 'Enterprise Prospect',
          role: body.role || 'Executive Buyer',
          source: body.source || 'LinkedIn Comment',
          status: 'new',
          intent,
          detectedMessage: body.message || '',
          buyingSignals,
          score: intent === 'high-priority-lead' ? 95 : 80,
          assignedAgent: 'leads',
          suggestedAction: 'Review commercial reply and send demo invitation',
          timestamp: 'Just now'
        };
        sendJson(res, 201, { lead: newLead, event: 'lead.created' });
        return true;
      }
    }

    // 9. GET /api/memory
    if (cleanPath === '/api/memory' && method === 'GET') {
      sendJson(res, 200, {
        agentMemory: mockMemories,
        totalMemories: mockMemories.length,
        categories: ['winning-hook', 'winning-format', 'best-time', 'objection-handling', 'competitor-gap'],
        avgConfidence: 0.936
      });
      return true;
    }

    // 10. GET & POST /api/publish
    if (cleanPath === '/api/publish') {
      if (method === 'GET') {
        sendJson(res, 200, {
          channels: [
            { platform: 'LinkedIn', connected: true, mockMode: false },
            { platform: 'X', connected: true, mockMode: false },
            { platform: 'Facebook', connected: false, mockMode: true },
            { platform: 'Instagram', connected: false, mockMode: true },
            { platform: 'YouTube', connected: true, mockMode: false }
          ]
        });
        return true;
      }
      if (method === 'POST') {
        const body = await parseJsonBody<any>(req);
        sendJson(res, 200, {
          platform: body.platform || 'LinkedIn',
          success: true,
          postId: `pub-${Date.now()}`,
          postUrl: `https://${(body.platform || 'linkedin').toLowerCase()}.com/serpely/post/${Date.now()}`,
          mockMode: true,
          event: 'post.published',
          timestamp: new Date().toISOString()
        });
        return true;
      }
    }

    // 11. POST /api/webhooks/:automationId
    if (cleanPath.startsWith('/api/webhooks/')) {
      const automationId = cleanPath.replace('/api/webhooks/', '');
      const body = await parseJsonBody<any>(req);
      sendJson(res, 200, {
        received: true,
        automationId,
        event: body.event || 'external.trigger',
        dispatched: true,
        timestamp: new Date().toISOString(),
        signature: 'verified'
      });
      return true;
    }

    // Fallback 404 for unknown /api route
    sendJson(res, 404, { error: 'Not Found', path: cleanPath });
    return true;
  } catch (error: any) {
    console.error('API Error:', error);
    sendJson(res, 500, { error: error.message || 'Internal Server Error' });
    return true;
  }
}
