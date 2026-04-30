/**
 * Transfer Event Types
 */

export interface TransferEvent {
  id: string;
  transactionHash: string;
  blockNumber: number;
  timestamp: string;
  from: string;
  to: string;
  value: string;
  token: string;
  tokenSymbol?: string;
  tokenName?: string;
  decimals: number;
  logIndex?: number;
}

export interface EventFilters {
  from?: string;
  to?: string;
  token?: string;
  minAmount?: string;
  maxAmount?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

export interface EventStreamMessage {
  type: 'event' | 'heartbeat' | 'error';
  data?: TransferEvent;
  message?: string;
  timestamp?: string;
}
