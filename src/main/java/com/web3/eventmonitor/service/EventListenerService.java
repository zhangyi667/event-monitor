package com.web3.eventmonitor.service;

import com.web3.eventmonitor.model.entity.TransferEvent;
import com.web3.eventmonitor.repository.TransferEventRepository;
import io.reactivex.disposables.Disposable;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.web3j.abi.EventEncoder;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Address;
import org.web3j.abi.datatypes.Event;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameter;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.request.EthFilter;
import org.web3j.protocol.core.methods.response.EthBlock;
import org.web3j.protocol.core.methods.response.Log;

import java.io.IOException;
import java.math.BigInteger;
import java.time.Instant;
import java.util.Arrays;

/**
 * Service that listens to ERC20 Transfer events from the blockchain.
 * Subscribes to events via WebSocket and persists them to the database.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class EventListenerService {

    private final Web3j web3j;
    private final TransferEventRepository repository;

    @Value("${web3j.contract.address}")
    private String contractAddress;

    @Value("${web3j.contract.start-block}")
    private String startBlock;

    private Disposable subscription;

    // ERC20 Transfer event signature
    private static final Event TRANSFER_EVENT = new Event("Transfer",
        Arrays.asList(
            new TypeReference<Address>(true) {},
            new TypeReference<Address>(true) {},
            new TypeReference<Uint256>(false) {}
        )
    );

    /**
     * Starts listening to Transfer events when the application starts.
     * Uses WebSocket subscription for real-time event monitoring.
     */
    @PostConstruct
    public void startListening() {
        log.info("Starting event listener for contract: {}", contractAddress);
        log.info("Starting from block: {}", startBlock);

        try {
            // Determine starting block parameter
            DefaultBlockParameter startBlockParam;
            if ("latest".equalsIgnoreCase(startBlock)) {
                startBlockParam = DefaultBlockParameterName.LATEST;
            } else {
                startBlockParam = DefaultBlockParameter.valueOf(new BigInteger(startBlock));
            }

            // Create filter for Transfer events from the specific contract
            String transferEventSignature = EventEncoder.encode(TRANSFER_EVENT);
            EthFilter filter = new EthFilter(
                startBlockParam,
                DefaultBlockParameterName.LATEST,
                contractAddress
            ).addSingleTopic(transferEventSignature);

            // Subscribe to events
            subscription = web3j.ethLogFlowable(filter)
                .subscribe(
                    this::processEvent,
                    error -> {
                        log.error("Error in event listener", error);
                        // Implement reconnection logic
                        attemptReconnection();
                    },
                    () -> log.info("Event subscription completed")
                );

            log.info("Successfully subscribed to Transfer events");

        } catch (Exception e) {
            log.error("Failed to start event listener", e);
            throw new RuntimeException("Failed to start event listener", e);
        }
    }

    /**
     * Processes a single Transfer event log.
     * Parses the event data and saves it to the database.
     *
     * @param ethLog The event log from the blockchain
     */
    private void processEvent(Log ethLog) {
        try {
            log.debug("Processing event - TxHash: {}, Block: {}",
                ethLog.getTransactionHash(), ethLog.getBlockNumber());

            // Check if already processed (duplicate check)
            if (repository.existsByTransactionHash(ethLog.getTransactionHash())) {
                log.debug("Event already processed: {}", ethLog.getTransactionHash());
                return;
            }

            // Parse event data
            // Topics[0] is the event signature
            // Topics[1] is the 'from' address (indexed)
            // Topics[2] is the 'to' address (indexed)
            // Data contains the 'value' (non-indexed)

            String fromAddress = "0x" + ethLog.getTopics().get(1).substring(26);
            String toAddress = "0x" + ethLog.getTopics().get(2).substring(26);

            // Parse value from data field
            String valueHex = ethLog.getData().substring(2); // Remove '0x'
            BigInteger value = new BigInteger(valueHex, 16);

            // Fetch block timestamp
            Instant blockTimestamp = getBlockTimestamp(ethLog.getBlockNumber());

            // Create and save entity
            TransferEvent event = TransferEvent.builder()
                .contractAddress(ethLog.getAddress().toLowerCase())
                .fromAddress(fromAddress.toLowerCase())
                .toAddress(toAddress.toLowerCase())
                .value(value)
                .transactionHash(ethLog.getTransactionHash())
                .blockNumber(ethLog.getBlockNumber().longValue())
                .blockTimestamp(blockTimestamp)
                .build();

            repository.save(event);

            log.info("Saved Transfer event - From: {}, To: {}, Value: {}, TxHash: {}",
                fromAddress, toAddress, value, ethLog.getTransactionHash());

        } catch (Exception e) {
            log.error("Error processing event: {}", ethLog.getTransactionHash(), e);
        }
    }

    /**
     * Fetches the timestamp of a block.
     *
     * @param blockNumber The block number
     * @return The block timestamp as Instant
     */
    private Instant getBlockTimestamp(BigInteger blockNumber) {
        try {
            EthBlock ethBlock = web3j.ethGetBlockByNumber(
                DefaultBlockParameter.valueOf(blockNumber),
                false
            ).send();

            if (ethBlock.getBlock() != null) {
                BigInteger timestamp = ethBlock.getBlock().getTimestamp();
                return Instant.ofEpochSecond(timestamp.longValue());
            } else {
                log.warn("Block {} not found, using current timestamp", blockNumber);
                return Instant.now();
            }
        } catch (IOException e) {
            log.error("Failed to fetch block timestamp for block {}", blockNumber, e);
            return Instant.now();
        }
    }

    /**
     * Attempts to reconnect to the event stream after an error.
     */
    private void attemptReconnection() {
        log.info("Attempting to reconnect to event stream in 10 seconds...");
        try {
            Thread.sleep(10000);
            startListening();
        } catch (InterruptedException e) {
            log.error("Reconnection interrupted", e);
            Thread.currentThread().interrupt();
        }
    }

    /**
     * Stops listening to events when the application shuts down.
     * Ensures graceful cleanup of WebSocket subscription.
     */
    @PreDestroy
    public void stopListening() {
        if (subscription != null && !subscription.isDisposed()) {
            log.info("Stopping event listener...");
            subscription.dispose();
            log.info("Event listener stopped");
        }
    }
}
