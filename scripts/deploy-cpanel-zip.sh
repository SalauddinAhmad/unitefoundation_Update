#!/usr/bin/env bash
# Fast cPanel deploy: upload one ZIP → extract remotely.
# Falls back to per-file upload (deploy-cpanel-api.sh) on any failure.
set -Eeuo pipefail

LOCAL_DIR="${1:-}"
REMOTE_DIR="${2:-}"

if [[ -z "$LOCAL_DIR" || -z "$REMOTE_DIR" ]]; then
  echo "Usage: $0 <local-dir> <remote-dir>" >&2
  exit 2
fi

if [[ ! -d "$LOCAL_DIR" ]]; then
  echo "Local directory not found: $LOCAL_DIR" >&2
  exit 2
fi

: "${CPANEL_HOST:?CPANEL_HOST is required}"
: "${CPANEL_USER:?CPANEL_USER is required}"
: "${CPANEL_HOME:?CPANEL_HOME is required}"
: "${CPANEL_API_TOKEN:?CPANEL_API_TOKEN is required}"

CPANEL_PORT="${CPANEL_PORT:-2083}"
API_BASE="https://${CPANEL_HOST}:${CPANEL_PORT}"
AUTH_HEADER="Authorization: cpanel ${CPANEL_USER}:${CPANEL_API_TOKEN}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FALLBACK_SCRIPT="${SCRIPT_DIR}/deploy-cpanel-api.sh"

REMOTE_ABS="${CPANEL_HOME%/}/${REMOTE_DIR#/}"
STAGING_REL="tmp/deploy-$(date +%s)-$$"
STAGING_ABS="${CPANEL_HOME%/}/${STAGING_REL}"
ZIP_NAME="deploy-$(date +%s)-$$.zip"

fallback() {
  echo "⚠️  ZIP deploy failed: $1"
  echo "↩️  Falling back to per-file upload..."
  exec bash "$FALLBACK_SCRIPT" "$LOCAL_DIR" "$REMOTE_DIR"
}

urlencode() {
  python3 -c 'import sys, urllib.parse; print(urllib.parse.quote(sys.argv[1], safe=""))' "$1"
}

trap 'echo "Cleaning up remote staging..."; \
  curl --silent --show-error --max-time 30 --header "$AUTH_HEADER" \
    "${API_BASE}/execute/Fileman/remove_files?files=$(urlencode "${STAGING_ABS}/${ZIP_NAME}")" >/dev/null 2>&1 || true' EXIT

echo "📦 Creating ZIP archive from ${LOCAL_DIR}..."
TMP_ZIP="$(mktemp -d)/${ZIP_NAME}"
( cd "$LOCAL_DIR" && zip -qr "$TMP_ZIP" . ) || fallback "zip creation failed"
ZIP_SIZE_MB=$(du -m "$TMP_ZIP" | cut -f1)
echo "   Archive size: ${ZIP_SIZE_MB} MB"

# 1. Ensure staging dir exists (mkdir tmp/deploy-XXX)
echo "📁 Ensuring remote staging directory..."
curl --silent --show-error --max-time 30 --header "$AUTH_HEADER" \
  "${API_BASE}/json-api/cpanel?cpanel_jsonapi_user=$(urlencode "$CPANEL_USER")&cpanel_jsonapi_apiversion=2&cpanel_jsonapi_module=Fileman&cpanel_jsonapi_func=mkdir&path=$(urlencode "$CPANEL_HOME")&name=tmp" >/dev/null || true
curl --silent --show-error --max-time 30 --header "$AUTH_HEADER" \
  "${API_BASE}/json-api/cpanel?cpanel_jsonapi_user=$(urlencode "$CPANEL_USER")&cpanel_jsonapi_apiversion=2&cpanel_jsonapi_module=Fileman&cpanel_jsonapi_func=mkdir&path=$(urlencode "${CPANEL_HOME}/tmp")&name=$(basename "$STAGING_REL")" >/dev/null || true

# 2. Ensure destination dir exists
echo "📁 Ensuring destination directory: ${REMOTE_DIR}..."
IFS='/' read -r -a parts <<< "${REMOTE_DIR#/}"
current="$CPANEL_HOME"
for part in "${parts[@]}"; do
  [[ -z "$part" ]] && continue
  curl --silent --show-error --max-time 30 --header "$AUTH_HEADER" \
    "${API_BASE}/json-api/cpanel?cpanel_jsonapi_user=$(urlencode "$CPANEL_USER")&cpanel_jsonapi_apiversion=2&cpanel_jsonapi_module=Fileman&cpanel_jsonapi_func=mkdir&path=$(urlencode "$current")&name=$(urlencode "$part")" >/dev/null || true
  current="${current}/${part}"
done

# 3. Upload the ZIP to staging
echo "⬆️  Uploading ZIP (${ZIP_SIZE_MB} MB)..."
UPLOAD_RES=$(curl --silent --show-error --location \
  --connect-timeout 30 --max-time 300 --retry 2 --retry-delay 5 \
  --header "$AUTH_HEADER" \
  --form "dir=${STAGING_ABS}" \
  --form "overwrite=1" \
  --form "file-1=@${TMP_ZIP};filename=${ZIP_NAME}" \
  "${API_BASE}/execute/Fileman/upload_files") || fallback "upload request failed"

echo "$UPLOAD_RES" | python3 -c '
import json, sys
try:
    d = json.loads(sys.stdin.read())
except Exception as e:
    print("bad JSON:", e); sys.exit(1)
s = d.get("status") or d.get("result", {}).get("status")
if s not in (1, True):
    print(json.dumps(d, indent=2)); sys.exit(1)
' || fallback "upload returned error"
echo "   ✅ Upload complete"

# 4. Extract ZIP into destination (Fileman/extract)
echo "📂 Extracting ZIP into ${REMOTE_ABS}..."
EXTRACT_RES=$(curl --silent --show-error --location \
  --connect-timeout 30 --max-time 120 --header "$AUTH_HEADER" \
  --data-urlencode "sourcefiles=${STAGING_ABS}/${ZIP_NAME}" \
  --data-urlencode "destfiles=${REMOTE_ABS}" \
  "${API_BASE}/execute/Fileman/extract") || fallback "extract request failed"

echo "$EXTRACT_RES" | python3 -c '
import json, sys
try:
    d = json.loads(sys.stdin.read())
except Exception as e:
    print("bad JSON:", e); sys.exit(1)
s = d.get("status") or d.get("result", {}).get("status")
errors = d.get("errors") or []
if s not in (1, True) or errors:
    print(json.dumps(d, indent=2)); sys.exit(1)
' || fallback "extract returned error"

echo "✅ ZIP deploy complete in $SECONDS seconds."
