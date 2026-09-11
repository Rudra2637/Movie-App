import { useState, useEffect, useCallback } from 'react';
import { MovieAPI } from '../services/api.js';

export function useMovies() {
  // Discovery & Browsing state
  const [trending, setTrending] = useState([]);
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  // Filters and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // Active movie for modal
  const [activeMovieId, setActiveMovieId] = useState(null);
  const [activeMovieDetails, setActiveMovieDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // 1. Load initial genres and trending movies
  useEffect(() => {
    async function initData() {
      try {
        const [genresList, trendingData] = await Promise.all([
          MovieAPI.getGenres(),
          MovieAPI.getTrending(1, 'week'),
        ]);
        setGenres(genresList);
        const trendResults = trendingData.results || [];
        setTrending(trendResults);
        if (trendResults.length > 0) {
          // Select highest popularity movie with backdrop for hero spotlight
          const hero = trendResults.find(m => m.backdropPath && m.overview) || trendResults[0];
          setFeaturedMovie(hero);
        }
      } catch (err) {
        console.error('Failed to initialize movies:', err);
      }
    }
    initData();
  }, []);

  // 2. Main fetch function for search / discover
  const fetchMovies = useCallback(
    async (currentPage = 1, append = false) => {
      if (currentPage === 1) setLoading(true);
      else setLoadingMore(true);
      setError(null);

      try {
        let response;
        if (searchQuery.trim()) {
          response = await MovieAPI.search(searchQuery.trim(), currentPage);
        } else if (selectedGenre === 'all' && selectedYear === 'all' && minRating === 0 && sortBy === 'popularity.desc') {
          response = await MovieAPI.getTrending(currentPage, 'week');
        } else {
          response = await MovieAPI.discover({
            genreId: selectedGenre,
            releaseYear: selectedYear,
            minRating,
            sortBy,
            page: currentPage,
          });
        }

        const newResults = response.results || [];
        if (append) {
          setMovies(prev => {
            // Deduplicate by ID
            const existingIds = new Set(prev.map(m => m.id));
            const filtered = newResults.filter(m => !existingIds.has(m.id));
            return [...prev, ...filtered];
          });
        } else {
          setMovies(newResults);
        }

        setPage(currentPage);
        setTotalPages(response.totalPages || 1);
        setTotalResults(response.totalResults || newResults.length);
      } catch (err) {
        console.error('Error fetching movies:', err);
        setError('Failed to load movies. Please check your connection or try again.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [searchQuery, selectedGenre, selectedYear, minRating, sortBy]
  );

  // Trigger fetch whenever main filters or search query change
  useEffect(() => {
    fetchMovies(1, false);
  }, [fetchMovies]);

  // Load more / pagination
  const loadMore = useCallback(() => {
    if (!loading && !loadingMore && page < totalPages) {
      fetchMovies(page + 1, true);
    }
  }, [loading, loadingMore, page, totalPages, fetchMovies]);

  // Reset all filters to default
  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedGenre('all');
    setSelectedYear('all');
    setMinRating(0);
    setSortBy('popularity.desc');
  }, []);

  // Open movie details (Cache-Aside fetch)
  const openMovieDetails = useCallback(async (movieOrId) => {
    const id = typeof movieOrId === 'object' ? movieOrId.id : movieOrId;
    setActiveMovieId(id);
    setLoadingDetails(true);

    // If full movie object already provided, set as initial preview
    if (typeof movieOrId === 'object' && movieOrId.title) {
      setActiveMovieDetails(movieOrId);
    }

    try {
      const fullDetails = await MovieAPI.getById(id);
      setActiveMovieDetails(fullDetails);
    } catch (err) {
      console.error('Failed to load movie details:', err);
    } finally {
      setLoadingDetails(false);
    }
  }, []);

  const closeMovieDetails = useCallback(() => {
    setActiveMovieId(null);
    setActiveMovieDetails(null);
  }, []);

  return {
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
    activeMovieId,
    activeMovieDetails,
    loadingDetails,
    openMovieDetails,
    closeMovieDetails,
  };
}
