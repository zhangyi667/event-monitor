/**
 * API Endpoint Constants
 */

export const API_ENDPOINTS = {
  // Events
  EVENTS: '/events',
  EVENTS_STREAM: '/events/stream',
  EVENT_BY_HASH: (hash: string) => `/events/tx/${hash}`,

  // Address
  ADDRESS_EVENTS: (address: string) => `/events/address/${address}`,

  // Statistics
  STATS: '/events/stats',
  STATS_VOLUME: '/events/stats/volume',
  STATS_TOP_TOKENS: '/events/stats/tokens',
  STATS_TOP_ADDRESSES: '/events/stats/addresses',
} as const;

export default API_ENDPOINTS;
