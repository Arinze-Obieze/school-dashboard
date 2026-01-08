# Enhanced Rate Limiting System

## Overview

The enhanced rate limiting system provides multi-layer protection against DDoS attacks, brute force attempts, and API abuse. It addresses the weaknesses of the previous in-memory-only implementation.

## Key Improvements

### 1. **Hybrid Storage Architecture**
- **In-Memory Cache**: Fast path for immediate rate limit checks
- **Firestore Persistence**: Survives serverless cold starts and works across multiple instances
- **Automatic Sync**: Cache updates are persisted to Firestore asynchronously

### 2. **Exponential Backoff**
Repeated violations trigger increasingly longer penalties:
- 1st violation: 60 seconds
- 2nd violation: 120 seconds (2 minutes)
- 3rd violation: 240 seconds (4 minutes)
- 4th violation: 480 seconds (8 minutes)
- Maximum: 3600 seconds (1 hour)

### 3. **Enhanced Client Fingerprinting**
Multiple headers checked for IP detection:
- `cf-connecting-ip` (Cloudflare)
- `x-real-ip`
- `x-forwarded-for`
- `x-client-ip`
- User Agent hash (first 50 chars)

### 4. **Three-Tier Rate Limiting**

#### STRICT Tier
- 5 requests per minute
- 2x backoff multiplier
- Use for: Authentication, email sending

#### NORMAL Tier
- 10 requests per minute
- 1.5x backoff multiplier
- Use for: Payments, file operations, registrations

#### RELAXED Tier
- 20 requests per minute
- 1.2x backoff multiplier
- Use for: Data fetching, admin operations

### 5. **Per-Endpoint Rate Limiting**
Each API endpoint has its own rate limit counter, preventing one endpoint from affecting others.

### 6. **Violation Tracking**
All rate limit violations are logged to Firestore with:
- Identifier (IP or user ID)
- Endpoint
- Reason (limit_exceeded, penalty_active)
- Violation count
- Timestamp

## Usage

### Basic Usage in API Routes

```javascript
import { checkRateLimit } from '@/lib/rateLimit';

async function POST(req) {
  // Simple rate limiting (10 requests/min)
  const rateLimitResult = await checkRateLimit(req, 10);
  
  if (!rateLimitResult.allowed) {
    return rateLimitResult; // Returns 429 response
  }
  
  // Your API logic here...
}
```

### Using Configuration Presets

```javascript
import { checkRateLimit } from '@/lib/rateLimit';
import { getRateLimitConfig } from '@/lib/rateLimitConfig';

async function POST(req) {
  const config = getRateLimitConfig('PAYMENT_VERIFY');
  
  const rateLimitResult = await checkRateLimit(req, config.limit, {
    tier: config.tier,
    strictMode: config.strictMode
  });
  
  if (!rateLimitResult.allowed) {
    return rateLimitResult;
  }
  
  // Your API logic here...
}
```

### Using withRateLimit Wrapper

```javascript
import { withRateLimit } from '@/lib/rateLimit';

async function handler(req) {
  // Your API logic here...
}

export const POST = withRateLimit(handler, 10, { tier: 'NORMAL' });
```

### Strict Mode for Anonymous Users

```javascript
const rateLimitResult = await checkRateLimit(req, 10, {
  tier: 'NORMAL',
  strictMode: true  // Anonymous users get 50% of the limit
});
```

## Configuration

### Rate Limit Tiers

Edit `lib/rateLimit.js` to modify tier settings:

```javascript
const RATE_LIMIT_TIERS = {
  STRICT: { requests: 5, windowMs: 60000, backoffMultiplier: 2 },
  NORMAL: { requests: 10, windowMs: 60000, backoffMultiplier: 1.5 },
  RELAXED: { requests: 20, windowMs: 60000, backoffMultiplier: 1.2 },
};
```

### Per-Endpoint Configuration

Edit `lib/rateLimitConfig.js` to add or modify endpoint configurations:

```javascript
export const RATE_LIMIT_CONFIG = {
  MY_ENDPOINT: {
    limit: 15,
    tier: 'NORMAL',
    strictMode: false,
    description: 'My custom endpoint'
  }
};
```

### Environment Variables

```bash
# Disable Firestore persistence (use memory-only)
USE_PERSISTENT_RATE_LIMIT=false
```

## Admin Management

### Get Violation Statistics

```bash
GET /api/admin/rate-limits?limit=100
Authorization: Bearer <superadmin-token>
```

Response:
```json
{
  "success": true,
  "violations": [...],
  "stats": {
    "totalViolations": 42,
    "uniqueIdentifiers": 12,
    "violationsByEndpoint": {
      "/api/payments/create": 15,
      "/api/verify-payment": 27
    },
    "violationsByReason": {
      "limit_exceeded": 30,
      "penalty_active": 12
    }
  }
}
```

### Reset Rate Limit for Specific User/IP

```bash
POST /api/admin/rate-limits
Authorization: Bearer <superadmin-token>
Content-Type: application/json

{
  "action": "reset",
  "identifier": "user:abc123",
  "endpoint": "/api/payments/create"
}
```

### Clear All Rate Limits

```bash
POST /api/admin/rate-limits
Authorization: Bearer <superadmin-token>
Content-Type: application/json

{
  "action": "clearAll"
}
```

### Delete Old Violation Logs

```bash
DELETE /api/admin/rate-limits?daysOld=30
Authorization: Bearer <superadmin-token>
```

## Response Headers

All API responses include rate limit headers:

```
X-RateLimit-Limit: 10          # Max requests per window
X-RateLimit-Remaining: 7       # Requests remaining
X-RateLimit-Reset: 1704751200  # Unix timestamp when limit resets
X-RateLimit-Policy: NORMAL     # Active tier
```

## 429 Response Format

```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 120,
  "message": "Access temporarily restricted due to repeated violations. Please wait 120 seconds.",
  "violations": 3,
  "reason": "penalty_active"
}
```

## Security Considerations

### Preventing Bypass

1. **Multiple IP Sources**: Checks CF, X-Real-IP, X-Forwarded-For
2. **User Agent Fingerprinting**: Adds UA hash to identifier
3. **Per-Endpoint Limits**: Can't exhaust one endpoint and use another
4. **Exponential Backoff**: Makes brute force attacks impractical
5. **Firestore Persistence**: Survives serverless restarts

### Privacy

- User Agent is hashed and truncated (first 50 chars only)
- No PII is stored in identifiers
- Violation logs can be purged automatically

### Performance

- **Memory Cache**: <1ms lookup time
- **Firestore Updates**: Async (non-blocking)
- **Automatic Cleanup**: Prevents memory leaks
- **Max Cache Size**: 10,000 entries (configurable)

## Migration from Old System

The new system is **backward compatible**. Existing code using `checkRateLimit(req, limit)` will continue to work with enhanced features automatically enabled.

### Optional Updates

For better control, update endpoints to use configuration presets:

```javascript
// Before
const rateLimitResult = await checkRateLimit(req, 10);

// After (recommended)
const config = getRateLimitConfig('PAYMENT_VERIFY');
const rateLimitResult = await checkRateLimit(req, config.limit, {
  tier: config.tier,
  strictMode: config.strictMode
});
```

## Monitoring

### Firestore Collections

1. **rate-limits**: Current rate limit state
   - Auto-expires based on TTL
   - Contains request timestamps and violation counts

2. **rate-limit-violations**: Violation audit log
   - Permanent records (unless manually deleted)
   - Used for security analysis

### Recommended Monitoring

1. Query violations collection daily for abuse patterns
2. Set up alerts for high violation counts
3. Review violation statistics weekly
4. Purge old violations monthly

## Testing

### Test Rate Limiting

```javascript
// Make multiple requests rapidly
for (let i = 0; i < 15; i++) {
  const response = await fetch('/api/your-endpoint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ test: true })
  });
  console.log(response.status, response.headers.get('X-RateLimit-Remaining'));
}
```

### Reset During Testing

Use admin endpoint to reset rate limits during development:

```bash
curl -X POST http://localhost:3000/api/admin/rate-limits \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"clearAll"}'
```

## Performance Benchmarks

- **Memory Cache Hit**: ~0.5ms
- **Firestore Read** (cache miss): ~50-100ms
- **Firestore Write** (async): Non-blocking
- **Memory Usage**: ~100 bytes per active identifier

## Troubleshooting

### Rate Limits Not Persisting

Check environment variable:
```bash
USE_PERSISTENT_RATE_LIMIT=true
```

### High Memory Usage

Reduce max cache size in `lib/rateLimit.js`:
```javascript
this.maxSize = 5000; // Default: 10000
```

### Firestore Errors

Rate limiting will continue working with in-memory cache even if Firestore fails. Check Firestore security rules are properly configured.

## Best Practices

1. ✅ Use configuration presets for consistency
2. ✅ Enable strict mode for authentication endpoints
3. ✅ Monitor violation logs regularly
4. ✅ Purge old violations monthly
5. ✅ Use relaxed tier for admin operations
6. ✅ Test rate limiting in staging environment
7. ✅ Document rate limits in API documentation
8. ✅ Set up alerts for unusual violation patterns
