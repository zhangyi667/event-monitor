package com.web3.eventmonitor.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Data Transfer Object for event statistics.
 * Provides aggregate information about stored events.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventStatsDTO {

    private Long totalEvents;
    private Long uniqueFromAddresses;
    private Long uniqueToAddresses;
    private Long uniqueContracts;
    private Instant earliestEvent;
    private Instant latestEvent;
    private Long minBlockNumber;
    private Long maxBlockNumber;
}
