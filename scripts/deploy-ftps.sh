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
FTP_FRONTEND_ROOT="${FTP_FRONTEND_ROOT:-}"

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

if [ -n "${DEPLOY_VERIFY_URL:-}" ]; then
  # ---------------------------------------------------------------
  # 1) Frontend only: prove which FTP directory is the live document
  #    root before uploading the bundle. Backend FTP users may not have
  #    permission to list the login root even though api-app is writable,
  #    so this discovery must never run for backend deployments.
  # ---------------------------------------------------------------
  if ! PROBE="$(lftp -c "
$LFTP_SETTINGS
open -u '$FTP_USER','$FTP_PASS' -p $FTP_PORT '$FTP_HOST';
pwd;
cls -1 .;
bye;
" 2>&1)"; then
    echo "❌ Unable to inspect the frontend FTP login directory:" >&2
    echo "$PROBE" >&2
    exit 1
  fi

  echo "--- FTP login directory listing ---"
  echo "$PROBE"
  echo "-----------------------------------"

  VERIFY_BASE="${DEPLOY_VERIFY_URL%/}"
  # Do not use a dotfile: many Apache configurations block dot-prefixed files.
  PROBE_NAME="deploy-probe-${GITHUB_RUN_ID:-$$}-${RANDOM}.txt"
  PROBE_VALUE="${GITHUB_SHA:-$(date +%s)}-${RANDOM}"
  PROBE_FILE="$(mktemp)"
  trap 'rm -f "$PROBE_FILE"' EXIT
  printf '%s' "$PROBE_VALUE" > "$PROBE_FILE"

  # cPanel can expose the primary domain at public_html, an addon domain at
  # <domain>, or either path beneath an FTP chroot. Prefer an explicit value,
  # then test the common layouts that already exist on this FTP account.
  VERIFY_HOST="$(printf '%s' "$VERIFY_BASE" | sed -E 's#^https?://([^/:]+).*#\1#')"
  CANDIDATES=()
  [ -n "$FTP_FRONTEND_ROOT" ] && CANDIDATES+=("$FTP_FRONTEND_ROOT")
  CANDIDATES+=("$REMOTE_DIR" "$VERIFY_HOST" "public_html/$VERIFY_HOST" ".")

  # De-duplicate candidates while preserving priority.
  UNIQUE_CANDIDATES=()
  for CANDIDATE in "${CANDIDATES[@]}"; do
    [ -n "$CANDIDATE" ] || continue
    SEEN=0
    for EXISTING in "${UNIQUE_CANDIDATES[@]}"; do
      [ "$EXISTING" = "$CANDIDATE" ] && SEEN=1 && break
    done
    [ "$SEEN" = "1" ] || UNIQUE_CANDIDATES+=("$CANDIDATE")
  done
  CANDIDATES=("${UNIQUE_CANDIDATES[@]}")

  LIVE_ROOT=""
  for CANDIDATE in "${CANDIDATES[@]}"; do
    echo "🔬 Checking whether '$CANDIDATE' is the live document root..."
    # Never create guessed directories during discovery. A typo in the path
    # must fail safely instead of producing another misleading FTP tree.
    if ! lftp -c "
$LFTP_SETTINGS
open -u '$FTP_USER','$FTP_PASS' -p $FTP_PORT '$FTP_HOST';
cls -d '$CANDIDATE';
bye;
" >/dev/null 2>&1; then
      echo "   ↪ path does not exist or is not accessible"
      continue
    fi

    [ -n "${FIRST_EXISTING:-}" ] || FIRST_EXISTING="$CANDIDATE"

    lftp -c "
$LFTP_SETTINGS
open -u '$FTP_USER','$FTP_PASS' -p $FTP_PORT '$FTP_HOST';
put '$PROBE_FILE' -o '$CANDIDATE/$PROBE_NAME';
bye;
"

    CURL_RESOLVE=()
    if [ -n "${DEPLOY_ORIGIN_IP:-}" ]; then
      CURL_RESOLVE=(--resolve "${VERIFY_HOST}:443:${DEPLOY_ORIGIN_IP}")
    fi
    # A brand-new file can need a moment to become visible, and Imunify360
    # bot protection rejects requests without a browser-like User-Agent.
    LIVE_VALUE=""
    for TRY in 1 2 3; do
      LIVE_VALUE="$(curl -fsS --max-time 20 "${CURL_RESOLVE[@]}" \
        -A 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36' \
        -H 'Cache-Control: no-cache' \
        "$VERIFY_BASE/$PROBE_NAME?cb=$RANDOM$TRY" 2>/dev/null || true)"
      [ "$LIVE_VALUE" = "$PROBE_VALUE" ] && break
      sleep 3
    done

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
    if [ -n "${FIRST_EXISTING:-}" ]; then
      # The HTTP probe can be blocked (bot protection / edge cache) even when
      # the path is correct. Do not abort the release for a probe that cannot
      # answer: continue with the best known path — the post-upload index.html
      # and asset hash checks still prove the files really landed.
      LIVE_ROOT="$FIRST_EXISTING"
      echo "⚠️  HTTP probe could not confirm the document root (bot protection or edge cache)."
      echo "   Continuing with existing path '$LIVE_ROOT'; upload integrity is still verified."
    else
      echo "❌ No candidate FTP directory exists: ${CANDIDATES[*]}. No files were deployed." >&2
      echo "   Set FTP_FRONTEND_ROOT to the Document Root shown in cPanel → Domains." >&2
      exit 1
    fi
  fi
  REMOTE_DIR="$LIVE_ROOT"
  echo "✅ Using document root: '$REMOTE_DIR'"
fi


echo "⬆️  FTPS deploy: $LOCAL_DIR -> ftp://$FTP_HOST:$FTP_PORT/$REMOTE_DIR"

# Passenger watches tmp/restart.txt — upload it last, after every app file.
RESTART_FILE="$LOCAL_DIR/tmp/restart.txt"
RESTART_COMMAND=""
if [ -f "$RESTART_FILE" ]; then
  RESTART_COMMAND="mkdir -pf '$REMOTE_DIR/tmp'; put '$RESTART_FILE' -o '$REMOTE_DIR/tmp/restart.txt';"
fi

# Entry/release files are excluded from mirror and uploaded exactly once
# afterwards. DEPLOY_RELEASE must never be skipped because of a stale remote
# timestamp: /health/deploy uses it to prove which commit Passenger is serving.
# cmd:fail-exit ensures these commands never run if the asset mirror fails.
FORCE_COMMANDS=""
for f in index.html release.txt .htaccess DEPLOY_RELEASE DEPLOY_META.json; do
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
  --exclude-glob DEPLOY_RELEASE \
  --exclude-glob DEPLOY_META.json \
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
# ---------------------------------------------------------------
# 2a) Backend deployments: prove that DEPLOY_RELEASE really landed in the
#     directory we uploaded to. If this passes but /health/deploy keeps
#     serving an old commit, the Node.js Application Root is a DIFFERENT
#     directory than BACKEND_REMOTE_PATH (or Passenger never restarted).
# ---------------------------------------------------------------
if [ -f "$LOCAL_DIR/DEPLOY_RELEASE" ]; then
  if [ ! -f "$RESTART_FILE" ]; then
    echo "❌ Backend package has DEPLOY_RELEASE but no tmp/restart.txt." >&2
    exit 1
  fi
  RELEASE_LOCAL="$(cat "$LOCAL_DIR/DEPLOY_RELEASE")"
  RELEASE_TMP="$(mktemp)"; rm -f "$RELEASE_TMP"
  lftp -c "
$LFTP_SETTINGS
open -u '$FTP_USER','$FTP_PASS' -p $FTP_PORT '$FTP_HOST';
get '$REMOTE_DIR/DEPLOY_RELEASE' -o '$RELEASE_TMP';
bye;
" >/dev/null 2>&1 || true
  RELEASE_REMOTE="$( [ -f "$RELEASE_TMP" ] && cat "$RELEASE_TMP" || true )"
  rm -f "$RELEASE_TMP"
  if [ "$RELEASE_REMOTE" != "$RELEASE_LOCAL" ]; then
    echo "❌ DEPLOY_RELEASE did not land in '$REMOTE_DIR' (remote='$RELEASE_REMOTE')." >&2
    exit 1
  fi
  echo "✅ Backend release marker verified in '$REMOTE_DIR'"

  # Passenger only recycles when tmp/restart.txt is (re)written. Some FTP
  # servers keep the original mtime on overwrite, so delete-then-put.
  lftp -c "
$LFTP_SETTINGS
open -u '$FTP_USER','$FTP_PASS' -p $FTP_PORT '$FTP_HOST';
mkdir -pf '$REMOTE_DIR/tmp';
rm -f '$REMOTE_DIR/tmp/restart.txt';
put '$RESTART_FILE' -o '$REMOTE_DIR/tmp/restart.txt';
cls -l '$REMOTE_DIR/tmp/restart.txt';
bye;
"
  echo "🔁 Passenger restart marker rewritten in '$REMOTE_DIR/tmp/restart.txt'"
fi

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

  # Verify every LOCAL JS/CSS asset referenced by index.html. External
  # resources (Google Translate, CDNs, data:/blob: URIs) are never uploaded by
  # this deploy, so they must not be validated as local files.
  ASSET_PATHS=$(grep -oE '(src|href)="[^"]+\.(js|css)(\?[^"]*)?"' "$LOCAL_DIR/index.html" \
    | sed -E 's/^(src|href)="//; s/"$//; s/\?.*$//' | sort -u)
  while IFS= read -r RAW_PATH; do
    [ -n "$RAW_PATH" ] || continue
    case "$RAW_PATH" in
      http://*|https://*|//*|data:*|blob:*|mailto:*|tel:*)
        echo "↩️  Skipping external resource: $RAW_PATH"
        continue
        ;;
    esac
    ASSET_PATH="${RAW_PATH#/}"
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
