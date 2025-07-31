import { useState, useEffect, useCallback, useRef } from 'react';
import { alphaVantageService } from '@/services/alphaVantageService';
import { PriceUpdateResult } from '@/types/api';

interface UseStockPricesResult {
  prices: Map<string, PriceUpdateResult>;
  loading: boolean;
  loadingSymbols: Set<string>; // Track individual symbol loading states
  error: string | null;
  lastUpdate: Date | null;
  refreshAll: () => Promise<void>;
  refreshSymbol: (symbol: string) => Promise<void>;
  clearCache: (symbol?: string) => void;
  testConnection: () => Promise<boolean>;
}

interface UseStockPricesOptions {
  symbols: string[];
  autoRefreshOnMount?: boolean;
  enableLogging?: boolean;
}

export function useStockPrices({
  symbols,
  autoRefreshOnMount = true,
  enableLogging = true
}: UseStockPricesOptions): UseStockPricesResult {
  const [prices, setPrices] = useState<Map<string, PriceUpdateResult>>(new Map());
  const [loading, setLoading] = useState(false);
  const [loadingSymbols, setLoadingSymbols] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  // Use ref to prevent infinite re-renders
  const symbolsRef = useRef<string[]>(symbols);
  symbolsRef.current = symbols;

  const log = useCallback((message: string, ...args: any[]) => {
    if (enableLogging) {
      console.log(`[useStockPrices] ${message}`, ...args);
    }
  }, [enableLogging]);

  /**
   * Update a single symbol's price in the state
   */
  const updateSymbolPrice = useCallback((result: PriceUpdateResult) => {
    setPrices(prev => new Map(prev.set(result.symbol, result)));
    log(`Updated price for ${result.symbol}:`, result);
  }, [log]);

  /**
   * Refresh all symbols
   */
  const refreshAll = useCallback(async (): Promise<void> => {
    if (symbolsRef.current.length === 0) {
      log('No symbols to refresh');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      log(`Refreshing all symbols: ${symbolsRef.current.join(', ')}`);
      
      const results = await alphaVantageService.getMultipleQuotes(symbolsRef.current, true);
      
      // Update prices map
      const newPrices = new Map(prices);
      results.forEach(result => {
        newPrices.set(result.symbol, result);
      });
      
      setPrices(newPrices);
      setLastUpdate(new Date());
      
      // Check for any errors
      const errors = results.filter(r => !r.success && !r.fromCache);
      if (errors.length > 0) {
        const errorMessage = `Failed to update ${errors.length} symbols: ${errors.map(e => e.symbol).join(', ')}`;
        setError(errorMessage);
        log('Refresh completed with errors:', errorMessage);
      } else {
        log(`Successfully refreshed ${results.length} symbols`);
      }
      
    } catch (err: any) {
      const errorMessage = `Failed to refresh prices: ${err.message}`;
      setError(errorMessage);
      log('Refresh failed:', err);
    } finally {
      setLoading(false);
    }
  }, [prices, log]);

  /**
   * Refresh a single symbol
   */
  const refreshSymbol = useCallback(async (symbol: string): Promise<void> => {
    if (!symbolsRef.current.includes(symbol)) {
      log(`Symbol ${symbol} not in symbols list`);
      return;
    }

    // Add symbol to loading set (for individual button states)
    setLoadingSymbols(prev => new Set(prev).add(symbol));
    setError(null);
    
    try {
      log(`Refreshing single symbol: ${symbol}`);
      
      const result = await alphaVantageService.getQuote(symbol, true);
      updateSymbolPrice(result);
      
      if (!result.success && !result.fromCache) {
        setError(`Failed to update ${symbol}: ${result.error}`);
      }
      
      // Update last update time only if we got fresh data
      if (!result.fromCache) {
        setLastUpdate(new Date());
      }
      
    } catch (err: any) {
      const errorMessage = `Failed to refresh ${symbol}: ${err.message}`;
      setError(errorMessage);
      log('Single symbol refresh failed:', err);
    } finally {
      // Remove symbol from loading set
      setLoadingSymbols(prev => {
        const newSet = new Set(prev);
        newSet.delete(symbol);
        return newSet;
      });
    }
  }, [updateSymbolPrice, log]);

  /**
   * Clear cache for symbol(s)
   */
  const clearCache = useCallback((symbol?: string): void => {
    alphaVantageService.clearCache(symbol);
    log(symbol ? `Cache cleared for ${symbol}` : 'All cache cleared');
  }, [log]);

  /**
   * Test API connection
   */
  const testConnection = useCallback(async (): Promise<boolean> => {
    log('Testing API connection...');
    const isConnected = await alphaVantageService.testConnection();
    log(`API connection test: ${isConnected ? 'SUCCESS' : 'FAILED'}`);
    return isConnected;
  }, [log]);

  /**
   * Load cached data on mount and optionally refresh
   */
  useEffect(() => {
    const loadInitialData = async () => {
      if (symbolsRef.current.length === 0) return;

      log('Loading initial data...');
      setLoading(true);
      
      try {
        // First, try to load from cache ONLY (guaranteed no API calls)
        const cachedResults = alphaVantageService.getCachedPricesOnly(symbolsRef.current);
        
        const newPrices = new Map<string, PriceUpdateResult>();
        cachedResults.forEach(result => {
          if (result.success) {
            newPrices.set(result.symbol, result);
          }
        });
        
        setPrices(newPrices);
        log(`Loaded ${newPrices.size} cached prices for ${symbolsRef.current.length} symbols`);
        
        // Only make API calls if explicitly requested via autoRefreshOnMount
        if (autoRefreshOnMount) {
          const symbolsWithoutCache = symbolsRef.current.filter(symbol => {
            const result = newPrices.get(symbol);
            return !result || !result.success;
          });
          
          if (symbolsWithoutCache.length > 0) {
            log(`Auto-refreshing ${symbolsWithoutCache.length} symbols without cache`);
            // Only refresh symbols that don't have valid cache
            const freshResults = await alphaVantageService.getMultipleQuotes(symbolsWithoutCache, true);
            
            freshResults.forEach(result => {
              newPrices.set(result.symbol, result);
            });
            
            setPrices(new Map(newPrices));
            setLastUpdate(new Date());
          }
        }
        
      } catch (err: any) {
        setError(`Failed to load initial data: ${err.message}`);
        log('Initial data load failed:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []); // Only run on mount

  return {
    prices,
    loading,
    loadingSymbols,
    error,
    lastUpdate,
    refreshAll,
    refreshSymbol,
    clearCache,
    testConnection
  };
}