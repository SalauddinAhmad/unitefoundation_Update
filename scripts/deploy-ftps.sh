#!/usr/bin/env bash
# Deploy a local directory to cPanel over FTPS (port 21, explicit TLS).
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

LFTP_SETTINGS="
set ftp:ssl-force true;
set ftp:ssl-protect-data true;
set ssl:verify-certificate false;
set net:max-retries 2;
set net:timeout 15;
set net:reconnect-interval-base 3;
set net:reconnect-interval-max 10;
set ftp:sync-mode true;
"

echo "🔎 FTP host resolves to: $(getent hosts "$FTP_HOST" | awk '{print $1}' | tr '\n' ' ')"

# ---------------------------------------------------------------
# 1) Probe the login directory so we never upload into the wrong
#    place (e.g. public_html/public_html when the FTP user is
#    already chrooted into the document root).
# ---------------------------------------------------------------
PROBE="$(lftp -c "
$LFTP_SETTINGS
open -u '$FTP_USER','$FTP_PASS' -p $FTP_PORT '$FTP_HOST';
pwd;
cls -1 .;
bye;
" 2>&1)"

echo "--- FTP login directory listing ---"
echo "$PROBE"
echo "-----------------------------------"

LOGIN_DIR="$(printf '%s\n' "$PROBE" | grep -oE 'ftp://[^ ]*' | head -1 | sed 's|.*\(/.*\)|\1|')"
TOP_SEGMENT="${REMOTE_DIR%%/*}"        # e.g. "public_html"
REST="${REMOTE_DIR#"$TOP_SEGMENT"}"    # e.g. "/api-app" or ""

if ! printf '%s\n' "$PROBE" | grep -qx "${TOP_SEGMENT}/\?" && \
   printf '%s\n' "$LOGIN_DIR" | grep -q "/${TOP_SEGMENT}\$"; then
  # Already inside the document root — strip the duplicated segment.
  REMOTE_DIR=".${REST}"
  echo "ℹ️  FTP account is chrooted into '$TOP_SEGMENT' — using remote dir '$REMOTE_DIR'"
fi

echo "⬆️  FTPS deploy: $LOCAL_DIR -> ftp://$FTP_HOST:$FTP_PORT/$REMOTE_DIR"

# Passenger watches tmp/restart.txt — upload it last, after every app file.
RESTART_FILE="$LOCAL_DIR/tmp/restart.txt"
RESTART_COMMAND=""
if [ -f "$RESTART_FILE" ]; then
  RESTART_COMMAND="mkdir -pf '$REMOTE_DIR/tmp'; put '$RESTART_FILE' -o '$REMOTE_DIR/tmp/restart.txt';"
fi

# Entry files are excluded from mirror and uploaded exactly once afterwards.
FORCE_COMMANDS=""
for f in index.html release.txt .htaccess; do
  if [ -f "$LOCAL_DIR/$f" ]; then
    FORCE_COMMANDS="$FORCE_COMMANDS put '$LOCAL_DIR/$f' -o '$REMOTE_DIR/$f';"
  fi
done

DELETE_FLAG=""
if [ "$FTP_DELETE" = "1" ]; then
  DELETE_FLAG="--delete"
fi

lftp -c "
$LFTP_SETTINGS
set mirror:parallel-transfer-count 2;
open -u '$FTP_USER','$FTP_PASS' -p $FTP_PORT '$FTP_HOST';
mkdir -pf '$REMOTE_DIR';
mirror -R $DELETE_FLAG --verbose=1 \
  --parallel=2 \
  --exclude-glob .git/ \
  --exclude-glob node_modules/ \
  --exclude-glob .env \
  --exclude-glob tmp/restart.txt \
  --exclude-glob index.html \
  --exclude-glob release.txt \
  --exclude-glob .htaccess \
  '$LOCAL_DIR' '$REMOTE_DIR';
$FORCE_COMMANDS
$RESTART_COMMAND
echo '--- Uploaded files in $REMOTE_DIR ---';
cls -l '$REMOTE_DIR';
bye;
"

# ---------------------------------------------------------------
# 2) Verify on the FTP server itself that the entry file landed.
#    A successful mirror that writes nowhere useful is the exact
#    failure mode we are guarding against.
# ---------------------------------------------------------------
if [ -f "$LOCAL_DIR/index.html" ]; then
  LOCAL_SIZE=$(wc -c < "$LOCAL_DIR/index.html" | tr -d ' ')
  VERIFY_FILE="$(mktemp)"
  trap 'rm -f "$VERIFY_FILE"' EXIT
  # mktemp creates the file immediately, while lftp `get` refuses to
  # overwrite an existing local file by default. Remove the placeholder so
  # the remote index can be downloaded to this unique path.
  rm -f "$VERIFY_FILE"
  REMOTE_LS="$(lftp -c "
$LFTP_SETTINGS
open -u '$FTP_USER','$FTP_PASS' -p $FTP_PORT '$FTP_HOST';
cls -l '$REMOTE_DIR/index.html';
get '$REMOTE_DIR/index.html' -o '$VERIFY_FILE';
bye;
" 2>&1 || true)"
  echo "remote index.html: $REMOTE_LS"
  REMOTE_SIZE=""
  if [ -f "$VERIFY_FILE" ]; then
    REMOTE_SIZE=$(wc -c < "$VERIFY_FILE" | tr -d ' ')
  fi
  if [ "$REMOTE_SIZE" != "$LOCAL_SIZE" ]; then
    echo "❌ index.html mismatch on server (local=${LOCAL_SIZE}B remote=${REMOTE_SIZE:-missing})."
    echo "   The FTP account is probably writing to a different document root than the live site."
    exit 1
  fi
  echo "✅ index.html verified on server (${LOCAL_SIZE} bytes)"
fi

echo "✅ FTPS deploy complete: $REMOTE_DIR"
