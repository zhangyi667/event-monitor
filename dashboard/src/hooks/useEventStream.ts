/**
 * Custom hook for Server-Sent Events (SSE) connection
 * Manages real-time event streaming from the backend
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import type { TransferEvent } from '@/types';
import { APP_CONFIG } from '@/lib/constants/config';
import { mapBackendEvent } from '@/lib/api/events';

interface UseEventStreamOptions {
  enabled?: boolean;
  onEvent?: (event: TransferEvent) => void;
  onError?: (error: Error) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

interface UseEventStreamReturn {
  events: TransferEvent[];
  isConnected: boolean;
  isPaused: boolean;
  error: Error | null;
  connectionAttempts: number;
  pause: () => void;
  resume: () => void;
  clearEvents: () => void;
  reconnect: () => void;
}

export function useEventStream(
  options: UseEventStreamOptions = {}
): UseEventStreamReturn {
  const { enabled = true } = options;

  const [events, setEvents] = useState<TransferEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  // Separate trigger that only changes on error-based reconnects
  const [reconnectKey, setReconnectKey] = useState(0);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const attemptsRef = useRef(0);

  // Store callbacks in refs to avoid dependency cycles
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  const pause = useCallback(() => {
    setIsPaused(true);
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
      optionsRef.current.onDisconnect?.();
    }
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const reconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    attemptsRef.current = 0;
    setConnectionAttempts(0);
    setError(null);
    setIsPaused(false);
    setReconnectKey((k) => k + 1);
  }, []);

  const resetHeartbeat = useCallback(() => {
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
    }
    heartbeatTimeoutRef.current = setTimeout(() => {
      console.warn('SSE heartbeat timeout - connection may be stale');
      setError(new Error('Connection timeout - no heartbeat received'));
      eventSourceRef.current?.close();
    }, APP_CONFIG.sseHeartbeatInterval + 5000);
  }, []);

  // Main connection effect - only re-runs on enabled/isPaused/reconnectKey
  useEffect(() => {
    if (!enabled || isPaused) return;

    const sseUrl =
      process.env.NEXT_PUBLIC_SSE_URL ||
      'http://localhost:30081/api/events/stream';

    console.log('Connecting to SSE:', sseUrl);

    const eventSource = new EventSource(sseUrl);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('SSE connection established');
      setIsConnected(true);
      setError(null);
      attemptsRef.current += 1;
      setConnectionAttempts(attemptsRef.current);
      resetHeartbeat();
      optionsRef.current.onConnect?.();
    };

    eventSource.addEventListener('transfer', (e: MessageEvent) => {
      try {
        const rawEvent = JSON.parse(e.data);
        const event = mapBackendEvent(rawEvent);

        setEvents((prev) => {
          const newEvents = [event, ...prev];
          return newEvents.slice(0, APP_CONFIG.maxEventsInFeed);
        });

        optionsRef.current.onEvent?.(event);
        resetHeartbeat();
      } catch (err) {
        console.error('Failed to parse SSE event:', err);
      }
    });

    eventSource.addEventListener('connected', () => {
      console.log('SSE connected event received');
      resetHeartbeat();
    });

    eventSource.onerror = () => {
      const sseError = new Error('SSE connection error');
      setError(sseError);
      setIsConnected(false);
      optionsRef.current.onError?.(sseError);

      eventSource.close();
      eventSourceRef.current = null;

      if (attemptsRef.current < 10) {
        console.log(
          `SSE reconnecting in ${APP_CONFIG.sseReconnectDelay}ms (attempt ${attemptsRef.current})...`
        );
        reconnectTimeoutRef.current = setTimeout(() => {
          setReconnectKey((k) => k + 1);
        }, APP_CONFIG.sseReconnectDelay);
      } else {
        setError(
          new Error('Max reconnection attempts reached. Please refresh.')
        );
      }
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (heartbeatTimeoutRef.current) {
        clearTimeout(heartbeatTimeoutRef.current);
      }
    };
  }, [enabled, isPaused, reconnectKey, resetHeartbeat]);

  return {
    events,
    isConnected,
    isPaused,
    error,
    connectionAttempts,
    pause,
    resume,
    clearEvents,
    reconnect,
  };
}
