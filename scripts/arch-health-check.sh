#!/usr/bin/env bash
# TopRanker Architectural Health Check
# Replaces manual recurring audit findings with automated checks.
# Exit code: 0 if no FAIL, 1 if any FAIL.

set -euo pipefail

cd "$(dirname "$0")/.."
PROJECT_ROOT="$(pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

PASS_COUNT=0
WARN_COUNT=0
FAIL_COUNT=0

pass()  { ((PASS_COUNT++)); }
warn()  { ((WARN_COUNT++)); }
fail()  { ((FAIL_COUNT++)); }

TODAY=$(date +%Y-%m-%d)

# Header
echo ""
echo -e "${CYAN}${BOLD}"
cat <<'BANNER'
+==========================================+
|  TopRanker Architectural Health Check    |
+==========================================+
BANNER
echo -e "  Date: ${TODAY}"
echo -e "+==========================================+${RESET}"
echo ""

# ── 1. FILE SIZE LIMITS ─────────────────────────────────────────────────────

echo -e "${BOLD}FILE SIZES${RESET}"

FILES_TO_CHECK=(
  "app/(tabs)/profile.tsx"
  "app/(tabs)/challenger.tsx"
  "app/(tabs)/search.tsx"
  "app/(tabs)/index.tsx"
  "app/business/[id].tsx"
  "app/rate/[id].tsx"
  "server/routes.ts"
  "server/routes-admin.ts"
  "lib/badges.ts"
  "lib/data.ts"
)

for f in "${FILES_TO_CHECK[@]}"; do
  filepath="${PROJECT_ROOT}/${f}"
  if [[ ! -f "$filepath" ]]; then
    echo -e "  ${YELLOW}--  SKIP${RESET}  ${f}  (file not found)"
    continue
  fi
  loc=$(wc -l < "$filepath" | tr -d ' ')
  if (( loc >= 1000 )); then
    echo -e "  ${RED}FAIL${RESET}  ${f}  ${loc} LOC"
    fail
  elif (( loc >= 800 )); then
    echo -e "  ${YELLOW}WARN${RESET}  ${f}  ${loc} LOC"
    warn
  else
    echo -e "  ${GREEN}PASS${RESET}  ${f}  ${loc} LOC"
    pass
  fi
done

echo ""

# ── 2. TYPE CAST COUNT ──────────────────────────────────────────────────────

echo -e "${BOLD}TYPE CASTS${RESET}"

AS_ANY_COUNT=$(grep -r "as any" --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules \
  "$PROJECT_ROOT" 2>/dev/null \
  | grep -v '\.test\.' \
  | grep -v '__tests__' \
  | wc -l | tr -d ' ')

if (( AS_ANY_COUNT >= 30 )); then
  echo -e "  ${RED}FAIL${RESET}  ${AS_ANY_COUNT} \`as any\` casts found (threshold: 20)"
  fail
elif (( AS_ANY_COUNT >= 20 )); then
  echo -e "  ${YELLOW}WARN${RESET}  ${AS_ANY_COUNT} \`as any\` casts found (threshold: 20)"
  warn
else
  echo -e "  ${GREEN}PASS${RESET}  ${AS_ANY_COUNT} \`as any\` casts found (threshold: 20)"
  pass
fi

echo ""

# ── 3. @types IN PRODUCTION DEPENDENCIES ────────────────────────────────────

echo -e "${BOLD}DEPENDENCIES${RESET}"

PKG_JSON="${PROJECT_ROOT}/package.json"
if [[ -f "$PKG_JSON" ]]; then
  # Extract keys from "dependencies" block only (not devDependencies).
  # Uses node if available, falls back to grep heuristic.
  if command -v node &>/dev/null; then
    TYPES_IN_PROD=$(node -e "
      const pkg = require('${PKG_JSON}');
      const deps = Object.keys(pkg.dependencies || {}).filter(d => d.startsWith('@types/'));
      if (deps.length) console.log(deps.join(', '));
    " 2>/dev/null || true)
  else
    # Fallback: rough grep between "dependencies" and next top-level key
    TYPES_IN_PROD=$(sed -n '/"dependencies"/,/^\s*}/p' "$PKG_JSON" \
      | grep '@types/' \
      | sed 's/.*"\(@types\/[^"]*\)".*/\1/' \
      | tr '\n' ', ' | sed 's/,$//')
  fi

  if [[ -z "$TYPES_IN_PROD" ]]; then
    echo -e "  ${GREEN}PASS${RESET}  No @types in production dependencies"
    pass
  else
    echo -e "  ${RED}FAIL${RESET}  @types in production dependencies: ${TYPES_IN_PROD}"
    fail
  fi
else
  echo -e "  ${YELLOW}SKIP${RESET}  package.json not found"
fi

echo ""

# ── 4. TEST COUNT MINIMUM ───────────────────────────────────────────────────

echo -e "${BOLD}TESTS${RESET}"

# Try to get test count from vitest/jest JSON reporter, fall back to parsing text output.
TEST_OUTPUT=""
TEST_TOTAL=0
TEST_FILES=0

if [[ -f "${PROJECT_ROOT}/node_modules/.bin/vitest" ]]; then
  TEST_OUTPUT=$(npx vitest run --reporter=verbose 2>&1 || true)
elif [[ -f "${PROJECT_ROOT}/node_modules/.bin/jest" ]]; then
  TEST_OUTPUT=$(npx jest --verbose 2>&1 || true)
else
  TEST_OUTPUT=$(npm test 2>&1 || true)
fi

# Parse "Tests  X passed" or "X passed" or "Test Suites: X passed"
TEST_TOTAL=$(echo "$TEST_OUTPUT" | grep -iE '(tests?|passed)' | grep -oE '[0-9]+ passed' | head -1 | grep -oE '[0-9]+' || echo "0")
TEST_FILES=$(echo "$TEST_OUTPUT" | grep -iE 'test (suites|files)' | grep -oE '[0-9]+ passed' | head -1 | grep -oE '[0-9]+' || echo "0")

# Fallback: count individual test lines (lines starting with checkmark or "PASS")
if (( TEST_TOTAL == 0 )); then
  TEST_TOTAL=$(echo "$TEST_OUTPUT" | grep -cE '^\s*(✓|✔|√|PASS|pass)' || echo "0")
fi

if (( TEST_TOTAL >= 1500 )); then
  echo -e "  ${GREEN}PASS${RESET}  ${TEST_TOTAL} tests across ${TEST_FILES} files"
  pass
elif (( TEST_TOTAL >= 1000 )); then
  echo -e "  ${YELLOW}WARN${RESET}  ${TEST_TOTAL} tests across ${TEST_FILES} files (target: 1500)"
  warn
else
  echo -e "  ${RED}FAIL${RESET}  ${TEST_TOTAL} tests found (minimum: 1000)"
  fail
fi

echo ""

# ── 5. DUPLICATE FUNCTION DETECTION ─────────────────────────────────────────

echo -e "${BOLD}DUPLICATIONS${RESET}"

DUP_FOUND=false

check_dup() {
  local func_name="$1"
  local file_count
  file_count=$(grep -rl "${func_name}" --include="*.ts" --include="*.tsx" \
    --exclude-dir=node_modules --exclude-dir=.git \
    "$PROJECT_ROOT" 2>/dev/null \
    | grep -v '\.test\.' \
    | grep -v '__tests__' \
    | grep -v 'node_modules' \
    | wc -l | tr -d ' ')

  if (( file_count >= 3 )); then
    echo -e "  ${RED}FAIL${RESET}  ${func_name} defined/referenced in ${file_count} files"
    fail
    DUP_FOUND=true
  elif (( file_count >= 2 )); then
    echo -e "  ${YELLOW}WARN${RESET}  ${func_name} found in ${file_count} files"
    warn
    DUP_FOUND=true
  fi
}

check_dup "requireAuth"
check_dup "hashString"

# Generic check: functions exported from 3+ files with same name
COMMON_EXPORTS=$(grep -roh 'export function [a-zA-Z_]*' --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules --exclude-dir=.git \
  "$PROJECT_ROOT" 2>/dev/null \
  | sort | uniq -c | sort -rn \
  | awk '$1 >= 3 { print $0 }' || true)

if [[ -n "$COMMON_EXPORTS" ]]; then
  while IFS= read -r line; do
    count=$(echo "$line" | awk '{print $1}')
    fname=$(echo "$line" | awk '{print $NF}')
    echo -e "  ${YELLOW}WARN${RESET}  ${fname} exported from ${count} files"
    warn
    DUP_FOUND=true
  done <<< "$COMMON_EXPORTS"
fi

if [[ "$DUP_FOUND" == false ]]; then
  echo -e "  ${GREEN}PASS${RESET}  No significant duplications detected"
  pass
fi

echo ""

# ── SUMMARY ─────────────────────────────────────────────────────────────────

TOTAL=$((PASS_COUNT + WARN_COUNT + FAIL_COUNT))

echo -e "${CYAN}${BOLD}+==========================================+"
echo -e "  SUMMARY: ${GREEN}${PASS_COUNT} PASS${CYAN} | ${YELLOW}${WARN_COUNT} WARN${CYAN} | ${RED}${FAIL_COUNT} FAIL${CYAN}  (${TOTAL} checks)"
echo -e "+==========================================+${RESET}"
echo ""

if (( FAIL_COUNT > 0 )); then
  echo -e "${RED}${BOLD}Health check completed with failures.${RESET}"
  exit 1
else
  if (( WARN_COUNT > 0 )); then
    echo -e "${YELLOW}${BOLD}Health check passed with warnings.${RESET}"
  else
    echo -e "${GREEN}${BOLD}Health check passed. All clear.${RESET}"
  fi
  exit 0
fi
