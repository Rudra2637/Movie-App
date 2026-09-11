import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Star, Plus, Check, ChevronLeft, ChevronRight } from 'lucide-react';

export default function HeroBanner({
  movies = [],
  onOpenDetails,
  onToggleWishlist,
  isInWishlist,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const spotlightMovies = movies.slice(0, 5);
  const currentMovie = spotlightMovies[currentIndex] || movies[0];

  useEffect(() => {
    if (spotlightMovies.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % spotlightMovies.length);
    }, 9000);
    return () => clearInterval(interval);
  }, [spotlightMovies.length]);

  if (!currentMovie) return null;

  const inWishlist = isInWishlist(currentMovie.id);
  const bgImage = currentMovie.backdropPath || currentMovie.posterPath || '';
  const bgUrl = bgImage
    ? (bgImage.startsWith('http') ? bgImage : `https://image.tmdb.org/t/p/w1280${bgImage.startsWith('/') ? '' : '/'}${bgImage}`)
    : '';

  return (
    <section aria-label="Featured Film" className="relative w-full min-h-[440px] sm:min-h-[500px] md:h-[540px] rounded-xl overflow-hidden film-plate mb-8 flex flex-col justify-end">
      {/* Projection Still */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMovie.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: bgUrl ? `url(${bgUrl})` : 'none',
          }}
        >
          {/* Natural Vignette & Floor Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#08090c] via-[#08090c]/70 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#08090c] via-[#08090c]/60 to-transparent"></div>
        </motion.div>
      </AnimatePresence>

      {/* Film Information Overlay */}
      <div className="relative z-10 w-full p-4 sm:p-8 md:p-10 max-w-2xl space-y-3 sm:space-y-4">
        {/* Metadata Strip */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#828b99]">
          {currentMovie.genres?.slice(0, 2).map((g, i) => (
            <span key={i} className="px-2 py-0.5 rounded bg-[#181c26] text-[#e2dbd0] text-[11px] font-medium border border-[#262c3d]">
              {g}
            </span>
          ))}

          {currentMovie.releaseDate && (
            <span className="font-medium text-[#828b99]">
              {new Date(currentMovie.releaseDate).getFullYear()}
            </span>
          )}

          {currentMovie.voteAverage > 0 && (
            <span className="flex items-center gap-1 font-bold text-[#d49547]">
              <Star className="w-3 h-3 fill-[#d49547]" />
              {currentMovie.voteAverage.toFixed(1)}
            </span>
          )}
        </div>

        {/* Film Title */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-[#e2dbd0] leading-[1.08] font-['Syne']">
          {currentMovie.title}
        </h1>

        {/* Overview (Under 70 Characters per line max width) */}
        <p className="text-xs sm:text-sm text-[#828b99] line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-xl">
          {currentMovie.overview}
        </p>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => onOpenDetails(currentMovie)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#d49547] hover:bg-[#c28539] text-[#08090c] font-bold text-xs sm:text-sm transition-colors"
          >
            <Play className="w-4 h-4 fill-[#08090c]" />
            Screen Trailer & Cast
          </button>

          <button
            onClick={() => onToggleWishlist(currentMovie)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors border ${
              inWishlist
                ? 'bg-[#181c26] text-[#d49547] border-[#d49547]'
                : 'bg-[#12151d] text-[#e2dbd0] border-[#1e2433] hover:border-[#828b99]'
            }`}
          >
            {inWishlist ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#d49547]" />
                In Wishlist
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 text-[#828b99]" />
                Add to Wishlist
              </>
            )}
          </button>
        </div>
      </div>

      {/* Frame Selectors */}
      {spotlightMovies.length > 1 && (
        <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-20 flex items-center gap-1.5 bg-[#08090c]/90 backdrop-blur-sm px-2 py-1 rounded-lg border border-[#1e2433] h-auto">
          <button
            onClick={() => setCurrentIndex((prev) => (prev === 0 ? spotlightMovies.length - 1 : prev - 1))}
            className="p-1 text-[#828b99] hover:text-[#e2dbd0]"
            title="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="text-[11px] font-bold text-[#e2dbd0] px-1 font-mono">
            {currentIndex + 1}/{spotlightMovies.length}
          </span>

          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % spotlightMovies.length)}
            className="p-1 text-[#828b99] hover:text-[#e2dbd0]"
            title="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </section>
  );
}
