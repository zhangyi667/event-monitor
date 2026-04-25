package com.web3.eventmonitor.controller;

import com.web3.eventmonitor.model.dto.EventStatsDTO;
import com.web3.eventmonitor.model.dto.TransferEventDTO;
import com.web3.eventmonitor.service.EventQueryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for querying transfer events.
 * Provides endpoints to retrieve and filter blockchain events.
 */
@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Events", description = "Transfer events API")
public class EventController {

    private final EventQueryService queryService;

    /**
     * Get all events with pagination.
     */
    @GetMapping
    @Operation(summary = "Get all transfer events", description = "Retrieves all transfer events with pagination and sorting")
    public ResponseEntity<Page<TransferEventDTO>> getAllEvents(
        @Parameter(description = "Page number (0-indexed)")
        @RequestParam(defaultValue = "0") int page,
        @Parameter(description = "Page size")
        @RequestParam(defaultValue = "50") int size,
        @Parameter(description = "Sort field and direction (e.g., 'blockNumber,desc')")
        @RequestParam(required = false) String sortBy
    ) {
        log.debug("Getting all events - page: {}, size: {}, sortBy: {}", page, size, sortBy);
        Page<TransferEventDTO> events = queryService.getEvents(page, size, sortBy);
        return ResponseEntity.ok(events);
    }

    /**
     * Get events by address (from OR to).
     */
    @GetMapping("/address/{address}")
    @Operation(summary = "Get events by address", description = "Retrieves events where the address is either sender or receiver")
    public ResponseEntity<Page<TransferEventDTO>> getEventsByAddress(
        @Parameter(description = "Ethereum address")
        @PathVariable String address,
        @Parameter(description = "Page number (0-indexed)")
        @RequestParam(defaultValue = "0") int page,
        @Parameter(description = "Page size")
        @RequestParam(defaultValue = "50") int size
    ) {
        log.debug("Getting events by address: {} - page: {}, size: {}", address, page, size);
        Page<TransferEventDTO> events = queryService.getEventsByAddress(address, page, size);
        return ResponseEntity.ok(events);
    }

    /**
     * Get events by from address.
     */
    @GetMapping("/from/{fromAddress}")
    @Operation(summary = "Get events by sender", description = "Retrieves events sent from a specific address")
    public ResponseEntity<Page<TransferEventDTO>> getEventsByFromAddress(
        @Parameter(description = "Sender address")
        @PathVariable String fromAddress,
        @Parameter(description = "Page number (0-indexed)")
        @RequestParam(defaultValue = "0") int page,
        @Parameter(description = "Page size")
        @RequestParam(defaultValue = "50") int size
    ) {
        log.debug("Getting events by from address: {} - page: {}, size: {}", fromAddress, page, size);
        Page<TransferEventDTO> events = queryService.getEventsByFromAddress(fromAddress, page, size);
        return ResponseEntity.ok(events);
    }

    /**
     * Get events by to address.
     */
    @GetMapping("/to/{toAddress}")
    @Operation(summary = "Get events by receiver", description = "Retrieves events received by a specific address")
    public ResponseEntity<Page<TransferEventDTO>> getEventsByToAddress(
        @Parameter(description = "Receiver address")
        @PathVariable String toAddress,
        @Parameter(description = "Page number (0-indexed)")
        @RequestParam(defaultValue = "0") int page,
        @Parameter(description = "Page size")
        @RequestParam(defaultValue = "50") int size
    ) {
        log.debug("Getting events by to address: {} - page: {}, size: {}", toAddress, page, size);
        Page<TransferEventDTO> events = queryService.getEventsByToAddress(toAddress, page, size);
        return ResponseEntity.ok(events);
    }

    /**
     * Get events by contract address.
     */
    @GetMapping("/contract/{contractAddress}")
    @Operation(summary = "Get events by contract", description = "Retrieves events from a specific smart contract")
    public ResponseEntity<Page<TransferEventDTO>> getEventsByContract(
        @Parameter(description = "Contract address")
        @PathVariable String contractAddress,
        @Parameter(description = "Page number (0-indexed)")
        @RequestParam(defaultValue = "0") int page,
        @Parameter(description = "Page size")
        @RequestParam(defaultValue = "50") int size
    ) {
        log.debug("Getting events by contract: {} - page: {}, size: {}", contractAddress, page, size);
        Page<TransferEventDTO> events = queryService.getEventsByContract(contractAddress, page, size);
        return ResponseEntity.ok(events);
    }

    /**
     * Get events by block range.
     */
    @GetMapping("/blocks")
    @Operation(summary = "Get events by block range", description = "Retrieves events within a specific block number range")
    public ResponseEntity<Page<TransferEventDTO>> getEventsByBlockRange(
        @Parameter(description = "Start block number")
        @RequestParam Long startBlock,
        @Parameter(description = "End block number")
        @RequestParam Long endBlock,
        @Parameter(description = "Page number (0-indexed)")
        @RequestParam(defaultValue = "0") int page,
        @Parameter(description = "Page size")
        @RequestParam(defaultValue = "50") int size
    ) {
        log.debug("Getting events by block range: {} to {} - page: {}, size: {}",
            startBlock, endBlock, page, size);
        Page<TransferEventDTO> events = queryService.getEventsByBlockRange(startBlock, endBlock, page, size);
        return ResponseEntity.ok(events);
    }

    /**
     * Get event statistics.
     */
    @GetMapping("/stats")
    @Operation(summary = "Get event statistics", description = "Retrieves aggregate statistics about stored events")
    public ResponseEntity<EventStatsDTO> getStatistics() {
        log.debug("Getting event statistics");
        EventStatsDTO stats = queryService.getStatistics();
        return ResponseEntity.ok(stats);
    }
}
