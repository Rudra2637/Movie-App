import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase, MovieRepository } from './db/database.js';
import { FALLBACK_MOVIES } from './config/tmdb.js';
import movieRoutes from './routes/movies.js';
import wishlistRoutes from './routes/wishlist.js';
import { apiLimiter } from './middleware/rateLimiter.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

initDatabase();

try {
  MovieRepository.upsertMany(FALLBACK_MOVIES);
  console.log(`🌱 Pre-seeded database with ${FALLBACK_MOVIES.length} essential movie records`);
} catch (err) {
  console.warn('⚠️ Seeding note:', err.message);
}

app.use(cors({
  origin: '*', // Allow client requests
  methods: ['GET', 'POST', 'DELETE', 'PATCH'],
}));
app.use(express.json());
app.use(apiLimiter);

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${req.method}] ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

app.use('/api/movies', movieRoutes);
app.use('/api/wishlist', wishlistRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'CinePulse Movie Discovery API',
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.url} not found`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('💥 Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

// 6. Start Server
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 CinePulse Server running on http://localhost:${PORT}`);
  console.log(`📡 Endpoints:`);
  console.log(`   - GET  /api/movies/trending`);
  console.log(`   - GET  /api/movies/discover`);
  console.log(`   - GET  /api/movies/search?q=...`);
  console.log(`   - GET  /api/movies/:id`);
  console.log(`   - GET  /api/movies/genres`);
  console.log(`   - GET  /api/wishlist`);
  console.log(`   - POST /api/wishlist`);
  console.log(`======================================================\n`);
});
