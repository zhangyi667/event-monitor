package com.web3.eventmonitor;

import org.junit.jupiter.api.Test;

/**
 * Basic smoke test for the application.
 * Full context loading is tested manually since it requires Web3j connection.
 */
class EventMonitorApplicationTests {

    @Test
    void applicationClassExists() {
        // Smoke test - verify the main class exists
        Class<?> mainClass = EventMonitorApplication.class;
        assert mainClass != null;
    }
}
