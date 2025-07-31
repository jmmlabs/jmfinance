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

// API Provider types
export type ApiProvider = 'alphavantage' | 'coingecko';
export type ApiEndpoint = 
  | 'alphavantage_quote' 
  | 'alphavantage_timeseries'
  | 'coingecko_simple_price'
  | 'coingecko_coin_data'
  | 'coingecko_wallet_tokens';

// CoinGecko API Response Types
export interface CoinGeckoSimplePriceResponse {
  [coinId: string]: {
    usd: number;
    usd_24h_change?: number;
    last_updated_at?: number;
  };
}

export interface CoinGeckoCoinDataResponse {
  id: string;
  symbol: string;
  name: string;
  market_data: {
    current_price: {
      usd: number;
    };
    price_change_percentage_24h: number;
    last_updated: string;
  };
}

export interface ProcessedCryptoPrice {
  coinId: string;
  symbol: string;
  name?: string;
  price: number;
  change24h?: number;
  lastUpdated: Date;
}

// Crypto price update result
export interface CryptoPriceUpdateResult {
  success: boolean;
  coinId: string;
  symbol: string;
  price?: number;
  error?: string;
  lastUpdated?: Date;
  fromCache?: boolean;
}

// Cache entry for crypto price data
export interface CryptoPriceCacheEntry {
  data: ProcessedCryptoPrice;
  cachedAt: Date;
  expiresAt: Date;
}