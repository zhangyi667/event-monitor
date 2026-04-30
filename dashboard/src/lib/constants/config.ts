/**
 * Application Configuration Constants
 */

export const APP_CONFIG = {
  name: 'Event Monitor',
  description: 'Real-time Ethereum ERC20 transfer monitoring',
  version: '1.0.0',

  // Pagination
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100],

  // SSE
  sseReconnectDelay: 3000,
  sseHeartbeatInterval: 30000,

  // UI
  maxEventsInFeed: 1000,
  autoScrollDelay: 100,

  // API
  apiTimeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
} as const;

export default APP_CONFIG;
