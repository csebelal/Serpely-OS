import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Send,
  CornerDownRight,
  RefreshCw,
  Plus,
  Webhook,
  UserPlus,
  CheckCircle2,
  Copy,
  Check,
  Search,
  ExternalLink,
  X,
  MessageSquarePlus,
  ShieldCheck,
  Trash2,
  Link2,
  AlertTriangle
} from 'lucide-react';
import { mockCommunityMessages } from '../../data/mock-data';
import { CommunityMessage, ViewId } from '../../types';

interface CommunityViewProps {
  onNavigate: (view: ViewId) => void;
  onOpenCommand: () => void;
  onSubmitApproval: (item: any) => void;
  messagesList?: CommunityMessage[];
  onUpdateMessages?: (messages: CommunityMessage[]) => void;
  brandName?: string;
  onStateSynced?: (state: any) => void;
  onShowToast?: (msg: string) => void;
}

export const CommunityView: React.FC<CommunityViewProps> = ({
  onNavigate,
  onSubmitApproval,
  messagesList = mockCommunityMessages,
  onUpdateMessages,
  brandName = 'Brand',
  onStateSynced,
  onShowToast
}) => {
  const [messages, setMessages] = useState<CommunityMessage[]>(messagesList);
  const [intentFilter, setIntentFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMsg, setSelectedMsg] = useState<CommunityMessage | null>(messagesList[0] || null);
  const [draftReply, setDraftReply] = useState<string>(messagesList[0]?.draftReply || '');
  const [replyTone, setReplyTone] = useState<string>('Executive & Helpful');
  const [autoConvertLead, setAutoConvertLead] = useState<boolean>(false);

  // Async action loading states
  const [isSyncingSocial, setIsSyncingSocial] = useState<boolean>(false);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [isPublishingReply, setIsPublishingReply] = useState<boolean>(false);
  const [isConvertingLead, setIsConvertingLead] = useState<boolean>(false);

  // Add Message / Webhook Modal state
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalTab, setModalTab] = useState<'manual' | 'webhook' | 'sync-post'>('manual');
  const [postUrlInput, setPostUrlInput] = useState<string>('https://www.linkedin.com/feed/update/urn:li:activity:7521440974246686720');
  const [isSyncingPost, setIsSyncingPost] = useState<boolean>(false);
  const [syncPostResult, setSyncPostResult] = useState<{ rateLimited?: boolean; commentCount?: number; message?: string } | null>(null);
  const [isClearingDemos, setIsClearingDemos] = useState<boolean>(false);
  const [manualSender, setManualSender] = useState<string>('');
  const [manualRole, setManualRole] = useState<string>('');
  const [manualCompany, setManualCompany] = useState<string>('');
  const [manualPlatform, setManualPlatform] = useState<CommunityMessage['platform']>('LinkedIn');
  const [manualType, setManualType] = useState<CommunityMessage['type']>('comment');
  const [manualText, setManualText] = useState<string>('');
  const [isSubmittingManual, setIsSubmittingManual] = useState<boolean>(false);
  const [copiedWebhook, setCopiedWebhook] = useState<boolean>(false);

  useEffect(() => {
    setMessages(messagesList);
    if (selectedMsg) {
      const updated = messagesList.find(m => m.id === selectedMsg.id);
      if (updated) {
        setSelectedMsg(updated);
      } else if (messagesList[0]) {
        setSelectedMsg(messagesList[0]);
        setDraftReply(messagesList[0].draftReply || '');
      }
    } else if (messagesList[0]) {
      setSelectedMsg(messagesList[0]);
      setDraftReply(messagesList[0].draftReply || '');
    }
  }, [messagesList]);

  useEffect(() => {
    if (!selectedMsg) return;
    const isHighIntent =
      selectedMsg.intent === 'high-priority-lead' || selectedMsg.intent === 'buying-signal';
    setAutoConvertLead(isHighIntent && !selectedMsg.convertedLeadId);
  }, [selectedMsg?.id, selectedMsg?.intent, selectedMsg?.convertedLeadId]);

  const notify = (msg: string) => {
    if (onShowToast) onShowToast(msg);
  };

  const filteredMessages = messages.filter(m => {
    if (intentFilter !== 'all' && m.intent !== intentFilter) return false;
    if (platformFilter !== 'all' && m.platform !== platformFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSender = m.sender.toLowerCase().includes(q);
      const matchMsg = m.message.toLowerCase().includes(q);
      const matchPlatform = m.platform.toLowerCase().includes(q);
      if (!matchSender && !matchMsg && !matchPlatform) return false;
    }
    return true;
  });

  const handleSelectMessage = (msg: CommunityMessage) => {
    setSelectedMsg(msg);
    setDraftReply(msg.draftReply || '');
  };

  // 1. Sync Comments from Connected Facebook & LinkedIn Pages
  const handleSyncSocialPages = async () => {
    setIsSyncingSocial(true);
    try {
      const res = await fetch('/api/community/sync-social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.state && onStateSynced) {
          onStateSynced(data.state);
        } else if (Array.isArray(data.addedMessages)) {
          const next = [...data.addedMessages, ...messages];
          setMessages(next);
          if (onUpdateMessages) onUpdateMessages(next);
        }
        if (data.addedMessages?.[0]) {
          setSelectedMsg(data.addedMessages[0]);
          setDraftReply(data.addedMessages[0].draftReply || '');
        }
        if (data.message) {
          notify(data.message);
        } else {
          notify(
            `Synced ${data.syncedCount || 0} new social comment(s) from connected Facebook & LinkedIn pages into SQL.`
          );
        }
      } else {
        notify(data.error || 'Could not sync social pages.');
      }
    } catch {
      notify('Network error while syncing social comments.');
    } finally {
      setIsSyncingSocial(false);
    }
  };

  // 1B. Sync Comments from Specific Post URL
  const handleSyncSinglePost = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!postUrlInput.trim()) return;
    setIsSyncingPost(true);
    setSyncPostResult(null);
    try {
      const res = await fetch('/api/community/sync-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postUrl: postUrlInput.trim() })
      });
      const data = await res.json();
      if (data.rateLimited) {
        setSyncPostResult({
          rateLimited: true,
          commentCount: data.commentCount,
          message: data.message
        });
        notify(data.message || 'LinkedIn rate limit active. Live comments confirmed.');
      } else if (res.ok && data.success) {
        if (data.state && onStateSynced) {
          onStateSynced(data.state);
        } else if (Array.isArray(data.addedMessages)) {
          const next = [...data.addedMessages, ...messages];
          setMessages(next);
          if (onUpdateMessages) onUpdateMessages(next);
        }
        if (data.addedMessages?.[0]) {
          setSelectedMsg(data.addedMessages[0]);
          setDraftReply(data.addedMessages[0].draftReply || '');
        }
        notify(data.message || `Successfully synced comments for post!`);
        setModalOpen(false);
      } else {
        notify(data.error || 'Failed to sync post comments.');
      }
    } catch {
      notify('Network error syncing post comments.');
    } finally {
      setIsSyncingPost(false);
    }
  };

  // 1C. Clear Synthetic Demo Comments
  const handleClearDemos = async () => {
    setIsClearingDemos(true);
    try {
      const res = await fetch('/api/community/clear-demos', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.state && onStateSynced) {
          onStateSynced(data.state);
        } else {
          const liveOnly = messages.filter(
            m => m.sourceChannel === 'social_sync' || m.sourceChannel === 'manual' || m.sourceChannel === 'webhook'
          );
          setMessages(liveOnly);
          if (onUpdateMessages) onUpdateMessages(liveOnly);
        }
        notify(`Purged ${data.cleared || 0} synthetic demo comments. Only real comments remain.`);
      } else {
        notify('Failed to clear demo comments.');
      }
    } catch {
      notify('Network error clearing demo comments.');
    } finally {
      setIsClearingDemos(false);
    }
  };

  // 2. Manual Message or Webhook Ingestion
  const handleCreateInboundMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualText.trim()) return;
    setIsSubmittingManual(true);
    try {
      const res = await fetch('/api/community/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: manualSender.trim() || 'Inbound Prospect',
          senderRole: manualRole.trim(),
          senderCompany: manualCompany.trim(),
          platform: manualPlatform,
          type: manualType,
          message: manualText.trim(),
          sourceChannel: 'manual'
        })
      });
      const data = await res.json();
      if (res.ok && data.message) {
        if (data.state && onStateSynced) {
          onStateSynced(data.state);
        } else {
          const next = [data.message, ...messages];
          setMessages(next);
          if (onUpdateMessages) onUpdateMessages(next);
        }
        setSelectedMsg(data.message);
        setDraftReply(data.message.draftReply || '');
        setManualSender('');
        setManualRole('');
        setManualCompany('');
        setManualText('');
        setModalOpen(false);
        notify(
          `Ingested ${data.message.platform} ${data.message.type} from ${data.message.sender} (AI Intent: ${data.message.intent}).`
        );
      }
    } catch {
      notify('Failed to add message.');
    } finally {
      setIsSubmittingManual(false);
    }
  };

  const handleSimulateWebhookCall = async () => {
    setIsSubmittingManual(true);
    try {
      const res = await fetch('/api/community/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: 'Arifur Rahman',
          senderRole: 'VP of Engineering',
          senderCompany: 'DataPulse AI',
          platform: 'LinkedIn',
          type: 'comment',
          message: `We just saw your benchmark on AI Search visibility. Does ${brandName} have a webhook API and SQL backend for enterprise marketing teams?`,
          sourceChannel: 'webhook'
        })
      });
      const data = await res.json();
      if (res.ok && data.message) {
        if (data.state && onStateSynced) {
          onStateSynced(data.state);
        }
        setSelectedMsg(data.message);
        setDraftReply(data.message.draftReply || '');
        setModalOpen(false);
        notify(`Webhook payload received & triaged from ${data.message.sender}.`);
      }
    } catch {
      notify('Failed to test webhook endpoint.');
    } finally {
      setIsSubmittingManual(false);
    }
  };

  // 3. AI Regenerate Draft Reply
  const handleRegenerateDraft = async () => {
    if (!selectedMsg) return;
    setIsRegenerating(true);
    try {
      const res = await fetch('/api/community/regenerate-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId: selectedMsg.id,
          tone: replyTone
        })
      });
      const data = await res.json();
      if (res.ok && data.draftReply) {
        setDraftReply(data.draftReply);
        if (data.state && onStateSynced) {
          onStateSynced(data.state);
        }
        if (data.message) {
          setSelectedMsg(data.message);
        }
        notify(`Generated fresh "${replyTone}" reply draft via AI.`);
      }
    } catch {
      const firstName = selectedMsg.sender.split(' ')[0].replace(/^@/, '');
      setDraftReply(
        `Hi ${firstName}! Thanks for reaching out. We would love to show you how ${brandName} accelerates GEO visibility and autonomous pipeline. Sent you a DM with details!`
      );
    } finally {
      setIsRegenerating(false);
    }
  };

  // 4. Publish Reply directly to Platform & SQL (with optional Lead conversion)
  const handlePublishReply = async () => {
    if (!selectedMsg || !draftReply.trim()) return;
    setIsPublishingReply(true);
    try {
      const res = await fetch('/api/community/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId: selectedMsg.id,
          replyText: draftReply.trim(),
          convertToLead: autoConvertLead
        })
      });
      const data = await res.json();
      if (res.ok && data.message) {
        if (data.state && onStateSynced) {
          onStateSynced(data.state);
        } else {
          const next = messages.map(m => (m.id === selectedMsg.id ? data.message : m));
          setMessages(next);
          if (onUpdateMessages) onUpdateMessages(next);
        }
        setSelectedMsg(data.message);
        const leadSuffix = data.createdLead
          ? ` & converted ${data.createdLead.name} to CRM Lead!`
          : '.';
        notify(`Published reply via ${data.publishedVia || selectedMsg.platform}${leadSuffix}`);
      }
    } catch {
      notify('Failed to publish reply.');
    } finally {
      setIsPublishingReply(false);
    }
  };

  // 5. Convert Sender to CRM Lead directly
  const handleConvertToLead = async () => {
    if (!selectedMsg) return;
    if (selectedMsg.convertedLeadId) {
      onNavigate('leads');
      return;
    }
    setIsConvertingLead(true);
    try {
      const res = await fetch('/api/community/convert-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: selectedMsg.id })
      });
      const data = await res.json();
      if (res.ok && data.message) {
        if (data.state && onStateSynced) {
          onStateSynced(data.state);
        } else {
          const next = messages.map(m => (m.id === selectedMsg.id ? data.message : m));
          setMessages(next);
          if (onUpdateMessages) onUpdateMessages(next);
        }
        setSelectedMsg(data.message);
        notify(
          `Converted "${selectedMsg.sender}" into a high-intent Lead in Lead Intelligence CRM (Score: ${data.lead?.score || 92}).`
        );
      }
    } catch {
      notify('Failed to convert message to lead.');
    } finally {
      setIsConvertingLead(false);
    }
  };

  // 6. Send to Human Approval Gate
  const handleSendToApproval = () => {
    if (!selectedMsg) return;
    const updatedMsg: CommunityMessage = {
      ...selectedMsg,
      draftReply,
      status: 'replied',
      repliedAt: 'Queued for Approval'
    };
    const next = messages.map(m => (m.id === selectedMsg.id ? updatedMsg : m));
    setMessages(next);
    setSelectedMsg(updatedMsg);
    if (onUpdateMessages) onUpdateMessages(next);

    onSubmitApproval({
      id: `ap-${Date.now()}`,
      title: `Commercial Reply to ${selectedMsg.sender} (${selectedMsg.platform})`,
      agent: 'community',
      contentType: 'commercial-reply',
      platform: selectedMsg.platform,
      riskLevel: selectedMsg.requiresApproval ? 'high' : 'medium',
      status: 'pending',
      submittedAt: 'Just now',
      preview: draftReply,
      riskReason: 'Direct customer communication with commercial offer requires approval.',
      targetAudience: selectedMsg.sender
    });
  };

  const pendingCount = messages.filter(m => m.status === 'pending').length;
  const convertedCount = messages.filter(m => Boolean(m.convertedLeadId)).length;
  const webhookUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/community/webhook`;

  const sampleWebhookPayload = JSON.stringify(
    {
      sender: 'Sarah Jenkins',
      senderRole: 'VP of Demand Gen',
      senderCompany: 'CloudScale IO',
      platform: 'LinkedIn',
      type: 'comment',
      message: `Can ${brandName} automate GEO content and sync LinkedIn comments to our SQL CRM?`
    },
    null,
    2
  );

  return (
    <div className="w-full space-y-6">
      {/* Top Header & Primary Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white tracking-tight">Social Inbox</h2>
            <div className="flex items-center gap-2 text-xs text-neutral-400 tabular-nums">
              <span className="text-emerald-400 font-semibold">{messages.length} Threads</span>
              <span aria-hidden="true">·</span>
              <span>{pendingCount} Pending</span>
              <span aria-hidden="true">·</span>
              <span>{convertedCount} Leads Captured</span>
            </div>
          </div>
          <p className="text-xs text-neutral-400">
            Sync comments from connected Facebook & LinkedIn pages, receive inbound webhooks, publish AI replies, and convert buying signals into CRM leads.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setModalTab('sync-post');
              setModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
          >
            <Link2 className="h-3.5 w-3.5 text-blue-400" />
            <span>Sync Post URL</span>
          </button>

          <button
            onClick={() => {
              setModalTab('manual');
              setModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="h-3.5 w-3.5 text-emerald-400" />
            <span>Add / Webhook API</span>
          </button>

          <button
            onClick={handleClearDemos}
            disabled={isClearingDemos}
            title="Purge synthetic demo messages and retain only real comments"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-rose-950/40 border border-neutral-800 hover:border-rose-800/60 text-neutral-400 hover:text-rose-300 text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
          >
            <Trash2 className="h-3.5 w-3.5 text-rose-400" />
            <span>{isClearingDemos ? 'Purging...' : 'Purge Demos'}</span>
          </button>

          <button
            onClick={handleSyncSocialPages}
            disabled={isSyncingSocial}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-neutral-950 text-xs font-bold transition-all whitespace-nowrap shrink-0"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncingSocial ? 'animate-spin' : ''}`} />
            <span>{isSyncingSocial ? 'Syncing Social Pages...' : 'Sync Social Pages'}</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-xl">
          {[
            { id: 'all', label: 'All Threads' },
            { id: 'high-priority-lead', label: 'High-Priority Lead' },
            { id: 'buying-signal', label: 'Buying Signal' },
            { id: 'question', label: 'Question' },
            { id: 'praise', label: 'Praise' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setIntentFilter(item.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                intentFilter === item.id
                  ? 'bg-neutral-800 text-emerald-400'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={platformFilter}
            onChange={e => setPlatformFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Platforms</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Facebook">Facebook</option>
            <option value="X">X (Twitter)</option>
            <option value="YouTube">YouTube</option>
            <option value="Instagram">Instagram</option>
          </select>

          <div className="relative">
            <Search className="h-3.5 w-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search sender or comment..."
              className="pl-8 pr-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500 w-52"
            />
          </div>
        </div>
      </div>

      {/* 2-Column Split: Inbox Thread List + AI Reply Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Thread Cards */}
        <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
          {filteredMessages.length === 0 ? (
            <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/40 text-center space-y-3">
              <p className="text-xs text-neutral-400">
                No community messages match the current filter.
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => {
                    setIntentFilter('all');
                    setPlatformFilter('all');
                    setSearchQuery('');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white transition-colors"
                >
                  Reset Filters
                </button>
                <button
                  onClick={handleSyncSocialPages}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-xs font-semibold text-emerald-300 transition-colors"
                >
                  Sync Social Pages
                </button>
              </div>
            </div>
          ) : (
            filteredMessages.map(msg => {
              const isSelected = selectedMsg?.id === msg.id;
              return (
                <div
                  key={msg.id}
                  onClick={() => handleSelectMessage(msg)}
                  className={`cursor-pointer p-4 rounded-2xl border transition-all space-y-2 ${
                    isSelected
                      ? 'bg-neutral-900 border-emerald-500/50'
                      : 'bg-neutral-900/40 border-neutral-800/80 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-white truncate">{msg.sender}</span>
                    <span
                      className={`text-[11px] font-semibold uppercase tracking-wide shrink-0 ${
                        msg.intent === 'high-priority-lead'
                          ? 'text-amber-400'
                          : msg.intent === 'buying-signal'
                          ? 'text-emerald-400'
                          : 'text-neutral-400'
                      }`}
                    >
                      {msg.intent.replace(/-/g, ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed">
                    "{msg.message}"
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-neutral-400 tabular-nums pt-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-emerald-400 font-medium">{msg.platform}</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{msg.type}</span>
                      {msg.convertedLeadId && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-amber-300 font-semibold">CRM Lead</span>
                        </>
                      )}
                    </div>
                    <span className={msg.status === 'replied' ? 'text-emerald-400 font-semibold' : ''}>
                      {msg.status === 'replied' ? 'Replied' : msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right 2-Cols: Selected Thread & AI Reply Studio */}
        {selectedMsg && (
          <div className="lg:col-span-2 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-6 flex flex-col justify-between">
            <div className="space-y-5">
              {/* Message Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-bold text-white text-base">{selectedMsg.sender}</h3>
                    {(selectedMsg.senderRole || selectedMsg.senderCompany) && (
                      <span className="text-xs text-neutral-400">
                        {[selectedMsg.senderRole, selectedMsg.senderCompany]
                          .filter(Boolean)
                          .join(' @ ')}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400 tabular-nums">
                    <span className="text-emerald-400 font-semibold">{selectedMsg.platform}</span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{selectedMsg.type}</span>
                    {selectedMsg.pageName && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{selectedMsg.pageName}</span>
                      </>
                    )}
                    <span aria-hidden="true">·</span>
                    <span>{selectedMsg.timestamp}</span>
                    <span aria-hidden="true">·</span>
                    <span>
                      Sentiment: <strong className="text-emerald-400 capitalize">{selectedMsg.sentiment}</strong>
                    </span>
                  </div>
                </div>

                {/* Convert to CRM Lead Action */}
                <div className="flex items-center gap-2 shrink-0">
                  {selectedMsg.convertedLeadId ? (
                    <button
                      onClick={() => onNavigate('leads')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/25 transition-colors whitespace-nowrap"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Converted to Lead · View CRM</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  ) : (
                    <button
                      onClick={handleConvertToLead}
                      disabled={isConvertingLead}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-amber-300 text-xs font-semibold transition-colors whitespace-nowrap"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      <span>{isConvertingLead ? 'Converting...' : 'Convert to CRM Lead'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Inbound Message Content */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-neutral-400">
                  <span>Inbound {selectedMsg.platform} {selectedMsg.type}</span>
                  <span>
                    AI Intent Classification:{' '}
                    <strong className="text-white uppercase">
                      {selectedMsg.intent.replace(/-/g, ' ')}
                    </strong>
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-neutral-200 leading-relaxed">
                  "{selectedMsg.message}"
                </div>
              </div>

              {/* AI Draft Reply Editor */}
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                    <CornerDownRight className="h-4 w-4" />
                    <span>AI Reply Studio ({brandName} Brand Voice)</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <select
                      value={replyTone}
                      onChange={e => setReplyTone(e.target.value)}
                      className="px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Executive & Helpful">Tone: Executive & Helpful</option>
                      <option value="Book Demo CTA">Tone: Book Demo & Calendar Link</option>
                      <option value="Technical Deep-Dive">Tone: Technical Architecture</option>
                    </select>

                    <button
                      onClick={handleRegenerateDraft}
                      disabled={isRegenerating}
                      className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200 font-semibold flex items-center gap-1 transition-colors whitespace-nowrap"
                    >
                      <Sparkles className={`h-3 w-3 text-emerald-400 ${isRegenerating ? 'animate-spin' : ''}`} />
                      <span>{isRegenerating ? 'Drafting...' : 'AI Regenerate'}</span>
                    </button>
                  </div>
                </div>

                <textarea
                  value={draftReply}
                  onChange={e => setDraftReply(e.target.value)}
                  rows={4}
                  placeholder="Write or regenerate your reply..."
                  className="w-full p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white leading-relaxed focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Footer Controls: Auto-Lead Toggle + Approval Gate + Publish Reply */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-neutral-800">
              <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoConvertLead}
                  disabled={Boolean(selectedMsg.convertedLeadId)}
                  onChange={e => setAutoConvertLead(e.target.checked)}
                  className="rounded border-neutral-700 bg-neutral-950 text-emerald-500 focus:ring-emerald-500"
                />
                <span>
                  {selectedMsg.convertedLeadId
                    ? 'Sender is already saved in Lead Intelligence CRM'
                    : 'Also convert sender to CRM Lead when publishing reply'}
                </span>
              </label>

              <div className="flex flex-wrap items-center justify-end gap-2.5">
                <button
                  onClick={handleSendToApproval}
                  className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                  <span>Send to Approval Gate</span>
                </button>

                <button
                  onClick={handlePublishReply}
                  disabled={isPublishingReply || !draftReply.trim()}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-neutral-950 text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>
                    {isPublishingReply
                      ? 'Publishing...'
                      : selectedMsg.status === 'replied'
                      ? `Update Reply on ${selectedMsg.platform}`
                      : `Publish Reply to ${selectedMsg.platform}`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Manual Message Creation & Inbound Webhook API */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-neutral-800 bg-neutral-900 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquarePlus className="h-4 w-4 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  Community Inbox Data Ingestion
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Mode Switcher */}
            <div className="flex items-center gap-1 p-1 bg-neutral-950 border border-neutral-800 rounded-xl">
              <button
                onClick={() => setModalTab('sync-post')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                  modalTab === 'sync-post'
                    ? 'bg-neutral-800 text-emerald-400'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Link2 className="h-3.5 w-3.5" />
                <span>Sync Post URL</span>
              </button>
              <button
                onClick={() => setModalTab('manual')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                  modalTab === 'manual'
                    ? 'bg-neutral-800 text-emerald-400'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Log Comment</span>
              </button>
              <button
                onClick={() => setModalTab('webhook')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                  modalTab === 'webhook'
                    ? 'bg-neutral-800 text-emerald-400'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Webhook className="h-3.5 w-3.5" />
                <span>Webhook API</span>
              </button>
            </div>

            {modalTab === 'sync-post' ? (
              <form onSubmit={handleSyncSinglePost} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                    LinkedIn / Social Post URL or Share URN *
                  </label>
                  <input
                    type="text"
                    required
                    value={postUrlInput}
                    onChange={e => setPostUrlInput(e.target.value)}
                    placeholder="e.g. https://www.linkedin.com/feed/update/urn:li:activity:7521440974246686720"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Enter the LinkedIn post URL. The system reads metadata directly from LinkedIn API and imports live audience comments.
                  </p>
                </div>

                {syncPostResult?.rateLimited && (
                  <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-950/20 space-y-2">
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>LinkedIn API Daily Quota Active (429: APPLICATION_AND_MEMBER DAY limit)</span>
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      LinkedIn API confirms this post has <strong>{syncPostResult.commentCount ?? 2} comments</strong>! Because LinkedIn limits automated member queries to prevent scraping abuse, you can paste the comment text directly to immediately run AI intent analysis and draft responses.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setManualPlatform('LinkedIn');
                        setManualType('comment');
                        setModalTab('manual');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition-colors"
                    >
                      Paste / Log Comment Now
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={isSyncingPost}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-xs font-bold text-neutral-950"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isSyncingPost ? 'animate-spin' : ''}`} />
                    <span>{isSyncingPost ? 'Querying LinkedIn...' : 'Sync Post Comments'}</span>
                  </button>
                </div>
              </form>
            ) : modalTab === 'manual' ? (
              <form onSubmit={handleCreateInboundMessage} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                      Sender Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={manualSender}
                      onChange={e => setManualSender(e.target.value)}
                      placeholder="e.g. Tanvir Ahmed"
                      className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                      Role / Title
                    </label>
                    <input
                      type="text"
                      value={manualRole}
                      onChange={e => setManualRole(e.target.value)}
                      placeholder="e.g. Head of Growth"
                      className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                      Company
                    </label>
                    <input
                      type="text"
                      value={manualCompany}
                      onChange={e => setManualCompany(e.target.value)}
                      placeholder="e.g. NextOrbit SaaS"
                      className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                      Social Platform
                    </label>
                    <select
                      value={manualPlatform}
                      onChange={e => setManualPlatform(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Facebook">Facebook</option>
                      <option value="X">X (Twitter)</option>
                      <option value="YouTube">YouTube</option>
                      <option value="Instagram">Instagram</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                      Interaction Type
                    </label>
                    <select
                      value={manualType}
                      onChange={e => setManualType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="comment">Comment</option>
                      <option value="dm">Direct Message (DM)</option>
                      <option value="mention">Brand Mention</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                    Inbound Comment / Message Text *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={manualText}
                    onChange={e => setManualText(e.target.value)}
                    placeholder="Paste or type a prospect's comment or question—AI will automatically classify buying intent, sentiment, and draft a reply..."
                    className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingManual || !manualText.trim()}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-neutral-950 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>
                      {isSubmittingManual ? 'Analyzing & Saving...' : 'Analyze with AI & Add to Inbox'}
                    </span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Push external social comments, DMs, or Zapier/Make events directly into the SQL-backed Community Inbox. The server automatically classifies buying intent and drafts a reply.
                </p>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-neutral-400">
                    Webhook Endpoint (POST)
                  </span>
                  <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-neutral-950 border border-neutral-800">
                    <code className="text-xs text-emerald-400 font-mono truncate">
                      POST {webhookUrl}
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(webhookUrl);
                        setCopiedWebhook(true);
                        setTimeout(() => setCopiedWebhook(false), 2000);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200 flex items-center gap-1 shrink-0"
                    >
                      {copiedWebhook ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy URL</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-neutral-400">
                    JSON Payload Schema
                  </span>
                  <pre className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-300 font-mono overflow-x-auto">
                    {sampleWebhookPayload}
                  </pre>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={handleSimulateWebhookCall}
                    disabled={isSubmittingManual}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-neutral-950 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Webhook className="h-3.5 w-3.5" />
                    <span>
                      {isSubmittingManual ? 'Dispatching...' : 'Send Test Webhook Event Now'}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
