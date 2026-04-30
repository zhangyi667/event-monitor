/**
 * Event Feed Component
 * Main component for displaying real-time event stream
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useEventStream } from '@/hooks/useEventStream';
import { EventCard } from './EventCard';
import { ConnectionStatus } from './ConnectionStatus';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Play,
  Pause,
  RotateCw,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { fetchEvents } from '@/lib/api/events';
import type { TransferEvent } from '@/types';

export function EventFeed() {
  // Load initial historical events
  const { data: historicalData } = useQuery({
    queryKey: ['initial-events'],
    queryFn: () => fetchEvents({ page: 0, size: 20 }),
    staleTime: 60000, // Don't refetch for 1 minute
  });

  const {
    events: liveEvents,
    isConnected,
    isPaused,
    error,
    connectionAttempts,
    pause,
    resume,
    clearEvents,
    reconnect,
  } = useEventStream({
    onEvent: (event) => {
      console.log('New event received:', event);
      // Play notification sound or show toast here if desired
    },
  });

  // Combine historical and live events, removing duplicates
  const [combinedEvents, setCombinedEvents] = useState<TransferEvent[]>([]);

  useEffect(() => {
    const historical = historicalData?.data || [];
    const eventMap = new Map<string, TransferEvent>();

    // Add historical events first
    historical.forEach(event => eventMap.set(event.id, event));

    // Add/update with live events (they take precedence)
    liveEvents.forEach(event => eventMap.set(event.id, event));

    // Convert back to array and sort by timestamp (newest first)
    const combined = Array.from(eventMap.values()).sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeB - timeA;
    });

    setCombinedEvents(combined);
  }, [historicalData, liveEvents]);

  // Use combined events instead of just liveEvents
  const events = combinedEvents;

  const [autoScroll, setAutoScroll] = useState(true);
  const [newEventIds, setNewEventIds] = useState<Set<string>>(new Set());
  const feedRef = useRef<HTMLDivElement>(null);
  const prevEventsLengthRef = useRef(events.length);

  // Handle auto-scroll when new events arrive
  useEffect(() => {
    if (
      autoScroll &&
      events.length > prevEventsLengthRef.current &&
      feedRef.current
    ) {
      feedRef.current.scrollTop = 0; // Scroll to top (newest first)

      // Mark new events for animation
      const newIds = events
        .slice(0, events.length - prevEventsLengthRef.current)
        .map((e) => e.id);

      setNewEventIds(new Set(newIds));

      // Clear new event markers after animation
      setTimeout(() => {
        setNewEventIds(new Set());
      }, 3000);
    }
    prevEventsLengthRef.current = events.length;
  }, [events.length, autoScroll]);

  const handleClear = () => {
    if (confirm('Clear all events from the feed?')) {
      clearEvents();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CardTitle>Real-Time Event Feed</CardTitle>
              <ConnectionStatus
                isConnected={isConnected}
                isPaused={isPaused}
                error={error}
                connectionAttempts={connectionAttempts}
              />
            </div>

            <div className="flex items-center gap-2">
              {/* Auto-scroll toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoScroll(!autoScroll)}
                title={autoScroll ? 'Disable auto-scroll' : 'Enable auto-scroll'}
              >
                {autoScroll ? (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Auto-scroll
                  </>
                ) : (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Manual
                  </>
                )}
              </Button>

              {/* Pause/Resume */}
              {isPaused ? (
                <Button variant="default" size="sm" onClick={resume}>
                  <Play className="h-4 w-4" />
                  Resume
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={pause}>
                  <Pause className="h-4 w-4" />
                  Pause
                </Button>
              )}

              {/* Reconnect */}
              <Button
                variant="outline"
                size="sm"
                onClick={reconnect}
                disabled={isConnected && !error}
              >
                <RotateCw className="h-4 w-4" />
              </Button>

              {/* Clear */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                disabled={events.length === 0}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{events.length} events loaded</span>
            {error && (
              <span className="text-destructive">
                Error: {error.message}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Event list */}
      <div
        ref={feedRef}
        className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2"
      >
        {events.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-muted-foreground">
                {isPaused ? (
                  <div>
                    <Pause className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Event stream paused</p>
                    <p className="text-sm mt-2">
                      Click Resume to continue receiving events
                    </p>
                  </div>
                ) : isConnected ? (
                  <div>
                    <div className="h-12 w-12 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p>Waiting for events...</p>
                    <p className="text-sm mt-2">
                      Listening for new ERC20 transfers
                    </p>
                  </div>
                ) : (
                  <div>
                    <RotateCw className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Connecting to event stream...</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isNew={newEventIds.has(event.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
