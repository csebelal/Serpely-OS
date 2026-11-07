import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

export interface RateLimiterOptions {
  windowMs: number; // Duration of the rate limit window in milliseconds
  max: number; // Maximum number of requests allowed in window
  message?: string;
  statusCode?: number;
  keyGenerator?: (req: Request) => string;
}

/**
 * In-memory sliding window rate limiter
 * Protects endpoints against brute force, credential stuffing, and volumetric DoS.
 */
export function createRateLimiter(options: RateLimiterOptions) {
  const {
    windowMs,
    max,
    message = 'Too many requests from this IP. Please try again later.',
    statusCode = 429,
    keyGenerator = (req: Request) => {
      // Extract client IP, prioritizing standard proxy headers
      const forwarded = req.headers['x-forwarded-for'];
      if (typeof forwarded === 'string') {
        return forwarded.split(',')[0].trim();
      }
      return req.ip || req.socket.remoteAddress || 'unknown-client';
    }
  } = options;

  const hits = new Map<string, RateLimitRecord>();

  // Periodically sweep expired keys to prevent memory leaks (every 5 minutes)
  const sweepInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of hits.entries()) {
      if (now > record.resetTime) {
        hits.delete(key);
      }
    }
  }, Math.max(windowMs, 60000));

  // Allow unref so the sweep timer does not keep Node.js process alive in tests
  if (sweepInterval.unref) {
    sweepInterval.unref();
  }

  return function rateLimiterMiddleware(req: Request, res: Response, next: NextFunction) {
    const key = keyGenerator(req);
    const now = Date.now();

    let record = hits.get(key);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs
      };
      hits.set(key, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, max - record.count);
    const resetSeconds = Math.ceil((record.resetTime - now) / 1000);

    // Standard RFC RateLimit headers
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    if (record.count > max) {
      res.setHeader('Retry-After', resetSeconds);
      return res.status(statusCode).json({
        success: false,
        error: message,
        retryAfterSeconds: resetSeconds
      });
    }

    next();
  };
}

/**
 * Strict rate limiter for Authentication routes:
 * 15 requests per 15 minutes window to block brute force logins.
 */
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: 'Too many authentication attempts. Please try again in 15 minutes.'
});

/**
 * General API rate limiter:
 * 300 requests per minute window.
 */
export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 300,
  message: 'Rate limit exceeded. Please slow down your requests.'
});
