'use client';

import { useState } from 'react';
import { EventFeed } from '@/components/events/EventFeed';
import { EventList } from '@/components/events/EventList';
import { EventSearch } from '@/components/events/EventSearch';
import { EventFilters } from '@/components/events/EventFilters';
import { FilterChips } from '@/components/events/FilterChips';
import { useEventFilters } from '@/hooks/useEventFilters';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, Radio } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function EventsPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const {
    filters,
    updateFilter,
    clearFilters,
    clearFilter,
    hasActiveFilters,
    activeFilterCount,
  } = useEventFilters();

  // Determine which view to show
  // If filters are active, show filtered list; otherwise show real-time feed
  const showFilteredList = hasActiveFilters || searchQuery;

  // Combine search query with filters
  const combinedFilters = {
    ...filters,
    // Search can match from, to, or token
    // We'll use the from field for now as a general search
    ...(searchQuery && { from: searchQuery }),
  };

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Event Monitor</h1>
            <p className="text-muted-foreground">
              {showFilteredList
                ? 'Filtered ERC20 token transfer events'
                : 'Real-time ERC20 token transfer events from the Ethereum blockchain'}
            </p>
          </div>

          {/* View indicator */}
          {!showFilteredList && (
            <Badge variant="success" className="gap-1.5">
              <Radio className="h-3 w-3" />
              Live Stream
            </Badge>
          )}
        </div>

        {/* Search bar */}
        <div className="mb-4">
          <EventSearch value={searchQuery} onChange={setSearchQuery} />
        </div>

        {/* Filter toggle and chips */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0">
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          {hasActiveFilters && (
            <div className="flex-1">
              <FilterChips filters={filters} onRemove={clearFilter} />
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filter panel (sidebar) */}
        {showFilters && (
          <div className="lg:col-span-1">
            <EventFilters
              filters={filters}
              onFilterChange={updateFilter}
              onClearAll={clearFilters}
              hasActiveFilters={hasActiveFilters}
            />
          </div>
        )}

        {/* Event display */}
        <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
          {showFilteredList ? (
            <EventList filters={combinedFilters} />
          ) : (
            <EventFeed />
          )}
        </div>
      </div>
    </div>
  );
}
