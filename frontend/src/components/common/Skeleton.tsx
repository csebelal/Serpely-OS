import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'none';
  animate?: boolean;
}

const ROUNDED_MAP: Record<string, string> = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
  none: 'rounded-none'
};

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  rounded = 'xl',
  animate = true
}) => {
  const roundedClass = ROUNDED_MAP[rounded] || 'rounded-xl';
  const shimmerClass = animate ? 'skeleton-shimmer' : 'bg-neutral-800/40';

  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height
  };

  return (
    <div
      style={style}
      className={`relative select-none border border-neutral-800/40 ${roundedClass} ${shimmerClass} ${className}`}
      aria-hidden="true"
    />
  );
};

export const SkeletonText: React.FC<{
  lines?: number;
  className?: string;
  lastLineWidth?: string;
}> = ({ lines = 2, className = '', lastLineWidth = '70%' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={12}
          width={i === lines - 1 ? lastLineWidth : '100%'}
          rounded="md"
        />
      ))}
    </div>
  );
};

export const SkeletonCircle: React.FC<{
  size?: number | string;
  className?: string;
}> = ({ size = 40, className = '' }) => {
  return (
    <Skeleton
      width={size}
      height={size}
      rounded="full"
      className={`shrink-0 ${className}`}
    />
  );
};

export const SkeletonCard: React.FC<{
  children?: React.ReactNode;
  className?: string;
  height?: string | number;
}> = ({ children, className = '', height }) => {
  return (
    <div
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
      className={`p-5 rounded-2xl border border-neutral-800/80 bg-neutral-900/40 space-y-4 ${className}`}
    >
      {children}
    </div>
  );
};
