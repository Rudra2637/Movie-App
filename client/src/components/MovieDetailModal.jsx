import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Calendar, Clock, Bookmark, Play, Users, Film, Check, Sparkles, ExternalLink } from 'lucide-react';

export default function MovieDetailModal({
  movie,
  loading = false,
  onClose,
  onToggleWishlist,
  isInWishlist,
  onSelectSimilar,
}) {
  const [showTrailer, setShowTrailer] = useState(false);

  // Close on Escape key
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10 overflow-y-auto">
        {/* Backdrop Backdrop Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl glass-panel shadow-2xl border border-slate-700/80 bg-[#0f172a] text-slate-100 z-10"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full glass-card hover:bg-slate-800/90 text-slate-300 hover:text-white flex items-center justify-center transition-all border border-slate-700/80"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Media Header (Trailer Video Embed OR Backdrop Image) */}
          <div className="relative aspect-video sm:h-[380px] w-full bg-slate-950 overflow-hidden">
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
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/50 to-transparent"></div>
                <div className="absolute inset-0 bg-slate-950/30"></div>

                {/* Play Trailer Trigger Button */}
                {movie.trailerKey && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={() => setShowTrailer(true)}
                      className="group flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-indigo-600/90 hover:bg-indigo-500 backdrop-blur-md text-white font-bold text-sm sm:text-base shadow-2xl shadow-indigo-600/60 transition-all hover:scale-105 active:scale-95"
                    >
                      <Play className="w-5 h-5 fill-white" />
                      Play Official Trailer
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Modal Body Info */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
              <div className="space-y-3 flex-1">
                {/* Genres */}
                {movie.genres?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {movie.genres.map((genre, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}

                {/* Title */}
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-['Outfit']">
                  {movie.title}
                </h2>

                {/* Metadata Pills */}
                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300">
                  {movie.voteAverage > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>{movie.voteAverage.toFixed(1)} / 10</span>
                      {movie.voteCount > 0 && (
                        <span className="text-amber-300/70 font-normal">
                          ({movie.voteCount.toLocaleString()} votes)
                        </span>
                      )}
                    </div>
                  )}

                  {movie.releaseDate && (
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>{new Date(movie.releaseDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                  )}

                  {movie.runtime > 0 && (
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>{formatRuntime(movie.runtime)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Wishlist CTA */}
              <button
                onClick={() => onToggleWishlist(movie)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shrink-0 border ${
                  inWishlist
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                }`}
              >
                {inWishlist ? (
                  <>
                    <Check className="w-4 h-4 text-rose-400" />
                    In Your Wishlist
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" />
                    Add to Wishlist
                  </>
                )}
              </button>
            </div>

            {/* Synopsis Overview */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Synopsis</h4>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {movie.overview || 'No synopsis provided.'}
              </p>
            </div>

            {/* Cast & Crew Section */}
            {movie.cast?.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span>Key Cast & Crew</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {movie.cast.map((actor, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/70 text-xs font-medium text-slate-200"
                    >
                      {actor}
                    </span>
                  ))}
                  {movie.directors?.length > 0 && (
                    <span className="px-3 py-1.5 rounded-xl bg-indigo-950/80 border border-indigo-500/30 text-xs font-semibold text-indigo-300">
                      Dir. {movie.directors.join(', ')}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Cache Status Badge */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>
                Data Strategy:{' '}
                <strong className="text-slate-400">
                  {movie._source === 'database_cache'
                    ? '⚡ Served directly from SQLite DB Cache (<10ms)'
                    : '🌐 Retrieved & Saved to SQLite DB'}
                </strong>
              </span>
              <span>ID: #{movie.id}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
