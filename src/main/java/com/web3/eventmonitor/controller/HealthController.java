package com.web3.eventmonitor.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.web3j.protocol.Web3j;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

/**
 * Health check controller for Kubernetes probes.
 * Provides liveness and readiness endpoints.
 */
@RestController
@RequestMapping("/health")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Health", description = "Health check endpoints")
public class HealthController {

    private final DataSource dataSource;
    private final Web3j web3j;

    /**
     * Liveness probe - checks if the application is running.
     */
    @GetMapping("/live")
    @Operation(summary = "Liveness probe", description = "Kubernetes liveness probe endpoint")
    public ResponseEntity<Map<String, String>> liveness() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "event-monitor");
        return ResponseEntity.ok(response);
    }

    /**
     * Readiness probe - checks if the application is ready to serve traffic.
     * Verifies database and web3j connections.
     */
    @GetMapping("/ready")
    @Operation(summary = "Readiness probe", description = "Kubernetes readiness probe endpoint")
    public ResponseEntity<Map<String, Object>> readiness() {
        Map<String, Object> response = new HashMap<>();
        boolean ready = true;

        // Check database connection
        try (Connection connection = dataSource.getConnection()) {
            boolean dbReady = connection.isValid(2);
            response.put("database", dbReady ? "UP" : "DOWN");
            ready = ready && dbReady;
        } catch (Exception e) {
            log.error("Database health check failed", e);
            response.put("database", "DOWN");
            response.put("databaseError", e.getMessage());
            ready = false;
        }

        // Check Web3j connection
        try {
            String clientVersion = web3j.web3ClientVersion().send().getWeb3ClientVersion();
            response.put("web3j", "UP");
            response.put("web3jClient", clientVersion);
        } catch (Exception e) {
            log.error("Web3j health check failed", e);
            response.put("web3j", "DOWN");
            response.put("web3jError", e.getMessage());
            ready = false;
        }

        response.put("status", ready ? "UP" : "DOWN");

        return ready
            ? ResponseEntity.ok(response)
            : ResponseEntity.status(503).body(response);
    }
}
