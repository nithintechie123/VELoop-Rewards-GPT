import rateLimit from 'express-rate-limit';

/**
 * Endpoint-Specific Rate Limiters (Requirement 44)
 * Protects sensitive endpoints (POST /join, POST /claim, POST /login) against abuse,
 * spamming, brute-force attacks, and high-frequency scripted submissions.
 */

// 1. Join Rate Limiter: Protects POST /join from rapid participation spam
export const joinRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 entries per minute per user/IP
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.headers['x-user-id'] || req.headers['x-forwarded-for'] || req.ip || '127.0.0.1',
  handler: (req, res) => {
    res.status(429).json({
      error: 'RATE_LIMITED',
      code: 'RATE_LIMITED',
      title: 'Please Slow Down',
      message: 'You are making join requests too quickly. Please wait a moment before trying again.',
      action: 'Try Again',
      retryAfterSeconds: 60
    });
  }
});

// 2. Claim Rate Limiter: Protects POST /claim from excessive claim attempts
export const claimRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 15, // 15 claim requests per 5 minutes
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.headers['x-user-id'] || req.headers['x-forwarded-for'] || req.ip || '127.0.0.1',
  handler: (req, res) => {
    res.status(429).json({
      error: 'RATE_LIMITED',
      code: 'RATE_LIMITED',
      title: 'Please Slow Down',
      message: 'Too many prize claim submissions. Please wait a few moments before trying again.',
      action: 'Try Again',
      retryAfterSeconds: 300
    });
  }
});

// 3. Login Rate Limiter: Protects POST /login from credential stuffing & brute force
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // 15 login attempts per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.headers['x-forwarded-for'] || req.ip || '127.0.0.1',
  handler: (req, res) => {
    res.status(429).json({
      error: 'RATE_LIMITED',
      code: 'RATE_LIMITED',
      title: 'Too Many Login Attempts',
      message: 'Too many login attempts from this device. For your security, please wait a few minutes before trying again.',
      action: 'Try Again Later',
      retryAfterSeconds: 900
    });
  }
});

// 4. Global API Standard Rate Limiter
export const standardRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'RATE_LIMITED',
    code: 'RATE_LIMITED',
    title: 'Please Slow Down',
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});

// 5. Burst Rate Limiter
export const burstRateLimiter = rateLimit({
  windowMs: 10 * 1000, // 10 seconds
  max: 20, // 20 requests per 10 seconds
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'RATE_LIMITED',
    code: 'RATE_LIMITED',
    title: 'Please Slow Down',
    message: 'Rapid activity detected. Please slow down.'
  }
});
