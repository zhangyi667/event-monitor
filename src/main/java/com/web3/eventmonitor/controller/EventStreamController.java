package com.web3.eventmonitor.controller;

import com.web3.eventmonitor.service.EventBroadcastService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * Controller for Server-Sent Events (SSE) streaming endpoints.
 * Provides real-time streaming of blockchain transfer events.
 */
@RestController
@RequestMapping("/api/events/stream")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Event Streaming", description = "Real-time event streaming endpoints using Server-Sent Events (SSE)")
public class EventStreamController {

    private final EventBroadcastService broadcastService;

    /**
     * Streams all transfer events in real-time.
     *
     * @return SseEmitter that will stream all events
     */
    @GetMapping(produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(
        summary = "Stream all transfer events",
        description = "Establishes a Server-Sent Events connection that streams all blockchain transfer events in real-time. " +
            "The connection will remain open for up to 30 minutes with heartbeat messages every 15 seconds.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "SSE stream established successfully",
                content = @Content(
                    mediaType = "text/event-stream",
                    examples = @ExampleObject(
                        name = "Event Stream",
                        value = "event: connected\ndata: {\"status\":\"connected\",\"filter\":\"all\"}\n\n" +
                            "event: transfer\ndata: {\"id\":\"...\",\"contractAddress\":\"0x...\",\"fromAddress\":\"0x...\",\"toAddress\":\"0x...\",\"value\":1000000,...}\n\n"
                    )
                )
            )
        }
    )
    public SseEmitter streamAllEvents() {
        log.info("New SSE connection request - stream all events");
        return broadcastService.register("all", null);
    }

    /**
     * Streams transfer events for a specific address (from or to).
     *
     * @param address The Ethereum address to filter by
     * @return SseEmitter that will stream filtered events
     */
    @GetMapping(value = "/address/{address}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(
        summary = "Stream events for specific address",
        description = "Establishes an SSE connection that streams transfer events where the specified address " +
            "is either the sender (from) or receiver (to). Address comparison is case-insensitive.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "SSE stream established successfully",
                content = @Content(mediaType = "text/event-stream")
            )
        }
    )
    public SseEmitter streamByAddress(
        @Parameter(description = "Ethereum address (with or without 0x prefix)", example = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb")
        @PathVariable String address
    ) {
        String normalizedAddress = normalizeAddress(address);
        log.info("New SSE connection request - filter by address: {}", normalizedAddress);
        return broadcastService.register("address", normalizedAddress);
    }

    /**
     * Streams transfer events from a specific contract.
     *
     * @param contractAddress The contract address to filter by
     * @return SseEmitter that will stream filtered events
     */
    @GetMapping(value = "/contract/{contractAddress}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(
        summary = "Stream events from specific contract",
        description = "Establishes an SSE connection that streams transfer events emitted by the specified " +
            "smart contract address. Address comparison is case-insensitive.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "SSE stream established successfully",
                content = @Content(mediaType = "text/event-stream")
            )
        }
    )
    public SseEmitter streamByContract(
        @Parameter(description = "Smart contract address (with or without 0x prefix)", example = "0x1234567890123456789012345678901234567890")
        @PathVariable String contractAddress
    ) {
        String normalizedAddress = normalizeAddress(contractAddress);
        log.info("New SSE connection request - filter by contract: {}", normalizedAddress);
        return broadcastService.register("contract", normalizedAddress);
    }

    /**
     * Normalizes an Ethereum address by ensuring it starts with 0x and converting to lowercase.
     *
     * @param address The address to normalize
     * @return Normalized address
     */
    private String normalizeAddress(String address) {
        if (address == null) {
            return null;
        }
        String trimmed = address.trim();
        if (!trimmed.startsWith("0x")) {
            trimmed = "0x" + trimmed;
        }
        return trimmed.toLowerCase();
    }
}
