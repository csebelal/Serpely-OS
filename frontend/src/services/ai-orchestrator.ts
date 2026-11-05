import { AgentId, OrchestrationStep, RiskLevel } from '../types';

export function planOrchestration(prompt: string): { steps: OrchestrationStep[]; summary: string; primaryAgent: AgentId } {
  const p = prompt.toLowerCase();

  // 1. Competitor / Market Research
  if (p.includes('competitor') || p.includes('research') || p.includes('trend') || p.includes('gap')) {
    return {
      primaryAgent: 'research',
      summary: 'Conducting in-depth market intelligence, competitor citation audit, and entity gap analysis.',
      steps: [
        { id: 'step-1', agent: 'orchestrator', label: 'Triage & Scope Intent', status: 'completed', detail: 'Deconstructed prompt into competitive intelligence research task', output: 'Target: Search engines & competitors' },
        { id: 'step-2', agent: 'research', label: 'Scan Competitors & LLM Citations', status: 'running', detail: 'Crawling Perplexity, Semrush, and Google AI Overviews', riskLevel: 'low', output: 'Discovered 4 uncaptured entity search themes' },
        { id: 'step-3', agent: 'strategy', label: 'Formulate Content Angle', status: 'pending', detail: 'Positioning Serpely against competitor blindspots', riskLevel: 'low' },
        { id: 'step-4', agent: 'memory', label: 'Index Discoveries to Knowledge Hub', status: 'pending', detail: 'Persisting winning patterns into vector store', riskLevel: 'low' }
      ]
    };
  }

  // 2. Social / LinkedIn / Content Distribution
  if (p.includes('linkedin') || p.includes('social') || p.includes('post') || p.includes('calendar') || p.includes('thread')) {
    return {
      primaryAgent: 'content',
      summary: 'Engineering high-authority thought-leadership content and multi-channel calendar distribution.',
      steps: [
        { id: 'step-1', agent: 'orchestrator', label: 'Triage Content Request', status: 'completed', detail: 'Identified thought-leadership social distribution intent', output: 'Channel focus: LinkedIn & X' },
        { id: 'step-2', agent: 'research', label: 'Retrieve Brand Knowledge & GEO Metrics', status: 'completed', detail: 'Fetched latest Perplexity & Google AIO citation data', riskLevel: 'low' },
        { id: 'step-3', agent: 'content', label: 'Draft Post & Carousel Script', status: 'running', detail: 'Crafting hook, body, and takeaways matching Serpely voice', riskLevel: 'low', output: 'Draft ready: "The Death of 10 Blue Links"' },
        { id: 'step-4', agent: 'social', label: 'Format Multi-Platform Calendar', status: 'pending', detail: 'Adapting copy for LinkedIn format and X thread pacing', riskLevel: 'medium' },
        { id: 'step-5', agent: 'orchestrator', label: 'Approval Gate: Public Social Broadcast', status: 'approval', detail: 'Medium risk: Requires Marketing Director review before publishing', riskLevel: 'medium' },
        { id: 'step-6', agent: 'analytics', label: 'Initialize Engagement Tracking', status: 'pending', detail: 'Configuring UTMs and citation attribution tags', riskLevel: 'low' },
        { id: 'step-7', agent: 'memory', label: 'Log Winning Hook to Memory', status: 'pending', detail: 'Recording expected performance vs historic baseline', riskLevel: 'low' }
      ]
    };
  }

  // 3. Email / Newsletter / Nurture Flow
  if (p.includes('email') || p.includes('newsletter') || p.includes('nurture') || p.includes('onboarding') || p.includes('outreach')) {
    return {
      primaryAgent: 'email',
      summary: 'Drafting high-conversion email sequences, onboarding flows, or GEO diagnostic newsletters.',
      steps: [
        { id: 'step-1', agent: 'orchestrator', label: 'Triage Email Pipeline', status: 'completed', detail: 'Identified customer lifecycle communication', output: 'Segment: Trial Users & Enterprise Inbound' },
        { id: 'step-2', agent: 'strategy', label: 'Map Lifecycle Nurture Stage', status: 'completed', detail: 'Aligning message with Day 7 trial activation milestones', riskLevel: 'low' },
        { id: 'step-3', agent: 'email', label: 'Draft Subject Lines & Personalization', status: 'running', detail: 'Engineering 3 subject variations with dynamic preview text', riskLevel: 'high', output: 'Subject: "Your Brand GEO Score: 84/100 (+12 this week)"' },
        { id: 'step-4', agent: 'orchestrator', label: 'CRITICAL APPROVAL GATE: Customer Broadcast', status: 'approval', detail: 'HIGH RISK: Direct email send to external subscribers requires sign-off', riskLevel: 'high' },
        { id: 'step-5', agent: 'analytics', label: 'Monitor Open & CTR Benchmarks', status: 'pending', detail: 'Real-time telemetry and bounce mitigation', riskLevel: 'low' }
      ]
    };
  }

  // 5. SEO / GEO Score / Hallucination Detection
  if (p.includes('seo') || p.includes('geo') || p.includes('hallucination') || p.includes('perplexity') || p.includes('citation')) {
    return {
      primaryAgent: 'seo',
      summary: 'Executing comprehensive Generative Engine Optimization audit, citation benchmark, and hallucination scan.',
      steps: [
        { id: 'step-1', agent: 'orchestrator', label: 'Scope GEO Engine Targets', status: 'completed', detail: 'Targeting ChatGPT, Perplexity, Gemini, and Google AI Overviews', output: 'Engine count: 4 major models' },
        { id: 'step-2', agent: 'seo', label: 'Calculate Real-Time GEO Score', status: 'running', detail: 'Querying 120 brand entities across generative endpoints', riskLevel: 'low', output: 'Current GEO Score: 84/100 (+12 gain)' },
        { id: 'step-3', agent: 'seo', label: 'Scan for AI Hallucinations', status: 'pending', detail: 'Cross-verifying LLM output against verified brand facts', riskLevel: 'low' },
        { id: 'step-4', agent: 'content', label: 'Generate Schema Entity Patch', status: 'pending', detail: 'Writing JSON-LD knowledge graph update for cited URLs', riskLevel: 'low' },
        { id: 'step-5', agent: 'memory', label: 'Update Knowledge Hub Grounding', status: 'pending', detail: 'Syncing new entity relationships to vector memory', riskLevel: 'low' }
      ]
    };
  }

  // 6. Leads / Community / Buying Signals
  if (p.includes('lead') || p.includes('comment') || p.includes('dm') || p.includes('customer') || p.includes('sales')) {
    return {
      primaryAgent: 'leads',
      summary: 'Extracting high-intent commercial buying signals and preparing human-reviewed sales replies.',
      steps: [
        { id: 'step-1', agent: 'orchestrator', label: 'Triage Inbound Social Activity', status: 'completed', detail: 'Scanning LinkedIn comments & X mentions', output: 'Detected high-intent buying signals' },
        { id: 'step-2', agent: 'community', label: 'Classify Message Intent', status: 'completed', detail: 'Tagged as "high-priority-lead" based on pricing & demo requests', riskLevel: 'medium' },
        { id: 'step-3', agent: 'leads', label: 'Enrich Lead Profile & Score', status: 'running', detail: 'Scoring lead at 96/100; identifying VP-level buyer persona', riskLevel: 'medium', output: 'Lead: David Vance (VP Marketing @ FinPulse)' },
        { id: 'step-4', agent: 'orchestrator', label: 'Approval Gate: Commercial Offer Reply', status: 'approval', detail: 'Medium risk: Private demo invitation and commercial pricing reply', riskLevel: 'medium' },
        { id: 'step-5', agent: 'analytics', label: 'Sync to CRM Pipeline', status: 'pending', detail: 'Updating deal stage in HubSpot CRM', riskLevel: 'low' }
      ]
    };
  }

  // Default: Full Autonomous 11-Agent Campaign Pipeline
  return {
    primaryAgent: 'orchestrator',
    summary: 'Full-spectrum autonomous marketing campaign execution across research, content, social, and growth.',
    steps: [
      { id: 'step-1', agent: 'orchestrator', label: 'Deconstruct Campaign Brief', status: 'completed', detail: 'Partitioned goal into 3 departmental workstreams', output: 'Workstreams: Research, Content, Social' },
      { id: 'step-2', agent: 'research', label: 'Market Research & Competitor Audit', status: 'completed', detail: 'Analyzed competitor search presence and LLM citations', riskLevel: 'low' },
      { id: 'step-3', agent: 'strategy', label: 'Architect Strategic Positioning', status: 'completed', detail: 'Formulated 3 core value propositions and 30-day pillars', riskLevel: 'low' },
      { id: 'step-4', agent: 'seo', label: 'Audit GEO Score & Entity Citations', status: 'completed', detail: 'Identified 5 high-leverage search queries for ChatGPT & Perplexity', riskLevel: 'low' },
      { id: 'step-5', agent: 'content', label: 'Generate Multi-Format Content Studio Assets', status: 'running', detail: 'Drafting thought leadership blog, 3 LinkedIn posts, 1 X thread', riskLevel: 'low', output: '4 content assets drafted' },
      { id: 'step-6', agent: 'email', label: 'Prepare Product Announcement Broadcast', status: 'pending', detail: 'Drafting executive newsletter and diagnostic update', riskLevel: 'high' },
      { id: 'step-7', agent: 'social', label: 'Assemble 7-Day Multi-Platform Calendar', status: 'pending', detail: 'Optimizing post scheduling and visual attachments', riskLevel: 'medium' },
      { id: 'step-8', agent: 'orchestrator', label: 'HUMAN APPROVAL GATE: Marketing Director Review', status: 'approval', detail: 'High Risk: External publishing and email broadcast paused for approval', riskLevel: 'high' },
      { id: 'step-9', agent: 'community', label: 'Community Inbox & Sentiment Listener Standby', status: 'pending', detail: 'Awaiting published engagement and inbound signals', riskLevel: 'medium' },
      { id: 'step-10', agent: 'leads', label: 'Lead Signal Routing & CRM Synchronization', status: 'pending', detail: 'Automated deal creation for commercial inquiries', riskLevel: 'medium' },
      { id: 'step-11', agent: 'analytics', label: 'Multi-Touch Attribution & Funnel Telemetry', status: 'pending', detail: 'Real-time CAC, ROI, and conversion analytics', riskLevel: 'low' },
      { id: 'step-12', agent: 'memory', label: 'Continuous Learning & Vector Knowledge Index', status: 'pending', detail: 'Extracting winning hooks and conversion patterns into Hub', riskLevel: 'low' }
    ]
  };
}
