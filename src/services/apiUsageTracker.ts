import { isToday, format, addDays } from 'date-fns';

// API Usage Types
export interface ApiCall {
  timestamp: Date;
  provider: 'alphavantage' | 'coingecko';
  endpoint: string;
  symbol?: string;
  success: boolean;
  fromCache: boolean;
  cost: number; // Number of API calls consumed
}

export interface ApiUsageStats {
  today: ApiCall[];
  totalCallsToday: number;
  remainingCallsToday: number;
  dailyLimit: number;
  resetTime: Date;
  costAnalysis: {
    testConnection: number;
    singleRefresh: number;
    allRefresh: number;
    nextScheduledUpdate: Date | null;
  };
}

export interface ProviderLimits {
  alphavantage: {
    dailyLimit: number;
    minuteLimit: number;
    callsPerQuote: number;
  };
  coingecko: {
    dailyLimit: number;
    minuteLimit: number;
    callsPerQuote: number;
  };
}

// API limits configuration
const API_LIMITS: ProviderLimits = {
  alphavantage: {
    dailyLimit: 500, // Free tier
    minuteLimit: 5,  // Free tier
    callsPerQuote: 1
  },
  coingecko: {
    dailyLimit: Infinity, // No daily limit on free tier
    minuteLimit: 30,      // Free tier
    callsPerQuote: 1
  }
};

class ApiUsageTracker {
  private apiCalls: ApiCall[] = [];
  private readonly STORAGE_KEY = 'api_usage_tracker';

  constructor() {
    this.loadFromStorage();
    this.cleanOldData();
  }

  /**
   * Record an API call
   */
  recordCall(call: Omit<ApiCall, 'timestamp'>): void {
    const apiCall: ApiCall = {
      ...call,
      timestamp: new Date()
    };

    this.apiCalls.push(apiCall);
    this.saveToStorage();
    
    console.log(`[API Tracker] Recorded ${call.provider} call:`, {
      endpoint: call.endpoint,
      symbol: call.symbol,
      cost: call.cost,
      fromCache: call.fromCache,
      success: call.success
    });
  }

  /**
   * Get usage statistics for today
   */
  getTodaysStats(): ApiUsageStats {
    const today = new Date();
    const todaysCalls = this.getTodaysCalls();
    
    // Calculate total API calls consumed today
    const totalCallsToday = todaysCalls
      .filter(call => !call.fromCache) // Don't count cached responses
      .reduce((sum, call) => sum + call.cost, 0);

    // Calculate remaining calls (using Alpha Vantage as the limiting factor)
    const dailyLimit = API_LIMITS.alphavantage.dailyLimit;
    const remainingCallsToday = Math.max(0, dailyLimit - totalCallsToday);

    // Calculate reset time (midnight tomorrow)
    const resetTime = new Date(today);
    resetTime.setDate(resetTime.getDate() + 1);
    resetTime.setHours(0, 0, 0, 0);

    return {
      today: todaysCalls,
      totalCallsToday,
      remainingCallsToday,
      dailyLimit,
      resetTime,
      costAnalysis: this.calculateCostAnalysis()
    };
  }

  /**
   * Calculate cost analysis for different operations
   */
  private calculateCostAnalysis() {
    // Example costs based on current portfolio (2 stocks in demo)
    const stockCount = 2; // SPY, VTI in demo data
    const cryptoCount = 2; // BTC, ETH in demo data

    return {
      testConnection: 1, // Single AAPL test call
      singleRefresh: 1,  // One stock refresh
      allRefresh: stockCount, // All stocks refresh
      nextScheduledUpdate: this.getNextScheduledUpdate()
    };
  }

  /**
   * Get next scheduled automatic update time
   */
  private getNextScheduledUpdate(): Date | null {
    // Since we do daily caching, next update is tomorrow at market open
    const tomorrow = addDays(new Date(), 1);
    tomorrow.setHours(9, 30, 0, 0); // 9:30 AM market open
    return tomorrow;
  }

  /**
   * Get today's API calls
   */
  private getTodaysCalls(): ApiCall[] {
    const today = new Date().toDateString();
    return this.apiCalls.filter(call => 
      call.timestamp && new Date(call.timestamp).toDateString() === today
    );
  }

  /**
   * Get calls for a specific provider today
   */
  getProviderCallsToday(provider: 'alphavantage' | 'coingecko'): ApiCall[] {
    return this.getTodaysCalls().filter(call => call.provider === provider);
  }

  /**
   * Check if we're approaching rate limits
   */
  getRateLimitStatus(): {
    daily: { status: 'safe' | 'warning' | 'critical'; percentage: number };
    minute: { status: 'safe' | 'warning' | 'critical'; callsInLastMinute: number };
  } {
    const stats = this.getTodaysStats();
    const dailyPercentage = (stats.totalCallsToday / stats.dailyLimit) * 100;
    
    // Check calls in last minute
    const oneMinuteAgo = new Date(Date.now() - 60000);
    const callsInLastMinute = this.apiCalls
      .filter(call => 
        call.timestamp > oneMinuteAgo && 
        call.provider === 'alphavantage' &&
        !call.fromCache
      )
      .reduce((sum, call) => sum + call.cost, 0);

    return {
      daily: {
        status: dailyPercentage > 90 ? 'critical' : dailyPercentage > 75 ? 'warning' : 'safe',
        percentage: dailyPercentage
      },
      minute: {
        status: callsInLastMinute >= 5 ? 'critical' : callsInLastMinute >= 4 ? 'warning' : 'safe',
        callsInLastMinute
      }
    };
  }

  /**
   * Get live data indicators for assets
   */
  getLiveDataIndicators(): Map<string, {
    isLive: boolean;
    lastUpdate: Date | null;
    provider: string;
  }> {
    const indicators = new Map();
    const today = new Date().toDateString();

    // Check all successful calls today
    const todaysCalls = this.getTodaysCalls()
      .filter(call => call.success && !call.fromCache);

    // Group by symbol
    todaysCalls.forEach(call => {
      if (call.symbol) {
        const existing = indicators.get(call.symbol);
        if (!existing || call.timestamp > existing.lastUpdate) {
          indicators.set(call.symbol, {
            isLive: true,
            lastUpdate: call.timestamp,
            provider: call.provider
          });
        }
      }
    });

    return indicators;
  }

  /**
   * Estimate cost for an operation
   */
  estimateOperationCost(operation: 'test' | 'single' | 'all'): {
    cost: number;
    affordable: boolean;
    description: string;
  } {
    const stats = this.getTodaysStats();
    const costAnalysis = stats.costAnalysis;
    
    let cost: number;
    let description: string;

    switch (operation) {
      case 'test':
        cost = costAnalysis.testConnection;
        description = 'Test API connection (1 call)';
        break;
      case 'single':
        cost = costAnalysis.singleRefresh;
        description = 'Refresh 1 stock (1 call)';
        break;
      case 'all':
        cost = costAnalysis.allRefresh;
        description = `Refresh all stocks (${cost} calls)`;
        break;
      default:
        cost = 0;
        description = 'Unknown operation';
    }

    return {
      cost,
      affordable: cost <= stats.remainingCallsToday,
      description
    };
  }

  /**
   * Clean old data (keep only last 7 days)
   */
  private cleanOldData(): void {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    this.apiCalls = this.apiCalls.filter(call => 
      call.timestamp && new Date(call.timestamp) > sevenDaysAgo
    );
    
    this.saveToStorage();
  }

  /**
   * Save to localStorage
   */
  private saveToStorage(): void {
    try {
      const data = {
        apiCalls: this.apiCalls,
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('[API Tracker] Failed to save to localStorage:', error);
    }
  }

  /**
   * Load from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.apiCalls = (data.apiCalls || []).map((call: any) => ({
          ...call,
          timestamp: new Date(call.timestamp)
        }));
      }
    } catch (error) {
      console.warn('[API Tracker] Failed to load from localStorage:', error);
      this.apiCalls = [];
    }
  }

  /**
   * Reset today's usage (for testing)
   */
  resetTodaysUsage(): void {
    const today = new Date().toDateString();
    this.apiCalls = this.apiCalls.filter(call => 
      !call.timestamp || new Date(call.timestamp).toDateString() !== today
    );
    this.saveToStorage();
  }

  /**
   * Get usage history for the last 7 days
   */
  getUsageHistory(): { date: string; calls: number }[] {
    const history: { date: string; calls: number }[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toDateString();
      
      const callsForDate = this.apiCalls
        .filter(call => 
          call.timestamp && 
          new Date(call.timestamp).toDateString() === dateString &&
          !call.fromCache
        )
        .reduce((sum, call) => sum + call.cost, 0);
      
      history.push({
        date: format(date, 'MM/dd'),
        calls: callsForDate
      });
    }
    
    return history;
  }
}

// Export singleton instance
export const apiUsageTracker = new ApiUsageTracker();
export default apiUsageTracker;