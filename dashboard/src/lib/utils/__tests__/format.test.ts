/**
 * Tests for formatting utilities
 */

import {
  formatAddress,
  formatNumber,
  formatTokenAmount,
  formatUSD,
  formatDate,
  formatRelativeTime,
  formatTxHash,
  formatBlockNumber,
  formatCompact,
} from '../format';

describe('Format Utilities', () => {
  describe('formatAddress', () => {
    it('should shorten Ethereum address correctly', () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9';
      expect(formatAddress(address)).toBe('0x742d...bEb9');
    });

    it('should handle custom char length', () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9';
      expect(formatAddress(address, 6)).toBe('0x742d35...f0bEb9');
    });

    it('should return empty string for empty input', () => {
      expect(formatAddress('')).toBe('');
    });

    it('should return full address if too short', () => {
      const shortAddr = '0x123';
      expect(formatAddress(shortAddr)).toBe('0x123');
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with commas', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
      expect(formatNumber(1234567.89)).toBe('1,234,567.89');
    });

    it('should handle string input', () => {
      expect(formatNumber('5000')).toBe('5,000');
    });

    it('should return 0 for invalid input', () => {
      expect(formatNumber('invalid')).toBe('0');
    });
  });

  describe('formatTokenAmount', () => {
    it('should format token amount with 18 decimals', () => {
      const amount = '1000000000000000000'; // 1 token with 18 decimals
      expect(formatTokenAmount(amount, 18)).toBe('1');
    });

    it('should format with decimal places', () => {
      const amount = '1500000000000000000'; // 1.5 tokens
      expect(formatTokenAmount(amount, 18, 4)).toBe('1.5');
    });

    it('should handle 6 decimals (USDC)', () => {
      const amount = '1000000'; // 1 USDC
      expect(formatTokenAmount(amount, 6)).toBe('1');
    });

    it('should truncate excessive decimals', () => {
      const amount = '1234560000000000000'; // 1.23456 tokens
      expect(formatTokenAmount(amount, 18, 4)).toBe('1.2345');
    });

    it('should format large amounts with commas', () => {
      const amount = '1000000000000000000000'; // 1000 tokens
      expect(formatTokenAmount(amount, 18)).toBe('1,000');
    });
  });

  describe('formatUSD', () => {
    it('should format USD values', () => {
      expect(formatUSD(1000)).toBe('$1,000.00');
      expect(formatUSD(1234.56)).toBe('$1,234.56');
    });

    it('should handle string input', () => {
      expect(formatUSD('500')).toBe('$500.00');
    });

    it('should always show 2 decimal places', () => {
      expect(formatUSD(10)).toBe('$10.00');
    });
  });

  describe('formatDate', () => {
    it('should format date with default format', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const formatted = formatDate(date);
      expect(formatted).toContain('Jan');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2024');
    });

    it('should handle string input', () => {
      const dateStr = '2024-01-15T10:30:00Z';
      const formatted = formatDate(dateStr);
      expect(formatted).toContain('2024');
    });

    it('should use custom format string', () => {
      const date = new Date('2024-01-15');
      expect(formatDate(date, 'yyyy-MM-dd')).toBe('2024-01-15');
    });
  });

  describe('formatRelativeTime', () => {
    it('should format recent time as "ago"', () => {
      const recentDate = new Date(Date.now() - 1000 * 60 * 5); // 5 minutes ago
      const formatted = formatRelativeTime(recentDate);
      expect(formatted).toContain('ago');
    });

    it('should handle string input', () => {
      const dateStr = new Date(Date.now() - 1000 * 60 * 60).toISOString(); // 1 hour ago
      const formatted = formatRelativeTime(dateStr);
      expect(formatted).toContain('ago');
    });
  });

  describe('formatTxHash', () => {
    it('should shorten transaction hash', () => {
      const txHash =
        '0xa1b2c3d4e5f67890123456789012345678901234567890123456789012345678';
      expect(formatTxHash(txHash)).toBe('0xa1b2c3...345678');
    });

    it('should use custom char length', () => {
      const txHash =
        '0xa1b2c3d4e5f67890123456789012345678901234567890123456789012345678';
      expect(formatTxHash(txHash, 4)).toBe('0xa1b2...5678');
    });
  });

  describe('formatBlockNumber', () => {
    it('should format block number with commas', () => {
      expect(formatBlockNumber(18000000)).toBe('18,000,000');
      expect(formatBlockNumber(1234567)).toBe('1,234,567');
    });
  });

  describe('formatCompact', () => {
    it('should format billions', () => {
      expect(formatCompact(1500000000)).toBe('1.5B');
      expect(formatCompact(3200000000)).toBe('3.2B');
    });

    it('should format millions', () => {
      expect(formatCompact(1500000)).toBe('1.5M');
      expect(formatCompact(42000000)).toBe('42.0M');
    });

    it('should format thousands', () => {
      expect(formatCompact(1500)).toBe('1.5K');
      expect(formatCompact(9999)).toBe('10.0K');
    });

    it('should not format small numbers', () => {
      expect(formatCompact(999)).toBe('999');
      expect(formatCompact(42)).toBe('42');
    });
  });
});
