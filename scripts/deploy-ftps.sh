#!/usr/bin/env bash
# Deploy a local directory to cPanel over FTPS (port 21, explicit TLS).
# This path avoids the cPanel UAPI on port 2083, so Imunify360 bot-protection
# on the HTTPS API does not block it.
#
# Usage: bash scripts/deploy-ftps.sh <local-dir> <remote-dir-relative-to-home>
# Required env: FTP_HOST, FTP_USER, FTP_PASS
# Optional env: FTP_PORT (default 21), FTP_DELETE ("1" to mirror-delete)

set -euo pipefail

LOCAL_DIR="${1:?local directory required}"
REMOTE_DIR="${2:?remote directory required}"

FTP_HOST="${FTP_HOST:?FTP_HOST is required}"
FTP_USER="${FTP_USER:?FTP_USER is required}"
FTP_PASS="${FTP_PASS:-${FTP_PASSWORD:-}}"
[ -n "$FTP_PASS" ] || { echo "FTP_PASS or FTP_PASSWORD is required"; exit 1; }
FTP_PORT="${FTP_PORT:-21}"
FTP_DELETE="${FTP_DELETE:-0}"

if ! command -v lftp >/dev/null 2>&1; then
  echo "Installing lftp..."
  sudo apt-get update -qq && sudo apt-get install -y -qq lftp
fi

DELETE_FLAG=""
if [ "$FTP_DELETE" = "1" ]; then
  DELETE_FLAG="--delete"
fi

echo "⬆️  FTPS deploy: $LOCAL_DIR -> ftp://$FTP_HOST:$FTP_PORT/$REMOTE_DIR"

lftp -c "
set ftp:ssl-force true;
set ftp:ssl-protect-data true;
set ssl:verify-certificate false;
set net:max-retries 3;
set net:timeout 20;
set mirror:parallel-transfer-count 4;
open -u '$FTP_USER','$FTP_PASS' -p $FTP_PORT '$FTP_HOST';
mkdir -pf '$REMOTE_DIR';
mirror -R $DELETE_FLAG --verbose=1 \
  --exclude-glob .git/ \
  --exclude-glob node_modules/ \
  --exclude-glob .env \
  '$LOCAL_DIR' '$REMOTE_DIR';
bye;
"

echo "✅ FTPS deploy complete: $REMOTE_DIR"
