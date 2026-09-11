import React, { useRef, useEffect } from 'react';
import { Search, Bookmark, X, Aperture } from 'lucide-react';

export default function Navbar({
  searchQuery,
  onSearchChange,
  wishlistCount,
  onOpenWishlist,
  onQuickExplore,
}) {
  const searchInputRef = useRef(null);

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
    <header className="sticky top-0 z-40 w-full film-header transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-3 sm:gap-6">
        {/* Brand Logo */}
        <div
          onClick={() => onQuickExplore('trending')}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#181c26] border border-[#262c3d] flex items-center justify-center text-[#d49547] group-hover:border-[#d49547] transition-colors">
            <Aperture className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <span className="text-base sm:text-lg font-extrabold tracking-tight text-[#e2dbd0] font-['Syne']">
              CinePulse
            </span>
          </div>
        </div>

        {/* Search Input */}
        <div className="flex-1 max-w-lg relative">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-[#828b99] pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by title, director, or actor... (Press '/')"
              className="w-full h-10 pl-10 pr-9 rounded-lg bg-[#12151d] border border-[#1e2433] focus:border-[#d49547] text-xs sm:text-sm text-[#e2dbd0] placeholder-[#5a6270] transition-colors outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 p-1 text-[#828b99] hover:text-[#e2dbd0]"
                title="Clear"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Wishlist / Screening Cabinet */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenWishlist}
            className="flex items-center gap-2 px-3.5 h-10 rounded-lg bg-[#12151d] hover:bg-[#181c26] text-[#e2dbd0] border border-[#1e2433] hover:border-[#d49547] transition-colors text-xs font-semibold"
          >
            <Bookmark className="w-4 h-4 text-[#d49547]" />
            <span className="hidden sm:inline">Wishlist</span>
            {wishlistCount > 0 && (
              <span className="flex items-center justify-center min-w-[18px] h-4.5 px-1 text-[11px] font-bold text-[#08090c] bg-[#d49547] rounded">
                {wishlistCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
