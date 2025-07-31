import { useState, useEffect, useCallback } from 'react';
import { CryptoPriceUpdateResult } from '@/types/api';
import { coinGeckoService } from '@/services/coinGeckoService';

export interface CryptoPriceStatus {
  coinId: string;
  symbol: string;
  price: number | null;
  lastUpdated: Date | null;
  fromCache: boolean;
  hasError: boolean;
  error?: string;
}

export interface UseCryptoPricesResult {
  prices: Map<string, CryptoPriceUpdateResult>;
  loading: boolean;
  loadingCoinIds: Set<string>;
  error: string | null;
  lastRefresh: Date | null;
  priceStatuses: CryptoPriceStatus[];
  refreshPrice: (coinId: string) => Promise<void>;
  refreshAllPrices: (coinIds: string[]) => Promise<void>;
  testConnection: () => Promise<void>;
}

export interface UseCryptoPricesOptions {
  autoRefreshOnMount?: boolean;
}

export function useCryptoPrices(
  coinIds: string[],
  options: UseCryptoPricesOptions = {}
): UseCryptoPricesResult {
  const { autoRefreshOnMount = false } = options;
  
  const [prices, setPrices] = useState<Map<string, CryptoPriceUpdateResult>>(new Map());
  const [loading, setLoading] = useState(false);
  const [loadingCoinIds, setLoadingCoinIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Load initial data
  useEffect(() => {
    if (coinIds.length === 0) return;

    const loadInitialData = async () => {
      try {
        if (autoRefreshOnMount) {
          // Load with API calls if auto-refresh is enabled
          setLoading(true);
          const results = await coinGeckoService.getMultiplePrices(coinIds, true);
          const priceMap = new Map(results.map(result => [result.coinId, result]));
          setPrices(priceMap);
          setLastRefresh(new Date());
        } else {
          // Load only cached data to avoid API calls
          const cachedResults = coinGeckoService.getCachedPricesOnly(coinIds);
          if (cachedResults.length > 0) {
            const priceMap = new Map(cachedResults.map(result => [result.coinId, result]));
            setPrices(priceMap);
            setLastRefresh(new Date());
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load crypto prices');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [coinIds.join(','), autoRefreshOnMount]);

  // Refresh a single cryptocurrency price
  const refreshPrice = useCallback(async (coinId: string) => {
    if (!coinId) return;

    try {
      setLoadingCoinIds(prev => new Set(prev).add(coinId));
      setError(null);

      const result = await coinGeckoService.getPrice(coinId, false); // Force fresh data
      
      setPrices(prev => {
        const newMap = new Map(prev);
        newMap.set(coinId, result);
        return newMap;
      });

      setLastRefresh(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh crypto price';
      setError(errorMessage);
      console.error(`Error refreshing price for ${coinId}:`, err);
    } finally {
      setLoadingCoinIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(coinId);
        return newSet;
      });
    }
  }, []);

  // Refresh all cryptocurrency prices
  const refreshAllPrices = useCallback(async (coinIdsToRefresh: string[]) => {
    if (coinIdsToRefresh.length === 0) return;

    try {
      setLoading(true);
      setError(null);

      const results = await coinGeckoService.getMultiplePrices(coinIdsToRefresh, false); // Force fresh data
      
      setPrices(prev => {
        const newMap = new Map(prev);
        results.forEach(result => {
          newMap.set(result.coinId, result);
        });
        return newMap;
      });

      setLastRefresh(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh crypto prices';
      setError(errorMessage);
      console.error('Error refreshing all crypto prices:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Test API connection
  const testConnection = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await coinGeckoService.testConnection();
      
      if (!result.success) {
        setError(result.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to test CoinGecko API connection';
      setError(errorMessage);
      console.error('Error testing CoinGecko connection:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate price statuses for UI display
  const priceStatuses: CryptoPriceStatus[] = coinIds.map(coinId => {
    const priceData = prices.get(coinId);
    
    return {
      coinId,
      symbol: priceData?.symbol || coinId.toUpperCase(),
      price: priceData?.price || null,
      lastUpdated: priceData?.lastUpdated || null,
      fromCache: priceData?.fromCache || false,
      hasError: !priceData?.success,
      error: priceData?.error,
    };
  });

  return {
    prices,
    loading,
    loadingCoinIds,
    error,
    lastRefresh,
    priceStatuses,
    refreshPrice,
    refreshAllPrices,
    testConnection,
  };
}