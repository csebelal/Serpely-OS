import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Link2,
  Video,
  FileText,
  Copy,
  Check,
  Send,
  Layers,
  ArrowRight,
  RefreshCw,
  Eye,
  CheckCircle2,
  Play,
  Mail,
  Share2,
  MessageSquare,
  Clock,
  Film
} from 'lucide-react';
import { ThreadsIcon, PinterestIcon } from '../social/SocialPlatformIcons';

interface LinkedInCarouselSlide {
  slideNumber: number;
  tag: string;
  headline: string;
  subheadline: string;
  bulletPoints?: string[];
  takeaway?: string;
}

interface ContentWaterfallData {
  sourceType: 'blog_url' | 'youtube_url' | 'raw_text';
  extractedTitle: string;
  extractedSnippet: string;
  assets: {
    linkedinCarousel: {
      title: string;
      hookCaption: string;
      slides: LinkedInCarouselSlide[];
      svgDataUri: string;
      hashtags: string[];
    };
    twitterThread: {
      hookTweet: string;
      tweets: Array<{
        tweetNumber: number;
        text: string;
        characterCount: number;
      }>;
      totalTweets: number;
    };
    facebookPosts: Array<{
      variantType: 'storytelling' | 'checklist' | 'contrarian';
      title: string;
      headline: string;
      body: string;
      callToAction: string;
      hashtags: string[];
    }>;
    newsletterDrip: {
      subjectLines: string[];
      preheader: string;
      keyTakeaways: string[];
      bodyMarkdown: string;
      callToActionText: string;
      callToActionUrl: string;
    };
    shortVideoScripts: Array<{
      scriptNumber: number;
      title: string;
      durationSec: number;
      targetFormat: string;
      hook3s: string;
      visualCue: string;
      teleprompterScript: string;
      ctaText: string;
    }>;
    threadsPost?: {
      hook: string;
      body: string;
      characterCount: number;
      hashtags: string[];
    };
    blueskyPost?: {
      text: string;
      characterCount: number;
      hashtags: string[];
    };
    pinterestPin?: {
      title: string;
      description: string;
      boardSuggestion: string;
      destinationLink: string;
      hashtags: string[];
      visualSpec?: any;
    };
  };
}

interface ContentWaterfallModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandName?: string;
  brandWebsite?: string;
  onStateSynced?: (state: any) => void;
  onNotification?: (msg: string) => void;
}

export const ContentWaterfallModal: React.FC<ContentWaterfallModalProps> = ({
  isOpen,
  onClose,
  brandName = 'Sincly',
  brandWebsite = 'sincly.io',
  onStateSynced,
  onNotification
}) => {
  if (!isOpen) return null;

  // Input states
  const [inputMode, setInputMode] = useState<'blog' | 'youtube' | 'text'>('blog');
  const [sourceUrl, setSourceUrl] = useState<string>('https://techsheba.net/blog/enterprise-it-architecture');
  const [youtubeUrl, setYoutubeUrl] = useState<string>('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [rawText, setRawText] = useState<string>(
    'Modern enterprises lose thousands of dollars every hour due to unverified infrastructure backups and fragmented network bottlenecks. By implementing proactive 24/7 monitoring, automated cloud failover, and strict SLA agreements, organizations eliminate 99% of unplanned downtime while cutting operational overhead by 30%.'
  );
  const [topicInput, setTopicInput] = useState<string>('Enterprise IT Infrastructure & Zero Downtime');

  // Generation & Result states
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [waterfallResult, setWaterfallResult] = useState<ContentWaterfallData | null>(null);
  const [activeAssetTab, setActiveAssetTab] = useState<'carousel' | 'twitter' | 'facebook' | 'newsletter' | 'video' | 'threads' | 'pinterest'>('carousel');
  const [activeFbVariant, setActiveFbVariant] = useState<number>(0);
  const [activeVideoScript, setActiveVideoScript] = useState<number>(0);

  // Copy feedback
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isQueuing, setIsQueuing] = useState<boolean>(false);
  const [queuedSuccess, setQueuedSuccess] = useState<boolean>(false);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleRunWaterfall = async () => {
    setIsGenerating(true);
    setQueuedSuccess(false);
    setGenerationStep('Crawling and analyzing source thesis...');

    try {
      const payload: any = {
        topic: topicInput,
        autoQueue: false
      };

      if (inputMode === 'blog') {
        payload.sourceUrl = sourceUrl;
      } else if (inputMode === 'youtube') {
        payload.youtubeUrl = youtubeUrl;
      } else {
        payload.sourceText = rawText;
      }

      setGenerationStep('Synthesizing 5-part omnichannel cascade via Gemini AI...');

      const res = await fetch('/api/content/waterfall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setWaterfallResult(data.result);
        if (data.state && onStateSynced) {
          onStateSynced(data.state);
        }
      } else {
        alert('Failed to generate waterfall content. Please check server logs.');
      }
    } catch (err: any) {
      alert(`Error running waterfall engine: ${err?.message || 'Network error'}`);
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const handleQueueAllToApprovals = async () => {
    if (!waterfallResult) return;
    setIsQueuing(true);
    try {
      const payload: any = {
        topic: topicInput,
        autoQueue: true
      };

      if (inputMode === 'blog') payload.sourceUrl = sourceUrl;
      else if (inputMode === 'youtube') payload.youtubeUrl = youtubeUrl;
      else payload.sourceText = rawText;

      const res = await fetch('/api/content/waterfall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setQueuedSuccess(true);
        if (data.state && onStateSynced) {
          onStateSynced(data.state);
        }
        if (onNotification) {
          onNotification(
            `Successfully staged ${data.queuedCount || 6} omnichannel assets into Approval Gate!`
          );
        }
      }
    } catch {
      alert('Failed to queue assets.');
    } finally {
      setIsQueuing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl rounded-3xl border border-neutral-800 bg-neutral-950 p-6 sm:p-8 shadow-2xl space-y-6 my-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-neutral-800/80 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-mono font-semibold tracking-wider text-cyan-400 uppercase">
                1-Click Content Waterfall & Omnichannel Repurposer
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Deconstruct 1 Source into 10 High-Impact Assets
            </h2>
            <p className="text-xs text-neutral-400 max-w-3xl leading-relaxed">
              Paste a Blog Post link, YouTube video URL, or raw article text. Sincly&apos;s autonomous AI agents will
              instantly generate 1 LinkedIn Carousel, 1 X Thread, 3 Facebook Posts, 1 Newsletter Drip, and 3 Short Video Scripts.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Source Input Section */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-medium">
              <button
                onClick={() => setInputMode('blog')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  inputMode === 'blog'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Link2 className="h-3.5 w-3.5" />
                <span>Blog / Article URL</span>
              </button>

              <button
                onClick={() => setInputMode('youtube')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  inputMode === 'youtube'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Video className="h-3.5 w-3.5" />
                <span>YouTube Video</span>
              </button>

              <button
                onClick={() => setInputMode('text')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  inputMode === 'text'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Raw Text / Script</span>
              </button>
            </div>

            <div className="flex-1 max-w-sm">
              <input
                type="text"
                value={topicInput}
                onChange={e => setTopicInput(e.target.value)}
                placeholder="Core Thesis / Topic"
                className="w-full px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Conditional Input Fields */}
          {inputMode === 'blog' && (
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-neutral-400">Target Blog Post / Article URL:</label>
              <input
                type="url"
                value={sourceUrl}
                onChange={e => setSourceUrl(e.target.value)}
                placeholder="https://yourbrand.com/blog/article-slug"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}

          {inputMode === 'youtube' && (
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-neutral-400">YouTube Video URL:</label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={e => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 font-mono focus:outline-none focus:border-rose-500"
              />
            </div>
          )}

          {inputMode === 'text' && (
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-neutral-400">Pillar Content / Script Body:</label>
              <textarea
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                rows={3}
                placeholder="Paste your raw blog draft, transcript, or bullet points..."
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 font-mono focus:outline-none focus:border-emerald-500 resize-y"
              />
            </div>
          )}

          {/* Action Button */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-neutral-400">
              Generates 10 omnichannel assets tailored to platform algorithms.
            </span>

            <button
              onClick={handleRunWaterfall}
              disabled={isGenerating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-cyan-950 transition-all active:scale-95"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>{generationStep || 'Synthesizing Waterfall...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>⚡ Generate Omnichannel Cascade</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Viewer Section */}
        {waterfallResult && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Asset Category Tabs Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setActiveAssetTab('carousel')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeAssetTab === 'carousel'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white'
                  }`}
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>LinkedIn Carousel (5 Slides)</span>
                </button>

                <button
                  onClick={() => setActiveAssetTab('twitter')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeAssetTab === 'twitter'
                      ? 'bg-neutral-800 text-white border border-neutral-700 shadow-md'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white'
                  }`}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>X Thread ({waterfallResult.assets.twitterThread.totalTweets} Tweets)</span>
                </button>

                <button
                  onClick={() => setActiveAssetTab('facebook')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeAssetTab === 'facebook'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white'
                  }`}
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Facebook (3 Variants)</span>
                </button>

                <button
                  onClick={() => setActiveAssetTab('newsletter')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeAssetTab === 'newsletter'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white'
                  }`}
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>Newsletter Drip</span>
                </button>

                <button
                  onClick={() => setActiveAssetTab('video')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeAssetTab === 'video'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white'
                  }`}
                >
                  <Film className="h-3.5 w-3.5" />
                  <span>3x Short Video Scripts</span>
                </button>

                <button
                  onClick={() => setActiveAssetTab('threads')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeAssetTab === 'threads'
                      ? 'bg-neutral-700 text-white border border-neutral-600 shadow-md'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white'
                  }`}
                >
                  <ThreadsIcon className="h-3.5 w-3.5 text-white" />
                  <span>Threads Post</span>
                </button>

                <button
                  onClick={() => setActiveAssetTab('pinterest')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeAssetTab === 'pinterest'
                      ? 'bg-rose-700 text-white shadow-md'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white'
                  }`}
                >
                  <PinterestIcon className="h-3.5 w-3.5 text-rose-300" />
                  <span>Pinterest Pin</span>
                </button>
              </div>

              {/* Push All to Approvals Gate */}
              <button
                onClick={handleQueueAllToApprovals}
                disabled={isQueuing || queuedSuccess}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-800 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
              >
                {queuedSuccess ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                    <span>Staged in Approvals Queue</span>
                  </>
                ) : isQueuing ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Queuing...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>Stage All to Approvals</span>
                  </>
                )}
              </button>
            </div>

            {/* TAB 1: LinkedIn Carousel */}
            {activeAssetTab === 'carousel' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span className="font-mono text-blue-400">Slide Deck &amp; Caption</span>
                  <button
                    onClick={() =>
                      handleCopy(
                        `${waterfallResult.assets.linkedinCarousel.hookCaption}\n\n${waterfallResult.assets.linkedinCarousel.slides
                          .map(s => `[Slide ${s.slideNumber}: ${s.headline}]\n${s.subheadline}`)
                          .join('\n\n')}\n\n${waterfallResult.assets.linkedinCarousel.hashtags.join(' ')}`,
                        'copy-carousel'
                      )
                    }
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs border border-neutral-800 transition-colors"
                  >
                    {copiedKey === 'copy-carousel' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedKey === 'copy-carousel' ? 'Copied Full Deck!' : 'Copy Carousel Caption'}</span>
                  </button>
                </div>

                {/* 5 Slide Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {waterfallResult.assets.linkedinCarousel.slides.map(slide => (
                    <div
                      key={slide.slideNumber}
                      className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 space-y-2.5 flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            Slide {slide.slideNumber}
                          </span>
                          <span className="text-[9px] font-mono text-neutral-500 uppercase">{slide.tag}</span>
                        </div>
                        <h4 className="text-xs font-bold text-white line-clamp-2">{slide.headline}</h4>
                        <p className="text-[11px] text-neutral-400 leading-snug line-clamp-3">{slide.subheadline}</p>
                      </div>

                      {slide.bulletPoints && (
                        <div className="pt-2 border-t border-neutral-800/80 space-y-1">
                          {slide.bulletPoints.map((bp, i) => (
                            <div key={i} className="text-[10px] text-neutral-300 flex items-start gap-1">
                              <span className="text-blue-400">•</span>
                              <span className="line-clamp-1">{bp}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {slide.takeaway && (
                        <div className="pt-2 border-t border-neutral-800/80 text-[10px] font-mono text-emerald-400 line-clamp-2">
                          {slide.takeaway}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Hook Caption Preview */}
                <div className="rounded-xl bg-neutral-900/70 border border-neutral-800 p-4 space-y-2">
                  <span className="text-[11px] font-mono text-neutral-400">Post Hook &amp; Caption:</span>
                  <p className="text-xs text-neutral-300 whitespace-pre-line leading-relaxed">
                    {waterfallResult.assets.linkedinCarousel.hookCaption}
                  </p>
                  <div className="text-xs text-blue-400 font-mono pt-1">
                    {waterfallResult.assets.linkedinCarousel.hashtags.join(' ')}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Twitter Thread */}
            {activeAssetTab === 'twitter' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span className="font-mono text-cyan-400">Numbered Tweets ({waterfallResult.assets.twitterThread.totalTweets})</span>
                  <button
                    onClick={() =>
                      handleCopy(
                        waterfallResult.assets.twitterThread.tweets.map(t => t.text).join('\n\n---\n\n'),
                        'copy-thread'
                      )
                    }
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs border border-neutral-800 transition-colors"
                  >
                    {copiedKey === 'copy-thread' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedKey === 'copy-thread' ? 'Copied Full Thread!' : 'Copy Entire Thread'}</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {waterfallResult.assets.twitterThread.tweets.map(t => (
                    <div
                      key={t.tweetNumber}
                      className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-4 space-y-2 hover:border-neutral-700 transition-all"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-neutral-400 font-semibold">Tweet {t.tweetNumber}</span>
                        <span className="font-mono text-[11px] text-neutral-500">{t.characterCount} / 280 chars</span>
                      </div>
                      <p className="text-xs text-neutral-200 whitespace-pre-wrap leading-relaxed">{t.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: Facebook 3 Variants */}
            {activeAssetTab === 'facebook' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-900 border border-neutral-800 text-xs">
                    {waterfallResult.assets.facebookPosts.map((post, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveFbVariant(idx)}
                        className={`px-3 py-1.5 rounded-lg transition-all ${
                          activeFbVariant === idx
                            ? 'bg-indigo-600 text-white font-semibold'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        {post.title}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      const cur = waterfallResult.assets.facebookPosts[activeFbVariant];
                      handleCopy(
                        `${cur.headline}\n\n${cur.body}\n\n${cur.callToAction}\n\n${cur.hashtags.join(' ')}`,
                        'copy-fb'
                      );
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs border border-neutral-800 transition-colors"
                  >
                    {copiedKey === 'copy-fb' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedKey === 'copy-fb' ? 'Copied Post!' : 'Copy This Post'}</span>
                  </button>
                </div>

                {/* Selected Facebook Post Preview */}
                {(() => {
                  const p = waterfallResult.assets.facebookPosts[activeFbVariant];
                  if (!p) return null;
                  return (
                    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-5 space-y-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                          {p.variantType}
                        </span>
                        <h4 className="text-sm font-bold text-white pt-1">{p.headline}</h4>
                      </div>

                      <p className="text-xs text-neutral-300 whitespace-pre-line leading-relaxed">{p.body}</p>

                      <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-cyan-300 font-medium">
                        👉 {p.callToAction}
                      </div>

                      <div className="text-xs text-indigo-400 font-mono">{p.hashtags.join(' ')}</div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* TAB 4: Newsletter Drip */}
            {activeAssetTab === 'newsletter' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span className="font-mono text-amber-400">Email Digest &amp; Takeaways</span>
                  <button
                    onClick={() =>
                      handleCopy(
                        `Subject: ${waterfallResult.assets.newsletterDrip.subjectLines[0]}\nPreheader: ${waterfallResult.assets.newsletterDrip.preheader}\n\n${waterfallResult.assets.newsletterDrip.bodyMarkdown}`,
                        'copy-newsletter'
                      )
                    }
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs border border-neutral-800 transition-colors"
                  >
                    {copiedKey === 'copy-newsletter' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedKey === 'copy-newsletter' ? 'Copied Email!' : 'Copy Newsletter'}</span>
                  </button>
                </div>

                {/* 3 Subject Line Options */}
                <div className="rounded-xl bg-neutral-900/60 border border-neutral-800 p-4 space-y-2">
                  <span className="text-[11px] font-mono text-neutral-400 uppercase">3 A/B Subject Line Options:</span>
                  <div className="space-y-1.5">
                    {waterfallResult.assets.newsletterDrip.subjectLines.map((sub, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200">
                        <span>{sub}</span>
                        <span className="text-[10px] font-mono text-amber-400 uppercase">Var {i + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3 Key Takeaways */}
                <div className="rounded-xl bg-neutral-900/60 border border-neutral-800 p-4 space-y-2">
                  <span className="text-[11px] font-mono text-neutral-400 uppercase">Executive Takeaways:</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {waterfallResult.assets.newsletterDrip.keyTakeaways.map((k, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-emerald-300 flex items-start gap-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{k}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Newsletter Body */}
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-5 space-y-3">
                  <span className="text-[11px] font-mono text-neutral-400 uppercase">Email Content:</span>
                  <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 whitespace-pre-line leading-relaxed font-sans">
                    {waterfallResult.assets.newsletterDrip.bodyMarkdown}
                  </div>
                  <div className="flex justify-end">
                    <span className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs">
                      {waterfallResult.assets.newsletterDrip.callToActionText} →
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: Short Video Scripts */}
            {activeAssetTab === 'video' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-900 border border-neutral-800 text-xs">
                    {waterfallResult.assets.shortVideoScripts.map((script, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveVideoScript(idx)}
                        className={`px-3 py-1.5 rounded-lg transition-all ${
                          activeVideoScript === idx
                            ? 'bg-rose-600 text-white font-semibold'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        {script.title}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      const s = waterfallResult.assets.shortVideoScripts[activeVideoScript];
                      handleCopy(
                        `HOOK: ${s.hook3s}\nVISUAL CUE: ${s.visualCue}\n\nTELEPROMPTER SCRIPT:\n${s.teleprompterScript}\n\nCTA: ${s.ctaText}`,
                        'copy-script'
                      );
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs border border-neutral-800 transition-colors"
                  >
                    {copiedKey === 'copy-script' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedKey === 'copy-script' ? 'Copied Script!' : 'Copy Script'}</span>
                  </button>
                </div>

                {/* Selected Script Teleprompter View */}
                {(() => {
                  const s = waterfallResult.assets.shortVideoScripts[activeVideoScript];
                  if (!s) return null;
                  return (
                    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            {s.durationSec}s Target
                          </span>
                          <span className="text-xs font-mono text-neutral-400">{s.targetFormat}</span>
                        </div>
                      </div>

                      {/* Hook 3s Callout */}
                      <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 space-y-1">
                        <span className="text-[10px] font-mono text-rose-400 font-bold uppercase tracking-wider">
                          0-3s Visual Hook:
                        </span>
                        <p className="text-xs text-white font-bold">{s.hook3s}</p>
                      </div>

                      {/* Visual Cue */}
                      <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                        <span className="text-[10px] font-mono text-neutral-400 font-semibold uppercase">
                          Director / Camera Cue:
                        </span>
                        <p className="text-xs text-neutral-300 font-mono">{s.visualCue}</p>
                      </div>

                      {/* Teleprompter Text */}
                      <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                        <span className="text-[10px] font-mono text-emerald-400 font-semibold uppercase">
                          Teleprompter Spoken Script:
                        </span>
                        <p className="text-sm text-neutral-100 font-sans leading-relaxed tracking-wide">
                          {s.teleprompterScript}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-cyan-400 font-mono">
                        CTA: {s.ctaText}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* TAB 6: THREADS POST */}
            {activeAssetTab === 'threads' && waterfallResult.assets.threadsPost && (
              <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ThreadsIcon className="h-5 w-5 text-white" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Meta Threads Conversational Post</h4>
                      <p className="text-xs text-neutral-400">
                        Optimized for early replies and algorithmic discussion loops.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleCopy(
                        `${waterfallResult.assets.threadsPost?.hook}\n\n${waterfallResult.assets.threadsPost?.body}`,
                        'threads'
                      )
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200 transition-colors"
                  >
                    {copiedKey === 'threads' ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Post</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                  <p className="text-xs font-bold text-white leading-relaxed">
                    {waterfallResult.assets.threadsPost.hook}
                  </p>
                  <p className="text-xs text-neutral-300 whitespace-pre-line leading-relaxed">
                    {waterfallResult.assets.threadsPost.body}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-neutral-900">
                    {waterfallResult.assets.threadsPost.hashtags.map((h, i) => (
                      <span key={i} className="text-[11px] text-sky-400 font-mono">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: PINTEREST INFOGRAPHIC PIN */}
            {activeAssetTab === 'pinterest' && waterfallResult.assets.pinterestPin && (
              <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PinterestIcon className="h-5 w-5 text-rose-500" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Pinterest Visual Infographic Pin</h4>
                      <p className="text-xs text-neutral-400">
                        2:3 Vertical asset for evergreen visual search indexation.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleCopy(
                        `${waterfallResult.assets.pinterestPin?.title}\n\n${waterfallResult.assets.pinterestPin?.description}`,
                        'pinterest'
                      )
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200 transition-colors"
                  >
                    {copiedKey === 'pinterest' ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Pin Spec</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                    <span className="text-[10px] font-mono text-rose-400 uppercase font-bold tracking-wider">
                      Pin Title (Search Indexed):
                    </span>
                    <p className="text-sm font-bold text-white">
                      {waterfallResult.assets.pinterestPin.title}
                    </p>
                    <span className="text-[10px] font-mono text-neutral-400 uppercase font-semibold">
                      Pin Description:
                    </span>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {waterfallResult.assets.pinterestPin.description}
                    </p>
                    <div className="pt-2 border-t border-neutral-900 text-xs font-mono text-neutral-400">
                      Destination URL: <span className="text-emerald-400">{waterfallResult.assets.pinterestPin.destinationLink}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-br from-rose-950/30 to-neutral-950 border border-rose-900/30 flex flex-col items-center justify-center text-center p-6 space-y-3">
                    <div className="w-24 h-36 rounded-lg border-2 border-dashed border-rose-500/50 flex flex-col items-center justify-center p-2 text-rose-300">
                      <span className="text-xs font-mono font-bold">2:3 PIN</span>
                      <span className="text-[9px] text-neutral-400">1000x1500</span>
                    </div>
                    <span className="text-xs font-bold text-white">
                      Board Target: {waterfallResult.assets.pinterestPin.boardSuggestion}
                    </span>
                    <div className="flex flex-wrap justify-center gap-1">
                      {waterfallResult.assets.pinterestPin.hashtags.map((h, i) => (
                        <span key={i} className="text-[10px] text-rose-400 font-mono">
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
