package com.web3.eventmonitor.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigInteger;
import java.time.Instant;
import java.util.UUID;

/**
 * Data Transfer Object for TransferEvent.
 * Used in API responses.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransferEventDTO {

    private UUID id;
    private String contractAddress;
    private String fromAddress;
    private String toAddress;
    private BigInteger value;
    private String transactionHash;
    private Long blockNumber;
    private Instant blockTimestamp;
    private Instant createdAt;

    /**
     * Converts entity to DTO
     */
    public static TransferEventDTO fromEntity(com.web3.eventmonitor.model.entity.TransferEvent entity) {
        return TransferEventDTO.builder()
            .id(entity.getId())
            .contractAddress(entity.getContractAddress())
            .fromAddress(entity.getFromAddress())
            .toAddress(entity.getToAddress())
            .value(entity.getValue())
            .transactionHash(entity.getTransactionHash())
            .blockNumber(entity.getBlockNumber())
            .blockTimestamp(entity.getBlockTimestamp())
            .createdAt(entity.getCreatedAt())
            .build();
    }
}
