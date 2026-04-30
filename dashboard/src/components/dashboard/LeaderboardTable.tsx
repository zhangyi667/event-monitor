/**
 * Leaderboard Table Component
 * Shows top addresses by transfer count
 */

'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { AddressStats } from '@/types';
import { formatAddress, formatTokenAmount, formatCompact } from '@/lib/utils/format';
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react';

interface LeaderboardTableProps {
  data: AddressStats[];
  title: string;
  type: 'sender' | 'receiver';
}

export function LeaderboardTable({ data, title, type }: LeaderboardTableProps) {
  const getMedalEmoji = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-orange-500" />
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No data available</p>
        ) : (
          <div className="space-y-3">
            {data.map((item, index) => (
              <div
                key={item.address}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-lg font-semibold w-8 text-center flex-shrink-0">
                    {getMedalEmoji(index)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/address/${item.address}`}
                      className="font-mono text-sm hover:text-primary transition-colors block truncate"
                      title={item.address}
                    >
                      {formatAddress(item.address, 6)}
                    </Link>
                    {item.ensName && (
                      <span className="text-xs text-muted-foreground">{item.ensName}</span>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-semibold">{item.transferCount}</div>
                  <div className="text-xs text-muted-foreground">transfers</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
