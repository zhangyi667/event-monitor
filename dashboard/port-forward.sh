#!/bin/bash
# Persistent port-forward script that auto-restarts

echo "Starting persistent port-forward for backend..."

while true; do
    echo "[$(date)] Starting port-forward to backend service..."
    kubectl port-forward -n event-monitor svc/event-monitor-service 30081:8080

    # If port-forward exits, wait a moment and restart
    echo "[$(date)] Port-forward died, restarting in 2 seconds..."
    sleep 2
done
