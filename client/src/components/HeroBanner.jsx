import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Star, Plus, Check, ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';

export default function HeroBanner({
  movies = [],
  onOpenDetails,
  onToggleWishlist,
  isInWishlist,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const spotlightMovies = movies.slice(0, 5);
  const currentMovie = spotlightMovies[currentIndex] || movies[0];

  // Auto rotate every 8 seconds
  useEffect(() => {
    if (spotlightMovies.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % spotlightMovies.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [spotlightMovies.length]);

  if (!currentMovie) return null;

  const inWishlist = isInWishlist(currentMovie.id);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? spotlightMovies.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % spotlightMovies.length);
  };

  const bgImage = currentMovie.backdropPath || currentMovie.posterPath || '';
  const bgUrl = bgImage
    ? (bgImage.startsWith('http') ? bgImage : `https://image.tmdb.org/t/p/w1280${bgImage.startsWith('/') ? '' : '/'}${bgImage}`)
    : '';

  return (
    <div className="relative w-full h-[520px] md:h-[580px] rounded-3xl overflow-hidden glass-panel mb-12 group">
      {/* Background Backdrop with Gradient Overlays */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMovie.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: bgUrl ? `url(${bgUrl})` : 'none',
          }}
        >
          {/* Radial & Linear gradient masks for cinematic lighting */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19]/70 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0f19] via-[#0b0f19]/80 to-transparent"></div>
          <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[2px]"></div>
        </motion.div>
      </AnimatePresence>

      {/* Content Overlay */}
      <div className="relative z-10 h-full flex flex-col justify-end p-6 sm:p-10 md:p-14 max-w-3xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMovie.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 rounded-full border border-rose-500/30 flex items-center gap-1.5">
                🔥 Spotlight #{currentIndex + 1}
              </span>

              {currentMovie.voteAverage > 0 && (
                <span className="px-3 py-1 text-xs font-bold bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {currentMovie.voteAverage.toFixed(1)} Rating
                </span>
              )}

              {currentMovie.releaseDate && (
                <span className="px-3 py-1 text-xs font-medium text-slate-300 bg-slate-800/80 rounded-full border border-slate-700/60 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {new Date(currentMovie.releaseDate).getFullYear()}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] font-['Outfit']">
              {currentMovie.title}
            </h1>

            {/* Genres */}
            {currentMovie.genres?.length > 0 && (
              <div className="flex flex-wrap gap-2 text-xs font-semibold text-indigo-300">
                {currentMovie.genres.slice(0, 3).map((g, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-md bg-indigo-950/60 border border-indigo-500/20">
                    {g}
                  </span>
                ))}
              </div>
            )}

            {/* Overview */}
            <p className="text-sm sm:text-base text-slate-300/90 line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-2xl">
              {currentMovie.overview}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-3">
              <button
                onClick={() => onOpenDetails(currentMovie)}
                className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm sm:text-base transition-all shadow-xl shadow-indigo-600/30 hover:scale-[1.03] active:scale-[0.98]"
              >
                <Play className="w-5 h-5 fill-white" />
                Watch Trailer & Details
              </button>

              <button
                onClick={() => onToggleWishlist(currentMovie)}
                className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-semibold text-sm sm:text-base transition-all border ${
                  inWishlist
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                    : 'bg-slate-900/80 text-slate-200 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                {inWishlist ? (
                  <>
                    <Check className="w-5 h-5 text-rose-400" />
                    In Wishlist
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Add to Wishlist
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Spotlight Navigation Arrows */}
      {spotlightMovies.length > 1 && (
        <div className="absolute bottom-8 right-8 z-20 flex items-center gap-3">
          <button
            onClick={handlePrev}
            className="w-11 h-11 rounded-2xl glass-card flex items-center justify-center text-slate-300 hover:text-white hover:border-indigo-500/50 transition-all hover:scale-105 active:scale-95"
            title="Previous Movie"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex gap-1.5 px-2">
            {spotlightMovies.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  currentIndex === idx ? 'w-6 bg-indigo-500' : 'w-2 bg-slate-700 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="w-11 h-11 rounded-2xl glass-card flex items-center justify-center text-slate-300 hover:text-white hover:border-indigo-500/50 transition-all hover:scale-105 active:scale-95"
            title="Next Movie"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
