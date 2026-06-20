#!/usr/bin/env bash
# Convenience script: starts the FastAPI backend and the Vite frontend together.
# Press Ctrl+C to stop both.
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# --- Backend ---
if [ ! -d "$ROOT/backend/venv" ]; then
  echo "Creating Python virtual environment…"
  python3 -m venv "$ROOT/backend/venv"
  "$ROOT/backend/venv/bin/pip" install -q -r "$ROOT/backend/requirements.txt"
fi

echo "Starting backend on http://localhost:8000 …"
( cd "$ROOT/backend" && ./venv/bin/uvicorn app.main:app --reload --port 8000 ) &
BACKEND_PID=$!

# --- Frontend ---
if [ ! -d "$ROOT/frontend/node_modules" ]; then
  echo "Installing frontend dependencies…"
  ( cd "$ROOT/frontend" && npm install )
fi

echo "Starting frontend on http://localhost:5173 …"
( cd "$ROOT/frontend" && npm run dev ) &
FRONTEND_PID=$!

trap 'echo; echo "Stopping…"; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null' INT TERM
wait
