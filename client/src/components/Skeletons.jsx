import React from 'react';

export function HeroSkeleton() {
  return (
    <div className="relative w-full h-[440px] sm:h-[500px] md:h-[540px] rounded-xl overflow-hidden film-plate mb-8 p-6 flex flex-col justify-end">
      <div className="space-y-3 max-w-lg">
        <div className="w-24 h-5 rounded bg-[#181c26]"></div>
        <div className="w-3/4 h-10 rounded bg-[#181c26]"></div>
        <div className="w-full h-4 rounded bg-[#181c26]"></div>
        <div className="w-1/2 h-4 rounded bg-[#181c26]"></div>
        <div className="flex gap-3 pt-2">
          <div className="w-32 h-10 rounded bg-[#181c26]"></div>
          <div className="w-32 h-10 rounded bg-[#181c26]"></div>
        </div>
      </div>
    </div>
  );
}

export function MovieCardSkeleton() {
  return (
    <div className="flex flex-col rounded-lg overflow-hidden film-plate h-[340px]">
      <div className="w-full h-[240px] bg-[#0d0f14]"></div>
      <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          <div className="w-3/4 h-4 rounded bg-[#181c26]"></div>
          <div className="w-1/2 h-3 rounded bg-[#181c26]"></div>
        </div>
        <div className="w-16 h-3 rounded bg-[#181c26]"></div>
      </div>
    </div>
  );
}

export function MovieGridSkeleton({ count = 10 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </div>
  );
}
