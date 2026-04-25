package com.web3.eventmonitor.service;

import com.web3.eventmonitor.model.dto.EventStatsDTO;
import com.web3.eventmonitor.model.dto.TransferEventDTO;
import com.web3.eventmonitor.repository.TransferEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for querying transfer events.
 * Handles business logic for API endpoints.
 */
@Service
@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EventQueryService {

    private final TransferEventRepository repository;

    /**
     * Get all events with pagination and sorting.
     *
     * @param page Page number (0-indexed)
     * @param size Page size
     * @param sortBy Field to sort by (default: blockNumber)
     * @return Page of transfer event DTOs
     */
    public Page<TransferEventDTO> getEvents(int page, int size, String sortBy) {
        Sort sort = createSort(sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        return repository.findAll(pageable)
            .map(TransferEventDTO::fromEntity);
    }

    /**
     * Get events by address (either from or to).
     *
     * @param address Ethereum address
     * @param page Page number
     * @param size Page size
     * @return Page of transfer event DTOs
     */
    public Page<TransferEventDTO> getEventsByAddress(String address, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "blockNumber"));
        String normalizedAddress = normalizeAddress(address);

        return repository.findByAddress(normalizedAddress, pageable)
            .map(TransferEventDTO::fromEntity);
    }

    /**
     * Get events by from address.
     *
     * @param fromAddress Sender address
     * @param page Page number
     * @param size Page size
     * @return Page of transfer event DTOs
     */
    public Page<TransferEventDTO> getEventsByFromAddress(String fromAddress, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "blockNumber"));
        String normalizedAddress = normalizeAddress(fromAddress);

        return repository.findByFromAddress(normalizedAddress, pageable)
            .map(TransferEventDTO::fromEntity);
    }

    /**
     * Get events by to address.
     *
     * @param toAddress Receiver address
     * @param page Page number
     * @param size Page size
     * @return Page of transfer event DTOs
     */
    public Page<TransferEventDTO> getEventsByToAddress(String toAddress, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "blockNumber"));
        String normalizedAddress = normalizeAddress(toAddress);

        return repository.findByToAddress(normalizedAddress, pageable)
            .map(TransferEventDTO::fromEntity);
    }

    /**
     * Get events by contract address.
     *
     * @param contractAddress Contract address
     * @param page Page number
     * @param size Page size
     * @return Page of transfer event DTOs
     */
    public Page<TransferEventDTO> getEventsByContract(String contractAddress, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "blockNumber"));
        String normalizedAddress = normalizeAddress(contractAddress);

        return repository.findByContractAddress(normalizedAddress, pageable)
            .map(TransferEventDTO::fromEntity);
    }

    /**
     * Get events by block number range.
     *
     * @param startBlock Start block number
     * @param endBlock End block number
     * @param page Page number
     * @param size Page size
     * @return Page of transfer event DTOs
     */
    public Page<TransferEventDTO> getEventsByBlockRange(Long startBlock, Long endBlock, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "blockNumber"));

        return repository.findByBlockNumberBetween(startBlock, endBlock, pageable)
            .map(TransferEventDTO::fromEntity);
    }

    /**
     * Get statistics about stored events.
     *
     * @return Event statistics DTO
     */
    public EventStatsDTO getStatistics() {
        return EventStatsDTO.builder()
            .totalEvents(repository.countAllEvents())
            .uniqueFromAddresses(repository.countUniqueFromAddresses())
            .uniqueToAddresses(repository.countUniqueToAddresses())
            .uniqueContracts(repository.countUniqueContracts())
            .earliestEvent(repository.findEarliestEventTimestamp())
            .latestEvent(repository.findLatestEventTimestamp())
            .minBlockNumber(repository.findMinBlockNumber())
            .maxBlockNumber(repository.findMaxBlockNumber())
            .build();
    }

    /**
     * Creates Sort object based on field name.
     *
     * @param sortBy Field name to sort by
     * @return Sort object
     */
    private Sort createSort(String sortBy) {
        if (sortBy == null || sortBy.isBlank()) {
            return Sort.by(Sort.Direction.DESC, "blockNumber");
        }

        // Parse sort field and direction
        String[] parts = sortBy.split(",");
        String field = parts[0].trim();
        Sort.Direction direction = parts.length > 1 && "asc".equalsIgnoreCase(parts[1].trim())
            ? Sort.Direction.ASC
            : Sort.Direction.DESC;

        return Sort.by(direction, field);
    }

    /**
     * Normalizes Ethereum address to lowercase.
     *
     * @param address The address to normalize
     * @return Normalized address
     */
    private String normalizeAddress(String address) {
        return address != null ? address.toLowerCase() : null;
    }
}
