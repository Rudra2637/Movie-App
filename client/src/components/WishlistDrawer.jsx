import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, CheckCircle2, Circle, Star, Film, Eye, Sparkles } from 'lucide-react';

export default function WishlistDrawer({
  isOpen,
  onClose,
  wishlist = [],
  onRemove,
  onToggleWatched,
  onOpenDetails,
  onExplore,
}) {
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'unwatched' | 'watched'

  const filteredItems = wishlist.filter((item) => {
    if (filterTab === 'watched') return item.isWatched;
    if (filterTab === 'unwatched') return !item.isWatched;
    return true;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Slide-over Drawer */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-screen max-w-md bg-[#0f172a] border-l border-slate-800 p-6 flex flex-col shadow-2xl text-slate-100"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-5 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <Film className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white font-['Outfit']">Your Wishlist</h2>
                    <p className="text-xs text-slate-400">
                      {wishlist.length} {wishlist.length === 1 ? 'movie' : 'movies'} saved to SQLite database
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Filter Tabs */}
              {wishlist.length > 0 && (
                <div className="flex items-center gap-2 my-4 p-1 rounded-xl bg-slate-900 border border-slate-800">
                  <button
                    onClick={() => setFilterTab('all')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      filterTab === 'all' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All ({wishlist.length})
                  </button>
                  <button
                    onClick={() => setFilterTab('unwatched')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      filterTab === 'unwatched' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    To Watch ({wishlist.filter((w) => !w.isWatched).length})
                  </button>
                  <button
                    onClick={() => setFilterTab('watched')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      filterTab === 'watched' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Watched ({wishlist.filter((w) => w.isWatched).length})
                  </button>
                </div>
              )}

              {/* Items List */}
              <div className="flex-1 overflow-y-auto space-y-3 py-2 pr-1">
                {filteredItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center p-6 space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                      <Film className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1">
                        {wishlist.length === 0 ? 'Your Wishlist is Empty' : 'No titles match this filter'}
                      </h4>
                      <p className="text-xs text-slate-400 max-w-xs">
                        {wishlist.length === 0
                          ? 'Browse through trending titles and click the bookmark icon to save your favorites.'
                          : 'Change the tab to view other movies.'}
                      </p>
                    </div>
                    {wishlist.length === 0 && (
                      <button
                        onClick={() => {
                          onClose();
                          onExplore();
                        }}
                        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30"
                      >
                        Explore Trending Movies
                      </button>
                    )}
                  </div>
                ) : (
                  filteredItems.map((item) => {
                    const movie = item.movie;
                    if (!movie) return null;

                    return (
                      <motion.div
                        key={item.wishlistId || movie.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center gap-3.5 p-3 rounded-2xl glass-card border border-slate-800/80 hover:border-slate-700 transition-all group"
                      >
                        {/* Poster Thumbnail */}
                        <div
                          onClick={() => {
                            onClose();
                            onOpenDetails(movie);
                          }}
                          className="w-14 h-20 rounded-xl overflow-hidden bg-slate-900 shrink-0 cursor-pointer group-hover:scale-105 transition-transform"
                        >
                          {movie.posterPath ? (
                            <img
                              src={movie.posterPath.startsWith('http') ? movie.posterPath : `https://image.tmdb.org/t/p/w200${movie.posterPath.startsWith('/') ? '' : '/'}${movie.posterPath}`}
                              alt={movie.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                              <Film className="w-5 h-5" />
                            </div>
                          )}
                        </div>

                        {/* Title & Info */}
                        <div
                          onClick={() => {
                            onClose();
                            onOpenDetails(movie);
                          }}
                          className="flex-1 min-w-0 cursor-pointer"
                        >
                          <h4 className="text-sm font-bold text-white truncate group-hover:text-indigo-400 transition-colors">
                            {movie.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                            {movie.releaseDate && <span>{new Date(movie.releaseDate).getFullYear()}</span>}
                            {movie.voteAverage > 0 && (
                              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                                <Star className="w-3 h-3 fill-amber-400" />
                                {movie.voteAverage.toFixed(1)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions: Toggle Watched & Delete */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => onToggleWatched(movie.id)}
                            className={`p-2 rounded-xl transition-all ${
                              item.isWatched
                                ? 'text-emerald-400 hover:bg-emerald-500/10'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                            }`}
                            title={item.isWatched ? 'Mark as unwatched' : 'Mark as watched'}
                          >
                            {item.isWatched ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : (
                              <Circle className="w-5 h-5" />
                            )}
                          </button>

                          <button
                            onClick={() => onRemove(movie)}
                            className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Remove from wishlist"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* Persistent Database Sync Footer */}
              <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
                <span>💾 SQLite Database Synced</span>
                <span>Guest Session</span>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
