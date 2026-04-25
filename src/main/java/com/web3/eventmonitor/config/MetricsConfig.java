package com.web3.eventmonitor.config;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import lombok.Getter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.atomic.AtomicLong;

/**
 * Configuration for custom Prometheus metrics.
 * Defines application-specific metrics for monitoring blockchain event processing.
 */
@Configuration
public class MetricsConfig {

    /**
     * Counter for total events captured from blockchain.
     */
    @Bean
    public Counter eventsCapturedCounter(MeterRegistry registry) {
        return Counter.builder("events.captured.total")
            .description("Total number of blockchain events captured")
            .tag("type", "transfer")
            .register(registry);
    }

    /**
     * Counter for events successfully saved to database.
     */
    @Bean
    public Counter eventsSavedCounter(MeterRegistry registry) {
        return Counter.builder("events.saved.total")
            .description("Total number of events successfully saved to database")
            .register(registry);
    }

    /**
     * Counter for duplicate events (already processed).
     */
    @Bean
    public Counter duplicateEventsCounter(MeterRegistry registry) {
        return Counter.builder("events.duplicates.total")
            .description("Total number of duplicate events skipped")
            .register(registry);
    }

    /**
     * Counter for processing errors.
     */
    @Bean
    public Counter processingErrorsCounter(MeterRegistry registry) {
        return Counter.builder("events.errors.total")
            .description("Total number of event processing errors")
            .register(registry);
    }

    /**
     * Timer for event processing duration.
     */
    @Bean
    public Timer eventProcessingTimer(MeterRegistry registry) {
        return Timer.builder("events.processing.duration")
            .description("Time taken to process and save events")
            .register(registry);
    }

    /**
     * Gauge for WebSocket connection status.
     */
    @Bean
    public AtomicLong web3jConnectionStatus(MeterRegistry registry) {
        AtomicLong connectionStatus = new AtomicLong(0); // 0 = disconnected, 1 = connected
        Gauge.builder("web3j.connection.status", connectionStatus, AtomicLong::get)
            .description("Web3j WebSocket connection status (0=disconnected, 1=connected)")
            .register(registry);
        return connectionStatus;
    }

    /**
     * Gauge for current blockchain block number being processed.
     */
    @Bean
    public AtomicLong currentBlockNumber(MeterRegistry registry) {
        AtomicLong blockNumber = new AtomicLong(0);
        Gauge.builder("blockchain.current.block", blockNumber, AtomicLong::get)
            .description("Current blockchain block number being processed")
            .register(registry);
        return blockNumber;
    }
}
