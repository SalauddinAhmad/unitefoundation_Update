#!/usr/bin/env bash
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
: "${CPANEL_HOME:?CPANEL_HOME is required, for example /home/username}"
: "${CPANEL_API_TOKEN:?CPANEL_API_TOKEN GitHub secret is required}"

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

BROWSER_UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36"

cpanel_curl() {
  curl "${CURL_CONNECT_ARGS[@]}" --user-agent "$BROWSER_UA" --header "Accept: application/json" --header "X-CPanel-Skip-WAF: 1" "$@"
}

urlencode() {
  python3 -c 'import sys, urllib.parse; print(urllib.parse.quote(sys.argv[1], safe=""))' "$1"
}

check_json_status() {
  python3 -c '
import json, sys
raw = sys.stdin.read()
try:
    data = json.loads(raw)
except Exception:
    text = raw.strip()
    snippet = text[:400].replace("\n", " ")
    low = text.lower()
    if "access denied" in low:
        print("cPanel access denied. Create a new API token on the current cPanel server and update the CPANEL_API_TOKEN GitHub secret.")
    elif "imunify" in low or "ddos" in low or "captcha" in low or "challenge" in low:
        print("Request blocked by the server security layer (Imunify360/LiteSpeed anti-DDoS). Ask the host to whitelist GitHub Actions IPs for port 2083.")
    elif text.startswith("<"):
        print("cPanel returned HTML instead of an API response. Check CPANEL_ORIGIN_IP and CPANEL_API_TOKEN.")
    else:
        print(text or "cPanel returned an empty response.")
    print("--- raw response snippet ---")
    print(snippet)
    sys.exit(1)
status = data.get("status")
if status is None:
    status = data.get("result", {}).get("status")
if status in (1, True):
    sys.exit(0)
print(json.dumps(data, ensure_ascii=False, indent=2))
sys.exit(1)
'
}

preflight_auth_check() {
  local body code
  body=$(cpanel_curl --silent --show-error --location --connect-timeout 20 --max-time 60 \
    --write-out "\n%{http_code}" --header "$AUTH_HEADER" \
    "${API_BASE}/execute/Fileman/list_files?dir=$(urlencode "${CPANEL_HOME%/}")&types=dir" || true)
  code="${body##*$'\n'}"
  body="${body%$'\n'*}"
  echo "Preflight cPanel auth check: HTTP ${code}"
  if [[ "$body" != \{* ]]; then
    echo "Preflight response (first 300 chars): ${body:0:300}"
    if [[ "${body,,}" == *"access denied"* ]]; then
      echo "❌ cPanel API token rejected. Generate a new token in cPanel → Manage API Tokens and update the CPANEL_API_TOKEN secret." >&2
    else
      echo "❌ cPanel did not return an API response (likely a security/WAF page on port 2083)." >&2
    fi
    exit 1
  fi
  echo "✅ cPanel API token accepted."
}


cpanel_api2_mkdir() {
  local parent="$1"
  local name="$2"
  local response
  local endpoint="${API_BASE}/json-api/cpanel?cpanel_jsonapi_user=$(urlencode "$CPANEL_USER")&cpanel_jsonapi_apiversion=2&cpanel_jsonapi_module=Fileman&cpanel_jsonapi_func=mkdir&path=$(urlencode "$parent")&name=$(urlencode "$name")&permissions=0755"

  response=$(cpanel_curl --silent --show-error --location --connect-timeout 20 --max-time 90 --retry 3 --retry-delay 5 \
    --header "$AUTH_HEADER" "$endpoint" || true)

  # mkdir may report an error when the folder already exists; uploads will validate the final state.
  if [[ "$response" == *"\"result\":0"* || "$response" == *"\"status\":0"* ]]; then
    echo "mkdir notice: ${parent}/${name} may already exist or was not created by API2"
  fi
}

ensure_remote_dir() {
  local relative_dir="$1"
  relative_dir="${relative_dir#/}"
  relative_dir="${relative_dir%/}"
  [[ -z "$relative_dir" ]] && return 0

  local current="$CPANEL_HOME"
  IFS='/' read -r -a parts <<< "$relative_dir"
  for part in "${parts[@]}"; do
    [[ -z "$part" || "$part" == "." ]] && continue
    cpanel_api2_mkdir "$current" "$part"
    current="${current}/${part}"
  done
}

upload_file() {
  local file="$1"
  local rel="${file#${LOCAL_DIR%/}/}"
  local dir
  local base
  dir="$(dirname "$rel")"
  base="$(basename "$rel")"

  local remote_subdir="$REMOTE_DIR"
  if [[ "$dir" != "." ]]; then
    remote_subdir="${REMOTE_DIR}/${dir}"
  fi

  ensure_remote_dir "$remote_subdir"

  # cPanel Fileman/upload_files requires an ABSOLUTE dir path, otherwise the
  # upload silently succeeds with an empty result and no file is written.
  local absolute_dir="${CPANEL_HOME%/}/${remote_subdir#/}"

  echo "Uploading ${rel} -> ${absolute_dir}/${base}"
  cpanel_curl --silent --show-error --location --connect-timeout 20 --max-time 180 --retry 3 --retry-delay 5 \
    --header "$AUTH_HEADER" \
    --form "dir=${absolute_dir}" \
    --form "overwrite=1" \
    --form "permissions=0644" \
    --form "file-1=@${file};filename=${base}" \
    "${API_BASE}/execute/Fileman/upload_files" | check_json_status
}

echo "Deploying ${LOCAL_DIR} to cPanel:${REMOTE_DIR} via HTTPS API"
echo "Remote absolute path: ${CPANEL_HOME%/}/${REMOTE_DIR#/}"
if [[ -n "${CPANEL_ORIGIN_IP:-}" ]]; then
  echo "Bypassing Cloudflare: ${CPANEL_HOST}:${CPANEL_PORT} -> ${CPANEL_ORIGIN_IP}:${CPANEL_PORT}"
fi

mapfile -d '' files < <(find "$LOCAL_DIR" -type f -print0 | sort -z)

if [[ "${#files[@]}" -eq 0 ]]; then
  echo "No files found in ${LOCAL_DIR}" >&2
  exit 1
fi

preflight_auth_check
ensure_remote_dir "$REMOTE_DIR"

for file in "${files[@]}"; do
  upload_file "$file"
done

echo "cPanel API deploy completed: ${#files[@]} files uploaded."