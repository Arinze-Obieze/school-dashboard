# Rate Limiting Implementation Guide

## Overview

Rate limiting has been implemented across all public API routes to prevent abuse, DoS attacks, and ensure fair resource usage.

## Architecture

### Rate Limiter Implementation: `/lib/rateLimit.js`

The rate limiter uses a **sliding window algorithm** with in-memory storage, optimized for Next.js serverless environments.

**Key Features:**
- **Sliding Window Algorithm**: Tracks requests within a 1-minute window
- **Per-User & Per-IP Identification**: Prioritizes authenticated user ID > IP address
- **Per-Endpoint Limits**: Each endpoint can have custom rate limits
- **Automatic Cleanup**: Removes expired entries every 5 minutes to prevent memory leaks
- **Standard Headers**: Returns RFC-compliant rate limit headers

**Functions:**
- `checkRateLimit(request, limit)` - Check if request is within limit
- `withRateLimit(handler, limit)` - Wrapper function for routes (alternative approach)

### Rate Limit Configuration

Each API route has its own configurable limit (requests per minute):

| Endpoint | Limit | Purpose |
|----------|-------|---------|
| `/api/exams` | 15 | Fetching exam data |
| `/api/payments/user` | 20 | Fetching payment history |
| `/api/payments/create` | 10 | Creating payment records |
| `/api/verify-payment` | 15 | Verifying payments with Flutterwave |
| `/api/send-email` | 5 | Sending emails (most restrictive) |
| `/api/delete-r2` | 10 | Deleting files from R2 |
| `/api/upload-r2` | 10 | Uploading profile photos |
| `/api/save-*-registration` | 10 | Saving registration forms |
| `/api/upload-*-files` | 10 | Uploading registration files |
| `/api/get-*-registration` | 20 | Fetching registration data |
| `/api/auth/get-token` | 10 | Generating test tokens |

## Implementation Details

### How It Works

1. **Request Arrives** at API endpoint
2. **Rate Limiter Extracts Identifier**:
   - Decodes JWT from Authorization header (if present)
   - Falls back to IP address (x-forwarded-for, x-real-ip, or request.ip)
   - Creates key: `{identifier}:{endpoint}`
3. **Sliding Window Check**:
   - Retrieves all timestamps within the last 60 seconds
   - Counts requests within window
   - Compares against limit
4. **Response**:
   - **Allowed**: Request proceeds, rate limit headers added
   - **Denied**: Returns `429 Too Many Requests` with `Retry-After` header

### Response Headers

When a request is allowed:
```
X-RateLimit-Limit: 15          # Maximum requests allowed
X-RateLimit-Remaining: 12      # Requests remaining in this window
X-RateLimit-Reset: 1704950320  # Unix timestamp when window resets
```

When rate limited (429 response):
```
Retry-After: 42                # Seconds to wait before retrying
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1704950320
```

### Example Usage

```javascript
// In any API route
import { checkRateLimit } from '@/lib/rateLimit';
import { NextResponse } from 'next/server';

const RATE_LIMIT = 15; // requests per minute

async function GET(req) {
  // Apply rate limiting at start of handler
  const rateLimitResult = await checkRateLimit(req, RATE_LIMIT);
  if (!rateLimitResult.allowed) {
    return rateLimitResult; // Returns 429 response
  }

  // Your route logic here
  const response = NextResponse.json({ data: 'success' });
  
  // Add rate limit headers to response
  Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

export { GET };
```

## Client-Side Handling

### JavaScript Fetch Example

```javascript
async function fetchWithRateLimit(url, options = {}) {
  const response = await fetch(url, options);
  
  if (response.status === 429) {
    const retryAfter = parseInt(response.headers.get('Retry-After')) || 60;
    console.warn(`Rate limited. Retry after ${retryAfter} seconds`);
    
    // Implement exponential backoff
    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
    return fetchWithRateLimit(url, options); // Retry
  }
  
  // Log rate limit info
  const remaining = response.headers.get('X-RateLimit-Remaining');
  if (remaining) {
    console.log(`Remaining requests: ${remaining}`);
  }
  
  return response;
}

// Usage
const exams = await fetchWithRateLimit('/api/exams?studentId=123');
```

### React Hook Example

```javascript
import { useState, useCallback } from 'react';

function useRateLimitedFetch() {
  const [rateLimitInfo, setRateLimitInfo] = useState(null);
  const [isRateLimited, setIsRateLimited] = useState(false);

  const fetch = useCallback(async (url, options = {}) => {
    try {
      const response = await fetch(url, options);
      
      // Update rate limit info
      const remaining = response.headers.get('X-RateLimit-Remaining');
      const limit = response.headers.get('X-RateLimit-Limit');
      const reset = response.headers.get('X-RateLimit-Reset');
      
      setRateLimitInfo({
        remaining: parseInt(remaining),
        limit: parseInt(limit),
        reset: parseInt(reset) * 1000
      });
      
      if (response.status === 429) {
        setIsRateLimited(true);
        const retryAfter = parseInt(response.headers.get('Retry-After')) || 60;
        
        // Show user notification
        toast.warning(`Please wait ${retryAfter} seconds before trying again`, {
          autoClose: retryAfter * 1000
        });
        
        // Auto-retry after delay
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        return fetch(url, options);
      }
      
      setIsRateLimited(false);
      return response;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }, []);

  return { fetch, rateLimitInfo, isRateLimited };
}
```

## Production Considerations

### Current Implementation (In-Memory)

**Pros:**
- No external dependencies
- Fast (memory-based)
- Works with serverless cold starts

**Cons:**
- Resets on deployment
- Not shared across multiple server instances
- Limited to single server memory

### For Production at Scale

For production systems with multiple instances, consider migrating to **Redis-based rate limiting**:

```javascript
// Example using Upstash Redis (serverless Redis)
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export async function checkRateLimitRedis(request, limit = 10) {
  const identifier = extractIdentifier(request);
  const key = `rate-limit:${identifier}`;
  
  const current = await redis.incr(key);
  
  if (current === 1) {
    // First request in this window, set expiration
    await redis.expire(key, 60);
  }
  
  if (current > limit) {
    return {
      allowed: false,
      status: 429,
      retryAfter: await redis.ttl(key)
    };
  }
  
  return { allowed: true };
}
```

**Redis Benefits:**
- Shared across all server instances
- Persistent across deployments
- Better for distributed systems
- Can handle millions of requests

## Monitoring & Alerting

### Logging Rate Limit Events

To monitor abuse patterns, add logging:

```javascript
// In checkRateLimit function
if (!result.allowed) {
  console.warn('[RATE-LIMIT] Exceeded', {
    identifier,
    endpoint,
    timestamp: new Date().toISOString(),
    requests: validTimestamps.length,
    limit
  });
  
  // Optional: Send to monitoring service
  // await logToMonitoring({ event: 'rate_limit_exceeded', ... });
}
```

### Alert Triggers

Consider alerting when:
- Single IP exceeds limit more than 3 times in 10 minutes
- Specific endpoint receives >1000 requests from unknown IPs in 1 hour
- Authentication token spam detected (many failures from same token)

## Testing

### Test Rate Limiting Locally

```bash
# Get token first
curl -X POST http://localhost:3000/api/auth/get-token \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'

# Extract token from response
TOKEN="eyJhbGc..."

# Make requests until rate limited
for i in {1..20}; do
  curl -H "Authorization: Bearer $TOKEN" \
    "http://localhost:3000/api/exams?studentId=123"
  echo "\n[$i] $(date)"
  sleep 0.5
done

# Should see 429 response after 15 requests (configured limit)
```

### Unit Tests Example

```javascript
import { checkRateLimit } from '@/lib/rateLimit';

describe('Rate Limiting', () => {
  test('allows requests within limit', async () => {
    const req = new Request('http://localhost/api/test');
    const result = await checkRateLimit(req, 5);
    expect(result.allowed).toBe(true);
  });

  test('blocks requests exceeding limit', async () => {
    const req = new Request('http://localhost/api/test', {
      headers: { 'x-forwarded-for': '192.168.1.1' }
    });
    
    // Make 5 requests (at limit)
    for (let i = 0; i < 5; i++) {
      await checkRateLimit(req, 5);
    }
    
    // 6th request should be blocked
    const result = await checkRateLimit(req, 5);
    expect(result.allowed).toBe(false);
    expect(result.status).toBe(429);
  });

  test('extracts user ID from JWT', async () => {
    // Test that authenticated users get per-user limits
    // not IP-based limits
  });
});
```

## Troubleshooting

### "Rate limited immediately"

**Cause:** Often happens when testing without proper identification
- **Fix:** Ensure Authorization header with valid token is being sent
- **Alternative:** Check X-Forwarded-For header if behind proxy

### "Rate limit counter not resetting"

**Cause:** In-memory storage not cleaned up between deployments
- **Fix:** Rate limits automatically reset per deployment cycle
- **For persistent data:** Implement Redis persistence

### "Different limits per user not working"

**Cause:** Users not properly identified (falling back to IP)
- **Fix:** Verify JWT is present in Authorization header
- **Debug:** Add console logs in `checkRateLimit` to see identifier extraction

## Summary

✅ **Implemented:** Rate limiting across all 15+ public API routes
✅ **Protection:** Prevents DoS, spam, and brute force attacks  
✅ **User Experience:** Clear error messages and retry-after headers
✅ **Performance:** In-memory, zero external dependencies
⚠️ **Limitation:** Single-instance (suitable for current scale)
📈 **Future:** Consider Redis-based solution as load increases
