/**
 * Validation Utilities
 */

/**
 * Validate Ethereum address format
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate transaction hash format
 */
export function isValidTxHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Validate ENS name format
 */
export function isValidENS(name: string): boolean {
  return /^[a-z0-9-]+\.eth$/.test(name);
}

/**
 * Sanitize user input (basic)
 */
export function sanitizeInput(input: string): string {
  return input.trim().toLowerCase();
}
