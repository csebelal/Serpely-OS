import React, { useState, useEffect } from 'react';
import {
  Database,
  BookOpen,
  CheckCircle2,
  Search,
  Globe,
  RefreshCw,
  Plus,
  Trash2,
  Edit3,
  Save,
  Sparkles,
  FileText,
  Brain,
  ShieldCheck,
  Eye,
  X
} from 'lucide-react';
import {
  mockBrandProfile,
  mockMemories,
  mockCampaigns,
  mockContentList
} from '../../data/mock-data';
import {
  AgentId,
  BrandProfile,
  CampaignItem,
  ContentItem,
  KnowledgeDoc,
  MemoryItem
} from '../../types';

interface MarketingHubViewProps {
  brandProfile?: BrandProfile;
  memoriesList?: MemoryItem[];
  campaignsList?: CampaignItem[];
  contentList?: ContentItem[];
  onUpdateBrandProfile?: (profile: BrandProfile) => void;
  onStateSynced?: (state: any) => void;
}

export const MarketingHubView: React.FC<MarketingHubViewProps> = ({
  brandProfile = mockBrandProfile,
  memoriesList = mockMemories,
  campaignsList = mockCampaigns,
  contentList = mockContentList,
  onUpdateBrandProfile,
  onStateSynced
}) => {
  const [activeTab, setActiveTab] = useState<
    'brand' | 'kb' | 'agent-mem' | 'campaign-mem' | 'content-mem'
  >('brand');
  const [searchQuery, setSearchQuery] = useState('');
  const [contentSearch, setContentSearch] = useState('');
  const [memories, setMemories] = useState<MemoryItem[]>(memoriesList);
  const [profile, setProfile] = useState<BrandProfile>(brandProfile);

  // Brand Profile Editing States
  const [isEditingIdentity, setIsEditingIdentity] = useState(false);
  const [identityDraft, setIdentityDraft] = useState({
    name: brandProfile.name,
    website: brandProfile.website,
    tagline: brandProfile.tagline,
    mission: brandProfile.mission,
    voiceTone: brandProfile.voiceTone
  });
  const [autoScanUrl, setAutoScanUrl] = useState(brandProfile.website || '');
  const [isAutoScanning, setIsAutoScanning] = useState(false);

  const [newUsp, setNewUsp] = useState('');
  const [newCompName, setNewCompName] = useState('');
  const [newCompFocus, setNewCompFocus] = useState('');
  const [newCompThreat, setNewCompThreat] = useState<'High' | 'Medium' | 'Low'>('High');
  const [newRule, setNewRule] = useState('');

  // Knowledge Base States
  const [crawlUrl, setCrawlUrl] = useState('');
  const [isCrawling, setIsCrawling] = useState(false);
  const [inspectedDoc, setInspectedDoc] = useState<KnowledgeDoc | null>(null);
  const [showCustomDocModal, setShowCustomDocModal] = useState(false);
  const [customDocTitle, setCustomDocTitle] = useState('');
  const [customDocSource, setCustomDocSource] = useState('Product Playbook');
  const [customDocBody, setCustomDocBody] = useState('');
  const [isIngestingDoc, setIsIngestingDoc] = useState(false);

  // Agent Memory States
  const [showAddMemoryModal, setShowAddMemoryModal] = useState(false);
  const [newMemoryCategory, setNewMemoryCategory] = useState<MemoryItem['category']>('winning-hook');
  const [newMemoryAgent, setNewMemoryAgent] = useState<AgentId>('memory');
  const [newMemoryLearning, setNewMemoryLearning] = useState('');
  const [newMemoryEvidence, setNewMemoryEvidence] = useState('');
  const [newMemoryConfidence, setNewMemoryConfidence] = useState(95);

  // Content Archive Preview Modal
  const [previewContentItem, setPreviewContentItem] = useState<ContentItem | null>(null);

  useEffect(() => {
    setProfile(brandProfile);
    setIdentityDraft({
      name: brandProfile.name,
      website: brandProfile.website,
      tagline: brandProfile.tagline,
      mission: brandProfile.mission,
      voiceTone: brandProfile.voiceTone
    });
    setAutoScanUrl(brandProfile.website || '');
  }, [brandProfile]);

  useEffect(() => {
    setMemories(memoriesList);
  }, [memoriesList]);

  const docs: KnowledgeDoc[] =
    profile.knowledgeDocs || mockBrandProfile.knowledgeDocs || [];

  const syncProfileUpdate = (updated: BrandProfile) => {
    setProfile(updated);
    if (onUpdateBrandProfile) {
      onUpdateBrandProfile(updated);
    }
  };

  const handleSaveIdentity = () => {
    const updated: BrandProfile = {
      ...profile,
      name: identityDraft.name.trim() || profile.name,
      website: identityDraft.website.trim() || profile.website,
      tagline: identityDraft.tagline.trim() || profile.tagline,
      mission: identityDraft.mission.trim() || profile.mission,
      voiceTone: identityDraft.voiceTone.trim() || profile.voiceTone
    };
    syncProfileUpdate(updated);
    setIsEditingIdentity(false);
  };

  const handleAutoScanBrand = async () => {
    const target = autoScanUrl.trim() || profile.website;
    if (!target) return;
    setIsAutoScanning(true);
    try {
      const res = await fetch('/api/hub/auto-scan-brand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: target })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.brandProfile) {
          syncProfileUpdate(data.brandProfile);
          setIdentityDraft({
            name: data.brandProfile.name,
            website: data.brandProfile.website,
            tagline: data.brandProfile.tagline,
            mission: data.brandProfile.mission,
            voiceTone: data.brandProfile.voiceTone
          });
        }
        if (data.state && onStateSynced) {
          onStateSynced(data.state);
        }
      }
    } catch (e) {
      console.error('Auto-scan brand error:', e);
    } finally {
      setIsAutoScanning(false);
    }
  };

  const handleAddUsp = () => {
    if (!newUsp.trim()) return;
    syncProfileUpdate({
      ...profile,
      coreUSPs: [...profile.coreUSPs, newUsp.trim()]
    });
    setNewUsp('');
  };

  const handleRemoveUsp = (index: number) => {
    syncProfileUpdate({
      ...profile,
      coreUSPs: profile.coreUSPs.filter((_, idx) => idx !== index)
    });
  };

  const handleAddCompetitor = () => {
    if (!newCompName.trim()) return;
    syncProfileUpdate({
      ...profile,
      competitors: [
        ...profile.competitors,
        {
          name: newCompName.trim(),
          focus: newCompFocus.trim() || 'Enterprise Marketing Automation',
          threat: newCompThreat
        }
      ]
    });
    setNewCompName('');
    setNewCompFocus('');
  };

  const handleRemoveCompetitor = (index: number) => {
    syncProfileUpdate({
      ...profile,
      competitors: profile.competitors.filter((_, idx) => idx !== index)
    });
  };

  const handleAddRule = () => {
    if (!newRule.trim()) return;
    syncProfileUpdate({
      ...profile,
      brandRules: [...profile.brandRules, newRule.trim()]
    });
    setNewRule('');
  };

  const handleRemoveRule = (index: number) => {
    syncProfileUpdate({
      ...profile,
      brandRules: profile.brandRules.filter((_, idx) => idx !== index)
    });
  };

  const handleCrawlSource = async () => {
    const target = crawlUrl.trim() || profile.website;
    if (!target) return;
    setIsCrawling(true);
    try {
      const res = await fetch('/api/hub/crawl-source', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: target })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.state && onStateSynced) {
          onStateSynced(data.state);
        } else if (data.doc) {
          syncProfileUpdate({
            ...profile,
            knowledgeDocs: [data.doc, ...docs]
          });
        }
        setCrawlUrl('');
      }
    } catch (e) {
      console.error('Crawl source error:', e);
    } finally {
      setIsCrawling(false);
    }
  };

  const handleIngestCustomDoc = async () => {
    if (!customDocTitle.trim() || !customDocBody.trim()) return;
    setIsIngestingDoc(true);
    try {
      const res = await fetch('/api/hub/ingest-doc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: customDocTitle.trim(),
          source: customDocSource.trim() || 'Custom Playbook',
          content: customDocBody.trim()
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.state && onStateSynced) {
          onStateSynced(data.state);
        } else if (data.doc) {
          syncProfileUpdate({
            ...profile,
            knowledgeDocs: [data.doc, ...docs]
          });
        }
        setCustomDocTitle('');
        setCustomDocBody('');
        setShowCustomDocModal(false);
      }
    } catch (e) {
      console.error('Custom doc ingest error:', e);
    } finally {
      setIsIngestingDoc(false);
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    try {
      const res = await fetch('/api/hub/delete-doc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docId })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.state && onStateSynced) {
          onStateSynced(data.state);
        } else {
          syncProfileUpdate({
            ...profile,
            knowledgeDocs: docs.filter(d => d.id !== docId)
          });
        }
      }
    } catch {
      syncProfileUpdate({
        ...profile,
        knowledgeDocs: docs.filter(d => d.id !== docId)
      });
    }
  };

  const handleAddMemory = async () => {
    if (!newMemoryLearning.trim()) return;
    try {
      const res = await fetch('/api/hub/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          memory: {
            category: newMemoryCategory,
            agent: newMemoryAgent,
            learning: newMemoryLearning.trim(),
            supportingData:
              newMemoryEvidence.trim() || 'Verified across multi-channel campaign telemetry',
            confidence: newMemoryConfidence
          }
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.state && onStateSynced) {
          onStateSynced(data.state);
        } else if (data.memories) {
          setMemories(data.memories);
        }
        setNewMemoryLearning('');
        setNewMemoryEvidence('');
        setShowAddMemoryModal(false);
      }
    } catch (e) {
      console.error('Add memory error:', e);
    }
  };

  const handleDeleteMemory = async (memoryId: string) => {
    try {
      const res = await fetch('/api/hub/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', memoryId })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.state && onStateSynced) {
          onStateSynced(data.state);
        } else if (data.memories) {
          setMemories(data.memories);
        }
      }
    } catch {
      setMemories(prev => prev.filter(m => m.id !== memoryId));
    }
  };

  const formatConfidence = (val: number) => {
    const normalized = val <= 1 ? Math.round(val * 100) : Math.round(val);
    return Math.min(100, Math.max(1, normalized));
  };

  const avgConfidence =
    memories.length > 0
      ? (
          memories.reduce((acc, m) => acc + formatConfidence(m.confidence), 0) /
          memories.length
        ).toFixed(1)
      : '94.0';

  const filteredMemories = memories.filter(
    m =>
      m.learning.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.agent.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredContent = contentList.filter(
    item =>
      item.title.toLowerCase().includes(contentSearch.toLowerCase()) ||
      item.platform.toLowerCase().includes(contentSearch.toLowerCase()) ||
      item.body.toLowerCase().includes(contentSearch.toLowerCase())
  );

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Knowledge Base
          </h2>
          <span className="text-xs font-semibold text-emerald-400 tabular-nums">
            {docs.length} Docs · {memories.length} Memories
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-neutral-900 border border-neutral-800 rounded-xl">
          <button
            onClick={() => setActiveTab('brand')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'brand'
                ? 'bg-neutral-800 text-emerald-400'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Brand Profile
          </button>
          <button
            onClick={() => setActiveTab('kb')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'kb'
                ? 'bg-neutral-800 text-emerald-400'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Vector DB ({docs.length})
          </button>
          <button
            onClick={() => setActiveTab('agent-mem')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'agent-mem'
                ? 'bg-neutral-800 text-emerald-400'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Agent Memory ({memories.length})
          </button>
          <button
            onClick={() => setActiveTab('campaign-mem')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'campaign-mem'
                ? 'bg-neutral-800 text-emerald-400'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Retros ({campaignsList.length})
          </button>
          <button
            onClick={() => setActiveTab('content-mem')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'content-mem'
                ? 'bg-neutral-800 text-emerald-400'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Archive ({contentList.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Brand Profile */}
      {activeTab === 'brand' && (
        <div className="space-y-6">
          {/* AI Brand Auto-Scanner Bar */}
          <div className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900/50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span>AI Brand Auto-Scanner</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex items-center flex-1 md:w-72">
                <Globe className="h-4 w-4 text-neutral-500 absolute left-3" />
                <input
                  type="text"
                  value={autoScanUrl}
                  onChange={e => setAutoScanUrl(e.target.value)}
                  placeholder="https://your-saas-domain.com"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button
                onClick={handleAutoScanBrand}
                disabled={isAutoScanning}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-neutral-950 text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isAutoScanning ? 'animate-spin' : ''}`} />
                <span>{isAutoScanning ? 'Scanning...' : 'Auto-Scan Brand'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Editable Core Identity Card */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Core Brand Identity
                  </h3>
                  {!isEditingIdentity ? (
                    <button
                      onClick={() => setIsEditingIdentity(true)}
                      className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white flex items-center gap-1 transition-colors"
                    >
                      <Edit3 className="h-3 w-3" />
                      <span>Edit</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleSaveIdentity}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <Save className="h-3 w-3" />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={() => setIsEditingIdentity(false)}
                        className="px-2 py-1 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {!isEditingIdentity ? (
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-neutral-500 block mb-0.5">Brand</span>
                      <div className="font-bold text-white text-base">{profile.name}</div>
                      <div className="text-emerald-400 font-medium mt-0.5">{profile.website}</div>
                    </div>
                    <div>
                      <span className="text-neutral-500 block mb-0.5">Tagline</span>
                      <div className="text-neutral-200 font-medium">{profile.tagline}</div>
                    </div>
                    <div>
                      <span className="text-neutral-500 block mb-0.5">Mission</span>
                      <p className="text-neutral-300 leading-relaxed line-clamp-3">{profile.mission}</p>
                    </div>
                    <div>
                      <span className="text-neutral-500 block mb-0.5">Voice & Tone</span>
                      <div className="text-emerald-400 font-semibold">{profile.voiceTone}</div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-neutral-400 block mb-1 font-medium">Brand Name</label>
                      <input
                        type="text"
                        value={identityDraft.name}
                        onChange={e =>
                          setIdentityDraft(prev => ({ ...prev, name: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-400 block mb-1 font-medium">Website URL</label>
                      <input
                        type="text"
                        value={identityDraft.website}
                        onChange={e =>
                          setIdentityDraft(prev => ({ ...prev, website: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-400 block mb-1 font-medium">Tagline</label>
                      <input
                        type="text"
                        value={identityDraft.tagline}
                        onChange={e =>
                          setIdentityDraft(prev => ({ ...prev, tagline: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-400 block mb-1 font-medium">Mission</label>
                      <textarea
                        rows={3}
                        value={identityDraft.mission}
                        onChange={e =>
                          setIdentityDraft(prev => ({ ...prev, mission: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-400 block mb-1 font-medium">Voice & Tone</label>
                      <input
                        type="text"
                        value={identityDraft.voiceTone}
                        onChange={e =>
                          setIdentityDraft(prev => ({ ...prev, voiceTone: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-neutral-800/80 text-[11px] text-neutral-400 flex items-center justify-between">
                <span>12 Agents Grounded</span>
                <span className="text-emerald-400 font-semibold">Live</span>
              </div>
            </div>

            {/* USPs & Competitors Manager */}
            <div className="lg:col-span-2 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 space-y-6">
              {/* USPs Section */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Core USPs ({profile.coreUSPs.length})
                  </h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newUsp}
                      onChange={e => setNewUsp(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddUsp()}
                      placeholder="Add new core USP..."
                      className="px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-emerald-500 w-56"
                    />
                    <button
                      onClick={handleAddUsp}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold flex items-center gap-1 shrink-0"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {profile.coreUSPs.map((usp, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 flex items-start justify-between gap-2 group hover:border-neutral-700 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{usp}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveUsp(i)}
                        className="p-1 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                        title="Remove USP"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Competitors Section */}
              <div className="space-y-3 pt-4 border-t border-neutral-800">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Competitors ({profile.competitors.length})
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={newCompName}
                      onChange={e => setNewCompName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddCompetitor()}
                      placeholder="Competitor..."
                      className="px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-emerald-500 w-36"
                    />
                    <input
                      type="text"
                      value={newCompFocus}
                      onChange={e => setNewCompFocus(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddCompetitor()}
                      placeholder="Focus..."
                      className="px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-emerald-500 w-40"
                    />
                    <select
                      value={newCompThreat}
                      onChange={e => setNewCompThreat(e.target.value as any)}
                      className="px-2.5 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="High">High Threat</option>
                      <option value="Medium">Medium Threat</option>
                      <option value="Low">Low Threat</option>
                    </select>
                    <button
                      onClick={handleAddCompetitor}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold flex items-center gap-1 shrink-0"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {profile.competitors.map((comp, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between text-xs gap-2 group hover:border-neutral-700 transition-colors"
                    >
                      <div>
                        <div className="font-bold text-white">{comp.name}</div>
                        <div className="text-[11px] text-neutral-400">{comp.focus}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                            comp.threat === 'High'
                              ? 'bg-amber-500/15 text-amber-400'
                              : 'bg-neutral-800 text-neutral-400'
                          }`}
                        >
                          {comp.threat}
                        </span>
                        <button
                          onClick={() => handleRemoveCompetitor(i)}
                          className="p-1 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Remove Competitor"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Strict Brand Guardrail Rules */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                <span>Brand Guardrail Rules ({profile.brandRules.length})</span>
              </h3>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newRule}
                  onChange={e => setNewRule(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddRule()}
                  placeholder="Add new agent guardrail rule..."
                  className="px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-emerald-500 w-64"
                />
                <button
                  onClick={handleAddRule}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold flex items-center gap-1 shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Rule</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {profile.brandRules.map((rule, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 flex items-center justify-between gap-3 group hover:border-neutral-700 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-emerald-400 font-bold shrink-0 tabular-nums">
                      #{i + 1}
                    </span>
                    <span>{rule}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveRule(i)}
                    className="p-1 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                    title="Delete Rule"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Knowledge Base (RAG) */}
      {activeTab === 'kb' && (
        <div className="space-y-6">
          {/* Live URL Crawler + Custom Doc Ingestion Bar */}
          <div className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900/50 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <BookOpen className="h-4 w-4 text-emerald-400" />
              <span>Vector Knowledge Base Ingestion</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex items-center">
                <Globe className="h-4 w-4 text-neutral-500 absolute left-3" />
                <input
                  type="text"
                  value={crawlUrl}
                  onChange={e => setCrawlUrl(e.target.value)}
                  placeholder={profile.website}
                  className="pl-9 pr-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white w-60 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button
                onClick={handleCrawlSource}
                disabled={isCrawling}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-neutral-950 text-xs font-bold flex items-center gap-1.5 shrink-0"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isCrawling ? 'animate-spin' : ''}`} />
                <span>{isCrawling ? 'Indexing...' : 'Crawl URL'}</span>
              </button>
              <button
                onClick={() => setShowCustomDocModal(true)}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 border border-neutral-700"
              >
                <FileText className="h-3.5 w-3.5 text-emerald-400" />
                <span>+ Custom Doc</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {docs.map(doc => (
              <div
                key={doc.id}
                className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 space-y-4 flex flex-col justify-between hover:border-neutral-700 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span>{doc.source} · {doc.lastSynced}</span>
                    <button
                      onClick={() => handleDeleteDoc(doc.id)}
                      className="text-neutral-500 hover:text-rose-400 transition-colors"
                      title="Remove Document"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-white">{doc.title}</h4>
                  <div className="text-xs text-emerald-400 font-semibold tabular-nums">
                    {doc.chunks} Vector Chunks · {doc.embeddings}
                  </div>
                </div>

                <button
                  onClick={() => setInspectedDoc(doc)}
                  className="w-full py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white transition-colors flex items-center justify-center gap-1.5"
                >
                  <Eye className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Inspect Chunks</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Agent Memory */}
      {activeTab === 'agent-mem' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-neutral-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search learned patterns..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-neutral-400 tabular-nums">
                Avg Confidence: <strong className="text-emerald-400">{avgConfidence}%</strong>
              </span>
              <button
                onClick={() => setShowAddMemoryModal(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold flex items-center gap-1.5"
              >
                <Brain className="h-3.5 w-3.5" />
                <span>+ Log Memory</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMemories.map(mem => (
              <div
                key={mem.id}
                className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/40 space-y-2.5 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">
                      <strong className="text-emerald-400 uppercase">{mem.category}</strong> · {mem.agent}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 text-xs font-bold tabular-nums">
                        {formatConfidence(mem.confidence)}%
                      </span>
                      <button
                        onClick={() => handleDeleteMemory(mem.id)}
                        className="text-neutral-500 hover:text-rose-400 transition-colors"
                        title="Delete Memory"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-sm font-semibold text-white leading-relaxed">
                    "{mem.learning}"
                  </div>
                </div>

                <div className="text-[11px] text-neutral-400 pt-2 border-t border-neutral-800/70 flex items-center justify-between">
                  <span className="truncate max-w-[75%]">{mem.supportingData}</span>
                  <span className="shrink-0">{mem.dateLogged}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Campaign Retros */}
      {activeTab === 'campaign-mem' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {campaignsList.map(cmp => (
            <div
              key={cmp.id}
              className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/40 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white text-sm">{cmp.name}</span>
                  <span className="text-[10px] uppercase px-2 py-0.5 rounded-md bg-neutral-800 text-emerald-400 font-bold">
                    {cmp.status}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 line-clamp-2">{cmp.tagline}</p>
              </div>
              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400 tabular-nums">
                <span>
                  <strong className="text-emerald-400">{cmp.primaryMetric.value}</strong> / {cmp.primaryMetric.target}
                </span>
                <span>
                  ${cmp.budget.spent.toLocaleString()} / ${cmp.budget.allocated.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 5: Content Archive */}
      {activeTab === 'content-mem' && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-neutral-500" />
            <input
              type="text"
              value={contentSearch}
              onChange={e => setContentSearch(e.target.value)}
              placeholder="Search archived assets..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredContent.map(item => (
              <div
                key={item.id}
                className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/40 flex flex-col justify-between gap-3 hover:border-neutral-700 transition-all"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-emerald-400 font-bold">
                      {item.platform} · {item.authorAgent}
                    </span>
                    <span className="text-[11px] text-neutral-400 uppercase font-semibold">
                      {item.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm line-clamp-1">{item.title}</h4>
                  <p className="text-xs text-neutral-400 line-clamp-2">
                    {item.body}
                  </p>
                </div>

                <div className="pt-2 border-t border-neutral-800/70 flex items-center justify-between text-xs">
                  <span className="text-neutral-500 text-[11px] tabular-nums">{item.createdAt}</span>
                  <button
                    onClick={() => setPreviewContentItem(item)}
                    className="text-emerald-400 hover:underline font-semibold flex items-center gap-1"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Read Asset</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Document Ingestion Modal */}
      {showCustomDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  Add Custom Knowledge Document / Playbook
                </h3>
              </div>
              <button
                onClick={() => setShowCustomDocModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1 font-medium">Document Title</label>
                  <input
                    type="text"
                    value={customDocTitle}
                    onChange={e => setCustomDocTitle(e.target.value)}
                    placeholder="e.g., Q4 Enterprise Pricing & FAQ Guide"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1 font-medium">Source Category</label>
                  <input
                    type="text"
                    value={customDocSource}
                    onChange={e => setCustomDocSource(e.target.value)}
                    placeholder="e.g., Product Playbook, Sales FAQ"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-neutral-400 block mb-1 font-medium">
                  Document Content (Separate paragraphs with a blank line to create individual vector chunks)
                </label>
                <textarea
                  rows={6}
                  value={customDocBody}
                  onChange={e => setCustomDocBody(e.target.value)}
                  placeholder="Paste product specifications, pricing tiers, customer case studies, or objection-handling scripts here..."
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCustomDocModal(false)}
                className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleIngestCustomDoc}
                disabled={isIngestingDoc || !customDocTitle.trim() || !customDocBody.trim()}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-neutral-950 text-xs font-bold"
              >
                {isIngestingDoc ? 'Indexing Chunks...' : 'Index into Vector DB'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Brand Memory Modal */}
      {showAddMemoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Log New Brand Memory Learning</h3>
              </div>
              <button
                onClick={() => setShowAddMemoryModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1 font-medium">Category</label>
                  <select
                    value={newMemoryCategory}
                    onChange={e => setNewMemoryCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white"
                  >
                    <option value="winning-hook">winning-hook</option>
                    <option value="winning-format">winning-format</option>
                    <option value="best-time">best-time</option>
                    <option value="objection-handling">objection-handling</option>
                    <option value="competitor-gap">competitor-gap</option>
                  </select>
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1 font-medium">Source Agent</label>
                  <select
                    value={newMemoryAgent}
                    onChange={e => setNewMemoryAgent(e.target.value as AgentId)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white"
                  >
                    <option value="memory">memory</option>
                    <option value="analytics">analytics</option>
                    <option value="social">social</option>
                    <option value="content">content</option>
                    <option value="seo">seo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1 font-medium">Learned Insight</label>
                <textarea
                  rows={3}
                  value={newMemoryLearning}
                  onChange={e => setNewMemoryLearning(e.target.value)}
                  placeholder="e.g., LinkedIn carousel posts with benchmark stats on slide 1 generate 2.8x higher CTO comment velocity."
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-neutral-400 block mb-1 font-medium">
                    Supporting Evidence
                  </label>
                  <input
                    type="text"
                    value={newMemoryEvidence}
                    onChange={e => setNewMemoryEvidence(e.target.value)}
                    placeholder="e.g., +42% CTR across 14 enterprise campaigns"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1 font-medium">Confidence (%)</label>
                  <input
                    type="number"
                    min={50}
                    max={100}
                    value={newMemoryConfidence}
                    onChange={e => setNewMemoryConfidence(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white tabular-nums"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddMemoryModal(false)}
                className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMemory}
                disabled={!newMemoryLearning.trim()}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-neutral-950 text-xs font-bold"
              >
                Save to Brand Memory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vector Chunks Inspection Modal */}
      {inspectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <span className="text-[10px] uppercase text-emerald-400 font-bold">
                  {inspectedDoc.source} · {inspectedDoc.chunks} Vector Chunks
                </span>
                <h3 className="text-base font-bold text-white">{inspectedDoc.title}</h3>
              </div>
              <button
                onClick={() => setInspectedDoc(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2.5 text-xs max-h-96 overflow-y-auto">
              {(
                inspectedDoc.sampleChunks || [
                  'Chunk #01: Brand positioning and autonomous multi-agent workflow orchestration architecture.',
                  'Chunk #02: Structured JSON-LD Schema.org and Claim-to-Proof Adjacency benchmarks for AI search.'
                ]
              ).map((ch, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-200 leading-relaxed"
                >
                  <div className="text-[10px] font-bold text-emerald-400 mb-1">
                    VECTOR CHUNK #{i + 1}
                  </div>
                  {ch}
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setInspectedDoc(null)}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Archive Full Reader Modal */}
      {previewContentItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <span className="text-[10px] uppercase text-emerald-400 font-bold">
                  {previewContentItem.platform} · {previewContentItem.type} · Author:{' '}
                  {previewContentItem.authorAgent}
                </span>
                <h3 className="text-base font-bold text-white">{previewContentItem.title}</h3>
              </div>
              <button
                onClick={() => setPreviewContentItem(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
              {previewContentItem.body}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setPreviewContentItem(null)}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold"
              >
                Close Reader
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
