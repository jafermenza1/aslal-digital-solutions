#!/usr/bin/env bash
set -euo pipefail
: "${DATABASE_URL:?DATABASE_URL is required}"
: "${BACKUP_FILE:?BACKUP_FILE is required}"
gunzip -c "$BACKUP_FILE" | mysql "$DATABASE_URL"
echo "Restore completed from $BACKUP_FILE"
