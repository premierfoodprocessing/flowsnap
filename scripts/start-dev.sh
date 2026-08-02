#!/usr/bin/env bash

set -u

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_URL="http://127.0.0.1:5500"
BACKEND_PORT="8000"
FRONTEND_PORT="5500"


port_is_running() {
  ss -ltnH "sport = :$1" | grep -q .
}


if ! command -v gnome-terminal >/dev/null 2>&1; then
  echo "FlowSnap could not find GNOME Terminal."
  exit 1
fi


if [[ ! -f "$BACKEND_DIR/.venv/bin/activate" ]]; then
  echo "FlowSnap virtual environment was not found:"
  echo "$BACKEND_DIR/.venv"
  exit 1
fi


if port_is_running "$BACKEND_PORT"; then
  echo "Backend is already running on port $BACKEND_PORT."
else
  echo "Starting FlowSnap backend…"

  gnome-terminal \
    --title="FlowSnap Backend" \
    -- \
    bash -lc '
      cd "$1"
      source .venv/bin/activate
      uvicorn app:app --reload

    ' bash "$BACKEND_DIR"
fi


if port_is_running "$FRONTEND_PORT"; then
  echo "Frontend is already running on port $FRONTEND_PORT."
else
  echo "Starting FlowSnap frontend…"

  gnome-terminal \
    --title="FlowSnap Frontend" \
    -- \
    bash -lc '
      cd "$1"
      python3 -m http.server 5500

    ' bash "$PROJECT_DIR"
fi


sleep 2

echo "Opening FlowSnap in the browser…"
xdg-open "$FRONTEND_URL" >/dev/null 2>&1 &

echo "FlowSnap development environment is ready."
