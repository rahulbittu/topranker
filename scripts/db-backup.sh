#!/bin/bash
# Sprint 191: Automated Database Backup Script
# Usage: ./scripts/db-backup.sh [output_dir]
#
# Requires DATABASE_URL environment variable.
# Creates timestamped pg_dump backup in specified directory (default: ./backups).
# Keeps last 7 backups, deletes older ones.

set -euo pipefail

BACKUP_DIR="${1:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/topranker_${TIMESTAMP}.sql.gz"
MAX_BACKUPS=7

# Check DATABASE_URL
if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL is not set"
  exit 1
fi

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting backup..."

# Dump and compress
pg_dump "$DATABASE_URL" \
  --no-owner \
  --no-privileges \
  --format=plain \
  --clean \
  --if-exists \
  | gzip > "$BACKUP_FILE"

SIZE=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')
echo "[$(date)] Backup complete: $BACKUP_FILE ($SIZE)"

# Rotate: keep only last N backups
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/topranker_*.sql.gz 2>/dev/null | wc -l)
if [ "$BACKUP_COUNT" -gt "$MAX_BACKUPS" ]; then
  REMOVE_COUNT=$((BACKUP_COUNT - MAX_BACKUPS))
  ls -1t "$BACKUP_DIR"/topranker_*.sql.gz | tail -n "$REMOVE_COUNT" | xargs rm -f
  echo "[$(date)] Rotated: removed $REMOVE_COUNT old backup(s)"
fi

echo "[$(date)] Done. Active backups: $(ls -1 "$BACKUP_DIR"/topranker_*.sql.gz | wc -l)"
