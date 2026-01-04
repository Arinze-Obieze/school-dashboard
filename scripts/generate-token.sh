#!/bin/bash

# Token Generation and Testing Script
# This script helps generate bearer tokens and test the secured endpoints

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

API_URL="${1:-http://localhost:3000}"
EMAIL="${2:-}"

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}School Dashboard - API Token Generator${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

if [ -z "$EMAIL" ]; then
  echo -e "${YELLOW}Usage: bash scripts/generate-token.sh [API_URL] [EMAIL]${NC}"
  echo ""
  echo -e "Examples:"
  echo "  bash scripts/generate-token.sh http://localhost:3000 user@example.com"
  echo "  bash scripts/generate-token.sh https://school.example.com admin@school.com"
  echo ""
  exit 1
fi

echo -e "${BLUE}Generating token for: ${GREEN}$EMAIL${NC}"
echo -e "${BLUE}API URL: ${GREEN}$API_URL${NC}"
echo ""

# Step 1: Get token
echo -e "${YELLOW}[1/3] Requesting bearer token...${NC}"
TOKEN_RESPONSE=$(curl -s -X GET "$API_URL/api/auth/get-token?email=$EMAIL" \
  -H "Content-Type: application/json")

echo "$TOKEN_RESPONSE" | jq . 2>/dev/null || echo "$TOKEN_RESPONSE"
echo ""

# Extract token from response
BEARER_TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.token' 2>/dev/null)
UID=$(echo "$TOKEN_RESPONSE" | jq -r '.uid' 2>/dev/null)
ROLE=$(echo "$TOKEN_RESPONSE" | jq -r '.role' 2>/dev/null)

if [ "$BEARER_TOKEN" = "null" ] || [ -z "$BEARER_TOKEN" ]; then
  echo -e "${RED}❌ Failed to generate token${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Token generated successfully!${NC}"
echo ""

# Display token info
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}TOKEN INFORMATION${NC}"
echo -e "${BLUE}================================================${NC}"
echo -e "Email: ${GREEN}$EMAIL${NC}"
echo -e "UID:   ${GREEN}$UID${NC}"
echo -e "Role:  ${GREEN}$ROLE${NC}"
echo ""

echo -e "${BLUE}Bearer Token (expires in 1 hour):${NC}"
echo -e "${GREEN}$BEARER_TOKEN${NC}"
echo ""

# Display usage
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}HOW TO USE THIS TOKEN${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

echo -e "${YELLOW}Option 1: cURL with Authorization Header${NC}"
echo -e "${GREEN}curl -X POST $API_URL/api/promote-superadmin \\${NC}"
echo -e "${GREEN}  -H \"Authorization: Bearer $BEARER_TOKEN\" \\${NC}"
echo -e "${GREEN}  -H \"Content-Type: application/json\" \\${NC}"
echo -e "${GREEN}  -d '{\"email\":\"newadmin@example.com\"}'${NC}"
echo ""

echo -e "${YELLOW}Option 2: JavaScript Fetch${NC}"
cat << EOF
${GREEN}const token = '$BEARER_TOKEN';
const response = await fetch('$API_URL/api/promote-superadmin', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${token}\`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'newadmin@example.com'
  })
});
const data = await response.json();
console.log(data);${NC}
EOF
echo ""

echo -e "${YELLOW}Option 3: PowerShell${NC}"
cat << EOF
${GREEN}\$token = '$BEARER_TOKEN'
\$headers = @{
    "Authorization" = "Bearer \$token"
    "Content-Type" = "application/json"
}
\$body = @{
    email = "newadmin@example.com"
} | ConvertTo-Json
\$response = Invoke-RestMethod -Uri "$API_URL/api/promote-superadmin" -Method POST -Headers \$headers -Body \$body
\$response | ConvertTo-Json${NC}
EOF
echo ""

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}NEXT STEPS${NC}"
echo -e "${BLUE}================================================${NC}"
echo "1. Copy the bearer token above"
echo "2. Use it in API requests with: Authorization: Bearer <token>"
echo "3. Token expires in 1 hour - generate a new one if needed"
echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
