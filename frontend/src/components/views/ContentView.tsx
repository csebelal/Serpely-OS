import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  LayoutGrid,
  List,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  Search,
  RefreshCw,
  Edit3,
  Copy,
  Check,
  Trash2,
  Share2,
  Mail,
  Megaphone,
  ArrowUpRight,
  BookOpen,
  Wand2,
  Send,
  Tag,
  X
} from 'lucide-react';
import { ContentItem, ViewId } from '../../types';
import { ContentWaterfallModal } from '../content/ContentWaterfallModal';
import { ContentStudioEmptyState, FilterResultsEmptyState } from '../common/EmptyState';

interface ContentViewProps {
  contentList: ContentItem[];
  onOpenCommand: () => void;
  onSubmitToApproval: (item: ContentItem) => void;
  onUpdateContentList?: (items: ContentItem[]) => void;
  brandName?: string;
  onNavigate?: (view: ViewId) => void;
  onStateSynced?: (state: any) => void;
}

function computeGeoReadiness(item: { title: string; body: string; tags?: string[] }) {
  const words = item.body.trim().split(/\s+/).filter(Boolean).length;
  const hasHeadings = /^#{1,3}\s+/m.test(item.body) || item.body.includes('**');
  const hasBullets = /^[-*•]\s+/m.test(item.body);
  const hasNumbers = /\d+%|\d+\.\d+x|\$\d+/i.test(item.body);
  const hasFaq = /faq|q:|question/i.test(item.body);

  let score = 62;
  if (words >= 60) score += 10;
  if (words >= 140) score += 8;
  if (hasHeadings) score += 7;
  if (hasBullets) score += 6;
  if (hasNumbers) score += 5;
  if (hasFaq) score += 4;
  if ((item.tags?.length || 0) >= 2) score += 3;

  return {
    score: Math.min(99, score),
    words,
    hasHeadings,
    hasBullets,
    hasNumbers,
    hasFaq
  };
}

export const ContentView: React.FC<ContentViewProps> = ({
  contentList,
  onOpenCommand,
  onSubmitToApproval,
  onUpdateContentList,
  brandName = 'Serpely AI',
  onNavigate,
  onStateSynced
}) => {
  const [items, setItems] = useState<ContentItem[]>(contentList);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Create / AI Generate Modal state
  const [isDrafting, setIsDrafting] = useState(false);
  const [isWaterfallOpen, setIsWaterfallOpen] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newKeyword, setNewKeyword] = useState('Generative Engine Optimization');
  const [newPlatform, setNewPlatform] = useState<'LinkedIn' | 'X' | 'Blog'>('Blog');
  const [newBody, setNewBody] = useState('');

  // Full Reader & Live Editor Modal state
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editPlatform, setEditPlatform] = useState<ContentItem['platform']>('Blog');
  const [editTagsText, setEditTagsText] = useState('');
  const [aiEnhanceMode, setAiEnhanceMode] = useState<'expand' | 'geo-schema' | 'hook' | null>(null);

  // Copy & Repurpose state
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [repurposingKey, setRepurposingKey] = useState<string | null>(null);
  const [repurposeBanner, setRepurposeBanner] = useState<{
    sourceTitle: string;
    createdTitle: string;
    dispatchedLabel: string;
    targetView: ViewId;
  } | null>(null);

  useEffect(() => {
    setItems(contentList);
  }, [contentList]);

  const updateItems = (next: ContentItem[]) => {
    setItems(next);
    if (onUpdateContentList) onUpdateContentList(next);
  };

  const openEditorModal = (item: ContentItem) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditBody(item.body);
    setEditPlatform(item.platform);
    setEditTagsText((item.tags || []).join(', '));
  };

  const handleSaveEditorChanges = () => {
    if (!editingItem || !editTitle.trim()) return;
    const parsedTags = editTagsText
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);
    const updatedItem: ContentItem = {
      ...editingItem,
      title: editTitle.trim(),
      body: editBody,
      platform: editPlatform,
      tags: parsedTags.length ? parsedTags : ['GEO', 'Content Studio']
    };
    const next = items.map(i => (i.id === editingItem.id ? updatedItem : i));
    updateItems(next);
    setEditingItem(updatedItem);
  };

  const handleAiEnhanceInEditor = async (mode: 'expand' | 'geo-schema' | 'hook') => {
    if (!editingItem) return;
    setAiEnhanceMode(mode);
    try {
      const res = await fetch('/api/content/ai-enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId: editingItem.id,
          title: editTitle,
          body: editBody,
          platform: editPlatform,
          mode
        })
      });
      if (res.ok) {
        const data = await res.json();
        const nextTitle = data.title || editTitle;
        const nextBody = data.body || editBody;
        setEditTitle(nextTitle);
        setEditBody(nextBody);
        const updated: ContentItem = {
          ...editingItem,
          title: nextTitle,
          body: nextBody,
          platform: editPlatform
        };
        setEditingItem(updated);
        if (data.state && onStateSynced) {
          onStateSynced(data.state);
        } else {
          updateItems(items.map(i => (i.id === editingItem.id ? updated : i)));
        }
      }
    } catch (err) {
      console.error('AI enhance error:', err);
    } finally {
      setAiEnhanceMode(null);
    }
  };

  const handleRepurposeAsset = async (
    item: ContentItem,
    targetChannel: 'social' | 'email'
  ) => {
    const key = `${item.id}-${targetChannel}`;
    setRepurposingKey(key);
    try {
      const res = await fetch('/api/content/repurpose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId: item.id,
          targetChannel
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.state && onStateSynced) {
          onStateSynced(data.state);
        }
        setRepurposeBanner({
          sourceTitle: item.title,
          createdTitle: data.createdTitle || item.title,
          dispatchedLabel: data.dispatchedLabel || 'Target Channel',
          targetView: (data.targetView || 'social') as ViewId
        });
      }
    } catch (err) {
      console.error('Repurpose error:', err);
    } finally {
      setRepurposingKey(null);
    }
  };

  const handleCopyItem = (item: ContentItem) => {
    navigator.clipboard.writeText(`${item.title}\n\n${item.body}`);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleDeleteItem = (id: string) => {
    const next = items.filter(i => i.id !== id);
    updateItems(next);
    if (editingItem?.id === id) {
      setEditingItem(null);
    }
  };

  const handlePublishItem = (item: ContentItem) => {
    const next = items.map(i =>
      i.id === item.id
        ? {
            ...i,
            status: 'published' as const,
            metrics: i.metrics || { views: 1240, clicks: 185, engagements: 94 }
          }
        : i
    );
    updateItems(next);
    if (editingItem?.id === item.id) {
      setEditingItem({
        ...editingItem,
        status: 'published',
        metrics: editingItem.metrics || { views: 1240, clicks: 185, engagements: 94 }
      });
    }
  };

  const filteredItems = items.filter(item => {
    if (platformFilter !== 'all' && item.platform !== platformFilter) return false;
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (
      search &&
      !item.title.toLowerCase().includes(search.toLowerCase()) &&
      !item.body.toLowerCase().includes(search.toLowerCase()) &&
      !(item.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()))
    ) {
      return false;
    }
    return true;
  });

  const handleGenerateWithAi = async () => {
    if (!newTitle.trim() && !newKeyword.trim()) return;
    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: newTitle || `${newKeyword} Implementation Playbook`,
          platform: newPlatform,
          targetKeyword: newKeyword || 'AI Marketing OS'
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.item) {
          if (data.state && onStateSynced) {
            onStateSynced(data.state);
          } else if (data.state?.contentList) {
            updateItems(data.state.contentList);
          } else {
            updateItems([data.item, ...items]);
          }
          setIsDrafting(false);
          setNewTitle('');
          setNewBody('');
          openEditorModal(data.item);
          return;
        }
      }
    } catch (e) {
      console.error('AI content generation error:', e);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleCreateDraft = () => {
    if (!newTitle.trim()) return;
    const newItem: ContentItem = {
      id: `ct-${Date.now()}`,
      title: newTitle.trim(),
      type:
        newPlatform === 'LinkedIn'
          ? 'linkedin-post'
          : newPlatform === 'X'
          ? 'x-thread'
          : 'blog',
      platform: newPlatform,
      status: 'draft',
      body:
        newBody.trim() ||
        `# ${newTitle.trim()}\n\nAuthoritative ${newPlatform} asset drafted in ${brandName} Content Studio targeting **${newKeyword}**.\n\n- **Core Benchmark**: 3.4x higher AI citation visibility across ChatGPT Search and Perplexity.\n- **Actionable Takeaway**: Pair structured JSON-LD entities with executive social distribution.`,
      authorAgent: 'content',
      createdAt: new Date().toISOString().split('T')[0],
      tags: [newKeyword || 'Organic', 'GEO', 'Content Studio']
    };
    updateItems([newItem, ...items]);
    setIsDrafting(false);
    setNewTitle('');
    setNewBody('');
  };

  const totalAssets = items.length;
  const publishedCount = items.filter(i => i.status === 'published').length;
  const pendingCount = items.filter(
    i => i.status === 'pending_approval' || i.status === 'approved'
  ).length;
  const avgGeoScore =
    items.length > 0
      ? Math.round(
          items.reduce((acc, item) => acc + computeGeoReadiness(item).score, 0) / items.length
        )
      : 90;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-white tracking-tight">Content Studio</h2>
          <span className="text-xs font-semibold text-emerald-400 tabular-nums">
            {totalAssets} Assets · {avgGeoScore}/100 GEO
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsWaterfallOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-950/40 transition-all active:scale-95"
            title="Deconstruct a Blog URL or YouTube link into 10 Omnichannel Assets"
          >
            <Sparkles className="h-4 w-4 text-cyan-200" />
            <span>🌊 1-Click Content Waterfall</span>
            <span className="h-2 w-2 rounded-full bg-cyan-300 animate-pulse" />
          </button>

          <button
            onClick={() => setIsDrafting(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Create / AI Generate</span>
          </button>
          <button
            onClick={onOpenCommand}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-semibold border border-neutral-800 transition-colors"
          >
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span>AI Command</span>
          </button>
        </div>
      </div>

      {/* Bento KPI Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-neutral-400">Total Assets</span>
            <p className="text-2xl font-bold text-white tabular-nums mt-0.5">{totalAssets}</p>
          </div>
          <BookOpen className="h-5 w-5 text-emerald-400" />
        </div>

        <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-neutral-400">Published</span>
            <p className="text-2xl font-bold text-emerald-400 tabular-nums mt-0.5">{publishedCount}</p>
          </div>
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
        </div>

        <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-neutral-400">Approval Queue</span>
            <p className="text-2xl font-bold text-amber-300 tabular-nums mt-0.5">{pendingCount}</p>
          </div>
          <ShieldAlert className="h-5 w-5 text-amber-300" />
        </div>

        <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-neutral-400">Avg GEO Score</span>
            <p className="text-2xl font-bold text-sky-400 tabular-nums mt-0.5">{avgGeoScore}/100</p>
          </div>
          <Wand2 className="h-5 w-5 text-sky-400" />
        </div>
      </div>

      {/* Live Multi-Channel Repurpose Notification Banner */}
      {repurposeBanner && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <div className="text-xs text-white">
              Repurposed <span className="font-bold text-emerald-300">"{repurposeBanner.createdTitle}"</span> to {repurposeBanner.dispatchedLabel}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onNavigate && (
              <button
                onClick={() => onNavigate(repurposeBanner.targetView)}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <span>Open {repurposeBanner.dispatchedLabel}</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={() => setRepurposeBanner(null)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white"
              title="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Search, Platform Filter, Status Filter & View Controls */}
      <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-3.5 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative min-w-[220px] flex-1 max-w-xs">
            <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-neutral-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search assets..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Platform Filter */}
          <div className="flex items-center gap-1 p-1 bg-neutral-950 border border-neutral-800 rounded-xl">
            {['all', 'Blog', 'LinkedIn', 'X'].map(p => (
              <button
                key={p}
                onClick={() => setPlatformFilter(p)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  platformFilter === p
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'text-neutral-400 hover:text-neutral-100'
                }`}
              >
                {p === 'all' ? 'All Channels' : p}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 p-1 bg-neutral-950 border border-neutral-800 rounded-xl">
            {[
              { id: 'all', label: 'All' },
              { id: 'draft', label: 'Draft' },
              { id: 'pending_approval', label: 'In Gate' },
              { id: 'approved', label: 'Approved' },
              { id: 'published', label: 'Live' }
            ].map(s => (
              <button
                key={s.id}
                onClick={() => setStatusFilter(s.id)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  statusFilter === s.id
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400 hover:text-neutral-100'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 p-1 bg-neutral-950 border border-neutral-800 rounded-xl self-start xl:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
              viewMode === 'grid'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>Grid</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
              viewMode === 'list'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <List className="h-3.5 w-3.5" />
            <span>List</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 ? (
        contentList.length === 0 ? (
          <ContentStudioEmptyState
            onGenerateContent={() => setIsDrafting(true)}
            onResetFilters={() => {
              setPlatformFilter('all');
              setStatusFilter('all');
              setSearch('');
            }}
          />
        ) : (
          <FilterResultsEmptyState
            query={search || (platformFilter !== 'all' ? `${platformFilter} content` : undefined)}
            onReset={() => {
              setPlatformFilter('all');
              setStatusFilter('all');
              setSearch('');
            }}
          />
        )
      ) : viewMode === 'grid' ? (
        /* Clean 3-Data-Point Bento Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredItems.map(item => {
            const geo = computeGeoReadiness(item);
            return (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-5 hover:border-neutral-700 transition-all space-y-4"
              >
                {/* 1. Unboxed Inline Metadata & Status */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-neutral-400 font-medium tabular-nums">
                      <strong className="text-emerald-400">{item.platform}</strong> · GEO {geo.score}/100 · {geo.words}w
                    </span>

                    <span
                      className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md font-bold ${
                        item.status === 'published'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : item.status === 'approved'
                          ? 'bg-sky-500/20 text-sky-300'
                          : item.status === 'pending_approval'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* 2. Title & Concise 2-Line Summary */}
                  <div
                    onClick={() => openEditorModal(item)}
                    className="cursor-pointer group space-y-1.5"
                  >
                    <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">
                      {item.body}
                    </p>
                  </div>
                </div>

                {/* 3. Primary Action Row */}
                <div className="pt-3 border-t border-neutral-800/80 flex items-center gap-2">
                  <button
                    onClick={() => openEditorModal(item)}
                    className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Edit3 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Edit & Repurpose</span>
                  </button>

                  {item.status === 'draft' && (
                    <button
                      onClick={() => {
                        const updated = items.map(i =>
                          i.id === item.id ? { ...i, status: 'pending_approval' as const } : i
                        );
                        updateItems(updated);
                        onSubmitToApproval({ ...item, status: 'pending_approval' });
                      }}
                      className="flex-1 py-1.5 px-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                    >
                      <ShieldAlert className="h-3.5 w-3.5" />
                      <span>Submit</span>
                    </button>
                  )}

                  {(item.status === 'pending_approval' || item.status === 'approved') && (
                    <button
                      onClick={() => handlePublishItem(item)}
                      className="flex-1 py-1.5 px-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Publish</span>
                    </button>
                  )}

                  {item.status === 'published' && (
                    <div className="flex-1 py-1.5 text-center text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Live</span>
                    </div>
                  )}

                  <button
                    onClick={() => handleCopyItem(item)}
                    className="p-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800"
                    title="Copy Content"
                  >
                    {copiedId === item.id ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>

                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1.5 rounded-xl bg-neutral-900 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 border border-neutral-800"
                    title="Delete Asset"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Full-Width Editorial List View */
        <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/40 divide-y divide-neutral-800/80">
          {filteredItems.map(item => {
            const geo = computeGeoReadiness(item);
            return (
              <div
                key={item.id}
                className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs hover:bg-neutral-900/60 transition-colors"
              >
                <div
                  onClick={() => openEditorModal(item)}
                  className="space-y-1.5 min-w-0 flex-1 cursor-pointer"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-neutral-800 text-emerald-400">
                      {item.platform}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 tabular-nums">
                      GEO {geo.score}/100 · {geo.words} words
                    </span>
                    <h4 className="font-bold text-sm text-white truncate">{item.title}</h4>
                  </div>
                  <p className="text-neutral-400 line-clamp-1">{item.body}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleRepurposeAsset(item, 'social')}
                    className="px-2.5 py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 font-semibold flex items-center gap-1"
                  >
                    <Share2 className="h-3 w-3 text-emerald-400" />
                    <span>To Social</span>
                  </button>
                  <button
                    onClick={() => handleRepurposeAsset(item, 'email')}
                    className="px-2.5 py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 font-semibold flex items-center gap-1"
                  >
                    <Mail className="h-3 w-3 text-sky-400" />
                    <span>To Email</span>
                  </button>
                  <button
                    onClick={() => openEditorModal(item)}
                    className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-semibold flex items-center gap-1"
                  >
                    <Edit3 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Open & Edit</span>
                  </button>
                  {item.status === 'draft' && (
                    <button
                      onClick={() => {
                        const updated = items.map(i =>
                          i.id === item.id ? { ...i, status: 'pending_approval' as const } : i
                        );
                        updateItems(updated);
                        onSubmitToApproval({ ...item, status: 'pending_approval' });
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 font-bold"
                    >
                      Submit Gate
                    </button>
                  )}
                  {(item.status === 'approved' || item.status === 'pending_approval') && (
                    <button
                      onClick={() => handlePublishItem(item)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 text-neutral-950 font-bold"
                    >
                      Publish Now
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1.5 rounded-lg bg-neutral-950 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 border border-neutral-800"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Content Reader & Live Split Editor Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-5xl rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl space-y-5 my-8">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-neutral-800 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Full Asset Reader & Live AI Editorial Studio</span>
                </div>
                <h3 className="text-lg font-bold text-white mt-0.5">{editTitle || 'Untitled Asset'}</h3>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Split Workspace: Left Live Editor (7 cols) + Right AI Co-Pilot & Repurpose (5 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Live Document Editor */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-neutral-400 block mb-1">
                      Headline / Pillar Title
                    </label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-sm font-semibold text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-neutral-400 block mb-1">
                      Channel Format
                    </label>
                    <select
                      value={editPlatform}
                      onChange={e =>
                        setEditPlatform(e.target.value as ContentItem['platform'])
                      }
                      className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Blog">Blog / GEO Pillar</option>
                      <option value="LinkedIn">LinkedIn Post</option>
                      <option value="X">X Thread</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-400 block mb-1">
                    Target SEO / GEO Keyword Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={editTagsText}
                    onChange={e => setEditTagsText(e.target.value)}
                    placeholder="Generative Engine Optimization, AI Marketing OS, B2B Growth"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-neutral-400">
                      Full Article / Post Body (Markdown & Structured Blocks Supported)
                    </label>
                    <span className="text-[11px] text-neutral-400 tabular-nums">
                      {computeGeoReadiness({ title: editTitle, body: editBody }).words} words
                    </span>
                  </div>
                  <textarea
                    value={editBody}
                    onChange={e => setEditBody(e.target.value)}
                    rows={14}
                    className="w-full p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 leading-relaxed focus:outline-none focus:border-emerald-500 font-sans"
                  />
                </div>
              </div>

              {/* Right Column: AI Editorial Co-Pilot, GEO Readiness & Multi-Channel Repurpose */}
              <div className="lg:col-span-5 space-y-4">
                {/* GEO Citation Readiness Card */}
                {(() => {
                  const liveGeo = computeGeoReadiness({
                    title: editTitle,
                    body: editBody,
                    tags: editTagsText.split(',').filter(Boolean)
                  });
                  return (
                    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">
                          GEO & Readability Telemetry
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold tabular-nums">
                          {liveGeo.score}/100
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 transition-all"
                          style={{ width: `${liveGeo.score}%` }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="flex items-center gap-1.5 text-neutral-300">
                          <CheckCircle2
                            className={`h-3.5 w-3.5 ${
                              liveGeo.hasHeadings ? 'text-emerald-400' : 'text-neutral-600'
                            }`}
                          />
                          <span>Structured Headings</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-neutral-300">
                          <CheckCircle2
                            className={`h-3.5 w-3.5 ${
                              liveGeo.hasBullets ? 'text-emerald-400' : 'text-neutral-600'
                            }`}
                          />
                          <span>Bullet Takeaways</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-neutral-300">
                          <CheckCircle2
                            className={`h-3.5 w-3.5 ${
                              liveGeo.hasNumbers ? 'text-emerald-400' : 'text-neutral-600'
                            }`}
                          />
                          <span>Verified ROI Stats</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-neutral-300">
                          <CheckCircle2
                            className={`h-3.5 w-3.5 ${
                              liveGeo.hasFaq ? 'text-emerald-400' : 'text-neutral-600'
                            }`}
                          />
                          <span>GEO FAQ Block</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* AI Editorial Co-Pilot */}
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Wand2 className="h-4 w-4 text-emerald-400" />
                    <span>AI Editorial Co-Pilot (1-Click Enhance)</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Enhance your live draft using {brandName} USPs and LLM citation patterns:
                  </p>
                  <div className="space-y-2 pt-1">
                    <button
                      onClick={() => handleAiEnhanceInEditor('expand')}
                      disabled={aiEnhanceMode !== null}
                      className="w-full py-2 px-3 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-xs font-semibold text-left text-neutral-200 flex items-center justify-between transition-colors"
                    >
                      <span>Expand with Benchmarks & Proof Points</span>
                      <RefreshCw
                        className={`h-3.5 w-3.5 text-emerald-400 ${
                          aiEnhanceMode === 'expand' ? 'animate-spin' : ''
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => handleAiEnhanceInEditor('geo-schema')}
                      disabled={aiEnhanceMode !== null}
                      className="w-full py-2 px-3 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-xs font-semibold text-left text-neutral-200 flex items-center justify-between transition-colors"
                    >
                      <span>Inject GEO FAQ & Entity Citation Block</span>
                      <RefreshCw
                        className={`h-3.5 w-3.5 text-sky-400 ${
                          aiEnhanceMode === 'geo-schema' ? 'animate-spin' : ''
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => handleAiEnhanceInEditor('hook')}
                      disabled={aiEnhanceMode !== null}
                      className="w-full py-2 px-3 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-xs font-semibold text-left text-neutral-200 flex items-center justify-between transition-colors"
                    >
                      <span>Tighten Executive Hook & ROI Headline</span>
                      <RefreshCw
                        className={`h-3.5 w-3.5 text-amber-400 ${
                          aiEnhanceMode === 'hook' ? 'animate-spin' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* 1-Click Multi-Channel Repurpose */}
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4 space-y-2.5">
                  <div className="text-xs font-bold text-white">
                    1-Click Multi-Channel Repurpose
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Convert this asset into channel-native creatives and queue in Stage 8 Approval Gate:
                  </p>
                  <div className="grid grid-cols-1 gap-2 pt-1">
                    <button
                      onClick={() => handleRepurposeAsset(editingItem, 'social')}
                      disabled={repurposingKey === `${editingItem.id}-social`}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <Share2 className="h-3.5 w-3.5" />
                        <span>Send to Social Calendar & Visual Card</span>
                      </span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleRepurposeAsset(editingItem, 'email')}
                      disabled={repurposingKey === `${editingItem.id}-email`}
                      className="w-full py-2 px-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 text-xs font-semibold flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5" />
                        <span>Convert to Lifecycle Email Sequence</span>
                      </span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-800 pt-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyItem({ ...editingItem, title: editTitle, body: editBody })}
                  className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-semibold text-neutral-200 flex items-center gap-1.5"
                >
                  {copiedId === editingItem.id ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Full Markdown</span>
                    </>
                  )}
                </button>

                {editingItem.status !== 'published' && (
                  <button
                    onClick={() => {
                      handleSaveEditorChanges();
                      handlePublishItem({
                        ...editingItem,
                        title: editTitle,
                        body: editBody,
                        platform: editPlatform
                      });
                    }}
                    className="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs font-bold text-emerald-300 flex items-center gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Publish Directly</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-xs font-semibold text-neutral-300"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleSaveEditorChanges();
                    setEditingItem(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create / AI Generate Draft Modal */}
      {isDrafting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white">Create or AI-Generate Content Asset</h3>
              <button
                onClick={() => setIsDrafting(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-400 font-semibold block mb-1.5">
                  Target Channel Format
                </label>
                <div className="flex gap-2">
                  {(['Blog', 'LinkedIn', 'X'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setNewPlatform(p)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${
                        newPlatform === p
                          ? 'bg-emerald-500 text-neutral-950'
                          : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-neutral-400 font-semibold block mb-1">
                  Target SEO / GEO Entity Keyword
                </label>
                <input
                  type="text"
                  value={newKeyword}
                  onChange={e => setNewKeyword(e.target.value)}
                  placeholder="e.g. Generative Engine Optimization"
                  className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-neutral-400 font-semibold block mb-1">
                  Headline / Topic Brief
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Why Generative Engines Favor Structured Schema Graphs..."
                  className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-neutral-400 font-semibold block mb-1">
                  Content Body (Optional if using Gemini AI Generate)
                </label>
                <textarea
                  value={newBody}
                  onChange={e => setNewBody(e.target.value)}
                  placeholder="Write post copy or click 'Generate with Gemini Agent' below..."
                  rows={4}
                  className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500 font-sans"
                />
              </div>
            </div>

            <div className="flex flex-wrap justify-between gap-2 pt-2">
              <button
                onClick={handleGenerateWithAi}
                disabled={isGeneratingAi}
                className="px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isGeneratingAi ? 'animate-spin' : ''}`} />
                <span>
                  {isGeneratingAi ? 'Generating via Gemini...' : 'Generate with Gemini Agent'}
                </span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsDrafting(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-900 text-neutral-300 hover:bg-neutral-800 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateDraft}
                  disabled={!newTitle.trim()}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-neutral-950 text-xs font-bold"
                >
                  Save Manual Draft
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* 1-Click Content Waterfall Modal */}
      <ContentWaterfallModal
        isOpen={isWaterfallOpen}
        onClose={() => setIsWaterfallOpen(false)}
        brandName={brandName}
        onStateSynced={onStateSynced}
        onNotification={msg => {
          // Toast trigger or state notification
        }}
      />
    </div>
  );
};
