#!/usr/bin/env bash
# Deploy a local directory to cPanel over SSH/rsync (port 22 or custom).
# Bypasses cPanel UAPI (2083) entirely, so Imunify360 bot-protection on the
# HTTPS API cannot block it.
#
# Usage: bash scripts/deploy-ssh.sh <local-dir> <remote-dir-relative-to-home>
# Required env: SSH_HOST, SSH_USER, SSH_PRIVATE_KEY
# Optional env: SSH_PORT (default 22), SSH_DELETE ("1" to rsync --delete)

set -euo pipefail

LOCAL_DIR="${1:?local directory required}"
REMOTE_DIR="${2:?remote directory required}"

SSH_HOST="${SSH_HOST:?SSH_HOST is required}"
SSH_USER="${SSH_USER:?SSH_USER is required}"
SSH_PRIVATE_KEY="${SSH_PRIVATE_KEY:?SSH_PRIVATE_KEY is required}"
SSH_PORT="${SSH_PORT:-22}"
SSH_DELETE="${SSH_DELETE:-0}"

KEY_FILE="$(mktemp)"
trap 'rm -f "$KEY_FILE"' EXIT
printf '%s\n' "$SSH_PRIVATE_KEY" > "$KEY_FILE"
chmod 600 "$KEY_FILE"

SSH_CMD="ssh -i $KEY_FILE -p $SSH_PORT -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"

DELETE_FLAG=""
if [ "$SSH_DELETE" = "1" ]; then
  DELETE_FLAG="--delete"
fi

echo "📁 Ensuring remote directory: $REMOTE_DIR"
$SSH_CMD "$SSH_USER@$SSH_HOST" "mkdir -p '$REMOTE_DIR'"

echo "⬆️  rsync: $LOCAL_DIR/ -> $SSH_USER@$SSH_HOST:$REMOTE_DIR/"
rsync -az $DELETE_FLAG \
  --exclude '.git' --exclude 'node_modules' --exclude '.env' \
  -e "$SSH_CMD" \
  "$LOCAL_DIR/" "$SSH_USER@$SSH_HOST:$REMOTE_DIR/"

echo "✅ SSH deploy complete: $REMOTE_DIR"
