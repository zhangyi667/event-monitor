package com.web3.eventmonitor.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.websocket.WebSocketService;

import java.net.ConnectException;

/**
 * Configuration class for Web3j.
 * Sets up WebSocket connection to Ethereum node (Infura/Alchemy).
 */
@Configuration
@Slf4j
public class Web3jConfig {

    @Value("${web3j.client-address}")
    private String clientAddress;

    /**
     * Creates and configures Web3j bean with WebSocket connection.
     * WebSocket is preferred over HTTP for real-time event listening.
     *
     * @return Configured Web3j instance
     */
    @Bean
    public Web3j web3j() {
        log.info("Initializing Web3j with WebSocket client: {}",
            clientAddress.replaceAll("(wss://[^/]+/ws/v3/).*", "$1***"));

        try {
            WebSocketService webSocketService = new WebSocketService(clientAddress, true);
            webSocketService.connect();

            Web3j web3j = Web3j.build(webSocketService);

            // Verify connection
            String clientVersion = web3j.web3ClientVersion().send().getWeb3ClientVersion();
            log.info("Successfully connected to Ethereum node: {}", clientVersion);

            return web3j;
        } catch (ConnectException e) {
            log.error("Failed to connect to Ethereum node at {}", clientAddress, e);
            throw new RuntimeException("Failed to connect to Ethereum node", e);
        } catch (Exception e) {
            log.error("Error initializing Web3j", e);
            throw new RuntimeException("Error initializing Web3j", e);
        }
    }
}
