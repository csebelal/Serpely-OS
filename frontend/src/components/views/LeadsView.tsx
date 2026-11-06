import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  RefreshCw,
  CheckCircle2,
  Plus,
  Upload,
  Download,
  Webhook,
  Sparkles,
  Mail,
  Send,
  Copy,
  Check,
  Search,
  X,
  Building2,
  UserCheck,
  ArrowUpRight,
  FileSpreadsheet,
  Calendar
} from 'lucide-react';
import { LeadItem, ViewId, MeetingItem } from '../../types';
import { ScheduleMeetingModal } from '../meetings/ScheduleMeetingModal';
import { LeadsEmptyState, FilterResultsEmptyState } from '../common/EmptyState';
import { apiClient } from '../../services/apiClient';

interface LeadsViewProps {
  onNavigate: (view: ViewId) => void;
  onOpenCommand: () => void;
  leadsList?: LeadItem[];
  brandName?: string;
  onShowToast?: (msg: string) => void;
  onUpdateLeads?: (leads: LeadItem[]) => void;
  onStateSynced?: (state: any) => void;
}

const SEQUENCE_OPTIONS = [
  'Enterprise Buying Signal Fast-Track',
  'AI GEO Audit Follow-Up Sequence',
  'Competitor Migration Executive Nurture',
  'Product Walkthrough & Demo Cadence'
];

const SAMPLE_CSV_CONTENT = `name,company,role,email,source,message,score,signals
Nadia Islam,FinScale Cloud,VP of Growth,nadia@finscale.io,LinkedIn Comment,"Can your team provide an on-site infrastructure survey and proposal?",95,"Enterprise Survey;High Intent"
Tariq Mahmud,Vertex Commerce,Founder & CEO,tariq@vertexcommerce.com,Demo Request,"We want to upgrade our office network and CCTV systems with zero downtime.",92,"Office Upgrade;Network;Q4 Budget"
Elena Rostova,Kinetix AI,Head of Demand Gen,elena@kinetix.ai,Contact Form,"Evaluating proactive 24/7 SLA IT management to replace our legacy vendor.",89,"Vendor Migration;SLA;Active Evaluation"`;

export const LeadsView: React.FC<LeadsViewProps> = ({
  onNavigate,
  leadsList = [],
  brandName = 'Brand',
  onShowToast,
  onUpdateLeads,
  onStateSynced
}) => {
  const [leads, setLeads] = useState<LeadItem[]>(leadsList);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(leadsList[0] || null);
  const [isScanning, setIsScanning] = useState(false);

  // Modals: 'add' (Manual + CSV) | 'webhook' (Inbound Website Demo/Form Webhook) | null
  const [activeModal, setActiveModal] = useState<'add' | 'webhook' | null>(null);
  const [addTab, setAddTab] = useState<'manual' | 'csv'>('manual');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // Manual Lead Form State
  const [manualName, setManualName] = useState('');
  const [manualCompany, setManualCompany] = useState('');
  const [manualRole, setManualRole] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualSource, setManualSource] = useState<LeadItem['source']>('Demo Request');
  const [manualMessage, setManualMessage] = useState('');
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  // CSV Import State
  const [csvText, setCsvText] = useState(SAMPLE_CSV_CONTENT);

  // Webhook Simulator State
  const [whName, setWhName] = useState('Zayan Chowdhury');
  const [whCompany, setWhCompany] = useState('NovaStack Enterprise');
  const [whRole, setWhRole] = useState('VP of Marketing');
  const [whEmail, setWhEmail] = useState('zayan@novastack.io');
  const [whSource, setWhSource] = useState<LeadItem['source']>('Demo Request');
  const [whMessage, setWhMessage] = useState(
    `We are looking to deploy ${brandName} across 4 regional growth teams and need enterprise pricing + custom approval gates.`
  );
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);

  // Lead Inspector Outreach & Sequence State
  const [outreachChannel, setOutreachChannel] = useState<'Email' | 'LinkedIn DM'>('Email');
  const [draftSubject, setDraftSubject] = useState('');
  const [draftBody, setDraftBody] = useState('');
  const [isGeneratingOutreach, setIsGeneratingOutreach] = useState(false);
  const [selectedSequence, setSelectedSequence] = useState(SEQUENCE_OPTIONS[0]);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [copiedOutreach, setCopiedOutreach] = useState(false);

  useEffect(() => {
    setLeads(leadsList);
    if (selectedLead) {
      const updated = leadsList.find(l => l.id === selectedLead.id);
      if (updated) {
        setSelectedLead(updated);
      }
    } else if (leadsList[0]) {
      setSelectedLead(leadsList[0]);
    }
  }, [leadsList]);

  // Sync outreach draft fields when switching selected lead
  useEffect(() => {
    if (!selectedLead) return;
    if (selectedLead.outreachDraft) {
      setOutreachChannel(selectedLead.outreachDraft.channel);
      setDraftSubject(selectedLead.outreachDraft.subject);
      setDraftBody(selectedLead.outreachDraft.body);
    } else {
      const firstName = (selectedLead.name || 'Friend').split(' ')[0];
      const primarySignal = selectedLead.buyingSignals?.[0] || 'Infrastructure Modernization';
      const msgSnippet = (selectedLead.detectedMessage || selectedLead.notes || 'Inquired about technical services').slice(0, 85);
      const allSignals = (selectedLead.buyingSignals && selectedLead.buyingSignals.length > 0)
        ? selectedLead.buyingSignals.join(', ')
        : 'Enterprise Solutions';

      setDraftSubject(
        `${brandName} × ${selectedLead.company || 'Enterprise'}: Next steps on ${primarySignal}`
      );
      setDraftBody(
        `Hi ${firstName},\n\nNoticed your recent inquiry: "${msgSnippet}..."\n\nWe help teams like ${
          selectedLead.company || 'yours'
        } deploy ${allSignals} with full SLA guarantees and zero operational downtime.\n\nWould Tuesday or Thursday work for a 15-minute walkthrough?`
      );
    }
    if (selectedLead.enrolledSequence) {
      setSelectedSequence(selectedLead.enrolledSequence);
    }
  }, [selectedLead?.id, brandName]);

  const notify = (msg: string) => {
    if (onShowToast) onShowToast(msg);
  };

  const updateLeads = (next: LeadItem[]) => {
    setLeads(next);
    if (onUpdateLeads) onUpdateLeads(next);
  };

  // 1. Scan Buying Signals (Community Inbox + Connected Social Pages + AI Intent)
  const handleScanBuyingSignals = async () => {
    setIsScanning(true);
    try {
      const res = await apiClient.post('/api/leads/scan', {});
      if (res.success && res.data) {
        const data = res.data;
        if (data.state && onStateSynced) {
          onStateSynced(data.state);
        } else if (data.leads?.length) {
          updateLeads([...data.leads, ...leads]);
        }
        if (data.leads?.[0]) {
          setSelectedLead(data.leads[0]);
        }
        notify(
          `Scanned Community Inbox & Social Pages: ${
            data.leads?.length || 1
          } high-intent buying signal lead(s) added.`
        );
      }
    } catch (e) {
      console.error('Lead scan error:', e);
    } finally {
      setIsScanning(false);
    }
  };

  // 2. Manual Lead Creation (Scored via /api/leads/webhook)
  const handleCreateManualLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim() || !manualMessage.trim()) return;
    setIsSubmittingManual(true);
    try {
      const res = await apiClient.post('/api/leads/webhook', {
        name: manualName.trim(),
        company: manualCompany.trim() || 'Enterprise Prospect',
        role: manualRole.trim() || 'Growth Leader',
        email: manualEmail.trim(),
        source: manualSource,
        message: manualMessage.trim()
      });
      if (res.success && res.data) {
        const data = res.data;
        if (data.state && onStateSynced) {
          onStateSynced(data.state);
        } else if (data.lead) {
          updateLeads([data.lead, ...leads]);
        }
        if (data.lead) {
          setSelectedLead(data.lead);
        }
        notify(`Lead "${manualName.trim()}" analyzed by AI & added to pipeline.`);
        setManualName('');
        setManualCompany('');
        setManualRole('');
        setManualEmail('');
        setManualMessage('');
        setActiveModal(null);
      }
    } catch (err) {
      console.error('Manual lead creation error:', err);
    } finally {
      setIsSubmittingManual(false);
    }
  };

  // 3. CSV Bulk Import
  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const content = String(ev.target?.result || '');
      if (content.trim()) setCsvText(content);
    };
    reader.readAsText(file);
  };

  const handleImportCsv = () => {
    const lines = csvText
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(Boolean);
    if (lines.length < 2) return;

    const importedLeads: LeadItem[] = [];
    for (let i = 1; i < lines.length; i++) {
      // Parse CSV line respecting quoted strings
      const matches = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
      const cols = matches.map(c => c.replace(/^"|"$/g, '').trim());
      if (cols.length < 2) continue;

      const [name, company, role, email, sourceRaw, message, scoreRaw, signalsRaw] = cols;
      if (!name) continue;

      const parsedScore = Math.min(99, Math.max(70, Number(scoreRaw) || 88));
      const parsedSignals = signalsRaw
        ? signalsRaw.split(/[;|]/).map(s => s.trim()).filter(Boolean)
        : ['CSV Imported', 'B2B Evaluation', 'High Intent'];

      importedLeads.push({
        id: `ld-csv-${Date.now()}-${i}`,
        name,
        company: company || 'Enterprise Account',
        role: role || 'Decision Maker',
        email:
          email ||
          `${name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@${(company || 'company')
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '')}.com`,
        source: 'CSV Import',
        status: 'new',
        intent: parsedScore >= 90 ? 'high-priority-lead' : 'buying-signal',
        detectedMessage:
          message || `Imported via CSV from ${sourceRaw || 'CRM'} with active buying signals.`,
        buyingSignals: parsedSignals,
        score: parsedScore,
        assignedAgent: 'leads',
        suggestedAction: `Enroll ${name} in ${SEQUENCE_OPTIONS[0]} and send tailored intro`,
        timestamp: 'Just now (CSV Import)'
      });
    }

    if (importedLeads.length > 0) {
      const next = [...importedLeads, ...leads];
      updateLeads(next);
      setSelectedLead(importedLeads[0]);
      notify(`Imported ${importedLeads.length} leads from CSV into pipeline.`);
      setActiveModal(null);
    }
  };

  // 4. Test Inbound Website Demo/Contact Webhook
  const handleTriggerWebhookTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whName.trim() || !whMessage.trim()) return;
    setIsTestingWebhook(true);
    try {
      const res = await apiClient.post('/api/leads/webhook', {
        name: whName,
        company: whCompany,
        role: whRole,
        email: whEmail,
        source: whSource,
        message: whMessage
      });
      if (res.success && res.data) {
        const data = res.data;
        if (data.state && onStateSynced) {
          onStateSynced(data.state);
        } else if (data.lead) {
          updateLeads([data.lead, ...leads]);
        }
        if (data.lead) {
          setSelectedLead(data.lead);
        }
        notify(
          `Inbound Webhook received from ${whCompany} — scored ${
            data.lead?.score || 95
          }/100 with AI buying signals.`
        );
        setActiveModal(null);
      }
    } catch (err) {
      console.error('Webhook test error:', err);
    } finally {
      setIsTestingWebhook(false);
    }
  };

  // 5. Export Filtered Leads to CSV
  const handleExportCsv = () => {
    const headers = [
      'Name',
      'Company',
      'Role',
      'Email',
      'Source',
      'Status',
      'Score',
      'Buying Signals',
      'Detected Message',
      'Recommended Action',
      'Enrolled Sequence'
    ];
    const rows = filteredLeads.map(l => [
      `"${(l.name || '').replace(/"/g, '""')}"`,
      `"${(l.company || '').replace(/"/g, '""')}"`,
      `"${(l.role || '').replace(/"/g, '""')}"`,
      `"${(l.email || '').replace(/"/g, '""')}"`,
      `"${l.source}"`,
      `"${l.status}"`,
      l.score,
      `"${l.buyingSignals.join('; ').replace(/"/g, '""')}"`,
      `"${(l.detectedMessage || '').replace(/"/g, '""')}"`,
      `"${(l.suggestedAction || '').replace(/"/g, '""')}"`,
      `"${(l.enrolledSequence || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${brandName.toLowerCase()}-leads-pipeline-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    notify(`Exported ${filteredLeads.length} leads to CSV for CRM sync.`);
  };

  // 6. Generate Personalized AI Outreach
  const handleGenerateAiOutreach = async () => {
    if (!selectedLead) return;
    setIsGeneratingOutreach(true);
    try {
      const res = await apiClient.post('/api/leads/outreach', {
        leadId: selectedLead.id,
        channel: outreachChannel
      });
      if (res.success && res.data) {
        const data = res.data;
        if (data.outreachDraft) {
          setDraftSubject(data.outreachDraft.subject);
          setDraftBody(data.outreachDraft.body);
        }
        if (data.state && onStateSynced) {
          onStateSynced(data.state);
        } else if (data.lead) {
          const next = leads.map(l => (l.id === data.lead.id ? data.lead : l));
          updateLeads(next);
          setSelectedLead(data.lead);
        }
        notify(`Generated personalized ${outreachChannel} outreach for ${selectedLead.name}.`);
      }
    } catch (err) {
      console.error('AI Outreach generation error:', err);
    } finally {
      setIsGeneratingOutreach(false);
    }
  };

  // 7. Enroll Lead in Email Sequence & Mark Contacted
  const handleEnrollInSequence = async () => {
    if (!selectedLead) return;
    setIsEnrolling(true);
    try {
      const res = await apiClient.post('/api/leads/enroll-sequence', {
        leadId: selectedLead.id,
        sequenceName: selectedSequence,
        subject: draftSubject,
        body: draftBody
      });
      if (res.success && res.data) {
        const data = res.data;
        if (data.state && onStateSynced) {
          onStateSynced(data.state);
        }
        if (data.lead) {
          const next = leads.map(l => (l.id === data.lead.id ? data.lead : l));
          updateLeads(next);
          setSelectedLead(data.lead);
        }
        notify(
          `Enrolled ${selectedLead.name} in "${selectedSequence}" & updated status to Contacted.`
        );
      }
    } catch (err) {
      console.error('Enroll sequence error:', err);
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleCopyOutreach = () => {
    const fullText =
      outreachChannel === 'Email' ? `Subject: ${draftSubject}\n\n${draftBody}` : draftBody;
    navigator.clipboard.writeText(fullText);
    setCopiedOutreach(true);
    notify('Outreach message copied to clipboard.');
    setTimeout(() => setCopiedOutreach(false), 2000);
  };

  const handleAdvanceLeadStatus = (lead: LeadItem) => {
    const order: LeadItem['status'][] = ['new', 'qualified', 'contacted', 'converted'];
    const idx = order.indexOf(lead.status);
    const nextStatus = order[Math.min(order.length - 1, idx + 1)];
    const updatedLead: LeadItem = { ...lead, status: nextStatus };
    const next = leads.map(l => (l.id === lead.id ? updatedLead : l));
    updateLeads(next);
    setSelectedLead(updatedLead);
    notify(`Moved ${lead.name} to "${nextStatus.toUpperCase()}" stage.`);
  };

  const handleMeetingScheduled = (newMeeting: MeetingItem) => {
    setIsScheduleModalOpen(false);
    notify(`Meeting "${newMeeting.title}" scheduled! Dispatched confirmation to Slack and Discord.`);
    if (selectedLead && (selectedLead.status === 'new' || selectedLead.status === 'qualified')) {
      const updatedLead: LeadItem = { ...selectedLead, status: 'contacted' };
      const next = leads.map(l => (l.id === selectedLead.id ? updatedLead : l));
      updateLeads(next);
      setSelectedLead(updatedLead);
    }
  };

  const filteredLeads = leads.filter(lead => {
    if (statusFilter !== 'all' && lead.status !== statusFilter) return false;
    if (sourceFilter !== 'all' && lead.source !== sourceFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = lead.name.toLowerCase().includes(q);
      const matchCompany = lead.company.toLowerCase().includes(q);
      const matchRole = lead.role.toLowerCase().includes(q);
      const matchSignal = (lead.buyingSignals || []).some(s => s.toLowerCase().includes(q));
      const matchMsg = (lead.detectedMessage || lead.notes || '').toLowerCase().includes(q);
      if (!matchName && !matchCompany && !matchRole && !matchSignal && !matchMsg) return false;
    }
    return true;
  });

  const webhookEndpointUrl = `${
    typeof window !== 'undefined' ? window.location.origin : 'https://api.marketingos.com'
  }/api/leads/webhook`;

  return (
    <div className="w-full space-y-6">
      {/* Header & Multi-Source Data Collection Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Leads & Pipeline
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 tabular-nums">
              {leads.length} Pipeline Signals
            </span>
          </div>
          <p className="text-xs text-neutral-400">
            Ingest buying signals from Connected Social Pages, Community Inbox, Website Demo Webhooks & CSV imports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveModal('webhook')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 text-xs font-semibold transition-colors"
          >
            <Webhook className="h-3.5 w-3.5 text-emerald-400" />
            <span>Website Webhook</span>
          </button>

          <button
            onClick={() => {
              setAddTab('manual');
              setActiveModal('add');
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 text-xs font-semibold transition-colors"
          >
            <Plus className="h-3.5 w-3.5 text-emerald-400" />
            <span>Add / Import CSV</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 text-xs font-semibold transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-neutral-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleScanBuyingSignals}
            disabled={isScanning}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-neutral-950 text-xs font-bold transition-all shrink-0 shadow-xs"
          >
            <RefreshCw className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning Inbox & Pages...' : 'Scan Buying Signals'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Funnel Pipeline KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            key: 'new',
            stage: 'New Detected',
            sub: 'Social & Webhook Signals',
            count: leads.filter(l => l.status === 'new').length,
            color: 'text-amber-400'
          },
          {
            key: 'qualified',
            stage: 'Qualified (SQL)',
            sub: 'High-Intent Verified',
            count: leads.filter(l => l.status === 'qualified').length,
            color: 'text-emerald-400'
          },
          {
            key: 'contacted',
            stage: 'Contacted',
            sub: 'Outreach / Sequence Active',
            count: leads.filter(l => l.status === 'contacted').length,
            color: 'text-sky-400'
          },
          {
            key: 'converted',
            stage: 'Converted',
            sub: 'Closed Pipeline Won',
            count: leads.filter(l => l.status === 'converted').length,
            color: 'text-emerald-300'
          }
        ].map(funnel => {
          const isActive = statusFilter === funnel.key;
          return (
            <button
              key={funnel.key}
              onClick={() => setStatusFilter(isActive ? 'all' : funnel.key)}
              className={`text-left p-4 rounded-2xl border transition-all space-y-1 ${
                isActive
                  ? 'border-emerald-500/50 bg-emerald-500/5'
                  : 'border-neutral-800 bg-neutral-900/40 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400 font-medium">{funnel.stage}</span>
                {isActive && (
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">Filtered</span>
                )}
              </div>
              <div className={`text-2xl font-bold tabular-nums ${funnel.color}`}>
                {funnel.count}
              </div>
              <p className="text-[11px] text-neutral-500">{funnel.sub}</p>
            </button>
          );
        })}
      </div>

      {/* Main 12-Col Bento Split: Left 7 Cols Lead Pipeline + Right 5 Cols Lead Inspector & AI Outreach Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: Search, Filters & Leads List */}
        <div className="lg:col-span-7 space-y-3.5">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-2xl bg-neutral-900/50 border border-neutral-800">
            <div className="relative flex-1">
              <Search className="h-3.5 w-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search leads, company, role, or buying signal..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sourceFilter}
                onChange={e => setSourceFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 focus:outline-none focus:border-emerald-500/50"
              >
                <option value="all">All Sources</option>
                <option value="LinkedIn Comment">LinkedIn Comment</option>
                <option value="Facebook Page">Facebook Page</option>
                <option value="Demo Request">Demo Request</option>
                <option value="Contact Form">Contact Form</option>
                <option value="X Mention">X Mention</option>
                <option value="CSV Import">CSV Import</option>
              </select>

              <div className="flex items-center gap-1 p-1 rounded-xl bg-neutral-950 border border-neutral-800">
                {['all', 'new', 'qualified', 'contacted', 'converted'].map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`text-[10px] uppercase px-2 py-1 rounded-lg font-semibold transition-colors ${
                      statusFilter === st
                        ? 'bg-neutral-800 text-emerald-400 font-bold'
                        : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Leads Cards List */}
          <div className="space-y-2.5">
            {filteredLeads.length === 0 ? (
              leads.length === 0 ? (
                <LeadsEmptyState
                  onScanSignals={handleScanBuyingSignals}
                  onNavigateIntegrations={() => onNavigate('integrations')}
                />
              ) : (
                <FilterResultsEmptyState
                  query={searchQuery || (statusFilter !== 'all' ? statusFilter : undefined)}
                  onReset={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                />
              )
            ) : (
              filteredLeads.map(lead => (
                <div
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className={`cursor-pointer p-4 rounded-2xl border transition-all space-y-2.5 ${
                    selectedLead?.id === lead.id
                      ? 'bg-neutral-900 border-emerald-500/50 shadow-xs'
                      : 'bg-neutral-900/40 border-neutral-800/80 hover:border-neutral-700'
                  }`}
                >
                  {/* 1. Identity, Role, Source & Score */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-white truncate">
                          {lead.name}
                        </h4>
                        <span className="text-xs font-medium text-emerald-400">
                          · {lead.company}
                        </span>
                        {lead.enrolledSequence && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20 font-semibold">
                            In Sequence
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        {lead.role} · <span className="text-neutral-300 font-medium">{lead.source}</span> ·{' '}
                        <span className="text-neutral-500">{lead.timestamp}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold text-emerald-400 tabular-nums px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        {lead.score}/100
                      </span>
                      <span className="text-[10px] uppercase px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 font-bold">
                        {lead.status}
                      </span>
                    </div>
                  </div>

                  {/* 2. Detected Buying Message Quote */}
                  <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed">
                    "{lead.detectedMessage || lead.notes || 'Inquired about enterprise solutions.'}"
                  </p>

                  {/* 3. Buying Signal Tags Preview */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex flex-wrap gap-1.5">
                      {(lead.buyingSignals || []).slice(0, 3).map((sig, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-950 text-emerald-300 border border-neutral-800"
                        >
                          {sig}
                        </span>
                      ))}
                    </div>
                    <span className="text-[11px] text-neutral-400 flex items-center gap-1 shrink-0">
                      <span>Inspect</span>
                      <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 5 Cols: Lead Inspector, Buying Signal Breakdown & AI Outreach Service */}
        {selectedLead && (
          <div className="lg:col-span-5 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5 space-y-5 sticky top-4">
            {/* Inspector Header */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Lead Inspector & Outreach Studio
                </span>
              </div>
              <span className="text-[11px] uppercase px-2.5 py-0.5 rounded-md bg-neutral-800 text-emerald-300 font-bold">
                {selectedLead.status}
              </span>
            </div>

            {/* Lead Identity & Metadata */}
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">{selectedLead.name}</h3>
                <div className="flex items-center gap-1.5 text-xs text-neutral-300">
                  <Building2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{selectedLead.role}</span>
                  <span>·</span>
                  <span className="text-emerald-400 font-semibold">{selectedLead.company}</span>
                </div>
                {selectedLead.email && (
                  <p className="text-[11px] text-neutral-400 font-mono">{selectedLead.email}</p>
                )}
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase text-neutral-500 font-bold block">
                  Intent Score
                </span>
                <span className="text-lg font-bold text-emerald-400 tabular-nums">
                  {selectedLead.score}/100
                </span>
              </div>
            </div>

            {/* Captured Message & Signals */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase text-neutral-500">
                <span>Captured Signal ({selectedLead.source || 'Direct'})</span>
                <span>{selectedLead.timestamp || 'Recent'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 leading-relaxed">
                "{selectedLead.detectedMessage || selectedLead.notes || 'Inquired about enterprise solutions.'}"
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(selectedLead.buyingSignals || []).map((sig, i) => (
                  <span
                    key={i}
                    className="text-[11px] px-2.5 py-0.5 rounded-md bg-neutral-950 text-emerald-300 border border-neutral-800 font-medium"
                  >
                    {sig}
                  </span>
                ))}
              </div>
            </div>

            {/* AI Recommended Next Step */}
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 space-y-1">
              <span className="text-[10px] text-emerald-400 uppercase font-bold block">
                AI Recommended Next Action
              </span>
              <p className="text-xs text-neutral-200 leading-relaxed">
                {selectedLead.suggestedAction || 'Reach out to qualify technical requirements'}
              </p>
            </div>

            {/* AI Personalized Outreach Generator & Email Sequence Enrollment */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-xs font-bold text-white">AI Outreach Generator</span>
                </div>

                <div className="flex items-center gap-1">
                  {(['Email', 'LinkedIn DM'] as const).map(ch => (
                    <button
                      key={ch}
                      onClick={() => setOutreachChannel(ch)}
                      className={`text-[10px] px-2 py-1 rounded-lg font-semibold transition-colors ${
                        outreachChannel === ch
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>

              {outreachChannel === 'Email' && (
                <input
                  type="text"
                  value={draftSubject}
                  onChange={e => setDraftSubject(e.target.value)}
                  placeholder="Subject line..."
                  className="w-full px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                />
              )}

              <textarea
                rows={4}
                value={draftBody}
                onChange={e => setDraftBody(e.target.value)}
                className="w-full p-3 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 leading-relaxed focus:outline-none focus:border-emerald-500/50 resize-none"
              />

              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={handleGenerateAiOutreach}
                  disabled={isGeneratingOutreach}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-emerald-400 text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  <Sparkles
                    className={`h-3.5 w-3.5 ${isGeneratingOutreach ? 'animate-spin' : ''}`}
                  />
                  <span>
                    {isGeneratingOutreach ? 'Drafting with AI...' : 'Regenerate AI Draft'}
                  </span>
                </button>

                <button
                  onClick={handleCopyOutreach}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-semibold transition-colors"
                >
                  {copiedOutreach ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Email Sequence Enrollment Selector */}
              <div className="pt-2 border-t border-neutral-800/80 space-y-2">
                <label className="text-[10px] font-bold uppercase text-neutral-400 block">
                  Enroll in Automated Email Sequence
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={selectedSequence}
                    onChange={e => setSelectedSequence(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500/50"
                  >
                    {SEQUENCE_OPTIONS.map(seq => (
                      <option key={seq} value={seq}>
                        {seq}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleEnrollInSequence}
                    disabled={isEnrolling}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{isEnrolling ? 'Enrolling...' : 'Enroll & Send'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Meeting Scheduler Button */}
            <div className="pt-2 border-t border-neutral-800">
              <button
                onClick={() => setIsScheduleModalOpen(true)}
                className="w-full py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Calendar className="h-4 w-4 text-purple-400" />
                <span>Schedule Meeting with {selectedLead.name.split(' ')[0]}</span>
              </button>
            </div>

            {/* Bottom Pipeline Stage Progression & Inbox Navigation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-neutral-800">
              {selectedLead.status !== 'converted' && (
                <button
                  onClick={() => handleAdvanceLeadStatus(selectedLead)}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>
                    {selectedLead.status === 'new'
                      ? 'Qualify Lead (SQL)'
                      : selectedLead.status === 'qualified'
                      ? 'Mark Contacted'
                      : 'Mark Converted'}
                  </span>
                </button>
              )}
              <button
                onClick={() => onNavigate('community')}
                className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <MessageSquare className="h-4 w-4 text-emerald-400" />
                <span>Community Inbox</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal 1: Add Manual Lead or Bulk CSV Import */}
      <AnimatePresence>
        {activeModal === 'add' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="w-full max-w-xl rounded-2xl border border-neutral-800 bg-neutral-900 p-6 space-y-5 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAddTab('manual')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      addTab === 'manual'
                        ? 'bg-emerald-500 text-neutral-950'
                        : 'bg-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    + Manual Lead Entry (AI Scored)
                  </button>
                  <button
                    onClick={() => setAddTab('csv')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                      addTab === 'csv'
                        ? 'bg-emerald-500 text-neutral-950'
                        : 'bg-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                    <span>Bulk CSV Import</span>
                  </button>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="text-neutral-400 hover:text-white p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {addTab === 'manual' ? (
                <form onSubmit={handleCreateManualLead} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
                        Prospect Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={manualName}
                        onChange={e => setManualName(e.target.value)}
                        placeholder="e.g. Farhan Ahmed"
                        className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
                        Company *
                      </label>
                      <input
                        type="text"
                        required
                        value={manualCompany}
                        onChange={e => setManualCompany(e.target.value)}
                        placeholder="e.g. Apex FinTech"
                        className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
                        Role / Title
                      </label>
                      <input
                        type="text"
                        value={manualRole}
                        onChange={e => setManualRole(e.target.value)}
                        placeholder="e.g. Head of Growth"
                        className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
                        Work Email
                      </label>
                      <input
                        type="email"
                        value={manualEmail}
                        onChange={e => setManualEmail(e.target.value)}
                        placeholder="farhan@apex.io"
                        className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
                        Lead Source
                      </label>
                      <select
                        value={manualSource}
                        onChange={e => setManualSource(e.target.value as LeadItem['source'])}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white"
                      >
                        <option value="Demo Request">Demo Request</option>
                        <option value="LinkedIn Comment">LinkedIn Comment</option>
                        <option value="Facebook Page">Facebook Page</option>
                        <option value="Contact Form">Contact Form</option>
                        <option value="X Mention">X Mention</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
                      Captured Buying Signal / Inquiry Message *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={manualMessage}
                      onChange={e => setManualMessage(e.target.value)}
                      placeholder="Paste the prospect's comment, DM, or demo form inquiry so AI can extract buying signals and score intent..."
                      className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingManual}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold flex items-center gap-1.5"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>
                        {isSubmittingManual ? 'Scoring with AI...' : 'Analyze & Add Lead'}
                      </span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-neutral-400">
                      Upload a `.csv` file or edit the CSV rows below (`name,company,role,email,source,message,score,signals`).
                    </p>
                    <label className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-emerald-400 text-xs font-semibold">
                      <Upload className="h-3.5 w-3.5" />
                      <span>Choose CSV File</span>
                      <input
                        type="file"
                        accept=".csv,text/csv"
                        onChange={handleCsvFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <textarea
                    rows={6}
                    value={csvText}
                    onChange={e => setCsvText(e.target.value)}
                    className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] font-mono text-neutral-200 leading-relaxed resize-none"
                  />

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleImportCsv}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold flex items-center gap-1.5"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Import CSV Leads</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal 2: Inbound Website Demo & Contact Form Webhook Endpoint + Live Simulator */}
      <AnimatePresence>
        {activeModal === 'webhook' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="w-full max-w-xl rounded-2xl border border-neutral-800 bg-neutral-900 p-6 space-y-5 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <Webhook className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">
                    Inbound Lead & Demo Form Webhook
                  </h3>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="text-neutral-400 hover:text-white p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-neutral-400 block">
                  Live Webhook Endpoint (Connect Website Demo Form / Typeform / Zapier)
                </label>
                <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-xs text-emerald-400">
                  <span className="truncate">POST {webhookEndpointUrl}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(webhookEndpointUrl);
                      notify('Webhook URL copied to clipboard.');
                    }}
                    className="px-2 py-1 rounded bg-neutral-800 text-neutral-200 text-[10px] font-sans font-semibold shrink-0"
                  >
                    Copy URL
                  </button>
                </div>
              </div>

              <form onSubmit={handleTriggerWebhookTest} className="space-y-3 pt-2 border-t border-neutral-800">
                <span className="text-xs font-bold text-white block">
                  Simulate Website Demo / Contact Form Submission
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    value={whName}
                    onChange={e => setWhName(e.target.value)}
                    placeholder="Full Name"
                    className="px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white"
                  />
                  <input
                    type="text"
                    required
                    value={whCompany}
                    onChange={e => setWhCompany(e.target.value)}
                    placeholder="Company Name"
                    className="px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={whRole}
                    onChange={e => setWhRole(e.target.value)}
                    placeholder="Job Role"
                    className="px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white"
                  />
                  <input
                    type="email"
                    value={whEmail}
                    onChange={e => setWhEmail(e.target.value)}
                    placeholder="Work Email"
                    className="px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white"
                  />
                  <select
                    value={whSource}
                    onChange={e => setWhSource(e.target.value as LeadItem['source'])}
                    className="px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white"
                  >
                    <option value="Demo Request">Demo Request</option>
                    <option value="Contact Form">Contact Form</option>
                    <option value="LinkedIn Comment">LinkedIn Comment</option>
                  </select>
                </div>

                <textarea
                  rows={3}
                  required
                  value={whMessage}
                  onChange={e => setWhMessage(e.target.value)}
                  className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white resize-none"
                />

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={isTestingWebhook}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Webhook className="h-3.5 w-3.5" />
                    <span>
                      {isTestingWebhook
                        ? 'Sending Webhook...'
                        : 'Send Live Webhook Payload'}
                    </span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Schedule Meeting Modal */}
      {isScheduleModalOpen && selectedLead && (
        <ScheduleMeetingModal
          isOpen={isScheduleModalOpen}
          initialLead={selectedLead}
          brandName={brandName}
          availableLeads={leads}
          onClose={() => setIsScheduleModalOpen(false)}
          onMeetingScheduled={handleMeetingScheduled}
        />
      )}
    </div>
  );
};
