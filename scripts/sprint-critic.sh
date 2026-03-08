#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
DOCS_DIR="$ROOT/docs"
CRITIQUE_DIR="$DOCS_DIR/critique"
PACKETS_DIR="$CRITIQUE_DIR/packets"

mkdir -p "$PACKETS_DIR"
mkdir -p "$CRITIQUE_DIR"

# Find latest sprint / retro / audit files
LATEST_SPRINT="$(find "$DOCS_DIR" -type f \( -iname "SPRINT-*.md" -o -iname "*SPRINT*.md" \) | sort -V | tail -n 1 || true)"
LATEST_RETRO="$(find "$DOCS_DIR" -type f \( -iname "RETRO-*.md" -o -iname "*RETRO*.md" \) | sort -V | tail -n 1 || true)"
LATEST_AUDIT="$(find "$DOCS_DIR" -type f \( -iname "ARCH-AUDIT-*.md" -o -iname "*AUDIT*.md" \) | sort -V | tail -n 1 || true)"

if [[ -z "${LATEST_SPRINT}" && -z "${LATEST_RETRO}" ]]; then
  echo "Could not find sprint or retro files under docs/"
  exit 1
fi

# Extract sprint number if possible
SPRINT_NUM="$(basename "${LATEST_SPRINT:-$LATEST_RETRO}" | grep -oE '[0-9]+' | head -n 1 || true)"
if [[ -z "${SPRINT_NUM}" ]]; then
  SPRINT_NUM="LATEST"
fi

PACKET_FILE="$PACKETS_DIR/SPRINT-${SPRINT_NUM}-PACKET.md"
CRITIQUE_FILE="$CRITIQUE_DIR/SPRINT-${SPRINT_NUM}-CRITIQUE.md"

README_FILE="$ROOT/README.md"
CHANGELOG_FILE="$ROOT/CHANGELOG.md"
CONTRIBUTING_FILE="$ROOT/CONTRIBUTING.md"

{
  echo "# Sprint Critique Packet"
  echo
  echo "- Sprint: $SPRINT_NUM"
  echo "- Generated: $(date)"
  echo "- Branch: $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo unknown)"
  echo "- Commit: $(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
  echo
  echo "## Latest Sprint Doc"
  echo "File: ${LATEST_SPRINT:-missing}"
  echo
  if [[ -n "${LATEST_SPRINT}" ]]; then
    echo '```md'
    cat "$LATEST_SPRINT"
    echo '```'
  else
    echo "_missing_"
  fi
  echo
  echo "## Latest Retro"
  echo "File: ${LATEST_RETRO:-missing}"
  echo
  if [[ -n "${LATEST_RETRO}" ]]; then
    echo '```md'
    cat "$LATEST_RETRO"
    echo '```'
  else
    echo "_missing_"
  fi
  echo
  echo "## Latest Audit"
  echo "File: ${LATEST_AUDIT:-missing}"
  echo
  if [[ -n "${LATEST_AUDIT}" ]]; then
    echo '```md'
    cat "$LATEST_AUDIT"
    echo '```'
  else
    echo "_missing_"
  fi
  echo
  echo "## README"
  if [[ -f "$README_FILE" ]]; then
    echo '```md'
    tail -n 200 "$README_FILE"
    echo '```'
  else
    echo "_missing_"
  fi
  echo
  echo "## CONTRIBUTING"
  if [[ -f "$CONTRIBUTING_FILE" ]]; then
    echo '```md'
    tail -n 250 "$CONTRIBUTING_FILE"
    echo '```'
  else
    echo "_missing_"
  fi
  echo
  echo "## CHANGELOG"
  if [[ -f "$CHANGELOG_FILE" ]]; then
    echo '```md'
    tail -n 300 "$CHANGELOG_FILE"
    echo '```'
  else
    echo "_missing_"
  fi
  echo
  echo "## Recently Changed Files"
  echo '```'
  git diff --name-only HEAD~1..HEAD 2>/dev/null || true
  echo '```'
  echo
  echo "## Recent Commits"
  echo '```'
  git log --oneline -10 2>/dev/null || true
  echo '```'
  echo
  echo "## Required Output"
  echo "Write the critique to: $CRITIQUE_FILE"
  echo
  echo "Use exactly these sections:"
  echo "- ## Verified wins"
  echo "- ## Contradictions / drift"
  echo "- ## Unclosed action items"
  echo "- ## Core-loop focus score"
  echo "- ## Top 3 priorities for next sprint"
  echo "- **Verdict:**"
} > "$PACKET_FILE"

if [[ ! -f "$CRITIQUE_FILE" ]]; then
  cat > "$CRITIQUE_FILE" <<EOF
# Sprint $SPRINT_NUM Critique

> Pending critique generation.
EOF
fi

echo
echo "=================================================="
echo "SPRINT CRITIQUE PACKET READY"
echo "=================================================="
echo "Packet file:"
echo "  $PACKET_FILE"
echo
echo "Claude should write critique to:"
echo "  $CRITIQUE_FILE"
echo
echo "Paste the prompt I gave you into Claude Code."
echo "=================================================="
echo
