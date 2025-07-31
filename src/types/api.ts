// Alpha Vantage API Response Types
export interface AlphaVantageQuote {
  "01. symbol": string;
  "02. open": string;
  "03. high": string;
  "04. low": string;
  "05. price": string;
  "06. volume": string;
  "07. latest trading day": string;
  "08. previous close": string;
  "09. change": string;
  "10. change percent": string;
}

export interface AlphaVantageGlobalQuoteResponse {
  "Global Quote": AlphaVantageQuote;
}

export interface AlphaVantageTimeSeriesDaily {
  [date: string]: {
    "1. open": string;
    "2. high": string;
    "3. low": string;
    "4. close": string;
    "5. volume": string;
  };
}

export interface AlphaVantageTimeSeriesResponse {
  "Meta Data": {
    "1. Information": string;
    "2. Symbol": string;
    "3. Last Refreshed": string;
    "4. Output Size": string;
    "5. Time Zone": string;
  };
  "Time Series (Daily)": AlphaVantageTimeSeriesDaily;
}

// Processed price data for our application
export interface ProcessedStockPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  lastUpdated: Date;
  open: number;
  high: number;
  low: number;
  volume: number;
  previousClose: number;
}

// Price update result
export interface PriceUpdateResult {
  success: boolean;
  symbol: string;
  price?: number;
  error?: string;
  lastUpdated?: Date;
  fromCache?: boolean;
}

// Cache entry for price data
export interface PriceCacheEntry {
  data: ProcessedStockPrice;
  cachedAt: Date;
  expiresAt: Date;
}

// API error types
export interface ApiError {
  code: string;
  message: string;
  details?: string;
}