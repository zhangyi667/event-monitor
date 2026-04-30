/**
 * Event Card Component
 * Displays a single transfer event with formatted data
 */

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { TransferEvent } from '@/types';
import {
  formatAddress,
  formatTokenAmount,
  formatRelativeTime,
  formatBlockNumber,
} from '@/lib/utils/format';
import { ArrowRight, ExternalLink, Copy } from 'lucide-react';
import { useState } from 'react';

interface EventCardProps {
  event: TransferEvent;
  isNew?: boolean;
}

export function EventCard({ event, isNew = false }: EventCardProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const etherscanTxUrl = `https://etherscan.io/tx/${event.transactionHash}`;
  const formattedAmount = formatTokenAmount(event.value, event.decimals);

  return (
    <Card
      className={`transition-all duration-300 ${
        isNew ? 'ring-2 ring-primary animate-pulse-once' : ''
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left side: Addresses */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                #{formatBlockNumber(event.blockNumber)}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(event.timestamp)}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Link
                href={`/address/${event.from}`}
                className="font-mono hover:text-primary transition-colors"
                title={event.from}
              >
                {formatAddress(event.from)}
              </Link>

              <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />

              <Link
                href={`/address/${event.to}`}
                className="font-mono hover:text-primary transition-colors"
                title={event.to}
              >
                {formatAddress(event.to)}
              </Link>
            </div>
          </div>

          {/* Right side: Amount & Token */}
          <div className="text-right flex-shrink-0">
            <div className="font-semibold text-lg">
              {formattedAmount}{' '}
              <span className="text-sm text-muted-foreground">
                {event.tokenSymbol || 'TOKEN'}
              </span>
            </div>
            {event.tokenName && (
              <div className="text-xs text-muted-foreground mt-1">
                {event.tokenName}
              </div>
            )}
          </div>
        </div>

        {/* Transaction Hash */}
        <div className="mt-3 pt-3 border-t flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs text-muted-foreground">TX:</span>
            <code
              className="text-xs font-mono cursor-pointer hover:text-primary transition-colors"
              onClick={() => copyToClipboard(event.transactionHash)}
              title="Click to copy"
            >
              {formatAddress(event.transactionHash, 6)}
            </code>
            <button
              onClick={() => copyToClipboard(event.transactionHash)}
              className="text-muted-foreground hover:text-primary transition-colors"
              title={copied ? 'Copied!' : 'Copy transaction hash'}
            >
              {copied ? (
                <span className="text-xs text-green-500">✓</span>
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
          </div>

          <a
            href={etherscanTxUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            Etherscan
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
