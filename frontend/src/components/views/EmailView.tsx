import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Mail,
  Send,
  Sparkles,
  Users,
  CheckCircle2,
  Plus,
  Edit3,
  Copy,
  Layers,
  Monitor,
  Smartphone,
  Check,
  AlertCircle,
  Tag,
  GitBranch,
  Server,
  Upload,
  Download,
  Code2,
  Eye,
  Trash2,
  Search,
  RefreshCw,
  Globe,
  ShieldCheck,
  FileSpreadsheet,
  Sliders
} from 'lucide-react';
import {
  mockEmails,
  mockEmailTemplates,
  mockEmailSequences,
  mockSaaSApps,
  mockDefaultSmtpConfig,
  mockEmailContacts,
  buildResponsiveEmailHtml
} from '../../data/mock-data';
import {
  EmailCampaign,
  EmailTemplate,
  EmailSequenceWorkflow,
  SequenceStep,
  SaaSAppProfile,
  SmtpConfig,
  EmailContact,
  ViewId,
  ApprovalItem,
  BrandProfile
} from '../../types';
import { mockBrandProfile } from '../../data/mock-data';
import { VisualSequenceBuilder } from '../email/VisualSequenceBuilder';

interface EmailViewProps {
  onOpenCommand: () => void;
  onNavigate: (view: ViewId) => void;
  onSubmitApproval?: (item: ApprovalItem) => void;
  brandProfile?: BrandProfile;
}

const DEFAULT_SMART_TAGS = [
  'All Contacts',
  'SaaS Onboarding',
  'Feature Updates',
  'Feature Beta',
  'Trial User',
  'Pro Plan',
  'Enterprise'
];

export const EmailView: React.FC<EmailViewProps> = ({
  onOpenCommand,
  onNavigate,
  onSubmitApproval,
  brandProfile = mockBrandProfile
}) => {
  const effectiveBrandName = brandProfile?.name || 'Brand';
  // Primary Workspace Tabs
  const [activeTab, setActiveTab] = useState<
    'templates' | 'audience' | 'broadcasts' | 'sequences' | 'smtp'
  >('templates');

  // Multi-App SaaS Profiles State
  const [apps, setApps] = useState<SaaSAppProfile[]>(mockSaaSApps);
  const [selectedAppId, setSelectedAppId] = useState<string>('all');
  const [newAppModalOpen, setNewAppModalOpen] = useState(false);
  const [newAppForm, setNewAppForm] = useState({
    name: '',
    category: 'SaaS Platform' as SaaSAppProfile['category'],
    domain: '',
    senderName: '',
    senderEmail: '',
    replyToEmail: '',
    accentColor: '#10b981',
    tagline: ''
  });

  // Business SMTP State
  const [smtpConfig, setSmtpConfig] = useState<SmtpConfig>(mockDefaultSmtpConfig);
  const [smtpVerifying, setSmtpVerifying] = useState(false);
  const [smtpStatusMsg, setSmtpStatusMsg] = useState<{
    type: 'success' | 'warning' | 'error';
    text: string;
  } | null>(null);
  const [smtpTestRecipient, setSmtpTestRecipient] = useState('csebelal9@gmail.com');
  const [sendingTestEmail, setSendingTestEmail] = useState(false);

  // Templates & AI Generator State
  const [templates, setTemplates] = useState<EmailTemplate[]>(mockEmailTemplates);
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState<string>('all');
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [editorMode, setEditorMode] = useState<'visual' | 'html'>('visual');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [htmlCopied, setHtmlCopied] = useState(false);

  // AI SaaS Template Generator State
  const [aiCategory, setAiCategory] = useState<'onboarding' | 'feature-update'>('onboarding');
  const [aiThemeMode, setAiThemeMode] = useState<'light' | 'dark'>('light');
  const [aiPromptTopic, setAiPromptTopic] = useState(
    'Welcome new SaaS users with a 3-step quickstart checklist to connect their website, Search Console, and Google Analytics'
  );
  const [aiGenerating, setAiGenerating] = useState(false);
  const [showReferenceGallery, setShowReferenceGallery] = useState(false);

  // Audience Contacts & CSV Import / Smart Tag Segmentation State
  const [contacts, setContacts] = useState<EmailContact[]>(mockEmailContacts);
  const [selectedTag, setSelectedTag] = useState<string>('All Contacts');
  const [contactSearch, setContactSearch] = useState('');
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [csvRawText, setCsvRawText] = useState(
    `email,first_name,company,app_name,plan_tier,tags\nrahim.cto@bdtech.io,Rahim,BDTech SaaS,Serpely GEO OS,Pro,"SaaS Onboarding|Feature Updates"\ntania.pm@webapp.co,Tania,WebApp Studio,CloudPulse Web Analytics,Free Trial,"Trial User|SaaS Onboarding|Feature Beta"`
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Add Single Contact State
  const [newContactForm, setNewContactForm] = useState({
    email: '',
    firstName: '',
    company: '',
    planTier: 'Free Trial' as EmailContact['planTier'],
    tagsInput: 'SaaS Onboarding, Feature Updates'
  });

  // Broadcasts & Campaign Dispatch State
  const [broadcasts, setBroadcasts] = useState<EmailCampaign[]>(mockEmails);
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [campaignTitle, setCampaignTitle] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0]?.id || '');
  const [dispatchTargetTag, setDispatchTargetTag] = useState<string>('SaaS Onboarding');
  const [dispatchSending, setDispatchSending] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('csebelal9@gmail.com');
  const [testSent, setTestSent] = useState(false);

  // Automated Sequences State
  const [sequences, setSequences] = useState<EmailSequenceWorkflow[]>(mockEmailSequences);
  const [activeSequence, setActiveSequence] = useState<EmailSequenceWorkflow | undefined>(sequences[0]);
  const [sequenceViewMode, setSequenceViewMode] = useState<'visual' | 'timeline'>('visual');
  const [isAddingStep, setIsAddingStep] = useState(false);
  const [newStepDelay, setNewStepDelay] = useState(3);
  const [newStepTemplateId, setNewStepTemplateId] = useState(templates[0]?.id || '');

  // Toast Notification
  const [notification, setNotification] = useState<string | null>(null);
  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Load default SMTP settings from backend .env on mount
  useEffect(() => {
    fetch('/api/email/smtp-defaults')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.host) {
          setSmtpConfig((prev) => ({
            ...prev,
            host: data.host || prev.host,
            port: data.port || prev.port,
            secure: Boolean(data.secure),
            user: data.user || prev.user,
            fromName: data.fromName || prev.fromName,
            fromEmail: data.fromEmail || prev.fromEmail,
            replyTo: data.replyTo || prev.replyTo,
            verified: Boolean(data.passConfigured)
          }));
        }
      })
      .catch(() => {});
  }, []);

  const activeApp = useMemo(() => {
    const fallbackApp: SaaSAppProfile = {
      id: 'app-default',
      name: 'Tech Sheba',
      category: 'SaaS Platform',
      domain: 'techsheba.net',
      senderName: 'Tech Sheba',
      senderEmail: 'contact@techsheba.net',
      replyToEmail: 'support@techsheba.net',
      accentColor: '#10b981',
      tagline: 'Enterprise IT, CCTV & Managed NOC'
    };
    if (selectedAppId === 'all') return apps[0] || fallbackApp;
    return apps.find((a) => a.id === selectedAppId) || apps[0] || fallbackApp;
  }, [apps, selectedAppId]);

  // All unique smart tags across contacts
  const allSmartTags = useMemo(() => {
    const tagSet = new Set<string>(DEFAULT_SMART_TAGS);
    contacts.forEach((c) => c.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet);
  }, [contacts]);

  // Filtered contacts based on selected SaaS App, Smart Tag, and Search query
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      const matchesApp = selectedAppId === 'all' || c.appId === selectedAppId;
      const matchesTag =
        selectedTag === 'All Contacts' || c.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase());
      const q = contactSearch.trim().toLowerCase();
      const matchesSearch =
        !q ||
        c.email.toLowerCase().includes(q) ||
        c.firstName.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q));
      return matchesApp && matchesTag && matchesSearch;
    });
  }, [contacts, selectedAppId, selectedTag, contactSearch]);

  // Filtered templates based on selected SaaS App and Category
  const filteredTemplates = useMemo(() => {
    return templates.filter((tpl) => {
      const matchesApp = selectedAppId === 'all' || !tpl.appId || tpl.appId === selectedAppId;
      const matchesCat = templateCategoryFilter === 'all' || tpl.category === templateCategoryFilter;
      return matchesApp && matchesCat;
    });
  }, [templates, selectedAppId, templateCategoryFilter]);

  // Matching recipients for Campaign Dispatch Modal
  const dispatchRecipients = useMemo(() => {
    return contacts.filter((c) => {
      const matchesApp = selectedAppId === 'all' || c.appId === selectedAppId;
      const matchesTag =
        dispatchTargetTag === 'All Contacts' ||
        c.tags.some((t) => t.toLowerCase() === dispatchTargetTag.toLowerCase());
      return matchesApp && matchesTag && c.status === 'subscribed';
    });
  }, [contacts, selectedAppId, dispatchTargetTag]);

  // Apply sample contact variables for live preview
  const applySampleVariables = (text: string) => {
    const sampleContact = filteredContacts[0] || contacts[0];
    const brandDomain = (brandProfile?.website || 'brand.com').replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');
    return (text || '')
      .replace(/{{first_name}}/g, sampleContact?.firstName || 'Sarah')
      .replace(/{{company}}/g, sampleContact?.company || 'NeoLedger SaaS')
      .replace(/{{app_name}}/g, activeApp?.name || effectiveBrandName)
      .replace(/{{plan_tier}}/g, sampleContact?.planTier || 'Pro')
      .replace(/{{feature_name}}/g, `${effectiveBrandName} Workspace 2.4`)
      .replace(/{{geo_score}}/g, '88')
      .replace(/{{citations}}/g, '214')
      .replace(/{{cta_url}}/g, `https://${brandDomain}/dashboard`)
      .replace(/{{audit_url}}/g, `https://${brandDomain}/audit`);
  };

  // Sync visual blocks into responsive HTML code
  const handleSyncBlocksToHtml = (tpl: EmailTemplate): EmailTemplate => {
    const generatedHtml = buildResponsiveEmailHtml({
      appName: activeApp?.name || effectiveBrandName,
      themeMode: tpl.themeMode || 'light',
      headerTitle: tpl.headerTitle,
      preheader: tpl.preheader,
      bodyContent: tpl.bodyContent,
      stepsList: tpl.stepsList,
      postCtaText: tpl.postCtaText,
      infoBox: tpl.infoBox,
      fallbackUrl: tpl.fallbackUrl,
      signOffNote: tpl.signOffNote,
      signOffName: tpl.signOffName,
      signOffRole: tpl.signOffRole,
      footerReason: tpl.footerReason,
      highlightBox: tpl.highlightBox,
      ctaText: tpl.ctaText,
      ctaUrl: tpl.ctaUrl,
      accentColor: tpl.accentColor || activeApp?.accentColor || '#17c964'
    });
    return { ...tpl, htmlCode: generatedHtml };
  };

  // Save edited template
  const handleSaveTemplate = () => {
    if (!editingTemplate) return;
    const updatedTpl: EmailTemplate = {
      ...editingTemplate,
      htmlCode:
        editingTemplate.htmlCode ||
        buildResponsiveEmailHtml({
          appName: activeApp?.name || 'Serpely',
          themeMode: editingTemplate.themeMode || 'light',
          headerTitle: editingTemplate.headerTitle,
          preheader: editingTemplate.preheader,
          bodyContent: editingTemplate.bodyContent,
          stepsList: editingTemplate.stepsList,
          postCtaText: editingTemplate.postCtaText,
          infoBox: editingTemplate.infoBox,
          fallbackUrl: editingTemplate.fallbackUrl,
          signOffNote: editingTemplate.signOffNote,
          signOffName: editingTemplate.signOffName,
          signOffRole: editingTemplate.signOffRole,
          footerReason: editingTemplate.footerReason,
          highlightBox: editingTemplate.highlightBox,
          ctaText: editingTemplate.ctaText,
          ctaUrl: editingTemplate.ctaUrl,
          accentColor: editingTemplate.accentColor || activeApp?.accentColor || '#17c964'
        }),
      lastModified: 'Just now'
    };
    setTemplates((prev) => {
      const exists = prev.some((t) => t.id === updatedTpl.id);
      return exists ? prev.map((t) => (t.id === updatedTpl.id ? updatedTpl : t)) : [updatedTpl, ...prev];
    });
    showNotification(`Template "${updatedTpl.name}" saved with ${effectiveBrandName} Design System.`);
    setEditingTemplate(null);
  };

  // Generate SaaS Onboarding / Feature Update Template with AI
  const handleGenerateAiTemplate = async () => {
    if (!aiPromptTopic.trim()) return;
    setAiGenerating(true);
    try {
      const res = await fetch('/api/email/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appName: activeApp?.name || effectiveBrandName,
          category: aiCategory,
          themeMode: aiThemeMode,
          promptTopic: aiPromptTopic,
          accentColor: activeApp?.accentColor || '#17c964'
        })
      });
      const data = await res.json();
      if (data?.template) {
        const createdTpl: EmailTemplate = {
          id: `tpl-ai-${Date.now()}`,
          appId: activeApp?.id || 'app-default',
          ...data.template,
          lastModified: 'Just now (AI Generated)'
        };
        setTemplates((prev) => [createdTpl, ...prev]);
        setEditingTemplate(createdTpl);
        setEditorMode('visual');
        showNotification(`AI generated "${createdTpl.name}" in ${effectiveBrandName} ${aiThemeMode} layout.`);
      }
    } catch {
      showNotification('Could not reach AI generator endpoint.');
    } finally {
      setAiGenerating(false);
    }
  };

  // Insert merge variable into editing template
  const insertVariable = (variable: string) => {
    if (!editingTemplate) return;
    if (editorMode === 'html') {
      setEditingTemplate({
        ...editingTemplate,
        htmlCode: (editingTemplate.htmlCode || '') + ` ${variable}`
      });
    } else {
      const nextBody = editingTemplate.bodyContent + ' ' + variable;
      setEditingTemplate(
        handleSyncBlocksToHtml({
          ...editingTemplate,
          bodyContent: nextBody
        })
      );
    }
  };

  // Parse CSV text & import contacts with Smart Tags
  const handleImportCsvContacts = () => {
    const lines = csvRawText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) return;

    const startIdx = lines[0].toLowerCase().includes('email') ? 1 : 0;
    const imported: EmailContact[] = [];

    for (let i = startIdx; i < lines.length; i++) {
      const row = lines[i]
        .split(',')
        .map((cell) => cell.replace(/^["']|["']$/g, '').trim());
      const email = row[0];
      if (!email || !email.includes('@')) continue;

      const firstName = row[1] || email.split('@')[0];
      const company = row[2] || 'SaaS Customer';
      const appName = row[3] || activeApp?.name || 'Serpely GEO OS';
      const matchedApp =
        apps.find((a) => a.name.toLowerCase() === appName.toLowerCase()) || activeApp;
      const rawTier = (row[4] || 'Free Trial') as EmailContact['planTier'];
      const planTier: EmailContact['planTier'] = ['Free Trial', 'Starter', 'Pro', 'Enterprise'].includes(
        rawTier
      )
        ? rawTier
        : 'Free Trial';
      const rawTags = row[5]
        ? row[5]
            .split(/[|;]/)
            .map((t) => t.trim())
            .filter(Boolean)
        : ['SaaS Onboarding', 'CSV Imported'];

      imported.push({
        id: `ct-csv-${Date.now()}-${i}`,
        email,
        firstName,
        company,
        appId: matchedApp.id,
        appName: matchedApp.name,
        planTier,
        tags: rawTags.length ? rawTags : ['SaaS Onboarding'],
        status: 'subscribed',
        addedAt: new Date().toISOString().split('T')[0]
      });
    }

    if (imported.length > 0) {
      setContacts((prev) => {
        const existingEmails = new Set(imported.map((c) => c.email.toLowerCase()));
        const filteredPrev = prev.filter((c) => !existingEmails.has(c.email.toLowerCase()));
        return [...imported, ...filteredPrev];
      });
      setCsvModalOpen(false);
      showNotification(`Imported ${imported.length} contacts with Smart Tags.`);
    }
  };

  // Handle CSV file upload from disk
  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result;
      if (typeof content === 'string') {
        setCsvRawText(content);
      }
    };
    reader.readAsText(file);
  };

  // Download sample CSV template
  const handleDownloadSampleCsv = () => {
    const sample = `email,first_name,company,app_name,plan_tier,tags\nsarah@neoledger.io,Sarah,NeoLedger FinTech,Serpely GEO OS,Pro,"SaaS Onboarding|Feature Updates"\ndavid@finpulse.com,David,FinPulse SaaS,CloudPulse Web Analytics,Free Trial,"Trial User|SaaS Onboarding|Feature Beta"`;
    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'saas-audience-contacts-sample.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Add single contact manually
  const handleAddSingleContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactForm.email.includes('@')) return;
    const parsedTags = newContactForm.tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newItem: EmailContact = {
      id: `ct-${Date.now()}`,
      email: newContactForm.email.trim(),
      firstName: newContactForm.firstName.trim() || newContactForm.email.split('@')[0],
      company: newContactForm.company.trim() || 'SaaS Workspace',
      appId: activeApp.id,
      appName: activeApp.name,
      planTier: newContactForm.planTier,
      tags: parsedTags.length ? parsedTags : ['SaaS Onboarding'],
      status: 'subscribed',
      addedAt: new Date().toISOString().split('T')[0]
    };

    setContacts((prev) => [newItem, ...prev.filter((c) => c.email !== newItem.email)]);
    setNewContactForm({
      email: '',
      firstName: '',
      company: '',
      planTier: 'Free Trial',
      tagsInput: 'SaaS Onboarding, Feature Updates'
    });
    showNotification(`Added ${newItem.email} to ${activeApp.name} audience.`);
  };

  // Verify Business SMTP server handshake
  const handleVerifySmtp = async () => {
    setSmtpVerifying(true);
    setSmtpStatusMsg(null);
    try {
      const res = await fetch('/api/email/smtp-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ smtp: smtpConfig })
      });
      const data = await res.json();
      if (data.success) {
        setSmtpConfig((prev) => ({
          ...prev,
          verified: !data.simulated,
          lastVerifiedAt: 'Just now'
        }));
        setSmtpStatusMsg({
          type: data.simulated ? 'warning' : 'success',
          text: data.message
        });
        showNotification(data.simulated ? 'SMTP profile saved (Sandbox Mode)' : 'Business SMTP Verified!');
      } else {
        setSmtpStatusMsg({
          type: 'error',
          text: data.message || 'SMTP connection verification failed.'
        });
      }
    } catch {
      setSmtpStatusMsg({
        type: 'error',
        text: 'Network error while verifying SMTP server.'
      });
    } finally {
      setSmtpVerifying(false);
    }
  };

  // Send a test email using Business SMTP
  const handleSendTestViaSmtp = async (tpl?: EmailTemplate) => {
    const chosenTpl = tpl || templates.find((t) => t.id === selectedTemplateId) || templates[0];
    setSendingTestEmail(true);
    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smtp: smtpConfig,
          appName: activeApp.name,
          subject: `[TEST] ${chosenTpl.subjectLine}`,
          text: chosenTpl.bodyContent,
          html:
            chosenTpl.htmlCode ||
            buildResponsiveEmailHtml({
              appName: activeApp.name,
              headerTitle: chosenTpl.headerTitle,
              preheader: chosenTpl.preheader,
              bodyContent: chosenTpl.bodyContent,
              highlightBox: chosenTpl.highlightBox,
              ctaText: chosenTpl.ctaText,
              ctaUrl: chosenTpl.ctaUrl,
              accentColor: chosenTpl.accentColor || activeApp.accentColor
            }),
          recipients: [
            {
              email: smtpTestRecipient || testEmailAddress || 'csebelal9@gmail.com',
              firstName: 'Belal',
              company: activeApp.name,
              appName: activeApp.name,
              planTier: 'Enterprise'
            }
          ]
        })
      });
      const data = await res.json();
      if (data.success) {
        setTestSent(true);
        showNotification(data.message);
      } else {
        showNotification(data.message || 'SMTP send failed.');
      }
    } catch {
      showNotification('Error sending test email.');
    } finally {
      setSendingTestEmail(false);
    }
  };

  // Dispatch Campaign via Business SMTP to Smart Tag Segment
  const handleDispatchCampaignViaSmtp = async (requireApproval: boolean) => {
    const chosenTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];
    const finalTitle =
      campaignTitle.trim() || `${activeApp.name}: ${chosenTemplate.name} (${dispatchTargetTag})`;
    const targetList =
      dispatchRecipients.length > 0
        ? dispatchRecipients
        : [
            {
              email: testEmailAddress || 'csebelal9@gmail.com',
              firstName: 'Belal',
              company: 'Nexus SaaS Labs',
              appName: activeApp.name,
              planTier: 'Enterprise'
            }
          ];

    const htmlPayload =
      chosenTemplate.htmlCode ||
      buildResponsiveEmailHtml({
        appName: activeApp.name,
        headerTitle: chosenTemplate.headerTitle,
        preheader: chosenTemplate.preheader,
        bodyContent: chosenTemplate.bodyContent,
        highlightBox: chosenTemplate.highlightBox,
        ctaText: chosenTemplate.ctaText,
        ctaUrl: chosenTemplate.ctaUrl,
        accentColor: chosenTemplate.accentColor || activeApp.accentColor
      });

    if (requireApproval) {
      const newBroadcast: EmailCampaign = {
        id: `em-${Date.now()}`,
        appId: activeApp.id,
        appName: activeApp.name,
        title: finalTitle,
        type: chosenTemplate.category === 'feature-update' ? 'feature-update' : 'announcement',
        subjectLine: chosenTemplate.subjectLine,
        previewText: chosenTemplate.preheader,
        body: chosenTemplate.bodyContent,
        htmlCode: htmlPayload,
        audienceSegment: `${dispatchTargetTag} (${targetList.length} contacts)`,
        targetTag: dispatchTargetTag,
        recipientsCount: targetList.length,
        openRate: 0,
        ctr: 0,
        status: 'pending_approval',
        riskLevel: 'high',
        deliveryVia: `Business SMTP (${smtpConfig.fromEmail})`,
        templateId: chosenTemplate.id
      };

      setBroadcasts([newBroadcast, ...broadcasts]);
      setDispatchModalOpen(false);

      const approvalItem: ApprovalItem = {
        id: `ap-${Date.now()}`,
        title: `Email Broadcast (${activeApp.name}): ${finalTitle}`,
        agent: 'email',
        contentType: 'email',
        platform: `Business SMTP (${smtpConfig.fromEmail})`,
        riskLevel: 'high',
        status: 'pending',
        campaign: finalTitle,
        submittedAt: 'Just now',
        preview: applySampleVariables(chosenTemplate.bodyContent),
        riskReason: `Outbound Business SMTP email campaign to ${targetList.length} subscribers tagged "${dispatchTargetTag}".`,
        budgetImpact: `Zero ad spend (Business Mail SMTP: ${smtpConfig.host})`,
        targetAudience: `${dispatchTargetTag} (${targetList.length} contacts)`
      };

      if (onSubmitApproval) onSubmitApproval(approvalItem);
      fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(approvalItem)
      }).catch(() => {});

      showNotification(`Campaign "${finalTitle}" queued in Approval Gate.`);
      return;
    }

    // Direct Dispatch via Business SMTP
    setDispatchSending(true);
    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smtp: smtpConfig,
          appName: activeApp.name,
          subject: chosenTemplate.subjectLine,
          text: chosenTemplate.bodyContent,
          html: htmlPayload,
          recipients: targetList
        })
      });
      const data = await res.json();
      if (data.success) {
        const sentBroadcast: EmailCampaign = {
          id: `em-${Date.now()}`,
          appId: activeApp.id,
          appName: activeApp.name,
          title: finalTitle,
          type: chosenTemplate.category === 'feature-update' ? 'feature-update' : 'announcement',
          subjectLine: chosenTemplate.subjectLine,
          previewText: chosenTemplate.preheader,
          body: chosenTemplate.bodyContent,
          htmlCode: htmlPayload,
          audienceSegment: `${dispatchTargetTag} (${targetList.length} contacts)`,
          targetTag: dispatchTargetTag,
          recipientsCount: targetList.length,
          openRate: 54.2,
          ctr: 19.4,
          status: 'sent',
          riskLevel: 'high',
          sentAt: 'Just now',
          deliveryVia: data.deliveryVia || `Business SMTP (${smtpConfig.fromEmail})`,
          templateId: chosenTemplate.id
        };
        setBroadcasts([sentBroadcast, ...broadcasts]);
        setDispatchModalOpen(false);
        showNotification(data.message);
      } else {
        showNotification(data.message || 'SMTP Campaign send failed.');
      }
    } catch {
      showNotification('Failed to communicate with Business SMTP server.');
    } finally {
      setDispatchSending(false);
    }
  };

  // Add New SaaS/Web App Profile
  const handleCreateNewApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppForm.name.trim()) return;
    const cleanDomain = newAppForm.domain.replace(/^https?:\/\//, '').replace(/\/$/, '') || 'yourapp.io';
    const created: SaaSAppProfile = {
      id: `app-${Date.now()}`,
      name: newAppForm.name.trim(),
      category: newAppForm.category,
      domain: cleanDomain,
      senderName: newAppForm.senderName.trim() || `${newAppForm.name.trim()} Team`,
      senderEmail: newAppForm.senderEmail.trim() || `hello@${cleanDomain}`,
      replyToEmail: newAppForm.replyToEmail.trim() || `support@${cleanDomain}`,
      accentColor: newAppForm.accentColor || '#10b981',
      tagline: newAppForm.tagline.trim() || 'SaaS & Web App Lifecycle Workspace'
    };
    setApps((prev) => [...prev, created]);
    setSelectedAppId(created.id);
    setSmtpConfig((prev) => ({
      ...prev,
      fromName: created.senderName,
      fromEmail: created.senderEmail,
      replyTo: created.replyToEmail
    }));
    setNewAppModalOpen(false);
    showNotification(`Added SaaS App "${created.name}" (${created.senderEmail}).`);
  };

  // Sequence Helpers
  const handleUpdateSequence = (updated: EmailSequenceWorkflow) => {
    setSequences((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setActiveSequence(updated);
    showNotification(`Sequence "${updated.name}" updated.`);
  };

  const handleOpenApprovalForSequence = (title: string, details: string) => {
    const approvalItem: ApprovalItem = {
      id: `ap-${Date.now()}`,
      title: `Sequence Workflow: ${title}`,
      agent: 'email',
      contentType: 'email',
      platform: `Business SMTP (${smtpConfig.fromEmail})`,
      riskLevel: 'high',
      status: 'pending',
      campaign: activeSequence?.name || 'Email Sequence',
      submittedAt: 'Just now',
      preview: details,
      riskReason: `Automated SaaS lifecycle sequence update requires approval.`,
      budgetImpact: 'Zero ad spend (Business Mail SMTP)',
      targetAudience: activeSequence?.targetAudience || 'Target Audience'
    };
    if (onSubmitApproval) onSubmitApproval(approvalItem);
    showNotification(`Sequence "${title}" submitted to Approval Gate.`);
  };

  // Create a new SaaS Sequence in 1 click from proven lifecycle recipes
  const handleCreateSequenceFromRecipe = (
    recipeType: 'onboarding' | 'feature-release' | 're-engagement'
  ) => {
    const onboardingTpl =
      templates.find((t) => t.category === 'onboarding') || templates[0];
    const featureTpl =
      templates.find((t) => t.category === 'feature-update') || templates[1] || templates[0];
    const nurtureTpl =
      templates.find((t) => t.category === 'nurture' || t.category === 'announcement') ||
      templates[0];

    let createdSeq: EmailSequenceWorkflow;

    if (recipeType === 'onboarding') {
      createdSeq = {
        id: `seq-${Date.now()}`,
        name: `${activeApp.name} — 7-Day SaaS Trial Onboarding`,
        triggerEvent: 'New SaaS Trial Signup (Smart Tag: SaaS Onboarding)',
        description:
          'Automated 4-step onboarding sequence guiding new SaaS users from workspace setup to Pro upgrade.',
        status: 'active',
        targetAudience: `SaaS Onboarding (${activeApp.name})`,
        overallMetrics: {
          enrolled: filteredContacts.length || 48,
          completed: 19,
          avgOpenRate: 64.2,
          avgClickRate: 24.8
        },
        steps: [
          {
            id: `st-${Date.now()}-1`,
            stepNumber: 1,
            delayDays: 0,
            templateId: onboardingTpl.id,
            subjectLine: `Welcome to ${activeApp.name}, {{first_name}} — Your 3-Minute Quickstart`,
            previewSnippet: 'Your SaaS workspace is live. Complete these 3 quick steps to get started.',
            status: 'active',
            stats: { sent: 48, openRate: 72.4, clickRate: 31.2, replyRate: 6.4 }
          },
          {
            id: `st-${Date.now()}-2`,
            stepNumber: 2,
            delayDays: 2,
            templateId: featureTpl.id,
            subjectLine: `Day 2 Tip: Automate your first workflow inside ${activeApp.name}`,
            previewSnippet: 'See how teams save 6+ hours/week with automated triggers.',
            status: 'active',
            stats: { sent: 41, openRate: 63.8, clickRate: 24.1, replyRate: 4.9 }
          },
          {
            id: `st-${Date.now()}-3`,
            stepNumber: 3,
            delayDays: 3,
            templateId: nurtureTpl.id,
            subjectLine: `How {{company}} can unlock 3.2x faster results on ${activeApp.name}`,
            previewSnippet: 'Case study + benchmark insights for your team.',
            status: 'active',
            stats: { sent: 35, openRate: 59.5, clickRate: 21.0, replyRate: 5.1 }
          },
          {
            id: `st-${Date.now()}-4`,
            stepNumber: 4,
            delayDays: 2,
            templateId: onboardingTpl.id,
            subjectLine: `Your ${activeApp.name} trial wraps up soon — Claim 20% off Pro Plan`,
            previewSnippet: 'Upgrade your workspace today with zero downtime.',
            status: 'active',
            stats: { sent: 28, openRate: 61.1, clickRate: 22.9, replyRate: 8.2 }
          }
        ],
        nodes: activeSequence?.nodes || []
      };
    } else if (recipeType === 'feature-release') {
      createdSeq = {
        id: `seq-${Date.now()}`,
        name: `${activeApp.name} — New Feature Release & Adoption`,
        triggerEvent: 'Smart Tag Added: Feature Updates / Feature Beta',
        description:
          '3-step product release sequence announcing a major feature, sharing a walkthrough, and driving adoption.',
        status: 'active',
        targetAudience: `Feature Updates (${activeApp.name})`,
        overallMetrics: {
          enrolled: 86,
          completed: 54,
          avgOpenRate: 61.8,
          avgClickRate: 26.4
        },
        steps: [
          {
            id: `st-${Date.now()}-1`,
            stepNumber: 1,
            delayDays: 0,
            templateId: featureTpl.id,
            subjectLine: `[New Release] Introducing {{feature_name}} in ${activeApp.name}`,
            previewSnippet: 'Now live in your workspace — explore the new capabilities in 1 click.',
            status: 'active',
            stats: { sent: 86, openRate: 66.5, clickRate: 29.4, replyRate: 5.2 }
          },
          {
            id: `st-${Date.now()}-2`,
            stepNumber: 2,
            delayDays: 3,
            templateId: onboardingTpl.id,
            subjectLine: `3 power-user workflows with the new ${activeApp.name} update`,
            previewSnippet: 'Step-by-step guide to activating the new release for {{company}}.',
            status: 'active',
            stats: { sent: 72, openRate: 60.2, clickRate: 25.8, replyRate: 4.1 }
          },
          {
            id: `st-${Date.now()}-3`,
            stepNumber: 3,
            delayDays: 3,
            templateId: nurtureTpl.id,
            subjectLine: `Quick question about your experience with ${activeApp.name}, {{first_name}}`,
            previewSnippet: 'Need help configuring the new release? Reply directly to our product team.',
            status: 'active',
            stats: { sent: 54, openRate: 58.7, clickRate: 24.0, replyRate: 9.6 }
          }
        ],
        nodes: activeSequence?.nodes || []
      };
    } else {
      createdSeq = {
        id: `seq-${Date.now()}`,
        name: `${activeApp.name} — Trial Win-Back & Re-Engagement`,
        triggerEvent: 'Inactive Trial User (No login for 5 days)',
        description:
          '3-step helpful re-engagement sequence to bring inactive trial users back into the product.',
        status: 'active',
        targetAudience: `Trial User (${activeApp.name})`,
        overallMetrics: {
          enrolled: 34,
          completed: 18,
          avgOpenRate: 55.4,
          avgClickRate: 19.8
        },
        steps: [
          {
            id: `st-${Date.now()}-1`,
            stepNumber: 1,
            delayDays: 0,
            templateId: onboardingTpl.id,
            subjectLine: `Need a hand setting up ${activeApp.name} for {{company}}?`,
            previewSnippet: 'We prepared a 1-click starter template for your workspace.',
            status: 'active',
            stats: { sent: 34, openRate: 58.9, clickRate: 22.1, replyRate: 7.4 }
          },
          {
            id: `st-${Date.now()}-2`,
            stepNumber: 2,
            delayDays: 3,
            templateId: featureTpl.id,
            subjectLine: `What's new in ${activeApp.name} since you signed up`,
            previewSnippet: 'Faster onboarding + automated setup now available.',
            status: 'active',
            stats: { sent: 26, openRate: 54.2, clickRate: 18.9, replyRate: 4.8 }
          },
          {
            id: `st-${Date.now()}-3`,
            stepNumber: 3,
            delayDays: 4,
            templateId: nurtureTpl.id,
            subjectLine: `We extended your ${activeApp.name} Pro trial by 7 days, {{first_name}}`,
            previewSnippet: 'Take another look with full access unlocked.',
            status: 'active',
            stats: { sent: 18, openRate: 53.1, clickRate: 18.4, replyRate: 6.2 }
          }
        ],
        nodes: activeSequence?.nodes || []
      };
    }

    setSequences((prev) => [createdSeq, ...prev]);
    setActiveSequence(createdSeq);
    showNotification(`Created "${createdSeq.name}" sequence with ${createdSeq.steps.length} steps!`);
  };

  const handleAddSequenceStep = () => {
    if (!activeSequence) return;
    const chosenTemplate = templates.find((t) => t.id === newStepTemplateId) || templates[0];
    if (!chosenTemplate) {
      showNotification('Please create an email template before adding sequence steps.');
      return;
    }
    const nextStepNum = activeSequence.steps.length + 1;
    const newStep: SequenceStep = {
      id: `step-${Date.now()}`,
      stepNumber: nextStepNum,
      delayDays: newStepDelay,
      templateId: chosenTemplate.id,
      subjectLine: chosenTemplate.subjectLine,
      previewSnippet: chosenTemplate.preheader,
      status: 'active',
      stats: { sent: 0, openRate: 54.0, clickRate: 18.0, replyRate: 4.5 }
    };
    const updatedSequence: EmailSequenceWorkflow = {
      ...activeSequence,
      steps: [...activeSequence.steps, newStep]
    };
    setSequences((prev) => prev.map((s) => (s.id === updatedSequence.id ? updatedSequence : s)));
    setActiveSequence(updatedSequence);
    setIsAddingStep(false);
    showNotification(`Step ${nextStepNum} added to "${activeSequence.name}".`);
  };

  return (
    <div className="w-full space-y-6">
      {/* TOP HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Email Marketing
          </h2>
          <span className="text-xs font-semibold text-emerald-400 tabular-nums">
            {templates.length} Templates · {contacts.length} Contacts · SMTP: {smtpConfig.fromEmail}
          </span>
        </div>

        {/* Primary Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setActiveTab('smtp')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-semibold border border-neutral-800 transition-colors whitespace-nowrap shrink-0"
          >
            <Server className="h-3.5 w-3.5 text-emerald-400" />
            <span>Business SMTP ({smtpConfig.verified ? 'Verified' : 'Configure'})</span>
          </button>
          <button
            onClick={() => {
              setCampaignTitle('');
              setTestSent(false);
              setDispatchModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/10 whitespace-nowrap shrink-0"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Send Business Campaign</span>
          </button>
          <button
            onClick={onOpenCommand}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 transition-colors whitespace-nowrap shrink-0"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>Email Agent</span>
          </button>
        </div>
      </div>

      {/* Multi-App SaaS Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-neutral-900/50 border border-neutral-800">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-neutral-400 mr-1 flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-emerald-400" />
            <span>Active SaaS / Web App:</span>
          </span>
          <button
            onClick={() => setSelectedAppId('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              selectedAppId === 'all'
                ? 'bg-emerald-500 text-neutral-950 font-bold'
                : 'bg-neutral-950 text-neutral-400 border border-neutral-800 hover:text-white'
            }`}
          >
            All SaaS Apps ({apps.length})
          </button>
          {apps.map((app) => (
            <button
              key={app.id}
              onClick={() => {
                setSelectedAppId(app.id);
                setSmtpConfig((prev) => ({
                  ...prev,
                  fromName: app.senderName,
                  fromEmail: app.senderEmail,
                  replyTo: app.replyToEmail
                }));
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 ${
                selectedAppId === app.id
                  ? 'bg-neutral-800 text-white border border-emerald-500/50'
                  : 'bg-neutral-950 text-neutral-400 border border-neutral-800 hover:text-white'
              }`}
            >
              <span>{app.name}</span>
              <span className="text-[11px] font-mono text-neutral-500">· {app.category}</span>
            </button>
          ))}
          <button
            onClick={() => setNewAppModalOpen(true)}
            className="px-2.5 py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-emerald-400 border border-neutral-800 text-xs font-semibold flex items-center gap-1 transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add SaaS App</span>
          </button>
        </div>

        <div className="text-xs font-mono text-neutral-400">
          Sender Identity: <strong className="text-white">{smtpConfig.fromName}</strong> &lt;{smtpConfig.fromEmail}&gt;
        </div>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-neutral-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5 CLEAN WORKSPACE TABS                                         */}
      {/* ============================================================== */}
      <div className="flex flex-wrap items-center justify-between border-b border-neutral-800 pb-1 gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'templates'
                ? 'border-emerald-400 text-emerald-300 bg-neutral-900/60'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>1. Template Studio: Visual + HTML + AI ({filteredTemplates.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('audience')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'audience'
                ? 'border-emerald-400 text-emerald-300 bg-neutral-900/60'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>2. Audience CSV & Smart Tags ({filteredContacts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('broadcasts')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'broadcasts'
                ? 'border-emerald-400 text-emerald-300 bg-neutral-900/60'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Send className="h-3.5 w-3.5" />
            <span>3. Campaign Broadcasts ({broadcasts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('sequences')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'sequences'
                ? 'border-emerald-400 text-emerald-300 bg-neutral-900/60'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>4. Automated Sequences ({sequences.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('smtp')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'smtp'
                ? 'border-emerald-400 text-emerald-300 bg-neutral-900/60'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Server className="h-3.5 w-3.5" />
            <span>5. Business Mail SMTP Setup</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: 3-IN-1 TEMPLATE STUDIO (VISUAL + HTML CODE + AI)        */}
      {/* ============================================================== */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          {/* AI Onboarding & Feature Update Template Generator Bar */}
          <div className="p-5 rounded-xl bg-neutral-900/50 border border-neutral-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>AI EMAIL TEMPLATE GENERATOR</span>
                </div>
                <h3 className="text-sm font-bold text-white mt-0.5">
                  Generate High-Converting Onboarding, Feature Updates & Campaign Emails
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-3">
                <label className="text-xs font-mono text-neutral-400 block mb-1">
                  Campaign Category
                </label>
                <select
                  value={aiCategory}
                  onChange={(e) => setAiCategory(e.target.value as 'onboarding' | 'feature-update')}
                  className="w-full p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs"
                >
                  <option value="onboarding">SaaS User Onboarding & Welcome</option>
                  <option value="feature-update">Product Feature Release & Update</option>
                </select>
              </div>
              <div className="md:col-span-6">
                <label className="text-xs font-mono text-neutral-400 block mb-1">
                  What is this email about? (3-step setup, feature release, or verification)
                </label>
                <input
                  type="text"
                  value={aiPromptTopic}
                  onChange={(e) => setAiPromptTopic(e.target.value)}
                  placeholder="e.g. Welcome new users with 3 steps: Add website, Connect GSC, Connect GA4..."
                  className="w-full p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs"
                />
              </div>
              <div className="md:col-span-3 flex gap-2">
                <button
                  onClick={handleGenerateAiTemplate}
                  disabled={aiGenerating}
                  className="w-full py-2.5 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-neutral-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
                >
                  {aiGenerating ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Generate AI Email</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Category Filter + New Blank Template Button */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-neutral-900 rounded-lg border border-neutral-800">
              {[
                { id: 'all', label: 'All Templates' },
                { id: 'onboarding', label: 'Onboarding & Verify' },
                { id: 'feature-update', label: 'Feature Updates' },
                { id: 'nurture', label: 'Trial Conversion' },
                { id: 'announcement', label: 'Audit & Announcements' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setTemplateCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    templateCategoryFilter === cat.id
                      ? 'bg-neutral-800 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                const blankTpl: EmailTemplate = handleSyncBlocksToHtml({
                  id: `tpl-${Date.now()}`,
                  appId: activeApp.id,
                  name: `Welcome to ${activeApp.name}!`,
                  category: 'onboarding',
                  themeMode: aiThemeMode,
                  subjectLine: `Welcome to ${activeApp.name}, {{first_name}}! Let’s get started`,
                  preheader: `Getting started with ${activeApp.name}.`,
                  headerTitle: `Welcome to ${activeApp.name}!`,
                  bodyContent:
                    `Hi {{first_name}},\n\nWelcome to ${activeApp.name}! We are excited to have you on board.\n\nHere are three quick steps to get the most out of your setup:`,
                  stepsList: [
                    {
                      title: 'Set up your workspace',
                      description: `Configure basic account preferences for ${activeApp.name}.`,
                      duration: '1 min'
                    },
                    {
                      title: 'Verify your channels',
                      description: 'Connect your business accounts and notification alerts.',
                      duration: '2 mins'
                    },
                    {
                      title: 'Invite your team',
                      description: 'Collaborate with your coworkers and manage permissions.',
                      duration: '1 min'
                    }
                  ],
                  postCtaText:
                    "Once completed, your workspace will be fully ready to roll. We will be here to help every step of the way.",
                  signOffNote: 'Questions or feedback? Just reply directly to this email.',
                  signOffName: activeApp.senderName || 'Team',
                  signOffRole: `from ${activeApp.name}`,
                  footerReason: `You're receiving this email because you created an account with ${activeApp.name}.`,
                  ctaText: 'Get Started Now',
                  ctaUrl: 'https://' + activeApp.domain,
                  accentColor: activeApp.accentColor || '#17c964',
                  variables: ['{{first_name}}', '{{company}}', '{{app_name}}', '{{plan_tier}}'],
                  lastModified: 'Just now'
                });
                setTemplates([blankTpl, ...templates]);
                setEditingTemplate(blankTpl);
                setEditorMode('visual');
              }}
              className="px-3.5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs border border-neutral-700 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Plus className="h-3.5 w-3.5 text-emerald-400" />
              <span>New Common Template</span>
            </button>
          </div>

          {/* Template Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTemplates.map((tpl) => {
              const tplApp = apps.find((a) => a.id === tpl.appId) || activeApp;
              const isDarkTpl = tpl.themeMode === 'dark';
              return (
                <div
                  key={tpl.id}
                  className="flex flex-col justify-between rounded-xl border border-neutral-800 bg-neutral-900/40 p-5 space-y-4 hover:border-emerald-500/40 transition-all"
                >
                  <div className="space-y-3">
                    {/* Card Top Meta + 1-Click Light/Dark Toggle */}
                    <div className="flex items-center justify-between text-xs text-neutral-400">
                      <span>
                        <strong className="text-emerald-400 font-mono uppercase">{tpl.category}</strong>
                        <span aria-hidden="true"> · </span>
                        <span>{tplApp.name}</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          const nextMode = isDarkTpl ? 'light' : 'dark';
                          const synced = handleSyncBlocksToHtml({
                            ...tpl,
                            themeMode: nextMode
                          });
                          setTemplates((prev) =>
                            prev.map((item) => (item.id === tpl.id ? synced : item))
                          );
                          showNotification(
                            `Switched "${tpl.name}" to ${nextMode === 'dark' ? 'Dark' : 'Light'} Mode.`
                          );
                        }}
                        className={`px-2 py-0.5 rounded font-mono text-[11px] border transition-colors ${
                          isDarkTpl
                            ? 'bg-neutral-950 text-emerald-300 border-emerald-500/30 hover:bg-neutral-800'
                            : 'bg-white text-neutral-900 border-neutral-300 hover:bg-neutral-200 font-semibold'
                        }`}
                        title="Click to switch between Light and Dark email theme"
                      >
                        {isDarkTpl ? '🌙 Dark Mode' : '☀️ Light Mode'}
                      </button>
                    </div>

                    {/* Visual Miniature Preview of the Common Serpely Layout */}
                    <div
                      onClick={() => {
                        setEditingTemplate({ ...tpl });
                        setEditorMode('visual');
                      }}
                      className={`preserve-theme cursor-pointer rounded-xl p-3 border transition-all ${
                        isDarkTpl
                          ? 'bg-[#050a07] border-neutral-800'
                          : 'bg-[#f1f7f3] border-emerald-500/20'
                      }`}
                    >
                      {/* Mini Main Email Card */}
                      <div
                        className={`rounded-lg overflow-hidden border ${
                          isDarkTpl
                            ? 'bg-[#111312] border-[#1f2421] text-white'
                            : 'bg-white border-[#e3ebe6] text-neutral-900'
                        }`}
                      >
                        {/* Dark Emerald Wave Header with Brand Logo */}
                        <div className="bg-gradient-to-r from-[#031c14] via-[#064e3b] to-[#020806] py-3 px-3 flex items-center justify-center border-b border-emerald-950">
                          {effectiveBrandName === 'Serpely' ? (
                            <img
                              src={
                                tpl.logoText === 'Serpely-White'
                                  ? '/assets/aistudio/Serpely_-_Logo_Logo_-_White_66777434.png'
                                  : '/assets/aistudio/Serpely_-_Logo_Logo_-_G_W_70384cc3.png'
                              }
                              alt={effectiveBrandName}
                              className="h-5 w-auto object-contain"
                            />
                          ) : (
                            <div className="flex items-center gap-1.5 font-bold text-white text-xs tracking-tight">
                              <span className="h-4 w-4 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">
                                {effectiveBrandName.slice(0, 2).toUpperCase()}
                              </span>
                              <span>{effectiveBrandName}</span>
                            </div>
                          )}
                        </div>
                        {/* Mini Card Body */}
                        <div className="p-3 space-y-2">
                          <div className="text-xs font-bold truncate">{tpl.headerTitle}</div>
                          <div
                            className={`text-[11px] line-clamp-2 ${
                              isDarkTpl ? 'text-neutral-300' : 'text-neutral-600'
                            }`}
                          >
                            {applySampleVariables(tpl.bodyContent)}
                          </div>
                          {tpl.stepsList && tpl.stepsList.length > 0 && (
                            <div
                              className={`rounded-md p-1.5 text-[10px] space-y-1 border ${
                                isDarkTpl
                                  ? 'bg-[#161917] border-[#262b28] text-neutral-300'
                                  : 'bg-[#f8faf9] border-neutral-200 text-neutral-700'
                              }`}
                            >
                              {tpl.stepsList.slice(0, 2).map((s, idx) => (
                                <div key={idx} className="flex items-center justify-between truncate">
                                  <span className="truncate">
                                    <strong className="text-[#17c964] mr-1">{idx + 1}</strong>
                                    {s.title}
                                  </span>
                                  <span className="text-[9px] opacity-60 ml-1">{s.duration}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="pt-0.5">
                            <span className="inline-block px-2.5 py-1 rounded-md bg-[#17c964] text-[#050a07] font-bold text-[10px]">
                              {tpl.ctaText} &rarr;
                            </span>
                          </div>
                        </div>
                      </div>
                      {/* Mini Detached Dark Footer */}
                      <div className="mt-1.5 rounded-lg bg-[#070908] border border-neutral-800 px-2.5 py-1.5 flex items-center justify-between text-[9px] text-neutral-400 font-mono">
                        <span className="flex items-center gap-1.5">
                          {effectiveBrandName === 'Serpely' ? (
                            <img
                              src={
                                tpl.logoText === 'Serpely-White'
                                  ? '/assets/aistudio/Serpely_-_Logo_Logo_-_White_66777434.png'
                                  : '/assets/aistudio/Serpely_-_Logo_Logo_-_G_W_70384cc3.png'
                              }
                              alt={effectiveBrandName}
                              className="h-3.5 w-auto object-contain"
                            />
                          ) : (
                            <span className="font-bold text-emerald-400 text-[10px] uppercase tracking-wider">{effectiveBrandName}</span>
                          )}
                          <span>· OFFICIAL COMMUNICATION</span>
                        </span>
                        <span>f · in · X</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white line-clamp-1">{tpl.name}</h4>
                      <p className="text-xs text-neutral-300 mt-1 font-mono line-clamp-1">
                        Subject: {tpl.subjectLine}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-800 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingTemplate({ ...tpl });
                        setEditorMode('visual');
                      }}
                      className="flex-1 py-2 px-3 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Customize & Preview</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditingTemplate({ ...tpl });
                        setEditorMode('html');
                      }}
                      className="py-2 px-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono transition-colors"
                      title="Edit Custom HTML Code"
                    >
                      <Code2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTemplateId(tpl.id);
                        setCampaignTitle(`${tplApp.name}: ${tpl.name}`);
                        setDispatchModalOpen(true);
                      }}
                      className="py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition-colors"
                      title="Send Campaign with this Template"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: AUDIENCE CSV IMPORT & SMART TAG SEGMENTATION            */}
      {/* ============================================================== */}
      {activeTab === 'audience' && (
        <div className="space-y-6">
          {/* Top Bar: CSV Import, Sample CSV & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-neutral-900/40 border border-neutral-800">
            <div>
              <h3 className="text-sm font-bold text-white">
                Audience Contacts & Smart Tag Segmentation
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Import subscriber lists via CSV, segment users by SaaS plan tier or lifecycle tags, and target specific segments in 1 click.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleDownloadSampleCsv}
                className="px-3 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
              >
                <Download className="h-3.5 w-3.5 text-emerald-400" />
                <span>Sample CSV</span>
              </button>
              <button
                onClick={() => setCsvModalOpen(true)}
                className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Import CSV Contacts</span>
              </button>
              <button
                onClick={() => {
                  setDispatchTargetTag(selectedTag);
                  setCampaignTitle(`${activeApp.name} — ${selectedTag} Campaign`);
                  setDispatchModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs border border-neutral-700 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
              >
                <Send className="h-3.5 w-3.5 text-emerald-400" />
                <span>Email "{selectedTag}" ({filteredContacts.length})</span>
              </button>
            </div>
          </div>

          {/* Smart Tag Filter Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
              <span>FILTER BY SMART TAG SEGMENT:</span>
              <span>Showing {filteredContacts.length} of {contacts.length} total contacts</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-neutral-900/70 rounded-xl border border-neutral-800">
              {allSmartTags.map((tag) => {
                const count =
                  tag === 'All Contacts'
                    ? contacts.length
                    : contacts.filter((c) =>
                        c.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
                      ).length;
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                      selectedTag === tag
                        ? 'bg-emerald-500 text-neutral-950 font-bold'
                        : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
                    }`}
                  >
                    {tag} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Add Single Contact + Search Input */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end p-4 rounded-xl bg-neutral-900/30 border border-neutral-800">
            <form onSubmit={handleAddSingleContact} className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-5 gap-2.5 items-end">
              <div>
                <label className="text-[11px] font-mono text-neutral-400 block mb-1">Business Email</label>
                <input
                  type="email"
                  required
                  value={newContactForm.email}
                  onChange={(e) => setNewContactForm({ ...newContactForm, email: e.target.value })}
                  placeholder="user@company.com"
                  className="w-full p-2 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-neutral-400 block mb-1">First Name</label>
                <input
                  type="text"
                  value={newContactForm.firstName}
                  onChange={(e) => setNewContactForm({ ...newContactForm, firstName: e.target.value })}
                  placeholder="Sarah"
                  className="w-full p-2 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-neutral-400 block mb-1">Company</label>
                <input
                  type="text"
                  value={newContactForm.company}
                  onChange={(e) => setNewContactForm({ ...newContactForm, company: e.target.value })}
                  placeholder="Acme SaaS"
                  className="w-full p-2 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-neutral-400 block mb-1">Smart Tags (comma sep)</label>
                <input
                  type="text"
                  value={newContactForm.tagsInput}
                  onChange={(e) => setNewContactForm({ ...newContactForm, tagsInput: e.target.value })}
                  placeholder="SaaS Onboarding, Pro Plan"
                  className="w-full p-2 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs"
                />
              </div>
              <button
                type="submit"
                className="py-2 px-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Subscriber</span>
              </button>
            </form>

            <div className="lg:col-span-3">
              <label className="text-[11px] font-mono text-neutral-400 block mb-1">Search Audience</label>
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-neutral-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                  placeholder="Search email, company, tag..."
                  className="w-full pl-8 pr-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* High-Density Audience Data Table */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 bg-neutral-950/60 text-neutral-400 font-mono text-[11px]">
                    <th className="py-3 px-4">Subscriber</th>
                    <th className="py-3 px-4">Company</th>
                    <th className="py-3 px-4">SaaS App & Plan</th>
                    <th className="py-3 px-4">Smart Tags</th>
                    <th className="py-3 px-4 text-right">Added</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/70">
                  {filteredContacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-neutral-900/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{contact.firstName}</div>
                        <div className="font-mono text-neutral-400 text-[11px]">{contact.email}</div>
                      </td>
                      <td className="py-3 px-4 text-neutral-300">{contact.company}</td>
                      <td className="py-3 px-4 text-neutral-300">
                        <span>{contact.appName}</span>
                        <span aria-hidden="true" className="text-neutral-600"> · </span>
                        <span className="font-mono text-emerald-400">{contact.planTier}</span>
                      </td>
                      <td className="py-3 px-4 text-neutral-300">
                        {contact.tags.join(' · ')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-neutral-400">
                        {contact.addedAt}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() =>
                            setContacts((prev) => prev.filter((c) => c.id !== contact.id))
                          }
                          className="text-neutral-500 hover:text-red-400 transition-colors p-1"
                          title="Remove Contact"
                        >
                          <Trash2 className="h-3.5 w-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredContacts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-neutral-400">
                        No contacts match this Smart Tag filter. Click "Import CSV Contacts" to add subscribers.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: BROADCAST CAMPAIGNS                                     */}
      {/* ============================================================== */}
      {activeTab === 'broadcasts' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">
                Dispatched & Scheduled Business Email Broadcasts
              </h3>
              <p className="text-xs text-neutral-400">
                Campaigns sent from your Business Email SMTP server to segmented SaaS user cohorts.
              </p>
            </div>
            <button
              onClick={() => {
                setCampaignTitle('');
                setTestSent(false);
                setDispatchModalOpen(true);
              }}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Business Broadcast</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {broadcasts.map((b) => (
              <div
                key={b.id}
                className="flex flex-col justify-between rounded-xl border border-neutral-800 bg-neutral-900/40 p-5 space-y-4 hover:border-neutral-700 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span className="font-mono text-emerald-400 uppercase font-semibold">
                      {b.appName || activeApp.name} · {b.type.replace('-', ' ')}
                    </span>
                    <span className="font-mono text-neutral-300">
                      {b.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white line-clamp-1">{b.title}</h4>
                    <p className="text-xs text-neutral-300 mt-1 font-mono line-clamp-1">
                      Subject: {b.subjectLine}
                    </p>
                    <p className="text-xs text-neutral-400 mt-1 line-clamp-2">{b.previewText}</p>
                  </div>

                  <div className="text-[11px] font-mono text-neutral-400 space-y-1">
                    <div>
                      Segment: <span className="text-neutral-200">{b.audienceSegment}</span>
                    </div>
                    <div>
                      Recipients:{' '}
                      <strong className="text-white tabular-nums">
                        {b.recipientsCount.toLocaleString()}
                      </strong>
                    </div>
                    {b.deliveryVia && (
                      <div>
                        Via: <span className="text-emerald-400">{b.deliveryVia}</span>
                      </div>
                    )}
                  </div>
                </div>

                {b.status === 'sent' ? (
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-neutral-800 text-center font-mono text-xs tabular-nums">
                    <div>
                      <span className="text-[10px] text-neutral-500">OPEN RATE</span>
                      <div className="font-bold text-emerald-400">{b.openRate}%</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500">CTR</span>
                      <div className="font-bold text-white">{b.ctr}%</div>
                    </div>
                  </div>
                ) : b.status === 'pending_approval' ? (
                  <div className="pt-3 border-t border-neutral-800">
                    <button
                      onClick={() => onNavigate('approvals')}
                      className="w-full py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/30 transition-colors text-center"
                    >
                      Review in Approval Gate →
                    </button>
                  </div>
                ) : (
                  <div className="pt-3 border-t border-neutral-800 text-center text-xs font-mono text-neutral-400">
                    Scheduled for Business SMTP delivery
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: AUTOMATED SEQUENCES WORKFLOWS                           */}
      {/* ============================================================== */}
      {activeTab === 'sequences' && (
        <div className="space-y-6">
          {/* 1-Click SaaS Sequence Recipes Bar */}
          <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                <Sparkles className="h-3.5 w-3.5" />
                <span>1-CLICK SAAS AUTOMATED SEQUENCE RECIPES</span>
              </div>
              <h3 className="text-sm font-bold text-white mt-0.5">
                Launch Multi-Step Onboarding or Feature Release Sequences via Business SMTP
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleCreateSequenceFromRecipe('onboarding')}
                className="px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>7-Day Trial Onboarding</span>
              </button>
              <button
                type="button"
                onClick={() => handleCreateSequenceFromRecipe('feature-release')}
                className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs border border-neutral-700 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
              >
                <Plus className="h-3.5 w-3.5 text-emerald-400" />
                <span>Feature Release Sequence</span>
              </button>
              <button
                type="button"
                onClick={() => handleCreateSequenceFromRecipe('re-engagement')}
                className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs border border-neutral-700 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
              >
                <Plus className="h-3.5 w-3.5 text-emerald-400" />
                <span>Trial Win-Back Flow</span>
              </button>
            </div>
          </div>

          {/* Scannable Sequence Selector Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sequences.map((seq) => {
              const isCurrent = activeSequence?.id === seq.id;
              return (
                <div
                  key={seq.id}
                  onClick={() => setActiveSequence(seq)}
                  className={`cursor-pointer rounded-xl border p-4 transition-all flex flex-col justify-between space-y-3 ${
                    isCurrent
                      ? 'bg-neutral-900 border-emerald-400 ring-1 ring-emerald-400/20'
                      : 'bg-neutral-900/40 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span
                        className={
                          seq.status === 'active'
                            ? 'text-emerald-400 font-bold'
                            : 'text-amber-400 font-bold'
                        }
                      >
                        ● {seq.status.toUpperCase()}
                      </span>
                      <span className="text-neutral-400 tabular-nums">
                        {seq.steps.length} Steps
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white line-clamp-1">{seq.name}</h4>
                    <p className="text-xs text-neutral-400 line-clamp-1">
                      Trigger: {seq.triggerEvent}
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-neutral-800/80 flex items-center justify-between text-[11px] font-mono tabular-nums text-neutral-400">
                    <span>
                      Enrolled: <strong className="text-white">{seq.overallMetrics.enrolled}</strong>
                    </span>
                    <span>
                      Open: <strong className="text-emerald-400">{seq.overallMetrics.avgOpenRate}%</strong>
                    </span>
                    <span>
                      CTR: <strong className="text-white">{seq.overallMetrics.avgClickRate}%</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Unified User-Friendly Sequence Builder */}
          {activeSequence ? (
            <VisualSequenceBuilder
              key={activeSequence.id}
              sequence={activeSequence}
              templates={templates}
              contacts={filteredContacts}
              smartTags={allSmartTags}
              activeAppName={activeApp.name}
              smtpFromEmail={smtpConfig.fromEmail}
              onUpdateSequence={handleUpdateSequence}
              onEditTemplate={(tpl) => {
                setEditingTemplate({ ...tpl });
                setEditorMode('visual');
              }}
              onSendTestTemplate={(tpl) => handleSendTestViaSmtp(tpl)}
              onOpenApproval={handleOpenApprovalForSequence}
            />
          ) : (
            <div className="p-12 text-center border border-dashed border-neutral-800 rounded-2xl bg-neutral-900/30 space-y-3">
              <Mail className="h-8 w-8 text-neutral-500 mx-auto" />
              <h4 className="text-base font-bold text-white">No Email Sequences Active</h4>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                Click one of the SaaS recipe buttons above to create your first automated drip campaign.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: BUSINESS EMAIL CUSTOM SMTP SERVER CONFIGURATION         */}
      {/* ============================================================== */}
      {activeTab === 'smtp' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 7 Columns: SMTP Credentials Form */}
          <div className="lg:col-span-7 p-6 rounded-xl border border-neutral-800 bg-neutral-900/40 space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                  <Server className="h-4 w-4" />
                  <span>Direct Business Email SMTP Integration</span>
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Configure Your Business Email SMTP Server
                </h3>
                <p className="text-xs text-neutral-400">
                  Connect cPanel Business Mail, Google Workspace, Zoho Mail, Namecheap PrivateEmail, or any custom domain SMTP server.
                </p>
              </div>
            </div>

            {/* Quick Provider Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono text-neutral-400">
                1-CLICK SMTP SERVER PRESETS:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Custom Domain / cPanel', host: 'mail.yourdomain.com', port: 465, secure: true },
                  { label: 'Google Workspace SMTP', host: 'smtp.gmail.com', port: 587, secure: false },
                  { label: 'Zoho Business Mail', host: 'smtp.zoho.com', port: 465, secure: true },
                  { label: 'Namecheap PrivateEmail', host: 'mail.privateemail.com', port: 465, secure: true },
                  { label: 'Microsoft 365 / Outlook', host: 'smtp.office365.com', port: 587, secure: false }
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() =>
                      setSmtpConfig((prev) => ({
                        ...prev,
                        host: preset.host,
                        port: preset.port,
                        secure: preset.secure
                      }))
                    }
                    className="px-2.5 py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-xs font-mono transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="text-neutral-400 font-mono block mb-1">SMTP Hostname</label>
                <input
                  type="text"
                  value={smtpConfig.host}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                  placeholder="smtp.yourdomain.com"
                  className="w-full p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-neutral-400 font-mono block mb-1">SMTP Port</label>
                <select
                  value={smtpConfig.port}
                  onChange={(e) => {
                    const port = Number(e.target.value);
                    setSmtpConfig({ ...smtpConfig, port, secure: port === 465 });
                  }}
                  className="w-full p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white font-mono text-xs"
                >
                  <option value={587}>587 (STARTTLS)</option>
                  <option value={465}>465 (SSL / TLS)</option>
                  <option value={2525}>2525 (Alternative)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-neutral-400 font-mono block mb-1">
                  Business Email Username
                </label>
                <input
                  type="email"
                  value={smtpConfig.user}
                  onChange={(e) =>
                    setSmtpConfig({
                      ...smtpConfig,
                      user: e.target.value,
                      fromEmail: e.target.value
                    })
                  }
                  placeholder="hello@yourdomain.com"
                  className="w-full p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-neutral-400 font-mono block mb-1">
                  SMTP Password / App Password
                </label>
                <input
                  type="password"
                  value={smtpConfig.pass}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, pass: e.target.value })}
                  placeholder="••••••••••••••••"
                  className="w-full p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="text-neutral-400 font-mono block mb-1">Sender Display Name</label>
                <input
                  type="text"
                  value={smtpConfig.fromName}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, fromName: e.target.value })}
                  placeholder="Serpely Product Team"
                  className="w-full p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs"
                />
              </div>
              <div>
                <label className="text-neutral-400 font-mono block mb-1">From Business Email</label>
                <input
                  type="email"
                  value={smtpConfig.fromEmail}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, fromEmail: e.target.value })}
                  placeholder="hello@yourdomain.com"
                  className="w-full p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-neutral-400 font-mono block mb-1">Reply-To Address</label>
                <input
                  type="email"
                  value={smtpConfig.replyTo}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, replyTo: e.target.value })}
                  placeholder="support@yourdomain.com"
                  className="w-full p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white font-mono text-xs"
                />
              </div>
            </div>

            {smtpStatusMsg && (
              <div
                className={`p-3.5 rounded-xl border text-xs font-mono flex items-start gap-2.5 ${
                  smtpStatusMsg.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : smtpStatusMsg.type === 'warning'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    : 'bg-red-500/10 border-red-500/30 text-red-300'
                }`}
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{smtpStatusMsg.text}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-800">
              <button
                type="button"
                onClick={handleVerifySmtp}
                disabled={smtpVerifying}
                className="px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-neutral-950 font-bold text-xs transition-colors flex items-center gap-2"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>{smtpVerifying ? 'Testing SMTP Handshake...' : 'Verify & Save SMTP Connection'}</span>
              </button>

              <span className="text-[11px] font-mono text-neutral-500">
                Also configurable in `.env` via `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`
              </span>
            </div>
          </div>

          {/* Right 5 Columns: Live Test Dispatch & Deliverability Checklist */}
          <div className="lg:col-span-5 space-y-5">
            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/40 space-y-4">
              <h4 className="text-sm font-bold text-white">Send Live SMTP Test Email</h4>
              <p className="text-xs text-neutral-400">
                Send a sample SaaS onboarding email through your configured Business SMTP server to verify inbox placement and HTML rendering.
              </p>
              <div className="space-y-2">
                <label className="text-xs font-mono text-neutral-400 block">
                  Test Recipient Email
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={smtpTestRecipient}
                    onChange={(e) => setSmtpTestRecipient(e.target.value)}
                    placeholder="you@yourdomain.com"
                    className="flex-1 p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendTestViaSmtp()}
                    disabled={sendingTestEmail}
                    className="px-4 py-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs border border-neutral-700 whitespace-nowrap shrink-0"
                  >
                    {sendingTestEmail ? 'Sending...' : 'Send Test'}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/40 space-y-3">
              <h4 className="text-sm font-bold text-white">
                Business Domain Deliverability Checklist
              </h4>
              <ul className="space-y-2.5 text-xs text-neutral-300">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>SPF Record:</strong> Authorize your SMTP server hostname in your domain DNS TXT record.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>DKIM Signing:</strong> Enable 2048-bit DKIM signing in cPanel / Google Workspace / Zoho so SaaS onboarding emails land in Primary Inbox.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Dynamic Personalization:</strong> Merge variables (`{'{{first_name}}'}`, `{'{{company}}'}`, `{'{{app_name}}'}`) are replaced per recipient automatically.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: 3-IN-1 VISUAL BLOCK + CUSTOM HTML TEMPLATE EDITOR     */}
      {/* ============================================================== */}
      {editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-6xl rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-5 shadow-2xl my-8">
            {/* Modal Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 pb-4">
              <div>
                <span className="text-xs font-mono text-emerald-400">
                  EMAIL TEMPLATE STUDIO
                </span>
                <h3 className="text-base font-bold text-white">{editingTemplate.name}</h3>
              </div>

              {/* Mode Switcher + Desktop/Mobile Toggle */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center bg-neutral-900 p-1 rounded-lg border border-neutral-800 text-xs">
                  <button
                    onClick={() => setEditorMode('visual')}
                    className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-colors ${
                      editorMode === 'visual'
                        ? 'bg-emerald-500 text-neutral-950 font-bold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Sliders className="h-3.5 w-3.5" />
                    <span>Visual Block Editor</span>
                  </button>
                  <button
                    onClick={() => {
                      if (!editingTemplate.htmlCode) {
                        setEditingTemplate(handleSyncBlocksToHtml(editingTemplate));
                      }
                      setEditorMode('html');
                    }}
                    className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-colors ${
                      editorMode === 'html'
                        ? 'bg-emerald-500 text-neutral-950 font-bold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Code2 className="h-3.5 w-3.5" />
                    <span>Custom HTML Code</span>
                  </button>
                </div>

                {/* Desktop vs Mobile Preview Toggle */}
                <div className="flex items-center gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-lg">
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    className={`p-1.5 rounded ${
                      previewDevice === 'desktop' ? 'bg-neutral-800 text-white' : 'text-neutral-500'
                    }`}
                    title="Desktop Preview"
                  >
                    <Monitor className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPreviewDevice('mobile')}
                    className={`p-1.5 rounded ${
                      previewDevice === 'mobile' ? 'bg-neutral-800 text-white' : 'text-neutral-500'
                    }`}
                    title="Mobile Preview"
                  >
                    <Smartphone className="h-4 w-4" />
                  </button>
                </div>

                <button
                  onClick={() => setEditingTemplate(null)}
                  className="p-1.5 text-neutral-400 hover:text-white rounded-md hover:bg-neutral-900"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* 2-Column Split: Editor (Left) + Live Email Client Preview (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* LEFT PANE: VISUAL BLOCKS OR HTML SOURCE CODE */}
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                {/* 1-Click Merge Variable Bar */}
                <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 space-y-1.5">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">
                    1-Click Dynamic SaaS Variables:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      '{{first_name}}',
                      '{{company}}',
                      '{{app_name}}',
                      '{{plan_tier}}',
                      '{{feature_name}}',
                      '{{cta_url}}'
                    ].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => insertVariable(tag)}
                        className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-950 text-neutral-300 hover:text-emerald-300 border border-neutral-800 hover:border-emerald-500/40 transition-colors"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {editorMode === 'visual' ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="sm:col-span-2">
                        <label className="text-neutral-400 font-mono block mb-1">Template Name</label>
                        <input
                          type="text"
                          value={editingTemplate.name}
                          onChange={(e) =>
                            setEditingTemplate({ ...editingTemplate, name: e.target.value })
                          }
                          className="w-full p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-neutral-400 font-mono block mb-1">Category</label>
                        <select
                          value={editingTemplate.category}
                          onChange={(e) =>
                            setEditingTemplate({
                              ...editingTemplate,
                              category: e.target.value as EmailTemplate['category']
                            })
                          }
                          className="w-full p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-xs"
                        >
                          <option value="onboarding">SaaS Onboarding</option>
                          <option value="feature-update">Feature Update</option>
                          <option value="nurture">Trial Conversion</option>
                          <option value="announcement">Announcement</option>
                          <option value="re-engagement">Re-engagement</option>
                        </select>
                      </div>
                    </div>

                    <div className="text-xs space-y-1">
                      <label className="text-neutral-400 font-mono block">Subject Line</label>
                      <input
                        type="text"
                        value={editingTemplate.subjectLine}
                        onChange={(e) =>
                          setEditingTemplate({ ...editingTemplate, subjectLine: e.target.value })
                        }
                        className="w-full p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-xs font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                      <div className="sm:col-span-2">
                        <label className="text-neutral-400 font-mono block mb-1">
                          Preheader Preview Snippet
                        </label>
                        <input
                          type="text"
                          value={editingTemplate.preheader}
                          onChange={(e) =>
                            setEditingTemplate(
                              handleSyncBlocksToHtml({
                                ...editingTemplate,
                                preheader: e.target.value
                              })
                            )
                          }
                          className="w-full p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-neutral-400 font-mono block mb-1">Serpely Logo</label>
                        <select
                          value={editingTemplate.logoText === 'Serpely-White' ? 'Serpely-White' : 'Serpely'}
                          onChange={(e) =>
                            setEditingTemplate(
                              handleSyncBlocksToHtml({
                                ...editingTemplate,
                                logoText: e.target.value
                              })
                            )
                          }
                          className="w-full p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-xs"
                        >
                          <option value="Serpely">Green & White</option>
                          <option value="Serpely-White">All White</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-neutral-400 font-mono block mb-1">Brand Accent</label>
                        <input
                          type="color"
                          value={editingTemplate.accentColor || '#17c964'}
                          onChange={(e) =>
                            setEditingTemplate(
                              handleSyncBlocksToHtml({
                                ...editingTemplate,
                                accentColor: e.target.value
                              })
                            )
                          }
                          className="w-full h-9 rounded-lg bg-neutral-900 border border-neutral-800 cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="text-xs space-y-1">
                      <label className="text-neutral-400 font-mono block">
                        Main Heading (e.g. &ldquo;Welcome to Serpely!&rdquo; or &ldquo;Confirm your email&rdquo;)
                      </label>
                      <input
                        type="text"
                        value={editingTemplate.headerTitle}
                        onChange={(e) =>
                          setEditingTemplate(
                            handleSyncBlocksToHtml({
                              ...editingTemplate,
                              headerTitle: e.target.value
                            })
                          )
                        }
                        className="w-full p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-xs font-bold"
                      />
                    </div>

                    <div className="text-xs space-y-1">
                      <label className="text-neutral-400 font-mono block">
                        Email Body Copy (Paragraphs)
                      </label>
                      <textarea
                        rows={4}
                        value={editingTemplate.bodyContent}
                        onChange={(e) =>
                          setEditingTemplate(
                            handleSyncBlocksToHtml({
                              ...editingTemplate,
                              bodyContent: e.target.value
                            })
                          )
                        }
                        className="w-full p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-xs leading-relaxed"
                      />
                    </div>

                    {/* 3-Step Numbered Checklist Block (Welcome to Serpely style) */}
                    <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">
                          Numbered Checklist Block (1 · 2 · 3 Steps)
                        </span>
                        {editingTemplate.stepsList && editingTemplate.stepsList.length > 0 ? (
                          <button
                            type="button"
                            onClick={() =>
                              setEditingTemplate(
                                handleSyncBlocksToHtml({
                                  ...editingTemplate,
                                  stepsList: undefined
                                })
                              )
                            }
                            className="text-[11px] font-mono text-neutral-400 hover:text-red-400"
                          >
                            Remove Checklist
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              setEditingTemplate(
                                handleSyncBlocksToHtml({
                                  ...editingTemplate,
                                  stepsList: [
                                    {
                                      title: 'Add your website',
                                      description: 'So Serpely knows what to look after.',
                                      duration: '1 min'
                                    },
                                    {
                                      title: 'Connect Google Search Console',
                                      description: 'Clicks, impressions and the queries you rank for.',
                                      duration: '1 min'
                                    },
                                    {
                                      title: 'Connect Google Analytics',
                                      description: 'Sessions and conversions, side by side with search.',
                                      duration: '1 min'
                                    }
                                  ]
                                })
                              )
                            }
                            className="text-[11px] font-mono text-emerald-400 hover:underline"
                          >
                            + Add 3-Step Checklist
                          </button>
                        )}
                      </div>

                      {editingTemplate.stepsList &&
                        editingTemplate.stepsList.map((step, sIdx) => (
                          <div
                            key={sIdx}
                            className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 space-y-1.5"
                          >
                            <div className="grid grid-cols-12 gap-2 items-center">
                              <span className="col-span-1 font-mono font-bold text-emerald-400 text-center">
                                {sIdx + 1}
                              </span>
                              <input
                                type="text"
                                placeholder="Step title"
                                value={step.title}
                                onChange={(e) => {
                                  const nextSteps = [...(editingTemplate.stepsList || [])];
                                  nextSteps[sIdx] = { ...nextSteps[sIdx], title: e.target.value };
                                  setEditingTemplate(
                                    handleSyncBlocksToHtml({
                                      ...editingTemplate,
                                      stepsList: nextSteps
                                    })
                                  );
                                }}
                                className="col-span-8 p-1.5 rounded bg-neutral-900 border border-neutral-800 text-white text-xs font-semibold"
                              />
                              <input
                                type="text"
                                placeholder="1 min"
                                value={step.duration || ''}
                                onChange={(e) => {
                                  const nextSteps = [...(editingTemplate.stepsList || [])];
                                  nextSteps[sIdx] = { ...nextSteps[sIdx], duration: e.target.value };
                                  setEditingTemplate(
                                    handleSyncBlocksToHtml({
                                      ...editingTemplate,
                                      stepsList: nextSteps
                                    })
                                  );
                                }}
                                className="col-span-3 p-1.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 text-[11px] font-mono text-right"
                              />
                            </div>
                            <input
                              type="text"
                              placeholder="Step description"
                              value={step.description}
                              onChange={(e) => {
                                const nextSteps = [...(editingTemplate.stepsList || [])];
                                nextSteps[sIdx] = {
                                  ...nextSteps[sIdx],
                                  description: e.target.value
                                };
                                setEditingTemplate(
                                  handleSyncBlocksToHtml({
                                    ...editingTemplate,
                                    stepsList: nextSteps
                                  })
                                );
                              }}
                              className="w-full p-1.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs"
                            />
                          </div>
                        ))}
                    </div>

                    {/* Primary Green CTA Button */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-neutral-400 font-mono block mb-1">
                          Green CTA Button Text
                        </label>
                        <input
                          type="text"
                          value={editingTemplate.ctaText}
                          onChange={(e) =>
                            setEditingTemplate(
                              handleSyncBlocksToHtml({
                                ...editingTemplate,
                                ctaText: e.target.value
                              })
                            )
                          }
                          className="w-full p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-neutral-400 font-mono block mb-1">
                          CTA Destination URL
                        </label>
                        <input
                          type="text"
                          value={editingTemplate.ctaUrl}
                          onChange={(e) =>
                            setEditingTemplate(
                              handleSyncBlocksToHtml({
                                ...editingTemplate,
                                ctaUrl: e.target.value
                              })
                            )
                          }
                          className="w-full p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-xs font-mono"
                        />
                      </div>
                    </div>

                    {/* Post-CTA Note & Fallback Verification Link */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-neutral-400 font-mono block mb-1">
                          Post-CTA Note (Below Button)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. This link expires in 30 minutes..."
                          value={editingTemplate.postCtaText || ''}
                          onChange={(e) =>
                            setEditingTemplate(
                              handleSyncBlocksToHtml({
                                ...editingTemplate,
                                postCtaText: e.target.value
                              })
                            )
                          }
                          className="w-full p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-neutral-400 font-mono block mb-1">
                          Fallback Browser Link (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="https://app.serpely.com/verify?token=..."
                          value={editingTemplate.fallbackUrl || ''}
                          onChange={(e) =>
                            setEditingTemplate(
                              handleSyncBlocksToHtml({
                                ...editingTemplate,
                                fallbackUrl: e.target.value || undefined
                              })
                            )
                          }
                          className="w-full p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-emerald-300 text-xs font-mono"
                        />
                      </div>
                    </div>

                    {/* Info / Security Callout Box (e.g. "Didn't sign up for Serpely?") */}
                    <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">
                          Soft Callout / Security Note Box
                        </span>
                        {editingTemplate.infoBox ? (
                          <button
                            type="button"
                            onClick={() =>
                              setEditingTemplate(
                                handleSyncBlocksToHtml({
                                  ...editingTemplate,
                                  infoBox: undefined
                                })
                              )
                            }
                            className="text-[11px] font-mono text-neutral-400 hover:text-red-400"
                          >
                            Remove Box
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              setEditingTemplate(
                                handleSyncBlocksToHtml({
                                  ...editingTemplate,
                                  infoBox: {
                                    title: "Didn't sign up for Serpely?",
                                    description:
                                      'You can safely ignore this email. Someone may have entered your address by mistake.'
                                  }
                                })
                              )
                            }
                            className="text-[11px] font-mono text-emerald-400 hover:underline"
                          >
                            + Add Callout Box
                          </button>
                        )}
                      </div>
                      {editingTemplate.infoBox && (
                        <div className="space-y-1.5">
                          <input
                            type="text"
                            placeholder="Callout title"
                            value={editingTemplate.infoBox.title}
                            onChange={(e) =>
                              setEditingTemplate(
                                handleSyncBlocksToHtml({
                                  ...editingTemplate,
                                  infoBox: {
                                    ...editingTemplate.infoBox!,
                                    title: e.target.value
                                  }
                                })
                              )
                            }
                            className="w-full p-2 rounded bg-neutral-950 border border-neutral-800 text-white text-xs font-semibold"
                          />
                          <input
                            type="text"
                            placeholder="Callout description"
                            value={editingTemplate.infoBox.description}
                            onChange={(e) =>
                              setEditingTemplate(
                                handleSyncBlocksToHtml({
                                  ...editingTemplate,
                                  infoBox: {
                                    ...editingTemplate.infoBox!,
                                    description: e.target.value
                                  }
                                })
                              )
                            }
                            className="w-full p-2 rounded bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs"
                          />
                        </div>
                      )}
                    </div>

                    {/* Sign-Off Block (e.g. Romeo / from Serpely or The Serpely team) */}
                    <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2 text-xs">
                      <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold block">
                        Personal / Team Sign-Off
                      </span>
                      <input
                        type="text"
                        placeholder="Optional reply note (e.g. Questions or feedback? Just reply to this email.)"
                        value={editingTemplate.signOffNote || ''}
                        onChange={(e) =>
                          setEditingTemplate(
                            handleSyncBlocksToHtml({
                              ...editingTemplate,
                              signOffNote: e.target.value || undefined
                            })
                          )
                        }
                        className="w-full p-2 rounded bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Sign-off Name (e.g. Romeo or The Serpely team)"
                          value={editingTemplate.signOffName || ''}
                          onChange={(e) =>
                            setEditingTemplate(
                              handleSyncBlocksToHtml({
                                ...editingTemplate,
                                signOffName: e.target.value
                              })
                            )
                          }
                          className="w-full p-2 rounded bg-neutral-950 border border-neutral-800 text-white text-xs font-bold"
                        />
                        <input
                          type="text"
                          placeholder="Role (e.g. from Serpely)"
                          value={editingTemplate.signOffRole || ''}
                          onChange={(e) =>
                            setEditingTemplate(
                              handleSyncBlocksToHtml({
                                ...editingTemplate,
                                signOffRole: e.target.value || undefined
                              })
                            )
                          }
                          className="w-full p-2 rounded bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  /* CUSTOM HTML SOURCE CODE EDITOR */
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-mono text-neutral-300">
                        Responsive HTML Email Source Code
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setEditingTemplate(handleSyncBlocksToHtml(editingTemplate))
                          }
                          className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-mono"
                        >
                          Regenerate HTML from Visual Blocks
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(editingTemplate.htmlCode || '');
                            setHtmlCopied(true);
                            setTimeout(() => setHtmlCopied(false), 2000);
                          }}
                          className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono flex items-center gap-1"
                        >
                          <Copy className="h-3 w-3" />
                          <span>{htmlCopied ? 'Copied!' : 'Copy HTML'}</span>
                        </button>
                      </div>
                    </div>
                    <textarea
                      rows={20}
                      value={editingTemplate.htmlCode || ''}
                      onChange={(e) =>
                        setEditingTemplate({ ...editingTemplate, htmlCode: e.target.value })
                      }
                      className="w-full p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-emerald-300 font-mono text-xs leading-relaxed"
                      spellCheck={false}
                    />
                  </div>
                )}
              </div>

              {/* RIGHT PANE: LIVE RENDERED EMAIL CLIENT PREVIEW */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                  <span>
                    LIVE EMAIL PREVIEW ({previewDevice.toUpperCase()} ·{' '}
                    {(editingTemplate.themeMode || 'light').toUpperCase()})
                  </span>
                  <span className="text-[11px] text-emerald-400">
                    From: {smtpConfig.fromName} &lt;{smtpConfig.fromEmail}&gt;
                  </span>
                </div>

                <div
                  className={`mx-auto rounded-xl border border-neutral-700 bg-white text-neutral-900 shadow-xl overflow-hidden transition-all duration-200 ${
                    previewDevice === 'mobile' ? 'max-w-[375px]' : 'w-full'
                  }`}
                >
                  {/* Simulated Inbox Header */}
                  <div className="bg-neutral-100 border-b border-neutral-200 px-4 py-2.5 text-xs space-y-1">
                    <div className="font-bold text-neutral-900 truncate">
                      {applySampleVariables(editingTemplate.subjectLine)}
                    </div>
                    <div className="text-[11px] text-neutral-500 truncate">
                      To: {filteredContacts[0]?.email || 'alex@neoledger.io'} ·{' '}
                      {applySampleVariables(editingTemplate.preheader)}
                    </div>
                  </div>

                  {/* Live HTML Iframe Preview */}
                  <iframe
                    title="Live Email Preview"
                    srcDoc={applySampleVariables(
                      editingTemplate.htmlCode ||
                        buildResponsiveEmailHtml({
                          appName: activeApp.name,
                          themeMode: editingTemplate.themeMode || 'light',
                          headerTitle: editingTemplate.headerTitle,
                          preheader: editingTemplate.preheader,
                          bodyContent: editingTemplate.bodyContent,
                          stepsList: editingTemplate.stepsList,
                          postCtaText: editingTemplate.postCtaText,
                          infoBox: editingTemplate.infoBox,
                          fallbackUrl: editingTemplate.fallbackUrl,
                          signOffNote: editingTemplate.signOffNote,
                          signOffName: editingTemplate.signOffName,
                          signOffRole: editingTemplate.signOffRole,
                          footerReason: editingTemplate.footerReason,
                          highlightBox: editingTemplate.highlightBox,
                          ctaText: editingTemplate.ctaText,
                          ctaUrl: editingTemplate.ctaUrl,
                          accentColor: editingTemplate.accentColor || '#17c964'
                        })
                    )}
                    className="w-full h-[580px] border-0 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-neutral-800 pt-4">
              <button
                type="button"
                onClick={() => handleSendTestViaSmtp(editingTemplate)}
                disabled={sendingTestEmail}
                className="px-4 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-semibold border border-neutral-800 transition-colors flex items-center gap-2"
              >
                <Send className="h-3.5 w-3.5 text-emerald-400" />
                <span>{sendingTestEmail ? 'Sending Test...' : 'Send Test via Business SMTP'}</span>
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setEditingTemplate(null)}
                  className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTemplate}
                  className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold flex items-center gap-1.5"
                >
                  <Check className="h-4 w-4" />
                  <span>Save Template</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: AUDIENCE CSV IMPORT MODAL                             */}
      {/* ============================================================== */}
      {csvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <span className="text-xs font-mono text-emerald-400">
                  AUDIENCE CSV IMPORTER & SMART TAGGER
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Import SaaS Subscribers via CSV File or Paste
                </h3>
              </div>
              <button
                onClick={() => setCsvModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                <div>
                  <div className="font-semibold text-white">Upload a `.csv` file from your computer</div>
                  <div className="text-neutral-400 font-mono text-[11px]">
                    Columns: email, first_name, company, app_name, plan_tier, tags (separated by |)
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleCsvFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-semibold border border-neutral-700 flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Choose .CSV File</span>
                </button>
              </div>

              <div>
                <label className="text-neutral-400 font-mono block mb-1">
                  Or Paste / Edit CSV Rows Directly:
                </label>
                <textarea
                  rows={7}
                  value={csvRawText}
                  onChange={(e) => setCsvRawText(e.target.value)}
                  className="w-full p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-emerald-300 font-mono text-xs leading-relaxed"
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-neutral-800 pt-4">
              <button
                type="button"
                onClick={handleDownloadSampleCsv}
                className="text-xs font-mono text-emerald-400 hover:underline flex items-center gap-1"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Sample CSV</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCsvModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImportCsvContacts}
                  className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Import & Tag Contacts</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: SEND BUSINESS EMAIL CAMPAIGN MODAL                    */}
      {/* ============================================================== */}
      {dispatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-xl rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <span className="text-xs font-mono text-emerald-400">
                  BUSINESS SMTP CAMPAIGN DISPATCHER
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Launch Multi-App Email Campaign
                </h3>
              </div>
              <button
                onClick={() => setDispatchModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between font-mono text-[11px]">
                <span className="text-neutral-400">
                  Sender: <strong className="text-white">{smtpConfig.fromName}</strong> &lt;{smtpConfig.fromEmail}&gt;
                </span>
                <span className="text-emerald-400">{smtpConfig.host}:{smtpConfig.port}</span>
              </div>

              <div>
                <label className="text-neutral-400 font-mono block mb-1">Campaign Title</label>
                <input
                  type="text"
                  placeholder={`e.g. ${activeApp.name} Onboarding & Feature Release`}
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 font-mono block mb-1">Select Email Template</label>
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-xs"
                  >
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-neutral-400 font-mono block mb-1">
                    Target Smart Tag Segment
                  </label>
                  <select
                    value={dispatchTargetTag}
                    onChange={(e) => setDispatchTargetTag(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-xs"
                  >
                    {allSmartTags.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 text-[11px] font-mono text-neutral-300 flex items-center justify-between">
                <span>Matched Subscribed Recipients:</span>
                <strong className="text-emerald-400 tabular-nums">
                  {dispatchRecipients.length} subscriber(s)
                </strong>
              </div>

              {/* Send Test Email First */}
              <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2">
                <label className="text-neutral-300 font-mono block font-semibold">
                  Send Test Preview via Business SMTP
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={testEmailAddress}
                    onChange={(e) => setTestEmailAddress(e.target.value)}
                    className="flex-1 p-2 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendTestViaSmtp()}
                    disabled={sendingTestEmail}
                    className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold border border-neutral-700 whitespace-nowrap"
                  >
                    {sendingTestEmail ? 'Sending...' : testSent ? '✓ Test Sent' : 'Send Test'}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-neutral-800">
              <button
                onClick={() => setDispatchModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDispatchCampaignViaSmtp(true)}
                  className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-amber-500/30 text-xs font-semibold"
                >
                  Queue for Approval
                </button>
                <button
                  type="button"
                  onClick={() => handleDispatchCampaignViaSmtp(false)}
                  disabled={dispatchSending}
                  className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-neutral-950 text-xs font-bold flex items-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{dispatchSending ? 'Sending via SMTP...' : 'Send Now via Business SMTP'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: ADD NEW SAAS / WEB APP PROFILE                        */}
      {/* ============================================================== */}
      {newAppModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <form
            onSubmit={handleCreateNewApp}
            className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-4 shadow-2xl text-xs"
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white">Add SaaS / Web App Profile</h3>
              <button
                type="button"
                onClick={() => setNewAppModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-neutral-400 font-mono block mb-1">App Name</label>
                <input
                  type="text"
                  required
                  value={newAppForm.name}
                  onChange={(e) => setNewAppForm({ ...newAppForm, name: e.target.value })}
                  placeholder="e.g. MetricFlow SaaS"
                  className="w-full p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 font-mono block mb-1">Category</label>
                  <select
                    value={newAppForm.category}
                    onChange={(e) =>
                      setNewAppForm({
                        ...newAppForm,
                        category: e.target.value as SaaSAppProfile['category']
                      })
                    }
                    className="w-full p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white"
                  >
                    <option value="SaaS Platform">SaaS Platform</option>
                    <option value="Web App">Web App</option>
                    <option value="Developer Tool">Developer Tool</option>
                    <option value="AI Product">AI Product</option>
                  </select>
                </div>
                <div>
                  <label className="text-neutral-400 font-mono block mb-1">App Domain</label>
                  <input
                    type="text"
                    value={newAppForm.domain}
                    onChange={(e) => setNewAppForm({ ...newAppForm, domain: e.target.value })}
                    placeholder="metricflow.io"
                    className="w-full p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 font-mono block mb-1">Sender Name</label>
                  <input
                    type="text"
                    value={newAppForm.senderName}
                    onChange={(e) => setNewAppForm({ ...newAppForm, senderName: e.target.value })}
                    placeholder="MetricFlow Team"
                    className="w-full p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 font-mono block mb-1">Business Sender Email</label>
                  <input
                    type="email"
                    value={newAppForm.senderEmail}
                    onChange={(e) => setNewAppForm({ ...newAppForm, senderEmail: e.target.value })}
                    placeholder="hello@metricflow.io"
                    className="w-full p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setNewAppModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold"
              >
                Save SaaS App
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 5: ADD SEQUENCE STEP                                     */}
      {/* ============================================================== */}
      {isAddingStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white">Add Automated Sequence Step</h3>
              <button
                onClick={() => setIsAddingStep(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-400 font-mono block mb-1">
                  Wait Delay (Days after previous step)
                </label>
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={newStepDelay}
                  onChange={(e) => setNewStepDelay(Number(e.target.value))}
                  className="w-full p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-neutral-400 font-mono block mb-1">Assign Template</label>
                <select
                  value={newStepTemplateId}
                  onChange={(e) => setNewStepTemplateId(e.target.value)}
                  className="w-full p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-xs"
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
              <button
                onClick={() => setIsAddingStep(false)}
                className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSequenceStep}
                className="px-4 py-2 rounded-lg bg-emerald-500 text-neutral-950 text-xs font-bold"
              >
                Add Step
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
