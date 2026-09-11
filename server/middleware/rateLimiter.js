import rateLimit from 'express-rate-limit';

// Rate limiter for general API routes (150 requests per minute per IP)
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: 'Too many requests from this IP. Please wait a moment before trying again.',
  },
});

// Stricter rate limiter for search & discover queries (60 requests per minute per IP)
export const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: 'Search rate limit exceeded. Please wait a few seconds before searching again.',
  },
});
