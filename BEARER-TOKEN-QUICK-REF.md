# Quick Reference - API Bearer Tokens

## 🚀 Quick Start

### Step 1: Generate a Bearer Token
```bash
# Using curl
curl "http://localhost:3000/api/auth/get-token?email=admin@example.com"

# Using the helper script
bash scripts/generate-token.sh http://localhost:3000 admin@example.com
```

### Step 2: Copy the Token
Look for the `"token"` field in the response - that's your bearer token.

### Step 3: Use in API Calls
```bash
curl -X POST http://localhost:3000/api/promote-superadmin \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"email":"newadmin@example.com"}'
```

---

## 📋 Common Commands

### Get Token (Current User)
```bash
curl "http://localhost:3000/api/auth/get-token?email=your-email@example.com"
```

### Promote User to Superadmin
```bash
# 1. Get your token (if you're already superadmin)
TOKEN=$(curl -s "http://localhost:3000/api/auth/get-token?email=admin@example.com" | jq -r '.token')

# 2. Use token to promote another user
curl -X POST http://localhost:3000/api/promote-superadmin \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"newadmin@example.com"}'
```

### Check User's Role
```bash
curl "http://localhost:3000/api/auth/get-token?email=user@example.com" | jq '.role'
```

---

## 🔐 Token Info

| Property | Value |
|----------|-------|
| **Type** | Firebase Custom Token (JWT) |
| **Validity** | 1 hour |
| **Header Format** | `Authorization: Bearer TOKEN` |
| **Storage** | Log to file/env var - never commit to git |
| **Refresh** | Generate new when expired |

---

## 💡 Tips

1. **Save to file**: `TOKEN=$(curl -s "..." | jq -r '.token') && echo $TOKEN > .bearer-token`
2. **Use in env**: Export as `export BEARER_TOKEN=$TOKEN`
3. **JavaScript**: Use in fetch: `headers: { 'Authorization': \`Bearer ${token}\` }`
4. **Postman**: Set in Headers tab as `Authorization: Bearer YOUR_TOKEN`
5. **Monitor access**: Check `admin-audit-logs` collection in Firestore

---

## ❌ Common Issues

| Error | Fix |
|-------|-----|
| 401 Unauthorized | Ensure token is in header: `Authorization: Bearer TOKEN` |
| 403 Forbidden | User must be superadmin for promote endpoint |
| 404 Not Found | User email doesn't exist in Firebase |
| Token expired | Generate a new token |

---

## 📖 Full Documentation

See `docs/API-AUTHENTICATION.md` for detailed documentation.
