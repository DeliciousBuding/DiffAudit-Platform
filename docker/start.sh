#!/bin/sh
# DiffAudit Platform — merged container startup
# Starts Go API (background) + Next.js (foreground).
# tini as PID 1 handles zombie reaping + signal forwarding.
# trap ensures clean shutdown on SIGTERM/SIGINT.

set -e

echo "[platform] starting Go API on :8780..."
platform-api --host 0.0.0.0 --port 8780 &
API_PID=$!

echo "[platform] starting Next.js on :${PORT:-3000}..."
node /app/apps/web/server.js &
WEB_PID=$!

cleanup() {
    echo "[platform] shutting down..."
    kill $API_PID $WEB_PID 2>/dev/null
    wait $API_PID $WEB_PID 2>/dev/null
    echo "[platform] stopped."
    exit 0
}

trap cleanup SIGTERM SIGINT

# Wait for either process to exit
wait -n
EXIT_CODE=$?
echo "[platform] process exited with code $EXIT_CODE, shutting down..."
cleanup
