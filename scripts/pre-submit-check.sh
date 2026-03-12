#!/bin/bash
# Sprint 716: Pre-submission checklist
# Run before `eas submit` to verify all requirements are met.

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

PASS=0
FAIL=0
WARN=0

check() {
  if [ "$2" = "true" ]; then
    echo -e "  ${GREEN}✓${NC} $1"
    PASS=$((PASS + 1))
  else
    echo -e "  ${RED}✗${NC} $1"
    FAIL=$((FAIL + 1))
  fi
}

warn() {
  echo -e "  ${YELLOW}⚠${NC} $1"
  WARN=$((WARN + 1))
}

echo "TopRanker Pre-Submission Checklist"
echo "=================================="
echo ""

# 1. app.json checks
echo "app.json:"
BUNDLE_ID=$(node -e "console.log(require('./app.json').expo.ios.bundleIdentifier)")
check "iOS Bundle ID: $BUNDLE_ID" "$([ "$BUNDLE_ID" = "com.topranker.app" ] && echo true || echo false)"

VERSION=$(node -e "console.log(require('./app.json').expo.version)")
check "App version: $VERSION" "$([ -n "$VERSION" ] && echo true || echo false)"

ENCRYPTION=$(node -e "console.log(require('./app.json').expo.ios.config.usesNonExemptEncryption)")
check "Encryption exemption: $ENCRYPTION" "$([ "$ENCRYPTION" = "false" ] && echo true || echo false)"

PRIVACY=$(node -e "try { console.log(require('./app.json').expo.ios.privacyManifests ? 'yes' : 'no') } catch { console.log('no') }")
check "Privacy manifest present" "$([ "$PRIVACY" = "yes" ] && echo true || echo false)"

PRIVACY_COUNT=$(node -e "try { console.log(require('./app.json').expo.ios.privacyManifests.NSPrivacyAccessedAPITypes.length) } catch { console.log(0) }")
check "Privacy API types declared: $PRIVACY_COUNT (expected 4)" "$([ "$PRIVACY_COUNT" = "4" ] && echo true || echo false)"

echo ""

# 2. eas.json checks
echo "eas.json:"
ASC_APP_ID=$(node -e "console.log(require('./eas.json').submit.production.ios.ascAppId)")
if echo "$ASC_APP_ID" | grep -q "REPLACE"; then
  check "ASC App ID configured (currently placeholder: $ASC_APP_ID)" "false"
else
  check "ASC App ID: $ASC_APP_ID" "true"
fi

APPLE_TEAM=$(node -e "console.log(require('./eas.json').submit.production.ios.appleTeamId)")
check "Apple Team ID: $APPLE_TEAM" "$([ -n "$APPLE_TEAM" ] && echo true || echo false)"

echo ""

# 3. Build checks
echo "Build & Tests:"
if npx vitest run --reporter=dot 2>&1 | tail -1 | grep -q "passed"; then
  TEST_COUNT=$(npx vitest run --reporter=dot 2>&1 | grep "Tests" | grep -o "[0-9]* passed" | head -1)
  check "Tests passing: $TEST_COUNT" "true"
else
  check "Tests passing" "false"
fi

if npm run server:build 2>&1 | grep -q "server_dist"; then
  BUILD_SIZE=$(npm run server:build 2>&1 | grep -o "[0-9.]*kb")
  check "Server build: $BUILD_SIZE" "true"
else
  check "Server build" "false"
fi

echo ""

# 4. Sprint 738: Static files checks
echo "Static Files:"
check "AASA file exists" "$([ -f public/.well-known/apple-app-site-association ] && echo true || echo false)"
AASA_TEAM=$(node -e "try { const a = require('./public/.well-known/apple-app-site-association'); console.log(a.applinks.details[0].appIDs[0].includes('RKGRR7XGWD') ? 'true' : 'false') } catch { console.log('false') }" 2>/dev/null || echo false)
check "AASA has correct Team ID" "$AASA_TEAM"
check "robots.txt exists" "$([ -f public/robots.txt ] && echo true || echo false)"
check "Store metadata config" "$([ -f config/store-metadata.ts ] && echo true || echo false)"

echo ""

# 5. Sprint 738+741-747: Security checks
echo "Security:"
LIMITER_COUNT=$(grep -c "export const.*RateLimiter\|export const.*rateLimiter" server/rate-limiter.ts 2>/dev/null || echo 0)
check "Rate limiters defined: $LIMITER_COUNT (expected 7+)" "$([ "$LIMITER_COUNT" -ge 7 ] && echo true || echo false)"

# Sprint 741: Crypto IDs
MATH_RANDOM_IDS=$(grep -r "Math.random().toString(36)" server/security-headers.ts server/rate-limit-dashboard.ts server/alerting.ts server/abuse-detection.ts 2>/dev/null | wc -l | tr -d ' ')
check "No Math.random() in server IDs" "$([ "$MATH_RANDOM_IDS" = "0" ] && echo true || echo false)"

# Sprint 742: URL centralization
check "SHARE_BASE_URL exported" "$(grep -q 'SHARE_BASE_URL' lib/sharing.ts && echo true || echo false)"
check "config.siteUrl defined" "$(grep -q 'siteUrl' server/config.ts && echo true || echo false)"

# Sprint 743: Empty catches
EMPTY_CATCHES=$(grep -r 'catch\s*{}' app/ lib/ components/ server/ 2>/dev/null | grep -v node_modules | grep -v __tests__ | wc -l | tr -d ' ')
check "No empty catch blocks: $EMPTY_CATCHES" "$([ "$EMPTY_CATCHES" = "0" ] && echo true || echo false)"

# Sprint 746: Input validation
check "isReceipt strictly validated" "$(grep -q 'rawIsReceipt === true' server/routes-rating-photos.ts && echo true || echo false)"
check "URL protocol validation" "$(grep -q 'http.*https.*protocol' server/routes-businesses.ts && echo true || echo false)"

echo ""

# 6. Documentation checks
echo "Documentation:"
check "TestFlight setup doc" "$([ -f docs/app-store/TESTFLIGHT-SETUP.md ] && echo true || echo false)"
check "App Store metadata" "$([ -f docs/app-store/APP-STORE-METADATA.md ] && echo true || echo false)"
check "App Store Connect checklist" "$([ -f docs/app-store/APP-STORE-CONNECT-CHECKLIST.md ] && echo true || echo false)"

echo ""

# Summary
echo "=================================="
echo -e "  ${GREEN}Passed: $PASS${NC}  ${RED}Failed: $FAIL${NC}  ${YELLOW}Warnings: $WARN${NC}"

if [ $FAIL -gt 0 ]; then
  echo ""
  echo -e "${RED}Fix $FAIL issue(s) before submitting.${NC}"
  exit 1
else
  echo ""
  echo -e "${GREEN}Ready for submission!${NC}"
fi
