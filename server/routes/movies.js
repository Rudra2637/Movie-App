import { Router } from 'express';
import { MovieService } from '../services/movieService.js';
import { searchLimiter } from '../middleware/rateLimiter.js';

const router = Router();

/**
 * GET /api/movies/genres
 * Returns list of movie genres
 */
router.get('/genres', (req, res) => {
  try {
    const genres = MovieService.getGenres();
    res.json({ success: true, data: genres });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/movies/trending
 * Returns trending movies (timeWindow = day | week)
 */
router.get('/trending', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const timeWindow = req.query.timeWindow === 'day' ? 'day' : 'week';
    const result = await MovieService.getTrending(page, timeWindow);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/movies/discover
 * Dynamic filtering by genre, year, rating, and sort order
 */
router.get('/discover', async (req, res) => {
  try {
    const { genreId, releaseYear, minRating, sortBy, page } = req.query;
    const result = await MovieService.discover({
      genreId,
      releaseYear,
      minRating: minRating ? parseFloat(minRating) : 0,
      sortBy,
      page: parseInt(page) || 1,
    });
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/movies/search
 * Keyword/Title search with debounced frontend querying
 */
router.get('/search', searchLimiter, async (req, res) => {
  try {
    const query = req.query.q || '';
    const page = parseInt(req.query.page) || 1;
    const result = await MovieService.search(query, page);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/movies/:id
 * Rich movie details with cast, trailer, recommendations (Cache-Aside: served from DB if available)
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const movie = await MovieService.getById(id);
    res.json({ success: true, data: movie });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
});

export default router;
