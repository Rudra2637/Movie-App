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
import { Aperture } from 'lucide-react';

export default function App() {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

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

  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 350);

  useEffect(() => {
    setSearchQuery(debouncedSearch);
  }, [debouncedSearch, setSearchQuery]);

  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#08090c] text-[#e2dbd0]">
      {/* 1. Header */}
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

      {/* Main Screening Console */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* 2. Projection Aperture (Spotlight) */}
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

        {/* 3. Archival Filters */}
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

        {/* 4. Film Plate Grid */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-bold text-[#e2dbd0] font-['Syne'] tracking-tight">
              {searchInput
                ? `Results for "${searchInput}"`
                : selectedGenre !== 'all'
                ? `${genres.find((g) => String(g.id) === selectedGenre)?.name || 'Genre'} Reel`
                : 'Current Archival Reel'}
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
        </section>
      </main>

      {/* 5. Movie Detail Modal */}
      <MovieDetailModal
        movie={activeMovieDetails}
        loading={loadingDetails}
        onClose={closeMovieDetails}
        onToggleWishlist={toggleWishlist}
        isInWishlist={isInWishlist}
        onSelectSimilar={openMovieDetails}
      />

      {/* 6. Screening Cabinet Drawer */}
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

      {/* 8. Minimalist Archival Footer */}
      <footer className="border-t border-[#1a1f2c] bg-[#08090c] py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#5a6270]">
          <div className="flex items-center gap-2 text-[#828b99]">
            <Aperture className="w-3.5 h-3.5 text-[#d49547]" />
            <span className="font-semibold text-[#e2dbd0] font-['Syne']">CinePulse Console</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>CACHE: SQLite Cache-Aside</span>
            <span>DATA: TMDB API Abstraction</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
