'use client';

import { useQuery } from '@tanstack/react-query';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { VolumeChart } from '@/components/dashboard/VolumeChart';
import { TokenChart } from '@/components/dashboard/TokenChart';
import { LeaderboardTable } from '@/components/dashboard/LeaderboardTable';
import { RealtimeCounter } from '@/components/dashboard/RealtimeCounter';
import { fetchStatistics, fetchVolumeOverTime } from '@/lib/api/stats';
import { formatCompact, formatTokenAmount } from '@/lib/utils/format';
import {
  Activity,
  TrendingUp,
  Users,
  DollarSign,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  // Fetch statistics
  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['statistics'],
    queryFn: fetchStatistics,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch volume over time
  const {
    data: volumeData,
    isLoading: volumeLoading,
    isError: volumeError,
  } = useQuery({
    queryKey: ['volume-over-time', 7],
    queryFn: () => fetchVolumeOverTime(7),
    refetchInterval: 60000, // Refetch every minute
  });

  const isLoading = statsLoading || volumeLoading;
  const hasError = statsError || volumeError;

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (hasError || !stats) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <p className="text-destructive font-semibold mb-2">
              Failed to load dashboard
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Unable to fetch statistics. Please try again.
            </p>
            <Button onClick={() => refetchStats()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Real-time statistics and analytics for blockchain events
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Transfers"
          value={
            <RealtimeCounter
              value={stats.totalTransfers}
              duration={1000}
            />
          }
          icon={Activity}
          color="blue"
          description="All-time transfers"
        />
        <StatsCard
          title="Total Volume"
          value={`$${formatCompact(Number(BigInt(stats.totalVolume) / BigInt(10 ** 6)))}`}
          icon={DollarSign}
          color="green"
          description="USDC volume"
        />
        <StatsCard
          title="Average Transfer"
          value={`$${formatCompact(
            Number(BigInt(stats.avgTransferSize) / BigInt(10 ** 6))
          )}`}
          icon={TrendingUp}
          color="purple"
          description="Avg USDC per transfer"
        />
        <StatsCard
          title="Unique Addresses"
          value={
            <RealtimeCounter
              value={stats.uniqueAddresses}
              duration={1000}
            />
          }
          icon={Users}
          color="orange"
          description="Active participants"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {volumeData && volumeData.length > 0 && (
          <VolumeChart data={volumeData} />
        )}
        {stats.topTokens && stats.topTokens.length > 0 && (
          <TokenChart data={stats.topTokens} />
        )}
      </div>

      {/* Leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stats.topSenders && stats.topSenders.length > 0 && (
          <LeaderboardTable
            data={stats.topSenders}
            title="Top Senders"
            type="sender"
          />
        )}
        {stats.topReceivers && stats.topReceivers.length > 0 && (
          <LeaderboardTable
            data={stats.topReceivers}
            title="Top Receivers"
            type="receiver"
          />
        )}
      </div>

      {/* Auto-refresh indicator */}
      <div className="mt-8 text-center">
        <p className="text-xs text-muted-foreground">
          Dashboard auto-refreshes every 30 seconds
        </p>
      </div>
    </div>
  );
}
