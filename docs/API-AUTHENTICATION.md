# API Authentication Guide

## Overview

The secured API endpoints require Firebase authentication via **Bearer tokens**. This guide explains how to generate and use tokens.

## Authentication Method

All secured endpoints use Firebase Custom Tokens via the `Authorization: Bearer` header.

```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" http://localhost:3000/api/endpoint
```

## Generating Tokens

### Method 1: Using the Token Generation Endpoint (Recommended)

#### GET Request
```bash
curl -X GET "http://localhost:3000/api/auth/get-token?email=user@example.com"
```

#### POST Request
```bash
curl -X POST http://localhost:3000/api/auth/get-token \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

#### Response
```json
{
  "success": true,
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "uid": "user123",
  "email": "user@example.com",
  "role": "superadmin",
  "expiresIn": 3600,
  "usage": "Add to API requests as: Authorization: Bearer <token>"
}
```

### Method 2: Using the Helper Script

```bash
# Make script executable
chmod +x scripts/generate-token.sh

# Generate token (local development)
bash scripts/generate-token.sh http://localhost:3000 user@example.com

# Generate token (production)
bash scripts/generate-token.sh https://school.example.com admin@school.com
```

The script will output the token and show you usage examples.

## Using the Bearer Token

### Example 1: Promote User to Superadmin

```bash
# First, get the token
TOKEN=$(curl -s -X GET "http://localhost:3000/api/auth/get-token?email=currentadmin@example.com" | jq -r '.token')

# Use it to promote another user
curl -X POST http://localhost:3000/api/promote-superadmin \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newadmin@example.com"
  }'
```

### Example 2: JavaScript/Node.js

```javascript
// Get token
const tokenResponse = await fetch('http://localhost:3000/api/auth/get-token?email=admin@example.com');
const { token } = await tokenResponse.json();

// Use token to make API calls
const response = await fetch('http://localhost:3000/api/promote-superadmin', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'newadmin@example.com'
  })
});

const result = await response.json();
console.log(result);
```

### Example 3: React Component

```jsx
import { useState } from 'react';

export function PromoteAdminForm() {
  const [token, setToken] = useState(null);
  const [adminEmail, setAdminEmail] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');

  // Get token first
  const handleGetToken = async () => {
    const response = await fetch(`/api/auth/get-token?email=${adminEmail}`);
    const data = await response.json();
    setToken(data.token);
  };

  // Promote user
  const handlePromote = async () => {
    const response = await fetch('/api/promote-superadmin', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: newAdminEmail })
    });
    const result = await response.json();
    console.log(result);
  };

  return (
    <div>
      <input 
        value={adminEmail} 
        onChange={(e) => setAdminEmail(e.target.value)} 
        placeholder="Current admin email"
      />
      <button onClick={handleGetToken}>Get Token</button>
      
      {token && (
        <>
          <input 
            value={newAdminEmail} 
            onChange={(e) => setNewAdminEmail(e.target.value)} 
            placeholder="Email to promote"
          />
          <button onClick={handlePromote}>Promote to Admin</button>
        </>
      )}
    </div>
  );
}
```

## Token Details

- **Type**: Firebase Custom Token
- **Validity**: 1 hour (3600 seconds)
- **Contains**: User UID and custom claims (role)
- **Scope**: Server-side API endpoints
- **Refresh**: Generate new token when expired

## Common Errors

### 401 Unauthorized
**Cause**: Missing or invalid token

**Solution**: 
1. Verify token is included in `Authorization: Bearer` header
2. Generate a new token if expired
3. Check token format (should be JWT)

### 403 Forbidden
**Cause**: User lacks required permissions (e.g., not superadmin)

**Solution**:
1. Promote user to required role first
2. Check user's custom claims: `GET /api/auth/get-token?email=user@example.com`
3. Verify user exists and is active

### 404 Not Found
**Cause**: User email doesn't exist in Firebase

**Solution**:
1. Verify email spelling
2. Ensure user is registered in Firebase Authentication
3. Check correct Firebase project is being used

## Security Best Practices

1. **Never commit tokens** to version control
2. **Use environment variables** for storing tokens
3. **Keep tokens secret** - treat like passwords
4. **Set expiration** - tokens expire in 1 hour
5. **Use HTTPS** in production
6. **Log access** - all admin actions are logged to `admin-audit-logs`
7. **Monitor attempts** - failed authorization attempts are logged

## Audit Trail

All API access is logged to the `admin-audit-logs` Firestore collection:

```json
{
  "adminUid": "user123",
  "adminEmail": "admin@example.com",
  "actionType": "promote-superadmin",
  "targetUid": "user456",
  "targetEmail": "newadmin@example.com",
  "details": "Promoted newadmin@example.com to superadmin role",
  "status": "success",
  "timestamp": "2024-01-04T12:00:00.000Z",
  "ipAddress": "192.168.1.1"
}
```

## Testing

### Quick Test
```bash
# 1. Get token for existing superadmin
TOKEN=$(curl -s -X GET "http://localhost:3000/api/auth/get-token?email=admin@example.com" | jq -r '.token')

# 2. Use token to promote another user
curl -X POST http://localhost:3000/api/promote-superadmin \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@example.com"}'

# 3. Verify new user is superadmin
curl -s -X GET "http://localhost:3000/api/auth/get-token?email=newuser@example.com" | jq '.role'
```

## Troubleshooting

### Token not working
1. Check token hasn't expired (1 hour limit)
2. Verify user exists: `curl "http://localhost:3000/api/auth/get-token?email=USER_EMAIL"`
3. Check network: Ensure API is running on correct host/port
4. Verify Authorization header format: `Authorization: Bearer TOKEN`

### User not found
1. Verify email is correct (case-sensitive in some systems)
2. Confirm user exists in Firebase Authentication
3. Check you're using correct Firebase project

### Permission denied (403)
1. User must have superadmin role to access certain endpoints
2. Check user's role: `curl "http://localhost:3000/api/auth/get-token?email=USER_EMAIL"` → check `role` field
3. Request superadmin to promote you

## Support

For issues or questions:
1. Check `admin-audit-logs` in Firestore for action history
2. Review application logs for error details
3. Verify Firebase configuration is correct
4. Check network connectivity and API availability
