import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar.jsx';
import HeroBanner from './components/HeroBanner.jsx';
import FilterBar from './components/FilterBar.jsx';
import MovieGrid from './components/MovieGrid.jsx';
import MovieDetailModal from './components/MovieDetailModal.jsx';
import WishlistDrawer from './components/WishlistDrawer.jsx';
import Toast from './components/Toast.jsx';
import { useMovies } from './hooks/useMovies.js';
import { useWishlist } from './hooks/useWishlist.js';
import { useDebounce } from './hooks/useDebounce.js';
import { HeroSkeleton } from './components/Skeletons.jsx';
import { Film, Database, Zap, ShieldCheck } from 'lucide-react';

export default function App() {
  // Toast notifications state
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Custom Hooks
  const {
    movies,
    trending,
    featuredMovie,
    genres,
    loading,
    loadingMore,
    error,
    page,
    totalPages,
    totalResults,
    searchQuery,
    setSearchQuery,
    selectedGenre,
    setSelectedGenre,
    selectedYear,
    setSelectedYear,
    minRating,
    setMinRating,
    sortBy,
    setSortBy,
    loadMore,
    resetFilters,
    fetchMovies,
    activeMovieDetails,
    loadingDetails,
    openMovieDetails,
    closeMovieDetails,
  } = useMovies();

  const {
    wishlist,
    isInWishlist,
    toggleWishlist,
    toggleWatched,
  } = useWishlist(addToast);

  // Search input local state & debounce
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 350);

  // Sync debounced search with main movie state
  useEffect(() => {
    setSearchQuery(debouncedSearch);
  }, [debouncedSearch, setSearchQuery]);

  // Wishlist Drawer State
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* 1. Header Navigation Bar */}
      <Navbar
        searchQuery={searchInput}
        onSearchChange={setSearchInput}
        wishlistCount={wishlist.length}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onQuickExplore={(type) => {
          setSearchInput('');
          resetFilters();
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 2. Hero Spotlight Carousel (Hidden when user is actively searching) */}
        {!searchInput && selectedGenre === 'all' && selectedYear === 'all' && minRating === 0 && (
          loading && trending.length === 0 ? (
            <HeroSkeleton />
          ) : (
            <HeroBanner
              movies={trending}
              onOpenDetails={openMovieDetails}
              onToggleWishlist={toggleWishlist}
              isInWishlist={isInWishlist}
            />
          )
        )}

        {/* 3. Interactive Filter & Sorting Bar */}
        <FilterBar
          genres={genres}
          selectedGenre={selectedGenre}
          onSelectGenre={setSelectedGenre}
          selectedYear={selectedYear}
          onSelectYear={setSelectedYear}
          minRating={minRating}
          onSelectMinRating={setMinRating}
          sortBy={sortBy}
          onSelectSortBy={setSortBy}
          onReset={() => {
            setSearchInput('');
            resetFilters();
          }}
          totalResults={totalResults}
        />

        {/* 4. Movie Grid & Pagination */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-white font-['Outfit'] tracking-tight">
              {searchInput
                ? `Search results for "${searchInput}"`
                : selectedGenre !== 'all'
                ? `${genres.find((g) => String(g.id) === selectedGenre)?.name || 'Genre'} Movies`
                : 'Trending & Popular Movies'}
            </h2>
          </div>

          <MovieGrid
            movies={movies}
            loading={loading}
            loadingMore={loadingMore}
            error={error}
            onOpenDetails={openMovieDetails}
            onToggleWishlist={toggleWishlist}
            isInWishlist={isInWishlist}
            onLoadMore={loadMore}
            page={page}
            totalPages={totalPages}
            onReset={() => {
              setSearchInput('');
              resetFilters();
            }}
          />
        </div>
      </main>

      {/* 5. Movie Details & Trailer Modal */}
      <MovieDetailModal
        movie={activeMovieDetails}
        loading={loadingDetails}
        onClose={closeMovieDetails}
        onToggleWishlist={toggleWishlist}
        isInWishlist={isInWishlist}
        onSelectSimilar={openMovieDetails}
      />

      {/* 6. Persistent Wishlist Slide-Over Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlist={wishlist}
        onRemove={toggleWishlist}
        onToggleWatched={toggleWatched}
        onOpenDetails={openMovieDetails}
        onExplore={() => {
          setSearchInput('');
          resetFilters();
        }}
      />

      {/* 7. Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* 8. Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <Film className="w-4 h-4" />
            </div>
            <span className="font-bold text-white font-['Outfit'] tracking-tight">
              CinePulse Movie Discovery
            </span>
          </div>

          {/* Technical highlights badge row */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>SQLite DB Cache-Aside</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Sub-10ms Cached Queries</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Rate Limit Resilient</span>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Full-Stack Assignment • React + Node.js + SQLite
          </p>
        </div>
      </footer>
    </div>
  );
}
