import { Router } from 'express';
import { WishlistRepository, MovieRepository } from '../db/database.js';
import { MovieService } from '../services/movieService.js';

const router = Router();

/**
 * GET /api/wishlist
 * Retrieve all persistent wishlist items
 */
router.get('/', (req, res) => {
  try {
    const items = WishlistRepository.getAll();
    res.json({ success: true, count: items.length, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/wishlist
 * Add movie to wishlist (Ensures movie is in SQLite DB first)
 */
router.post('/', async (req, res) => {
  try {
    const { movieId, movie, userNote } = req.body;
    if (!movieId) {
      return res.status(400).json({ success: false, error: 'movieId is required' });
    }

    // 1. Ensure movie exists in movie_cache table
    let cached = MovieRepository.getById(movieId);
    if (!cached) {
      if (movie && movie.title) {
        cached = MovieRepository.upsert(movie);
      } else {
        cached = await MovieService.getById(movieId);
      }
    }

    // 2. Add to wishlist
    const item = WishlistRepository.add(movieId, userNote || '');
    const fullItem = WishlistRepository.getAll().find(w => w.movie.id === Number(movieId));

    console.log(`❤️ [Wishlist Added] Movie #${movieId} (${cached?.title || 'Unknown'})`);
    res.status(201).json({ success: true, data: fullItem || item });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/wishlist/:movieId
 * Remove movie from wishlist
 */
router.delete('/:movieId', (req, res) => {
  try {
    const { movieId } = req.params;
    const removed = WishlistRepository.remove(movieId);
    if (!removed) {
      return res.status(404).json({ success: false, error: 'Item not found in wishlist' });
    }
    console.log(`💔 [Wishlist Removed] Movie #${movieId}`);
    res.json({ success: true, message: 'Removed from wishlist', movieId: Number(movieId) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PATCH /api/wishlist/:movieId/toggle-watched
 * Toggle is_watched status
 */
router.patch('/:movieId/toggle-watched', (req, res) => {
  try {
    const { movieId } = req.params;
    const updated = WishlistRepository.toggleWatched(movieId);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Item not found in wishlist' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
