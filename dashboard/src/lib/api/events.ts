/**
 * Event API Functions
 */

import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import type { TransferEvent, EventFilters, PaginatedResponse } from '@/types';

/**
 * Known token metadata registry
 */
const TOKEN_REGISTRY: Record<string, { symbol: string; name: string; decimals: number }> = {
  '0x1c7d4b196cb0c7b01d743fbc6116a902379c7238': { symbol: 'USDC', name: 'USD Coin', decimals: 6 },
};

function getTokenMetadata(contractAddress: string) {
  return TOKEN_REGISTRY[contractAddress.toLowerCase()];
}

/**
 * Maps a backend event object to the frontend TransferEvent format
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapBackendEvent(raw: any): TransferEvent {
  const contractAddress = raw.contractAddress || raw.token || '';
  const meta = getTokenMetadata(contractAddress);

  return {
    id: raw.id,
    transactionHash: raw.transactionHash,
    blockNumber: raw.blockNumber,
    timestamp: raw.blockTimestamp || raw.timestamp,
    from: raw.fromAddress || raw.from,
    to: raw.toAddress || raw.to,
    value: String(raw.value),
    token: contractAddress,
    tokenSymbol: raw.tokenSymbol || meta?.symbol,
    tokenName: raw.tokenName || meta?.name,
    decimals: raw.decimals ?? meta?.decimals ?? 0,
    logIndex: raw.logIndex,
  };
}

/**
 * Fetch paginated events with optional filters
 */
export async function fetchEvents(
  filters: EventFilters = {}
): Promise<PaginatedResponse<TransferEvent>> {
  const params = new URLSearchParams();

  // Add filters as query params
  if (filters.from) params.append('from', filters.from);
  if (filters.to) params.append('to', filters.to);
  if (filters.token) params.append('token', filters.token);
  if (filters.minAmount) params.append('minAmount', filters.minAmount);
  if (filters.maxAmount) params.append('maxAmount', filters.maxAmount);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.page !== undefined) params.append('page', filters.page.toString());
  if (filters.size !== undefined) params.append('size', filters.size.toString());

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await apiClient.get<any>(
    `${API_ENDPOINTS.EVENTS}?${params.toString()}`
  );

  // Map Spring Boot pagination format to our PaginatedResponse
  const raw = response.data;
  return {
    data: (raw.content || []).map(mapBackendEvent),
    page: raw.pageable?.pageNumber ?? raw.page ?? 0,
    size: raw.pageable?.pageSize ?? raw.size ?? 20,
    total: raw.totalElements ?? raw.total ?? 0,
    totalPages: raw.totalPages ?? 0,
  };
}

/**
 * Fetch events for a specific address
 */
export async function fetchEventsByAddress(
  address: string,
  page = 0,
  size = 20
): Promise<PaginatedResponse<TransferEvent>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await apiClient.get<any>(
    API_ENDPOINTS.ADDRESS_EVENTS(address),
    {
      params: { page, size },
    }
  );

  const raw = response.data;
  return {
    data: (raw.content || []).map(mapBackendEvent),
    page: raw.pageable?.pageNumber ?? raw.page ?? 0,
    size: raw.pageable?.pageSize ?? raw.size ?? 20,
    total: raw.totalElements ?? raw.total ?? 0,
    totalPages: raw.totalPages ?? 0,
  };
}

/**
 * Fetch event by transaction hash
 */
export async function fetchEventByTxHash(
  txHash: string
): Promise<TransferEvent | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await apiClient.get<any>(
      API_ENDPOINTS.EVENT_BY_HASH(txHash)
    );
    return mapBackendEvent(response.data);
  } catch (error) {
    return null;
  }
}
