import { NextResponse } from 'next/server';

/**
 * In-memory rate limiter using sliding window algorithm
 * Perfect for Next.js edge/serverless environment
 * Stores rate limit data in memory (resets on deployment)
 * For production, consider Redis-based solution (e.g., Upstash)
 */
class RateLimiter {
  constructor() {
    this.requests = new Map();
    this.windowMs = 60 * 1000; // 1 minute
    this.maxRequests = 10; // 10 requests per minute
    
    // Cleanup old entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Check if request is within rate limit
   * @param {string} key - Unique identifier (e.g., user ID, IP address)
   * @param {number} limit - Max requests allowed (optional, defaults to maxRequests)
   * @returns {object} { allowed: boolean, remaining: number, resetTime: number }
   */
  checkLimit(key, limit = this.maxRequests) {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get or create entry for this key
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }

    const timestamps = this.requests.get(key);

    // Remove timestamps outside the current window
    const validTimestamps = timestamps.filter(timestamp => timestamp > windowStart);

    // Check if over limit
    const allowed = validTimestamps.length < limit;

    if (allowed) {
      validTimestamps.push(now);
      this.requests.set(key, validTimestamps);
    }

    // Calculate when the rate limit resets (when oldest request leaves window)
    const resetTime = validTimestamps.length > 0 
      ? validTimestamps[0] + this.windowMs 
      : now + this.windowMs;

    return {
      allowed,
      remaining: Math.max(0, limit - validTimestamps.length),
      resetTime,
      retryAfter: Math.ceil((resetTime - now) / 1000) // seconds
    };
  }

  /**
   * Cleanup old entries from memory to prevent memory leaks
   */
  cleanup() {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    for (const [key, timestamps] of this.requests.entries()) {
      const validTimestamps = timestamps.filter(t => t > windowStart);
      if (validTimestamps.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validTimestamps);
      }
    }
  }

  /**
   * Reset limit for a specific key (useful for testing)
   */
  resetKey(key) {
    this.requests.delete(key);
  }

  /**
   * Clear all rate limit data
   */
  clearAll() {
    this.requests.clear();
  }
}

// Singleton instance
const rateLimiter = new RateLimiter();

/**
 * Middleware to apply rate limiting to API routes
 * @param {Request} request - Next.js request object
 * @param {number} limit - Max requests per minute (optional, default: 10)
 * @returns {object|null} - Returns response object if rate limited, null if allowed
 */
export async function checkRateLimit(request, limit = 10) {
  try {
    // Get identifier from request
    // Priority: authenticated user ID > IP address > default
    let identifier = 'anonymous';

    // Try to get user ID from Authorization header (JWT token)
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        // Decode JWT without verification (for rate limiting purposes only)
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
          if (payload.uid || payload.sub) {
            identifier = payload.uid || payload.sub;
          }
        }
      } catch (err) {
        // Fallback to IP if token parsing fails
      }
    }

    // Fallback to IP address if no auth token
    if (identifier === 'anonymous') {
      identifier = 
        request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
        request.headers.get('x-real-ip') ||
        request.ip ||
        'unknown';
    }

    // Add route info to identifier for per-endpoint rate limiting
    const url = new URL(request.url);
    const endpoint = url.pathname;
    const rateLimitKey = `${identifier}:${endpoint}`;

    // Check rate limit
    const result = rateLimiter.checkLimit(rateLimitKey, limit);

    if (!result.allowed) {
      // Return 429 Too Many Requests
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          retryAfter: result.retryAfter,
          message: `Too many requests. Please try again in ${result.retryAfter} seconds.`
        },
        {
          status: 429,
          headers: {
            'Retry-After': result.retryAfter.toString(),
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString()
          }
        }
      );
    }

    // Add rate limit info to response headers (will be set by route handler)
    return {
      allowed: true,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString()
      }
    };

  } catch (error) {
    console.error('[RATE-LIMIT] Error checking rate limit:', error);
    // On error, allow request to proceed (fail open)
    return { allowed: true, headers: {} };
  }
}

/**
 * Wrapper function to apply rate limiting to handler
 * Usage: export const GET = withRateLimit(handler, limit)
 */
export function withRateLimit(handler, limit = 10) {
  return async (request, context) => {
    const rateLimitResult = await checkRateLimit(request, limit);

    if (!rateLimitResult.allowed) {
      return rateLimitResult;
    }

    // Call the actual handler
    const response = await handler(request, context);

    // Add rate limit headers to response if it's a NextResponse
    if (response instanceof NextResponse) {
      Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
    }

    return response;
  };
}

export default rateLimiter;
