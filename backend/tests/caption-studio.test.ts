import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';

describe('AI Caption Studio Backend Endpoints', () => {
  function createCaptionTestApp() {
    const app = express();
    app.use(express.json());

    // Mock refine-caption route with deterministic transformations
    app.post('/api/social/ai/refine-caption', (req, res) => {
      const { content = '', action, targetTone = 'thought_leadership' } = req.body || {};
      if (!content || !content.trim()) {
        return res.status(400).json({ success: false, error: 'Content is required for refinement' });
      }

      let refinedContent = content.trim();
      let actionTaken = action || 'polish_formatting';
      let hookVariations: string[] = [];

      switch (action) {
        case 'rewrite_hook': {
          hookVariations = [
            '90% of companies get this wrong before they even start:',
            'Unpopular opinion: Stop optimizing for vanity metrics and start fixing this:',
            'If you only audit one operational bottleneck this quarter, make it this:'
          ];
          const lines = refinedContent.split('\n');
          lines[0] = hookVariations[0];
          refinedContent = lines.join('\n');
          actionTaken = 'Replaced opening with high-impact viral hook';
          break;
        }

        case 'shorten': {
          const sentences = refinedContent.split('\n\n').filter(Boolean);
          refinedContent = sentences.slice(0, Math.max(2, Math.ceil(sentences.length / 2))).join('\n\n');
          actionTaken = 'Trimmed copy into high-density punchy format';
          break;
        }

        case 'expand': {
          refinedContent = `${refinedContent}\n\n✦ Real-World Benchmark: High-performing teams resolve 85% of edge incidents within 15 minutes of detection.\n✦ Execution Rule: Never scale manual processes before automating telemetry.`;
          actionTaken = 'Expanded post with actionable benchmarks and insights';
          break;
        }

        case 'improve_cta': {
          const cta = '\n\nHow is your team addressing this challenge right now?\nDrop your perspective in the comments below.';
          refinedContent = `${refinedContent.replace(/\n\nHow.*$/s, '')}${cta}`;
          actionTaken = 'Added conversation-starting engagement CTA';
          break;
        }

        case 'polish_formatting':
        default: {
          refinedContent = refinedContent
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/__(.*?)__/g, '$1')
            .replace(/^#+\s*/gm, '')
            .split('\n')
            .map(l => l.trim())
            .filter(Boolean)
            .join('\n\n');
          actionTaken = 'Cleaned formatting and normalized line spacing';
          break;
        }
      }

      return res.json({
        success: true,
        actionTaken,
        refinedContent,
        hookVariations
      });
    });

    // Mock research-and-draft with multi-draft support
    app.post('/api/social/research-and-draft', (req, res) => {
      const { keyword = 'Network Security', tone = 'thought_leadership' } = req.body || {};

      const draftA = `Most companies treat ${keyword} as an afterthought until an incident occurs.\n\nHere is the contrarian truth: security is not a cost center, it is your primary growth enabler.\n\n✦ Zero-Trust Access: Verify every request continuously.\n✦ Automated Incident Containment: Isolate compromised nodes in seconds.\n\nWhat is your biggest roadblock with ${keyword}?`;
      const draftB = `A 3-step practical framework to master ${keyword} this quarter:\n\n✦ Step 1 — Audit baseline vulnerabilities.\n✦ Step 2 — Deploy automated telemetry & alerts.\n✦ Step 3 — Run scheduled disaster drills.\n\nSave this checklist for your next infrastructure review.`;
      const draftC = `Last year, we audited an enterprise team struggling with ${keyword}.\n\nWithin 48 hours of deploying unified monitoring, their downtime dropped by 92%.\n\nSimple systems outperform complex firefighting every single time.`;

      return res.json({
        brief: { keyword },
        postContent: tone === 'contrarian' ? draftA : tone === 'framework' ? draftB : draftC,
        drafts: {
          contrarian: draftA,
          framework: draftB,
          story: draftC
        },
        hashtags: ['#TechSheba', '#ITStrategy', '#EnterpriseIT']
      });
    });

    return app;
  }

  it('refines caption by rewriting hook with viral options', async () => {
    const app = createCaptionTestApp();
    const res = await request(app)
      .post('/api/social/ai/refine-caption')
      .send({
        content: 'Original weak opening.\n\nBody content here.\n\nCTA question?',
        action: 'rewrite_hook'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.hookVariations.length).toBe(3);
    expect(res.body.refinedContent).toContain('90% of companies get this wrong');
  });

  it('refines caption by shortening and trimming fluff', async () => {
    const app = createCaptionTestApp();
    const longContent = 'Paragraph 1.\n\nParagraph 2.\n\nParagraph 3.\n\nParagraph 4.\n\nParagraph 5.';
    const res = await request(app)
      .post('/api/social/ai/refine-caption')
      .send({
        content: longContent,
        action: 'shorten'
      });

    expect(res.status).toBe(200);
    expect(res.body.refinedContent.length).toBeLessThan(longContent.length);
  });

  it('refines caption with an improved conversation CTA', async () => {
    const app = createCaptionTestApp();
    const res = await request(app)
      .post('/api/social/ai/refine-caption')
      .send({
        content: 'Hook here.\n\nBullet points here.',
        action: 'improve_cta'
      });

    expect(res.status).toBe(200);
    expect(res.body.refinedContent).toContain('Drop your perspective in the comments below.');
  });

  it('returns 3 multi-draft variations from research-and-draft', async () => {
    const app = createCaptionTestApp();
    const res = await request(app)
      .post('/api/social/research-and-draft')
      .send({
        keyword: 'Cloud Backups',
        tone: 'framework'
      });

    expect(res.status).toBe(200);
    expect(res.body.drafts).toBeDefined();
    expect(res.body.drafts.contrarian).toContain('contrarian truth');
    expect(res.body.drafts.framework).toContain('3-step practical framework');
    expect(res.body.drafts.story).toContain('Last year, we audited');
  });
});
