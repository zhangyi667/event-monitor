package com.web3.eventmonitor;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Main application class for the Event Monitor service.
 * This application monitors Ethereum blockchain events in real-time,
 * stores them in PostgreSQL, and exposes them via REST API.
 */
@SpringBootApplication
@EnableAsync
public class EventMonitorApplication {

    public static void main(String[] args) {
        SpringApplication.run(EventMonitorApplication.class, args);
    }
}
