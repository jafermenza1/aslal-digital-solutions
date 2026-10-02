#!/usr/bin/env bash
set -euo pipefail
: "${DATABASE_URL:?DATABASE_URL is required}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
mkdir -p "$BACKUP_DIR"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="$BACKUP_DIR/aslal-$STAMP.sql"
mysqldump --single-transaction --routines --triggers --set-gtid-purged=OFF "$DATABASE_URL" > "$OUT"
gzip -f "$OUT"
echo "Backup created: $OUT.gz"
