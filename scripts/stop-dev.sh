#!/usr/bin/env bash

set -u

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FAILURES=0


stop_server() {
  local name="$1"
  local port="$2"
  local expected_directory="$3"
  local pids
  local stopped=false

  pids="$(fuser "${port}/tcp" 2>/dev/null || true)"

  if [[ -z "$pids" ]]; then
    echo "$name is not running on port $port."
    return
  fi

  for pid in $pids; do
    process_directory="$(
      readlink -f "/proc/$pid/cwd" 2>/dev/null || true
    )"

    if [[ "$process_directory" == "$expected_directory" ]]; then
      echo "Stopping $name process $pid on port $port…"
      kill "$pid"
      stopped=true
    else
      echo "Refusing to stop process $pid on port $port."
      echo "Its working directory is not part of FlowSnap:"
      echo "${process_directory:-unknown}"
      FAILURES=$((FAILURES + 1))
    fi
  done

  if [[ "$stopped" == true ]]; then
    sleep 1

    if fuser "${port}/tcp" >/dev/null 2>&1; then
      echo "$name is still using port $port."
      FAILURES=$((FAILURES + 1))
    else
      echo "$name stopped successfully."
    fi
  fi
}


if ! command -v fuser >/dev/null 2>&1; then
  echo "The fuser command is required but was not found."
  exit 1
fi


echo
echo "Stopping FlowSnap development servers"
echo "====================================="

stop_server "Backend" "8000" "$BACKEND_DIR"
stop_server "Frontend" "5500" "$PROJECT_DIR"

echo
if [[ "$FAILURES" -eq 0 ]]; then
  echo "FlowSnap development servers are stopped."
  exit 0
fi

echo "$FAILURES FlowSnap server(s) could not be stopped safely."
exit 1
