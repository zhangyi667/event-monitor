/**
 * Transfer History Component
 * Shows transaction history with tabs (all/sent/received)
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EventCard } from '@/components/events/EventCard';
import type { TransferEvent } from '@/types';
import { ArrowUpRight, ArrowDownLeft, Activity } from 'lucide-react';

interface TransferHistoryProps {
  address: string;
  events: TransferEvent[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
}

type TabType = 'all' | 'sent' | 'received';

export function TransferHistory({
  address,
  events,
  onLoadMore,
  hasMore = false,
  isLoading = false,
}: TransferHistoryProps) {
  const [activeTab, setActiveTab] = useState<TabType>('all');

  // Filter events based on active tab
  const filteredEvents = events.filter((event) => {
    if (activeTab === 'sent') {
      return event.from.toLowerCase() === address.toLowerCase();
    }
    if (activeTab === 'received') {
      return event.to.toLowerCase() === address.toLowerCase();
    }
    return true; // all
  });

  const sentCount = events.filter(
    (e) => e.from.toLowerCase() === address.toLowerCase()
  ).length;
  const receivedCount = events.filter(
    (e) => e.to.toLowerCase() === address.toLowerCase()
  ).length;

  const tabs: Array<{ id: TabType; label: string; count: number; icon: any }> = [
    { id: 'all', label: 'All', count: events.length, icon: Activity },
    { id: 'sent', label: 'Sent', count: sentCount, icon: ArrowUpRight },
    { id: 'received', label: 'Received', count: receivedCount, icon: ArrowDownLeft },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Transfer History</CardTitle>
          <div className="flex gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab(tab.id)}
                  className="gap-1.5"
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  <span className="ml-1 text-xs opacity-70">({tab.count})</span>
                </Button>
              );
            })}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No {activeTab !== 'all' && activeTab} transfers found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="pt-4 text-center">
                <Button
                  variant="outline"
                  onClick={onLoadMore}
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
