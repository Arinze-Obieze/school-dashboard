/**
 * Rate Limit Configuration
 * Central configuration for all API endpoint rate limits
 */

export const RATE_LIMIT_CONFIG = {
  // Authentication endpoints (strict)
  AUTH: {
    limit: 5,
    tier: 'STRICT',
    strictMode: true,
    description: 'Login, signup, token generation'
  },

  // Payment endpoints (normal)
  PAYMENT_CREATE: {
    limit: 10,
    tier: 'NORMAL',
    strictMode: false,
    description: 'Payment creation'
  },
  
  PAYMENT_VERIFY: {
    limit: 15,
    tier: 'NORMAL',
    strictMode: false,
    description: 'Payment verification'
  },

  // File operations (normal)
  FILE_UPLOAD: {
    limit: 10,
    tier: 'NORMAL',
    strictMode: false,
    description: 'File uploads to R2'
  },

  FILE_DELETE: {
    limit: 10,
    tier: 'NORMAL',
    strictMode: false,
    description: 'File deletions from R2'
  },

  // Email sending (strict - prevent spam)
  EMAIL: {
    limit: 5,
    tier: 'STRICT',
    strictMode: true,
    description: 'Email sending'
  },

  // Registration forms (normal)
  REGISTRATION: {
    limit: 10,
    tier: 'NORMAL',
    strictMode: false,
    description: 'Registration form submissions'
  },

  // Data fetching (relaxed)
  DATA_FETCH: {
    limit: 20,
    tier: 'RELAXED',
    strictMode: false,
    description: 'General data fetching (exams, courses, etc.)'
  },

  // Admin operations (relaxed for authenticated admins)
  ADMIN: {
    limit: 30,
    tier: 'RELAXED',
    strictMode: false,
    description: 'Admin operations'
  }
};

/**
 * Get rate limit config for an endpoint
 * @param {string} configKey - Key from RATE_LIMIT_CONFIG
 * @returns {object} Rate limit configuration
 */
export function getRateLimitConfig(configKey) {
  return RATE_LIMIT_CONFIG[configKey] || {
    limit: 10,
    tier: 'NORMAL',
    strictMode: false,
    description: 'Default rate limit'
  };
}

/**
 * Apply rate limit with config
 * Usage in API routes:
 * 
 * import { checkRateLimit } from '@/lib/rateLimit';
 * import { getRateLimitConfig } from '@/lib/rateLimitConfig';
 * 
 * const config = getRateLimitConfig('PAYMENT_VERIFY');
 * const rateLimitResult = await checkRateLimit(req, config.limit, {
 *   tier: config.tier,
 *   strictMode: config.strictMode
 * });
 */
