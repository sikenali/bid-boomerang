#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OPC_ROOT="$(dirname "$ROOT")"
LOG_DIR="/tmp/bid-boomerang"
mkdir -p "$LOG_DIR"

PORTS=(5101 5102 5103 5104 5105 5106 5173)

# Kill existing
for port in "${PORTS[@]}"; do
  pid=$(ss -tlnp 2>/dev/null | grep ":$port" | grep -oP 'pid=\K[0-9]+' | head -1)
  if [ -n "$pid" ]; then
    kill -9 "$pid" 2>/dev/null || true
  fi
done
sleep 1

# Start sub-apps
declare -A APP_PORTS=(
  [bid-extractor]=5101
  [bid-maker]=5102
  [bid-typesetting]=5103
  [bid-quotation]=5104
  [bid-compare]=5105
  [bid-checker]=5106
)

echo "Starting sub-apps..."
for app in "${!APP_PORTS[@]}"; do
  port="${APP_PORTS[$app]}"
  app_dir="$OPC_ROOT/$app"
  if [ -d "$app_dir" ]; then
    (cd "$app_dir" && nohup npm run dev &>/dev/null & disown)
    echo "  $app -> :$port (started)"
  fi
  sleep 1
done

# Wait for sub-apps
echo "Waiting for sub-apps to be ready..."
all_ready=0
for i in $(seq 1 30); do
  ready=0
  for port in 5101 5102 5103 5104 5105 5106; do
    if curl -s -o /dev/null -w "%{http_code}" --connect-timeout 1 "http://127.0.0.1:$port/" 2>/dev/null | grep -q "200"; then
      ((ready++))
    fi
  done
  if [ "$ready" -ge 6 ]; then
    all_ready=1
    echo "All $ready/6 sub-apps ready."
    break
  fi
  echo "  $ready/6 ready... (${i}s)"
  sleep 1
done

if [ "$all_ready" -ne 1 ]; then
  echo "Warning: only $ready/6 sub-apps started (check /tmp/ for details)"
fi

# Start main app
echo "Starting main app..."
cd "$ROOT"
nohup npm run dev &>/dev/null & disown
sleep 3
echo ""
echo "Main app:  http://localhost:5173/"
echo "Sub-apps:  127.0.0.1:5101-5106"
