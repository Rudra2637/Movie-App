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
    return <EmptyState title="Unable to retrieve titles" description={error} onReset={onReset} isError />;
  }

  if (!loading && movies.length === 0) {
    return <EmptyState onReset={onReset} />;
  }

  const hasMore = page < totalPages;

  return (
    <div className="space-y-6">
      {/* Movie Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
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

      {/* Pagination Load More */}
      {hasMore && (
        <div className="flex flex-col items-center justify-center pt-4 pb-8">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#12151d] hover:bg-[#181c26] text-[#e2dbd0] hover:text-[#d49547] text-xs font-semibold border border-[#1e2433] hover:border-[#d49547] transition-colors disabled:opacity-50"
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#d49547]" />
                Loading Records...
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 text-[#d49547]" />
                Load Page {page + 1} of {totalPages}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
