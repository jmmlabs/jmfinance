import { useState, useEffect, useCallback } from 'react';
import { apiUsageTracker, ApiUsageStats } from '@/services/apiUsageTracker';

interface UseApiUsageResult {
  stats: ApiUsageStats | null;
  rateLimitStatus: {
    daily: { status: 'safe' | 'warning' | 'critical'; percentage: number };
    minute: { status: 'safe' | 'warning' | 'critical'; callsInLastMinute: number };
  };
  liveIndicators: Map<string, {
    isLive: boolean;
    lastUpdate: Date | null;
    provider: string;
  }>;
  estimateOperationCost: (operation: 'test' | 'single' | 'all') => {
    cost: number;
    affordable: boolean;
    description: string;
  };
  usageHistory: { date: string; calls: number }[];
  refresh: () => void;
}

export function useApiUsage(): UseApiUsageResult {
  const [stats, setStats] = useState<ApiUsageStats | null>(null);
  const [updateKey, setUpdateKey] = useState(0);

  const refresh = useCallback(() => {
    setUpdateKey(prev => prev + 1);
  }, []);



  const estimateOperationCost = useCallback((operation: 'test' | 'single' | 'all') => {
    return apiUsageTracker.estimateOperationCost(operation);
  }, []);

  // Update stats when updateKey changes
  useEffect(() => {
    const updateStats = () => {
      try {
        const newStats = apiUsageTracker.getTodaysStats();
        setStats(newStats);
      } catch (error) {
        console.error('Failed to get API usage stats:', error);
      }
    };

    updateStats();
    
    // Set up interval to refresh stats every 30 seconds
    const interval = setInterval(updateStats, 30000);
    
    return () => clearInterval(interval);
  }, [updateKey]);

  // Get derived data
  const rateLimitStatus = apiUsageTracker.getRateLimitStatus();
  const liveIndicators = apiUsageTracker.getLiveDataIndicators();
  const usageHistory = apiUsageTracker.getUsageHistory();

  return {
    stats,
    rateLimitStatus,
    liveIndicators,
    estimateOperationCost,
    usageHistory,
    refresh
  };
}