package com.web3.eventmonitor.controller;

import com.web3.eventmonitor.service.EventBroadcastService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.*;

/**
 * Unit tests for EventStreamController.
 * Tests parameter handling and service method calls.
 */
@ExtendWith(MockitoExtension.class)
class EventStreamControllerTest {

    @Mock
    private EventBroadcastService broadcastService;

    @InjectMocks
    private EventStreamController controller;

    private SseEmitter mockEmitter;

    @BeforeEach
    void setUp() {
        mockEmitter = new SseEmitter();
    }

    @Test
    void testStreamAllEvents() {
        // Given
        when(broadcastService.register(eq("all"), isNull())).thenReturn(mockEmitter);

        // When
        SseEmitter result = controller.streamAllEvents();

        // Then
        assertThat(result).isNotNull().isEqualTo(mockEmitter);
        verify(broadcastService).register("all", null);
    }

    @Test
    void testStreamByAddress_WithPrefix() {
        // Given
        String address = "0x1234567890123456789012345678901234567890";
        when(broadcastService.register(eq("address"), eq(address.toLowerCase())))
            .thenReturn(mockEmitter);

        // When
        SseEmitter result = controller.streamByAddress(address);

        // Then
        assertThat(result).isNotNull();
        verify(broadcastService).register("address", address.toLowerCase());
    }

    @Test
    void testStreamByAddress_WithoutPrefix() {
        // Given
        String addressWithoutPrefix = "1234567890123456789012345678901234567890";
        String expectedAddress = "0x" + addressWithoutPrefix;
        when(broadcastService.register(eq("address"), eq(expectedAddress.toLowerCase())))
            .thenReturn(mockEmitter);

        // When
        SseEmitter result = controller.streamByAddress(addressWithoutPrefix);

        // Then
        assertThat(result).isNotNull();
        verify(broadcastService).register("address", expectedAddress.toLowerCase());
    }

    @Test
    void testStreamByAddress_MixedCase() {
        // Given
        String mixedCaseAddress = "0xAbCdEf1234567890AbCdEf1234567890AbCdEf12";
        when(broadcastService.register(eq("address"), eq(mixedCaseAddress.toLowerCase())))
            .thenReturn(mockEmitter);

        // When
        SseEmitter result = controller.streamByAddress(mixedCaseAddress);

        // Then
        assertThat(result).isNotNull();
        verify(broadcastService).register("address", mixedCaseAddress.toLowerCase());
    }

    @Test
    void testStreamByContract_WithPrefix() {
        // Given
        String contractAddress = "0x9876543210987654321098765432109876543210";
        when(broadcastService.register(eq("contract"), eq(contractAddress.toLowerCase())))
            .thenReturn(mockEmitter);

        // When
        SseEmitter result = controller.streamByContract(contractAddress);

        // Then
        assertThat(result).isNotNull();
        verify(broadcastService).register("contract", contractAddress.toLowerCase());
    }

    @Test
    void testStreamByContract_WithoutPrefix() {
        // Given
        String contractWithoutPrefix = "9876543210987654321098765432109876543210";
        String expectedContract = "0x" + contractWithoutPrefix;
        when(broadcastService.register(eq("contract"), eq(expectedContract.toLowerCase())))
            .thenReturn(mockEmitter);

        // When
        SseEmitter result = controller.streamByContract(contractWithoutPrefix);

        // Then
        assertThat(result).isNotNull();
        verify(broadcastService).register("contract", expectedContract.toLowerCase());
    }

    @Test
    void testStreamByContract_MixedCase() {
        // Given
        String mixedCaseContract = "0xAbCdEf1234567890AbCdEf1234567890AbCdEf12";
        when(broadcastService.register(eq("contract"), eq(mixedCaseContract.toLowerCase())))
            .thenReturn(mockEmitter);

        // When
        SseEmitter result = controller.streamByContract(mixedCaseContract);

        // Then
        assertThat(result).isNotNull();
        verify(broadcastService).register("contract", mixedCaseContract.toLowerCase());
    }

    @Test
    void testStreamByAddress_WithWhitespace() {
        // Given
        String addressWithSpaces = "  0x1234567890123456789012345678901234567890  ";
        String expectedAddress = "0x1234567890123456789012345678901234567890";
        when(broadcastService.register(eq("address"), eq(expectedAddress.toLowerCase())))
            .thenReturn(mockEmitter);

        // When
        SseEmitter result = controller.streamByAddress(addressWithSpaces);

        // Then
        assertThat(result).isNotNull();
        verify(broadcastService).register("address", expectedAddress.toLowerCase());
    }

    @Test
    void testAddressNormalization_Checksummed() {
        // Given - Ethereum checksummed address (mixed case)
        String checksummedAddress = "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed";
        when(broadcastService.register(eq("address"), eq(checksummedAddress.toLowerCase())))
            .thenReturn(mockEmitter);

        // When
        SseEmitter result = controller.streamByAddress(checksummedAddress);

        // Then - Should be normalized to lowercase
        assertThat(result).isNotNull();
        verify(broadcastService).register("address", checksummedAddress.toLowerCase());
    }

    @Test
    void testContractNormalization_Checksummed() {
        // Given - Ethereum checksummed contract address (mixed case)
        String checksummedContract = "0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359";
        when(broadcastService.register(eq("contract"), eq(checksummedContract.toLowerCase())))
            .thenReturn(mockEmitter);

        // When
        SseEmitter result = controller.streamByContract(checksummedContract);

        // Then - Should be normalized to lowercase
        assertThat(result).isNotNull();
        verify(broadcastService).register("contract", checksummedContract.toLowerCase());
    }

    @Test
    void testMultipleEndpointCalls() {
        // Given
        SseEmitter mockEmitter1 = new SseEmitter();
        SseEmitter mockEmitter2 = new SseEmitter();
        SseEmitter mockEmitter3 = new SseEmitter();

        when(broadcastService.register(eq("all"), isNull())).thenReturn(mockEmitter1);
        when(broadcastService.register(eq("address"), anyString())).thenReturn(mockEmitter2);
        when(broadcastService.register(eq("contract"), anyString())).thenReturn(mockEmitter3);

        // When
        controller.streamAllEvents();
        controller.streamByAddress("0x1234567890123456789012345678901234567890");
        controller.streamByContract("0x9876543210987654321098765432109876543210");

        // Then - Verify all methods were called
        verify(broadcastService).register(eq("all"), isNull());
        verify(broadcastService, atLeastOnce()).register(eq("address"), anyString());
        verify(broadcastService, atLeastOnce()).register(eq("contract"), anyString());
    }

    @Test
    void testStreamAllEvents_CallsServiceWithCorrectParams() {
        // Given
        when(broadcastService.register("all", null)).thenReturn(mockEmitter);

        // When
        controller.streamAllEvents();

        // Then
        verify(broadcastService, times(1)).register("all", null);
        verifyNoMoreInteractions(broadcastService);
    }

    @Test
    void testStreamByAddress_CallsServiceWithCorrectParams() {
        // Given
        String address = "0xtest";
        when(broadcastService.register(eq("address"), anyString())).thenReturn(mockEmitter);

        // When
        controller.streamByAddress(address);

        // Then
        verify(broadcastService, times(1)).register(eq("address"), anyString());
        verifyNoMoreInteractions(broadcastService);
    }

    @Test
    void testStreamByContract_CallsServiceWithCorrectParams() {
        // Given
        String contract = "0xcontract";
        when(broadcastService.register(eq("contract"), anyString())).thenReturn(mockEmitter);

        // When
        controller.streamByContract(contract);

        // Then
        verify(broadcastService, times(1)).register(eq("contract"), anyString());
        verifyNoMoreInteractions(broadcastService);
    }

    @Test
    void testEmptyAddressHandling() {
        // Given
        when(broadcastService.register(eq("address"), anyString())).thenReturn(mockEmitter);

        // When
        SseEmitter result = controller.streamByAddress("");

        // Then - Should still work (0x prefix added to empty string)
        assertThat(result).isNotNull();
        verify(broadcastService).register("address", "0x");
    }
}
