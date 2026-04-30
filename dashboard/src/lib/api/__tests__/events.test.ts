/**
 * Tests for Event API functions
 */

import MockAdapter from 'axios-mock-adapter';
import apiClient from '../client';
import {
  fetchEvents,
  fetchEventsByAddress,
  fetchEventByTxHash,
} from '../events';
import type { TransferEvent, PaginatedResponse } from '@/types';

describe('Event API Functions', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });

  afterEach(() => {
    mock.restore();
  });

  describe('fetchEvents', () => {
    const mockEvents: TransferEvent[] = [
      {
        id: '1',
        transactionHash: '0xabc123',
        blockNumber: 18000000,
        timestamp: '2024-01-15T10:30:00Z',
        from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        to: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        value: '1000000000000000000',
        token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        tokenSymbol: 'USDC',
        tokenName: 'USD Coin',
        decimals: 6,
      },
    ];

    const mockResponse: PaginatedResponse<TransferEvent> = {
      data: mockEvents,
      page: 0,
      size: 20,
      total: 1,
      totalPages: 1,
    };

    it('should fetch events without filters', async () => {
      mock.onGet(/\/events\?/).reply(200, mockResponse);

      const result = await fetchEvents();
      expect(result).toEqual(mockResponse);
      expect(result.data).toHaveLength(1);
    });

    it('should fetch events with filters', async () => {
      const filters = {
        from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        minAmount: '1000000',
        page: 0,
        size: 10,
      };

      mock.onGet(/\/events\?/).reply((config) => {
        const url = new URL(config.url!, 'http://localhost');
        expect(url.searchParams.get('from')).toBe(filters.from);
        expect(url.searchParams.get('minAmount')).toBe(filters.minAmount);
        expect(url.searchParams.get('page')).toBe('0');
        expect(url.searchParams.get('size')).toBe('10');
        return [200, mockResponse];
      });

      const result = await fetchEvents(filters);
      expect(result).toEqual(mockResponse);
    });

    it('should handle all filter parameters', async () => {
      const filters = {
        from: '0x123',
        to: '0x456',
        token: '0x789',
        minAmount: '100',
        maxAmount: '1000',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        page: 1,
        size: 50,
      };

      mock.onGet(/\/events\?/).reply((config) => {
        const url = new URL(config.url!, 'http://localhost');
        expect(url.searchParams.get('from')).toBe(filters.from);
        expect(url.searchParams.get('to')).toBe(filters.to);
        expect(url.searchParams.get('token')).toBe(filters.token);
        expect(url.searchParams.get('minAmount')).toBe(filters.minAmount);
        expect(url.searchParams.get('maxAmount')).toBe(filters.maxAmount);
        expect(url.searchParams.get('startDate')).toBe(filters.startDate);
        expect(url.searchParams.get('endDate')).toBe(filters.endDate);
        expect(url.searchParams.get('page')).toBe('1');
        expect(url.searchParams.get('size')).toBe('50');
        return [200, mockResponse];
      });

      await fetchEvents(filters);
    });

    it('should handle API errors', async () => {
      mock.onGet(/\/events\?/).reply(500, {
        message: 'Internal server error',
        statusCode: 500,
      });

      await expect(fetchEvents()).rejects.toMatchObject({
        statusCode: 500,
      });
    });
  });

  describe('fetchEventsByAddress', () => {
    const mockResponse: PaginatedResponse<TransferEvent> = {
      data: [],
      page: 0,
      size: 20,
      total: 0,
      totalPages: 0,
    };

    it('should fetch events for an address', async () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      mock
        .onGet(`/events/address/${address}`)
        .reply(200, mockResponse);

      const result = await fetchEventsByAddress(address);
      expect(result).toEqual(mockResponse);
    });

    it('should use custom pagination', async () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      mock
        .onGet(`/events/address/${address}`)
        .reply((config) => {
          expect(config.params.page).toBe(2);
          expect(config.params.size).toBe(50);
          return [200, mockResponse];
        });

      await fetchEventsByAddress(address, 2, 50);
    });

    it('should handle errors', async () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      mock
        .onGet(`/events/address/${address}`)
        .reply(404, {
          message: 'Address not found',
          statusCode: 404,
        });

      await expect(fetchEventsByAddress(address)).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe('fetchEventByTxHash', () => {
    const mockEvent: TransferEvent = {
      id: '1',
      transactionHash:
        '0xa1b2c3d4e5f6789012345678901234567890123456789012345678901234567890',
      blockNumber: 18000000,
      timestamp: '2024-01-15T10:30:00Z',
      from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      to: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      value: '1000000000000000000',
      token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      tokenSymbol: 'USDC',
      decimals: 6,
    };

    it('should fetch event by transaction hash', async () => {
      const txHash =
        '0xa1b2c3d4e5f6789012345678901234567890123456789012345678901234567890';
      mock.onGet(`/events/tx/${txHash}`).reply(200, mockEvent);

      const result = await fetchEventByTxHash(txHash);
      expect(result).toEqual(mockEvent);
    });

    it('should return null when event not found', async () => {
      const txHash =
        '0xa1b2c3d4e5f6789012345678901234567890123456789012345678901234567890';
      mock.onGet(`/events/tx/${txHash}`).reply(404, {
        message: 'Transaction not found',
        statusCode: 404,
      });

      const result = await fetchEventByTxHash(txHash);
      expect(result).toBeNull();
    });

    it('should return null on other errors', async () => {
      const txHash =
        '0xa1b2c3d4e5f6789012345678901234567890123456789012345678901234567890';
      mock.onGet(`/events/tx/${txHash}`).reply(500, {
        message: 'Server error',
        statusCode: 500,
      });

      const result = await fetchEventByTxHash(txHash);
      expect(result).toBeNull();
    });
  });
});
