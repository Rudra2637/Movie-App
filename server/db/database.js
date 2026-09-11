import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../../server.db');

export const db = new DatabaseSync(dbPath);

// Initialize tables
export function initDatabase() {
  // 1. Movie Cache Table (Cache-Aside storage)
  db.exec(`
    CREATE TABLE IF NOT EXISTS movie_cache (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      overview TEXT,
      poster_path TEXT,
      backdrop_path TEXT,
      release_date TEXT,
      vote_average REAL DEFAULT 0,
      vote_count INTEGER DEFAULT 0,
      runtime INTEGER DEFAULT 0,
      genres TEXT,          -- JSON array string e.g. ["Action", "Sci-Fi"]
      cast_members TEXT,    -- JSON array string of actors
      directors TEXT,       -- JSON array string of directors
      trailer_key TEXT,     -- YouTube trailer video key
      popularity REAL DEFAULT 0,
      cached_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_movies_title ON movie_cache(title);
    CREATE INDEX IF NOT EXISTS idx_movies_popularity ON movie_cache(popularity DESC);
    CREATE INDEX IF NOT EXISTS idx_movies_vote ON movie_cache(vote_average DESC);
  `);

  // 2. Query Cache Table (Discovery & Search results cache)
  db.exec(`
    CREATE TABLE IF NOT EXISTS query_cache (
      query_key TEXT PRIMARY KEY,
      result_ids TEXT NOT NULL, -- JSON array string of movie IDs
      total_results INTEGER DEFAULT 0,
      total_pages INTEGER DEFAULT 1,
      cached_at INTEGER NOT NULL
    );
  `);

  // 3. Persistent Wishlist Table (No auth required, guest-persisted)
  db.exec(`
    CREATE TABLE IF NOT EXISTS wishlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      movie_id INTEGER NOT NULL UNIQUE,
      is_watched INTEGER DEFAULT 0,
      user_note TEXT,
      added_at INTEGER NOT NULL,
      FOREIGN KEY (movie_id) REFERENCES movie_cache(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_wishlist_movie ON wishlist(movie_id);
  `);

  console.log('✅ SQLite Database schema initialized successfully at:', dbPath);
}

// Helper methods for Movie Cache
export const MovieRepository = {
  getById(id) {
    const stmt = db.prepare('SELECT * FROM movie_cache WHERE id = ?');
    const row = stmt.get(Number(id));
    if (!row) return null;
    return formatMovieRow(row);
  },

  getManyByIds(ids) {
    if (!ids || ids.length === 0) return [];
    const placeholders = ids.map(() => '?').join(',');
    const stmt = db.prepare(`SELECT * FROM movie_cache WHERE id IN (${placeholders})`);
    const rows = stmt.all(...ids.map(Number));
    return rows.map(formatMovieRow);
  },

  searchLocal(query, limit = 20) {
    const stmt = db.prepare(`
      SELECT * FROM movie_cache 
      WHERE title LIKE ? OR overview LIKE ? 
      ORDER BY popularity DESC 
      LIMIT ?
    `);
    const term = `%${query}%`;
    const rows = stmt.all(term, term, limit);
    return rows.map(formatMovieRow);
  },

  upsert(movie) {
    const now = Date.now();
    const stmt = db.prepare(`
      INSERT INTO movie_cache (
        id, title, overview, poster_path, backdrop_path,
        release_date, vote_average, vote_count, runtime,
        genres, cast_members, directors, trailer_key,
        popularity, cached_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        overview = excluded.overview,
        poster_path = excluded.poster_path,
        backdrop_path = excluded.backdrop_path,
        release_date = excluded.release_date,
        vote_average = excluded.vote_average,
        vote_count = excluded.vote_count,
        runtime = CASE WHEN excluded.runtime > 0 THEN excluded.runtime ELSE movie_cache.runtime END,
        genres = COALESCE(excluded.genres, movie_cache.genres),
        cast_members = COALESCE(excluded.cast_members, movie_cache.cast_members),
        directors = COALESCE(excluded.directors, movie_cache.directors),
        trailer_key = COALESCE(excluded.trailer_key, movie_cache.trailer_key),
        popularity = excluded.popularity,
        updated_at = excluded.updated_at
    `);

    stmt.run(
      movie.id,
      movie.title,
      movie.overview || '',
      movie.posterPath || movie.poster_path || '',
      movie.backdropPath || movie.backdrop_path || '',
      movie.releaseDate || movie.release_date || '',
      movie.voteAverage ?? movie.vote_average ?? 0,
      movie.voteCount ?? movie.vote_count ?? 0,
      movie.runtime || 0,
      typeof movie.genres === 'string' ? movie.genres : JSON.stringify(movie.genres || []),
      typeof movie.cast === 'string' ? movie.cast : JSON.stringify(movie.cast || movie.cast_members || []),
      typeof movie.directors === 'string' ? movie.directors : JSON.stringify(movie.directors || []),
      movie.trailerKey || movie.trailer_key || '',
      movie.popularity || 0,
      now,
      now
    );

    return this.getById(movie.id);
  },

  upsertMany(movies) {
    if (!movies || movies.length === 0) return [];
    return movies.map(m => this.upsert(m));
  }
};

// Helper methods for Query Cache
export const QueryCacheRepository = {
  get(key) {
    const stmt = db.prepare('SELECT * FROM query_cache WHERE query_key = ?');
    const row = stmt.get(key);
    if (!row) return null;
    return {
      queryKey: row.query_key,
      resultIds: JSON.parse(row.result_ids || '[]'),
      totalResults: row.total_results,
      totalPages: row.total_pages,
      cachedAt: row.cached_at,
    };
  },

  set(key, resultIds, totalResults = 0, totalPages = 1) {
    const stmt = db.prepare(`
      INSERT INTO query_cache (query_key, result_ids, total_results, total_pages, cached_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(query_key) DO UPDATE SET
        result_ids = excluded.result_ids,
        total_results = excluded.total_results,
        total_pages = excluded.total_pages,
        cached_at = excluded.cached_at
    `);
    stmt.run(key, JSON.stringify(resultIds), totalResults, totalPages, Date.now());
  }
};

// Helper methods for Wishlist
export const WishlistRepository = {
  getAll() {
    const stmt = db.prepare(`
      SELECT 
        w.id AS wishlist_id,
        w.is_watched,
        w.user_note,
        w.added_at,
        m.*
      FROM wishlist w
      JOIN movie_cache m ON w.movie_id = m.id
      ORDER BY w.added_at DESC
    `);
    const rows = stmt.all();
    return rows.map(row => ({
      wishlistId: row.wishlist_id,
      isWatched: Boolean(row.is_watched),
      userNote: row.user_note,
      addedAt: row.added_at,
      movie: formatMovieRow(row),
    }));
  },

  getByMovieId(movieId) {
    const stmt = db.prepare('SELECT * FROM wishlist WHERE movie_id = ?');
    return stmt.get(Number(movieId));
  },

  add(movieId, userNote = '') {
    const stmt = db.prepare(`
      INSERT INTO wishlist (movie_id, is_watched, user_note, added_at)
      VALUES (?, 0, ?, ?)
      ON CONFLICT(movie_id) DO UPDATE SET
        user_note = excluded.user_note
    `);
    stmt.run(Number(movieId), userNote, Date.now());
    return this.getByMovieId(movieId);
  },

  remove(movieId) {
    const stmt = db.prepare('DELETE FROM wishlist WHERE movie_id = ?');
    const info = stmt.run(Number(movieId));
    return info.changes > 0;
  },

  toggleWatched(movieId) {
    const current = this.getByMovieId(movieId);
    if (!current) return null;
    const nextState = current.is_watched ? 0 : 1;
    const stmt = db.prepare('UPDATE wishlist SET is_watched = ? WHERE movie_id = ?');
    stmt.run(nextState, Number(movieId));
    return { ...current, is_watched: Boolean(nextState) };
  }
};

function formatMovieRow(row) {
  let genres = [];
  let cast = [];
  let directors = [];

  try { genres = JSON.parse(row.genres || '[]'); } catch { genres = []; }
  try { cast = JSON.parse(row.cast_members || '[]'); } catch { cast = []; }
  try { directors = JSON.parse(row.directors || '[]'); } catch { directors = []; }

  const posterPath = row.poster_path
    ? (row.poster_path.startsWith('http') ? row.poster_path : `https://image.tmdb.org/t/p/w500${row.poster_path}`)
    : '';

  const backdropPath = row.backdrop_path
    ? (row.backdrop_path.startsWith('http') ? row.backdrop_path : `https://image.tmdb.org/t/p/w1280${row.backdrop_path}`)
    : '';

  return {
    id: row.id,
    title: row.title,
    overview: row.overview || '',
    posterPath,
    backdropPath,
    releaseDate: row.release_date || '',
    voteAverage: row.vote_average || 0,
    voteCount: row.vote_count || 0,
    runtime: row.runtime || 0,
    genres,
    cast,
    directors,
    trailerKey: row.trailer_key || '',
    popularity: row.popularity || 0,
    cachedAt: row.cached_at,
    updatedAt: row.updated_at,
  };
}
