import React, { useState } from 'react';
import { Star, Bookmark, Film } from 'lucide-react';

export default function MovieCard({
  movie,
  onOpenDetails,
  onToggleWishlist,
  isInWishlist,
}) {
  const [imageError, setImageError] = useState(false);
  const inWishlist = isInWishlist(movie.id);

  const releaseYear = movie.releaseDate
    ? new Date(movie.releaseDate).getFullYear()
    : null;

  const posterUrl = movie.posterPath
    ? (movie.posterPath.startsWith('http') ? movie.posterPath : `https://image.tmdb.org/t/p/w500${movie.posterPath.startsWith('/') ? '' : '/'}${movie.posterPath}`)
    : '';

  return (
    <article
      className="group relative flex flex-col rounded-lg overflow-hidden film-plate cursor-pointer transition-colors duration-200"
      onClick={() => onOpenDetails(movie)}
    >
      {/* Poster Media Area */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#08090c]">
        {posterUrl && !imageError ? (
          <img
            src={posterUrl}
            alt={movie.title}
            onError={() => setImageError(true)}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-[#0d0f14] text-[#5a6270]">
            <Film className="w-8 h-8 mb-2 text-[#353c4d]" />
            <span className="text-[11px] font-medium text-[#828b99] line-clamp-2">{movie.title}</span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          {movie.voteAverage > 0 ? (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#08090c]/90 text-[#d49547] font-bold text-[10px]">
              <Star className="w-2.5 h-2.5 fill-[#d49547]" />
              <span>{movie.voteAverage.toFixed(1)}</span>
            </div>
          ) : (
            <div />
          )}

          {/* Wishlist Toggle Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(movie);
            }}
            className={`pointer-events-auto w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center transition-colors ${
              inWishlist
                ? 'bg-[#d49547] text-[#08090c]'
                : 'bg-[#08090c]/80 text-[#828b99] hover:text-[#e2dbd0] border border-[#1e2433]'
            }`}
            title={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${inWishlist ? 'fill-[#08090c]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Plate Footer */}
      <div className="p-3 flex-1 flex flex-col justify-between bg-[#12151d]">
        <div>
          <h3
            className="text-xs sm:text-sm font-bold text-[#e2dbd0] group-hover:text-[#d49547] transition-colors line-clamp-1 font-['Syne']"
            title={movie.title}
          >
            {movie.title}
          </h3>

          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#828b99]">
            {releaseYear && <span>{releaseYear}</span>}
            {releaseYear && movie.genres?.length > 0 && <span>/</span>}
            {movie.genres?.length > 0 && (
              <span className="truncate">
                {movie.genres.slice(0, 2).join(', ')}
              </span>
            )}
          </div>
        </div>

        {movie._source && (
          <div className="mt-2 pt-2 border-t border-[#1a1f2c] flex items-center justify-between text-[10px] text-[#5a6270]">
            <span>
              {movie._source === 'database_cache'
                ? 'Cached in DB'
                : movie._source === 'fallback_dataset'
                ? 'Curated'
                : 'TMDB'}
            </span>
          </div>
        )}
      </div>
    </article>
  );
}
