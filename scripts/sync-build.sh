#!/bin/bash
set -e

echo "========================================="
echo "  Sync & Build"
echo "========================================="

echo ""
echo "[1/4] Pulling latest from GitHub..."
# Preserve .replit (contains Replit Secrets) — never let git overwrite it
cp .replit .replit.bak 2>/dev/null || true
git checkout -- .replit 2>/dev/null || true
git pull origin main --ff-only || git merge origin/main --no-ff -m "Merge remote main"
cp .replit.bak .replit 2>/dev/null || true
rm -f .replit.bak
echo "Done."

echo ""
echo "[2/4] Installing dependencies..."
npm install --legacy-peer-deps 2>/dev/null || npm install
echo "Done."

echo ""
echo "[3/4] Building Expo static bundle..."
npm run expo:static:build
echo "Done."

echo ""
echo "[4/4] Building server..."
npm run server:build
echo "Done."

echo ""
echo "========================================="
echo "  Build complete! Run 'Project' workflow"
echo "  to start the app."
echo "========================================="
