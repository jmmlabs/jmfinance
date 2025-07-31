"use client";

import { Badge } from '@/components/ui/badge';
import { Zap, Clock, Wifi } from 'lucide-react';
import { useApiUsage } from '@/hooks/useApiUsage';
import { formatDistanceToNow } from 'date-fns';

interface LiveDataIndicatorProps {
  symbol?: string;
  showDetails?: boolean;
  className?: string;
}

export function LiveDataIndicator({ 
  symbol, 
  showDetails = false, 
  className = "" 
}: LiveDataIndicatorProps) {
  const { liveIndicators, stats } = useApiUsage();

  // If symbol is provided, show indicator for that specific symbol
  if (symbol) {
    const indicator = liveIndicators.get(symbol);
    
    if (!indicator?.isLive) {
      return showDetails ? (
        <Badge variant="secondary" className={className}>
          <Clock className="h-3 w-3 mr-1" />
          Cached
        </Badge>
      ) : null;
    }

    return (
      <Badge variant="default" className={`${className} animate-pulse`}>
        <div className="w-2 h-2 bg-green-400 rounded-full mr-1" />
        Live
        {showDetails && indicator.lastUpdate && (
          <span className="ml-1 text-xs">
            ({formatDistanceToNow(indicator.lastUpdate, { addSuffix: true })})
          </span>
        )}
      </Badge>
    );
  }

  // Global live data indicator
  const liveCount = liveIndicators.size;
  const totalCallsToday = stats?.totalCallsToday || 0;

  if (liveCount === 0) {
    return (
      <Badge variant="secondary" className={className}>
        <Clock className="h-3 w-3 mr-1" />
        All Cached
      </Badge>
    );
  }

  return (
    <Badge variant="default" className={`${className}`}>
      <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse" />
      {liveCount} Live Asset{liveCount !== 1 ? 's' : ''}
      {showDetails && (
        <span className="ml-1 text-xs">
          ({totalCallsToday} API calls today)
        </span>
      )}
    </Badge>
  );
}

// Component for showing API status in header
export function ApiStatusHeader() {
  const { stats, rateLimitStatus } = useApiUsage();

  if (!stats) return null;

  const getStatusColor = (status: 'safe' | 'warning' | 'critical') => {
    switch (status) {
      case 'safe': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
    }
  };

  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="flex items-center gap-1">
        <Wifi className="h-4 w-4" />
        <span className="font-mono">
          {stats.totalCallsToday}/{stats.dailyLimit}
        </span>
      </div>
      
      <div className={`flex items-center gap-1 ${getStatusColor(rateLimitStatus.daily.status)}`}>
        <div className="w-2 h-2 rounded-full bg-current" />
        <span>
          {rateLimitStatus.daily.status === 'safe' ? 'Good' :
           rateLimitStatus.daily.status === 'warning' ? 'Low' : 'Critical'}
        </span>
      </div>

      <LiveDataIndicator showDetails />
    </div>
  );
}