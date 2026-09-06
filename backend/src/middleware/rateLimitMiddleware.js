import rateLimit from 'express-rate-limit';

export const standardRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});

export const burstRateLimiter = rateLimit({
  windowMs: 10 * 1000, // 10 seconds
  max: 20, // 20 requests per 10 seconds
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'BURST_RATE_LIMIT_EXCEEDED',
    message: 'Rapid activity detected. Please slow down.'
  }
});
