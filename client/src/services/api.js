import axios from 'axios';

// Create API client pointing to Node.js backend
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

export const MovieAPI = {
  // Get official genres
  async getGenres() {
    const res = await api.get('/movies/genres');
    return res.data?.data || [];
  },

  // Get trending movies (weekly or daily)
  async getTrending(page = 1, timeWindow = 'week') {
    const res = await api.get('/movies/trending', {
      params: { page, timeWindow },
    });
    return res.data;
  },

  // Discover movies with dynamic multi-filters
  async discover({ genreId, releaseYear, minRating, sortBy, page = 1 }) {
    const res = await api.get('/movies/discover', {
      params: { genreId, releaseYear, minRating, sortBy, page },
    });
    return res.data;
  },

  // Search movies by title/keyword
  async search(query, page = 1) {
    const res = await api.get('/movies/search', {
      params: { q: query, page },
    });
    return res.data;
  },

  // Get deep details for a movie (Cache-Aside from DB)
  async getById(id) {
    const res = await api.get(`/movies/${id}`);
    return res.data?.data;
  },
};

export const WishlistAPI = {
  // Get all saved wishlist items
  async getAll() {
    const res = await api.get('/wishlist');
    return res.data?.data || [];
  },

  // Add movie to wishlist
  async add(movieId, movieData = null, userNote = '') {
    const res = await api.post('/wishlist', {
      movieId,
      movie: movieData,
      userNote,
    });
    return res.data?.data;
  },

  // Remove movie from wishlist
  async remove(movieId) {
    const res = await api.delete(`/wishlist/${movieId}`);
    return res.data;
  },

  // Toggle watched status
  async toggleWatched(movieId) {
    const res = await api.patch(`/wishlist/${movieId}/toggle-watched`);
    return res.data?.data;
  },
};
