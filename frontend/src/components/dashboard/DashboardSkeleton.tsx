import React from 'react';
import { Skeleton, SkeletonText, SkeletonCircle, SkeletonCard } from '../common/Skeleton';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      {/* 1. Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-5">
        <div className="space-y-2">
          <Skeleton height={28} width={180} rounded="lg" />
          <Skeleton height={14} width={340} rounded="md" />
        </div>
        <div className="flex items-center gap-2.5">
          <Skeleton height={38} width={150} rounded="xl" />
          <Skeleton height={38} width={150} rounded="xl" />
        </div>
      </div>

      {/* 2. Bento 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map(idx => (
          <SkeletonCard key={idx} className="space-y-3.5">
            <div className="flex items-center justify-between">
              <Skeleton height={14} width={120} rounded="md" />
              <SkeletonCircle size={24} />
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <Skeleton height={32} width={90} rounded="lg" />
              <Skeleton height={18} width={50} rounded="full" />
            </div>
            <Skeleton height={6} width="100%" rounded="full" />
            <div className="flex items-center justify-between pt-1">
              <Skeleton height={12} width={140} rounded="sm" />
              <Skeleton height={12} width={14} rounded="sm" />
            </div>
          </SkeletonCard>
        ))}
      </div>

      {/* 3. Visual Intelligence 8:4 Grid (Area Chart + Donut Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Main Chart Card (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-2xl border border-neutral-800/80 bg-neutral-900/40 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1.5">
              <Skeleton height={18} width={220} rounded="md" />
              <Skeleton height={12} width={310} rounded="sm" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton height={32} width={210} rounded="xl" />
              <Skeleton height={32} width={90} rounded="xl" />
            </div>
          </div>

          {/* Chart Canvas Area */}
          <div className="h-72 w-full flex flex-col justify-between py-2 border-b border-neutral-800/60">
            <div className="flex justify-between items-center opacity-40">
              <Skeleton height={10} width={28} rounded="sm" />
              <div className="flex-1 mx-3 border-t border-dashed border-neutral-800/70" />
            </div>
            <div className="flex justify-between items-center opacity-40">
              <Skeleton height={10} width={28} rounded="sm" />
              <div className="flex-1 mx-3 border-t border-dashed border-neutral-800/70" />
            </div>
            <div className="flex justify-between items-center opacity-40">
              <Skeleton height={10} width={28} rounded="sm" />
              <div className="flex-1 mx-3 border-t border-dashed border-neutral-800/70" />
            </div>
            <Skeleton height={180} width="100%" rounded="xl" />
          </div>

          <div className="flex justify-between pt-1">
            {[1, 2, 3, 4, 5, 6, 7].map(k => (
              <Skeleton key={k} height={10} width={38} rounded="sm" />
            ))}
          </div>
        </div>

        {/* Donut Chart Card (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-2xl border border-neutral-800/80 bg-neutral-900/40 space-y-5 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Skeleton height={18} width={160} rounded="md" />
              <Skeleton height={16} width={60} rounded="full" />
            </div>
            <Skeleton height={12} width={200} rounded="sm" />
          </div>

          <div className="flex items-center justify-center py-4">
            <SkeletonCircle size={170} />
          </div>

          <div className="space-y-2.5 pt-2 border-t border-neutral-800/60">
            {[1, 2, 3, 4].map(k => (
              <div key={k} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SkeletonCircle size={10} />
                  <Skeleton height={12} width={75} rounded="sm" />
                </div>
                <Skeleton height={12} width={45} rounded="sm" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Asymmetric 7:5 Bento Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-7 p-6 rounded-2xl border border-neutral-800/80 bg-neutral-900/40 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton height={14} width={180} rounded="md" />
            <Skeleton height={14} width={70} rounded="md" />
          </div>
          <Skeleton height={22} width="80%" rounded="md" />
          <Skeleton height={60} width="100%" rounded="xl" />
          <div className="pt-3 border-t border-neutral-800/70 flex items-center justify-between">
            <Skeleton height={16} width={100} rounded="md" />
            <div className="flex gap-2">
              <Skeleton height={32} width={100} rounded="xl" />
              <Skeleton height={32} width={130} rounded="xl" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 p-6 rounded-2xl border border-neutral-800/80 bg-neutral-900/40 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton height={16} width={190} rounded="md" />
            <Skeleton height={14} width={80} rounded="sm" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map(k => (
              <Skeleton key={k} height={48} width="100%" rounded="xl" />
            ))}
          </div>
          <div className="pt-2 border-t border-neutral-800/70 flex justify-between">
            <Skeleton height={12} width={120} rounded="sm" />
            <Skeleton height={12} width={90} rounded="sm" />
          </div>
        </div>
      </div>

      {/* 5. Autonomous Fleet Telemetry Grid */}
      <div className="p-6 rounded-2xl border border-neutral-800/80 bg-neutral-900/40 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton height={20} width={240} rounded="md" />
          <Skeleton height={16} width={120} rounded="full" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} height={80} width="100%" rounded="xl" />
          ))}
        </div>
      </div>
    </div>
  );
};
