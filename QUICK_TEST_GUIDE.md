# Quick Test Guide - SSE Streaming

## Quick Start (5 minutes)

### 1. Start the Application

```bash
cd /Users/yizhang/projects/web3/event-monitor
export PATH="/opt/homebrew/opt/openjdk@21/bin:$PATH"
./gradlew bootRun
```

Wait for: `Started EventMonitorApplication in X seconds`

### 2. Test SSE Connection (Choose One)

**Option A: Using cURL (Terminal)**
```bash
curl -N http://localhost:8080/api/events/stream
```

**Option B: Using Web Browser**
```bash
open test-sse.html
```
Then click "Connect" button.

**Option C: Using JavaScript Console**
```javascript
const es = new EventSource('http://localhost:8080/api/events/stream');
es.addEventListener('transfer', e => console.log(JSON.parse(e.data)));
```

### 3. Verify Connection

You should see:
```
event: connected
data: {"status":"connected","filter":"all"}
```

Then heartbeat comments every 15 seconds:
```
:heartbeat
```

### 4. Wait for Blockchain Events

When a Transfer event occurs on the monitored contract, you'll see:
```
event: transfer
data: {"id":"...","contractAddress":"0x...","fromAddress":"0x...","toAddress":"0x...","value":1000000,...}
```

## Test All Endpoints

### Stream All Events
```bash
curl -N http://localhost:8080/api/events/stream
```

### Stream by Address
```bash
curl -N http://localhost:8080/api/events/stream/address/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

### Stream by Contract
```bash
curl -N http://localhost:8080/api/events/stream/contract/0x1234567890123456789012345678901234567890
```

## Check Metrics

### View Active Connections
```bash
curl -s http://localhost:8080/actuator/prometheus | grep sse_connections_active
```

### View Total Connections
```bash
curl -s http://localhost:8080/actuator/prometheus | grep sse_connections_total
```

### View Events Streamed
```bash
curl -s http://localhost:8080/actuator/prometheus | grep sse_events_streamed_total
```

## Test Multiple Connections

Open 3 terminals and run:

**Terminal 1:**
```bash
curl -N http://localhost:8080/api/events/stream
```

**Terminal 2:**
```bash
curl -N http://localhost:8080/api/events/stream
```

**Terminal 3:**
```bash
curl -s http://localhost:8080/actuator/prometheus | grep sse_connections_active
# Should show: sse_connections_active{application="event-monitor"} 2.0
```

## Swagger UI

Open: http://localhost:8080/swagger-ui.html

Look for "Event Streaming" section to see SSE endpoints documented.

## Troubleshooting

### No Events Appearing?

1. **Check if blockchain events are happening:**
   ```bash
   curl http://localhost:8080/api/events?size=5
   ```
   If empty, no events have been captured yet.

2. **Trigger a test transaction** on the monitored contract (if you have access)

3. **Check application logs:**
   - Look for "Saved Transfer event" messages
   - Verify "Broadcasted event to X connections" messages

### Connection Keeps Disconnecting?

- Normal behavior after 30 minutes (timeout)
- Check network/firewall settings
- Browser may limit concurrent SSE connections (max 6 per domain)

### Not Seeing Heartbeats?

- Heartbeats are sent as comments (`:heartbeat`)
- Some clients may not display comments
- This is normal - they keep the connection alive

## Expected Output Examples

### Successful Connection
```
event: connected
data: {"status":"connected","filter":"all"}

:heartbeat

:heartbeat

event: transfer
data: {"id":"123e4567-e89b-12d3-a456-426614174000","contractAddress":"0x1234567890123456789012345678901234567890","fromAddress":"0x742d35cc6634c0532925a3b844bc9e7595f0beb","toAddress":"0x9876543210987654321098765432109876543210","value":1000000000000000000,"transactionHash":"0xabcdef...","blockNumber":12345,"blockTimestamp":"2026-04-25T12:00:00Z","createdAt":"2026-04-25T12:00:01Z"}
```

### Metrics Output
```
# HELP sse_connections_active Number of active SSE connections
# TYPE sse_connections_active gauge
sse_connections_active{application="event-monitor",} 2.0

# HELP sse_connections_total Total number of SSE connections established
# TYPE sse_connections_total counter
sse_connections_total{application="event-monitor",} 5.0

# HELP sse_events_streamed_total Total number of events streamed via SSE
# TYPE sse_events_streamed_total counter
sse_events_streamed_total{application="event-monitor",} 150.0
```

## Stop Testing

Press `Ctrl+C` in the terminal running the application, or:

```bash
# If using test-sse.html, click "Disconnect"

# If using cURL, press Ctrl+C

# If using JavaScript, run:
eventSource.close();
```

## Next Steps

Once basic testing works:

1. ✅ Test filtering by address and contract
2. ✅ Test multiple concurrent connections
3. ✅ Verify metrics are updating correctly
4. ✅ Test connection timeout (wait 30 minutes)
5. ✅ Test reconnection behavior (disconnect and reconnect)
6. ✅ Load test with 10+ connections
7. ✅ Deploy to Kubernetes and test

## Quick Reference

| What | Command |
|------|---------|
| Start app | `./gradlew bootRun` |
| Test SSE | `curl -N http://localhost:8080/api/events/stream` |
| Web test | `open test-sse.html` |
| Check metrics | `curl http://localhost:8080/actuator/prometheus \| grep sse` |
| Swagger | `open http://localhost:8080/swagger-ui.html` |
| Stop app | `Ctrl+C` |
