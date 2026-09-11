import { useState, useEffect, useCallback } from 'react';
import { WishlistAPI } from '../services/api.js';

export function useWishlist(onToast) {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch wishlist from backend
  const fetchWishlist = useCallback(async () => {
    try {
      const items = await WishlistAPI.getAll();
      setWishlist(items);
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Check if a movie is in wishlist
  const isInWishlist = useCallback(
    (movieId) => {
      return wishlist.some(item => item.movie?.id === Number(movieId) || item.movieId === Number(movieId));
    },
    [wishlist]
  );

  // Toggle movie in wishlist (Optimistic UI update)
  const toggleWishlist = useCallback(
    async (movie) => {
      if (!movie || !movie.id) return;

      const exists = isInWishlist(movie.id);

      if (exists) {
        // Optimistic removal
        const prev = [...wishlist];
        setWishlist(prev.filter(item => (item.movie?.id || item.movieId) !== Number(movie.id)));
        if (onToast) onToast(`Removed "${movie.title}" from Wishlist`, 'info');

        try {
          await WishlistAPI.remove(movie.id);
        } catch (err) {
          console.error('Failed to remove from wishlist:', err);
          setWishlist(prev); // Rollback
          if (onToast) onToast('Failed to remove from wishlist', 'error');
        }
      } else {
        // Optimistic addition
        const optimisticItem = {
          wishlistId: Date.now(),
          movieId: movie.id,
          isWatched: false,
          addedAt: Date.now(),
          movie,
        };
        const prev = [...wishlist];
        setWishlist([optimisticItem, ...prev]);
        if (onToast) onToast(`Added "${movie.title}" to Wishlist`, 'success');

        try {
          const saved = await WishlistAPI.add(movie.id, movie);
          // Update with real ID from database
          setWishlist(current =>
            current.map(item =>
              item.movieId === movie.id ? { ...item, wishlistId: saved.wishlistId || item.wishlistId } : item
            )
          );
        } catch (err) {
          console.error('Failed to add to wishlist:', err);
          setWishlist(prev); // Rollback
          if (onToast) onToast('Failed to add to wishlist', 'error');
        }
      }
    },
    [wishlist, isInWishlist, onToast]
  );

  // Toggle watched status
  const toggleWatched = useCallback(
    async (movieId) => {
      const prev = [...wishlist];
      setWishlist(current =>
        current.map(item => {
          if ((item.movie?.id || item.movieId) === Number(movieId)) {
            return { ...item, isWatched: !item.isWatched };
          }
          return item;
        })
      );

      try {
        await WishlistAPI.toggleWatched(movieId);
      } catch (err) {
        console.error('Failed to toggle watched:', err);
        setWishlist(prev);
        if (onToast) onToast('Failed to update status', 'error');
      }
    },
    [wishlist, onToast]
  );

  return {
    wishlist,
    loading,
    isInWishlist,
    toggleWishlist,
    toggleWatched,
    refreshWishlist: fetchWishlist,
  };
}
