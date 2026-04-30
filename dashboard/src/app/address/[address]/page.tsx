'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { AddressHeader } from '@/components/address/AddressHeader';
import { AddressStats } from '@/components/address/AddressStats';
import { TransferHistory } from '@/components/address/TransferHistory';
import { fetchEventsByAddress } from '@/lib/api/events';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { isValidAddress } from '@/lib/utils/validation';
import { useState } from 'react';

export default function AddressPage() {
  const params = useParams();
  const address = params.address as string;
  const [page, setPage] = useState(0);
  const pageSize = 20;

  // Validate address
  if (!isValidAddress(address)) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <p className="text-destructive font-semibold mb-2">Invalid Address</p>
            <p className="text-sm text-muted-foreground mb-4">
              {address} is not a valid Ethereum address
            </p>
            <Link href="/events">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Events
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Fetch address events
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['address-events', address, page],
    queryFn: () => fetchEventsByAddress(address, page, pageSize),
  });

  // Calculate statistics from events
  const stats = data?.data
    ? (() => {
        let totalSent = BigInt(0);
        let totalReceived = BigInt(0);
        const transactionCount = data.total;

        data.data.forEach((event) => {
          if (event.from.toLowerCase() === address.toLowerCase()) {
            totalSent += BigInt(event.value);
          }
          if (event.to.toLowerCase() === address.toLowerCase()) {
            totalReceived += BigInt(event.value);
          }
        });

        return {
          totalSent: totalSent.toString(),
          totalReceived: totalReceived.toString(),
          transactionCount,
        };
      })()
    : null;

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading address details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <p className="text-destructive font-semibold mb-2">
              Failed to load address
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => refetch()}>Try Again</Button>
              <Link href="/events">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Events
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="container mx-auto p-8 max-w-6xl">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/events">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="space-y-6">
          <AddressHeader address={address} />

          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              No transactions found for this address
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              This address has not sent or received any tracked tokens yet
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/events">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Address Details</h1>
        <p className="text-muted-foreground">
          Complete transaction history and statistics
        </p>
      </div>

      {/* Address Info */}
      <div className="mb-6">
        <AddressHeader address={address} />
      </div>

      {/* Statistics */}
      {stats && (
        <div className="mb-6">
          <AddressStats
            totalSent={stats.totalSent}
            totalReceived={stats.totalReceived}
            transactionCount={stats.transactionCount}
          />
        </div>
      )}

      {/* Transfer History */}
      <TransferHistory
        address={address}
        events={data.data}
        hasMore={page < data.totalPages - 1}
        isLoading={isLoading}
        onLoadMore={() => setPage((p) => p + 1)}
      />
    </div>
  );
}
