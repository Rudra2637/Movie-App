import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, CheckCircle2, Circle, Star, Film } from 'lucide-react';

export default function WishlistDrawer({
  isOpen,
  onClose,
  wishlist = [],
  onRemove,
  onToggleWatched,
  onOpenDetails,
  onExplore,
}) {
  const [filterTab, setFilterTab] = useState('all');

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
            className="absolute inset-0 bg-[#08090c]/80 backdrop-blur-sm"
          />

          {/* Slide-over Drawer */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              className="w-screen max-w-full sm:max-w-md bg-[#12151d] border-l border-[#1e2433] p-4 sm:p-6 flex flex-col shadow-2xl text-[#e2dbd0]"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#1a1f2c]">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#e2dbd0] font-['Syne']">
                    Screening Cabinet
                  </h2>
                  <p className="text-xs text-[#828b99]">
                    {wishlist.length} {wishlist.length === 1 ? 'title' : 'titles'} saved to local database
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg bg-[#08090c] hover:bg-[#181c26] text-[#828b99] hover:text-[#e2dbd0] border border-[#1e2433] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Filter Tabs */}
              {wishlist.length > 0 && (
                <div className="flex items-center gap-1.5 my-3 p-1 rounded-lg bg-[#08090c] border border-[#1e2433]">
                  <button
                    onClick={() => setFilterTab('all')}
                    className={`flex-1 py-1 rounded text-xs font-semibold transition-colors ${
                      filterTab === 'all' ? 'bg-[#d49547] text-[#08090c]' : 'text-[#828b99] hover:text-[#e2dbd0]'
                    }`}
                  >
                    All ({wishlist.length})
                  </button>
                  <button
                    onClick={() => setFilterTab('unwatched')}
                    className={`flex-1 py-1 rounded text-xs font-semibold transition-colors ${
                      filterTab === 'unwatched' ? 'bg-[#d49547] text-[#08090c]' : 'text-[#828b99] hover:text-[#e2dbd0]'
                    }`}
                  >
                    To Watch ({wishlist.filter((w) => !w.isWatched).length})
                  </button>
                  <button
                    onClick={() => setFilterTab('watched')}
                    className={`flex-1 py-1 rounded text-xs font-semibold transition-colors ${
                      filterTab === 'watched' ? 'bg-[#d49547] text-[#08090c]' : 'text-[#828b99] hover:text-[#e2dbd0]'
                    }`}
                  >
                    Screened ({wishlist.filter((w) => w.isWatched).length})
                  </button>
                </div>
              )}

              {/* Items List */}
              <div className="flex-1 overflow-y-auto space-y-2.5 py-2 pr-0.5">
                {filteredItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center p-4 space-y-3">
                    <Film className="w-8 h-8 text-[#5a6270]" />
                    <div>
                      <h4 className="font-bold text-[#e2dbd0] text-sm mb-1 font-['Syne']">
                        {wishlist.length === 0 ? 'Cabinet is Empty' : 'No titles match this filter'}
                      </h4>
                      <p className="text-xs text-[#828b99] max-w-xs">
                        {wishlist.length === 0
                          ? 'Select the bookmark icon on any film card to save it to your persistent cabinet.'
                          : 'Switch tabs to view other titles.'}
                      </p>
                    </div>
                    {wishlist.length === 0 && (
                      <button
                        onClick={() => {
                          onClose();
                          onExplore();
                        }}
                        className="px-4 py-2 rounded-lg bg-[#d49547] text-[#08090c] text-xs font-bold transition-colors"
                      >
                        Explore Trending Films
                      </button>
                    )}
                  </div>
                ) : (
                  filteredItems.map((item) => {
                    const movie = item.movie;
                    if (!movie) return null;

                    return (
                      <div
                        key={item.wishlistId || movie.id}
                        className="flex items-center gap-3 p-2.5 rounded-lg bg-[#08090c] border border-[#1e2433] hover:border-[#353c4d] transition-colors"
                      >
                        {/* Poster Thumbnail */}
                        <div
                          onClick={() => {
                            onClose();
                            onOpenDetails(movie);
                          }}
                          className="w-12 h-16 rounded overflow-hidden bg-[#12151d] shrink-0 cursor-pointer"
                        >
                          {movie.posterPath ? (
                            <img
                              src={movie.posterPath.startsWith('http') ? movie.posterPath : `https://image.tmdb.org/t/p/w200${movie.posterPath.startsWith('/') ? '' : '/'}${movie.posterPath}`}
                              alt={movie.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#5a6270]">
                              <Film className="w-4 h-4" />
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
                          <h4 className="text-xs sm:text-sm font-bold text-[#e2dbd0] truncate hover:text-[#d49547] transition-colors font-['Syne']">
                            {movie.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#828b99]">
                            {movie.releaseDate && <span>{new Date(movie.releaseDate).getFullYear()}</span>}
                            {movie.voteAverage > 0 && (
                              <span className="flex items-center gap-1 text-[#d49547] font-semibold">
                                <Star className="w-3 h-3 fill-[#d49547]" />
                                {movie.voteAverage.toFixed(1)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => onToggleWatched(movie.id)}
                            className={`p-1.5 rounded transition-colors ${
                              item.isWatched
                                ? 'text-[#d49547]'
                                : 'text-[#5a6270] hover:text-[#e2dbd0]'
                            }`}
                            title={item.isWatched ? 'Mark as to-watch' : 'Mark as screened'}
                          >
                            {item.isWatched ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <Circle className="w-4 h-4" />
                            )}
                          </button>

                          <button
                            onClick={() => onRemove(movie)}
                            className="p-1.5 rounded text-[#5a6270] hover:text-[#c73e45] transition-colors"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Status Footer */}
              <div className="pt-3 border-t border-[#1a1f2c] text-[10px] text-[#5a6270] flex items-center justify-between font-mono">
                <span>DATABASE: SQLite (server.db)</span>
                <span>STATE: Persisted</span>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
