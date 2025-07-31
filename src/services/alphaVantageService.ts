import axios, { AxiosResponse } from 'axios';
import { isToday, parseISO } from 'date-fns';
import {
  AlphaVantageGlobalQuoteResponse,
  AlphaVantageTimeSeriesResponse,
  ProcessedStockPrice,
  PriceUpdateResult,
  PriceCacheEntry,
  ApiError
} from '@/types/api';
import { apiUsageTracker } from './apiUsageTracker';

// Cache for storing price data
const priceCache = new Map<string, PriceCacheEntry>();

// Rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 12000; // 12 seconds (5 requests per minute for free tier)

class AlphaVantageService {
  private apiKey: string;
  private baseUrl: string = 'https://www.alphavantage.co/query';

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Alpha Vantage API key not found. Please set NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY in .env.local');
    }
  }

  /**
   * Rate limiting to respect API limits
   */
  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      console.log(`Rate limiting: waiting ${waitTime}ms before next request`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    lastRequestTime = Date.now();
  }

  /**
   * Check if cached data is still valid (same day)
   */
  private isCacheValid(symbol: string): boolean {
    const cached = priceCache.get(symbol);
    if (!cached) return false;
    
    return isToday(cached.cachedAt) && new Date() < cached.expiresAt;
  }

  /**
   * Get cached price data
   */
  private getCachedPrice(symbol: string): ProcessedStockPrice | null {
    const cached = priceCache.get(symbol);
    return cached?.data || null;
  }

  /**
   * Cache price data with expiration
   */
  private cachePrice(symbol: string, data: ProcessedStockPrice): void {
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setHours(23, 59, 59, 999); // Expires at end of day
    
    priceCache.set(symbol, {
      data,
      cachedAt: now,
      expiresAt
    });
  }

  /**
   * Process Alpha Vantage quote response into our format
   */
  private processQuoteResponse(response: AlphaVantageGlobalQuoteResponse): ProcessedStockPrice {
    const quote = response["Global Quote"];
    
    return {
      symbol: quote["01. symbol"],
      price: parseFloat(quote["05. price"]),
      change: parseFloat(quote["09. change"]),
      changePercent: parseFloat(quote["10. change percent"].replace('%', '')),
      lastUpdated: new Date(quote["07. latest trading day"]),
      open: parseFloat(quote["02. open"]),
      high: parseFloat(quote["03. high"]),
      low: parseFloat(quote["04. low"]),
      volume: parseInt(quote["06. volume"]),
      previousClose: parseFloat(quote["08. previous close"])
    };
  }

  /**
   * Fetch real-time quote for a single symbol
   */
  async getQuote(symbol: string, forceRefresh = false): Promise<PriceUpdateResult> {
    try {
      // Check cache first unless forced refresh
      if (!forceRefresh && this.isCacheValid(symbol)) {
        const cachedData = this.getCachedPrice(symbol);
        if (cachedData) {
          console.log(`Using cached data for ${symbol}`);
          
          // Record cache hit (no API call made)
          apiUsageTracker.recordCall({
            provider: 'alphavantage',
            endpoint: 'GLOBAL_QUOTE',
            symbol: symbol,
            success: true,
            fromCache: true,
            cost: 0
          });
          
          return {
            success: true,
            symbol,
            price: cachedData.price,
            lastUpdated: cachedData.lastUpdated,
            fromCache: true
          };
        }
      }

      // Rate limit API calls
      await this.rateLimit();

      console.log(`Fetching fresh data for ${symbol} from Alpha Vantage...`);
      
      const response: AxiosResponse<AlphaVantageGlobalQuoteResponse> = await axios.get(this.baseUrl, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: symbol,
          apikey: this.apiKey
        },
        timeout: 10000 // 10 second timeout
      });

      // Check for API errors
      if (response.data['Error Message']) {
        throw new Error(`API Error: ${response.data['Error Message']}`);
      }

      if (response.data['Note']) {
        throw new Error('API call frequency limit reached. Please try again later.');
      }

      if (!response.data["Global Quote"]) {
        throw new Error('Invalid response format from Alpha Vantage');
      }

      // Process and cache the data
      const processedData = this.processQuoteResponse(response.data);
      this.cachePrice(symbol, processedData);

      // Record successful API call
      apiUsageTracker.recordCall({
        provider: 'alphavantage',
        endpoint: 'GLOBAL_QUOTE',
        symbol: symbol,
        success: true,
        fromCache: false,
        cost: 1
      });

      return {
        success: true,
        symbol,
        price: processedData.price,
        lastUpdated: processedData.lastUpdated,
        fromCache: false
      };

    } catch (error: any) {
      console.error(`Error fetching quote for ${symbol}:`, error.message);
      
      // Record failed API call
      apiUsageTracker.recordCall({
        provider: 'alphavantage',
        endpoint: 'GLOBAL_QUOTE',
        symbol: symbol,
        success: false,
        fromCache: false,
        cost: 1 // Still consumes API call even if failed
      });
      
      // Try to return cached data as fallback
      const cachedData = this.getCachedPrice(symbol);
      if (cachedData) {
        console.log(`Returning stale cached data for ${symbol} due to API error`);
        return {
          success: false,
          symbol,
          price: cachedData.price,
          lastUpdated: cachedData.lastUpdated,
          error: `API error: ${error.message} (showing cached data)`,
          fromCache: true
        };
      }

      return {
        success: false,
        symbol,
        error: error.message
      };
    }
  }

  /**
   * Fetch quotes for multiple symbols with smart batching
   */
  async getMultipleQuotes(symbols: string[], forceRefresh = false): Promise<PriceUpdateResult[]> {
    const results: PriceUpdateResult[] = [];
    
    console.log(`Fetching quotes for ${symbols.length} symbols...`);
    
    // Process symbols one by one to respect rate limits
    for (const symbol of symbols) {
      const result = await this.getQuote(symbol, forceRefresh);
      results.push(result);
      
      // Add a small delay between requests for safety
      if (symbols.indexOf(symbol) < symbols.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }

  /**
   * Get historical data for a symbol (useful for charts)
   */
  async getHistoricalData(symbol: string, outputSize: 'compact' | 'full' = 'compact'): Promise<AlphaVantageTimeSeriesResponse | null> {
    try {
      await this.rateLimit();

      const response: AxiosResponse<AlphaVantageTimeSeriesResponse> = await axios.get(this.baseUrl, {
        params: {
          function: 'TIME_SERIES_DAILY',
          symbol: symbol,
          outputsize: outputSize,
          apikey: this.apiKey
        },
        timeout: 15000
      });

      if (response.data['Error Message']) {
        throw new Error(`API Error: ${response.data['Error Message']}`);
      }

      return response.data;
    } catch (error: any) {
      console.error(`Error fetching historical data for ${symbol}:`, error.message);
      return null;
    }
  }

  /**
   * Clear cache for a specific symbol or all symbols
   */
  clearCache(symbol?: string): void {
    if (symbol) {
      priceCache.delete(symbol);
      console.log(`Cache cleared for ${symbol}`);
    } else {
      priceCache.clear();
      console.log('All price cache cleared');
    }
  }

  /**
   * Get cache status for debugging
   */
  getCacheStatus(): { symbol: string; cachedAt: Date; isValid: boolean }[] {
    return Array.from(priceCache.entries()).map(([symbol, entry]) => ({
      symbol,
      cachedAt: entry.cachedAt,
      isValid: this.isCacheValid(symbol)
    }));
  }

  /**
   * Test API connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.getQuote('AAPL');
      return result.success;
    } catch (error) {
      console.error('Alpha Vantage API test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const alphaVantageService = new AlphaVantageService();
export default alphaVantageService;