/**
 * Event Filters Component
 * Panel with various filter options for events
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { EventFilters as EventFiltersType } from '@/types';
import { Filter, X } from 'lucide-react';

interface EventFiltersProps {
  filters: EventFiltersType;
  onFilterChange: (key: keyof EventFiltersType, value: string | undefined) => void;
  onClearAll: () => void;
  hasActiveFilters: boolean;
}

export function EventFilters({
  filters,
  onFilterChange,
  onClearAll,
  hasActiveFilters,
}: EventFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <CardTitle className="text-lg">Filters</CardTitle>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="h-8 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Address Filters */}
        <div className="space-y-2">
          <label className="text-sm font-medium">From Address</label>
          <input
            type="text"
            value={filters.from || ''}
            onChange={(e) => onFilterChange('from', e.target.value || undefined)}
            placeholder="0x..."
            className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">To Address</label>
          <input
            type="text"
            value={filters.to || ''}
            onChange={(e) => onFilterChange('to', e.target.value || undefined)}
            placeholder="0x..."
            className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Token Address</label>
          <input
            type="text"
            value={filters.token || ''}
            onChange={(e) => onFilterChange('token', e.target.value || undefined)}
            placeholder="0x..."
            className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Amount Range */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Amount Range</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={filters.minAmount || ''}
              onChange={(e) =>
                onFilterChange('minAmount', e.target.value || undefined)
              }
              placeholder="Min"
              className="h-9 px-3 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              type="text"
              value={filters.maxAmount || ''}
              onChange={(e) =>
                onFilterChange('maxAmount', e.target.value || undefined)
              }
              placeholder="Max"
              className="h-9 px-3 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Enter amount in Wei (e.g., 1000000000000000000 for 1 ETH)
          </p>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Date Range</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) =>
                onFilterChange('startDate', e.target.value || undefined)
              }
              className="h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) =>
                onFilterChange('endDate', e.target.value || undefined)
              }
              className="h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <p className="text-xs text-muted-foreground">Start date to end date</p>
        </div>
      </CardContent>
    </Card>
  );
}
