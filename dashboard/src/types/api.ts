/**
 * API Response Types
 */

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  timestamp: string;
  path?: string;
}

export interface Statistics {
  totalTransfers: number;
  totalVolume: string;
  avgTransferSize: string;
  uniqueAddresses: number;
  topTokens?: TokenStats[];
  topSenders?: AddressStats[];
  topReceivers?: AddressStats[];
}

export interface TokenStats {
  token: string;
  symbol: string;
  name: string;
  transferCount: number;
  volume: string;
}

export interface AddressStats {
  address: string;
  ensName?: string;
  transferCount: number;
  totalSent?: string;
  totalReceived?: string;
}
