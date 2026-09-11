import React from 'react';
import MovieCard from './MovieCard.jsx';
import { MovieGridSkeleton } from './Skeletons.jsx';
import EmptyState from './EmptyState.jsx';
import { ChevronDown, Loader2 } from 'lucide-react';

export default function MovieGrid({
  movies = [],
  loading = false,
  loadingMore = false,
  error = null,
  onOpenDetails,
  onToggleWishlist,
  isInWishlist,
  onLoadMore,
  page = 1,
  totalPages = 1,
  onReset,
}) {
  if (loading && movies.length === 0) {
    return <MovieGridSkeleton count={10} />;
  }

  if (error && movies.length === 0) {
    return <EmptyState title="Oops! Something went wrong" description={error} onReset={onReset} isError />;
  }

  if (!loading && movies.length === 0) {
    return <EmptyState onReset={onReset} />;
  }

  const hasMore = page < totalPages;

  return (
    <div className="space-y-10">
      {/* Movie Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
        {movies.map((movie) => (
          <MovieCard
            key={`${movie.id}-${movie.title}`}
            movie={movie}
            onOpenDetails={onOpenDetails}
            onToggleWishlist={onToggleWishlist}
            isInWishlist={isInWishlist}
          />
        ))}
      </div>

      {/* Pagination / Load More Button */}
      {hasMore && (
        <div className="flex flex-col items-center justify-center pt-6 pb-12">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-sm border border-slate-700/80 hover:border-indigo-500/50 transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                Loading More Movies...
              </>
            ) : (
              <>
                <ChevronDown className="w-5 h-5 text-indigo-400" />
                Load More Titles (Page {page + 1} of {totalPages})
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
