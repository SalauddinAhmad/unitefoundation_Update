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

# A stale FTP DNS record previously allowed uploads to succeed on the old
# server while the website continued to be served by the new origin.
if [ -n "${FTP_EXPECTED_IP:-}" ]; then
  RESOLVED_IPS="$(getent ahostsv4 "$FTP_HOST" | awk '{print $1}' | sort -u | tr '\n' ' ')"
  if ! printf '%s\n' "$RESOLVED_IPS" | grep -qw "$FTP_EXPECTED_IP"; then
    echo "❌ FTP target mismatch: '$FTP_HOST' resolves to [$RESOLVED_IPS], expected $FTP_EXPECTED_IP" >&2
    exit 1
  fi
fi

if ! command -v lftp >/dev/null 2>&1; then
  echo "Installing lftp..."
  sudo apt-get update -qq && sudo apt-get install -y -qq lftp
fi

LFTP_SETTINGS="
set cmd:fail-exit true;
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
# 1) For frontend deployments, prove which FTP directory is the live
#    document root before uploading the bundle. This prevents an FTP
#    success against a stale server/root from ever becoming a green run.
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

if [ -n "${DEPLOY_VERIFY_URL:-}" ]; then
  VERIFY_BASE="${DEPLOY_VERIFY_URL%/}"
  # Do not use a dotfile: many Apache configurations block dot-prefixed files.
  PROBE_NAME="deploy-probe-${GITHUB_RUN_ID:-$$}-${RANDOM}.txt"
  PROBE_VALUE="${GITHUB_SHA:-$(date +%s)}-${RANDOM}"
  PROBE_FILE="$(mktemp)"
  trap 'rm -f "$PROBE_FILE"' EXIT
  printf '%s' "$PROBE_VALUE" > "$PROBE_FILE"

  # Check the requested path first, then the FTP login directory. These are
  # the two valid cPanel layouts: home/public_html and a public_html chroot.
  CANDIDATES=("$REMOTE_DIR")
  if [ "$REMOTE_DIR" = "public_html" ]; then
    CANDIDATES+=(".")
  fi

  LIVE_ROOT=""
  for CANDIDATE in "${CANDIDATES[@]}"; do
    echo "🔬 Checking whether '$CANDIDATE' is the live document root..."
    lftp -c "
$LFTP_SETTINGS
open -u '$FTP_USER','$FTP_PASS' -p $FTP_PORT '$FTP_HOST';
mkdir -pf '$CANDIDATE';
put '$PROBE_FILE' -o '$CANDIDATE/$PROBE_NAME';
bye;
"

    CURL_RESOLVE=()
    if [ -n "${DEPLOY_ORIGIN_IP:-}" ]; then
      VERIFY_HOST="$(printf '%s' "$VERIFY_BASE" | sed -E 's#^https?://([^/:]+).*#\1#')"
      CURL_RESOLVE=(--resolve "${VERIFY_HOST}:443:${DEPLOY_ORIGIN_IP}")
    fi
    LIVE_VALUE="$(curl -fsS --max-time 20 "${CURL_RESOLVE[@]}" \
      -H 'Cache-Control: no-cache' \
      "$VERIFY_BASE/$PROBE_NAME?cb=$RANDOM" 2>/dev/null || true)"

    lftp -c "
$LFTP_SETTINGS
open -u '$FTP_USER','$FTP_PASS' -p $FTP_PORT '$FTP_HOST';
rm -f '$CANDIDATE/$PROBE_NAME';
bye;
" >/dev/null 2>&1 || true

    if [ "$LIVE_VALUE" = "$PROBE_VALUE" ]; then
      LIVE_ROOT="$CANDIDATE"
      break
    fi
  done

  if [ -z "$LIVE_ROOT" ]; then
    echo "❌ FTP credentials do not reach the document root served by $VERIFY_BASE." >&2
    echo "   Checked: ${CANDIDATES[*]}. No files were deployed." >&2
    echo "   Ask the hosting provider for the FTP account/path mapped to this domain." >&2
    exit 1
  fi
  REMOTE_DIR="$LIVE_ROOT"
  echo "✅ Confirmed live document root: '$REMOTE_DIR'"
fi

echo "⬆️  FTPS deploy: $LOCAL_DIR -> ftp://$FTP_HOST:$FTP_PORT/$REMOTE_DIR"

# Passenger watches tmp/restart.txt — upload it last, after every app file.
RESTART_FILE="$LOCAL_DIR/tmp/restart.txt"
RESTART_COMMAND=""
if [ -f "$RESTART_FILE" ]; then
  RESTART_COMMAND="mkdir -pf '$REMOTE_DIR/tmp'; put '$RESTART_FILE' -o '$REMOTE_DIR/tmp/restart.txt';"
fi

# Entry files are excluded from mirror and uploaded exactly once afterwards.
# cmd:fail-exit ensures these commands never run if the asset mirror fails.
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
  LOCAL_HASH=$(sha256sum "$LOCAL_DIR/index.html" | awk '{print $1}')
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
  REMOTE_HASH=""
  if [ -f "$VERIFY_FILE" ]; then
    REMOTE_HASH=$(sha256sum "$VERIFY_FILE" | awk '{print $1}')
  fi
  if [ "$REMOTE_HASH" != "$LOCAL_HASH" ]; then
    echo "❌ index.html hash mismatch on server."
    echo "   The FTP account is probably writing to a different document root than the live site."
    exit 1
  fi
  echo "✅ index.html content verified on server"

  # Verify every local JS/CSS asset referenced by index.html. A fresh entry
  # file with missing hashed chunks is not a successful frontend deployment.
  ASSET_PATHS=$(grep -oE '(src|href)="[^"]+\.(js|css)(\?[^"]*)?"' "$LOCAL_DIR/index.html" \
    | sed -E 's/^(src|href)="//; s/"$//; s/\?.*$//; s#^/##' | sort -u)
  while IFS= read -r ASSET_PATH; do
    [ -n "$ASSET_PATH" ] || continue
    LOCAL_ASSET="$LOCAL_DIR/$ASSET_PATH"
    if [ ! -f "$LOCAL_ASSET" ]; then
      echo "❌ Referenced local asset is missing: $ASSET_PATH" >&2
      exit 1
    fi
    ASSET_VERIFY_FILE="$(mktemp)"
    rm -f "$ASSET_VERIFY_FILE"
    lftp -c "
$LFTP_SETTINGS
open -u '$FTP_USER','$FTP_PASS' -p $FTP_PORT '$FTP_HOST';
get '$REMOTE_DIR/$ASSET_PATH' -o '$ASSET_VERIFY_FILE';
bye;
"
    LOCAL_ASSET_HASH=$(sha256sum "$LOCAL_ASSET" | awk '{print $1}')
    REMOTE_ASSET_HASH=$(sha256sum "$ASSET_VERIFY_FILE" | awk '{print $1}')
    rm -f "$ASSET_VERIFY_FILE"
    if [ "$REMOTE_ASSET_HASH" != "$LOCAL_ASSET_HASH" ]; then
      echo "❌ Asset hash mismatch: $ASSET_PATH" >&2
      exit 1
    fi
    echo "✅ Asset verified: $ASSET_PATH"
  done <<< "$ASSET_PATHS"
fi

echo "✅ FTPS deploy complete: $REMOTE_DIR"
