/**
 * Address Header Component
 * Displays address with ENS, copy button, and external links
 */

'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink, Check } from 'lucide-react';

interface AddressHeaderProps {
  address: string;
  ensName?: string;
}

export function AddressHeader({ address, ensName }: AddressHeaderProps) {
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const etherscanUrl = `https://etherscan.io/address/${address}`;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          {/* ENS Name */}
          {ensName && (
            <div>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {ensName}
              </Badge>
            </div>
          )}

          {/* Address */}
          <div className="flex items-center gap-2 flex-wrap">
            <code className="text-lg font-mono bg-muted px-3 py-2 rounded-md break-all">
              {address}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={copyAddress}
              className="flex-shrink-0"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </>
              )}
            </Button>
            <a
              href={etherscanUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0"
            >
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-1" />
                Etherscan
              </Button>
            </a>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground">
            View all transactions and statistics for this address
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
