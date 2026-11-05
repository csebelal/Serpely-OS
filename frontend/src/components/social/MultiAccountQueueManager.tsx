import React, { useState } from 'react';
import {
  Users,
  Plus,
  Tv,
  Smartphone,
  CheckCircle2,
  Clock,
  Layers,
  ShieldCheck,
  AlertTriangle,
  Play,
  RotateCcw,
  Check,
  Settings,
  ExternalLink,
  Sliders
} from 'lucide-react';
import { SocialChannelAccount, YouTubeVideoProject } from '../../types';

interface MultiAccountQueueManagerProps {
  channels: SocialChannelAccount[];
  videos: YouTubeVideoProject[];
  onAddChannel: (channel: SocialChannelAccount) => void;
  onUpdateChannel: (channel: SocialChannelAccount) => void;
  onUpdateVideo: (video: YouTubeVideoProject) => void;
}

export const MultiAccountQueueManager: React.FC<MultiAccountQueueManagerProps> = ({
  channels,
  videos,
  onAddChannel,
  onUpdateChannel,
  onUpdateVideo
}) => {
  const [selectedChannelId, setSelectedChannelId] = useState<string>(channels[0]?.id || '');
  const [isAddingChannel, setIsAddingChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelHandle, setNewChannelHandle] = useState('');
  const [newPlatform, setNewPlatform] = useState<SocialChannelAccount['platform']>('YouTube');
  const [newCategory, setNewCategory] = useState<'official_brand' | 'personal_founder' | 'micro_content' | 'insights'>('micro_content');
  const [newDailyLimit, setNewDailyLimit] = useState(3);
  const [notification, setNotification] = useState<string | null>(null);

  const activeChannel = channels.find(c => c.id === selectedChannelId) || channels[0];
  const channelVideos = videos.filter(v => v.targetChannelId === activeChannel?.id);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleCreateChannel = () => {
    if (!newChannelName.trim() || !newChannelHandle.trim()) return;

    const newChan: SocialChannelAccount = {
      id: `ch-${Date.now()}`,
      name: newChannelName,
      handle: newChannelHandle.startsWith('@') ? newChannelHandle : `@${newChannelHandle}`,
      platform: newPlatform,
      category: newCategory,
      followerCount: 1200,
      dailyUploadLimit: newDailyLimit,
      queuedCount: 0,
      status: 'connected',
      lastUploadAt: 'Never'
    };

    onAddChannel(newChan);
    setSelectedChannelId(newChan.id);
    setIsAddingChannel(false);
    setNewChannelName('');
    setNewChannelHandle('');
    showNotification(`Channel "${newChan.name}" connected with AutoSocial dispatch queue.`);
  };

  const toggleChannelStatus = (ch: SocialChannelAccount) => {
    const newStatus = ch.status === 'connected' ? 'paused' : 'connected';
    const updated = { ...ch, status: newStatus as any };
    onUpdateChannel(updated);
    showNotification(`Channel ${ch.handle} status updated to ${newStatus}.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-neutral-900/40 border border-neutral-800">
        <div>
          <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-400" />
            <span>Multi-Account Channel & Publishing Queues</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Manage separate publishing quotas, rate limits, and scheduling queues across brand, founder, and growth channels.
          </p>
        </div>

        <button
          onClick={() => setIsAddingChannel(true)}
          className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition-colors flex items-center gap-1.5 shrink-0 shadow-sm"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Connect Social Channel</span>
        </button>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-300 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-neutral-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Connected Channel Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {channels.map(ch => (
          <div
            key={ch.id}
            onClick={() => setSelectedChannelId(ch.id)}
            className={`cursor-pointer rounded-xl border p-4 transition-all space-y-3 ${
              selectedChannelId === ch.id
                ? 'bg-neutral-900 border-emerald-400 ring-2 ring-emerald-400/20 shadow-md'
                : 'bg-neutral-900/40 border-neutral-800 hover:border-neutral-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    ch.platform === 'YouTube'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : ch.platform === 'TikTok'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : ch.platform === 'Instagram'
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : 'bg-neutral-800 text-white'
                  }`}
                >
                  {ch.platform === 'YouTube' ? <Tv className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white line-clamp-1">{ch.name}</h4>
                  <span className="text-[11px] font-mono text-neutral-400">{ch.handle}</span>
                </div>
              </div>

              <span
                className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                  ch.status === 'connected'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-amber-500/20 text-amber-300'
                }`}
              >
                {ch.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-800 text-[11px] font-mono">
              <div>
                <span className="text-neutral-500 block text-[10px]">AUDIENCE:</span>
                <strong className="text-white tabular-nums">{ch.followerCount.toLocaleString()}</strong>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">DAILY QUOTA:</span>
                <strong className="text-emerald-400 tabular-nums">
                  {ch.queuedCount} / {ch.dailyUploadLimit} slots
                </strong>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-[10px] text-neutral-500 font-mono">
              <span>Last upload: {ch.lastUploadAt || 'Never'}</span>
              <button
                onClick={e => {
                  e.stopPropagation();
                  toggleChannelStatus(ch);
                }}
                className="text-xs text-neutral-400 hover:text-white"
              >
                {ch.status === 'connected' ? 'Pause' : 'Resume'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Active Channel Publishing Queue Section */}
      {activeChannel && (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">
                  Active Queue: {activeChannel.name} ({activeChannel.handle})
                </h4>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                  {activeChannel.platform}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                AutoSocial rate-limiting safely paces video releases to maximize algorithm distribution without shadowbans.
              </p>
            </div>

            <div className="text-xs font-mono text-neutral-400">
              Assigned Videos in Queue: <strong className="text-white">{channelVideos.length}</strong>
            </div>
          </div>

          {channelVideos.length === 0 ? (
            <div className="p-8 text-center space-y-2 rounded-xl bg-neutral-950 border border-neutral-800/80">
              <Clock className="h-6 w-6 text-neutral-500 mx-auto" />
              <div className="text-xs font-semibold text-neutral-300">No videos currently assigned to this channel queue</div>
              <p className="text-[11px] text-neutral-500 max-w-md mx-auto">
                Open the YouTube & Short-Form Video Studio tab to create a new Short or Long-Form video and target {activeChannel.handle}.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {channelVideos.map((vid, idx) => (
                <div
                  key={vid.id}
                  className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 space-y-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold uppercase">
                        {vid.format} · {vid.durationSeconds}s
                      </span>
                      <span className="text-[11px] font-mono text-neutral-400">
                        Queue Position #{idx + 1}
                      </span>
                      <span
                        className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                          vid.status === 'published'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : vid.status === 'scheduled'
                            ? 'bg-cyan-500/20 text-cyan-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {vid.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h5 className="text-sm font-bold text-white">{vid.title}</h5>
                    <p className="text-xs text-neutral-400 line-clamp-1">
                      Hook: "{vid.hooks.find(h => h.isSelected)?.text || vid.hooks[0]?.text}"
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {vid.metrics && (
                      <div className="text-right text-[11px] font-mono pr-3 border-r border-neutral-800 hidden md:block">
                        <span className="text-neutral-500 block text-[9px]">VIEWS</span>
                        <strong className="text-white">{vid.metrics.views?.toLocaleString()}</strong>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const newStatus = vid.status === 'scheduled' ? 'draft' : 'scheduled';
                          onUpdateVideo({ ...vid, status: newStatus as any });
                          showNotification(`Video status updated to ${newStatus}.`);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono transition-colors"
                      >
                        {vid.status === 'scheduled' ? 'Hold' : 'Schedule'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Connect Social Channel */}
      {isAddingChannel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-400" />
                <span>Connect Social Channel Account</span>
              </h3>
              <button onClick={() => setIsAddingChannel(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-400 font-mono block mb-1">Platform</label>
                <select
                  value={newPlatform}
                  onChange={e => setNewPlatform(e.target.value as any)}
                  className="w-full p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white font-mono"
                >
                  <option value="YouTube">YouTube</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Threads">Threads (Meta)</option>
                  <option value="Bluesky">Bluesky (AT Protocol)</option>
                  <option value="Instagram">Instagram Reels</option>
                  <option value="LinkedIn">LinkedIn Video</option>
                  <option value="X">X (Twitter)</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-400 font-mono block mb-1">Channel Display Name</label>
                <input
                  type="text"
                  placeholder="e.g. Serpely Engineering Shorts"
                  value={newChannelName}
                  onChange={e => setNewChannelName(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white"
                />
              </div>

              <div>
                <label className="text-neutral-400 font-mono block mb-1">Handle / Username</label>
                <input
                  type="text"
                  placeholder="e.g. @serpely_eng"
                  value={newChannelHandle}
                  onChange={e => setNewChannelHandle(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-neutral-400 font-mono block mb-1">Channel Strategy Category</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white"
                >
                  <option value="official_brand">Official Brand Main</option>
                  <option value="micro_content">Micro-Content & Daily Shorts</option>
                  <option value="personal_founder">Personal Founder Channel</option>
                  <option value="insights">Technical Research / Insights</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-400 font-mono block mb-1">Daily Upload Safety Limit</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={newDailyLimit}
                  onChange={e => setNewDailyLimit(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white font-mono"
                />
                <span className="text-[10px] text-neutral-500 mt-1 block">
                  Prevents platform spam filters from flagging rapid-fire uploads.
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                onClick={() => setIsAddingChannel(false)}
                className="px-4 py-2 rounded-lg bg-neutral-900 text-neutral-300 hover:bg-neutral-800 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateChannel}
                disabled={!newChannelName.trim() || !newChannelHandle.trim()}
                className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition-colors disabled:opacity-50"
              >
                Connect Channel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
