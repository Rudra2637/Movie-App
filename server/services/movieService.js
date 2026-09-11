import axios from 'axios';
import { TMDB_CONFIG, GENRE_MAP, FALLBACK_MOVIES } from '../config/tmdb.js';
import { MovieRepository, QueryCacheRepository } from '../db/database.js';

// Create configured Axios instance for TMDB
const tmdbApi = axios.create({
  baseURL: TMDB_CONFIG.BASE_URL,
  timeout: TMDB_CONFIG.TIMEOUT_MS,
  params: {
    api_key: TMDB_CONFIG.API_KEY,
  },
  headers: TMDB_CONFIG.ACCESS_TOKEN
    ? { Authorization: `Bearer ${TMDB_CONFIG.ACCESS_TOKEN}` }
    : {},
});

/**
 * Normalizes raw TMDB movie data into a clean, unified object
 */
export function normalizeMovie(raw) {
  if (!raw) return null;

  // Extract genres (handles both genre_ids array and genres object array)
  let genres = [];
  if (Array.isArray(raw.genres)) {
    genres = raw.genres.map(g => (typeof g === 'object' ? g.name : GENRE_MAP[g] || String(g)));
  } else if (Array.isArray(raw.genre_ids)) {
    genres = raw.genre_ids.map(id => GENRE_MAP[id] || `Genre ${id}`).filter(Boolean);
  }

  // Extract cast & directors from credits if available
  let cast = [];
  let directors = [];
  if (raw.credits?.cast) {
    cast = raw.credits.cast.slice(0, 8).map(c => c.name);
  }
  if (raw.credits?.crew) {
    directors = raw.credits.crew
      .filter(c => c.job === 'Director')
      .map(c => c.name);
  }

  // Extract YouTube trailer key if available
  let trailerKey = '';
  if (raw.videos?.results) {
    const trailer = raw.videos.results.find(
      v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
    );
    if (trailer) trailerKey = trailer.key;
  }

  const posterRaw = raw.posterPath || raw.poster_path || '';
  const posterPath = posterRaw
    ? (posterRaw.startsWith('http') ? posterRaw : `${TMDB_CONFIG.IMAGE_BASE_URL}/${TMDB_CONFIG.POSTER_SIZES.large}${posterRaw.startsWith('/') ? '' : '/'}${posterRaw}`)
    : '';

  const backdropRaw = raw.backdropPath || raw.backdrop_path || '';
  const backdropPath = backdropRaw
    ? (backdropRaw.startsWith('http') ? backdropRaw : `${TMDB_CONFIG.IMAGE_BASE_URL}/${TMDB_CONFIG.BACKDROP_SIZES.large}${backdropRaw.startsWith('/') ? '' : '/'}${backdropRaw}`)
    : '';

  return {
    id: raw.id,
    title: raw.title || raw.original_title || 'Untitled',
    overview: raw.overview || 'No synopsis available for this title.',
    posterPath,
    backdropPath,
    releaseDate: raw.releaseDate || raw.release_date || '',
    voteAverage: typeof (raw.voteAverage ?? raw.vote_average) === 'number' ? Math.round((raw.voteAverage ?? raw.vote_average) * 10) / 10 : 0,
    voteCount: raw.voteCount || raw.vote_count || 0,
    runtime: raw.runtime || 0,
    genres,
    cast,
    directors,
    trailerKey,
    popularity: raw.popularity || 0,
  };
}

export const MovieService = {
  /**
   * CACHE-ASIDE: Get Movie by ID
   * 1. Check local SQLite DB
   * 2. If present and has details, return from DB (0 TMDB API calls)
   * 3. If miss, fetch from TMDB with credits & videos
   * 4. Save to DB and return
   */
  async getById(id) {
    const movieId = Number(id);

    // 1. Check DB
    const cached = MovieRepository.getById(movieId);
    // If cached and has deep details (cast or runtime or trailer), serve directly from DB!
    if (cached && (cached.cast?.length > 0 || cached.runtime > 0 || cached.trailerKey)) {
      console.log(`⚡ [Cache Hit - SQLite DB] Served movie #${movieId} (${cached.title}) from local DB`);
      return { ...cached, _source: 'database_cache' };
    }

    // 2. Fetch from TMDB API
    try {
      console.log(`🌐 [Cache Miss] Fetching movie #${movieId} from TMDB API...`);
      const response = await tmdbApi.get(`/movie/${movieId}`, {
        params: {
          append_to_response: 'credits,videos,recommendations',
        },
      });

      const normalized = normalizeMovie(response.data);
      
      // 3. Save to local SQLite database for all future requests
      const saved = MovieRepository.upsert(normalized);
      console.log(`💾 [DB Saved] Cached movie #${movieId} (${saved.title}) to SQLite`);
      return { ...saved, _source: 'tmdb_api' };
    } catch (error) {
      console.error(`⚠️ TMDB API error for movie #${movieId}:`, error.message);
      // Fallback: If we had a partial cached record, return it
      if (cached) return { ...cached, _source: 'stale_database_cache' };
      // Fallback from built-in sample list
      const fallback = FALLBACK_MOVIES.find(m => m.id === movieId);
      if (fallback) {
        return { ...fallback, _source: 'fallback_dataset' };
      }
      throw new Error(`Movie not found with ID ${movieId}`);
    }
  },

  /**
   * CACHE-ASIDE: Get Trending Movies
   */
  async getTrending(page = 1, timeWindow = 'week') {
    const queryKey = `trending:${timeWindow}:${page}`;
    const cachedQuery = QueryCacheRepository.get(queryKey);

    // Check query cache (valid for 2 hours)
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    if (cachedQuery && cachedQuery.cachedAt > twoHoursAgo && cachedQuery.resultIds.length > 0) {
      const movies = MovieRepository.getManyByIds(cachedQuery.resultIds);
      if (movies.length > 0) {
        console.log(`⚡ [Cache Hit - Query] Trending page ${page} served from SQLite DB`);
        return {
          results: movies,
          page: Number(page),
          totalPages: cachedQuery.totalPages,
          totalResults: cachedQuery.totalResults,
          _source: 'database_cache',
        };
      }
    }

    // Cache Miss -> Fetch TMDB
    try {
      console.log(`🌐 [Query Miss] Fetching trending from TMDB (page ${page})...`);
      const response = await tmdbApi.get(`/trending/movie/${timeWindow}`, {
        params: { page },
      });

      const movies = (response.data.results || []).map(normalizeMovie);
      // Upsert all movies to SQLite
      MovieRepository.upsertMany(movies);
      // Cache query mapping
      QueryCacheRepository.set(
        queryKey,
        movies.map(m => m.id),
        response.data.total_results || movies.length,
        response.data.total_pages || 1
      );

      return {
        results: movies,
        page: response.data.page || Number(page),
        totalPages: Math.min(response.data.total_pages || 1, 500),
        totalResults: response.data.total_results || movies.length,
        _source: 'tmdb_api',
      };
    } catch (error) {
      console.error('⚠️ Trending API error, falling back to local dataset:', error.message);
      // Seed fallback movies to DB and cache query so subsequent requests are < 2ms!
      MovieRepository.upsertMany(FALLBACK_MOVIES);
      QueryCacheRepository.set(
        queryKey,
        FALLBACK_MOVIES.map(m => m.id),
        FALLBACK_MOVIES.length,
        1
      );
      return {
        results: FALLBACK_MOVIES,
        page: 1,
        totalPages: 1,
        totalResults: FALLBACK_MOVIES.length,
        _source: 'fallback_dataset',
      };
    }
  },

  /**
   * CACHE-ASIDE: Discover Movies with dynamic filters
   * Supports: genreId, releaseYear, minRating, sortBy ('popularity.desc', 'vote_average.desc', 'primary_release_date.desc', 'title.asc')
   */
  async discover({ genreId, releaseYear, minRating, sortBy = 'popularity.desc', page = 1 }) {
    const cleanGenre = genreId || 'all';
    const cleanYear = releaseYear || 'all';
    const cleanRating = minRating || 0;
    const cleanSort = sortBy || 'popularity.desc';
    const queryKey = `discover:g_${cleanGenre}:y_${cleanYear}:r_${cleanRating}:s_${cleanSort}:p_${page}`;

    const cachedQuery = QueryCacheRepository.get(queryKey);
    const oneHourAgo = Date.now() - 1 * 60 * 60 * 1000;

    if (cachedQuery && cachedQuery.cachedAt > oneHourAgo && cachedQuery.resultIds.length > 0) {
      const movies = MovieRepository.getManyByIds(cachedQuery.resultIds);
      if (movies.length > 0) {
        console.log(`⚡ [Cache Hit - Discover] Query ${queryKey} served from SQLite DB`);
        return {
          results: movies,
          page: Number(page),
          totalPages: cachedQuery.totalPages,
          totalResults: cachedQuery.totalResults,
          _source: 'database_cache',
        };
      }
    }

    // Build TMDB Discover query params
    const params = {
      page,
      sort_by: cleanSort,
      'vote_count.gte': 50, // Ensure quality results
    };

    if (genreId && genreId !== 'all') params.with_genres = genreId;
    if (releaseYear && releaseYear !== 'all') params.primary_release_year = releaseYear;
    if (minRating && Number(minRating) > 0) params['vote_average.gte'] = Number(minRating);

    try {
      console.log(`🌐 [Discover Miss] Fetching discover from TMDB:`, params);
      const response = await tmdbApi.get('/discover/movie', { params });
      const movies = (response.data.results || []).map(normalizeMovie);

      // Save to SQLite
      MovieRepository.upsertMany(movies);
      QueryCacheRepository.set(
        queryKey,
        movies.map(m => m.id),
        response.data.total_results || movies.length,
        response.data.total_pages || 1
      );

      return {
        results: movies,
        page: response.data.page || Number(page),
        totalPages: Math.min(response.data.total_pages || 1, 500),
        totalResults: response.data.total_results || movies.length,
        _source: 'tmdb_api',
      };
    } catch (error) {
      console.error('⚠️ Discover API error, using local filtered search:', error.message);
      // Perform local search in SQLite as fallback
      const localMovies = MovieRepository.searchLocal('', 20);
      return {
        results: localMovies.length > 0 ? localMovies : FALLBACK_MOVIES,
        page: 1,
        totalPages: 1,
        totalResults: localMovies.length || FALLBACK_MOVIES.length,
        _source: 'fallback_dataset',
      };
    }
  },

  /**
   * CACHE-ASIDE: Search Movies by Title/Keyword
   */
  async search(query, page = 1) {
    if (!query || !query.trim()) {
      return this.getTrending(page);
    }

    const cleanQuery = query.trim().toLowerCase();
    const queryKey = `search:${cleanQuery}:${page}`;
    const cachedQuery = QueryCacheRepository.get(queryKey);

    const sixHoursAgo = Date.now() - 6 * 60 * 60 * 1000;
    if (cachedQuery && cachedQuery.cachedAt > sixHoursAgo && cachedQuery.resultIds.length > 0) {
      const movies = MovieRepository.getManyByIds(cachedQuery.resultIds);
      if (movies.length > 0) {
        console.log(`⚡ [Cache Hit - Search] Query "${cleanQuery}" served from SQLite DB`);
        return {
          results: movies,
          page: Number(page),
          totalPages: cachedQuery.totalPages,
          totalResults: cachedQuery.totalResults,
          _source: 'database_cache',
        };
      }
    }

    try {
      console.log(`🌐 [Search Miss] Searching TMDB for "${cleanQuery}" (page ${page})...`);
      const response = await tmdbApi.get('/search/movie', {
        params: {
          query: cleanQuery,
          page,
          include_adult: false,
        },
      });

      const movies = (response.data.results || []).map(normalizeMovie);
      MovieRepository.upsertMany(movies);
      QueryCacheRepository.set(
        queryKey,
        movies.map(m => m.id),
        response.data.total_results || movies.length,
        response.data.total_pages || 1
      );

      return {
        results: movies,
        page: response.data.page || Number(page),
        totalPages: Math.min(response.data.total_pages || 1, 500),
        totalResults: response.data.total_results || movies.length,
        _source: 'tmdb_api',
      };
    } catch (error) {
      console.error(`⚠️ Search API error for "${cleanQuery}":`, error.message);
      // Search local SQLite database
      const localMatches = MovieRepository.searchLocal(cleanQuery, 20);
      return {
        results: localMatches,
        page: 1,
        totalPages: 1,
        totalResults: localMatches.length,
        _source: 'local_database_search',
      };
    }
  },

  /**
   * Get official Genres list
   */
  getGenres() {
    return Object.entries(GENRE_MAP).map(([id, name]) => ({
      id: Number(id),
      name,
    }));
  }
};
