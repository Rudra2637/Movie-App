import React from 'react';
import { RotateCcw } from 'lucide-react';

export default function FilterBar({
  genres = [],
  selectedGenre,
  onSelectGenre,
  selectedYear,
  onSelectYear,
  minRating,
  onSelectMinRating,
  sortBy,
  onSelectSortBy,
  onReset,
  totalResults,
}) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 25 }, (_, i) => currentYear - i);

  const isFiltered =
    selectedGenre !== 'all' ||
    selectedYear !== 'all' ||
    minRating > 0 ||
    sortBy !== 'popularity.desc';

  return (
    <div className="w-full film-plate rounded-xl p-3.5 sm:p-4 mb-6 space-y-3">
      {/* Top Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1a1f2c]">
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <span className="text-xs font-bold text-[#e2dbd0] uppercase tracking-wider font-['Syne']">
            Archive Index
          </span>
          {totalResults > 0 && (
            <span className="text-[11px] text-[#828b99] font-medium">
              {totalResults.toLocaleString()} titles
            </span>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
          {/* Release Year */}
          <select
            value={selectedYear}
            onChange={(e) => onSelectYear(e.target.value)}
            className="h-9 px-2.5 rounded-lg bg-[#08090c] border border-[#1e2433] text-xs font-medium text-[#e2dbd0] focus:border-[#d49547] outline-none cursor-pointer"
          >
            <option value="all">All Release Years</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          {/* Minimum Rating */}
          <select
            value={minRating}
            onChange={(e) => onSelectMinRating(Number(e.target.value))}
            className="h-9 px-2.5 rounded-lg bg-[#08090c] border border-[#1e2433] text-xs font-medium text-[#e2dbd0] focus:border-[#d49547] outline-none cursor-pointer"
          >
            <option value={0}>Any Rating</option>
            <option value={8}>★ 8.0+ Masterpiece</option>
            <option value={7}>★ 7.0+ High Acclaim</option>
            <option value={6}>★ 6.0+ Notable</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => onSelectSortBy(e.target.value)}
            className="col-span-2 sm:col-span-1 h-9 px-2.5 rounded-lg bg-[#08090c] border border-[#1e2433] text-xs font-medium text-[#e2dbd0] focus:border-[#d49547] outline-none cursor-pointer"
          >
            <option value="popularity.desc">Sort: Most Popular</option>
            <option value="vote_average.desc">Sort: Highest Rated</option>
            <option value="primary_release_date.desc">Sort: Newest First</option>
            <option value="title.asc">Sort: Title (A–Z)</option>
          </select>

          {/* Reset Action */}
          {isFiltered && (
            <button
              onClick={onReset}
              className="flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg bg-[#181c26] text-[#828b99] hover:text-[#e2dbd0] text-xs font-medium border border-[#262c3d]"
              title="Reset Filters"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Genre Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none" style={{ WebkitOverflowScrolling: 'touch' }}>
        <button
          onClick={() => onSelectGenre('all')}
          className={`px-3 py-1 rounded-md text-xs font-semibold shrink-0 transition-colors ${
            selectedGenre === 'all'
              ? 'bg-[#d49547] text-[#08090c]'
              : 'bg-[#08090c] text-[#828b99] hover:text-[#e2dbd0] border border-[#1e2433]'
          }`}
        >
          All
        </button>

        {genres.map((genre) => (
          <button
            key={genre.id}
            onClick={() => onSelectGenre(String(genre.id))}
            className={`px-3 py-1 rounded-md text-xs font-semibold shrink-0 transition-colors ${
              selectedGenre === String(genre.id)
                ? 'bg-[#d49547] text-[#08090c]'
                : 'bg-[#08090c] text-[#828b99] hover:text-[#e2dbd0] border border-[#1e2433]'
            }`}
          >
            {genre.name}
          </button>
        ))}
      </div>
    </div>
  );
}
