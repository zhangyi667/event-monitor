/**
 * Event List Component
 * Displays filtered and paginated events (not real-time)
 * Used when filters are active
 */

'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { EventCard } from './EventCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fetchEvents } from '@/lib/api/events';
import type { EventFilters, TransferEvent } from '@/types';
import { Loader2, AlertCircle } from 'lucide-react';

interface EventListProps {
  filters: EventFilters;
}

export function EventList({ filters }: EventListProps) {
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['events', filters, page],
    queryFn: () => fetchEvents({ ...filters, page, size: pageSize }),
    staleTime: 10000, // 10 seconds
  });

  // Reset to page 0 when filters change
  useEffect(() => {
    setPage(0);
  }, [filters]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading events...</p>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <p className="text-destructive font-semibold mb-2">
            Failed to load events
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No events found</p>
          <p className="text-sm text-muted-foreground mt-2">
            Try adjusting your filters
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Event count */}
      <div className="text-sm text-muted-foreground">
        Showing {data.data.length} of {data.total} events
        {page > 0 && ` (Page ${page + 1} of ${data.totalPages})`}
      </div>

      {/* Event list */}
      <div className="space-y-3">
        {data.data.map((event: TransferEvent) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            Previous
          </Button>

          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {data.totalPages}
          </span>

          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))}
            disabled={page >= data.totalPages - 1}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
