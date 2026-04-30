/**
 * Statistics API Functions
 * Fetch aggregated statistics and analytics data
 */

import apiClient from './client';
import { fetchEvents } from './events';
import type { Statistics, TokenStats, AddressStats } from '@/types';

/**
 * Fetch overall statistics
 * Note: This endpoint may need to be implemented in the backend
 * For now, we'll aggregate from events
 */
export async function fetchStatistics(): Promise<Statistics> {
  // Get basic stats from backend and aggregate leaderboards from events
  const [backendStats, aggregated] = await Promise.all([
    apiClient.get('/events/stats').then(r => r.data).catch(() => null),
    aggregateStatsFromEvents(),
  ]);

  if (backendStats) {
    return {
      totalTransfers: backendStats.totalEvents ?? aggregated.totalTransfers,
      totalVolume: aggregated.totalVolume,
      avgTransferSize: aggregated.avgTransferSize,
      uniqueAddresses: (backendStats.uniqueFromAddresses ?? 0) + (backendStats.uniqueToAddresses ?? 0),
      topTokens: aggregated.topTokens,
      topSenders: aggregated.topSenders,
      topReceivers: aggregated.topReceivers,
    };
  }

  return aggregated;
}

/**
 * Aggregate statistics from events
 * Used as fallback when backend doesn't have stats endpoint
 */
async function aggregateStatsFromEvents(): Promise<Statistics> {
  try {
    // Fetch recent events
    const eventsResponse = await fetchEvents({ page: 0, size: 100 });
    const events = eventsResponse.data;

    if (events.length === 0) {
      return {
        totalTransfers: 0,
        totalVolume: '0',
        avgTransferSize: '0',
        uniqueAddresses: 0,
        topTokens: [],
        topSenders: [],
        topReceivers: [],
      };
    }

    // Calculate statistics
    const totalTransfers = eventsResponse.total;

    // Calculate total volume (sum of all values)
    const totalVolume = events.reduce((sum, event) => {
      return sum + BigInt(event.value);
    }, BigInt(0));

    // Calculate average
    const avgTransferSize = totalVolume / BigInt(events.length);

    // Count unique addresses
    const uniqueAddresses = new Set([
      ...events.map((e) => e.from),
      ...events.map((e) => e.to),
    ]).size;

    // Top tokens
    const tokenCounts = new Map<string, { count: number; symbol: string; name: string; volume: bigint }>();
    events.forEach((event) => {
      const existing = tokenCounts.get(event.token) || {
        count: 0,
        symbol: event.tokenSymbol || 'UNKNOWN',
        name: event.tokenName || 'Unknown Token',
        volume: BigInt(0),
      };
      tokenCounts.set(event.token, {
        count: existing.count + 1,
        symbol: existing.symbol,
        name: existing.name,
        volume: existing.volume + BigInt(event.value),
      });
    });

    const topTokens: TokenStats[] = Array.from(tokenCounts.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([token, data]) => ({
        token,
        symbol: data.symbol,
        name: data.name,
        transferCount: data.count,
        volume: data.volume.toString(),
      }));

    // Top senders
    const senderCounts = new Map<string, { count: number; totalSent: bigint }>();
    events.forEach((event) => {
      const existing = senderCounts.get(event.from) || { count: 0, totalSent: BigInt(0) };
      senderCounts.set(event.from, {
        count: existing.count + 1,
        totalSent: existing.totalSent + BigInt(event.value),
      });
    });

    const topSenders: AddressStats[] = Array.from(senderCounts.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([address, data]) => ({
        address,
        transferCount: data.count,
        totalSent: data.totalSent.toString(),
      }));

    // Top receivers
    const receiverCounts = new Map<string, { count: number; totalReceived: bigint }>();
    events.forEach((event) => {
      const existing = receiverCounts.get(event.to) || { count: 0, totalReceived: BigInt(0) };
      receiverCounts.set(event.to, {
        count: existing.count + 1,
        totalReceived: existing.totalReceived + BigInt(event.value),
      });
    });

    const topReceivers: AddressStats[] = Array.from(receiverCounts.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([address, data]) => ({
        address,
        transferCount: data.count,
        totalReceived: data.totalReceived.toString(),
      }));

    return {
      totalTransfers,
      totalVolume: totalVolume.toString(),
      avgTransferSize: avgTransferSize.toString(),
      uniqueAddresses,
      topTokens,
      topSenders,
      topReceivers,
    };
  } catch (error) {
    console.error('Failed to aggregate stats:', error);
    throw error;
  }
}

/**
 * Fetch volume over time data
 * Returns time-series data for volume chart
 */
export async function fetchVolumeOverTime(days: number = 7): Promise<Array<{
  date: string;
  volume: number;
  count: number;
}>> {
  try {
    const response = await apiClient.get('/events/stats/volume', {
      params: { days },
    });
    return response.data;
  } catch (error) {
    // Fallback: return mock data
    console.warn('Volume over time endpoint not available, using mock data');
    return generateMockVolumeData(days);
  }
}

/**
 * Generate mock volume data for demo purposes
 */
function generateMockVolumeData(days: number) {
  const data = [];
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now - i * dayMs);
    data.push({
      date: date.toISOString().split('T')[0],
      volume: Math.floor(Math.random() * 10000000) + 1000000,
      count: Math.floor(Math.random() * 500) + 100,
    });
  }

  return data;
}
