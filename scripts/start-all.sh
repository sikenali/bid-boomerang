#!/usr/bin/env bash
# 一键启动六个子应用 + 主壳
#
#   ./scripts/start-all.sh              # 只启动子应用前端与主壳（最快）
#   WITH_BACKEND=1 ./scripts/start-all.sh   # 额外启动子应用后端（bid-extractor / bid-maker）
#
# 说明：子应用后端较重（Go / Node 服务），日常联调 UI 不需要，默认不启动。

set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OPC_ROOT="$(dirname "$ROOT")"
LOG_DIR="${LOG_DIR:-/tmp/bid-boomerang}"
mkdir -p "$LOG_DIR"

SUB_PORTS=(5101 5102 5103 5104 5105 5106)
SHELL_PORT=5173

# 应用名 -> 端口 / 前端目录
declare -A APP_PORT=(
  [bid-extractor]=5101
  [bid-maker]=5102
  [bid-typesetting]=5103
  [bid-quotation]=5104
  [bid-compare]=5105
  [bid-checker]=5106
)

# 释放端口占用
echo "释放端口…"
for port in "${SUB_PORTS[@]}" "$SHELL_PORT"; do
  pid=$(ss -tlnp 2>/dev/null | grep ":$port " | grep -oP 'pid=\K[0-9]+' | head -1)
  if [ -n "$pid" ]; then
    kill -9 "$pid" 2>/dev/null || true
  fi
done
sleep 1

# 并行启动子应用前端
echo "启动子应用…"
for app in "${!APP_PORT[@]}"; do
  app_dir="$OPC_ROOT/$app"
  [ -d "$app_dir/frontend" ] && app_dir="$app_dir/frontend"
  if [ ! -d "$app_dir" ]; then
    echo "  $app 跳过（目录不存在：$app_dir）"
    continue
  fi
  (cd "$app_dir" && nohup npm run dev >"$LOG_DIR/$app.log" 2>&1 &) 
  echo "  $app -> :${APP_PORT[$app]}（日志 $LOG_DIR/$app.log）"
done

# 可选：启动子应用后端
if [ "${WITH_BACKEND:-0}" = "1" ]; then
  echo "启动子应用后端…"
  for app in bid-extractor bid-maker; do
    app_dir="$OPC_ROOT/$app"
    [ -d "$app_dir" ] || continue
    (cd "$app_dir" && nohup npm run dev:backend >"$LOG_DIR/$app-backend.log" 2>&1 &)
    echo "  $app backend（日志 $LOG_DIR/$app-backend.log）"
  done
fi

# 等待子应用就绪
echo "等待子应用就绪…"
ready=0
for i in $(seq 1 120); do
  ready=0
  for port in "${SUB_PORTS[@]}"; do
    code=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 1 "http://127.0.0.1:$port/" 2>/dev/null)
    if [ "$code" = "200" ]; then
      ready=$((ready + 1))
    fi
  done
  if [ "$ready" -ge 6 ]; then
    echo "全部子应用就绪（$ready/6）。"
    break
  fi
  [ $((i % 5)) -eq 0 ] && echo "  $ready/6 就绪…（${i}s）"
  sleep 1
done

if [ "$ready" -lt 6 ]; then
  echo "警告：仅 $ready/6 个子应用就绪，请查看 $LOG_DIR/*.log"
fi

# 启动主壳
echo "启动主壳…"
(cd "$ROOT" && nohup npm run dev >"$LOG_DIR/shell.log" 2>&1 &)

for i in $(seq 1 30); do
  code=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 1 "http://127.0.0.1:$SHELL_PORT/" 2>/dev/null)
  if [ "$code" = "200" ]; then
    break
  fi
  sleep 1
done

echo ""
echo "主壳    http://localhost:$SHELL_PORT/"
echo "子应用  127.0.0.1:5101-5106"
echo "日志    $LOG_DIR/"
