# Prometheus Metrics - Quick Start Guide

## 🎉 What Was Implemented

Prometheus monitoring has been successfully added to the Event Monitor application!

### ✅ Changes Made

1. **Dependencies** - Added Micrometer Prometheus registry
2. **Configuration** - Exposed `/actuator/prometheus` endpoint
3. **Custom Metrics** - Created 7 application-specific metrics
4. **Instrumentation** - Updated `EventListenerService` with metrics tracking
5. **Kubernetes** - Created Prometheus deployment manifests

---

## 📊 Metrics Available

### Custom Application Metrics

| Metric | Description | Type |
|--------|-------------|------|
| `events_captured_total` | Total events received from blockchain | Counter |
| `events_saved_total` | Events successfully saved to DB | Counter |
| `events_duplicates_total` | Duplicate events skipped | Counter |
| `events_errors_total` | Processing errors | Counter |
| `events_processing_duration` | Time to process events | Timer/Histogram |
| `web3j_connection_status` | WebSocket connection (0=down, 1=up) | Gauge |
| `blockchain_current_block` | Current block number being processed | Gauge |

### Standard Spring Boot Metrics (Auto-included)

- JVM memory/GC
- HTTP requests
- Database connections
- Thread pools
- System CPU/memory

---

## 🚀 Quick Test (Local)

### 1. Start the Application Locally

```bash
./run-local.sh
```

### 2. View Metrics Endpoint

```bash
curl http://localhost:8080/actuator/prometheus
```

**Expected output:**
```
# HELP events_captured_total Total number of blockchain events captured
# TYPE events_captured_total counter
events_captured_total{application="event-monitor",type="transfer",} 44.0

# HELP events_saved_total Total number of events successfully saved to database
# TYPE events_saved_total counter
events_saved_total{application="event-monitor",} 44.0

# HELP web3j_connection_status Web3j WebSocket connection status
# TYPE web3j_connection_status gauge
web3j_connection_status{application="event-monitor",} 1.0

... (many more metrics)
```

### 3. Test Specific Metrics

```bash
# See events captured
curl -s http://localhost:8080/actuator/prometheus | grep events_captured_total

# See connection status
curl -s http://localhost:8080/actuator/prometheus | grep web3j_connection_status

# See current block
curl -s http://localhost:8080/actuator/prometheus | grep blockchain_current_block
```

---

## 🐳 Deploy to Kubernetes

### Option 1: Quick Deploy (All at Once)

```bash
# Deploy Prometheus
kubectl apply -f k8s/prometheus/

# Verify
kubectl get pods -n event-monitor
```

### Option 2: Step-by-Step

```bash
# 1. Deploy RBAC
kubectl apply -f k8s/prometheus/rbac.yml

# 2. Deploy ConfigMap
kubectl apply -f k8s/prometheus/configmap.yml

# 3. Deploy Prometheus server
kubectl apply -f k8s/prometheus/deployment.yml
kubectl apply -f k8s/prometheus/service.yml

# 4. Wait for ready
kubectl wait --for=condition=ready pod -l app=prometheus -n event-monitor --timeout=60s

# 5. Check status
kubectl get all -n event-monitor -l app=prometheus
```

### Access Prometheus UI

```bash
# Port forward
kubectl port-forward svc/prometheus-service 9090:9090 -n event-monitor

# Open browser
open http://localhost:9090
```

---

## 📈 Using Prometheus UI

### View Targets

1. Open http://localhost:9090/targets
2. Look for `event-monitor` job
3. Status should be **UP** ✅

### Run Queries

1. Go to http://localhost:9090/graph
2. Try these queries:

```promql
# Total events captured
events_captured_total

# Events per minute
rate(events_captured_total[1m]) * 60

# Average processing time (milliseconds)
rate(events_processing_duration_seconds_sum[5m]) / rate(events_processing_duration_seconds_count[5m]) * 1000

# Error rate
rate(events_errors_total[5m])

# Memory usage %
jvm_memory_used_bytes{area="heap"} / jvm_memory_max_bytes{area="heap"} * 100
```

---

## 📊 Grafana Dashboard (Optional)

### Quick Setup

```bash
# 1. Deploy Grafana
kubectl create deployment grafana \
  --image=grafana/grafana:latest \
  -n event-monitor

# 2. Expose service
kubectl expose deployment grafana \
  --port=3000 \
  --type=ClusterIP \
  -n event-monitor

# 3. Port forward
kubectl port-forward svc/grafana 3000:3000 -n event-monitor &

# 4. Open browser
open http://localhost:3000
```

### Configure Grafana

1. **Login**: admin / admin (change password)
2. **Add Data Source**:
   - Configuration → Data Sources → Add
   - Select "Prometheus"
   - URL: `http://prometheus-service:9090`
   - Save & Test
3. **Import Dashboard**:
   - Create → Import
   - Upload `k8s/prometheus/grafana-dashboard.json`

---

## 🎯 Useful Example Queries

### Performance Metrics

```promql
# Events throughput (events/sec)
rate(events_saved_total[1m])

# 95th percentile processing time
histogram_quantile(0.95, rate(events_processing_duration_seconds_bucket[5m]))

# Success rate %
(rate(events_saved_total[5m]) / rate(events_captured_total[5m])) * 100
```

### Health Metrics

```promql
# Connection uptime (1 = connected, 0 = disconnected)
web3j_connection_status

# Blocks processed per minute
rate(blockchain_current_block[1m]) * 60

# Error percentage
(rate(events_errors_total[5m]) / rate(events_captured_total[5m])) * 100
```

### Resource Metrics

```promql
# Heap usage %
jvm_memory_used_bytes{area="heap"} / jvm_memory_max_bytes{area="heap"} * 100

# Thread count
jvm_threads_live_threads

# HTTP requests per second
rate(http_server_requests_seconds_count[1m])
```

---

## 🔔 Setting Up Alerts (Advanced)

Create `prometheus-alerts.yml`:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-alerts
  namespace: event-monitor
data:
  alerts.yml: |
    groups:
      - name: event_monitor_alerts
        rules:
          - alert: HighErrorRate
            expr: rate(events_errors_total[5m]) > 0.1
            for: 5m
            labels:
              severity: warning
            annotations:
              summary: "High error rate in event processing"
              description: "Error rate is {{ $value }} errors/sec"

          - alert: Web3jDisconnected
            expr: web3j_connection_status == 0
            for: 2m
            labels:
              severity: critical
            annotations:
              summary: "Web3j WebSocket disconnected"

          - alert: HighMemoryUsage
            expr: (jvm_memory_used_bytes{area="heap"} / jvm_memory_max_bytes{area="heap"}) > 0.9
            for: 5m
            labels:
              severity: warning
            annotations:
              summary: "High JVM heap usage"
```

---

## 📝 Testing Checklist

- [ ] Application starts without errors
- [ ] `/actuator/prometheus` endpoint returns metrics
- [ ] Metrics show in Prometheus UI
- [ ] Custom metrics increment when events are captured
- [ ] Connection status shows as 1 (connected)
- [ ] Block number updates as events are processed
- [ ] Grafana can connect to Prometheus
- [ ] Dashboard shows real-time data

---

## 🎨 Next Steps

### Immediate

1. ✅ **Verify metrics locally** - curl the endpoint
2. ✅ **Deploy to K8s** - Apply manifests
3. ✅ **Check Prometheus UI** - View metrics
4. ✅ **Set up Grafana** - Visualize data

### Future Enhancements

1. **Alertmanager** - Email/Slack notifications
2. **Long-term Storage** - Thanos or Cortex
3. **More Metrics**:
   - Gas prices
   - Transfer values
   - Unique addresses
   - API endpoint latencies
4. **Custom Dashboards** - Create role-specific views

---

## 🐛 Troubleshooting

### Metrics endpoint returns 404

Check application.yml has:
```yaml
management:
  endpoints:
    web:
      exposure:
        include: prometheus
```

### Prometheus can't find targets

1. Check pod labels:
   ```bash
   kubectl get pods -n event-monitor --show-labels
   ```
2. Verify service account has permissions:
   ```bash
   kubectl describe clusterrole prometheus
   ```

### Metrics show 0 or N/A

- Wait for events to be captured (application needs to run)
- Check logs for errors:
  ```bash
  kubectl logs -f deployment/event-monitor -n event-monitor
  ```

---

## 📚 Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Micrometer Documentation](https://micrometer.io/docs)
- [Grafana Dashboards](https://grafana.com/grafana/dashboards/)
- [PromQL Tutorial](https://prometheus.io/docs/prometheus/latest/querying/basics/)

---

**Status**: ✅ **COMPLETE**
**Time to Implement**: ~2-3 hours
**Portfolio Impact**: ⭐⭐⭐⭐⭐ (Production monitoring!)
