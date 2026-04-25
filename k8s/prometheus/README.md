# Prometheus Monitoring Setup

This directory contains Kubernetes manifests for deploying Prometheus to monitor the Event Monitor application.

## What's Included

- `configmap.yml` - Prometheus configuration
- `deployment.yml` - Prometheus server deployment
- `service.yml` - Prometheus service
- `rbac.yml` - ServiceAccount and permissions for Kubernetes discovery
- `grafana-dashboard.json` - Sample Grafana dashboard

## Metrics Exposed

### Custom Application Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `events_captured_total` | Counter | Total blockchain events captured |
| `events_saved_total` | Counter | Events successfully saved to database |
| `events_duplicates_total` | Counter | Duplicate events skipped |
| `events_errors_total` | Counter | Event processing errors |
| `events_processing_duration` | Timer | Time to process and save events |
| `web3j_connection_status` | Gauge | WebSocket connection status (0/1) |
| `blockchain_current_block` | Gauge | Current blockchain block number |

### Standard Spring Boot Metrics

- JVM memory usage
- HTTP request metrics
- Database connection pool metrics
- Thread pool metrics
- And more...

## Deployment

### Deploy Prometheus

```bash
# Apply all Prometheus manifests
kubectl apply -f k8s/prometheus/

# Verify deployment
kubectl get pods -n event-monitor -l app=prometheus

# Check logs
kubectl logs -f deployment/prometheus -n event-monitor
```

### Access Prometheus UI

```bash
# Port forward to access locally
kubectl port-forward svc/prometheus-service 9090:9090 -n event-monitor

# Open in browser
open http://localhost:9090
```

## Using Prometheus

### View Metrics

1. Open http://localhost:9090
2. Go to "Graph" tab
3. Enter a metric name (e.g., `events_captured_total`)
4. Click "Execute"

### Example Queries

```promql
# Total events captured
events_captured_total

# Events captured rate (per minute)
rate(events_captured_total[1m]) * 60

# Average event processing time
rate(events_processing_duration_seconds_sum[5m]) / rate(events_processing_duration_seconds_count[5m])

# Error rate
rate(events_errors_total[5m])

# Success rate (percentage)
(rate(events_saved_total[5m]) / rate(events_captured_total[5m])) * 100

# JVM Heap usage
jvm_memory_used_bytes{area="heap"} / jvm_memory_max_bytes{area="heap"} * 100
```

## Grafana Setup (Optional)

### Deploy Grafana

```bash
# Create Grafana deployment
kubectl create deployment grafana --image=grafana/grafana:latest -n event-monitor

# Expose Grafana
kubectl expose deployment grafana --port=3000 --type=ClusterIP -n event-monitor

# Port forward
kubectl port-forward svc/grafana 3000:3000 -n event-monitor
```

### Configure Grafana

1. Open http://localhost:3000
2. Login (default: admin/admin)
3. Add Prometheus as a data source:
   - URL: `http://prometheus-service:9090`
4. Import the dashboard:
   - Click "+" → "Import"
   - Paste contents of `grafana-dashboard.json`

## Alerting Rules (Future Enhancement)

Example alert for high error rate:

```yaml
groups:
  - name: event_monitor
    rules:
      - alert: HighErrorRate
        expr: rate(events_errors_total[5m]) > 0.1
        for: 5m
        annotations:
          summary: "High event processing error rate"

      - alert: Web3jDisconnected
        expr: web3j_connection_status == 0
        for: 1m
        annotations:
          summary: "Web3j WebSocket disconnected"
```

## Troubleshooting

### Prometheus can't scrape metrics

Check that the application is exposing metrics:
```bash
kubectl port-forward svc/event-monitor-service 8080:8080 -n event-monitor
curl http://localhost:8080/actuator/prometheus
```

### No data in Prometheus

1. Check Prometheus targets: http://localhost:9090/targets
2. Verify pods are labeled correctly:
   ```bash
   kubectl get pods -n event-monitor --show-labels
   ```

### Prometheus pod crashlooping

Check logs:
```bash
kubectl logs -f deployment/prometheus -n event-monitor
```

## Production Considerations

For production deployment, consider:

- **Persistent Storage**: Use PVC instead of emptyDir for data retention
- **High Availability**: Run multiple Prometheus replicas
- **Federation**: Set up Prometheus federation for multi-cluster
- **Long-term Storage**: Use Thanos or Cortex for long-term metrics
- **Alertmanager**: Deploy Alertmanager for alerts
- **Resource Limits**: Adjust based on your metric volume

## Cleanup

```bash
# Remove Prometheus
kubectl delete -f k8s/prometheus/

# Or delete specific resources
kubectl delete deployment prometheus -n event-monitor
kubectl delete service prometheus-service -n event-monitor
kubectl delete configmap prometheus-config -n event-monitor
```
