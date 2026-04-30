/**
 * Connection Status Component
 * Shows SSE connection state with visual indicator
 */

import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
  isPaused: boolean;
  error: Error | null;
  connectionAttempts: number;
}

export function ConnectionStatus({
  isConnected,
  isPaused,
  error,
  connectionAttempts,
}: ConnectionStatusProps) {
  if (isPaused) {
    return (
      <Badge variant="secondary" className="gap-1.5">
        <div className="h-2 w-2 rounded-full bg-gray-400" />
        Paused
      </Badge>
    );
  }

  if (error) {
    return (
      <Badge variant="destructive" className="gap-1.5">
        <WifiOff className="h-3 w-3" />
        {connectionAttempts > 5 ? 'Connection Failed' : 'Reconnecting...'}
      </Badge>
    );
  }

  if (isConnected) {
    return (
      <Badge variant="success" className="gap-1.5">
        <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
        Live
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="gap-1.5">
      <RefreshCw className="h-3 w-3 animate-spin" />
      Connecting...
    </Badge>
  );
}
