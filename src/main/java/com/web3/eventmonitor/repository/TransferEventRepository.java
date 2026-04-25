package com.web3.eventmonitor.repository;

import com.web3.eventmonitor.model.entity.TransferEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

/**
 * Spring Data JPA repository for TransferEvent entity.
 * Provides database access methods for transfer events.
 */
@Repository
public interface TransferEventRepository extends JpaRepository<TransferEvent, UUID> {

    /**
     * Find events by from address with pagination
     */
    Page<TransferEvent> findByFromAddress(String fromAddress, Pageable pageable);

    /**
     * Find events by to address with pagination
     */
    Page<TransferEvent> findByToAddress(String toAddress, Pageable pageable);

    /**
     * Find events by contract address with pagination
     */
    Page<TransferEvent> findByContractAddress(String contractAddress, Pageable pageable);

    /**
     * Find events where address is either sender or receiver
     */
    @Query("SELECT e FROM TransferEvent e WHERE e.fromAddress = :address OR e.toAddress = :address")
    Page<TransferEvent> findByAddress(@Param("address") String address, Pageable pageable);

    /**
     * Find events by block number range
     */
    Page<TransferEvent> findByBlockNumberBetween(Long startBlock, Long endBlock, Pageable pageable);

    /**
     * Find event by transaction hash
     */
    Optional<TransferEvent> findByTransactionHash(String transactionHash);

    /**
     * Check if event with transaction hash exists
     */
    boolean existsByTransactionHash(String transactionHash);

    /**
     * Get total count of events
     */
    @Query("SELECT COUNT(e) FROM TransferEvent e")
    Long countAllEvents();

    /**
     * Get count of unique from addresses
     */
    @Query("SELECT COUNT(DISTINCT e.fromAddress) FROM TransferEvent e")
    Long countUniqueFromAddresses();

    /**
     * Get count of unique to addresses
     */
    @Query("SELECT COUNT(DISTINCT e.toAddress) FROM TransferEvent e")
    Long countUniqueToAddresses();

    /**
     * Get count of unique contract addresses
     */
    @Query("SELECT COUNT(DISTINCT e.contractAddress) FROM TransferEvent e")
    Long countUniqueContracts();

    /**
     * Get earliest event timestamp
     */
    @Query("SELECT MIN(e.blockTimestamp) FROM TransferEvent e")
    Instant findEarliestEventTimestamp();

    /**
     * Get latest event timestamp
     */
    @Query("SELECT MAX(e.blockTimestamp) FROM TransferEvent e")
    Instant findLatestEventTimestamp();

    /**
     * Get minimum block number
     */
    @Query("SELECT MIN(e.blockNumber) FROM TransferEvent e")
    Long findMinBlockNumber();

    /**
     * Get maximum block number
     */
    @Query("SELECT MAX(e.blockNumber) FROM TransferEvent e")
    Long findMaxBlockNumber();
}
