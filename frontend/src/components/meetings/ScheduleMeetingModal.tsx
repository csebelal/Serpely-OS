import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Video,
  User,
  Mail,
  Building2,
  FileText,
  CheckCircle2,
  Sparkles,
  Link2,
  Phone,
  Send,
  AlertCircle
} from 'lucide-react';
import { MeetingItem, MeetingType, MeetingPlatform, LeadItem } from '../../types';
import { SlackIcon, DiscordIcon } from '../social/SocialPlatformIcons';

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMeetingScheduled: (meeting: MeetingItem) => void;
  brandName?: string;
  initialLead?: LeadItem | null;
  editingMeeting?: MeetingItem | null;
  availableLeads?: LeadItem[];
}

export const ScheduleMeetingModal: React.FC<ScheduleMeetingModalProps> = ({
  isOpen,
  onClose,
  onMeetingScheduled,
  brandName = 'Sincly',
  initialLead,
  editingMeeting,
  availableLeads = []
}) => {
  if (!isOpen) return null;

  // Form states
  const [title, setTitle] = useState<string>(
    editingMeeting?.title ||
      (initialLead
        ? `Strategic IT & Architecture Discovery with ${initialLead.name}`
        : 'Enterprise IT & GEO Architecture Audit')
  );
  const [type, setType] = useState<MeetingType>(editingMeeting?.type || 'strategy_audit');
  const [scheduledDate, setScheduledDate] = useState<string>(
    editingMeeting?.scheduledDate || new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [scheduledTime, setScheduledTime] = useState<string>(editingMeeting?.scheduledTime || '03:00 PM');
  const [durationMinutes, setDurationMinutes] = useState<number>(editingMeeting?.durationMinutes || 45);
  const [timezone, setTimezone] = useState<string>(editingMeeting?.timezone || 'GMT+6 (Dhaka)');
  const [platform, setPlatform] = useState<MeetingPlatform>(editingMeeting?.platform || 'google_meet');
  const [meetingUrl, setMeetingUrl] = useState<string>(
    editingMeeting?.meetingUrl ||
      `https://meet.google.com/${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`
  );

  // Client info
  const [clientName, setClientName] = useState<string>(
    editingMeeting?.clientName || initialLead?.name || ''
  );
  const [clientEmail, setClientEmail] = useState<string>(
    editingMeeting?.clientEmail || initialLead?.email || ''
  );
  const [clientCompany, setClientCompany] = useState<string>(
    editingMeeting?.clientCompany || initialLead?.company || ''
  );
  const [clientPhone, setClientPhone] = useState<string>(
    editingMeeting?.clientPhone || '+880 1711-000000'
  );
  const [agenda, setAgenda] = useState<string>(
    editingMeeting?.agenda ||
      'Review current technical infrastructure, discuss high-availability failover, and audit AI search visibility.'
  );
  const [notes, setNotes] = useState<string>(editingMeeting?.notes || '');
  const [leadId, setLeadId] = useState<string | undefined>(editingMeeting?.leadId || initialLead?.id);

  // Notifications
  const [notifySlack, setNotifySlack] = useState<boolean>(editingMeeting ? editingMeeting.notifySlack : true);
  const [notifyDiscord, setNotifyDiscord] = useState<boolean>(editingMeeting ? editingMeeting.notifyDiscord : true);
  const [notifyEmail, setNotifyEmail] = useState<boolean>(editingMeeting ? editingMeeting.notifyEmail : true);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Regenerate Meeting URL when platform changes
  const handlePlatformChange = (p: MeetingPlatform) => {
    setPlatform(p);
    const randPart = `${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 6)}`;
    if (p === 'google_meet') {
      setMeetingUrl(`https://meet.google.com/${randPart}`);
    } else if (p === 'zoom') {
      setMeetingUrl(`https://zoom.us/j/${Math.floor(1000000000 + Math.random() * 9000000000)}`);
    } else if (p === 'teams') {
      setMeetingUrl(`https://teams.microsoft.com/l/meetup-join/${randPart}`);
    } else {
      setMeetingUrl('Direct Phone Consultation');
    }
  };

  // Handle lead selection autocomplete
  const handleSelectLead = (selectedId: string) => {
    const l = availableLeads.find(item => item.id === selectedId);
    if (l) {
      setLeadId(l.id);
      setClientName(l.name);
      setClientEmail(l.email || '');
      setClientCompany(l.company || '');
      setTitle(`Strategic Call with ${l.name} (${l.company || 'Enterprise'})`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !clientName.trim() || !clientEmail.trim()) {
      setErrorMsg('Please enter meeting title, client name, and valid email.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const meetingPayload: Partial<MeetingItem> = {
      title: title.trim(),
      type,
      scheduledDate,
      scheduledTime,
      durationMinutes,
      timezone,
      platform,
      meetingUrl: meetingUrl.trim(),
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim(),
      clientCompany: clientCompany.trim(),
      clientPhone: clientPhone.trim(),
      agenda: agenda.trim(),
      notes: notes.trim(),
      status: 'confirmed',
      leadId,
      notifySlack,
      notifyDiscord,
      notifyEmail
    };

    try {
      const endpoint = editingMeeting ? `/api/meetings/${editingMeeting.id}` : '/api/meetings';
      const method = editingMeeting ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meetingPayload)
      });

      if (res.ok) {
        const data = await res.json();
        onMeetingScheduled(data.meeting);
        onClose();
      } else {
        const err = await res.json();
        setErrorMsg(err.error || 'Failed to save meeting.');
      }
    } catch (err: any) {
      // Local fallback in offline mode
      const fallbackMeeting: MeetingItem = {
        id: editingMeeting?.id || `meet-${Date.now()}`,
        ...(meetingPayload as any),
        createdAt: 'Just now'
      };
      onMeetingScheduled(fallbackMeeting);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden text-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-800 bg-neutral-900/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{editingMeeting ? 'Reschedule / Edit Meeting' : 'Schedule New Client Meeting'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  SLACK & DISCORD INTEGRATED
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                Generate video meeting links, auto-notify team channels, and sync with Lead CRM.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-950/50 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Lead Autocomplete (if leads available) */}
          {availableLeads.length > 0 && !editingMeeting && (
            <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-3">
              <span className="text-xs text-neutral-400 flex items-center gap-1.5 shrink-0">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                <span>Link with Existing Lead:</span>
              </span>
              <select
                value={leadId || ''}
                onChange={e => handleSelectLead(e.target.value)}
                className="bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 w-full max-w-xs"
              >
                <option value="">-- Manual Entry / Custom Client --</option>
                {availableLeads.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.company || 'Direct'}) - {l.email}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Meeting Title & Type */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                Meeting Title <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                placeholder="e.g. Enterprise IT Architecture & Failover Audit"
                className="w-full px-4 py-2.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'strategy_audit', label: '📊 Strategy Audit' },
                { id: 'client_demo', label: '🚀 Product Demo' },
                { id: 'discovery_call', label: '🔍 Discovery Call' },
                { id: 'technical_support', label: '🛠️ Tech Support' }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id as MeetingType)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-left ${
                    type === t.id
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-sm'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date, Time, Duration & Timezone */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                <Calendar className="inline h-3.5 w-3.5 text-neutral-400 mr-1" />
                Date
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={e => setScheduledDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                <Clock className="inline h-3.5 w-3.5 text-neutral-400 mr-1" />
                Time
              </label>
              <select
                value={scheduledTime}
                onChange={e => setScheduledTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                {[
                  '09:00 AM',
                  '10:00 AM',
                  '11:00 AM',
                  '11:30 AM',
                  '01:00 PM',
                  '02:00 PM',
                  '03:00 PM',
                  '04:00 PM',
                  '05:00 PM',
                  '07:30 PM',
                  '09:00 PM'
                ].map(tm => (
                  <option key={tm} value={tm}>
                    {tm}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">Duration</label>
              <select
                value={durationMinutes}
                onChange={e => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value={15}>15 Minutes (Speed Sync)</option>
                <option value={30}>30 Minutes (Standard)</option>
                <option value={45}>45 Minutes (Full Audit)</option>
                <option value={60}>60 Minutes (Deep Dive)</option>
              </select>
            </div>
          </div>

          {/* Platform & Meeting URL */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
            <label className="block text-xs font-bold text-neutral-300">
              Meeting Platform & Video Link
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'google_meet', label: 'Google Meet', icon: Video },
                { id: 'zoom', label: 'Zoom Video', icon: Video },
                { id: 'teams', label: 'MS Teams', icon: Video },
                { id: 'phone', label: 'Phone Call', icon: Phone }
              ].map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePlatformChange(p.id as MeetingPlatform)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    platform === p.id
                      ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-sm'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  <p.icon className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{p.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] font-mono text-neutral-400 shrink-0">Meeting URL:</span>
              <input
                type="text"
                value={meetingUrl}
                onChange={e => setMeetingUrl(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Client Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                <User className="inline h-3.5 w-3.5 text-neutral-400 mr-1" />
                Client Name <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                required
                placeholder="e.g. Tanvir Hossain"
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                <Mail className="inline h-3.5 w-3.5 text-neutral-400 mr-1" />
                Client Email <span className="text-emerald-400">*</span>
              </label>
              <input
                type="email"
                value={clientEmail}
                onChange={e => setClientEmail(e.target.value)}
                required
                placeholder="tanvir@company.com"
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                <Building2 className="inline h-3.5 w-3.5 text-neutral-400 mr-1" />
                Company / Organization
              </label>
              <input
                type="text"
                value={clientCompany}
                onChange={e => setClientCompany(e.target.value)}
                placeholder="e.g. Apex Industrial Holdings"
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                <Phone className="inline h-3.5 w-3.5 text-neutral-400 mr-1" />
                Phone Number
              </label>
              <input
                type="text"
                value={clientPhone}
                onChange={e => setClientPhone(e.target.value)}
                placeholder="+880 1711-223344"
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Discussion Agenda */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1.5">
              <FileText className="inline h-3.5 w-3.5 text-neutral-400 mr-1" />
              Agenda / Key Discussion Topics
            </label>
            <textarea
              rows={2}
              value={agenda}
              onChange={e => setAgenda(e.target.value)}
              placeholder="Outline specific pain points, deliverables, or audit requirements to cover during the call..."
              className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Instant Dispatch & Notification Channels */}
          <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800 space-y-2.5">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Send className="h-3.5 w-3.5 text-emerald-400" />
              <span>Automated Meeting Alerts & Notifications</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-neutral-800 bg-neutral-900/60 cursor-pointer hover:bg-neutral-900 transition-colors">
                <input
                  type="checkbox"
                  checked={notifySlack}
                  onChange={e => setNotifySlack(e.target.checked)}
                  className="rounded text-emerald-500 focus:ring-0 bg-neutral-950 border-neutral-700"
                />
                <SlackIcon className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-semibold text-neutral-200">Post to Slack</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-neutral-800 bg-neutral-900/60 cursor-pointer hover:bg-neutral-900 transition-colors">
                <input
                  type="checkbox"
                  checked={notifyDiscord}
                  onChange={e => setNotifyDiscord(e.target.checked)}
                  className="rounded text-emerald-500 focus:ring-0 bg-neutral-950 border-neutral-700"
                />
                <DiscordIcon className="h-4 w-4 text-indigo-400 shrink-0" />
                <span className="text-xs font-semibold text-neutral-200">Post to Discord</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-neutral-800 bg-neutral-900/60 cursor-pointer hover:bg-neutral-900 transition-colors">
                <input
                  type="checkbox"
                  checked={notifyEmail}
                  onChange={e => setNotifyEmail(e.target.checked)}
                  className="rounded text-emerald-500 focus:ring-0 bg-neutral-950 border-neutral-700"
                />
                <Mail className="h-4 w-4 text-amber-400 shrink-0" />
                <span className="text-xs font-semibold text-neutral-200">Email Calendar Invite</span>
              </label>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Scheduling Call...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{editingMeeting ? 'Save Changes' : 'Confirm & Dispatch Meeting'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
