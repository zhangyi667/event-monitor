# Quick Start Guide

This guide will get you up and running in 5 minutes.

## Prerequisites

- Java 21 installed
- Docker installed and running
- Infura or Alchemy account (free tier)

## Option 1: Local Development (Fastest)

### 1. Get Infura Credentials

1. Sign up at https://infura.io (free)
2. Create a new project
3. Copy your WebSocket URL: `wss://sepolia.infura.io/ws/v3/YOUR_PROJECT_ID`

### 2. Set Environment Variables

```bash
# Required
export WEB3J_CLIENT_ADDRESS="wss://sepolia.infura.io/ws/v3/YOUR_PROJECT_ID"
export CONTRACT_ADDRESS="0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"  # USDC on Sepolia

# Optional (defaults provided)
export START_BLOCK="latest"
export DATABASE_PASSWORD="postgres"
```

### 3. Run the Application

```bash
./run-local.sh
```

This script will:
- Start PostgreSQL in Docker
- Build the application
- Start the Spring Boot app

### 4. Test the API

Open another terminal:

```bash
# Health check
curl http://localhost:8080/health/ready

# Get events
curl http://localhost:8080/api/events

# View Swagger UI
open http://localhost:8080/swagger-ui.html
```

## Option 2: Kubernetes Deployment

### 1. Set Up Secrets

```bash
# Copy the example secret file
cp k8s/secret.yml.example k8s/secret.yml

# Encode your values
echo -n "wss://sepolia.infura.io/ws/v3/YOUR_PROJECT_ID" | base64
echo -n "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238" | base64
echo -n "postgres" | base64

# Edit k8s/secret.yml and paste the base64 values
nano k8s/secret.yml
```

### 2. Deploy to Kubernetes

```bash
./deploy-k8s.sh
```

### 3. Access the Application

```bash
# Port forward to access locally
kubectl port-forward svc/event-monitor-service 8080:8080 -n event-monitor

# In another terminal, test the API
curl http://localhost:8080/api/events
```

## Finding a Test ERC20 Contract

### Use an Existing Sepolia Test Token

Here are some test ERC20 tokens on Sepolia testnet:

1. **USDC on Sepolia**: `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`
2. **DAI on Sepolia**: `0x3e622317f8C93f7328350cF0B56d9eD4C620C5d6`

You can find more at [Sepolia Etherscan](https://sepolia.etherscan.io/tokens).

### Deploy Your Own Test Token

If you want to deploy your own:

1. Go to [Remix IDE](https://remix.ethereum.org/)
2. Create a new file `TestToken.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestToken is ERC20 {
    constructor() ERC20("Test Token", "TEST") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
}
```

3. Compile and deploy to Sepolia testnet
4. Copy the contract address
5. Use it as your `CONTRACT_ADDRESS`

## Triggering Test Events

To see events in your application:

1. Get some Sepolia testnet ETH from a faucet:
   - https://sepoliafaucet.com/
   - https://www.infura.io/faucet/sepolia

2. Send a test transaction:
   - Use Remix IDE
   - Or use a wallet like MetaMask
   - Transfer some tokens to trigger Transfer events

3. Watch the logs:
   ```bash
   # Local
   # (check the terminal where you ran ./run-local.sh)

   # Kubernetes
   kubectl logs -f deployment/event-monitor -n event-monitor
   ```

## Common Issues

### "Failed to connect to Ethereum node"
- Check your Infura/Alchemy API key is correct
- Verify the WebSocket URL format: `wss://sepolia.infura.io/ws/v3/YOUR_ID`
- Check if you've exceeded your free tier quota

### "Database connection failed"
- Ensure PostgreSQL container is running: `docker ps`
- Check the password is correct
- For K8s, verify the secret is created: `kubectl get secret -n event-monitor`

### "No events appearing"
- Verify the contract address is correct
- Check if there are actually Transfer events on that contract
- Try triggering a test transaction

## Next Steps

1. **Explore the API**: Open http://localhost:8080/swagger-ui.html
2. **Check Statistics**: `curl http://localhost:8080/api/events/stats`
3. **Filter Events**: Try different API endpoints (by address, block range, etc.)
4. **Monitor Logs**: Watch events being captured in real-time
5. **Scale**: Deploy to Kubernetes and scale to multiple replicas

## Useful Commands

### Local Development

```bash
# Stop PostgreSQL
docker stop event-monitor-postgres

# Remove PostgreSQL (will delete data)
docker rm event-monitor-postgres

# View database
docker exec -it event-monitor-postgres psql -U postgres -d eventmonitor
# Then: SELECT * FROM transfer_events LIMIT 10;

# Rebuild
./gradlew clean build
```

### Kubernetes

```bash
# View all resources
kubectl get all -n event-monitor

# View logs
kubectl logs -f deployment/event-monitor -n event-monitor

# Describe pod (for troubleshooting)
kubectl describe pod <pod-name> -n event-monitor

# Scale replicas
kubectl scale deployment event-monitor --replicas=3 -n event-monitor

# Delete everything
kubectl delete namespace event-monitor
```

## API Examples

```bash
# Get all events
curl http://localhost:8080/api/events

# Get events for a specific address
curl http://localhost:8080/api/events/address/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb

# Get events with pagination
curl "http://localhost:8080/api/events?page=0&size=10"

# Get events sorted by timestamp
curl "http://localhost:8080/api/events?sortBy=blockTimestamp,asc"

# Get statistics
curl http://localhost:8080/api/events/stats

# Get events by block range
curl "http://localhost:8080/api/events/blocks?startBlock=1000000&endBlock=1000100"
```

## Success Checklist

- [ ] Application starts without errors
- [ ] Database connection successful
- [ ] Web3j connects to Ethereum node
- [ ] Health check returns status "UP"
- [ ] Swagger UI is accessible
- [ ] Events are being captured (check logs)
- [ ] API returns event data
- [ ] Statistics endpoint works

## Support

If you encounter issues:
1. Check the logs for error messages
2. Verify all environment variables are set correctly
3. Ensure PostgreSQL is running
4. Check Infura/Alchemy dashboard for quota limits
5. Review the main README.md for detailed troubleshooting

Happy monitoring! 🚀
