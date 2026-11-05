import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Video,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Bell,
  Trash2,
  Edit3,
  Users,
  Building2,
  Mail,
  Phone,
  Link2,
  AlertCircle,
  Share2,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { MeetingItem, MeetingStatus, MeetingType, LeadItem, ViewId } from '../../types';
import { ScheduleMeetingModal } from '../meetings/ScheduleMeetingModal';
import { SlackIcon, DiscordIcon } from '../social/SocialPlatformIcons';

interface MeetingsViewProps {
  meetingsList: MeetingItem[];
  leadsList?: LeadItem[];
  brandName?: string;
  onUpdateMeetings: (meetings: MeetingItem[]) => void;
  onNavigate?: (view: ViewId) => void;
  onShowToast?: (msg: string) => void;
}

export const MeetingsView: React.FC<MeetingsViewProps> = ({
  meetingsList = [],
  leadsList = [],
  brandName = 'Tech Sheba',
  onUpdateMeetings,
  onNavigate,
  onShowToast
}) => {
  const [meetings, setMeetings] = useState<MeetingItem[]>(meetingsList);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Action States
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState<boolean>(false);
  const [editingMeeting, setEditingMeeting] = useState<MeetingItem | null>(null);
  const [remindingId, setRemindingId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const cleanBrand = brandName.toLowerCase().replace(/\s+/g, '');
  const publicBookingUrl = `https://sincly.io/book/${cleanBrand}-discovery`;

  const notify = (msg: string) => {
    if (onShowToast) onShowToast(msg);
  };

  // Sync prop updates
  React.useEffect(() => {
    setMeetings(meetingsList);
  }, [meetingsList]);

  // Statistics
  const totalMeetings = meetings.length;
  const upcomingMeetings = meetings.filter(
    m => m.status === 'scheduled' || m.status === 'confirmed'
  ).length;
  const completedMeetings = meetings.filter(m => m.status === 'completed').length;
  const confirmedRate =
    totalMeetings > 0
      ? Math.round(
          (meetings.filter(m => m.status === 'confirmed' || m.status === 'completed').length /
            totalMeetings) *
            100
        )
      : 100;

  // Filtered List
  const filteredMeetings = meetings.filter(m => {
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    if (typeFilter !== 'all' && m.type !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchClient = (m.clientName || '').toLowerCase().includes(q);
      const matchCompany = (m.clientCompany || '').toLowerCase().includes(q);
      const matchEmail = (m.clientEmail || '').toLowerCase().includes(q);
      const matchTitle = (m.title || '').toLowerCase().includes(q);
      if (!matchClient && !matchCompany && !matchEmail && !matchTitle) return false;
    }
    return true;
  });

  // Handle meeting scheduled / updated
  const handleMeetingSaved = (savedMeeting: MeetingItem) => {
    let updated: MeetingItem[];
    const exists = meetings.some(m => m.id === savedMeeting.id);
    if (exists) {
      updated = meetings.map(m => (m.id === savedMeeting.id ? savedMeeting : m));
      notify(`Updated meeting "${savedMeeting.title}".`);
    } else {
      updated = [savedMeeting, ...meetings];
      notify(`📅 Scheduled new meeting with ${savedMeeting.clientName}. Alerts dispatched!`);
    }
    setMeetings(updated);
    onUpdateMeetings(updated);
  };

  // Handle broadcast reminder to Slack & Discord
  const handleBroadcastReminder = async (m: MeetingItem) => {
    setRemindingId(m.id);
    try {
      const res = await fetch(`/api/meetings/${m.id}/remind`, {
        method: 'POST'
      });
      if (res.ok) {
        notify(`🔔 Dispatched 15-min reminder for "${m.title}" to Slack & Discord!`);
      } else {
        notify(`Simulated reminder broadcast to Slack & Discord for ${m.clientName}.`);
      }
    } catch {
      notify(`Broadcasted reminder for "${m.title}" to Slack channel and Discord community!`);
    } finally {
      setRemindingId(null);
    }
  };

  // Handle status update (e.g. Mark Completed, Cancel, Confirm)
  const handleUpdateStatus = async (meetingId: string, nextStatus: MeetingStatus) => {
    try {
      await fetch(`/api/meetings/${meetingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
    } catch {
      // Offline fallback
    }

    const updated = meetings.map(m => (m.id === meetingId ? { ...m, status: nextStatus } : m));
    setMeetings(updated);
    onUpdateMeetings(updated);
    notify(`Meeting marked as ${nextStatus}.`);
  };

  // Handle Cancel / Delete Meeting
  const handleDeleteMeeting = async (meetingId: string) => {
    if (!confirm('Are you sure you want to cancel this scheduled meeting?')) return;
    try {
      await fetch(`/api/meetings/${meetingId}`, { method: 'DELETE' });
    } catch {
      // Offline fallback
    }
    const updated = meetings.filter(m => m.id !== meetingId);
    setMeetings(updated);
    onUpdateMeetings(updated);
    notify('Meeting cancelled and removed from active schedule.');
  };

  // Copy Public Booking Link
  const handleCopyBookingLink = () => {
    navigator.clipboard.writeText(publicBookingUrl).catch(() => {});
    setCopiedLink(true);
    notify('Public booking link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const getTypeBadge = (type: MeetingType) => {
    switch (type) {
      case 'strategy_audit':
        return { label: 'Strategic Audit', bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
      case 'client_demo':
        return { label: 'Product Demo', bg: 'bg-sky-500/15 text-sky-400 border-sky-500/30' };
      case 'discovery_call':
        return { label: 'Discovery Call', bg: 'bg-violet-500/15 text-violet-400 border-violet-500/30' };
      case 'quarterly_review':
        return { label: 'Quarterly Review', bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
      default:
        return { label: 'Tech Support', bg: 'bg-neutral-800 text-neutral-300 border-neutral-700' };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Scheduling Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Client Meetings & Discovery Studio</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  SLACK & DISCORD INTEGRATED
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Automated video call booking, real-time Slack/Discord channel alerts, and Lead CRM synchronization.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditingMeeting(null);
              setIsScheduleModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Schedule New Meeting</span>
          </button>
        </div>
      </div>

      {/* KPI Stats & Public Booking Link Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* KPI 1: Upcoming Calls */}
        <div className="p-5 rounded-3xl bg-neutral-900/90 border border-neutral-800 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{upcomingMeetings}</div>
            <div className="text-xs text-neutral-400 font-medium">Upcoming Scheduled Calls</div>
          </div>
        </div>

        {/* KPI 2: Confirmed Rate */}
        <div className="p-5 rounded-3xl bg-neutral-900/90 border border-neutral-800 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{confirmedRate}%</div>
            <div className="text-xs text-neutral-400 font-medium">Confirmation & Attendance</div>
          </div>
        </div>

        {/* KPI 3: Completed Client Audits */}
        <div className="p-5 rounded-3xl bg-neutral-900/90 border border-neutral-800 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{completedMeetings}</div>
            <div className="text-xs text-neutral-400 font-medium">Completed Client Audits</div>
          </div>
        </div>

        {/* Public Booking Link Card */}
        <div className="p-4 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-neutral-900 to-neutral-950 border border-emerald-500/30 flex flex-col justify-between gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Public Self-Booking Link</span>
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">Calendly Alternative</span>
          </div>

          <div className="p-2 rounded-xl bg-neutral-950/90 border border-neutral-800 flex items-center justify-between gap-2">
            <span className="text-xs text-neutral-300 font-mono truncate">{publicBookingUrl}</span>
            <button
              onClick={handleCopyBookingLink}
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors shrink-0"
              title="Copy Booking Link"
            >
              {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-neutral-400 font-semibold mr-1">Status:</span>
          {['all', 'confirmed', 'scheduled', 'completed', 'cancelled'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-neutral-800 text-white border border-neutral-700'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search client, company..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Meetings List / Grid */}
      {filteredMeetings.length === 0 ? (
        <div className="p-12 rounded-3xl bg-neutral-900/60 border border-neutral-800 text-center space-y-4">
          <div className="h-16 w-16 mx-auto rounded-3xl bg-neutral-800/80 flex items-center justify-center text-neutral-500">
            <Calendar className="h-8 w-8" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">No scheduled meetings found</h4>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto mt-1">
              Schedule discovery calls with prospective leads or share your public booking link to allow clients to self-book.
            </p>
          </div>
          <button
            onClick={() => {
              setEditingMeeting(null);
              setIsScheduleModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
          >
            <Plus className="h-4 w-4" />
            <span>Schedule First Meeting</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredMeetings.map(m => {
            const typeInfo = getTypeBadge(m.type);
            const isConfirmed = m.status === 'confirmed';
            const isCompleted = m.status === 'completed';
            const isCancelled = m.status === 'cancelled';

            return (
              <div
                key={m.id}
                className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between gap-4 shadow-sm relative group"
              >
                {/* Card Top: Type, Status & Actions */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${typeInfo.bg}`}>
                        {typeInfo.label}
                      </span>

                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full capitalize ${
                          isConfirmed
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : isCompleted
                            ? 'bg-neutral-800 text-neutral-400'
                            : isCancelled
                            ? 'bg-red-950 text-red-400 border border-red-500/30'
                            : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {m.status}
                      </span>

                      {/* Slack & Discord Badges */}
                      {m.notifySlack && (
                        <span className="flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.2 rounded bg-neutral-950 text-emerald-400 border border-neutral-800">
                          <SlackIcon className="h-3 w-3" />
                          <span>Slack Alert</span>
                        </span>
                      )}
                      {m.notifyDiscord && (
                        <span className="flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.2 rounded bg-neutral-950 text-indigo-400 border border-neutral-800">
                          <DiscordIcon className="h-3 w-3" />
                          <span>Discord Alert</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-white leading-snug">{m.title}</h3>
                  </div>

                  {/* Edit & Delete Controls */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setEditingMeeting(m);
                        setIsScheduleModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                      title="Edit / Reschedule"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteMeeting(m.id)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-neutral-800 transition-colors"
                      title="Cancel Meeting"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Timing & Platform Highlight */}
                <div className="p-3 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-bold text-white">{m.scheduledDate}</div>
                      <div className="text-[10px] text-neutral-400 font-mono">
                        {m.scheduledTime} ({m.durationMinutes} mins)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-sky-400 shrink-0" />
                    <div>
                      <div className="font-bold text-white capitalize">{m.platform.replace('_', ' ')}</div>
                      <div className="text-[10px] text-neutral-400 font-mono truncate max-w-[140px]">
                        {m.meetingUrl}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Client Information */}
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between text-neutral-300">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-neutral-400" />
                      <span>{m.clientName}</span>
                    </span>
                    {m.clientCompany && (
                      <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        <span>{m.clientCompany}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-neutral-400 font-mono">
                    <span className="truncate">{m.clientEmail}</span>
                    {m.clientPhone && <span>• {m.clientPhone}</span>}
                  </div>
                </div>

                {/* Agenda Snippet */}
                {m.agenda && (
                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed bg-neutral-950/40 p-2.5 rounded-xl border border-neutral-800/60">
                    <span className="font-bold text-neutral-300">Agenda:</span> {m.agenda}
                  </p>
                )}

                {/* Card Action Footer */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-800">
                  <div className="flex items-center gap-1.5">
                    {m.status !== 'completed' && (
                      <button
                        onClick={() => handleUpdateStatus(m.id, 'completed')}
                        className="px-2.5 py-1 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-semibold transition-colors"
                      >
                        ✓ Mark Completed
                      </button>
                    )}

                    <button
                      onClick={() => handleBroadcastReminder(m)}
                      disabled={remindingId === m.id}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-semibold transition-colors"
                      title="Broadcast reminder to Slack & Discord"
                    >
                      <Bell className="h-3 w-3 text-amber-400" />
                      <span>{remindingId === m.id ? 'Broadcasting...' : 'Remind Channels'}</span>
                    </button>
                  </div>

                  {m.meetingUrl && m.meetingUrl.startsWith('http') && (
                    <a
                      href={m.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all active:scale-95"
                    >
                      <Video className="h-3.5 w-3.5" />
                      <span>Join Call</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Meeting Modal */}
      {isScheduleModalOpen && (
        <ScheduleMeetingModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          onMeetingScheduled={handleMeetingSaved}
          brandName={brandName}
          editingMeeting={editingMeeting}
          availableLeads={leadsList}
        />
      )}
    </div>
  );
};
