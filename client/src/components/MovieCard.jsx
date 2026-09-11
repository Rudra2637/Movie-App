import React, { useState } from 'react';
import { Star, Bookmark, Play, Film } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col rounded-2xl overflow-hidden glass-card glow-card cursor-pointer border border-slate-800/80"
      onClick={() => onOpenDetails(movie)}
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900">
        {posterUrl && !imageError ? (
          <img
            src={posterUrl}
            alt={movie.title}
            onError={() => setImageError(true)}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          /* High-Quality Missing Poster Fallback */
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-slate-900 to-slate-950 text-slate-500">
            <Film className="w-12 h-12 mb-3 text-slate-600" />
            <p className="text-xs font-semibold text-slate-400 line-clamp-2">{movie.title}</p>
            <span className="text-[10px] mt-1 text-slate-600">No poster available</span>
          </div>
        )}

        {/* Hover Overlay with Play Icon */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/90 backdrop-blur-md flex items-center justify-center text-white shadow-xl shadow-indigo-600/50 transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-6 h-6 fill-white ml-0.5" />
          </div>
        </div>

        {/* Top Badges (Rating & Wishlist Button) */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {movie.voteAverage > 0 ? (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-800 text-amber-400 font-bold text-xs shadow-lg">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>{movie.voteAverage.toFixed(1)}</span>
            </div>
          ) : (
            <div />
          )}

          {/* Quick Wishlist Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(movie);
            }}
            className={`pointer-events-auto w-9 h-9 rounded-xl flex items-center justify-center backdrop-blur-md transition-all shadow-lg ${
              inWishlist
                ? 'bg-rose-500 text-white shadow-rose-500/40 scale-105'
                : 'bg-slate-950/70 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-800 hover:scale-105'
            }`}
            title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Bookmark className={`w-4 h-4 ${inWishlist ? 'fill-white' : ''}`} />
          </button>
        </div>
      </div>

      {/* Card Info Footer */}
      <div className="p-4 flex-1 flex flex-col justify-between bg-slate-900/40">
        <div>
          <h3
            className="text-sm sm:text-base font-bold text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-1 font-['Outfit']"
            title={movie.title}
          >
            {movie.title}
          </h3>

          <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400 font-medium">
            {releaseYear && <span>{releaseYear}</span>}
            {releaseYear && movie.genres?.length > 0 && <span>•</span>}
            {movie.genres?.length > 0 && (
              <span className="truncate text-slate-400">
                {movie.genres.slice(0, 2).join(', ')}
              </span>
            )}
          </div>
        </div>

        {movie._source && (
          <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
            <span>
              {movie._source === 'database_cache'
                ? '⚡ Cached in DB'
                : movie._source === 'fallback_dataset'
                ? '📦 Curated'
                : '🌐 TMDB'}
            </span>
            {movie.popularity > 0 && <span>Pop: {Math.round(movie.popularity)}</span>}
          </div>
        )}
      </div>
    </motion.div>
  );
}
