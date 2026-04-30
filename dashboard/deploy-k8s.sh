#!/bin/bash

# Event Monitor Dashboard - Kubernetes Deployment Script

set -e

echo "🚀 Deploying Event Monitor Dashboard to Kubernetes..."

# Build Docker image
echo "📦 Building Docker image..."
docker build -t event-monitor-dashboard:latest .

# Check if namespace exists
if ! kubectl get namespace event-monitor &> /dev/null; then
  echo "📝 Creating namespace 'event-monitor'..."
  kubectl create namespace event-monitor
else
  echo "✅ Namespace 'event-monitor' already exists"
fi

# Apply Kubernetes manifests
echo "🔧 Applying Kubernetes manifests..."
kubectl apply -f k8s/deployment.yml
kubectl apply -f k8s/service.yml

# Wait for deployment to be ready
echo "⏳ Waiting for deployment to be ready..."
kubectl rollout status deployment/event-monitor-dashboard -n event-monitor --timeout=300s

# Get service info
echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Service Information:"
kubectl get service event-monitor-dashboard-service -n event-monitor

echo ""
echo "🌐 Access the dashboard at:"
echo "   http://localhost:30080"
echo ""
echo "📝 Useful commands:"
echo "   kubectl get pods -n event-monitor -l app=event-monitor-dashboard"
echo "   kubectl logs -f deployment/event-monitor-dashboard -n event-monitor"
echo "   kubectl describe deployment event-monitor-dashboard -n event-monitor"
