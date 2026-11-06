import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Flame,
  Clock,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Wand2,
  ChevronDown,
  ChevronUp,
  Info,
  Calendar,
  Check
} from 'lucide-react';
import { SocialPagePlatform } from '../../types';
import { apiClient } from '../../services/apiClient';

interface ViralityBreakdown {
  hookScore: number;
  readabilityScore: number;
  engagementScore: number;
  hashtagScore: number;
}

interface SmartTimingRecommendation {
  dayOfWeek: string;
  recommendedTime: string;
  peakWindowLabel: string;
  audienceInsight: string;
}

interface ViralityPredictionData {
  overallScore: number;
  viralityTier: 'high_viral' | 'strong' | 'moderate' | 'needs_boost';
  tierLabel: string;
  tierBadgeColor: string;
  breakdown: ViralityBreakdown;
  smartTiming: SmartTimingRecommendation;
  suggestions: string[];
  polishedContent?: string;
}

interface ViralityPredictorMeterProps {
  platform: SocialPagePlatform;
  content: string;
  hashtags?: string[];
  onApplyPolishedContent?: (polished: string) => void;
  onApplyRecommendedTiming?: (day: string, time: string) => void;
}

export const ViralityPredictorMeter: React.FC<ViralityPredictorMeterProps> = ({
  platform,
  content,
  hashtags = [],
  onApplyPolishedContent,
  onApplyRecommendedTiming
}) => {
  const [prediction, setPrediction] = useState<ViralityPredictionData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showTips, setShowTips] = useState<boolean>(false);
  const [appliedBoost, setAppliedBoost] = useState<boolean>(false);
  const [appliedTime, setAppliedTime] = useState<boolean>(false);

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const evaluateVirality = async (text: string, currentPlatform: SocialPagePlatform) => {
    if (!text.trim()) {
      setPrediction(null);
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiClient.post('/api/social/predict-virality', {
        platform: currentPlatform,
        content: text,
        hashtags
      });

      if (res.success && res.data) {
        setPrediction(res.data);
      }
    } catch {
      // ignore network errors
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      evaluateVirality(content, platform);
    }, 450);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [content, platform, hashtags]);

  if (!content.trim() || !prediction) {
    return (
      <div className="p-3 rounded-2xl bg-neutral-950/70 border border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-neutral-500" />
          <span className="font-mono">Predictive Virality Engine (FeedHive Model)</span>
        </div>
        <span className="text-[11px] font-mono text-neutral-500">Draft content to score</span>
      </div>
    );
  }

  const score = prediction.overallScore;
  const isHighViral = score >= 85;
  const isStrong = score >= 70 && score < 85;

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-4 space-y-3.5 backdrop-blur-sm">
      {/* Top Strip: Score, Badge & Auto-Boost CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Circular/Pill Score Gauge */}
          <div
            className={`flex items-center justify-center h-12 w-12 rounded-2xl border font-mono font-black text-sm shrink-0 ${
              isHighViral
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-md shadow-emerald-950'
                : isStrong
                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-md shadow-cyan-950'
                : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
            }`}
          >
            <div className="text-center">
              <span className="text-base">{score}</span>
              <span className="text-[9px] block text-neutral-400 leading-none">/100</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border ${prediction.tierBadgeColor}`}>
                {prediction.tierLabel}
              </span>
              {isLoading && <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />}
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Predicted reach based on {platform} algorithm metrics &amp; audience velocity.
            </p>
          </div>
        </div>

        {/* 1-Click Auto-Boost / Polish Button */}
        {onApplyPolishedContent && prediction.polishedContent && (
          <button
            type="button"
            onClick={() => {
              onApplyPolishedContent(prediction.polishedContent!);
              setAppliedBoost(true);
              setTimeout(() => setAppliedBoost(false), 2500);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95 self-start sm:self-auto shrink-0"
            title="Auto-format paragraphs, boost hook, and optimize CTA"
          >
            {appliedBoost ? (
              <>
                <Check className="h-3.5 w-3.5 text-white" />
                <span>Optimized!</span>
              </>
            ) : (
              <>
                <Wand2 className="h-3.5 w-3.5" />
                <span>✨ 1-Click Auto-Boost</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* 4 Score Breakdown Bars */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
        {/* Hook */}
        <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800/80 space-y-1">
          <div className="flex items-center justify-between font-mono text-[11px]">
            <span className="text-neutral-400">Hook Strength</span>
            <span className="text-white font-bold">{prediction.breakdown.hookScore}%</span>
          </div>
          <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
              style={{ width: `${prediction.breakdown.hookScore}%` }}
            />
          </div>
        </div>

        {/* Readability */}
        <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800/80 space-y-1">
          <div className="flex items-center justify-between font-mono text-[11px]">
            <span className="text-neutral-400">Readability</span>
            <span className="text-white font-bold">{prediction.breakdown.readabilityScore}%</span>
          </div>
          <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-500 transition-all duration-500 rounded-full"
              style={{ width: `${prediction.breakdown.readabilityScore}%` }}
            />
          </div>
        </div>

        {/* Engagement */}
        <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800/80 space-y-1">
          <div className="flex items-center justify-between font-mono text-[11px]">
            <span className="text-neutral-400">CTA &amp; Engagement</span>
            <span className="text-white font-bold">{prediction.breakdown.engagementScore}%</span>
          </div>
          <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-500 rounded-full"
              style={{ width: `${prediction.breakdown.engagementScore}%` }}
            />
          </div>
        </div>

        {/* Hashtags */}
        <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800/80 space-y-1">
          <div className="flex items-center justify-between font-mono text-[11px]">
            <span className="text-neutral-400">Hashtags</span>
            <span className="text-white font-bold">{prediction.breakdown.hashtagScore}%</span>
          </div>
          <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all duration-500 rounded-full"
              style={{ width: `${prediction.breakdown.hashtagScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Smart Best-Time Recommendation Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 text-xs">
        <div className="flex items-start sm:items-center gap-2">
          <Clock className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5 sm:mt-0" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">
                Best Time to Post: {prediction.smartTiming.dayOfWeek} at {prediction.smartTiming.recommendedTime}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300">
                Peak Slot
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              {prediction.smartTiming.peakWindowLabel} · {prediction.smartTiming.audienceInsight}
            </p>
          </div>
        </div>

        {onApplyRecommendedTiming && (
          <button
            type="button"
            onClick={() => {
              onApplyRecommendedTiming(
                prediction.smartTiming.dayOfWeek,
                prediction.smartTiming.recommendedTime
              );
              setAppliedTime(true);
              setTimeout(() => setAppliedTime(false), 2000);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono border border-neutral-700 transition-all shrink-0"
          >
            {appliedTime ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                <span>Applied!</span>
              </>
            ) : (
              <>
                <Calendar className="h-3 w-3 text-cyan-400" />
                <span>Apply to Queue</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Actionable Suggestions Accordion */}
      {prediction.suggestions.length > 0 && (
        <div className="border-t border-neutral-800/80 pt-2">
          <button
            type="button"
            onClick={() => setShowTips(!showTips)}
            className="w-full flex items-center justify-between text-xs text-neutral-400 hover:text-white py-1 font-mono transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>AI Virality Boost Recommendations ({prediction.suggestions.length})</span>
            </span>
            {showTips ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          {showTips && (
            <div className="space-y-1.5 pt-2 animate-in fade-in duration-150">
              {prediction.suggestions.map((tip, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-2 rounded-lg bg-neutral-900/60 border border-neutral-800/60 text-xs text-neutral-300"
                >
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
