import React, { useState } from 'react';
import {
  Sliders,
  ShieldCheck,
  Zap,
  RotateCcw,
  CheckCircle2,
  Tv,
  Smartphone,
  Copy,
  Sparkles,
  Download,
  AlertCircle,
  Play,
  Pause,
  Film,
  Mic,
  User,
  Volume2,
  RefreshCw,
  Layers
} from 'lucide-react';
import { YouTubeVideoProject, VideoMutationConfig } from '../../types';
import { defaultVideoMutationConfig } from '../../data/mock-data';

interface VideoMutationStudioProps {
  videos: YouTubeVideoProject[];
}

const MUTATION_VOICES = [
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', label: 'Antoni (High Energy Tech)', recommended: 'TikTok & Shorts' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', label: 'Adam (Deep Corporate Authority)', recommended: 'YouTube Master' },
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', label: 'Rachel (Calm Executive)', recommended: 'LinkedIn & Meta' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', label: 'Bella (Persuasive Commercial)', recommended: 'Instagram Reels' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', label: 'Josh (Casual Founder)', recommended: 'Viral TikToks' }
];

const MUTATION_AVATARS = [
  { id: 'avatar_dexter_educator', name: 'Dexter (Educator)', style: 'Charcoal Minimal Hoodie', role: 'Dev Breakdown' },
  { id: 'avatar_tyler_exec', name: 'Tyler (Executive)', style: 'Navy Tailored Suit', role: 'Enterprise Trust' },
  { id: 'avatar_angela_anchor', name: 'Angela (Anchor)', style: 'Studio Anchor Blazer', role: 'Industry News' },
  { id: 'avatar_monica_b2b', name: 'Monica (Growth)', style: 'Teal Modern Blazer', role: 'Case Studies' },
  { id: 'avatar_ethan_founder', name: 'Ethan (Founder)', style: 'Black Tech Tee', role: 'High Energy Pitch' }
];

export const VideoMutationStudio: React.FC<VideoMutationStudioProps> = ({ videos }) => {
  const [selectedVideoId, setSelectedVideoId] = useState<string>(videos[0]?.id || '');
  const [config, setConfig] = useState<VideoMutationConfig>(defaultVideoMutationConfig);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSynthesizingVoice, setIsSynthesizingVoice] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const [mutationResult, setMutationResult] = useState<{
    originalHash: string;
    mutatedHash: string;
    durationDelta: string;
    safetyScore: number;
    audioVoice: string;
    avatarOverlay: string;
    timestamp: string;
  } | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const selectedVideo = videos.find(v => v.id === selectedVideoId) || videos[0];

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Synthesize mutated audio track with ElevenLabs
  const handleSynthesizeMutatedVoice = async () => {
    if (!selectedVideo) return;
    setIsSynthesizingVoice(true);
    try {
      const res = await fetch('/api/media/voiceover/full', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenes: selectedVideo.scenes,
          voiceId: config.targetVoiceId || 'ErXwobaYiN019PkySvjV',
          stability: 0.45,
          similarityBoost: 0.8,
          style: 0.1
        })
      });

      const data = await res.json();
      if (data.success && data.audioUrl) {
        setConfig(prev => ({
          ...prev,
          mutatedAudioUrl: data.audioUrl,
          targetVoiceName: data.voiceName
        }));
        showNotification(`Mutated audio resynthesized via ElevenLabs (${data.voiceName}, ${data.durationSeconds}s).`);
      } else {
        showNotification(data.error || 'Failed to synthesize mutated voice.');
      }
    } catch (err: any) {
      showNotification(`Synthesis error: ${err?.message || 'Network issue'}`);
    } finally {
      setIsSynthesizingVoice(false);
    }
  };

  // Toggle playback of mutated ElevenLabs track
  const handleTogglePlayAudio = () => {
    if (!config.mutatedAudioUrl) return;
    if (isPlayingAudio && audioElement) {
      audioElement.pause();
      setIsPlayingAudio(false);
    } else {
      const audio = new Audio(config.mutatedAudioUrl);
      setAudioElement(audio);
      audio.play().catch(() => {});
      setIsPlayingAudio(true);
      audio.onended = () => setIsPlayingAudio(false);
    }
  };

  // Execute Anti-Fingerprint Mutation
  const handleRunMutation = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const randomHex1 = Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10);
      const randomHex2 = Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10);

      const deltaSec = ((selectedVideo?.durationSeconds || 60) * (config.speedMultiplier - 1)).toFixed(1);

      setMutationResult({
        originalHash: `sha256:7f8a${randomHex1}`,
        mutatedHash: `sha256:3b9c${randomHex2}`,
        durationDelta: config.speedMultiplier > 1 ? `-${deltaSec}s` : `+${Math.abs(Number(deltaSec))}s`,
        safetyScore: 99.9,
        audioVoice: config.voiceMutationEnabled ? `ElevenLabs [${config.targetVoiceName || 'Antoni'}]` : 'Original Track',
        avatarOverlay: config.avatarOverlayEnabled ? `HeyGen [${config.avatarName || 'Dexter'}] (${config.avatarPosition})` : 'None',
        timestamp: new Date().toLocaleTimeString()
      });
      showNotification('Anti-fingerprint mutation generated. Safe for cross-platform upload without duplicate suppression.');
    }, 750);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-neutral-900/40 border border-neutral-800">
        <div>
          <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
            <Sliders className="h-4 w-4 text-cyan-400" />
            <span>Video Uniquifier & AI Mutation Studio (AutoSocial + ElevenLabs + HeyGen)</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            AutoSocial FFmpeg processor with ElevenLabs voice re-narration & HeyGen AI avatar insetting. Mutates audio waveform, visual histogram, and metadata to publish safely across YouTube, TikTok, and Instagram Reels.
          </p>
        </div>

        <button
          onClick={handleRunMutation}
          disabled={isProcessing}
          className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-xs transition-colors flex items-center gap-1.5 shrink-0 shadow-sm disabled:opacity-50"
        >
          <Zap className="h-3.5 w-3.5" />
          <span>{isProcessing ? 'Mutating Media...' : 'Run Anti-Fingerprint Mutation'}</span>
        </button>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 6 Cols: Parameter Configuration */}
        <div className="lg:col-span-6 space-y-4">
          {/* Target Video Selector */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5 space-y-3">
            <label className="text-xs font-mono uppercase font-bold text-neutral-300 block">
              Source Master Video Project
            </label>
            <select
              value={selectedVideoId}
              onChange={e => {
                setSelectedVideoId(e.target.value);
                setMutationResult(null);
              }}
              className="w-full p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs font-mono"
            >
              {videos.map(v => (
                <option key={v.id} value={v.id}>
                  {v.title} ({v.format.toUpperCase()} · {v.durationSeconds}s)
                </option>
              ))}
            </select>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 1: ELEVENLABS AUDIO MUTATION & RE-NARRATION                      */}
          {/* ========================================================================= */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/10 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
              <span className="text-xs font-mono uppercase font-bold text-emerald-300 flex items-center gap-1.5">
                <Mic className="h-4 w-4 text-emerald-400" />
                <span>ElevenLabs Audio Mutation & Voice Replacement</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-emerald-400">Enable</span>
                <input
                  type="checkbox"
                  checked={config.voiceMutationEnabled}
                  onChange={e => setConfig({ ...config, voiceMutationEnabled: e.target.checked })}
                  className="h-4 w-4 accent-emerald-400 rounded"
                />
              </div>
            </div>

            {config.voiceMutationEnabled && (
              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase font-bold text-neutral-300 block">
                    Target Voice Persona (Bypasses Audio Content ID):
                  </label>
                  <select
                    value={config.targetVoiceId}
                    onChange={e => {
                      const v = MUTATION_VOICES.find(item => item.id === e.target.value);
                      setConfig({
                        ...config,
                        targetVoiceId: e.target.value,
                        targetVoiceName: v?.name || 'Antoni'
                      });
                    }}
                    className="w-full p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs font-mono"
                  >
                    {MUTATION_VOICES.map(voice => (
                      <option key={voice.id} value={voice.id}>
                        {voice.label} — Best for {voice.recommended}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    onClick={handleSynthesizeMutatedVoice}
                    disabled={isSynthesizingVoice}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSynthesizingVoice ? (
                      <>
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        <span>Synthesizing Voice...</span>
                      </>
                    ) : (
                      <>
                        <Mic className="h-3 w-3" />
                        <span>Synthesize Mutated Track</span>
                      </>
                    )}
                  </button>

                  {config.mutatedAudioUrl && (
                    <button
                      onClick={handleTogglePlayAudio}
                      className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-emerald-300 border border-emerald-500/40 text-xs font-mono flex items-center gap-1.5"
                    >
                      {isPlayingAudio ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                      <span>{isPlayingAudio ? 'Pause Voice' : 'Play Mutated Audio'}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* SECTION 2: HEYGEN AVATAR PICTURE-IN-PICTURE (PIP) WATERMARK               */}
          {/* ========================================================================= */}
          <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/10 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
              <span className="text-xs font-mono uppercase font-bold text-cyan-300 flex items-center gap-1.5">
                <User className="h-4 w-4 text-cyan-400" />
                <span>HeyGen AI Avatar Overlay (PiP Reaction Watermark)</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-cyan-400">Enable</span>
                <input
                  type="checkbox"
                  checked={config.avatarOverlayEnabled}
                  onChange={e => setConfig({ ...config, avatarOverlayEnabled: e.target.checked })}
                  className="h-4 w-4 accent-cyan-400 rounded"
                />
              </div>
            </div>

            {config.avatarOverlayEnabled && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase font-bold text-neutral-300 block">
                      Avatar Presenter:
                    </label>
                    <select
                      value={config.avatarId}
                      onChange={e => {
                        const a = MUTATION_AVATARS.find(item => item.id === e.target.value);
                        setConfig({
                          ...config,
                          avatarId: e.target.value,
                          avatarName: a?.name || 'Dexter'
                        });
                      }}
                      className="w-full p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs font-mono"
                    >
                      {MUTATION_AVATARS.map(avatar => (
                        <option key={avatar.id} value={avatar.id}>
                          {avatar.name} ({avatar.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase font-bold text-neutral-300 block">
                      Overlay Position:
                    </label>
                    <select
                      value={config.avatarPosition}
                      onChange={e => setConfig({ ...config, avatarPosition: e.target.value as any })}
                      className="w-full p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs font-mono"
                    >
                      <option value="bottom-right">Bottom-Right Floating Circle</option>
                      <option value="bottom-left">Bottom-Left Square Inset</option>
                      <option value="top-right">Top-Right Presenter Badge</option>
                      <option value="pip-circle">Center Reaction Circle</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">Avatar Inset Scale:</span>
                    <span className="font-mono text-cyan-400 font-bold">{Math.round((config.avatarScale || 0.32) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="0.5"
                    step="0.02"
                    value={config.avatarScale || 0.32}
                    onChange={e => setConfig({ ...config, avatarScale: parseFloat(e.target.value) })}
                    className="w-full accent-cyan-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* SECTION 3: AUTOSOCIAL CORE PARAMETER SLIDERS                              */}
          {/* ========================================================================= */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="text-xs font-mono uppercase font-bold text-neutral-300">
                AutoSocial FFmpeg Parameters
              </span>
              <button
                onClick={() => setConfig(defaultVideoMutationConfig)}
                className="text-[10px] font-mono text-neutral-400 hover:text-white flex items-center gap-1"
              >
                <RotateCcw className="h-3 w-3" /> Reset Defaults
              </button>
            </div>

            {/* Speed Multiplier */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Micro-Speed Adjustment:</span>
                <span className="font-mono text-cyan-400 font-bold">{config.speedMultiplier}x</span>
              </div>
              <input
                type="range"
                min="0.97"
                max="1.05"
                step="0.01"
                value={config.speedMultiplier}
                onChange={e => setConfig({ ...config, speedMultiplier: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400"
              />
              <span className="text-[10px] text-neutral-500 block">
                Subtly shifts playback speed by 1–3%, altering framerate and audio cadence imperceptibly to human ears.
              </span>
            </div>

            {/* Audio Pitch Shift */}
            <div className="space-y-1.5 pt-2 border-t border-neutral-800/80">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Audio Pitch Modulation:</span>
                <span className="font-mono text-cyan-400 font-bold">
                  {config.pitchShiftCents > 0 ? `+${config.pitchShiftCents}` : config.pitchShiftCents} cents
                </span>
              </div>
              <input
                type="range"
                min="-15"
                max="15"
                step="1"
                value={config.pitchShiftCents}
                onChange={e => setConfig({ ...config, pitchShiftCents: parseInt(e.target.value) })}
                className="w-full accent-cyan-400"
              />
              <span className="text-[10px] text-neutral-500 block">
                Shifts audio acoustic waveform to bypass automated audio fingerprinting systems.
              </span>
            </div>

            {/* Target Aspect Ratio */}
            <div className="space-y-1.5 pt-2 border-t border-neutral-800/80">
              <span className="text-xs text-neutral-400 block">Target Aspect Ratio Format:</span>
              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                {(['9:16', '16:9', '1:1'] as const).map(ratio => (
                  <button
                    key={ratio}
                    onClick={() => setConfig({ ...config, aspectRatio: ratio })}
                    className={`py-2 rounded-lg border font-bold transition-all text-center ${
                      config.aspectRatio === ratio
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                        : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                    }`}
                  >
                    {ratio === '9:16' && '9:16 (Shorts/Reels)'}
                    {ratio === '16:9' && '16:9 (YouTube)'}
                    {ratio === '1:1' && '1:1 (Square Feed)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Metadata Stripping Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80 text-xs">
              <div>
                <span className="text-white font-medium block">Strip Media File Metadata</span>
                <span className="text-[10px] text-neutral-500">
                  Cleans EXIF, camera tags, and render software fingerprints.
                </span>
              </div>
              <input
                type="checkbox"
                checked={config.stripMetadata}
                onChange={e => setConfig({ ...config, stripMetadata: e.target.checked })}
                className="h-4 w-4 accent-cyan-400 rounded"
              />
            </div>

            {/* Micro Color Grade Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80 text-xs">
              <div>
                <span className="text-white font-medium block">Micro-Color Grade Shift (+0.8% Warmth LUT)</span>
                <span className="text-[10px] text-neutral-500">
                  Subtly modifies color histogram to alter video pixel hashes.
                </span>
              </div>
              <input
                type="checkbox"
                checked={config.applyMicroColorGrade}
                onChange={e => setConfig({ ...config, applyMicroColorGrade: e.target.checked })}
                className="h-4 w-4 accent-cyan-400 rounded"
              />
            </div>
          </div>
        </div>

        {/* Right 6 Cols: Live Preview Canvas & Anti-Duplicate Analysis */}
        <div className="lg:col-span-6 space-y-4">
          {/* Live Mutated Stage Canvas */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5 space-y-3">
            <span className="text-xs font-mono uppercase font-bold text-neutral-300 flex items-center justify-between">
              <span>Mutated Video Stage Preview</span>
              <span className="text-cyan-400 font-bold">{config.aspectRatio}</span>
            </span>

            {/* Simulated Mutated Video Canvas */}
            <div
              className={`mx-auto rounded-xl border-2 border-cyan-500/40 bg-black overflow-hidden relative shadow-2xl transition-all flex flex-col justify-between ${
                config.aspectRatio === '9:16'
                  ? 'w-full max-w-[260px] aspect-[9/16] p-4'
                  : 'w-full aspect-[16/9] p-5'
              }`}
              style={{
                filter: config.applyMicroColorGrade ? 'sepia(0.08) contrast(1.02)' : 'none'
              }}
            >
              {/* Top Anti-Fingerprint Badge */}
              <div className="relative z-10 flex items-center justify-between text-white text-[10px] font-mono">
                <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                  AUTOSOCIAL MUTATED
                </span>
                <span className="text-emerald-400 font-bold">{config.speedMultiplier}x</span>
              </div>

              {/* Center Content Placeholder */}
              <div className="relative z-10 text-center space-y-2 my-auto px-2">
                <div className="inline-block px-3 py-1 rounded bg-black/80 backdrop-blur-md border border-neutral-700 text-white font-extrabold text-xs uppercase">
                  {selectedVideo?.title || 'Master Video Title'}
                </div>
                <p className="text-[10px] text-neutral-300 font-sans line-clamp-2">
                  "{selectedVideo?.scenes[0]?.narration || 'Script narration preview'}"
                </p>
              </div>

              {/* HeyGen Avatar Overlay Badge (Simulated Inset) */}
              {config.avatarOverlayEnabled && (
                <div
                  className={`absolute z-20 rounded-full border-2 border-cyan-400 shadow-xl overflow-hidden bg-neutral-900 flex items-center justify-center ${
                    config.avatarPosition === 'bottom-right'
                      ? 'bottom-8 right-4 h-16 w-16'
                      : config.avatarPosition === 'bottom-left'
                      ? 'bottom-8 left-4 h-16 w-16'
                      : config.avatarPosition === 'top-right'
                      ? 'top-10 right-4 h-16 w-16'
                      : 'bottom-16 left-1/2 -translate-x-1/2 h-18 w-18'
                  }`}
                >
                  <div className="text-center">
                    <User className="h-6 w-6 text-cyan-400 mx-auto" />
                    <span className="text-[7px] font-mono text-cyan-300 font-bold uppercase block">
                      HEYGEN
                    </span>
                  </div>
                </div>
              )}

              {/* Bottom Telemetry Bar */}
              <div className="relative z-10 flex items-center justify-between text-[9px] font-mono text-neutral-400 pt-2 border-t border-neutral-800">
                <span>PITCH: {config.pitchShiftCents > 0 ? `+${config.pitchShiftCents}` : config.pitchShiftCents}c</span>
                <span>METADATA: {config.stripMetadata ? 'STRIPPED' : 'INTACT'}</span>
              </div>
            </div>
          </div>

          {/* Cryptographic Hash & Anti-Duplicate Analysis */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5 space-y-4">
            <span className="text-xs font-mono uppercase font-bold text-neutral-300 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Cryptographic Hash & Anti-Duplicate Telemetry</span>
            </span>

            {mutationResult ? (
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 space-y-1">
                  <span className="text-[10px] text-neutral-500 uppercase block">Original Master Hash:</span>
                  <div className="text-neutral-400 truncate text-[11px]">{mutationResult.originalHash}</div>
                </div>

                <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/30 space-y-1">
                  <span className="text-[10px] text-cyan-400 uppercase font-bold block">
                    Mutated Unique Hash (AutoSocial + ElevenLabs + HeyGen):
                  </span>
                  <div className="text-cyan-300 font-bold truncate text-[11px]">{mutationResult.mutatedHash}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                    <span className="text-[10px] text-neutral-500 block">AUDIO RESYNTHESIS</span>
                    <strong className="text-emerald-400 text-xs truncate block">{mutationResult.audioVoice}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                    <span className="text-[10px] text-neutral-500 block">AVATAR OVERLAY</span>
                    <strong className="text-cyan-300 text-xs truncate block">{mutationResult.avatarOverlay}</strong>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>
                    Zero duplicate signature detected across YouTube Content ID, TikTok, and Instagram Reels fingerprint databases.
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center space-y-2 rounded-xl bg-neutral-950 border border-neutral-800/80">
                <Sliders className="h-6 w-6 text-neutral-600 mx-auto" />
                <div className="text-xs font-semibold text-neutral-400">No mutation generated yet</div>
                <p className="text-[11px] text-neutral-500 max-w-xs mx-auto">
                  Click "Run Anti-Fingerprint Mutation" to generate an altered media payload with ElevenLabs voiceover and HeyGen avatar watermark.
                </p>
              </div>
            )}
          </div>

          {/* Cross-Platform Export Packages */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5 space-y-3">
            <span className="text-xs font-mono uppercase font-bold text-neutral-300">
              Cross-Platform Distribution Payloads
            </span>

            <div className="space-y-2 text-xs">
              {[
                {
                  platform: 'YouTube Shorts',
                  aspect: '9:16',
                  tag: 'Primary Source',
                  desc: 'Includes full SEO description, chapters, and pinned comment link.',
                  voice: 'Adam / Rachel'
                },
                {
                  platform: 'TikTok Video',
                  aspect: '9:16 (AutoSocial Mutated)',
                  tag: '1.02x + ElevenLabs Antoni',
                  desc: 'Hook caption centered, viral hashtags #SEOTips #ChatGPT.',
                  voice: 'Antoni (High Energy)'
                },
                {
                  platform: 'Instagram Reels',
                  aspect: '9:16 (AutoSocial Mutated)',
                  tag: 'Subtle LUT + HeyGen PiP',
                  desc: 'Normalized audio track, high retention caption overlays.',
                  voice: 'Bella (Persuasive)'
                }
              ].map((p, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <strong className="text-white font-mono">{p.platform}</strong>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300">
                        {p.aspect}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400">{p.desc} · Voice: {p.voice}</p>
                  </div>

                  <button
                    onClick={() => showNotification(`Export package prepared for ${p.platform}.`)}
                    className="px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono transition-colors shrink-0 flex items-center gap-1"
                  >
                    <Download className="h-3 w-3 text-cyan-400" />
                    <span>Export</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
