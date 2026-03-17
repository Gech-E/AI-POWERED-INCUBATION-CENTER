#!/usr/bin/env bash
# ── MU Innovation Hub — Production Start Script ────────────────────
# Used by Render (and Docker) to start the backend.
# Render injects $PORT automatically; default to 8000 locally.

set -e

PORT="${PORT:-8000}"
WORKERS="${WEB_CONCURRENCY:-4}"

echo "Starting MU Innovation Hub on port $PORT with $WORKERS workers..."

exec gunicorn app.main:app \
    --workers "$WORKERS" \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind "0.0.0.0:$PORT" \
    --timeout 120 \
    --access-logfile -
