import { NextResponse } from 'next/server';
import { adminDb } from '@/firebaseAdmin';

/**
 * Enhanced Rate Limiter with Multi-Layer Protection
 * 
 * IMPROVEMENTS OVER PREVIOUS VERSION:
 * 1. Hybrid storage: In-memory + Firestore for persistence across serverless instances
 * 2. IP-based fingerprinting with multiple headers
 * 3. Exponential backoff for repeated violations
 * 4. Per-user and per-IP rate limiting
 * 5. Configurable strictness levels
 * 6. Memory-efficient with TTL-based cleanup
 */

const RATE_LIMIT_COLLECTION = 'rate-limits';
const VIOLATIONS_COLLECTION = 'rate-limit-violations';

// Rate limit tiers
const RATE_LIMIT_TIERS = {
  STRICT: { requests: 5, windowMs: 60000, backoffMultiplier: 2 },
  NORMAL: { requests: 10, windowMs: 60000, backoffMultiplier: 1.5 },
  RELAXED: { requests: 20, windowMs: 60000, backoffMultiplier: 1.2 },
};

/**
 * Enhanced in-memory cache with TTL
 */
class MemoryCache {
  constructor() {
    this.cache = new Map();
    this.maxSize = 10000; // Prevent memory exhaustion
  }

  set(key, value, ttl = 60000) {
    // Evict oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      expires: Date.now() + ttl
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if expired
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  delete(key) {
    this.cache.delete(key);
  }

  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * Enhanced Rate Limiter
 */
class RateLimiter {
  constructor() {
    this.memoryCache = new MemoryCache();
    this.windowMs = 60 * 1000; // 1 minute
    this.useFirestore = process.env.USE_PERSISTENT_RATE_LIMIT !== 'false';
    
    // Cleanup every 2 minutes
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.memoryCache.cleanup(), 2 * 60 * 1000);
    }
  }

  /**
   * Get rate limit configuration based on tier
   */
  getTierConfig(tier = 'NORMAL') {
    return RATE_LIMIT_TIERS[tier] || RATE_LIMIT_TIERS.NORMAL;
  }

  /**
   * Calculate exponential backoff based on violations
   */
  calculateBackoff(violations, baseBackoff = 60) {
    if (violations === 0) return 0;
    return Math.min(baseBackoff * Math.pow(2, violations - 1), 3600); // Max 1 hour
  }

  /**
   * Check rate limit with multi-layer protection
   */
  async checkLimit(identifier, options = {}) {
    const {
      limit = 10,
      windowMs = this.windowMs,
      tier = 'NORMAL',
      endpoint = 'unknown'
    } = options;

    const tierConfig = this.getTierConfig(tier);
    const effectiveLimit = limit || tierConfig.requests;
    const effectiveWindow = windowMs || tierConfig.windowMs;
    
    const now = Date.now();
    const windowStart = now - effectiveWindow;
    const cacheKey = `${identifier}:${endpoint}`;

    try {
      // 1. Check memory cache first (fast path)
      let rateLimitData = this.memoryCache.get(cacheKey);

      // 2. If not in cache and Firestore enabled, check Firestore
      if (!rateLimitData && this.useFirestore) {
        try {
          const doc = await adminDb
            .collection(RATE_LIMIT_COLLECTION)
            .doc(cacheKey)
            .get();

          if (doc.exists) {
            const data = doc.data();
            // Only use if not expired
            if (data.expiresAt > now) {
              rateLimitData = {
                requests: data.requests || [],
                violations: data.violations || 0,
                lastViolation: data.lastViolation || 0
              };
            }
          }
        } catch (firestoreError) {
          // Firestore error - continue with in-memory only
          console.error('[RATE-LIMIT] Firestore error:', firestoreError.message);
        }
      }

      // 3. Initialize if no data found
      if (!rateLimitData) {
        rateLimitData = {
          requests: [],
          violations: 0,
          lastViolation: 0
        };
      }

      // 4. Filter valid requests within window
      const validRequests = rateLimitData.requests.filter(ts => ts > windowStart);

      // 5. Check for active penalty (exponential backoff)
      const penaltyDuration = this.calculateBackoff(rateLimitData.violations);
      const isPenalized = rateLimitData.lastViolation && 
                         (now - rateLimitData.lastViolation) < (penaltyDuration * 1000);

      if (isPenalized) {
        const remainingPenalty = Math.ceil(
          (penaltyDuration * 1000 - (now - rateLimitData.lastViolation)) / 1000
        );
        
        // Log violation to Firestore (fire-and-forget)
        this.logViolation(identifier, endpoint, 'PENALTY_ACTIVE', rateLimitData.violations);

        return {
          allowed: false,
          remaining: 0,
          resetTime: rateLimitData.lastViolation + (penaltyDuration * 1000),
          retryAfter: remainingPenalty,
          reason: 'penalty_active',
          violations: rateLimitData.violations
        };
      }

      // 6. Check if limit exceeded
      const allowed = validRequests.length < effectiveLimit;

      if (allowed) {
        // Add new request
        validRequests.push(now);
        rateLimitData.requests = validRequests;

        // Update cache
        this.memoryCache.set(cacheKey, rateLimitData, effectiveWindow);

        // Update Firestore (fire-and-forget)
        if (this.useFirestore) {
          this.updateFirestore(cacheKey, rateLimitData, now + effectiveWindow)
            .catch(() => {}); // Ignore errors
        }

        const resetTime = validRequests[0] + effectiveWindow;
        return {
          allowed: true,
          remaining: effectiveLimit - validRequests.length,
          resetTime,
          retryAfter: 0,
          violations: rateLimitData.violations
        };
      } else {
        // Rate limit exceeded - increment violations
        rateLimitData.violations += 1;
        rateLimitData.lastViolation = now;

        // Update cache and Firestore
        this.memoryCache.set(cacheKey, rateLimitData, effectiveWindow);
        
        if (this.useFirestore) {
          this.updateFirestore(cacheKey, rateLimitData, now + effectiveWindow)
            .catch(() => {});
          
          // Log violation
          this.logViolation(identifier, endpoint, 'LIMIT_EXCEEDED', rateLimitData.violations);
        }

        const penalty = this.calculateBackoff(rateLimitData.violations);
        return {
          allowed: false,
          remaining: 0,
          resetTime: now + (penalty * 1000),
          retryAfter: penalty,
          reason: 'limit_exceeded',
          violations: rateLimitData.violations
        };
      }
    } catch (error) {
      console.error('[RATE-LIMIT] Error in checkLimit:', error);
      // Fail open - allow request if error occurs
      return {
        allowed: true,
        remaining: effectiveLimit,
        resetTime: now + effectiveWindow,
        retryAfter: 0,
        violations: 0
      };
    }
  }

  /**
   * Update Firestore with rate limit data
   */
  async updateFirestore(key, data, expiresAt) {
    try {
      await adminDb.collection(RATE_LIMIT_COLLECTION).doc(key).set({
        requests: data.requests,
        violations: data.violations,
        lastViolation: data.lastViolation,
        expiresAt,
        updatedAt: Date.now()
      }, { merge: true });
    } catch (error) {
      // Silently fail - in-memory rate limiting still works
    }
  }

  /**
   * Log rate limit violation
   */
  async logViolation(identifier, endpoint, reason, violationCount) {
    try {
      await adminDb.collection(VIOLATIONS_COLLECTION).add({
        identifier,
        endpoint,
        reason,
        violationCount,
        timestamp: Date.now(),
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      // Silently fail
    }
  }

  /**
   * Reset rate limit for a specific key
   */
  async resetKey(identifier, endpoint = '') {
    const cacheKey = endpoint ? `${identifier}:${endpoint}` : identifier;
    this.memoryCache.delete(cacheKey);
    
    if (this.useFirestore) {
      try {
        await adminDb.collection(RATE_LIMIT_COLLECTION).doc(cacheKey).delete();
      } catch (error) {
        // Ignore
      }
    }
  }

  /**
   * Clear all rate limit data (admin only)
   */
  clearAll() {
    this.memoryCache.cache.clear();
  }
}

// Singleton instance
const rateLimiter = new RateLimiter();

/**
 * Extract comprehensive client fingerprint
 */
function extractClientFingerprint(request) {
  // Try multiple sources for IP
  const ip = 
    request.headers.get('cf-connecting-ip') || // Cloudflare
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-client-ip') ||
    request.ip ||
    'unknown';

  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  // Create a more unique fingerprint (but still privacy-respecting)
  // Don't use full UA string to avoid PII
  const uaHash = userAgent.substring(0, 50).replace(/\s+/g, '_');
  
  return `${ip}:${uaHash}`;
}

/**
 * Middleware to apply enhanced rate limiting to API routes
 * @param {Request} request - Next.js request object
 * @param {number} limit - Max requests per minute (optional, default: 10)
 * @param {object} options - Additional options
 * @returns {object} - Returns response object if rate limited, or allowed status
 */
export async function checkRateLimit(request, limit = 10, options = {}) {
  try {
    const { tier = 'NORMAL', strictMode = false } = options;
    
    // Get identifier from request
    // Priority: authenticated user ID > Client fingerprint (IP + UA)
    let identifier = 'anonymous';
    let isAuthenticated = false;

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
            identifier = `user:${payload.uid || payload.sub}`;
            isAuthenticated = true;
          }
        }
      } catch (err) {
        // Fallback to fingerprint if token parsing fails
      }
    }

    // Fallback to client fingerprint if no auth token
    if (!isAuthenticated) {
      const fingerprint = extractClientFingerprint(request);
      identifier = `anon:${fingerprint}`;
      
      // In strict mode, apply more restrictive limits to anonymous users
      if (strictMode) {
        limit = Math.floor(limit * 0.5); // 50% of authenticated limit
      }
    }

    // Get endpoint for per-route rate limiting
    const url = new URL(request.url);
    const endpoint = url.pathname;

    // Check rate limit with enhanced options
    const result = await rateLimiter.checkLimit(identifier, {
      limit,
      tier,
      endpoint
    });

    if (!result.allowed) {
      // Determine if this is a serious violation
      const isSeriousViolation = result.violations >= 3;
      
      // Return 429 Too Many Requests with appropriate messaging
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          retryAfter: result.retryAfter,
          message: isSeriousViolation
            ? `Access temporarily restricted due to repeated violations. Please wait ${result.retryAfter} seconds.`
            : `Too many requests. Please try again in ${result.retryAfter} seconds.`,
          violations: result.violations,
          reason: result.reason
        },
        {
          status: 429,
          headers: {
            'Retry-After': result.retryAfter.toString(),
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
            'X-RateLimit-Policy': tier
          }
        }
      );
    }

    // Add rate limit info to response headers
    return {
      allowed: true,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
        'X-RateLimit-Policy': tier
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
 * Usage: export const GET = withRateLimit(handler, limit, options)
 */
export function withRateLimit(handler, limit = 10, options = {}) {
  return async (request, context) => {
    const rateLimitResult = await checkRateLimit(request, limit, options);

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

/**
 * Admin function to reset rate limits
 * Should only be called by admin endpoints with proper authentication
 */
export async function adminResetRateLimit(identifier, endpoint) {
  return await rateLimiter.resetKey(identifier, endpoint);
}

/**
 * Admin function to clear all rate limits
 * Should only be called by admin endpoints with proper authentication
 */
export function adminClearAllRateLimits() {
  rateLimiter.clearAll();
}

export default rateLimiter;
