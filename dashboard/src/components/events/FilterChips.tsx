/**
 * Filter Chips Component
 * Displays active filters as removable chips
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import type { EventFilters } from '@/types';
import { formatAddress } from '@/lib/utils/format';

interface FilterChipsProps {
  filters: EventFilters;
  onRemove: (key: keyof EventFilters) => void;
}

export function FilterChips({ filters, onRemove }: FilterChipsProps) {
  const activeFilters = Object.entries(filters).filter(
    ([_, value]) => value !== undefined
  ) as [keyof EventFilters, string][];

  if (activeFilters.length === 0) {
    return null;
  }

  const formatFilterLabel = (key: keyof EventFilters, value: string): string => {
    switch (key) {
      case 'from':
        return `From: ${formatAddress(value)}`;
      case 'to':
        return `To: ${formatAddress(value)}`;
      case 'token':
        return `Token: ${formatAddress(value)}`;
      case 'minAmount':
        return `Min: ${value}`;
      case 'maxAmount':
        return `Max: ${value}`;
      case 'startDate':
        return `From: ${new Date(value).toLocaleDateString()}`;
      case 'endDate':
        return `To: ${new Date(value).toLocaleDateString()}`;
      default:
        return `${key}: ${value}`;
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {activeFilters.map(([key, value]) => (
        <Badge
          key={key}
          variant="secondary"
          className="gap-1.5 pr-1 cursor-pointer hover:bg-secondary/80"
        >
          <span className="text-xs">{formatFilterLabel(key, value)}</span>
          <button
            onClick={() => onRemove(key)}
            className="rounded-full hover:bg-background/50 p-0.5"
            aria-label={`Remove ${key} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
    </div>
  );
}
