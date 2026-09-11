import React from 'react';

export function HeroSkeleton() {
  return (
    <div className="relative w-full h-[520px] rounded-3xl overflow-hidden glass-panel skeleton-shimmer mb-10">
      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 space-y-4">
        <div className="w-32 h-6 rounded-full bg-slate-800/80"></div>
        <div className="w-2/3 h-12 rounded-2xl bg-slate-800/80"></div>
        <div className="w-1/2 h-4 rounded-lg bg-slate-800/80"></div>
        <div className="w-1/3 h-4 rounded-lg bg-slate-800/80"></div>
        <div className="flex gap-4 pt-4">
          <div className="w-36 h-12 rounded-xl bg-slate-800/80"></div>
          <div className="w-36 h-12 rounded-xl bg-slate-800/80"></div>
        </div>
      </div>
    </div>
  );
}

export function MovieCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl overflow-hidden glass-card border border-slate-800/60 h-[380px]">
      <div className="w-full h-[280px] skeleton-shimmer bg-slate-800/50"></div>
      <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="w-3/4 h-5 rounded-md skeleton-shimmer bg-slate-800/80"></div>
          <div className="w-1/2 h-3 rounded-md skeleton-shimmer bg-slate-800/80"></div>
        </div>
        <div className="flex justify-between items-center">
          <div className="w-12 h-4 rounded skeleton-shimmer bg-slate-800/80"></div>
          <div className="w-10 h-4 rounded skeleton-shimmer bg-slate-800/80"></div>
        </div>
      </div>
    </div>
  );
}

export function MovieGridSkeleton({ count = 10 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </div>
  );
}
