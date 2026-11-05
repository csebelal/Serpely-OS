import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, ArrowUpRight, Sparkles, Filter, ChevronRight } from 'lucide-react';

export type MetricType = 'reach' | 'citations' | 'leads' | 'pipeline';
export type TimeHorizon = '7d' | '30d' | '90d';

export interface ChartDataPoint {
  date: string;
  label: string;
  reach: number;
  citations: number;
  leads: number;
  pipeline: number; // in thousands ($k)
}

export interface ChannelShareItem {
  platform: string;
  share: number; // percentage, e.g. 38
  volume: string;
  color: string;
  glowColor: string;
}

// Cubic Bézier Spline Math for Silk-Smooth SVG Curves
function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }

  return path;
}

// ----------------------------------------------------------------------------
// 1. ANIMATED AREA CHART (MAIN VISUAL INTELLIGENCE)
// ----------------------------------------------------------------------------

interface AnimatedAreaChartProps {
  data: ChartDataPoint[];
  metric: MetricType;
  onMetricChange: (metric: MetricType) => void;
  horizon: TimeHorizon;
  onHorizonChange: (horizon: TimeHorizon) => void;
}

const METRIC_CONFIG: Record<
  MetricType,
  {
    label: string;
    unit: string;
    prefix: string;
    suffix: string;
    accentColor: string;
    gradientStop: string;
    sublabel: string;
  }
> = {
  reach: {
    label: 'Omnichannel Reach',
    unit: 'Impressions',
    prefix: '',
    suffix: 'K',
    accentColor: '#10b981', // Emerald
    gradientStop: 'rgba(16, 185, 129, 0.35)',
    sublabel: 'Verified multi-channel audience exposure'
  },
  citations: {
    label: 'AI Engine Citations',
    unit: 'Citations',
    prefix: '',
    suffix: '',
    accentColor: '#0ea5e9', // Sky
    gradientStop: 'rgba(14, 165, 233, 0.35)',
    sublabel: 'Perplexity, ChatGPT, and Gemini query mentions'
  },
  leads: {
    label: 'Qualified Leads (SQL)',
    unit: 'Deals',
    prefix: '',
    suffix: ' SQLs',
    accentColor: '#a855f7', // Purple
    gradientStop: 'rgba(168, 85, 247, 0.35)',
    sublabel: 'High-intent commercial conversion signals'
  },
  pipeline: {
    label: 'Pipeline Value',
    unit: 'USD',
    prefix: '$',
    suffix: 'K',
    accentColor: '#f59e0b', // Amber
    gradientStop: 'rgba(245, 158, 11, 0.35)',
    sublabel: 'Attributed pipeline and estimated contract value'
  }
};

export const AnimatedAreaChart: React.FC<AnimatedAreaChartProps> = ({
  data,
  metric,
  onMetricChange,
  horizon,
  onHorizonChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const activeCfg = METRIC_CONFIG[metric];

  // SVG coordinate dimensions
  const svgWidth = 840;
  const svgHeight = 260;
  const padLeft = 40;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 40;

  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;

  const values = useMemo(() => data.map(d => d[metric]), [data, metric]);
  const minVal = useMemo(() => Math.min(...values) * 0.9, [values]);
  const maxVal = useMemo(() => Math.max(...values) * 1.15 || 100, [values]);

  const points = useMemo(() => {
    return data.map((d, i) => {
      const x = padLeft + (i / (data.length - 1)) * chartW;
      const y = padTop + chartH - ((d[metric] - minVal) / (maxVal - minVal || 1)) * chartH;
      return { x, y, raw: d };
    });
  }, [data, metric, minVal, maxVal, chartW, chartH, padLeft, padTop]);

  const strokePath = useMemo(() => buildSmoothPath(points), [points]);

  const areaPath = useMemo(() => {
    if (points.length === 0) return '';
    const first = points[0];
    const last = points[points.length - 1];
    const baselineY = padTop + chartH;
    return `${strokePath} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
  }, [strokePath, points, padTop, chartH]);

  // Handle pointer tracking for crosshair and tooltip
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const relativeX = (clientX / rect.width) * svgWidth;

    let closestIdx = 0;
    let minDiff = Infinity;

    points.forEach((pt, idx) => {
      const diff = Math.abs(pt.x - relativeX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });

    setHoverIndex(closestIdx);
  };

  const handlePointerLeave = () => {
    setHoverIndex(null);
  };

  const activePoint = hoverIndex !== null && points[hoverIndex] ? points[hoverIndex] : null;

  // Compute delta compared to first item
  const currentVal = activePoint ? activePoint.raw[metric] : data[data.length - 1]?.[metric] || 0;
  const firstVal = data[0]?.[metric] || 1;
  const growthRate = (((currentVal - firstVal) / firstVal) * 100).toFixed(1);
  const isPositive = Number(growthRate) >= 0;

  return (
    <div className="space-y-4">
      {/* Top Controls: Metric Tabs + Time Horizon Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>{activeCfg.label}</span>
              <span
                style={{ color: activeCfg.accentColor, borderColor: `${activeCfg.accentColor}40` }}
                className="text-[10px] font-mono px-2 py-0.5 rounded-full border bg-neutral-950 font-bold"
              >
                {isPositive ? `+${growthRate}%` : `${growthRate}%`}
              </span>
            </h3>
          </div>
          <p className="text-xs text-neutral-400">{activeCfg.sublabel}</p>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-neutral-950/80 border border-neutral-800">
          {(['reach', 'citations', 'leads', 'pipeline'] as MetricType[]).map(mKey => {
            const isSel = metric === mKey;
            const cfg = METRIC_CONFIG[mKey];
            return (
              <button
                key={mKey}
                onClick={() => onMetricChange(mKey)}
                className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-all select-none ${
                  isSel ? 'text-white' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {isSel && (
                  <motion.div
                    layoutId="activeMetricGlider"
                    className="absolute inset-0 rounded-lg bg-neutral-800 border border-neutral-700/80 shadow-sm"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: cfg.accentColor }}
                  />
                  {cfg.label.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div
        ref={containerRef}
        className="relative w-full h-64 select-none touch-none rounded-xl bg-neutral-950/40 border border-neutral-800/60 p-2 overflow-hidden"
      >
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full overflow-visible"
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        >
          <defs>
            <linearGradient id={`grad-${metric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={activeCfg.accentColor} stopOpacity="0.4" />
              <stop offset="60%" stopColor={activeCfg.accentColor} stopOpacity="0.08" />
              <stop offset="100%" stopColor={activeCfg.accentColor} stopOpacity="0" />
            </linearGradient>

            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background Horizontal Grid Guidelines */}
          {[0, 0.33, 0.66, 1].map((pct, idx) => {
            const y = padTop + chartH * pct;
            const valAtY = Math.round(maxVal - pct * (maxVal - minVal));
            return (
              <g key={idx} className="opacity-35">
                <line
                  x1={padLeft}
                  y1={y}
                  x2={padLeft + chartW}
                  y2={y}
                  stroke="#334155"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={padLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="Inter, monospace"
                >
                  {activeCfg.prefix}
                  {valAtY}
                  {activeCfg.suffix}
                </text>
              </g>
            );
          })}

          {/* Area Fill Gradient with entrance spring */}
          <AnimatePresence mode="wait">
            <motion.path
              key={`area-${metric}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              d={areaPath}
              fill={`url(#grad-${metric})`}
            />
          </AnimatePresence>

          {/* Glowing Stroke Path */}
          <AnimatePresence mode="wait">
            <motion.path
              key={`stroke-${metric}`}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              d={strokePath}
              fill="none"
              stroke={activeCfg.accentColor}
              strokeWidth="2.8"
              filter="url(#glow)"
            />
          </AnimatePresence>

          {/* X Axis Labels */}
          {points.map((pt, i) => {
            // Show every second label on denser sets
            const showLabel = points.length <= 8 || i % 2 === 0 || i === points.length - 1;
            if (!showLabel) return null;

            return (
              <text
                key={i}
                x={pt.x}
                y={svgHeight - 12}
                textAnchor="middle"
                fill="#64748b"
                fontSize="10"
                fontFamily="Inter, monospace"
              >
                {pt.raw.label}
              </text>
            );
          })}

          {/* Interactive Crosshair & Point Tracker */}
          {activePoint && (
            <g>
              {/* Vertical Guide Line */}
              <line
                x1={activePoint.x}
                y1={padTop}
                x2={activePoint.x}
                y2={padTop + chartH}
                stroke={activeCfg.accentColor}
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity="0.8"
              />

              {/* Pulsing Outer Halo */}
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="9"
                fill={activeCfg.accentColor}
                opacity="0.25"
                className="animate-ping"
              />

              {/* Inner Accent Dot */}
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="4.5"
                fill="#0b0f0d"
                stroke={activeCfg.accentColor}
                strokeWidth="2.5"
              />
            </g>
          )}
        </svg>

        {/* Floating Glassmorphic Tooltip */}
        {activePoint && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.12 }}
            style={{
              left: `${(activePoint.x / svgWidth) * 100}%`,
              top: `${Math.max(10, (activePoint.y / svgHeight) * 100 - 32)}%`
            }}
            className="absolute pointer-events-none -translate-x-1/2 -translate-y-full px-3 py-2 rounded-xl bg-neutral-900/95 border border-neutral-700/80 shadow-2xl backdrop-blur-xl text-xs z-30 space-y-1 min-w-[130px]"
          >
            <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 border-b border-neutral-800 pb-1">
              <span>{activePoint.raw.date}</span>
              <span className="text-emerald-400 font-semibold">Active Point</span>
            </div>
            <div className="flex items-baseline justify-between gap-3 pt-0.5">
              <span className="text-xs text-neutral-300">{activeCfg.unit}:</span>
              <span
                style={{ color: activeCfg.accentColor }}
                className="text-sm font-extrabold font-mono tabular-nums"
              >
                {activeCfg.prefix}
                {activePoint.raw[metric].toLocaleString()}
                {activeCfg.suffix}
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer Horizon Switcher */}
      <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
        <span className="text-[11px] font-mono">
          Continuous telemetry synchronized with SQLite & Redis stream
        </span>
        <div className="flex items-center gap-1">
          {(['7d', '30d', '90d'] as TimeHorizon[]).map(hz => (
            <button
              key={hz}
              onClick={() => onHorizonChange(hz)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold transition-colors ${
                horizon === hz
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'hover:text-neutral-200'
              }`}
            >
              {hz.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------------
// 2. ANIMATED DONUT CHART (CHANNEL ACQUISITION DISTRIBUTION)
// ----------------------------------------------------------------------------

interface AnimatedDonutChartProps {
  channels: ChannelShareItem[];
  totalLabel?: string;
  totalValue?: string;
}

export const AnimatedDonutChart: React.FC<AnimatedDonutChartProps> = ({
  channels,
  totalLabel = 'Total Audience',
  totalValue = '154.2K'
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // SVG Circular Geometry
  const size = 180;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Compute accumulated stroke offsets for each segment
  const segments = useMemo(() => {
    let accumulatedPercent = 0;
    return channels.map((ch, idx) => {
      const strokeDash = (ch.share / 100) * circumference;
      const strokeOffset = circumference - (accumulatedPercent / 100) * circumference;
      accumulatedPercent += ch.share;
      return {
        ...ch,
        strokeDash,
        strokeOffset,
        idx
      };
    });
  }, [channels, circumference]);

  const activeChannel = hoveredIdx !== null ? channels[hoveredIdx] : null;

  return (
    <div className="space-y-4 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white tracking-tight">Channel Distribution</h3>
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            5 Channels
          </span>
        </div>
        <p className="text-xs text-neutral-400">Audience acquisition share across verified profiles</p>
      </div>

      {/* Radial Donut SVG Canvas */}
      <div className="relative flex items-center justify-center my-2">
        <svg width={size} height={size} className="transform -rotate-90 overflow-visible">
          {/* Base Background Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            opacity="0.3"
          />

          {/* Animated Slices */}
          {segments.map(seg => {
            const isHovered = hoveredIdx === seg.idx;
            const isOtherHovered = hoveredIdx !== null && hoveredIdx !== seg.idx;

            return (
              <motion.circle
                key={seg.platform}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={seg.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={`${seg.strokeDash} ${circumference}`}
                strokeDashoffset={seg.strokeOffset}
                strokeLinecap="round"
                initial={{ strokeDashoffset: circumference }}
                animate={{
                  strokeDashoffset: seg.strokeOffset,
                  opacity: isOtherHovered ? 0.35 : 1
                }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: seg.idx * 0.08 }}
                className="cursor-pointer transition-all duration-150"
                onMouseEnter={() => setHoveredIdx(seg.idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>

        {/* Center Readout Callout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none">
          <AnimatePresence mode="wait">
            {activeChannel ? (
              <motion.div
                key={activeChannel.platform}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.12 }}
                className="space-y-0.5"
              >
                <span
                  style={{ color: activeChannel.color }}
                  className="text-lg font-extrabold font-mono"
                >
                  {activeChannel.share}%
                </span>
                <span className="block text-[11px] font-semibold text-white truncate max-w-[90px]">
                  {activeChannel.platform}
                </span>
                <span className="block text-[9px] text-neutral-400 font-mono">
                  {activeChannel.volume}
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="default"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.12 }}
                className="space-y-0.5"
              >
                <span className="text-xl font-extrabold text-white font-mono tracking-tight">
                  {totalValue}
                </span>
                <span className="block text-[10px] text-neutral-400 font-medium">
                  {totalLabel}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Interactive Legend List */}
      <div className="space-y-2 pt-2 border-t border-neutral-800/80">
        {channels.map((ch, idx) => {
          const isHovered = hoveredIdx === idx;
          return (
            <div
              key={ch.platform}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`flex items-center justify-between p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                isHovered ? 'bg-neutral-800/60' : 'hover:bg-neutral-800/30'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: ch.color }}
                />
                <span className={`font-medium ${isHovered ? 'text-white' : 'text-neutral-300'}`}>
                  {ch.platform}
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono">
                <span className="text-neutral-400">{ch.volume}</span>
                <span
                  style={{ color: ch.color }}
                  className="font-bold text-[11px] min-w-[28px] text-right"
                >
                  {ch.share}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------------
// 3. MINI SPARKLINE (FOR KPI BENTO CARDS)
// ----------------------------------------------------------------------------

export const SparklineChart: React.FC<{
  values: number[];
  color?: string;
  height?: number;
}> = ({ values, color = '#10b981', height = 28 }) => {
  const width = 80;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - 4 - ((v - min) / range) * (height - 8);
    return { x, y };
  });

  const path = buildSmoothPath(points);
  const last = points[points.length - 1];

  return (
    <svg width={width} height={height} className="overflow-visible shrink-0">
      <defs>
        <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
      />

      {last && (
        <circle
          cx={last.x}
          cy={last.y}
          r="2.5"
          fill="#0b0f0d"
          stroke={color}
          strokeWidth="1.8"
        />
      )}
    </svg>
  );
};
