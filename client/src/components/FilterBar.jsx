import React from 'react';
import { SlidersHorizontal, ArrowDownUp, Calendar, Star, Sparkles, RotateCcw } from 'lucide-react';

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
  // Generate list of past 30 years + All
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 25 }, (_, i) => currentYear - i);

  const isFiltered =
    selectedGenre !== 'all' ||
    selectedYear !== 'all' ||
    minRating > 0 ||
    sortBy !== 'popularity.desc';

  return (
    <div className="w-full glass-panel rounded-2xl p-5 mb-8 space-y-4">
      {/* Top Filter Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
              Filter & Explore
              {totalResults > 0 && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                  {totalResults.toLocaleString()} titles
                </span>
              )}
            </h2>
          </div>
        </div>

        {/* Dropdowns for Year, Rating, Sort */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Release Year Dropdown */}
          <div className="relative flex items-center">
            <Calendar className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={selectedYear}
              onChange={(e) => onSelectYear(e.target.value)}
              className="h-10 pl-9 pr-8 rounded-xl bg-slate-900 border border-slate-700/80 text-xs font-semibold text-slate-200 hover:border-slate-600 focus:border-indigo-500 focus:outline-none cursor-pointer appearance-none"
            >
              <option value="all">All Years</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Minimum Rating Dropdown */}
          <div className="relative flex items-center">
            <Star className="absolute left-3 w-4 h-4 text-amber-400 pointer-events-none" />
            <select
              value={minRating}
              onChange={(e) => onSelectMinRating(Number(e.target.value))}
              className="h-10 pl-9 pr-8 rounded-xl bg-slate-900 border border-slate-700/80 text-xs font-semibold text-slate-200 hover:border-slate-600 focus:border-indigo-500 focus:outline-none cursor-pointer appearance-none"
            >
              <option value={0}>Any Rating</option>
              <option value={8}>⭐ 8.0+ Masterpiece</option>
              <option value={7}>⭐ 7.0+ Great</option>
              <option value={6}>⭐ 6.0+ Good</option>
              <option value={5}>⭐ 5.0+ Average</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="relative flex items-center">
            <ArrowDownUp className="absolute left-3 w-4 h-4 text-indigo-400 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => onSelectSortBy(e.target.value)}
              className="h-10 pl-9 pr-8 rounded-xl bg-slate-900 border border-slate-700/80 text-xs font-semibold text-slate-200 hover:border-slate-600 focus:border-indigo-500 focus:outline-none cursor-pointer appearance-none"
            >
              <option value="popularity.desc">🔥 Most Popular</option>
              <option value="vote_average.desc">⭐ Highest Rated</option>
              <option value="primary_release_date.desc">📅 Newest First</option>
              <option value="title.asc">🔤 Title (A - Z)</option>
            </select>
          </div>

          {/* Reset Filters button */}
          {isFiltered && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 h-10 px-3.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/20 transition-all"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Genre Chips (Horizontal Scrollable) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
        <button
          onClick={() => onSelectGenre('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
            selectedGenre === 'all'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/25 border border-indigo-400/40'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          All Genres
        </button>

        {genres.map((genre) => (
          <button
            key={genre.id}
            onClick={() => onSelectGenre(String(genre.id))}
            className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
              selectedGenre === String(genre.id)
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/25 border border-indigo-400/40'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {genre.name}
          </button>
        ))}
      </div>
    </div>
  );
}
