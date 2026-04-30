/**
 * Address Stats Component
 * Shows key statistics for an address
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { formatTokenAmount, formatCompact } from '@/lib/utils/format';

interface AddressStatsProps {
  totalSent: string;
  totalReceived: string;
  transactionCount: number;
  decimals?: number;
}

export function AddressStats({
  totalSent,
  totalReceived,
  transactionCount,
  decimals = 18,
}: AddressStatsProps) {
  const sentETH = Number(BigInt(totalSent) / BigInt(10 ** decimals));
  const receivedETH = Number(BigInt(totalReceived) / BigInt(10 ** decimals));
  const netETH = receivedETH - sentETH;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total Sent */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-red-500" />
            Total Sent
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCompact(sentETH)}</div>
          <p className="text-xs text-muted-foreground mt-1">ETH equivalent</p>
        </CardContent>
      </Card>

      {/* Total Received */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-green-500" />
            Total Received
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCompact(receivedETH)}</div>
          <p className="text-xs text-muted-foreground mt-1">ETH equivalent</p>
        </CardContent>
      </Card>

      {/* Transaction Count */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-500" />
            Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{transactionCount}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Total transfers
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
