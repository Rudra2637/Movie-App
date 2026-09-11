import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Calendar, Clock, Bookmark, Play, Check } from 'lucide-react';

export default function MovieDetailModal({
  movie,
  loading = false,
  onClose,
  onToggleWishlist,
  isInWishlist,
  onSelectSimilar,
}) {
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!movie) return null;

  const inWishlist = isInWishlist(movie.id);

  const formatRuntime = (mins) => {
    if (!mins) return null;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h > 0 ? `${h}h ` : ''}${m}m`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 overflow-y-auto">
        {/* Dark Screen Mask */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#08090c]/90 backdrop-blur-sm"
        />

        {/* Screening Vault Modal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-3xl max-h-[92vh] sm:max-h-[88vh] overflow-y-auto rounded-t-xl sm:rounded-xl bg-[#12151d] border border-[#1e2433] text-[#e2dbd0] z-10 shadow-2xl"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-40 w-8 h-8 rounded-lg bg-[#08090c]/80 hover:bg-[#181c26] text-[#828b99] hover:text-[#e2dbd0] flex items-center justify-center border border-[#1e2433] transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Screening Aperture */}
          <div className="relative aspect-video sm:h-[340px] w-full bg-[#08090c] overflow-hidden">
            {showTrailer && movie.trailerKey ? (
              <iframe
                src={`https://www.youtube.com/embed/${movie.trailerKey}?autoplay=1&rel=0`}
                title={`${movie.title} Trailer`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div
                className="w-full h-full bg-cover bg-center relative"
                style={{
                  backgroundImage: movie.backdropPath || movie.posterPath
                    ? `url(${(movie.backdropPath || movie.posterPath).startsWith('http') ? (movie.backdropPath || movie.posterPath) : `https://image.tmdb.org/t/p/w1280${(movie.backdropPath || movie.posterPath).startsWith('/') ? '' : '/'}${movie.backdropPath || movie.posterPath}`})`
                    : 'none',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#12151d] via-[#12151d]/60 to-transparent"></div>

                {movie.trailerKey && (
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <button
                      onClick={() => setShowTrailer(true)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#d49547] hover:bg-[#c28539] text-[#08090c] font-bold text-xs sm:text-sm transition-colors"
                    >
                      <Play className="w-4 h-4 fill-[#08090c]" />
                      Play Trailer
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Film Details Info */}
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                {/* Genres */}
                {movie.genres?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {movie.genres.map((genre, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#181c26] text-[#e2dbd0] border border-[#262c3d]"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}

                {/* Title */}
                <h2 className="text-xl sm:text-3xl font-bold text-[#e2dbd0] font-['Syne']">
                  {movie.title}
                </h2>

                {/* Metadata String */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#828b99]">
                  {movie.voteAverage > 0 && (
                    <span className="flex items-center gap-1 font-bold text-[#d49547]">
                      <Star className="w-3.5 h-3.5 fill-[#d49547]" />
                      {movie.voteAverage.toFixed(1)} / 10
                    </span>
                  )}

                  {movie.releaseDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#5a6270]" />
                      {new Date(movie.releaseDate).getFullYear()}
                    </span>
                  )}

                  {movie.runtime > 0 && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#5a6270]" />
                      {formatRuntime(movie.runtime)}
                    </span>
                  )}
                </div>
              </div>

              {/* Wishlist Toggle Button */}
              <button
                onClick={() => onToggleWishlist(movie)}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs transition-colors shrink-0 ${
                  inWishlist
                    ? 'bg-[#181c26] text-[#d49547] border border-[#d49547]'
                    : 'bg-[#d49547] hover:bg-[#c28539] text-[#08090c]'
                }`}
              >
                {inWishlist ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#d49547]" />
                    In Wishlist
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5" />
                    Add to Wishlist
                  </>
                )}
              </button>
            </div>

            {/* Synopsis Overview */}
            <div className="space-y-1 pt-1">
              <span className="text-[11px] font-bold text-[#828b99] uppercase tracking-wider">Synopsis</span>
              <p className="text-xs sm:text-sm text-[#e2dbd0] leading-relaxed max-w-2xl">
                {movie.overview || 'No synopsis available in archival record.'}
              </p>
            </div>

            {/* Cast & Crew Section */}
            {movie.cast?.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-[#1a1f2c]">
                <span className="text-[11px] font-bold text-[#828b99] uppercase tracking-wider">Cast & Directors</span>
                <div className="flex flex-wrap gap-1.5">
                  {movie.cast.map((actor, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-[#181c26] border border-[#262c3d] text-[11px] text-[#e2dbd0]"
                    >
                      {actor}
                    </span>
                  ))}
                  {movie.directors?.length > 0 && (
                    <span className="px-2 py-0.5 rounded bg-[#1f1910] border border-[#4a3518] text-[11px] font-semibold text-[#d49547]">
                      Dir. {movie.directors.join(', ')}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
