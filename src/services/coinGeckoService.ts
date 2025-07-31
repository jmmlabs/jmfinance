import {
  CoinGeckoSimplePriceResponse,
  CoinGeckoCoinDataResponse,
  ProcessedCryptoPrice,
  CryptoPriceUpdateResult,
  CryptoPriceCacheEntry,
  ApiError,
} from '@/types/api';

export class CoinGeckoService {
  private readonly baseUrl = 'https://api.coingecko.com/api/v3';
  private readonly cacheKey = 'coingecko_price_cache';
  private readonly cacheDuration = 5 * 60 * 1000; // 5 minutes (CoinGecko free tier has good rate limits)
  private apiUsageTracker: any = null;

  constructor() {
    // Lazy load the API usage tracker to avoid SSR issues
    if (typeof window !== 'undefined') {
      import('./apiUsageTracker').then(({ apiUsageTracker }) => {
        this.apiUsageTracker = apiUsageTracker;
      });
    }
  }

  private recordApiCall(endpoint: string, success: boolean, fromCache: boolean = false) {
    if (this.apiUsageTracker && typeof window !== 'undefined') {
      this.apiUsageTracker.recordCall('coingecko', endpoint, success, fromCache);
    }
  }

  private getCache(): Record<string, CryptoPriceCacheEntry> {
    if (typeof window === 'undefined') return {};
    try {
      const cached = localStorage.getItem(this.cacheKey);
      return cached ? JSON.parse(cached) : {};
    } catch (error) {
      console.warn('[CoinGecko] Failed to read cache:', error);
      return {};
    }
  }

  private setCache(cache: Record<string, CryptoPriceCacheEntry>): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.cacheKey, JSON.stringify(cache));
    } catch (error) {
      console.warn('[CoinGecko] Failed to write cache:', error);
    }
  }

  private isCacheValid(entry: CryptoPriceCacheEntry): boolean {
    const now = new Date();
    const expiresAt = new Date(entry.expiresAt);
    return now < expiresAt;
  }

  /**
   * Get current price for a single cryptocurrency
   */
  async getPrice(coinId: string, useCache: boolean = true): Promise<CryptoPriceUpdateResult> {
    try {
      // Check cache first
      if (useCache) {
        const cache = this.getCache();
        const cacheEntry = cache[coinId];
        if (cacheEntry && this.isCacheValid(cacheEntry)) {
          this.recordApiCall('coingecko_simple_price', true, true);
          return {
            success: true,
            coinId,
            symbol: cacheEntry.data.symbol,
            price: cacheEntry.data.price,
            lastUpdated: new Date(cacheEntry.data.lastUpdated),
            fromCache: true,
          };
        }
      }

      // Fetch from API
      const url = `${this.baseUrl}/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true`;
      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        this.recordApiCall('coingecko_simple_price', false);
        throw new Error(`CoinGecko API error: ${response.status} ${errorText}`);
      }

      const data: CoinGeckoSimplePriceResponse = await response.json();
      
      if (!data[coinId]) {
        this.recordApiCall('coingecko_simple_price', false);
        throw new Error(`No price data found for coin: ${coinId}`);
      }

      const coinData = data[coinId];
      const processedPrice: ProcessedCryptoPrice = {
        coinId,
        symbol: coinId.toUpperCase(), // We'll get the actual symbol from coin data if needed
        price: coinData.usd,
        change24h: coinData.usd_24h_change,
        lastUpdated: new Date(),
      };

      // Cache the result
      if (useCache) {
        const cache = this.getCache();
        const now = new Date();
        cache[coinId] = {
          data: processedPrice,
          cachedAt: now,
          expiresAt: new Date(now.getTime() + this.cacheDuration),
        };
        this.setCache(cache);
      }

      this.recordApiCall('coingecko_simple_price', true);
      return {
        success: true,
        coinId,
        symbol: processedPrice.symbol,
        price: processedPrice.price,
        lastUpdated: processedPrice.lastUpdated,
        fromCache: false,
      };

    } catch (error) {
      this.recordApiCall('coingecko_simple_price', false);
      console.error(`Error fetching price for ${coinId}:`, error);
      return {
        success: false,
        coinId,
        symbol: coinId.toUpperCase(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get prices for multiple cryptocurrencies
   */
  async getMultiplePrices(coinIds: string[], useCache: boolean = true): Promise<CryptoPriceUpdateResult[]> {
    const results: CryptoPriceUpdateResult[] = [];
    
    if (coinIds.length === 0) {
      return results;
    }

    // Process in batches to respect API limits (CoinGecko allows up to 250 IDs per request)
    const batchSize = 100;
    const batches: string[][] = [];
    
    for (let i = 0; i < coinIds.length; i += batchSize) {
      batches.push(coinIds.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      try {
        // Check cache for all coins in this batch
        const cache = this.getCache();
        const cachedResults: CryptoPriceUpdateResult[] = [];
        const uncachedCoinIds: string[] = [];

        if (useCache) {
          for (const coinId of batch) {
            const cacheEntry = cache[coinId];
            if (cacheEntry && this.isCacheValid(cacheEntry)) {
              cachedResults.push({
                success: true,
                coinId,
                symbol: cacheEntry.data.symbol,
                price: cacheEntry.data.price,
                lastUpdated: new Date(cacheEntry.data.lastUpdated),
                fromCache: true,
              });
            } else {
              uncachedCoinIds.push(coinId);
            }
          }
        } else {
          uncachedCoinIds.push(...batch);
        }

        // Record cache hits
        if (cachedResults.length > 0) {
          this.recordApiCall('coingecko_simple_price', true, true);
        }

        results.push(...cachedResults);

        // Fetch uncached prices
        if (uncachedCoinIds.length > 0) {
          const coinIdsStr = uncachedCoinIds.join(',');
          const url = `${this.baseUrl}/simple/price?ids=${coinIdsStr}&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true`;
          
          const response = await fetch(url);
          
          if (!response.ok) {
            const errorText = await response.text();
            this.recordApiCall('coingecko_simple_price', false);
            throw new Error(`CoinGecko API error: ${response.status} ${errorText}`);
          }

          const data: CoinGeckoSimplePriceResponse = await response.json();
          const now = new Date();

          for (const coinId of uncachedCoinIds) {
            if (data[coinId]) {
              const coinData = data[coinId];
              const processedPrice: ProcessedCryptoPrice = {
                coinId,
                symbol: coinId.toUpperCase(),
                price: coinData.usd,
                change24h: coinData.usd_24h_change,
                lastUpdated: now,
              };

              // Cache the result
              if (useCache) {
                cache[coinId] = {
                  data: processedPrice,
                  cachedAt: now,
                  expiresAt: new Date(now.getTime() + this.cacheDuration),
                };
              }

              results.push({
                success: true,
                coinId,
                symbol: processedPrice.symbol,
                price: processedPrice.price,
                lastUpdated: processedPrice.lastUpdated,
                fromCache: false,
              });
            } else {
              results.push({
                success: false,
                coinId,
                symbol: coinId.toUpperCase(),
                error: `No price data found for coin: ${coinId}`,
              });
            }
          }

          // Update cache
          if (useCache && uncachedCoinIds.length > 0) {
            this.setCache(cache);
          }

          this.recordApiCall('coingecko_simple_price', true);
        }

      } catch (error) {
        this.recordApiCall('coingecko_simple_price', false);
        console.error('Error fetching batch prices:', error);
        
        // Add error results for this batch
        for (const coinId of batch) {
          if (!results.find(r => r.coinId === coinId)) {
            results.push({
              success: false,
              coinId,
              symbol: coinId.toUpperCase(),
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        }
      }
    }

    return results;
  }

  /**
   * Get cached prices only (no API calls)
   */
  getCachedPricesOnly(coinIds: string[]): CryptoPriceUpdateResult[] {
    const cache = this.getCache();
    const results: CryptoPriceUpdateResult[] = [];

    for (const coinId of coinIds) {
      const cacheEntry = cache[coinId];
      if (cacheEntry && this.isCacheValid(cacheEntry)) {
        results.push({
          success: true,
          coinId,
          symbol: cacheEntry.data.symbol,
          price: cacheEntry.data.price,
          lastUpdated: new Date(cacheEntry.data.lastUpdated),
          fromCache: true,
        });
      }
    }

    return results;
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // Test with Bitcoin (most reliable)
      const result = await this.getPrice('bitcoin', false);
      
      if (result.success) {
        return {
          success: true,
          message: `CoinGecko API working. Bitcoin price: $${result.price?.toLocaleString()}`
        };
      } else {
        return {
          success: false,
          message: result.error || 'Unknown error testing CoinGecko API'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error testing CoinGecko API'
      };
    }
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.cacheKey);
    }
  }
}

// Export singleton instance
export const coinGeckoService = new CoinGeckoService();