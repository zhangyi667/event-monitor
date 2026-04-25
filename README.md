# Smart Contract Event Monitor

A Java-based application that monitors Ethereum blockchain events in real-time, stores them in PostgreSQL, and exposes them via REST API. This project demonstrates web3 development skills, backend Java development with Spring Boot, and Kubernetes deployment capabilities.

## Features

- 🔗 **Real-time Event Monitoring**: Listens to ERC20 Transfer events via WebSocket
- 💾 **Persistent Storage**: Stores events in PostgreSQL with optimized indexes
- 🚀 **REST API**: Query events with pagination, filtering, and sorting
- 🐳 **Kubernetes-Ready**: Production-ready K8s manifests with health checks
- 📊 **Statistics**: Aggregate metrics about stored events
- 🔍 **OpenAPI/Swagger**: Interactive API documentation
- 🛡️ **Health Checks**: Liveness and readiness probes for K8s
- 📈 **Prometheus Metrics**: Production-grade monitoring with custom metrics and Grafana dashboards

## Technology Stack

- **Java**: 21 (Latest LTS)
- **Framework**: Spring Boot 3.2.x
- **Build Tool**: Gradle 8.x with Kotlin DSL
- **Web3 Library**: web3j 4.12.0
- **Database**: PostgreSQL 16
- **ORM**: Spring Data JPA with Hibernate
- **API**: Spring Web (REST)
- **Monitoring**: Prometheus + Micrometer, Grafana
- **Deployment**: Kubernetes

## Project Structure

```
event-monitor/
├── src/main/java/com/web3/eventmonitor/
│   ├── EventMonitorApplication.java   # Main application
│   ├── config/                         # Configuration classes
│   │   ├── Web3jConfig.java           # Web3j setup
│   │   ├── AsyncConfig.java           # Async processing
│   │   └── MetricsConfig.java         # Prometheus metrics
│   ├── model/
│   │   ├── entity/
│   │   │   └── TransferEvent.java     # JPA entity
│   │   └── dto/                        # Data Transfer Objects
│   ├── repository/
│   │   └── TransferEventRepository.java
│   ├── service/
│   │   ├── EventListenerService.java  # Event monitoring
│   │   └── EventQueryService.java     # Business logic
│   └── controller/
│       ├── EventController.java       # REST endpoints
│       └── HealthController.java      # Health checks
├── src/main/resources/
│   ├── application.yml                 # Configuration
│   ├── db/migration/                   # Flyway migrations
│   └── contracts/ERC20.json           # Contract ABI
├── k8s/                                # Kubernetes manifests
│   ├── namespace.yml
│   ├── configmap.yml
│   ├── secret.yml.example
│   ├── postgres/                       # PostgreSQL setup
│   ├── app/                            # Application deployment
│   └── prometheus/                     # Prometheus monitoring
├── Dockerfile                          # Container image
└── build.gradle.kts                   # Build configuration
```

## Prerequisites

- Java 21
- Gradle 8.x (or use the wrapper)
- PostgreSQL 16 (for local development)
- Docker (for containerization)
- Kubernetes cluster (minikube, Docker Desktop, or cloud)
- Infura or Alchemy account (for Ethereum node access)

## Setup Instructions

### 1. Clone the Repository

```bash
cd event-monitor
```

### 2. Configure Environment Variables

Create a `.env` file or export the following variables:

```bash
# Database
export DATABASE_URL="jdbc:postgresql://localhost:5432/eventmonitor"
export DATABASE_USER="postgres"
export DATABASE_PASSWORD="your-password"

# Web3j (Infura/Alchemy WebSocket URL)
export WEB3J_CLIENT_ADDRESS="wss://sepolia.infura.io/ws/v3/YOUR_PROJECT_ID"

# Contract to monitor (e.g., USDC on Sepolia)
export CONTRACT_ADDRESS="0x1234567890123456789012345678901234567890"

# Starting block (use "latest" or specific block number)
export START_BLOCK="latest"
```

### 3. Set Up Infura/Alchemy

1. Sign up for a free account at [Infura](https://infura.io) or [Alchemy](https://www.alchemy.com)
2. Create a new project
3. Get your WebSocket URL (format: `wss://sepolia.infura.io/ws/v3/YOUR_PROJECT_ID`)
4. Use Sepolia testnet for testing

### 4. Start PostgreSQL (Local Development)

Using Docker:

```bash
docker run -d \
  --name event-monitor-postgres \
  -p 5432:5432 \
  -e POSTGRES_DB=eventmonitor \
  -e POSTGRES_PASSWORD=postgres \
  postgres:16-alpine
```

### 5. Build the Application

```bash
./gradlew build
```

### 6. Run the Application

```bash
export PATH="/opt/homebrew/opt/openjdk@21/bin:$PATH"
./gradlew bootRun
```

Or run the JAR directly:

```bash
java -jar build/libs/event-monitor-0.0.1-SNAPSHOT.jar
```

### 7. Access the Application

- **API**: http://localhost:8080/api/events
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **Health Check**: http://localhost:8080/health/ready
- **Prometheus Metrics**: http://localhost:8080/actuator/prometheus

## API Endpoints

### Events

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | Get all events (paginated) |
| GET | `/api/events/address/{address}` | Get events by address (from OR to) |
| GET | `/api/events/from/{fromAddress}` | Get events sent from address |
| GET | `/api/events/to/{toAddress}` | Get events received by address |
| GET | `/api/events/contract/{contractAddress}` | Get events from contract |
| GET | `/api/events/blocks?startBlock={n}&endBlock={m}` | Get events by block range |
| GET | `/api/events/stats` | Get event statistics |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health/live` | Liveness probe |
| GET | `/health/ready` | Readiness probe |

### Query Parameters

- `page`: Page number (0-indexed, default: 0)
- `size`: Page size (default: 50)
- `sortBy`: Sort field and direction (e.g., `blockNumber,desc`)

### Example Requests

```bash
# Get all events
curl http://localhost:8080/api/events

# Get events for a specific address
curl http://localhost:8080/api/events/address/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb

# Get events with custom pagination
curl "http://localhost:8080/api/events?page=0&size=20&sortBy=blockTimestamp,asc"

# Get statistics
curl http://localhost:8080/api/events/stats

# Health check
curl http://localhost:8080/health/ready
```

## Kubernetes Deployment

### 1. Build Docker Image

```bash
docker build -t event-monitor:latest .
```

### 2. Load Image to Kubernetes (if using minikube)

```bash
minikube image load event-monitor:latest
```

### 3. Create Secrets

Copy the example secret file and update with your values:

```bash
cp k8s/secret.yml.example k8s/secret.yml
```

Encode your values to base64:

```bash
# Database password
echo -n "your-password" | base64

# Infura WebSocket URL
echo -n "wss://sepolia.infura.io/ws/v3/YOUR_PROJECT_ID" | base64

# Contract address
echo -n "0x1234567890123456789012345678901234567890" | base64
```

Update `k8s/secret.yml` with the encoded values.

### 4. Deploy to Kubernetes

```bash
# Create namespace
kubectl apply -f k8s/namespace.yml

# Create ConfigMap and Secrets
kubectl apply -f k8s/configmap.yml
kubectl apply -f k8s/secret.yml

# Deploy PostgreSQL
kubectl apply -f k8s/postgres/

# Wait for PostgreSQL to be ready
kubectl wait --for=condition=ready pod -l app=postgres -n event-monitor --timeout=120s

# Deploy application
kubectl apply -f k8s/app/

# Deploy Prometheus monitoring (optional but recommended)
kubectl apply -f k8s/prometheus/

# Optional: Deploy Ingress
kubectl apply -f k8s/ingress.yml
```

### 5. Verify Deployment

```bash
# Check pods
kubectl get pods -n event-monitor

# Check logs
kubectl logs -f deployment/event-monitor -n event-monitor

# Port forward to access locally
kubectl port-forward svc/event-monitor-service 8080:8080 -n event-monitor
```

### 6. Test the Deployment

```bash
# Health check
curl http://localhost:8080/health/ready

# Get events
curl http://localhost:8080/api/events
```

### 7. Scale the Deployment

```bash
# Manual scaling
kubectl scale deployment event-monitor --replicas=3 -n event-monitor

# Enable HPA (Horizontal Pod Autoscaler)
kubectl apply -f k8s/app/hpa.yml
```

## Testing with a Test ERC20 Contract

If you don't have an ERC20 contract on Sepolia, you can:

1. **Deploy a test token**: Use Remix IDE to deploy a simple ERC20 contract
2. **Use an existing token**: Find an existing ERC20 token on Sepolia
3. **Trigger transfers**: Send test transactions to generate events

Example test token contract addresses on Sepolia:
- Check [Sepolia Etherscan](https://sepolia.etherscan.io/) for test tokens

## Monitoring and Logs

### View Logs

```bash
# Application logs
kubectl logs -f deployment/event-monitor -n event-monitor

# PostgreSQL logs
kubectl logs -f statefulset/postgres -n event-monitor

# Stream logs from all pods
kubectl logs -f -l app=event-monitor -n event-monitor
```

### Metrics

Access Spring Boot Actuator endpoints:

```bash
curl http://localhost:8080/actuator/health
curl http://localhost:8080/actuator/metrics
curl http://localhost:8080/actuator/prometheus  # Prometheus metrics
```

## Prometheus Monitoring

The application includes production-grade monitoring with Prometheus and custom metrics.

### Custom Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `events_captured_total` | Counter | Total blockchain events received |
| `events_saved_total` | Counter | Events successfully saved to database |
| `events_duplicates_total` | Counter | Duplicate events skipped |
| `events_errors_total` | Counter | Event processing errors |
| `events_processing_duration_seconds` | Timer | Event processing time (histogram) |
| `web3j_connection_status` | Gauge | WebSocket connection status (0=down, 1=up) |
| `blockchain_current_block` | Gauge | Current blockchain block number |

### Deploy Prometheus

```bash
# Deploy Prometheus to Kubernetes
kubectl apply -f k8s/prometheus/

# Verify Prometheus is running
kubectl get pods -n event-monitor -l app=prometheus

# Access Prometheus UI
kubectl port-forward svc/prometheus-service 9090:9090 -n event-monitor
open http://localhost:9090
```

### Example Prometheus Queries

```promql
# Total events captured
events_captured_total

# Events captured rate (per minute)
rate(events_captured_total[1m]) * 60

# Average event processing time (milliseconds)
rate(events_processing_duration_seconds_sum[5m]) / rate(events_processing_duration_seconds_count[5m]) * 1000

# 95th percentile processing time
histogram_quantile(0.95, rate(events_processing_duration_seconds_bucket[5m]))

# Success rate percentage
(rate(events_saved_total[5m]) / rate(events_captured_total[5m])) * 100

# Error rate
rate(events_errors_total[5m])

# WebSocket connection status (1=connected, 0=disconnected)
web3j_connection_status

# JVM heap memory usage percentage
jvm_memory_used_bytes{area="heap"} / jvm_memory_max_bytes{area="heap"} * 100
```

### Grafana Dashboards

Deploy Grafana for visualization:

```bash
# Deploy Grafana
kubectl create deployment grafana --image=grafana/grafana:latest -n event-monitor
kubectl expose deployment grafana --port=3000 --type=ClusterIP -n event-monitor

# Access Grafana
kubectl port-forward svc/grafana 3000:3000 -n event-monitor
open http://localhost:3000
```

**Configure Grafana:**

1. Login with `admin` / `admin` (change password on first login)
2. Add Prometheus data source:
   - URL: `http://prometheus-service:9090`
   - Click "Save & Test"
3. Import the pre-built dashboard:
   - Go to Dashboards → Import
   - Upload `k8s/prometheus/grafana-dashboard.json`

See [PROMETHEUS_GUIDE.md](PROMETHEUS_GUIDE.md) for detailed setup instructions and advanced configuration.

## Database Schema

The application uses Flyway for database migrations. The schema is automatically created on startup.

**transfer_events table:**

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| contract_address | VARCHAR(42) | Contract that emitted the event |
| from_address | VARCHAR(42) | Sender address |
| to_address | VARCHAR(42) | Receiver address |
| value | NUMERIC(78,0) | Token amount transferred |
| transaction_hash | VARCHAR(66) | Transaction hash (unique) |
| block_number | BIGINT | Block number |
| block_timestamp | TIMESTAMP | Block timestamp |
| created_at | TIMESTAMP | Record creation time |

**Indexes:**
- contract_address, from_address, to_address, block_number, block_timestamp

## Configuration

### Application Properties

Configuration is managed through `application.yml` and environment variables:

| Property | Environment Variable | Default | Description |
|----------|---------------------|---------|-------------|
| `spring.datasource.url` | `DATABASE_URL` | `jdbc:postgresql://localhost:5432/eventmonitor` | Database URL |
| `spring.datasource.username` | `DATABASE_USER` | `postgres` | Database user |
| `spring.datasource.password` | `DATABASE_PASSWORD` | `postgres` | Database password |
| `web3j.client-address` | `WEB3J_CLIENT_ADDRESS` | - | Ethereum node WebSocket URL |
| `web3j.contract.address` | `CONTRACT_ADDRESS` | - | Contract to monitor |
| `web3j.contract.start-block` | `START_BLOCK` | `latest` | Starting block |

### Profiles

- **dev**: Development profile with verbose logging
- **prod**: Production profile with optimized settings

Activate profile:

```bash
export SPRING_PROFILES_ACTIVE=dev
./gradlew bootRun
```

## Troubleshooting

### Application won't start

1. Check Java version: `java --version` (must be 21)
2. Verify database is running: `docker ps`
3. Check environment variables are set
4. Review logs: `./gradlew bootRun --stacktrace`

### No events being captured

1. Verify WebSocket connection in logs
2. Check contract address is correct
3. Ensure there are actual Transfer events on the contract
4. Try triggering a test transaction

### Database connection errors

1. Verify PostgreSQL is running
2. Check connection string format
3. Ensure database `eventmonitor` exists
4. Verify credentials

### Kubernetes pod not ready

```bash
# Check pod status
kubectl describe pod <pod-name> -n event-monitor

# Check logs
kubectl logs <pod-name> -n event-monitor

# Verify secrets are correct
kubectl get secret event-monitor-secret -n event-monitor -o yaml
```

## Development

### Running Tests

```bash
./gradlew test
```

### Code Quality

```bash
# Check for compilation errors
./gradlew compileJava

# Run all checks
./gradlew check
```

### Hot Reload (Development)

Use Spring Boot DevTools for hot reload during development (already included in dependencies).

## Next Steps (Post-MVP)

- [ ] Add support for multiple contracts
- [ ] Implement WebSocket streaming for real-time updates
- [ ] Add Kafka for event processing pipeline
- [ ] Implement data aggregation and analytics
- [x] Add Prometheus metrics and Grafana dashboards ✅
- [ ] Implement historical event replay
- [ ] Support more event types (Swap, Mint, Burn, etc.)
- [ ] Build frontend dashboard
- [ ] Add Alertmanager for notifications

## Architecture

```
┌─────────────────┐
│  Ethereum Node  │
│ (Infura/Alchemy)│
└────────┬────────┘
         │ WebSocket
         │
┌────────▼────────────────────┐
│    Event Listener Service   │
│         (Web3j)             │
│  ┌──────────────────────┐   │
│  │  Metrics Collection  │   │──────┐
│  │   (Micrometer)       │   │      │ /actuator/prometheus
│  └──────────────────────┘   │      │
└────────┬────────────────────┘      │
         │ Parse & Save              │
         │                           │
┌────────▼────────┐           ┌──────▼──────┐
│   PostgreSQL    │           │ Prometheus  │
│   (Events DB)   │           │   Server    │
└────────┬────────┘           └──────┬──────┘
         │                           │
         │ Query                     │ Visualize
         │                           │
┌────────▼────────┐           ┌──────▼──────┐
│   REST API      │           │   Grafana   │
│ (Spring Boot)   │           │  Dashboard  │
└─────────────────┘           └─────────────┘
```

## Contributing

This is a portfolio project, but suggestions and improvements are welcome!

## License

MIT License - feel free to use this project for learning and portfolio purposes.

## Author

Built as a portfolio project to demonstrate:
- Backend Java development
- Web3/Blockchain integration
- Microservices architecture
- Kubernetes deployment skills
- Real-time event processing

## Support

For questions or issues:
1. Check the logs
2. Review the troubleshooting section
3. Check Infura/Alchemy dashboard for quota limits
4. Verify Sepolia testnet is operational

## References

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [web3j Documentation](https://docs.web3j.io/)
- [Ethereum JSON-RPC API](https://ethereum.org/en/developers/docs/apis/json-rpc/)
- [ERC20 Token Standard](https://eips.ethereum.org/EIPS/eip-20)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Micrometer Documentation](https://micrometer.io/docs)
- [Grafana Documentation](https://grafana.com/docs/)

## Additional Documentation

- [PROMETHEUS_GUIDE.md](PROMETHEUS_GUIDE.md) - Detailed Prometheus setup and usage guide
- [ROADMAP.md](ROADMAP.md) - Future features and enhancements roadmap
