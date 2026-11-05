import {
  BrandProfile,
  KnowledgeDoc,
  CampaignItem,
  ContentItem,
  SocialPost,
  EmailCampaign,
  EmailSequenceWorkflow,
  LeadItem,
  CommunityMessage,
  ApprovalItem,
  MemoryItem,
  ConnectedSocialPage,
  GeoScoreData,
  ReportItem
} from './types';

export function buildSynthesizedBrandState(brandProfile: Partial<BrandProfile>, url: string) {
  const brandName = brandProfile.name || 'Brand';
  const tagline = brandProfile.tagline || 'Leading Enterprise Solutions';
  const mission = brandProfile.mission || 'Delivering transformative technology solutions.';
  const voiceTone = brandProfile.voiceTone || 'Authoritative, Reliable, Tech-forward';
  const coreUSPs = Array.isArray(brandProfile.coreUSPs) && brandProfile.coreUSPs.length > 0
    ? brandProfile.coreUSPs
    : ['Enterprise Reliability', '24/7 SLA Support', 'Cost-Effective Modernization', 'Custom Turnkey Architecture'];

  const competitors = Array.isArray(brandProfile.competitors) && brandProfile.competitors.length > 0
    ? brandProfile.competitors
    : [
        { name: 'Rival Enterprise Systems', focus: 'Corporate IT & Cloud', threat: 'High' as const },
        { name: 'Local Regional Providers', focus: 'Hardware & Basic Setup', threat: 'Medium' as const },
        { name: 'Ad-hoc Tech Consultants', focus: 'Advising & Support', threat: 'Low' as const }
      ];

  const brandRules = Array.isArray(brandProfile.brandRules) && brandProfile.brandRules.length > 0
    ? brandProfile.brandRules
    : [
        `Always emphasize reliability, security, and measurable business ROI for ${brandName}.`,
        'Lead with client outcomes before presenting technical specifications.',
        'Never guarantee 100% uptime without specifying SLA conditions and redundant backup systems.',
        'Maintain a professional, authoritative, and helpful tone across all customer communications.'
      ];

  const domain = url.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');
  const usp1 = coreUSPs[0] || 'Turnkey Solution Deployment';
  const usp2 = coreUSPs[1] || '24/7 Proactive Support';
  const usp3 = coreUSPs[2] || 'Enterprise Data Protection';
  const usp4 = coreUSPs[3] || 'Zero-Downtime Guarantee';

  // 1. Knowledge Docs (Vector DB)
  const knowledgeDocs: KnowledgeDoc[] = [
    {
      id: `doc-${Date.now()}-1`,
      title: `${brandName} — Official Website & Core Services Knowledge Base`,
      chunks: 52,
      embeddings: 'text-embedding-3-small (1536d)',
      lastSynced: 'Just now',
      source: 'Live Web Crawler',
      url,
      sampleChunks: [
        `${brandName}: ${tagline}. ${mission}`,
        `Core Capabilities: ${coreUSPs.join(' • ')}`,
        `Operating Voice: ${voiceTone}. Guardrails: ${brandRules[0]}`
      ]
    },
    {
      id: `doc-${Date.now()}-2`,
      title: `${brandName} — Enterprise Service Catalog & Technical Playbook`,
      chunks: 44,
      embeddings: 'text-embedding-3-small (1536d)',
      lastSynced: 'Today',
      source: 'Product Playbook',
      sampleChunks: [
        `Architecture & Offerings: ${usp1} and ${usp2}. Tailored for modern corporate requirements with redundant infrastructure.`,
        `Quality & Security Assurance: ${usp3} and ${usp4}. SLA guarantees backed by dedicated engineering support.`,
        `Competitive Differentiation: Outperforming ${competitors.map(c => c.name).join(', ')} with superior responsiveness and local expertise.`
      ]
    },
    {
      id: `doc-${Date.now()}-3`,
      title: `${brandName} — Brand Voice, Positioning & Guardrails Playbook`,
      chunks: 28,
      embeddings: 'text-embedding-3-small (1536d)',
      lastSynced: 'Yesterday',
      source: 'Brand Playbook',
      sampleChunks: [
        `Brand Positioning: ${brandName} positions itself as the premier, trusted technology backbone for growing commercial enterprises.`,
        `Key Rules: ${brandRules.join(' | ')}`,
        `Tone Guidelines: ${voiceTone}. Avoid unsubstantiated claims and communicate tangible business value in every touchpoint.`
      ]
    }
  ];

  // 2. Campaigns (4 campaigns)
  const campaigns: CampaignItem[] = [
    {
      id: `cmp-${Date.now()}-1`,
      name: `${brandName} Core Solutions Modernization Sprint`,
      status: 'completed',
      tagline: `Accelerating adoption of ${usp1} for high-growth commercial enterprises.`,
      currentStage: 10,
      leadAgent: 'orchestrator',
      budget: { allocated: 5200, spent: 4850 },
      startDate: '2026-08-01',
      endDate: '2026-09-30',
      channels: ['LinkedIn', 'Organic Search', 'Direct Inbound', 'Email Outreach'],
      primaryMetric: { name: 'Qualified Audits', value: '72', target: '60 Audits' }
    },
    {
      id: `cmp-${Date.now()}-2`,
      name: `${brandName} 24/7 SLA & Proactive Support Blitz`,
      status: 'running',
      tagline: `Empowering clients with ${usp2} and zero operational downtime.`,
      currentStage: 7,
      leadAgent: 'strategy',
      budget: { allocated: 4500, spent: 2800 },
      startDate: '2026-10-01',
      endDate: '2026-11-15',
      channels: ['LinkedIn Thought Leadership', 'Email Sequences', 'Webinars'],
      primaryMetric: { name: 'Demo Signups', value: '46', target: '40 Demos' }
    },
    {
      id: `cmp-${Date.now()}-3`,
      name: `${brandName} Data Protection & Security Architecture`,
      status: 'running',
      tagline: `Safeguarding corporate workflows through ${usp3}.`,
      currentStage: 4,
      leadAgent: 'leads',
      budget: { allocated: 6000, spent: 2100 },
      startDate: '2026-10-15',
      endDate: '2026-12-01',
      channels: ['Search SEO', 'LinkedIn Thought Leadership', 'Executive Roundtables'],
      primaryMetric: { name: 'Security Consultations', value: '34', target: '30 Consultations' }
    },
    {
      id: `cmp-${Date.now()}-4`,
      name: `${brandName} Turnkey Infrastructure Expansion`,
      status: 'review',
      tagline: `Enterprise deployment focusing on ${usp4} and turnkey delivery.`,
      currentStage: 8,
      leadAgent: 'content',
      budget: { allocated: 4200, spent: 3900 },
      startDate: '2026-07-01',
      endDate: '2026-08-31',
      channels: ['LinkedIn Organic', 'Case Studies', 'Partner Referrals'],
      primaryMetric: { name: 'Turnkey Contracts Won', value: '23', target: '20 Contracts' }
    }
  ];

  // 3. Content List (Archive) - 6 items
  const contentList: ContentItem[] = [
    {
      id: `cnt-${Date.now()}-1`,
      title: `Executive Guide: Why ${brandName} Replaces Reactive Firefighting with Continuous Stability`,
      type: 'linkedin-post',
      status: 'published',
      authorAgent: 'content',
      platform: 'LinkedIn',
      createdAt: '2026-10-28',
      tags: [brandName, 'B2B Infrastructure', 'Stability'],
      body: `Operational downtime is the silent killer of growing businesses.

At ${brandName}, we see organizations trying to navigate complex requirements with fragmented, reactive setups.

✦ ${usp1}: Built for scale, resilience, and business continuity.
✦ ${usp2}: Certified engineering oversight ensuring immediate incident mitigation.
✦ ${usp3}: Enterprise-grade protocols protecting your reputation and bottom line.

Is your current infrastructure built for where your business is going, or is it holding you back?

#${brandName.replace(/\s+/g, '')} #BusinessContinuity #EnterpriseArchitecture #OperationalExcellence`
    },
    {
      id: `cnt-${Date.now()}-2`,
      title: `Case Study: How a Premier Corporate Client Scaled Seamlessly with ${brandName}`,
      type: 'blog',
      status: 'published',
      authorAgent: 'content',
      platform: 'Blog',
      createdAt: '2026-10-25',
      tags: [brandName, 'Case Study', 'Cloud Resilience'],
      body: `When growing rapidly, legacy infrastructure struggles to keep pace, leading to dropped calls, delayed deliverables, and mounting technical debt.

${brandName} re-engineered the client's operations from the ground up:
• Deployed ${usp1} with zero operational disruption.
• Enforced ${usp3} across all endpoints and communication channels.
• Backed the entire setup with ${usp2}.

Result: 99.98% operational uptime and complete peace of mind for the leadership team.`
    },
    {
      id: `cnt-${Date.now()}-3`,
      title: `Strategic Brief: Comparing ${brandName} to Traditional Vendor Models`,
      type: 'blog',
      status: 'published',
      authorAgent: 'strategy',
      platform: 'Blog',
      createdAt: '2026-10-22',
      tags: [brandName, 'Vendor Comparison', 'ROI'],
      body: `Traditional service providers treat client challenges as isolated transactional tickets.

${brandName} takes a holistic partnership approach:
1. End-to-end architecture design tailored to your specific workflow.
2. Proactive 24/7 monitoring that catches bottlenecks before they impact customers.
3. Transparent SLA accountability with dedicated account managers.
4. Measurable 30%+ reduction in recurring operational maintenance costs.`
    },
    {
      id: `cnt-${Date.now()}-4`,
      title: `Thought Leadership: The 3 Core Pillars of Resilient Business Infrastructure`,
      type: 'linkedin-post',
      status: 'published',
      authorAgent: 'leads',
      platform: 'LinkedIn',
      createdAt: '2026-10-18',
      tags: [brandName, 'Leadership', 'Uptime'],
      body: `Waiting for an outage before fixing your systems is the most expensive mistake in modern business.

Proactive leaders build their technology foundation around three pillars:
1. Redundancy: Ensuring zero single-points-of-failure.
2. Speed: Having dedicated engineering dispatch within minutes, not days.
3. Predictability: Fixed, transparent investment that scales with your growth.

That is why leading organizations choose ${brandName} as their technology partner. Let's build your future together.`
    },
    {
      id: `cnt-${Date.now()}-5`,
      title: `Technical Blueprint: Ensuring Continuous Data Integrity with ${brandName}`,
      type: 'blog',
      status: 'published',
      authorAgent: 'orchestrator',
      platform: 'Blog',
      createdAt: '2026-10-14',
      tags: [brandName, 'Data Integrity', 'Backup'],
      body: `Data loss and unexpected disruptions cost businesses thousands of dollars in lost productivity every hour.

${brandName}'s Resilience Standard:
• Multi-tier automated protection ensuring continuous operation.
• Immutable failover snapshots for instant disaster recovery.
• Proactive health verification drills conducted monthly.`
    },
    {
      id: `cnt-${Date.now()}-6`,
      title: `Audit Checklist: 10 Operational Vulnerabilities Every Leader Should Audit This Quarter`,
      type: 'linkedin-post',
      status: 'published',
      authorAgent: 'seo',
      platform: 'LinkedIn',
      createdAt: '2026-10-10',
      tags: [brandName, 'Security Audit', 'Checklist'],
      body: `How resilient is your operational backbone? Here are the top 10 vulnerabilities we identify during complimentary on-site audits at ${brandName}:

1. Unverified backup recovery procedures.
2. Inadequate power redundancy during unexpected grid failure.
3. Lack of unified communications across remote and office teams.
4. Fragmented vendor contracts with no single point of accountability.
5. Outdated hardware lacking security patches.
6. Weak access control policies on sensitive business assets.
7. Absence of automated 24/7 monitoring alerts.
8. Unsegmented guest and internal networks.
9. Lack of redundant secondary ISP failovers.
10. No documented disaster recovery runbook.

Schedule your complimentary ${brandName} infrastructure audit today.`
    }
  ];

  // 4. Social Posts (6 calendar items)
  const socialPosts: SocialPost[] = [
    {
      id: `soc-${Date.now()}-1`,
      platform: 'LinkedIn',
      scheduledTime: '10:00 AM',
      dayOfWeek: 'Monday',
      status: 'published',
      authorAgent: 'content',
      mediaType: 'image',
      content: `A system is only as strong as its foundation. At ${brandName}, we deliver ${usp1} so you can focus on building your enterprise.\n\n✦ ${usp2}\n✦ ${usp3}\n\nDiscover how leading companies partner with ${brandName} for guaranteed operational uptime.\n\n#${brandName.replace(/\s+/g, '')} #BusinessStability #EnterpriseSolutions`
    },
    {
      id: `soc-${Date.now()}-2`,
      platform: 'LinkedIn',
      scheduledTime: '02:00 PM',
      dayOfWeek: 'Wednesday',
      status: 'scheduled',
      authorAgent: 'social',
      mediaType: 'image',
      content: `How often do you test your backup protocols? ${brandName} guarantees ${usp3} with automated recovery verification.\n\nEliminate guesswork and ensure your operations never sleep.\n\n#${brandName.replace(/\s+/g, '')} #Uptime #DisasterRecovery`
    },
    {
      id: `soc-${Date.now()}-3`,
      platform: 'X',
      scheduledTime: '11:30 AM',
      dayOfWeek: 'Thursday',
      status: 'scheduled',
      authorAgent: 'leads',
      mediaType: 'text',
      content: `Why settle for reactive troubleshooting when you can have ${usp2}? ${brandName} is modernizing enterprise infrastructure with SLA guarantees. #${brandName.replace(/\s+/g, '')}`
    },
    {
      id: `soc-${Date.now()}-4`,
      platform: 'Facebook',
      scheduledTime: '04:00 PM',
      dayOfWeek: 'Friday',
      status: 'scheduled',
      authorAgent: 'content',
      mediaType: 'image',
      content: `Looking for reliable business solutions? ${brandName} handles the technology behind your operations. Book your free zero-obligation consultation today! #${brandName.replace(/\s+/g, '')}`
    },
    {
      id: `soc-${Date.now()}-5`,
      platform: 'LinkedIn',
      scheduledTime: '09:00 AM',
      dayOfWeek: 'Monday',
      status: 'scheduled',
      authorAgent: 'orchestrator',
      mediaType: 'carousel',
      content: `Messy wiring vs Clean rack architecture: visual proof of why enterprise clients choose ${brandName} for ${usp1}.\n\n#${brandName.replace(/\s+/g, '')} #TechExcellence`
    },
    {
      id: `soc-${Date.now()}-6`,
      platform: 'X',
      scheduledTime: '03:00 PM',
      dayOfWeek: 'Tuesday',
      status: 'draft',
      authorAgent: 'seo',
      mediaType: 'text',
      content: `From initial assessment to turnkey handover, ${brandName} guarantees ${usp4}. Learn more at ${url} #${brandName.replace(/\s+/g, '')}`
    }
  ];

  // 6. Email Campaigns
  const emailCampaigns: EmailCampaign[] = [
    {
      id: `emc-${Date.now()}-1`,
      title: `${brandName} Executive Briefing: Modernizing Your Infrastructure`,
      type: 'nurture',
      subjectLine: `Eliminate Unplanned Downtime: The New Architecture from ${brandName}`,
      previewText: `Discover how ${brandName} guarantees continuous stability and ROI.`,
      body: `Full executive guide from ${brandName}...`,
      audienceSegment: 'Enterprise IT Leaders',
      recipientsCount: 1650,
      openRate: 44.8,
      ctr: 15.2,
      status: 'sent',
      riskLevel: 'low'
    },
    {
      id: `emc-${Date.now()}-2`,
      title: `${brandName} Q4 Product & Service Innovation Update`,
      type: 'feature-update',
      subjectLine: `New: ${usp1} & 24/7 SLA by ${brandName}`,
      previewText: `Explore our latest service enhancements tailored for growing businesses.`,
      body: `Service release notes and SLA update from ${brandName}...`,
      audienceSegment: 'All Subscribers',
      recipientsCount: 2200,
      openRate: 0,
      ctr: 0,
      status: 'scheduled',
      riskLevel: 'low'
    }
  ];

  // 7. Email Sequences
  const emailSequences: EmailSequenceWorkflow[] = [
    {
      id: `seq-${Date.now()}-1`,
      name: `${brandName} Inbound Lead Welcome & Free Audit Sequence`,
      triggerEvent: 'Lead Ingested from Website or Social',
      status: 'active',
      targetAudience: 'Inbound Inquiries & Business Owners',
      description: `Automated 3-stage nurture sequence introducing ${brandName}'s capabilities and scheduling an on-site audit.`,
      overallMetrics: {
        enrolled: 142,
        completed: 98,
        avgOpenRate: 58.4,
        avgClickRate: 26.1
      },
      steps: [
        {
          id: 'step-1',
          stepNumber: 1,
          delayDays: 0,
          templateId: 'tmpl-welcome',
          subjectLine: `Welcome to ${brandName} — Your Infrastructure Roadmap`,
          previewSnippet: 'Getting started with your complimentary audit',
          status: 'active',
          stats: { sent: 142, openRate: 64.2, clickRate: 31.0, replyRate: 12.4 }
        },
        {
          id: 'step-2',
          stepNumber: 2,
          delayDays: 2,
          templateId: 'tmpl-case-study',
          subjectLine: `Case Study: 99.98% Uptime with ${brandName}`,
          previewSnippet: 'How modern businesses eliminate operational drops',
          status: 'active',
          stats: { sent: 128, openRate: 58.0, clickRate: 25.4, replyRate: 8.5 }
        },
        {
          id: 'step-3',
          stepNumber: 3,
          delayDays: 4,
          templateId: 'tmpl-consultation',
          subjectLine: `Final Check-In: Claim Your ${brandName} Consultation`,
          previewSnippet: 'Direct line to our senior engineering team',
          status: 'active',
          stats: { sent: 104, openRate: 52.6, clickRate: 22.0, replyRate: 15.2 }
        }
      ]
    },
    {
      id: `seq-${Date.now()}-2`,
      name: `${brandName} Decision Maker Nurture Sequence`,
      triggerEvent: 'Commercial Intent Detected on LinkedIn / CRM',
      status: 'active',
      targetAudience: 'C-Suite & Managing Partners',
      description: `Targeting C-suite leaders with case studies demonstrating ROI, uptime, and cost reduction.`,
      overallMetrics: {
        enrolled: 88,
        completed: 64,
        avgOpenRate: 51.2,
        avgClickRate: 19.8
      },
      steps: [
        {
          id: 'step-dm-1',
          stepNumber: 1,
          delayDays: 1,
          templateId: 'tmpl-exec-summary',
          subjectLine: `Executive Summary: Why ${brandName} Outperforms Traditional Vendors`,
          previewSnippet: 'Predictable pricing and guaranteed SLA',
          status: 'active',
          stats: { sent: 88, openRate: 54.5, clickRate: 21.6, replyRate: 9.1 }
        },
        {
          id: 'step-dm-2',
          stepNumber: 2,
          delayDays: 3,
          templateId: 'tmpl-roi-blueprint',
          subjectLine: `ROI Blueprint: Reducing Technical Overhead by 30%`,
          previewSnippet: 'Detailed breakdown for executive leadership',
          status: 'active',
          stats: { sent: 76, openRate: 48.0, clickRate: 18.0, replyRate: 11.8 }
        }
      ]
    }
  ];

  // 8. Leads Pipeline (6 accounts)
  const leads: LeadItem[] = [
    {
      id: `lead-${Date.now()}-1`,
      name: 'Tanvir Hossain',
      company: 'Apex Logistics & Trade Hub',
      role: 'Managing Director',
      email: 'tanvir@apexlogistics-bd.com',
      score: 94,
      status: 'qualified',
      intent: 'high-priority-lead',
      source: 'LinkedIn Comment',
      detectedMessage: `Can ${brandName} provide a complimentary on-site survey for our 120-workstation commercial office relocation in Gulshan?`,
      buyingSignals: ['Office Relocation', usp1, 'Zero Recording Loss', 'High Intent'],
      assignedAgent: 'leads',
      suggestedAction: 'Schedule On-Site Survey',
      timestamp: 'Today',
      notes: `Needs whole-office upgrade for 120 workstations with ${usp1} and zero recording loss.`
    },
    {
      id: `lead-${Date.now()}-2`,
      name: 'Sabrina Rahman',
      company: 'Nexus Capital Advisors',
      role: 'Chief Technology Officer',
      email: 's.rahman@nexusadvisors.net',
      score: 91,
      status: 'contacted',
      intent: 'buying-signal',
      source: 'Contact Form',
      detectedMessage: `We need guaranteed 15-minute response SLA and ${usp2} for our financial trading branch. Please send enterprise proposal.`,
      buyingSignals: ['Financial Compliance', usp2, 'SLA Guarantee', 'Active Evaluation'],
      assignedAgent: 'leads',
      suggestedAction: 'Send Enterprise SLA Proposal',
      timestamp: 'Yesterday',
      notes: `Requested SLA agreement and ${usp2} for their financial trading branch.`
    },
    {
      id: `lead-${Date.now()}-3`,
      name: 'Farhan Chowdhury',
      company: 'Metro Health Systems',
      role: 'Director of Operations',
      email: 'farhan@metrohealth-bd.com',
      score: 87,
      status: 'new',
      intent: 'buying-signal',
      source: 'Demo Request',
      detectedMessage: `Looking to implement multi-floor security and network infrastructure with ${usp3} across 3 clinic locations.`,
      buyingSignals: ['Multi-Branch Deployment', usp3, 'Access Control', 'Q4 Budget'],
      assignedAgent: 'leads',
      suggestedAction: 'Qualify Multi-Branch Requirements',
      timestamp: '2 days ago',
      notes: `Interested in multi-floor deployment with ${usp3}.`
    },
    {
      id: `lead-${Date.now()}-4`,
      name: 'Nusrat Jahan',
      company: 'Dhaka Creative Studio',
      role: 'Founder & CEO',
      email: 'nusrat@dhakacreative.com',
      score: 85,
      status: 'contacted',
      intent: 'interested',
      source: 'Facebook Page',
      detectedMessage: `We are experiencing daily WiFi drops and packet loss during client Zoom calls. Can you audit our network setup?`,
      buyingSignals: ['Network Troubleshooting', 'WiFi Mesh', 'Cloud Backup'],
      assignedAgent: 'leads',
      suggestedAction: 'Dispatch Helpdesk Audit',
      timestamp: '3 days ago',
      notes: `Looking to eliminate frequent network drops and implement reliable cloud backup.`
    },
    {
      id: `lead-${Date.now()}-5`,
      name: 'Imtiaz Ahmed',
      company: 'Crown Global Exporters',
      role: 'IT Infrastructure Head',
      email: 'imtiaz.a@crownglobal.com',
      score: 96,
      status: 'converted',
      intent: 'high-priority-lead',
      source: 'LinkedIn Comment',
      detectedMessage: `Contract signed for 1-year turnkey IT infrastructure and surveillance management with ${brandName}.`,
      buyingSignals: ['Closed Contract', 'Turnkey Maintenance', '1-Year Agreement'],
      assignedAgent: 'leads',
      suggestedAction: 'Onboard Client & Deploy Hardware',
      timestamp: 'Just now',
      notes: `Signed 1-year enterprise contract with ${brandName} for turnkey management.`
    },
    {
      id: `lead-${Date.now()}-6`,
      name: 'Rashid Khan',
      company: 'Beacon Financial Solutions',
      role: 'Managing Partner',
      email: 'rashid@beaconfinance.org',
      score: 82,
      status: 'qualified',
      intent: 'interested',
      source: 'CSV Import',
      detectedMessage: `Evaluating telephony modernization options: want to compare ${brandName} IP-PBX vs legacy analog telecom lines.`,
      buyingSignals: ['PBX Telephony', 'Cost Reduction', 'Vendor Comparison'],
      assignedAgent: 'leads',
      suggestedAction: 'Share ROI & Cost Comparison Sheet',
      timestamp: '4 days ago',
      notes: `Requested comparison sheet between ${brandName} and legacy vendor setups.`
    }
  ];

  // 9. Community Messages (5 inquiries & replies)
  const communityMessages: CommunityMessage[] = [
    {
      id: `comm-${Date.now()}-1`,
      sender: 'Kamrul Hasan',
      senderRole: 'Operations Manager',
      senderCompany: 'Delta Group',
      platform: 'LinkedIn',
      type: 'comment',
      message: `Does ${brandName} provide on-site technical surveys before sending a formal quotation? We are relocating our office next month.`,
      timestamp: 'Just now',
      intent: 'high-priority-lead',
      sentiment: 'positive',
      requiresApproval: false,
      draftReply: `Hello Kamrul! Yes, absolutely. We provide a 100% complimentary on-site audit to assess your layout, power resilience, and cabling requirements before providing a tailored proposal. What day works best for our engineering team to visit?`,
      status: 'pending'
    },
    {
      id: `comm-${Date.now()}-2`,
      sender: 'Anisur Rahman',
      senderRole: 'IT Officer',
      senderCompany: 'Prime Textiles',
      platform: 'LinkedIn',
      type: 'comment',
      message: `How does your 24/7 SLA guarantee work during national holidays or emergency load-shedding hours?`,
      timestamp: '2 hours ago',
      intent: 'question',
      sentiment: 'neutral',
      requiresApproval: false,
      draftReply: `Hi Anisur, our NOC monitoring and rapid engineering response operate 24/7/365 without exception. We maintain dedicated on-call network engineers and redundant failover protocols.`,
      status: 'replied'
    },
    {
      id: `comm-${Date.now()}-3`,
      sender: 'Rezaul Karim',
      senderRole: 'Founder',
      senderCompany: 'TechVentures BD',
      platform: 'Facebook',
      type: 'dm',
      message: `Loved the case study! Can ${brandName} handle integration for a 40-person startup, or do you only take 100+ seat enterprises?`,
      timestamp: 'Yesterday',
      intent: 'buying-signal',
      sentiment: 'positive',
      requiresApproval: false,
      draftReply: `Hi Rezaul! We specialize in growing teams from 20 to 200+ employees. Our modular architectures are designed specifically to scale with your business without costly rewiring.`,
      status: 'replied'
    },
    {
      id: `comm-${Date.now()}-4`,
      sender: 'Mahmudul Haque',
      senderRole: 'Facility Engineer',
      senderCompany: 'Square Commercial',
      platform: 'X',
      type: 'mention',
      message: `Are your cable certifications tested with Fluke meters upon project completion?`,
      timestamp: 'Yesterday',
      intent: 'question',
      sentiment: 'neutral',
      requiresApproval: false,
      draftReply: `Yes, Mahmudul! Every single cable run deployed by ${brandName} is certified with professional Fluke cable analyzers, and we hand over full test documentation with 10-year warranty.`,
      status: 'replied'
    },
    {
      id: `comm-${Date.now()}-5`,
      sender: 'Sharmin Akhter',
      senderRole: 'Commercial Architect',
      senderCompany: 'Studio Morphosis',
      platform: 'LinkedIn',
      type: 'dm',
      message: `We frequently design corporate office spaces. Does ${brandName} partner with interior design and architectural firms?`,
      timestamp: '2 days ago',
      intent: 'buying-signal',
      sentiment: 'positive',
      requiresApproval: false,
      draftReply: `Hi Sharmin, yes we do! We regularly collaborate with commercial architects from early schematic design to ensure conduit pathways, server closets, and cabling layouts are seamlessly integrated. Sending you a DM to connect!`,
      status: 'pending'
    }
  ];

  // 10. Approvals (Human Gate - 1 urgent pending item)
  const approvals: ApprovalItem[] = [
    {
      id: `appr-${Date.now()}-1`,
      title: `LinkedIn Authority Post: Eliminating Office Downtime with ${brandName}`,
      agent: 'content',
      contentType: 'social-post',
      platform: 'LinkedIn',
      riskLevel: 'medium',
      status: 'pending',
      campaign: `${brandName} Core Solutions Modernization Sprint`,
      submittedAt: 'Just now',
      preview: `"Is your business prepared for an unexpected network blackout? At ${brandName}, we believe your infrastructure should be invisible, reliable, and resilient. Discover our turnkey architecture guaranteeing continuous uptime."`,
      riskReason: `Contains strong public brand positioning and uptime claims for ${brandName}. Requires executive review before distribution.`,
      diff: {
        after: `Is your business prepared for an unexpected network blackout?\n\nIn fast-paced business districts, even a 30-minute outage isn't just an inconvenience — it is a significant loss of revenue. At ${brandName}, we believe your infrastructure should be invisible, reliable, and resilient.\n\n✦ ${usp1}\n✦ ${usp2}\n✦ ${usp3}\n\nLet's build a foundation that never sleeps.\n\n#${brandName.replace(/\s+/g, '')} #BusinessContinuity #EnterpriseArchitecture`
      }
    }
  ];

  // 11. Agent Memory (4 learnings)
  const memories: MemoryItem[] = [
    {
      id: `mem-${Date.now()}-1`,
      category: 'winning-hook',
      agent: 'content',
      learning: `${brandName} Operational Resilience Hook — Opening B2B authority content with "A security camera or server is just a wall ornament if your network fails during power cuts" delivered 3.4x higher conversion rate among executive decision makers.`,
      confidence: 96,
      supportingData: `+340% LinkedIn Engagement · 18 qualified audit inquiries generated from commercial business hubs.`,
      dateLogged: 'Today'
    },
    {
      id: `mem-${Date.now()}-2`,
      category: 'competitor-gap',
      agent: 'leads',
      learning: `Decision Maker Friction Point — 78% of business owners delay critical upgrades because they fear multi-day operational downtime. Emphasizing "${brandName} Overnight / Weekend Zero-Interruption Deployment" cut sales cycle by 71%.`,
      confidence: 94,
      supportingData: `Reduced sales cycle from 14 days to 4 days across 24 closed enterprise contracts.`,
      dateLogged: 'Yesterday'
    },
    {
      id: `mem-${Date.now()}-3`,
      category: 'winning-format',
      agent: 'social',
      learning: `Visual Architecture vs Generic Stock Photos — Showing side-by-side technical diagrams of Clean Server Rack Cabling vs Messy Wires increased direct message inquiries for ${brandName} by 185%.`,
      confidence: 98,
      supportingData: `+185% DM inquiries · High technical credibility established with CTOs and operations managers.`,
      dateLogged: '2 days ago'
    },
    {
      id: `mem-${Date.now()}-4`,
      category: 'winning-hook',
      agent: 'seo',
      learning: `GEO Authority for Local Search — Grounding content around specific commercial hubs for "${brandName}" triggered top-tier Perplexity & Gemini citations.`,
      confidence: 92,
      supportingData: `+54% AI Search Citation Frequency for commercial IT keywords.`,
      dateLogged: '3 days ago'
    }
  ];

  // 12. Connected Pages
  const connectedPages: ConnectedSocialPage[] = [
    {
      id: `page-li-${brandName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      platform: 'LinkedIn',
      pageName: `${brandName} (Company Page)`,
      pageHandle: `@${brandName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      externalPageId: 'ext-li-syn-1',
      followersCount: 1240,
      oauthConnected: true,
      scopes: ['w_organization_social', 'r_organization_social'],
      lastSyncedAt: '2026-10-25',
      category: 'Corporate'
    },
    {
      id: `page-fb-${brandName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      platform: 'Facebook',
      pageName: `${brandName} Official`,
      pageHandle: `@${brandName.toLowerCase().replace(/[^a-z0-9]/g, '')}.fb`,
      externalPageId: 'ext-fb-syn-1',
      followersCount: 2850,
      oauthConnected: false,
      scopes: ['pages_manage_posts', 'pages_read_engagement'],
      lastSyncedAt: 'Not connected',
      category: 'Business Page'
    }
  ];

  // 13. GEO Score & AI Search Citations
  const geoScore: GeoScoreData = {
    overallScore: 84,
    change30Days: 12,
    lastAuditedUrl: url,
    lastAuditedAt: 'Just now',
    aiEngineBreakdown: [
      {
        engine: 'ChatGPT',
        score: 86,
        citationShare: 42,
        sentiment: 'Positive',
        citationsLastWeek: 540,
        topQuery: `Best enterprise solutions by ${brandName}`
      },
      {
        engine: 'Perplexity',
        score: 82,
        citationShare: 31,
        sentiment: 'Positive',
        citationsLastWeek: 395,
        topQuery: `${brandName} reviews and reliability`
      },
      {
        engine: 'Google AI Overviews',
        score: 81,
        citationShare: 27,
        sentiment: 'Positive',
        citationsLastWeek: 345,
        topQuery: `${brandName} vs ${competitors[0]?.name || 'competitors'}`
      }
    ],
    hallucinationAlerts: [],
    topRankedEntities: [
      { entity: brandName, visibility: 94, position: 1, trend: 'up' },
      { entity: usp1, visibility: 88, position: 1, trend: 'up' },
      { entity: usp2, visibility: 82, position: 2, trend: 'stable' }
    ]
  };

  // 14. Reports
  const reports: ReportItem[] = [
    {
      id: `rep-${Date.now()}-1`,
      title: `${brandName} Q4 Growth & Multi-Channel Attribution Report`,
      period: 'Q4 2026',
      type: 'Multi-Channel Attribution',
      summary: `Cross-channel performance report demonstrating a 38% increase in qualified pipeline for ${brandName}.`,
      keyKpi: '+38% Qualified Pipeline ($48,200 Attributed)',
      author: 'AI Orchestrator',
      metricsSnapshot: {
        qualifiedPipeline: '$48,200',
        topChannel: 'LinkedIn Inbound',
        roi: '3.8x',
        auditRequests: 72
      }
    },
    {
      id: `rep-${Date.now()}-2`,
      title: `${brandName} AI Search Visibility & GEO Citation Index`,
      period: 'October 2026',
      type: 'GEO Intelligence',
      summary: `Evaluation of AI citation coverage across Perplexity, Gemini, and ChatGPT for core offerings.`,
      keyKpi: '84/100 GEO Authority (+12% MoM)',
      author: 'SEO & GEO Agent',
      metricsSnapshot: {
        overallScore: 84,
        citations7d: 1280,
        topQueryRank: 'Top 3 Citation Coverage'
      }
    }
  ];

  return {
    knowledgeDocs,
    campaigns,
    contentList,
    socialPosts,
    emailCampaigns,
    emailSequences,
    leads,
    communityMessages,
    approvals,
    memories,
    connectedPages,
    geoScore,
    reports
  };
}
