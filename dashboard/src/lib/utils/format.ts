/**
 * Formatting Utilities
 */

import { format, formatDistanceToNow } from 'date-fns';

/**
 * Format blockchain address (shorten)
 */
export function formatAddress(address: string, chars = 4): string {
  if (!address) return '';
  if (address.length < chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Format large numbers with commas
 */
export function formatNumber(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Format token amount with decimals
 */
export function formatTokenAmount(
  value: string,
  decimals: number = 18,
  maxDecimals: number = 4
): string {
  const amount = BigInt(value) / BigInt(10 ** decimals);
  const remainder = BigInt(value) % BigInt(10 ** decimals);

  if (remainder === BigInt(0)) {
    return formatNumber(amount.toString());
  }

  const decimalPart = remainder.toString().padStart(decimals, '0').slice(0, maxDecimals);
  return `${formatNumber(amount.toString())}.${decimalPart.replace(/0+$/, '')}`;
}

/**
 * Format USD value
 */
export function formatUSD(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Format date/time
 */
export function formatDate(date: string | Date, formatStr = 'PPpp'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatStr);
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

/**
 * Format transaction hash (shorten)
 */
export function formatTxHash(hash: string, chars = 6): string {
  return formatAddress(hash, chars);
}

/**
 * Format block number with commas
 */
export function formatBlockNumber(blockNumber: number): string {
  return formatNumber(blockNumber);
}

/**
 * Compact large numbers (e.g., 1000000 -> 1M)
 */
export function formatCompact(value: number): string {
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toString();
}
