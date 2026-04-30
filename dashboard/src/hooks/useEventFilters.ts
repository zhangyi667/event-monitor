/**
 * Event Filters Hook
 * Manages filter state and URL synchronization
 */

import { useState, useEffect, useCallback } from 'react';
import type { EventFilters } from '@/types';

export function useEventFilters() {
  // Initialize filters from URL params on client side
  const [filters, setFilters] = useState<EventFilters>(() => {
    if (typeof window === 'undefined') {
      return {};
    }

    const params = new URLSearchParams(window.location.search);
    return {
      from: params.get('from') || undefined,
      to: params.get('to') || undefined,
      token: params.get('token') || undefined,
      minAmount: params.get('minAmount') || undefined,
      maxAmount: params.get('maxAmount') || undefined,
      startDate: params.get('startDate') || undefined,
      endDate: params.get('endDate') || undefined,
    };
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value.toString());
      }
    });

    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : window.location.pathname;

    // Use replaceState to avoid adding to history on every filter change
    window.history.replaceState({}, '', newUrl);
  }, [filters]);

  // Update a single filter
  const updateFilter = useCallback(
    (key: keyof EventFilters, value: string | undefined) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value || undefined,
      }));
    },
    []
  );

  // Update multiple filters at once
  const updateFilters = useCallback((newFilters: Partial<EventFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({});
    window.history.replaceState({}, '', window.location.pathname);
  }, []);

  // Clear a single filter
  const clearFilter = useCallback((key: keyof EventFilters) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined
  );

  // Get count of active filters
  const activeFilterCount = Object.values(filters).filter(
    (value) => value !== undefined
  ).length;

  return {
    filters,
    updateFilter,
    updateFilters,
    clearFilters,
    clearFilter,
    hasActiveFilters,
    activeFilterCount,
  };
}
