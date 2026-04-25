#!/bin/bash

# Local Development Setup Script
# This script sets up and runs the application locally with Docker PostgreSQL

set -e

echo "==================================="
echo "Event Monitor Local Setup"
echo "==================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

# Step 1: Start PostgreSQL container
echo ""
echo "Step 1: Starting PostgreSQL container..."
if docker ps -a --format '{{.Names}}' | grep -q '^event-monitor-postgres$'; then
    echo "PostgreSQL container already exists. Starting it..."
    docker start event-monitor-postgres
else
    echo "Creating new PostgreSQL container..."
    docker run -d \
        --name event-monitor-postgres \
        -p 5432:5432 \
        -e POSTGRES_DB=eventmonitor \
        -e POSTGRES_USER=postgres \
        -e POSTGRES_PASSWORD=postgres \
        postgres:16-alpine
fi

# Step 2: Wait for PostgreSQL to be ready
echo ""
echo "Step 2: Waiting for PostgreSQL to be ready..."
sleep 5

# Step 2.5: Load .env file if it exists
if [ -f .env ]; then
    echo ""
    echo "Loading environment variables from .env file..."
    set -a  # automatically export all variables
    source .env
    set +a
fi

# Step 3: Check environment variables
echo ""
echo "Step 3: Checking environment variables..."
if [ -z "$WEB3J_CLIENT_ADDRESS" ]; then
    echo "Warning: WEB3J_CLIENT_ADDRESS not set!"
    echo "Please set the following environment variables:"
    echo ""
    echo "export WEB3J_CLIENT_ADDRESS='wss://sepolia.infura.io/ws/v3/YOUR_PROJECT_ID'"
    echo "export CONTRACT_ADDRESS='0x...'"
    echo ""
    read -p "Do you want to continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Step 4: Set default environment variables if not set
export DATABASE_URL="${DATABASE_URL:-jdbc:postgresql://localhost:5432/eventmonitor}"
export DATABASE_USER="${DATABASE_USER:-postgres}"
export DATABASE_PASSWORD="${DATABASE_PASSWORD:-postgres}"
export START_BLOCK="${START_BLOCK:-latest}"
export SPRING_PROFILES_ACTIVE="${SPRING_PROFILES_ACTIVE:-dev}"

# Display configuration
echo ""
echo "==================================="
echo "Configuration"
echo "==================================="
echo "Database URL: $DATABASE_URL"
echo "Database User: $DATABASE_USER"
echo "Web3j Client: ${WEB3J_CLIENT_ADDRESS:-NOT SET}"
echo "Contract Address: ${CONTRACT_ADDRESS:-NOT SET}"
echo "Start Block: $START_BLOCK"
echo "Active Profile: $SPRING_PROFILES_ACTIVE"
echo "==================================="

# Step 5: Build the application
echo ""
echo "Step 4: Building application..."
export PATH="/opt/homebrew/opt/openjdk@21/bin:$PATH"
./gradlew build -x test

# Step 6: Run the application
echo ""
echo "Step 5: Starting application..."
echo ""
echo "Application will be available at:"
echo "  API: http://localhost:8080/api/events"
echo "  Swagger UI: http://localhost:8080/swagger-ui.html"
echo "  Health: http://localhost:8080/health/ready"
echo ""
echo "Press Ctrl+C to stop"
echo ""

./gradlew bootRun
