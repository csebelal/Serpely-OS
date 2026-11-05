import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  Play,
  Pause,
  Sparkles,
  ShieldAlert,
  Clock,
  Plus,
  Trash2,
  Edit3,
  Check,
  RotateCcw,
  Sliders,
  Tv,
  Smartphone,
  Tag,
  Share2,
  Eye,
  Flame,
  CheckCircle2,
  ChevronRight,
  ListOrdered,
  FileText,
  Mic,
  Volume2,
  VolumeX,
  User,
  Download,
  Film,
  Layers,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import {
  YouTubeVideoProject,
  VideoFormat,
  VideoScene,
  VideoHookOption,
  SocialChannelAccount,
  ApprovalItem
} from '../../types';

interface YouTubeVideoStudioProps {
  videos: YouTubeVideoProject[];
  channels: SocialChannelAccount[];
  onUpdateVideo: (video: YouTubeVideoProject) => void;
  onCreateVideo: (video: YouTubeVideoProject) => void;
  onOpenApproval: (item: ApprovalItem) => void;
  onOpenCommand: () => void;
}

interface VoiceOption {
  id: string;
  name: string;
  gender: string;
  accent: string;
  category: string;
  description: string;
}

interface AvatarOption {
  id: string;
  name: string;
  gender: string;
  style: string;
  recommendedVoiceId: string;
  description: string;
  tags: string[];
}

const CURATED_VOICES: VoiceOption[] = [
  {
    id: 'pNInz6obpgDQGcFmaJgB',
    name: 'Adam',
    gender: 'Male',
    accent: 'American (Deep & Resonant)',
    category: 'Corporate Host & Authority',
    description: 'Deep, crisp, commanding tone optimal for B2B tech breakdowns and high-trust explanations.'
  },
  {
    id: '21m00Tcm4TlvDq8ikWAM',
    name: 'Rachel',
    gender: 'Female',
    accent: 'American (Warm & Articulate)',
    category: 'Calm Executive & Narrative',
    description: 'Polished, professional anchor cadence ideal for YouTube long-form research and product guides.'
  },
  {
    id: 'ErXwobaYiN019PkySvjV',
    name: 'Antoni',
    gender: 'Male',
    accent: 'American (Energetic & Dynamic)',
    category: 'Tech Explainer & Fast Paced',
    description: 'High-retention, modern pacing designed specifically for YouTube Shorts and vertical hooks.'
  },
  {
    id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Bella',
    gender: 'Female',
    accent: 'American (Persuasive & Engaging)',
    category: 'Commercial & Thought Leadership',
    description: 'Expressive and friendly voice with high emotional inflection for hook hooks and conversion.'
  },
  {
    id: 'VR6AewLTigWG4xSOukaG',
    name: 'Arnold',
    gender: 'Male',
    accent: 'American (Direct & Analytical)',
    category: 'Engineering & Data Insights',
    description: 'No-nonsense executive presentation voice tailored for SEO audits and technical architecture.'
  },
  {
    id: 'TxGEqnHWrfWFTfGW9XjX',
    name: 'Josh',
    gender: 'Male',
    accent: 'American (Young Founder)',
    category: 'Casual Founder & Viral Shorts',
    description: 'Relatable, energetic startup founder voice engineered for high algorithmic watch-time retention.'
  }
];

const CURATED_AVATARS: AvatarOption[] = [
  {
    id: 'avatar_tyler_exec',
    name: 'Tyler',
    gender: 'Male',
    style: 'Navy Executive Suit & Modern Lapel',
    recommendedVoiceId: 'pNInz6obpgDQGcFmaJgB',
    description: 'C-suite technology presenter. Imparts high enterprise trust and institutional credibility.',
    tags: ['B2B SaaS', 'Executive', 'Thought Leadership']
  },
  {
    id: 'avatar_angela_anchor',
    name: 'Angela',
    gender: 'Female',
    style: 'Studio Anchor Blazer & Lapel Mic',
    recommendedVoiceId: '21m00Tcm4TlvDq8ikWAM',
    description: 'Crisp media anchor framing. Exceptional for algorithmic news roundups and GEO industry audits.',
    tags: ['Industry News', 'Anchor', 'High Retention']
  },
  {
    id: 'avatar_dexter_educator',
    name: 'Dexter',
    gender: 'Male',
    style: 'Charcoal Minimal Hoodie & Framed Glasses',
    recommendedVoiceId: 'ErXwobaYiN019PkySvjV',
    description: 'Modern developer advocate. Perfect for technical teardowns, code walkthroughs and schema guides.',
    tags: ['Developer Advocate', 'Technical', 'Shorts Hook']
  },
  {
    id: 'avatar_monica_b2b',
    name: 'Monica',
    gender: 'Female',
    style: 'Teal Modern Blazer & Studio Lighting',
    recommendedVoiceId: 'EXAVITQu4vr4xnSDxMaL',
    description: 'High-conversion growth strategist persona with dynamic facial expressions and warm gesture sync.',
    tags: ['Growth Marketing', 'Product Demo', 'Viral Hook']
  },
  {
    id: 'avatar_ethan_founder',
    name: 'Ethan',
    gender: 'Male',
    style: 'Black Tech Tee & Structured Cardigan',
    recommendedVoiceId: 'TxGEqnHWrfWFTfGW9XjX',
    description: 'Silicon Valley founder vibe with fast-cadence head tilts and expressive speech articulation.',
    tags: ['Startup Founder', 'Fast Shorts', 'Viral Proof']
  }
];

const BACKGROUND_OPTIONS = [
  { id: 'dark_studio', name: 'Executive Dark Studio', color: '#09090b', preview: 'bg-zinc-950' },
  { id: 'neon_matrix', name: 'Cyber Emerald Matrix', color: '#064e3b', preview: 'bg-emerald-950' },
  { id: 'minimal_office', name: 'Tech Loft & Bokeh Glass', color: '#0f172a', preview: 'bg-slate-900' },
  { id: 'chroma_green', name: 'Chroma Green (Transparent)', color: '#00b140', preview: 'bg-green-600' }
];

export const YouTubeVideoStudio: React.FC<YouTubeVideoStudioProps> = ({
  videos,
  channels,
  onUpdateVideo,
  onCreateVideo,
  onOpenApproval,
  onOpenCommand
}) => {
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideoProject>(videos[0] || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // AI Media Deck State (ElevenLabs & HeyGen)
  const [activeMediaDeck, setActiveMediaDeck] = useState<'voiceover' | 'avatar'>('voiceover');
  const [isSynthesizingVoice, setIsSynthesizingVoice] = useState(false);
  const [isRenderingAvatar, setIsRenderingAvatar] = useState(false);
  const [avatarProgress, setAvatarProgress] = useState(0);
  const [renderingSceneId, setRenderingSceneId] = useState<string | null>(null);
  const [playingSceneAudioId, setPlayingSceneAudioId] = useState<string | null>(null);

  // Voiceover Parameters
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(
    selectedVideo?.voiceover?.voiceId || 'pNInz6obpgDQGcFmaJgB'
  );
  const [stability, setStability] = useState<number>(selectedVideo?.voiceover?.stability || 0.5);
  const [similarityBoost, setSimilarityBoost] = useState<number>(
    selectedVideo?.voiceover?.similarityBoost || 0.75
  );
  const [styleExaggeration, setStyleExaggeration] = useState<number>(
    selectedVideo?.voiceover?.style || 0.05
  );

  // Avatar Parameters
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>(
    selectedVideo?.avatar?.avatarId || 'avatar_tyler_exec'
  );
  const [selectedBackground, setSelectedBackground] = useState<string>(
    selectedVideo?.avatar?.backgroundMode || 'dark_studio'
  );
  const [stageViewMode, setStageViewMode] = useState<'avatar' | 'broll'>('avatar');

  // Master Audio HTML Element & State
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  // Keep state in sync when selectedVideo changes
  useEffect(() => {
    if (selectedVideo?.voiceover?.voiceId) {
      setSelectedVoiceId(selectedVideo.voiceover.voiceId);
    }
    if (selectedVideo?.avatar?.avatarId) {
      setSelectedAvatarId(selectedVideo.avatar.avatarId);
    }
    if (selectedVideo?.avatar?.backgroundMode) {
      setSelectedBackground(selectedVideo.avatar.backgroundMode);
    }
  }, [selectedVideo?.id]);

  // Active scene for teleprompter/preview sync
  const currentScene = selectedVideo?.scenes[activeSceneIndex] || selectedVideo?.scenes[0];

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Playback timer & progress
  useEffect(() => {
    let interval: any;
    if (isPlaying && selectedVideo && selectedVideo.scenes.length > 0) {
      // If master audio exists, play it
      if (audioRef.current && selectedVideo.voiceover?.audioUrl) {
        audioRef.current.play().catch(() => {});
      }

      interval = setInterval(() => {
        setPlaybackProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            setActiveSceneIndex(0);
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
            }
            return 0;
          }
          const next = prev + 2.5;
          const sceneStep = 100 / selectedVideo.scenes.length;
          const newIdx = Math.min(
            Math.floor(next / sceneStep),
            selectedVideo.scenes.length - 1
          );
          setActiveSceneIndex(newIdx);
          return next;
        });
      }, 250);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, selectedVideo]);

  // Format toggle
  const handleFormatChange = (format: VideoFormat) => {
    if (!selectedVideo) return;
    const updated: YouTubeVideoProject = {
      ...selectedVideo,
      format,
      durationSeconds: format === 'shorts' ? 58 : 680,
      targetChannelId: format === 'shorts' ? 'ch-yt-shorts' : 'ch-yt-main'
    };
    setSelectedVideo(updated);
    onUpdateVideo(updated);
    showNotification(`Switched format to YouTube ${format === 'shorts' ? 'Shorts (9:16 vertical)' : 'Long-Form (16:9 widescreen)'}.`);
  };

  // Handle Hook Selection
  const handleSelectHook = (hookId: string) => {
    if (!selectedVideo) return;
    const updatedHooks = selectedVideo.hooks.map(h => ({
      ...h,
      isSelected: h.id === hookId
    }));
    const chosenHook = updatedHooks.find(h => h.id === hookId);
    const updatedScenes = [...selectedVideo.scenes];
    if (updatedScenes[0] && chosenHook) {
      updatedScenes[0] = {
        ...updatedScenes[0],
        narration: chosenHook.text
      };
    }
    const updated: YouTubeVideoProject = {
      ...selectedVideo,
      hooks: updatedHooks,
      scenes: updatedScenes
    };
    setSelectedVideo(updated);
    onUpdateVideo(updated);
    showNotification('Primary hook updated. First scene narration synchronized.');
  };

  // AI Hook & Script Generation
  const handleGenerateAIHooksAndScript = () => {
    if (!selectedVideo) return;
    setIsGeneratingAI(true);
    setTimeout(() => {
      setIsGeneratingAI(false);
      const isShorts = selectedVideo.format === 'shorts';

      const freshHooks: VideoHookOption[] = isShorts
        ? [
            {
              id: `hk-${Date.now()}-1`,
              text: 'Google just quietly rolled out a new AI search metric, and your competitors have no idea.',
              viralityScore: 97,
              angle: 'Insider Intelligence / Secret Gap',
              isSelected: true
            },
            {
              id: `hk-${Date.now()}-2`,
              text: 'If your site relies on classic blog SEO, you are losing 70% of potential traffic right now.',
              viralityScore: 91,
              angle: 'Urgency & Loss Aversion',
              isSelected: false
            },
            {
              id: `hk-${Date.now()}-3`,
              text: 'How we got cited in 4,200 ChatGPT prompts in 30 days without writing a single backlink email.',
              viralityScore: 86,
              angle: 'Proven Case Study Proof',
              isSelected: false
            }
          ]
        : [
            {
              id: `hk-${Date.now()}-1`,
              text: 'Why 2026 is the year Generative Engine Optimization completely replaces conventional search rankings.',
              viralityScore: 94,
              angle: 'Paradigm Shift / Thought Leadership',
              isSelected: true
            },
            {
              id: `hk-${Date.now()}-2`,
              text: 'The full technical architecture behind how Perplexity and SearchGPT pick their #1 citations.',
              viralityScore: 90,
              angle: 'Deep Engineering Breakdown',
              isSelected: false
            },
            {
              id: `hk-${Date.now()}-3`,
              text: 'We audited 1,000 SaaS websites: Here are the 4 Schema.org tags that dictate AI visibility.',
              viralityScore: 88,
              angle: 'Data Study Blueprint',
              isSelected: false
            }
          ];

      const updated: YouTubeVideoProject = {
        ...selectedVideo,
        hooks: freshHooks
      };
      setSelectedVideo(updated);
      onUpdateVideo(updated);
      showNotification('AI Content Agent generated 3 high-virality hook variations from Serpely knowledge base.');
    }, 700);
  };

  // Add Scene
  const handleAddScene = () => {
    if (!selectedVideo) return;
    const nextNum = selectedVideo.scenes.length + 1;
    const newScene: VideoScene = {
      id: `sc-${Date.now()}`,
      sceneNumber: nextNum,
      timestamp: selectedVideo.format === 'shorts' ? `0:${(nextNum - 1) * 14} - 0:${nextNum * 14}` : `${nextNum}:00 - ${nextNum + 2}:00`,
      narration: 'Explain key technical insight or evidence supporting the primary thesis.',
      visualCue: 'Animated data chart showing citation delta across Gemini and Perplexity',
      overlayText: 'KEY TAKEAWAY'
    };
    const updated: YouTubeVideoProject = {
      ...selectedVideo,
      scenes: [...selectedVideo.scenes, newScene]
    };
    setSelectedVideo(updated);
    onUpdateVideo(updated);
    showNotification(`Added Scene #${nextNum} to script.`);
  };

  // Update Scene
  const handleUpdateScene = (index: number, updatedFields: Partial<VideoScene>) => {
    if (!selectedVideo) return;
    const updatedScenes = [...selectedVideo.scenes];
    updatedScenes[index] = { ...updatedScenes[index], ...updatedFields };
    const updated: YouTubeVideoProject = {
      ...selectedVideo,
      scenes: updatedScenes
    };
    setSelectedVideo(updated);
    onUpdateVideo(updated);
  };

  // Delete Scene
  const handleDeleteScene = (index: number) => {
    if (!selectedVideo || selectedVideo.scenes.length <= 1) return;
    const updatedScenes = selectedVideo.scenes.filter((_, i) => i !== index);
    const updated: YouTubeVideoProject = {
      ...selectedVideo,
      scenes: updatedScenes
    };
    setSelectedVideo(updated);
    onUpdateVideo(updated);
    if (activeSceneIndex >= updatedScenes.length) {
      setActiveSceneIndex(0);
    }
  };

  // =========================================================================
  // ELEVENLABS AI VOICEOVER SYNTHESIS HANDLERS
  // =========================================================================

  // 1. Synthesize Single Scene Narration
  const handleSynthesizeSceneVoiceover = async (sceneIndex: number) => {
    if (!selectedVideo) return;
    const scene = selectedVideo.scenes[sceneIndex];
    if (!scene || !scene.narration.trim()) return;

    setRenderingSceneId(scene.id);
    try {
      const res = await fetch('/api/media/voiceover/scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: scene.narration,
          voiceId: selectedVoiceId,
          stability,
          similarityBoost,
          style: styleExaggeration
        })
      });

      const data = await res.json();
      if (data.success && data.audioUrl) {
        handleUpdateScene(sceneIndex, {
          audioUrl: data.audioUrl,
          audioDurationSeconds: data.durationSeconds,
          voiceId: selectedVoiceId
        });
        showNotification(`Scene #${scene.sceneNumber} voiceover synthesized via ElevenLabs (${data.voiceName}, ${data.durationSeconds}s).`);
      } else {
        showNotification(data.error || 'Failed to synthesize scene voiceover.');
      }
    } catch (err: any) {
      showNotification(`Synthesis error: ${err?.message || 'Network issue'}`);
    } finally {
      setRenderingSceneId(null);
    }
  };

  // 2. Play Individual Scene Audio
  const handlePlaySceneAudio = (scene: VideoScene) => {
    if (!scene.audioUrl) return;
    if (playingSceneAudioId === scene.id) {
      setPlayingSceneAudioId(null);
      return;
    }
    const tempAudio = new Audio(scene.audioUrl);
    setPlayingSceneAudioId(scene.id);
    tempAudio.play().catch(() => {});
    tempAudio.onended = () => {
      setPlayingSceneAudioId(null);
    };
  };

  // 3. Synthesize Complete Video Script Voiceover
  const handleSynthesizeMasterVoiceover = async () => {
    if (!selectedVideo) return;
    setIsSynthesizingVoice(true);
    try {
      const res = await fetch('/api/media/voiceover/full', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenes: selectedVideo.scenes,
          voiceId: selectedVoiceId,
          stability,
          similarityBoost,
          style: styleExaggeration
        })
      });

      const data = await res.json();
      if (data.success && data.audioUrl) {
        const chosenVoice = CURATED_VOICES.find(v => v.id === selectedVoiceId);
        const updated: YouTubeVideoProject = {
          ...selectedVideo,
          voiceover: {
            provider: 'elevenlabs',
            voiceId: selectedVoiceId,
            voiceName: chosenVoice?.name || 'Adam',
            stability,
            similarityBoost,
            style: styleExaggeration,
            audioUrl: data.audioUrl,
            status: 'ready',
            durationSeconds: data.durationSeconds,
            renderedAt: new Date().toLocaleTimeString()
          }
        };
        setSelectedVideo(updated);
        onUpdateVideo(updated);
        showNotification(`Master voiceover synthesized via ElevenLabs (${data.voiceName}, ${data.durationSeconds}s). Ready for playback.`);
      } else {
        showNotification(data.error || 'Failed to synthesize master voiceover.');
      }
    } catch (err: any) {
      showNotification(`Voiceover synthesis error: ${err?.message || 'Network issue'}`);
    } finally {
      setIsSynthesizingVoice(false);
    }
  };

  // =========================================================================
  // HEYGEN AI VIDEO AVATAR RENDER HANDLERS
  // =========================================================================

  const handleRenderHeyGenAvatar = async () => {
    if (!selectedVideo) return;
    setIsRenderingAvatar(true);
    setAvatarProgress(15);

    const progressTimer = setInterval(() => {
      setAvatarProgress(prev => (prev < 90 ? prev + 25 : prev));
    }, 400);

    try {
      const chosenHook = selectedVideo.hooks.find(h => h.isSelected)?.text || selectedVideo.hooks[0]?.text;
      const res = await fetch('/api/media/avatar/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: selectedVideo.scenes.map(s => s.narration).join('. '),
          hookText: chosenHook,
          avatarId: selectedAvatarId,
          voiceId: selectedVoiceId,
          format: selectedVideo.format,
          backgroundMode: selectedBackground
        })
      });

      clearInterval(progressTimer);
      setAvatarProgress(100);

      const data = await res.json();
      if (data.success && data.videoUrl) {
        const chosenAvatar = CURATED_AVATARS.find(a => a.id === selectedAvatarId);
        const updated: YouTubeVideoProject = {
          ...selectedVideo,
          avatar: {
            provider: 'heygen',
            avatarId: selectedAvatarId,
            avatarName: chosenAvatar?.name || 'Tyler',
            backgroundMode: selectedBackground as any,
            videoUrl: data.videoUrl,
            previewImageUrl: data.previewImageUrl,
            status: 'ready',
            renderedAt: new Date().toLocaleTimeString(),
            durationSeconds: data.durationSeconds
          },
          voiceover: data.audioVoiceoverUrl ? {
            provider: 'elevenlabs',
            voiceId: selectedVoiceId,
            voiceName: CURATED_VOICES.find(v => v.id === selectedVoiceId)?.name || 'Adam',
            stability,
            similarityBoost,
            style: styleExaggeration,
            audioUrl: data.audioVoiceoverUrl,
            status: 'ready',
            durationSeconds: data.durationSeconds,
            renderedAt: new Date().toLocaleTimeString()
          } : selectedVideo.voiceover
        };
        setSelectedVideo(updated);
        onUpdateVideo(updated);
        setStageViewMode('avatar');
        showNotification(`HeyGen Face Avatar video rendered successfully (${chosenAvatar?.name}). Neural lip-sync active.`);
      } else {
        showNotification(data.error || 'Failed to render HeyGen avatar video.');
      }
    } catch (err: any) {
      clearInterval(progressTimer);
      showNotification(`HeyGen render error: ${err?.message || 'Network issue'}`);
    } finally {
      setIsRenderingAvatar(false);
      setAvatarProgress(0);
    }
  };

  // Submit to Marketing Director Approval Gate
  const handleSubmitApproval = () => {
    if (!selectedVideo) return;
    const targetChan = channels.find(c => c.id === selectedVideo.targetChannelId);
    const chosenHook = selectedVideo.hooks.find(h => h.isSelected)?.text || selectedVideo.hooks[0]?.text;

    const approvalItem: ApprovalItem = {
      id: `ap-${Date.now()}`,
      title: `YouTube ${selectedVideo.format === 'shorts' ? 'Short' : 'Long-Form'}: ${selectedVideo.title}`,
      agent: 'content',
      contentType: 'social-post',
      platform: 'YouTube',
      riskLevel: 'high',
      status: 'pending',
      campaign: 'Generative Video Distribution',
      submittedAt: 'Just now',
      preview: `Format: YouTube ${selectedVideo.format.toUpperCase()} (${selectedVideo.durationSeconds}s)\nTarget Channel: ${targetChan?.name || selectedVideo.targetChannelId} (${targetChan?.handle})\n\nPrimary Hook: ${chosenHook}\n\nAI Voiceover: ElevenLabs [${selectedVideo.voiceover?.voiceName || 'Adam'}] (${selectedVideo.voiceover?.status === 'ready' ? 'Synthesized' : 'Draft'})\nAI Avatar: HeyGen [${selectedVideo.avatar?.avatarName || 'Tyler'}] (${selectedVideo.avatar?.status === 'ready' ? 'Rendered' : 'Draft'})\n\nScenes Count: ${selectedVideo.scenes.length}\nDescription:\n${selectedVideo.description}`,
      riskReason: `External public video broadcast with AI ElevenLabs voiceover & HeyGen avatar to ${targetChan?.handle || 'YouTube'} requires Marketing Director sign-off.`,
      budgetImpact: 'Zero ad spend (Organic YouTube upload)',
      targetAudience: 'B2B SaaS Founders & Growth Marketers'
    };

    onOpenApproval(approvalItem);

    const updated: YouTubeVideoProject = {
      ...selectedVideo,
      status: 'pending_approval'
    };
    setSelectedVideo(updated);
    onUpdateVideo(updated);

    showNotification(`Video "${selectedVideo.title}" submitted to Marketing Director Approval Gate.`);
  };

  // Create new video project
  const handleCreateNewProject = (format: VideoFormat) => {
    const isShorts = format === 'shorts';
    const newProj: YouTubeVideoProject = {
      id: `yt-${Date.now()}`,
      title: isShorts ? '3 AI Search Traps Costing You Leads' : 'How Generative Engines Audit Your Brand',
      format,
      targetChannelId: isShorts ? 'ch-yt-shorts' : 'ch-yt-main',
      durationSeconds: isShorts ? 55 : 620,
      status: 'draft',
      hooks: [
        {
          id: `hk-${Date.now()}-1`,
          text: isShorts ? 'Are you making this 1 critical mistake with your AI search citations?' : 'The architecture of 2026 AI discovery engines explained for engineers.',
          viralityScore: 92,
          angle: 'Curiosity & Direct Question',
          isSelected: true
        },
        {
          id: `hk-${Date.now()}-2`,
          text: isShorts ? 'Stop writing 2,000 word blogs. Here is what Perplexity actually reads.' : 'A deep dive into schema graphs and vector embeddings for B2B brands.',
          viralityScore: 87,
          angle: 'Actionable Counter-Intuitive',
          isSelected: false
        }
      ],
      scenes: [
        {
          id: `sc-${Date.now()}-1`,
          sceneNumber: 1,
          timestamp: isShorts ? '0:00 - 0:12' : '0:00 - 1:15',
          narration: isShorts ? 'Are you making this 1 critical mistake with your AI search citations?' : 'Today we break down the definitive framework for AI search readiness.',
          visualCue: 'Screen capture of AI search result comparing cited vs omitted sources',
          overlayText: 'THE #1 CITATION MISTAKE'
        },
        {
          id: `sc-${Date.now()}-2`,
          sceneNumber: 2,
          timestamp: isShorts ? '0:12 - 0:30' : '1:15 - 4:00',
          narration: 'Most companies do not declare explicit entity anchors. Without them, LLMs hallucinate your features.',
          visualCue: 'Animated schema diagram showing missing semantic relations',
          overlayText: 'MISSING ENTITY ANCHORS'
        },
        {
          id: `sc-${Date.now()}-3`,
          sceneNumber: 3,
          timestamp: isShorts ? '0:30 - 0:55' : '4:00 - 8:00',
          narration: 'Run your brand GEO Audit on Serpely today to get your live score. Link in description!',
          visualCue: 'Fast overview of Serpely GEO score calculation',
          overlayText: 'AUDIT YOUR SCORE NOW'
        }
      ],
      description: 'Discover how Generative Engine Optimization allows brands to stay visible in ChatGPT and Google AI Overviews.\n\nFree audit: https://sincly.io/audit\n\n#AISEO #YouTube #MarketingTips',
      tags: ['AI Search', 'GEO', 'Agentic Marketing', 'Sincly'],
      thumbnailConcept: {
        headline: 'AI SEARCH EXPLAINED',
        visualDescription: 'Clean dark background with glowing green citation metrics and bold white typography.',
        badgeText: 'NEW 2026'
      },
      voiceover: {
        provider: 'elevenlabs',
        voiceId: 'pNInz6obpgDQGcFmaJgB',
        voiceName: 'Adam',
        stability: 0.5,
        similarityBoost: 0.75,
        style: 0.05,
        status: 'idle'
      },
      avatar: {
        provider: 'heygen',
        avatarId: 'avatar_tyler_exec',
        avatarName: 'Tyler',
        backgroundMode: 'dark_studio',
        status: 'idle'
      },
      createdAt: '2026-11-04'
    };

    onCreateVideo(newProj);
    setSelectedVideo(newProj);
    showNotification(`New YouTube ${format === 'shorts' ? 'Short' : 'Long-Form'} project created.`);
  };

  const assignedChannel = channels.find(c => c.id === selectedVideo?.targetChannelId) || channels[0] || {
    name: 'Sincly Shorts Hub',
    handle: '@sincly_shorts',
    platform: 'YouTube' as const,
    queuedCount: 1,
    dailyUploadLimit: 5
  };

  const currentSelectedVoice = CURATED_VOICES.find(v => v.id === selectedVoiceId) || CURATED_VOICES[0];
  const currentSelectedAvatar = CURATED_AVATARS.find(a => a.id === selectedAvatarId) || CURATED_AVATARS[0];

  return (
    <div className="space-y-6">
      {/* Hidden Master Audio Element */}
      {selectedVideo?.voiceover?.audioUrl && (
        <audio
          ref={audioRef}
          src={selectedVideo.voiceover.audioUrl}
          onTimeUpdate={() => {
            if (audioRef.current) {
              setAudioCurrentTime(audioRef.current.currentTime);
              setAudioDuration(audioRef.current.duration || 0);
            }
          }}
          onEnded={() => {
            setIsPlaying(false);
            setActiveSceneIndex(0);
            setPlaybackProgress(0);
          }}
        />
      )}

      {/* Video Studio Sub-Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-xl bg-neutral-900/40 border border-neutral-800">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-mono text-neutral-400 font-semibold uppercase">Project:</span>
          <div className="flex flex-wrap gap-2">
            {videos.map(v => (
              <button
                key={v.id}
                onClick={() => {
                  setSelectedVideo(v);
                  setIsPlaying(false);
                  setActiveSceneIndex(0);
                  setPlaybackProgress(0);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  selectedVideo?.id === v.id
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                    : 'bg-neutral-950 text-neutral-400 border border-neutral-800 hover:text-white'
                }`}
              >
                {v.format === 'shorts' ? (
                  <Smartphone className="h-3 w-3 text-rose-400" />
                ) : (
                  <Tv className="h-3 w-3 text-rose-400" />
                )}
                <span className="truncate max-w-[180px]">{v.title}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleCreateNewProject('shorts')}
            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors flex items-center gap-1.5 border border-neutral-700"
          >
            <Plus className="h-3.5 w-3.5 text-rose-400" />
            <span>+ YouTube Short (9:16)</span>
          </button>
          <button
            onClick={() => handleCreateNewProject('longform')}
            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors flex items-center gap-1.5 border border-neutral-700"
          >
            <Plus className="h-3.5 w-3.5 text-rose-400" />
            <span>+ Long-Form (16:9)</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-300 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-neutral-400 hover:text-white">✕</button>
        </div>
      )}

      {selectedVideo && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ========================================================= */}
          {/* LEFT 7 COLS: SCRIPT, TIMELINE & AI MEDIA RENDERING DECK   */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 space-y-5">
            {/* Project Overview Card */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      YouTube {selectedVideo.format === 'shorts' ? 'Shorts (60s)' : 'Long-Form Video'}
                    </span>
                    <span className="text-neutral-500 text-xs">·</span>
                    <span className="text-xs font-mono text-neutral-400">
                      Channel: <strong className="text-white">{assignedChannel ? `${assignedChannel.name} (${assignedChannel.handle})` : 'Main Channel'}</strong>
                    </span>
                  </div>
                  <input
                    type="text"
                    value={selectedVideo.title}
                    onChange={e => {
                      const updated = { ...selectedVideo, title: e.target.value };
                      setSelectedVideo(updated);
                      onUpdateVideo(updated);
                    }}
                    className="text-base sm:text-lg font-bold text-white bg-transparent border-b border-transparent hover:border-neutral-700 focus:border-rose-400 focus:outline-none w-full"
                    placeholder="Enter video project title..."
                  />
                </div>

                {/* Format Toggle Pill */}
                <div className="flex items-center bg-neutral-950 p-1 rounded-lg border border-neutral-800 text-xs shrink-0">
                  <button
                    onClick={() => handleFormatChange('shorts')}
                    className={`px-2.5 py-1 rounded font-semibold flex items-center gap-1 transition-colors ${
                      selectedVideo.format === 'shorts'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'text-neutral-400 hover:text-white border border-transparent'
                    }`}
                  >
                    <Smartphone className="h-3 w-3" />
                    <span>Shorts (9:16)</span>
                  </button>
                  <button
                    onClick={() => handleFormatChange('longform')}
                    className={`px-2.5 py-1 rounded font-semibold flex items-center gap-1 transition-colors ${
                      selectedVideo.format === 'longform'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'text-neutral-400 hover:text-white border border-transparent'
                    }`}
                  >
                    <Tv className="h-3 w-3" />
                    <span>Long-Form (16:9)</span>
                  </button>
                </div>
              </div>

              {/* Hook Angles Generator */}
              <div className="space-y-2 pt-2 border-t border-neutral-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="h-3.5 w-3.5 text-rose-400" />
                    <span className="text-xs font-mono font-bold text-neutral-300 uppercase">
                      Viral Hook Variations ({selectedVideo.hooks.length})
                    </span>
                  </div>
                  <button
                    onClick={handleGenerateAIHooksAndScript}
                    disabled={isGeneratingAI}
                    className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 disabled:opacity-50"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>{isGeneratingAI ? 'Synthesizing...' : 'Re-generate Hooks with AI'}</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {selectedVideo.hooks.map(hook => (
                    <div
                      key={hook.id}
                      onClick={() => handleSelectHook(hook.id)}
                      className={`cursor-pointer rounded-lg p-3 border transition-all text-xs space-y-1.5 ${
                        hook.isSelected
                          ? 'bg-rose-950/20 border-rose-500/50 ring-1 ring-rose-500/30'
                          : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase font-bold text-neutral-400">
                          {hook.angle}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-emerald-400 font-bold">
                            Virality Score: {hook.viralityScore}%
                          </span>
                          {hook.isSelected && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-500 text-neutral-950 font-bold">
                              ACTIVE HOOK
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-white font-sans font-medium leading-relaxed">
                        "{hook.text}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* AI MEDIA ENGINE DECK (ELEVENLABS TTS & HEYGEN AVATAR)      */}
            {/* ========================================================= */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                    AI Voiceover & Avatar Render Engine
                  </h3>
                </div>

                {/* Engine Mode Tabs */}
                <div className="flex items-center bg-neutral-950 p-1 rounded-lg border border-neutral-800 text-xs">
                  <button
                    onClick={() => setActiveMediaDeck('voiceover')}
                    className={`px-3 py-1 rounded-md font-semibold flex items-center gap-1.5 transition-colors ${
                      activeMediaDeck === 'voiceover'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Mic className="h-3.5 w-3.5 text-emerald-400" />
                    <span>ElevenLabs Voiceover</span>
                  </button>
                  <button
                    onClick={() => setActiveMediaDeck('avatar')}
                    className={`px-3 py-1 rounded-md font-semibold flex items-center gap-1.5 transition-colors ${
                      activeMediaDeck === 'avatar'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <User className="h-3.5 w-3.5 text-cyan-400" />
                    <span>HeyGen Face Avatar</span>
                  </button>
                </div>
              </div>

              {/* TAB 1: ELEVENLABS VOICEOVER CONTROLS */}
              {activeMediaDeck === 'voiceover' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Voice Model Selector */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase font-bold text-neutral-300 block">
                        ElevenLabs Neural Voice Model:
                      </label>
                      <select
                        value={selectedVoiceId}
                        onChange={e => setSelectedVoiceId(e.target.value)}
                        className="w-full p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs font-mono focus:border-emerald-500 focus:outline-none"
                      >
                        {CURATED_VOICES.map(voice => (
                          <option key={voice.id} value={voice.id}>
                            {voice.name} — {voice.category} ({voice.accent})
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-neutral-400">
                        {currentSelectedVoice.description}
                      </p>
                    </div>

                    {/* Synthesis Quick Controls */}
                    <div className="space-y-2 bg-neutral-950 p-3.5 rounded-xl border border-neutral-800">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-400">Voice Stability:</span>
                        <span className="font-mono text-emerald-400 font-bold">{Math.round(stability * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.05"
                        value={stability}
                        onChange={e => setStability(parseFloat(e.target.value))}
                        className="w-full accent-emerald-400"
                      />

                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-neutral-400">Similarity / Clarity:</span>
                        <span className="font-mono text-emerald-400 font-bold">{Math.round(similarityBoost * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.05"
                        value={similarityBoost}
                        onChange={e => setSimilarityBoost(parseFloat(e.target.value))}
                        className="w-full accent-emerald-400"
                      />
                    </div>
                  </div>

                  {/* Master Voiceover Audio Player & Render Button */}
                  <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-mono uppercase font-bold text-white flex items-center gap-2">
                          <Volume2 className="h-4 w-4 text-emerald-400" />
                          <span>Full Video Voiceover Track ({selectedVideo.durationSeconds}s)</span>
                        </span>
                        <span className="text-[11px] text-neutral-400">
                          Synthesizes narration across all {selectedVideo.scenes.length} scenes into a continuous master audio track.
                        </span>
                      </div>

                      <button
                        onClick={handleSynthesizeMasterVoiceover}
                        disabled={isSynthesizingVoice}
                        className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition-colors flex items-center gap-1.5 shrink-0 shadow-sm disabled:opacity-50"
                      >
                        {isSynthesizingVoice ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            <span>Synthesizing Voice...</span>
                          </>
                        ) : (
                          <>
                            <Mic className="h-3.5 w-3.5" />
                            <span>Synthesize Master Voiceover (ElevenLabs)</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Rendered Audio Player Bar */}
                    {selectedVideo.voiceover?.audioUrl && (
                      <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="h-8 w-8 rounded-full bg-emerald-500 text-neutral-950 flex items-center justify-center hover:bg-emerald-400 transition-colors shadow-sm shrink-0"
                          >
                            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                          </button>
                          <div>
                            <div className="text-xs font-mono font-bold text-emerald-300 flex items-center gap-2">
                              <span>ElevenLabs: {selectedVideo.voiceover.voiceName}</span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                READY
                              </span>
                            </div>
                            <div className="text-[10px] text-neutral-400 font-mono">
                              Rendered at {selectedVideo.voiceover.renderedAt || 'Just now'} · Duration: {selectedVideo.voiceover.durationSeconds || selectedVideo.durationSeconds}s
                            </div>
                          </div>
                        </div>

                        {/* Frequency Waveform Animation */}
                        <div className="flex items-center gap-1 h-6 shrink-0 px-2">
                          {[40, 75, 55, 90, 65, 80, 45, 95, 70, 85, 50, 60].map((h, i) => (
                            <span
                              key={i}
                              className={`w-1 rounded-full transition-all duration-200 ${
                                isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-700'
                              }`}
                              style={{ height: isPlaying ? `${h}%` : '20%' }}
                            />
                          ))}
                        </div>

                        <a
                          href={selectedVideo.voiceover.audioUrl}
                          download={`${selectedVideo.title.replace(/\s+/g, '_')}_voiceover.wav`}
                          className="px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-mono flex items-center gap-1.5 border border-neutral-800 shrink-0"
                        >
                          <Download className="h-3 w-3 text-emerald-400" />
                          <span>Download Audio</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: HEYGEN AVATAR CONTROLS */}
              {activeMediaDeck === 'avatar' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Avatar Persona Selector */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase font-bold text-neutral-300 block">
                        HeyGen Photorealistic AI Avatar:
                      </label>
                      <select
                        value={selectedAvatarId}
                        onChange={e => setSelectedAvatarId(e.target.value)}
                        className="w-full p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs font-mono focus:border-cyan-500 focus:outline-none"
                      >
                        {CURATED_AVATARS.map(avatar => (
                          <option key={avatar.id} value={avatar.id}>
                            {avatar.name} — {avatar.style}
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-neutral-400">
                        {currentSelectedAvatar.description}
                      </p>
                    </div>

                    {/* Studio Backdrop Selector */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase font-bold text-neutral-300 block">
                        Studio Backdrop & Lighting:
                      </label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {BACKGROUND_OPTIONS.map(bg => (
                          <button
                            key={bg.id}
                            onClick={() => setSelectedBackground(bg.id)}
                            className={`p-2 rounded-lg border font-mono text-[11px] flex items-center gap-2 transition-all ${
                              selectedBackground === bg.id
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                                : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                            }`}
                          >
                            <span className={`h-2.5 w-2.5 rounded-full ${bg.preview} shrink-0`} />
                            <span className="truncate">{bg.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Render Avatar Button & Progress Bar */}
                  <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-mono uppercase font-bold text-white flex items-center gap-2">
                          <Film className="h-4 w-4 text-cyan-400" />
                          <span>HeyGen Face-Avatar Render ({selectedVideo.format.toUpperCase()} · 1080p)</span>
                        </span>
                        <span className="text-[11px] text-neutral-400">
                          Renders a talking-head AI avatar reciting the primary hook and script scenes with neural lip-sync.
                        </span>
                      </div>

                      <button
                        onClick={handleRenderHeyGenAvatar}
                        disabled={isRenderingAvatar}
                        className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-xs transition-colors flex items-center gap-1.5 shrink-0 shadow-sm disabled:opacity-50"
                      >
                        {isRenderingAvatar ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            <span>Rendering Video ({avatarProgress}%)...</span>
                          </>
                        ) : (
                          <>
                            <User className="h-3.5 w-3.5" />
                            <span>Render Face Avatar Video (HeyGen)</span>
                          </>
                        )}
                      </button>
                    </div>

                    {isRenderingAvatar && (
                      <div className="space-y-1 pt-1">
                        <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400">
                          <span>Synthesizing facial mesh & neural lip-sync...</span>
                          <span>{avatarProgress}%</span>
                        </div>
                        <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-cyan-400 h-full transition-all duration-300"
                            style={{ width: `${avatarProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {selectedVideo.avatar?.videoUrl && (
                      <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center font-bold font-mono">
                            HD
                          </div>
                          <div>
                            <div className="font-mono font-bold text-cyan-300 flex items-center gap-2">
                              <span>HeyGen Avatar: {selectedVideo.avatar.avatarName}</span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                                RENDERED 1080p
                              </span>
                            </div>
                            <div className="text-[10px] text-neutral-400 font-mono">
                              Lip-sync Precision: 99.8% · Studio Backdrop: {selectedBackground.replace('_', ' ')}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => setStageViewMode('avatar')}
                          className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-mono text-xs border border-cyan-500/40"
                        >
                          Show on Stage
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Scene-by-Scene Script & Teleprompter Editor */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <ListOrdered className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                    Scene Breakdown & Teleprompter ({selectedVideo.scenes.length} Scenes)
                  </h3>
                </div>
                <button
                  onClick={handleAddScene}
                  className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors flex items-center gap-1 border border-neutral-700"
                >
                  <Plus className="h-3 w-3 text-emerald-400" />
                  <span>Add Scene</span>
                </button>
              </div>

              <div className="space-y-3">
                {selectedVideo.scenes.map((scene, idx) => (
                  <div
                    key={scene.id}
                    onClick={() => setActiveSceneIndex(idx)}
                    className={`rounded-xl border p-4 transition-all text-xs space-y-2.5 ${
                      activeSceneIndex === idx
                        ? 'bg-neutral-950 border-rose-500/50 ring-1 ring-rose-500/20'
                        : 'bg-neutral-950/60 border-neutral-800/80 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-mono">
                        <span className="px-2 py-0.5 rounded bg-neutral-900 text-rose-300 font-bold text-[10px]">
                          SCENE #{scene.sceneNumber}
                        </span>
                        <input
                          type="text"
                          value={scene.timestamp}
                          onChange={e => handleUpdateScene(idx, { timestamp: e.target.value })}
                          className="w-24 px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 text-[11px]"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Single Scene ElevenLabs Audio Synthesis Button */}
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleSynthesizeSceneVoiceover(idx);
                          }}
                          disabled={renderingSceneId === scene.id}
                          className="px-2 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono flex items-center gap-1 transition-colors"
                          title="Synthesize scene voice narration with ElevenLabs"
                        >
                          {renderingSceneId === scene.id ? (
                            <RefreshCw className="h-3 w-3 animate-spin text-emerald-400" />
                          ) : (
                            <Mic className="h-3 w-3 text-emerald-400" />
                          )}
                          <span>{renderingSceneId === scene.id ? 'Synthesizing...' : 'Voice Scene'}</span>
                        </button>

                        {scene.audioUrl && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handlePlaySceneAudio(scene);
                            }}
                            className="p-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
                            title="Play scene audio"
                          >
                            {playingSceneAudioId === scene.id ? (
                              <Pause className="h-3.5 w-3.5" />
                            ) : (
                              <Play className="h-3.5 w-3.5" />
                            )}
                          </button>
                        )}

                        {activeSceneIndex === idx && (
                          <span className="text-[10px] font-mono text-rose-400 font-semibold flex items-center gap-1">
                            <Eye className="h-3 w-3" /> Previewing
                          </span>
                        )}

                        {selectedVideo.scenes.length > 1 && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleDeleteScene(idx);
                            }}
                            className="text-neutral-500 hover:text-rose-400 p-1"
                            title="Delete scene"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Spoken Narration */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 uppercase">
                        <span>Spoken Voiceover / Teleprompter:</span>
                        {scene.audioDurationSeconds && (
                          <span className="text-emerald-400 font-bold">
                            ElevenLabs Track: {scene.audioDurationSeconds}s
                          </span>
                        )}
                      </div>
                      <textarea
                        rows={2}
                        value={scene.narration}
                        onChange={e => handleUpdateScene(idx, { narration: e.target.value })}
                        className="w-full p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white font-sans text-xs leading-relaxed focus:outline-none focus:border-rose-400"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      {/* Visual B-Roll Cue */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-neutral-500 uppercase">Visual B-Roll / Screen Cue:</label>
                        <input
                          type="text"
                          value={scene.visualCue}
                          onChange={e => handleUpdateScene(idx, { visualCue: e.target.value })}
                          className="w-full p-1.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300"
                        />
                      </div>

                      {/* On-Screen Text Overlay */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-emerald-400 uppercase">On-Screen Caption Overlay:</label>
                        <input
                          type="text"
                          value={scene.overlayText || ''}
                          onChange={e => handleUpdateScene(idx, { overlayText: e.target.value })}
                          placeholder="e.g. 68% ZERO-CLICK SEARCHES"
                          className="w-full p-1.5 rounded bg-neutral-900 border border-neutral-800 text-emerald-300 font-mono font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SEO Description & Platform Tags */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 space-y-3">
              <span className="text-xs font-mono uppercase font-bold text-neutral-300">
                SEO Description & Platform Tags
              </span>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-neutral-500 uppercase">YouTube Description:</label>
                <textarea
                  rows={3}
                  value={selectedVideo.description}
                  onChange={e => {
                    const updated = { ...selectedVideo, description: e.target.value };
                    setSelectedVideo(updated);
                    onUpdateVideo(updated);
                  }}
                  className="w-full p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs font-mono leading-relaxed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-neutral-500 uppercase">Hashtags & Topic Tags:</label>
                <div className="flex flex-wrap gap-1.5">
                  {selectedVideo.tags.map((t, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-950 text-neutral-300 border border-neutral-800"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT 5 COLS: INTERACTIVE VIDEO STAGE & APPROVAL DISPATCH  */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 space-y-5">
            {/* Interactive Video Preview Canvas */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 space-y-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-neutral-400 font-bold uppercase">
                    Stage: {selectedVideo.format === 'shorts' ? '9:16 Short' : '16:9 Landscape'}
                  </span>
                  {selectedVideo.avatar?.videoUrl && (
                    <div className="flex items-center bg-neutral-950 p-0.5 rounded border border-neutral-800 text-[10px]">
                      <button
                        onClick={() => setStageViewMode('avatar')}
                        className={`px-1.5 py-0.5 rounded ${
                          stageViewMode === 'avatar' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-neutral-400'
                        }`}
                      >
                        Avatar
                      </button>
                      <button
                        onClick={() => setStageViewMode('broll')}
                        className={`px-1.5 py-0.5 rounded ${
                          stageViewMode === 'broll' ? 'bg-rose-500/20 text-rose-300 font-bold' : 'text-neutral-400'
                        }`}
                      >
                        B-Roll
                      </button>
                    </div>
                  )}
                </div>
                <span className="text-rose-400 font-semibold">
                  Scene #{currentScene?.sceneNumber || 1} / {selectedVideo.scenes.length}
                </span>
              </div>

              {/* The Video Mockup Frame */}
              <div
                className={`mx-auto rounded-2xl border-2 border-neutral-800 bg-black overflow-hidden relative shadow-2xl transition-all flex flex-col justify-between ${
                  selectedVideo.format === 'shorts'
                    ? 'w-full max-w-[280px] aspect-[9/16] p-4'
                    : 'w-full aspect-[16/9] p-5'
                }`}
              >
                {/* Simulated Ambient Visual Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-rose-950/20 opacity-80 pointer-events-none" />

                {/* If HeyGen Avatar is rendered and active, display the neural avatar frame */}
                {selectedVideo.avatar?.videoUrl && stageViewMode === 'avatar' && (
                  <div className="absolute inset-0 z-0 overflow-hidden">
                    <img
                      src={selectedVideo.avatar.previewImageUrl || selectedVideo.avatar.videoUrl}
                      alt="HeyGen Avatar"
                      className="w-full h-full object-cover opacity-90 transition-transform duration-500"
                      style={{
                        transform: isPlaying ? 'scale(1.02)' : 'scale(1.0)'
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60" />
                  </div>
                )}

                {/* Top Channel Bar */}
                <div className="relative z-10 flex items-center justify-between text-white text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-[10px]">
                      S
                    </div>
                    <div className="leading-tight">
                      <div className="font-bold text-[11px] truncate">{assignedChannel.handle}</div>
                      <div className="text-[9px] text-neutral-400">{assignedChannel.name}</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-600/80 text-white font-bold">
                    SERPELY
                  </span>
                </div>

                {/* Center Content: Animated B-Roll & Overlay Caption */}
                <div className="relative z-10 text-center space-y-3 my-auto px-2">
                  {/* On-Screen Big Caption */}
                  {currentScene?.overlayText && (
                    <div className="inline-block px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-neutral-700 text-white font-extrabold text-xs sm:text-sm uppercase tracking-tight shadow-lg">
                      {currentScene.overlayText}
                    </div>
                  )}

                  {/* B-Roll Graphic Simulation (Shown if not in full avatar view) */}
                  {(!selectedVideo.avatar?.videoUrl || stageViewMode === 'broll') && (
                    <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 text-[11px] text-neutral-300 space-y-1 backdrop-blur-sm">
                      <span className="text-[9px] font-mono text-rose-400 uppercase font-semibold block">
                        Active Visual Frame:
                      </span>
                      <p className="line-clamp-3 text-neutral-200 font-sans">{currentScene?.visualCue}</p>
                    </div>
                  )}

                  {/* Narration Subtitle */}
                  <div className="bg-black/75 rounded px-2.5 py-1.5 text-[10px] text-neutral-200 font-sans line-clamp-2 border border-neutral-800/80 backdrop-blur-sm">
                    "{currentScene?.narration}"
                  </div>
                </div>

                {/* Bottom Timeline Scrubber & Stats */}
                <div className="relative z-10 space-y-2 pt-2">
                  {/* Waveform Equalizer when playing */}
                  {isPlaying && selectedVideo.voiceover?.audioUrl && (
                    <div className="flex items-center justify-center gap-1 h-3 mb-1">
                      {[30, 80, 50, 90, 60, 75, 40].map((h, i) => (
                        <span
                          key={i}
                          className="w-0.5 bg-emerald-400 rounded-full animate-pulse"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-rose-500 h-full transition-all duration-300"
                      style={{ width: `${playbackProgress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                    <span>{currentScene?.timestamp}</span>
                    <span>{selectedVideo.durationSeconds}s total</span>
                  </div>
                </div>
              </div>

              {/* Playback Controls */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-400 text-neutral-950 font-bold text-xs transition-colors flex items-center gap-2 shadow-sm"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-3.5 w-3.5" />
                      <span>Pause Player</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5" />
                      <span>Play Script Preview</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setPlaybackProgress(0);
                    setActiveSceneIndex(0);
                    if (audioRef.current) {
                      audioRef.current.pause();
                      audioRef.current.currentTime = 0;
                    }
                  }}
                  className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                  title="Reset preview"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Thumbnail & Title A/B Concept Card */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 space-y-3">
              <span className="text-xs font-mono uppercase font-bold text-neutral-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>Thumbnail & Title A/B Concept</span>
              </span>

              <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 space-y-2 text-xs">
                <div>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase block">Thumbnail Hook Headline:</span>
                  <input
                    type="text"
                    value={selectedVideo.thumbnailConcept.headline}
                    onChange={e => {
                      const updated = {
                        ...selectedVideo,
                        thumbnailConcept: { ...selectedVideo.thumbnailConcept, headline: e.target.value }
                      };
                      setSelectedVideo(updated);
                      onUpdateVideo(updated);
                    }}
                    className="w-full p-2 rounded bg-neutral-900 border border-neutral-800 text-white font-bold font-mono text-xs uppercase"
                  />
                </div>

                <div>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase block">Art Director Visual Brief:</span>
                  <p className="text-neutral-300 text-[11px] leading-relaxed">
                    {selectedVideo.thumbnailConcept.visualDescription}
                  </p>
                </div>
              </div>
            </div>

            {/* Target Channel Account Selector */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 space-y-3">
              <span className="text-xs font-mono uppercase font-bold text-neutral-300">
                Connected YouTube Channel Account
              </span>

              <select
                value={selectedVideo.targetChannelId}
                onChange={e => {
                  const updated = { ...selectedVideo, targetChannelId: e.target.value };
                  setSelectedVideo(updated);
                  onUpdateVideo(updated);
                }}
                className="w-full p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs font-mono"
              >
                {channels.map(ch => (
                  <option key={ch.id} value={ch.id}>
                    {ch.name} ({ch.handle}) — {ch.platform} · {ch.followerCount.toLocaleString()} subs
                  </option>
                ))}
              </select>

              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono flex items-center justify-between text-neutral-400">
                <span>Daily Upload Quota:</span>
                <span className="text-emerald-400 font-bold">
                  {assignedChannel.queuedCount} / {assignedChannel.dailyUploadLimit} Slots Used
                </span>
              </div>
            </div>

            {/* Submit to Approval Gate */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-950/10 p-5 space-y-3">
              <div className="flex items-start gap-2.5 text-amber-200">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
                <div className="text-xs leading-relaxed">
                  <strong>High-Risk Human Approval Gate:</strong> Publishing to {assignedChannel.handle} requires final review by the Marketing Director.
                </div>
              </div>

              <button
                onClick={handleSubmitApproval}
                className="w-full py-2.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-neutral-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-md shadow-rose-500/10"
              >
                <ShieldAlert className="h-4 w-4" />
                <span>Submit Video to Approval Gate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
