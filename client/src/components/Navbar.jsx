import React, { useRef, useEffect } from 'react';
import { Film, Search, Bookmark, X, Flame } from 'lucide-react';

export default function Navbar({
  searchQuery,
  onSearchChange,
  wishlistCount,
  onOpenWishlist,
  onQuickExplore,
}) {
  const searchInputRef = useRef(null);

  // Global keyboard shortcut ('/' to focus search)
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full glass-nav transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => onQuickExplore('trending')}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-rose-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-300">
            <Film className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-white font-['Outfit']">
                Cine<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-rose-400">Pulse</span>
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">Movie Discovery & Streaming Hub</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl relative">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search movies, actors, directors... (Press '/' to focus)"
              className="w-full h-11 pl-11 pr-12 rounded-xl bg-slate-900/80 border border-slate-700/60 focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/20 text-sm text-slate-100 placeholder-slate-500 transition-all outline-none"
            />
            {searchQuery ? (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <div className="absolute right-3 hidden sm:flex items-center">
                <kbd className="px-2 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-800 border border-slate-700 rounded-md">
                  /
                </kbd>
              </div>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Wishlist Button */}
          <button
            onClick={onOpenWishlist}
            className="relative flex items-center gap-2.5 px-4 h-11 rounded-xl glass-card hover:bg-slate-800/80 text-slate-200 hover:text-white transition-all border border-slate-700/60 hover:border-indigo-500/40 group"
          >
            <Bookmark className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-semibold hidden md:inline">Wishlist</span>
            
            {wishlistCount > 0 && (
              <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-indigo-600 rounded-full shadow-md animate-pulse">
                {wishlistCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
