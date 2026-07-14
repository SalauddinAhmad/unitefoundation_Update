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
CURL_CONNECT_ARGS=()
if [[ -n "${CPANEL_ORIGIN_IP:-}" ]]; then
  CURL_CONNECT_ARGS+=(--resolve "${CPANEL_HOST}:${CPANEL_PORT}:${CPANEL_ORIGIN_IP}")
  CURL_CONNECT_ARGS+=(--connect-to "${CPANEL_HOST}:${CPANEL_PORT}:${CPANEL_ORIGIN_IP}:${CPANEL_PORT}")

  if [[ "$CPANEL_HOST" == cpanel.* ]]; then
    CPANEL_APEX_HOST="${CPANEL_HOST#cpanel.}"
    CURL_CONNECT_ARGS+=(--resolve "${CPANEL_APEX_HOST}:${CPANEL_PORT}:${CPANEL_ORIGIN_IP}")
    CURL_CONNECT_ARGS+=(--connect-to "${CPANEL_APEX_HOST}:${CPANEL_PORT}:${CPANEL_ORIGIN_IP}:${CPANEL_PORT}")
  fi
fi

cpanel_curl() {
  curl "${CURL_CONNECT_ARGS[@]}" "$@"
}

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
  cpanel_curl --silent --show-error --max-time 30 --header "$AUTH_HEADER" \
    "${API_BASE}/execute/Fileman/remove_files?files=$(urlencode "${STAGING_ABS}/${ZIP_NAME}")" >/dev/null 2>&1 || true' EXIT

echo "📦 Creating ZIP archive from ${LOCAL_DIR}..."
if [[ -n "${CPANEL_ORIGIN_IP:-}" ]]; then
  echo "Bypassing Cloudflare: ${CPANEL_HOST}:${CPANEL_PORT} -> ${CPANEL_ORIGIN_IP}:${CPANEL_PORT}"
fi
TMP_ZIP="$(mktemp -d)/${ZIP_NAME}"
( cd "$LOCAL_DIR" && zip -qr "$TMP_ZIP" . ) || fallback "zip creation failed"
ZIP_SIZE_MB=$(du -m "$TMP_ZIP" | cut -f1)
echo "   Archive size: ${ZIP_SIZE_MB} MB"

# 1. Ensure staging dir exists (mkdir tmp/deploy-XXX)
echo "📁 Ensuring remote staging directory..."
cpanel_curl --silent --show-error --max-time 30 --header "$AUTH_HEADER" \
  "${API_BASE}/json-api/cpanel?cpanel_jsonapi_user=$(urlencode "$CPANEL_USER")&cpanel_jsonapi_apiversion=2&cpanel_jsonapi_module=Fileman&cpanel_jsonapi_func=mkdir&path=$(urlencode "$CPANEL_HOME")&name=tmp" >/dev/null || true
cpanel_curl --silent --show-error --max-time 30 --header "$AUTH_HEADER" \
  "${API_BASE}/json-api/cpanel?cpanel_jsonapi_user=$(urlencode "$CPANEL_USER")&cpanel_jsonapi_apiversion=2&cpanel_jsonapi_module=Fileman&cpanel_jsonapi_func=mkdir&path=$(urlencode "${CPANEL_HOME}/tmp")&name=$(basename "$STAGING_REL")" >/dev/null || true

# 2. Ensure destination dir exists
echo "📁 Ensuring destination directory: ${REMOTE_DIR}..."
IFS='/' read -r -a parts <<< "${REMOTE_DIR#/}"
current="$CPANEL_HOME"
for part in "${parts[@]}"; do
  [[ -z "$part" ]] && continue
  cpanel_curl --silent --show-error --max-time 30 --header "$AUTH_HEADER" \
    "${API_BASE}/json-api/cpanel?cpanel_jsonapi_user=$(urlencode "$CPANEL_USER")&cpanel_jsonapi_apiversion=2&cpanel_jsonapi_module=Fileman&cpanel_jsonapi_func=mkdir&path=$(urlencode "$current")&name=$(urlencode "$part")" >/dev/null || true
  current="${current}/${part}"
done

# 3. Upload the ZIP to staging
echo "⬆️  Uploading ZIP (${ZIP_SIZE_MB} MB)..."
UPLOAD_RES=$(cpanel_curl --silent --show-error --location \
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

# 4. Extract ZIP into destination
# Try UAPI Fileman::extract first (newer cPanel), fall back to API2 Fileman::fileop op=extract (older cPanel)
echo "📂 Extracting ZIP into ${REMOTE_ABS}..."

extract_ok() {
  python3 -c '
import json, sys
raw = sys.stdin.read()
try:
    d = json.loads(raw)
except Exception:
    sys.exit(1)
s = d.get("status")
if s is None:
    s = d.get("result", {}).get("status")
errors = d.get("errors") or (d.get("result", {}) or {}).get("errors") or []
cpanelresult = d.get("cpanelresult", {})
if cpanelresult:
    data = cpanelresult.get("data", [{}])
    if data and isinstance(data, list):
        r = data[0].get("result")
        if r in (1, "1", True):
            sys.exit(0)
    if cpanelresult.get("error"):
        sys.exit(1)
if s in (1, True) and not errors:
    sys.exit(0)
sys.exit(1)
'
}

EXTRACT_RES=$(cpanel_curl --silent --show-error --location \
  --connect-timeout 30 --max-time 120 --header "$AUTH_HEADER" \
  --data-urlencode "sourcefiles=${STAGING_ABS}/${ZIP_NAME}" \
  --data-urlencode "destfiles=${REMOTE_ABS}" \
  "${API_BASE}/execute/Fileman/extract" 2>/dev/null || echo '{}')

if ! echo "$EXTRACT_RES" | extract_ok; then
  echo "   UAPI extract unavailable, trying API2 fileop..."
  EXTRACT_RES=$(cpanel_curl --silent --show-error --location \
    --connect-timeout 30 --max-time 120 --header "$AUTH_HEADER" \
    --data-urlencode "cpanel_jsonapi_user=${CPANEL_USER}" \
    --data-urlencode "cpanel_jsonapi_apiversion=2" \
    --data-urlencode "cpanel_jsonapi_module=Fileman" \
    --data-urlencode "cpanel_jsonapi_func=fileop" \
    --data-urlencode "op=extract" \
    --data-urlencode "sourcefiles=${STAGING_ABS}/${ZIP_NAME}" \
    --data-urlencode "destfiles=${REMOTE_ABS}" \
    --data-urlencode "doubledecode=0" \
    "${API_BASE}/json-api/cpanel") || fallback "extract request failed"

  echo "$EXTRACT_RES" | extract_ok || {
    echo "$EXTRACT_RES" | head -c 2000
    fallback "extract returned error"
  }
fi

echo "✅ ZIP deploy complete in $SECONDS seconds."
