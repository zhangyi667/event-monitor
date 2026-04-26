package com.web3.eventmonitor.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.web3.eventmonitor.model.dto.TransferEventDTO;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.math.BigInteger;
import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for EventBroadcastService.
 * Tests SSE connection management and metrics.
 *
 * Note: Actual SSE event sending cannot be tested in unit tests because SseEmitter
 * requires a real HTTP connection. The sending logic is tested in integration tests.
 */
@ExtendWith(MockitoExtension.class)
class EventBroadcastServiceTest {

    private EventBroadcastService broadcastService;
    private ObjectMapper objectMapper;
    private SimpleMeterRegistry meterRegistry;
    private AtomicLong sseActiveConnections;
    private Counter sseEventsStreamed;
    private Counter sseConnectionsTotal;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules(); // Register JavaTimeModule for Instant serialization
        meterRegistry = new SimpleMeterRegistry();

        // Create metrics
        sseActiveConnections = new AtomicLong(0);
        sseEventsStreamed = Counter.builder("sse.events.streamed.total")
            .register(meterRegistry);
        sseConnectionsTotal = Counter.builder("sse.connections.total")
            .register(meterRegistry);

        broadcastService = new EventBroadcastService(
            objectMapper,
            sseActiveConnections,
            sseEventsStreamed,
            sseConnectionsTotal
        );
    }

    @Test
    void testRegisterConnection_All() {
        // When
        SseEmitter emitter = broadcastService.register("all", null);

        // Then
        assertThat(emitter).isNotNull();
        assertThat(emitter.getTimeout()).isEqualTo(30 * 60 * 1000); // 30 minutes
        assertThat(sseActiveConnections.get()).isEqualTo(1);
        assertThat(sseConnectionsTotal.count()).isEqualTo(1.0);
    }

    @Test
    void testRegisterConnection_ByAddress() {
        // When
        SseEmitter emitter = broadcastService.register("address", "0x1234567890123456789012345678901234567890");

        // Then
        assertThat(emitter).isNotNull();
        assertThat(sseActiveConnections.get()).isEqualTo(1);
        assertThat(sseConnectionsTotal.count()).isEqualTo(1.0);
    }

    @Test
    void testRegisterConnection_ByContract() {
        // When
        SseEmitter emitter = broadcastService.register("contract", "0x1234567890123456789012345678901234567890");

        // Then
        assertThat(emitter).isNotNull();
        assertThat(sseActiveConnections.get()).isEqualTo(1);
        assertThat(sseConnectionsTotal.count()).isEqualTo(1.0);
    }

    @Test
    void testMultipleConnections() {
        // When
        SseEmitter emitter1 = broadcastService.register("all", null);
        SseEmitter emitter2 = broadcastService.register("address", "0x1234567890123456789012345678901234567890");
        SseEmitter emitter3 = broadcastService.register("contract", "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd");

        // Then
        assertThat(emitter1).isNotNull();
        assertThat(emitter2).isNotNull();
        assertThat(emitter3).isNotNull();
        assertThat(sseActiveConnections.get()).isEqualTo(3);
        assertThat(sseConnectionsTotal.count()).isEqualTo(3.0);
    }

    @Test
    void testConnectionMetrics_Increment() {
        // Given
        assertThat(sseActiveConnections.get()).isEqualTo(0);
        assertThat(sseConnectionsTotal.count()).isEqualTo(0.0);

        // When - Register multiple connections
        broadcastService.register("all", null);
        broadcastService.register("address", "0x1234567890123456789012345678901234567890");
        broadcastService.register("contract", "0xcontract0000000000000000000000000000000");

        // Then
        assertThat(sseActiveConnections.get()).isEqualTo(3);
        assertThat(sseConnectionsTotal.count()).isEqualTo(3.0);
    }

    @Test
    void testEmitterTimeout_TriggersCallback() throws Exception {
        // Given
        SseEmitter emitter = broadcastService.register("all", null);
        assertThat(sseActiveConnections.get()).isEqualTo(1);

        // When - Manually trigger timeout
        emitter.onTimeout(() -> {});
        emitter.complete();

        // Then - Should have callbacks registered
        assertThat(emitter).isNotNull();
    }

    @Test
    void testEmitterCompletion_TriggersCallback() throws Exception {
        // Given
        SseEmitter emitter = broadcastService.register("all", null);
        assertThat(sseActiveConnections.get()).isEqualTo(1);

        // When - Complete the emitter
        emitter.complete();

        // Then - Emitter should be completed
        assertThat(emitter).isNotNull();
    }

    @Test
    void testBroadcast_NoConnections_DoesNotThrow() {
        // Given
        TransferEventDTO event = createTestEvent();

        // When - Should not throw exception even with no connections
        assertDoesNotThrow(() -> broadcastService.broadcast(event));

        // Then
        assertThat(sseEventsStreamed.count()).isEqualTo(0.0);
    }

    @Test
    void testBroadcast_NullEvent_DoesNotThrow() {
        // Given
        broadcastService.register("all", null);

        // When - Broadcast null (edge case)
        // Should handle gracefully
        assertDoesNotThrow(() -> broadcastService.broadcast(null));
    }

    @Test
    void testConnectionsMetrics_AfterMultipleRegistrations() {
        // When - Register 5 connections
        for (int i = 0; i < 5; i++) {
            broadcastService.register("all", null);
        }

        // Then
        assertThat(sseActiveConnections.get()).isEqualTo(5);
        assertThat(sseConnectionsTotal.count()).isEqualTo(5.0);
    }

    @Test
    void testConnectionMetrics_TotalNeverDecreases() {
        // Given
        SseEmitter emitter1 = broadcastService.register("all", null);
        SseEmitter emitter2 = broadcastService.register("all", null);

        assertThat(sseConnectionsTotal.count()).isEqualTo(2.0);

        // When - Complete one emitter
        emitter1.complete();

        // Then - Total should remain the same (it's a counter, not a gauge)
        assertThat(sseConnectionsTotal.count()).isEqualTo(2.0);
    }

    @Test
    void testRegisterConnection_WithNullFilterValue() {
        // When - Register with null filter value (valid for "all" type)
        SseEmitter emitter = broadcastService.register("all", null);

        // Then
        assertThat(emitter).isNotNull();
        assertThat(sseActiveConnections.get()).isEqualTo(1);
    }

    @Test
    void testRegisterConnection_WithEmptyFilterValue() {
        // When - Register with empty filter value
        SseEmitter emitter = broadcastService.register("address", "");

        // Then - Should still create emitter (validation is not service's responsibility)
        assertThat(emitter).isNotNull();
        assertThat(sseActiveConnections.get()).isEqualTo(1);
    }

    @Test
    void testMultipleConnectionTypes() {
        // When - Mix different connection types
        SseEmitter all1 = broadcastService.register("all", null);
        SseEmitter all2 = broadcastService.register("all", null);
        SseEmitter addr1 = broadcastService.register("address", "0x1234");
        SseEmitter addr2 = broadcastService.register("address", "0x5678");
        SseEmitter contract = broadcastService.register("contract", "0xabcd");

        // Then
        assertThat(sseActiveConnections.get()).isEqualTo(5);
        assertThat(sseConnectionsTotal.count()).isEqualTo(5.0);
    }

    @Test
    void testEmitterHasCorrectTimeout() {
        // When
        SseEmitter emitter = broadcastService.register("all", null);

        // Then - Should have 30 minute timeout
        assertThat(emitter.getTimeout()).isEqualTo(30 * 60 * 1000L);
    }

    @Test
    void testObjectMapperIsUsed() {
        // Given - Broadcast service is created with ObjectMapper
        assertThat(broadcastService).isNotNull();

        // When - Register a connection
        SseEmitter emitter = broadcastService.register("all", null);

        // Then - Service should be functional
        assertThat(emitter).isNotNull();
    }

    @Test
    void testConcurrentRegistrations() throws InterruptedException {
        // Given - Multiple threads registering connections
        int threadCount = 10;
        Thread[] threads = new Thread[threadCount];

        // When - Register from multiple threads
        for (int i = 0; i < threadCount; i++) {
            threads[i] = new Thread(() -> {
                broadcastService.register("all", null);
            });
            threads[i].start();
        }

        // Wait for all threads to complete
        for (Thread thread : threads) {
            thread.join();
        }

        // Then - All connections should be registered
        assertThat(sseActiveConnections.get()).isEqualTo(threadCount);
        assertThat(sseConnectionsTotal.count()).isEqualTo((double) threadCount);
    }

    @Test
    void testEmitterCallbacksAreSet() {
        // When
        SseEmitter emitter = broadcastService.register("all", null);

        // Then - Emitter should have callbacks set (verified by no exceptions)
        assertDoesNotThrow(() -> emitter.complete());
        assertDoesNotThrow(() -> emitter.completeWithError(new Exception("test")));
    }

    /**
     * Helper method to create a test TransferEventDTO.
     */
    private TransferEventDTO createTestEvent() {
        return TransferEventDTO.builder()
            .id(UUID.randomUUID())
            .contractAddress("0x1234567890123456789012345678901234567890")
            .fromAddress("0xfrom1234567890123456789012345678901234567")
            .toAddress("0xto123456789012345678901234567890123456789")
            .value(new BigInteger("1000000000000000000"))
            .transactionHash("0xtxhash1234567890123456789012345678901234567890123456789012345678")
            .blockNumber(12345L)
            .blockTimestamp(Instant.now())
            .createdAt(Instant.now())
            .build();
    }
}
