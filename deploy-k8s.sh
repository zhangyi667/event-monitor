#!/bin/bash

# Kubernetes Deployment Script for Event Monitor
# This script deploys the entire application stack to Kubernetes

set -e

echo "==================================="
echo "Event Monitor K8s Deployment Script"
echo "==================================="

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "Error: kubectl is not installed or not in PATH"
    exit 1
fi

# Check if docker is available
if ! command -v docker &> /dev/null; then
    echo "Error: docker is not installed or not in PATH"
    exit 1
fi

# Step 1: Build Docker image
echo ""
echo "Step 1: Building Docker image..."
docker build -t event-monitor:latest .

# Step 2: Load image to minikube (if using minikube)
if command -v minikube &> /dev/null && minikube status &> /dev/null; then
    echo ""
    echo "Step 2: Loading image to minikube..."
    minikube image load event-monitor:latest
else
    echo ""
    echo "Step 2: Skipping minikube image load (not using minikube)"
fi

# Step 3: Check for secrets
echo ""
echo "Step 3: Checking for secrets file..."
if [ ! -f "k8s/secret.yml" ]; then
    echo "Warning: k8s/secret.yml not found!"
    echo "Please copy k8s/secret.yml.example to k8s/secret.yml and update with your values."
    echo ""
    echo "To create base64 encoded values:"
    echo "  echo -n 'your-value' | base64"
    echo ""
    read -p "Do you want to continue without secrets? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Step 4: Create namespace
echo ""
echo "Step 4: Creating namespace..."
kubectl apply -f k8s/namespace.yml

# Step 5: Create ConfigMap
echo ""
echo "Step 5: Creating ConfigMap..."
kubectl apply -f k8s/configmap.yml

# Step 6: Create Secrets (if file exists)
if [ -f "k8s/secret.yml" ]; then
    echo ""
    echo "Step 6: Creating Secrets..."
    kubectl apply -f k8s/secret.yml
else
    echo ""
    echo "Step 6: Skipping secrets creation (file not found)"
fi

# Step 7: Deploy PostgreSQL
echo ""
echo "Step 7: Deploying PostgreSQL..."
kubectl apply -f k8s/postgres/

# Step 8: Wait for PostgreSQL to be ready
echo ""
echo "Step 8: Waiting for PostgreSQL to be ready..."
kubectl wait --for=condition=ready pod -l app=postgres -n event-monitor --timeout=120s || true

# Step 9: Deploy application
echo ""
echo "Step 9: Deploying application..."
kubectl apply -f k8s/app/

# Step 10: Wait for application to be ready
echo ""
echo "Step 10: Waiting for application to be ready..."
kubectl wait --for=condition=ready pod -l app=event-monitor -n event-monitor --timeout=120s || true

# Display status
echo ""
echo "==================================="
echo "Deployment Status"
echo "==================================="
kubectl get all -n event-monitor

echo ""
echo "==================================="
echo "Deployment Complete!"
echo "==================================="
echo ""
echo "To access the application:"
echo "  kubectl port-forward svc/event-monitor-service 8080:8080 -n event-monitor"
echo ""
echo "To view logs:"
echo "  kubectl logs -f deployment/event-monitor -n event-monitor"
echo ""
echo "To check pod status:"
echo "  kubectl get pods -n event-monitor"
echo ""
echo "API will be available at: http://localhost:8080/api/events"
echo "Swagger UI: http://localhost:8080/swagger-ui.html"
echo ""
