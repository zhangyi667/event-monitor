/**
 * Tests for validation utilities
 */

import {
  isValidAddress,
  isValidTxHash,
  isValidENS,
  sanitizeInput,
} from '../validation';

describe('Validation Utilities', () => {
  describe('isValidAddress', () => {
    it('should validate correct Ethereum addresses', () => {
      expect(isValidAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9')).toBe(
        true
      );
      expect(isValidAddress('0xdAC17F958D2ee523a2206206994597C13D831ec7')).toBe(
        true
      );
      expect(isValidAddress('0x0000000000000000000000000000000000000000')).toBe(
        true
      );
    });

    it('should reject invalid addresses', () => {
      expect(isValidAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bE')).toBe(
        false
      ); // Too short
      expect(isValidAddress('742d35Cc6634C0532925a3b844Bc9e7595f0bEb9')).toBe(
        false
      ); // Missing 0x
      expect(isValidAddress('0xGGGG35Cc6634C0532925a3b844Bc9e7595f0bEb9')).toBe(
        false
      ); // Invalid chars
      expect(isValidAddress('not an address')).toBe(false);
      expect(isValidAddress('')).toBe(false);
    });
  });

  describe('isValidTxHash', () => {
    it('should validate correct transaction hashes', () => {
      expect(
        isValidTxHash(
          '0xa1b2c3d4e5f67890123456789012345678901234567890123456789012345678'
        )
      ).toBe(true);
      expect(
        isValidTxHash(
          '0x0000000000000000000000000000000000000000000000000000000000000000'
        )
      ).toBe(true);
    });

    it('should reject invalid transaction hashes', () => {
      expect(
        isValidTxHash(
          '0xa1b2c3d4e5f6789012345678901234567890123456789012345678901234567'
        )
      ).toBe(false); // Too short
      expect(
        isValidTxHash(
          'a1b2c3d4e5f67890123456789012345678901234567890123456789012345678'
        )
      ).toBe(false); // Missing 0x
      expect(
        isValidTxHash(
          '0xGGGGc3d4e5f67890123456789012345678901234567890123456789012345678'
        )
      ).toBe(false); // Invalid chars
      expect(isValidTxHash('not a hash')).toBe(false);
      expect(isValidTxHash('')).toBe(false);
    });
  });

  describe('isValidENS', () => {
    it('should validate correct ENS names', () => {
      expect(isValidENS('vitalik.eth')).toBe(true);
      expect(isValidENS('example.eth')).toBe(true);
      expect(isValidENS('test-name.eth')).toBe(true);
      expect(isValidENS('abc123.eth')).toBe(true);
    });

    it('should reject invalid ENS names', () => {
      expect(isValidENS('vitalik')).toBe(false); // Missing .eth
      expect(isValidENS('Vitalik.eth')).toBe(false); // Uppercase
      expect(isValidENS('vitalik.com')).toBe(false); // Wrong TLD
      expect(isValidENS('vitalik_test.eth')).toBe(false); // Underscore
      expect(isValidENS('.eth')).toBe(false); // Empty name
      expect(isValidENS('')).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('should trim and lowercase input', () => {
      expect(sanitizeInput('  Example  ')).toBe('example');
      expect(sanitizeInput('UPPERCASE')).toBe('uppercase');
      expect(sanitizeInput(' MiXeD CaSe ')).toBe('mixed case');
    });

    it('should handle empty strings', () => {
      expect(sanitizeInput('')).toBe('');
      expect(sanitizeInput('   ')).toBe('');
    });

    it('should handle special characters', () => {
      expect(sanitizeInput('0xABC123')).toBe('0xabc123');
    });
  });
});
