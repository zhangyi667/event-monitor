package com.web3.eventmonitor.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.web3.eventmonitor.model.dto.TransferEventDTO;
import io.micrometer.core.instrument.Counter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.Instant;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Service for managing Server-Sent Events (SSE) connections and broadcasting events.
 * Maintains active SSE emitters and broadcasts blockchain events to connected clients.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class EventBroadcastService {

    private final ObjectMapper objectMapper;
    private final AtomicLong sseActiveConnections;
    private final Counter sseEventsStreamed;
    private final Counter sseConnectionsTotal;

    private final CopyOnWriteArrayList<EmitterWrapper> emitters = new CopyOnWriteArrayList<>();
    private final ScheduledExecutorService heartbeatScheduler = Executors.newSingleThreadScheduledExecutor();

    private static final long TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
    private static final long HEARTBEAT_INTERVAL_MS = 15 * 1000; // 15 seconds

    /**
     * Registers a new SSE connection with optional filtering.
     *
     * @param filterType  Type of filter: "all", "address", or "contract"
     * @param filterValue Value to filter by (address or contract address)
     * @return SseEmitter for the connection
     */
    public SseEmitter register(String filterType, String filterValue) {
        SseEmitter emitter = new SseEmitter(TIMEOUT_MS);
        EmitterWrapper wrapper = new EmitterWrapper(emitter, filterType, filterValue, Instant.now());

        // Add emitter to collection
        emitters.add(wrapper);

        // Update metrics
        sseConnectionsTotal.increment();
        sseActiveConnections.incrementAndGet();

        log.info("New SSE connection registered - Filter: {}, Value: {}, Total connections: {}",
            filterType, filterValue, emitters.size());

        // Setup emitter callbacks
        emitter.onCompletion(() -> {
            log.debug("SSE connection completed - Filter: {}", filterType);
            removeEmitter(wrapper);
        });

        emitter.onTimeout(() -> {
            log.debug("SSE connection timed out - Filter: {}", filterType);
            removeEmitter(wrapper);
        });

        emitter.onError((ex) -> {
            log.warn("SSE connection error - Filter: {}, Error: {}", filterType, ex.getMessage());
            removeEmitter(wrapper);
        });

        // Send initial connection confirmation
        try {
            emitter.send(SseEmitter.event()
                .name("connected")
                .data("{\"status\":\"connected\",\"filter\":\"" + filterType + "\"}"));
        } catch (IOException e) {
            log.error("Failed to send connection confirmation", e);
            removeEmitter(wrapper);
        }

        // Start heartbeat if this is the first connection
        if (emitters.size() == 1) {
            startHeartbeat();
        }

        return emitter;
    }

    /**
     * Broadcasts a transfer event to all matching SSE connections.
     *
     * @param event The transfer event DTO to broadcast
     */
    public void broadcast(TransferEventDTO event) {
        if (emitters.isEmpty()) {
            return; // No active connections
        }

        try {
            String eventData = objectMapper.writeValueAsString(event);
            int broadcasted = 0;

            for (EmitterWrapper wrapper : emitters) {
                if (shouldSendToEmitter(wrapper, event)) {
                    try {
                        wrapper.emitter.send(SseEmitter.event()
                            .name("transfer")
                            .data(eventData));
                        broadcasted++;
                    } catch (IOException e) {
                        log.warn("Failed to send event to emitter, removing connection", e);
                        removeEmitter(wrapper);
                    }
                }
            }

            if (broadcasted > 0) {
                sseEventsStreamed.increment(broadcasted);
                log.debug("Broadcasted event to {} connections - TxHash: {}",
                    broadcasted, event.getTransactionHash());
            }

        } catch (Exception e) {
            log.error("Error broadcasting event", e);
        }
    }

    /**
     * Determines if an event should be sent to a specific emitter based on filters.
     *
     * @param wrapper The emitter wrapper with filter information
     * @param event   The event to check
     * @return true if event matches the emitter's filter
     */
    private boolean shouldSendToEmitter(EmitterWrapper wrapper, TransferEventDTO event) {
        if ("all".equals(wrapper.filterType)) {
            return true;
        }

        if ("address".equals(wrapper.filterType)) {
            String filterValue = wrapper.filterValue.toLowerCase();
            return filterValue.equals(event.getFromAddress().toLowerCase())
                || filterValue.equals(event.getToAddress().toLowerCase());
        }

        if ("contract".equals(wrapper.filterType)) {
            return wrapper.filterValue.equalsIgnoreCase(event.getContractAddress());
        }

        return false;
    }

    /**
     * Removes an emitter from the active connections list.
     *
     * @param wrapper The emitter wrapper to remove
     */
    private void removeEmitter(EmitterWrapper wrapper) {
        if (emitters.remove(wrapper)) {
            sseActiveConnections.decrementAndGet();
            log.debug("Removed SSE connection - Total connections: {}", emitters.size());

            // Complete the emitter to release resources
            try {
                wrapper.emitter.complete();
            } catch (Exception e) {
                log.debug("Error completing emitter: {}", e.getMessage());
            }

            // Stop heartbeat if no more connections
            if (emitters.isEmpty()) {
                stopHeartbeat();
            }
        }
    }

    /**
     * Starts sending periodic heartbeat comments to keep connections alive.
     */
    private void startHeartbeat() {
        heartbeatScheduler.scheduleAtFixedRate(() -> {
            if (emitters.isEmpty()) {
                return;
            }

            log.debug("Sending heartbeat to {} connections", emitters.size());

            for (EmitterWrapper wrapper : emitters) {
                try {
                    wrapper.emitter.send(SseEmitter.event()
                        .comment("heartbeat"));
                } catch (IOException e) {
                    log.debug("Failed to send heartbeat, removing connection");
                    removeEmitter(wrapper);
                }
            }
        }, HEARTBEAT_INTERVAL_MS, HEARTBEAT_INTERVAL_MS, TimeUnit.MILLISECONDS);

        log.info("Heartbeat scheduler started");
    }

    /**
     * Stops the heartbeat scheduler.
     */
    private void stopHeartbeat() {
        log.info("No active connections, heartbeat will continue in background");
        // We don't actually shutdown the scheduler, it just skips when emitters is empty
    }

    /**
     * Wrapper class to hold emitter along with its filter metadata.
     */
    private static class EmitterWrapper {
        final SseEmitter emitter;
        final String filterType;
        final String filterValue;
        final Instant connectedAt;

        EmitterWrapper(SseEmitter emitter, String filterType, String filterValue, Instant connectedAt) {
            this.emitter = emitter;
            this.filterType = filterType;
            this.filterValue = filterValue;
            this.connectedAt = connectedAt;
        }
    }
}
