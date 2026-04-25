package com.web3.eventmonitor.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigInteger;
import java.time.Instant;
import java.util.UUID;

/**
 * JPA Entity representing an ERC20 Transfer event.
 * Stores all relevant information from the blockchain event.
 */
@Entity
@Table(name = "transfer_events", indexes = {
    @Index(name = "idx_transfer_events_contract", columnList = "contract_address"),
    @Index(name = "idx_transfer_events_from", columnList = "from_address"),
    @Index(name = "idx_transfer_events_to", columnList = "to_address"),
    @Index(name = "idx_transfer_events_block", columnList = "block_number"),
    @Index(name = "idx_transfer_events_timestamp", columnList = "block_timestamp"),
    @Index(name = "idx_transfer_events_created_at", columnList = "created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransferEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "contract_address", nullable = false, length = 42)
    private String contractAddress;

    @Column(name = "from_address", nullable = false, length = 42)
    private String fromAddress;

    @Column(name = "to_address", nullable = false, length = 42)
    private String toAddress;

    @Column(nullable = false, precision = 78, scale = 0)
    private BigInteger value;

    @Column(name = "transaction_hash", unique = true, nullable = false, length = 66)
    private String transactionHash;

    @Column(name = "block_number", nullable = false)
    private Long blockNumber;

    @Column(name = "block_timestamp", nullable = false)
    private Instant blockTimestamp;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
