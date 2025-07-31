export interface PortfolioAsset {
  accountName: string;
  actualAsset: string;
  underlyingAsset: string;
  stage: 'UNLOCKED' | 'LOCKED' | 'RETIREMENT';
  liquidity: 'LIQUID' | 'ILLIQUID';
  type: 'PHYSICAL ASSET' | 'USD' | 'BONDS' | 'PRIVATE REAL ESTATE' | 'CRYPTO' | 'STOCKS';
  amount: number;
  shareAmount: number;
  sharePrice: number;
  percentageOfTotal: number;
  notes: string;
  updateDate: string;
  days: number;
  status: 'ACTIVE' | 'DORMANT';
  interestRate?: number;
  heldBy: string;
  address?: string;
  blockchain?: string;
  url?: string;
  // API integration fields
  symbol?: string; // Stock symbol for API calls (e.g., "SPY", "VTI")
  coinId?: string; // CoinGecko ID for crypto (e.g., "bitcoin", "ethereum")
  apiSource?: 'alphavantage' | 'coingecko' | 'manual'; // Where to get price data
  lastApiUpdate?: Date; // When was price last updated from API
}

// Function to load portfolio data based on environment
function loadPortfolioData(): PortfolioAsset[] {
  // In development, try to load personal data, fallback to demo data
  if (process.env.NODE_ENV === 'development') {
    try {
      // Try to import personal data (this file should be in .gitignore)
      const { personalPortfolioData } = require('./portfolio.personal');
      return personalPortfolioData;
    } catch (error) {
      console.log('Personal portfolio data not found, using demo data');
      // Fallback to demo data
    }
  }
  
  // Use demo data for production or when personal data is not available
  return demoPortfolioData;
}

// Demo/sample data for public repository
const demoPortfolioData: PortfolioAsset[] = [
  {
    accountName: "DEMO CHECKING",
    actualAsset: "USD",
    underlyingAsset: "USD",
    stage: "UNLOCKED",
    liquidity: "LIQUID",
    type: "USD",
    amount: 15000,
    shareAmount: 15000,
    sharePrice: 1,
    percentageOfTotal: 5.2,
    notes: "Demo Bank Checking Account",
    updateDate: "1/15/2025",
    days: 10,
    status: "ACTIVE",
    interestRate: 2.50,
    heldBy: "DEMO_BANK"
  },
  {
    accountName: "DEMO SAVINGS",
    actualAsset: "USD",
    underlyingAsset: "USD",
    stage: "UNLOCKED",
    liquidity: "LIQUID",
    type: "USD",
    amount: 85000,
    shareAmount: 85000,
    sharePrice: 1,
    percentageOfTotal: 29.8,
    notes: "Demo High Yield Savings",
    updateDate: "1/15/2025",
    days: 10,
    status: "ACTIVE",
    interestRate: 4.20,
    heldBy: "DEMO_BANK"
  },
  {
    accountName: "DEMO BROKERAGE",
    actualAsset: "SPY",
    underlyingAsset: "US LARGE CAP STOCKS - S&P 500",
    stage: "UNLOCKED",
    liquidity: "LIQUID",
    type: "STOCKS",
    amount: 50000,
    shareAmount: 100,
    sharePrice: 500,
    percentageOfTotal: 17.5,
    notes: "S&P 500 ETF",
    updateDate: "1/15/2025",
    days: 10,
    status: "ACTIVE",
    heldBy: "DEMO_BROKER",
    symbol: "SPY",
    apiSource: "alphavantage"
  },
  {
    accountName: "DEMO BROKERAGE",
    actualAsset: "VTI",
    underlyingAsset: "US TOTAL STOCK MARKET",
    stage: "UNLOCKED",
    liquidity: "LIQUID",
    type: "STOCKS",
    amount: 30000,
    shareAmount: 120,
    sharePrice: 250,
    percentageOfTotal: 10.5,
    notes: "Total Stock Market ETF",
    updateDate: "1/15/2025",
    days: 10,
    status: "ACTIVE",
    heldBy: "DEMO_BROKER",
    symbol: "VTI",
    apiSource: "alphavantage"
  },
  {
    accountName: "DEMO CRYPTO WALLET",
    actualAsset: "BTC",
    underlyingAsset: "BTC",
    stage: "UNLOCKED",
    liquidity: "LIQUID",
    type: "CRYPTO",
    amount: 45000,
    shareAmount: 0.45,
    sharePrice: 100000,
    percentageOfTotal: 15.8,
    notes: "Bitcoin",
    updateDate: "1/15/2025",
    days: 10,
    status: "ACTIVE",
    heldBy: "DEMO_WALLET",
    blockchain: "BTC",
    coinId: "bitcoin",
    apiSource: "coingecko"
  },
  {
    accountName: "DEMO CRYPTO WALLET",
    actualAsset: "ETH",
    underlyingAsset: "ETH",
    stage: "UNLOCKED",
    liquidity: "LIQUID",
    type: "CRYPTO",
    amount: 25000,
    shareAmount: 6.25,
    sharePrice: 4000,
    percentageOfTotal: 8.8,
    notes: "Ethereum",
    updateDate: "1/15/2025",
    days: 10,
    status: "ACTIVE",
    heldBy: "DEMO_WALLET",
    blockchain: "ETH",
    coinId: "ethereum",
    apiSource: "coingecko"
  },
  {
    accountName: "DEMO 401K",
    actualAsset: "TARGET_2050",
    underlyingAsset: "MIXED PORTFOLIO",
    stage: "RETIREMENT",
    liquidity: "ILLIQUID",
    type: "STOCKS",
    amount: 25000,
    shareAmount: 500,
    sharePrice: 50,
    percentageOfTotal: 8.8,
    notes: "Target Date 2050 Fund",
    updateDate: "1/15/2025",
    days: 10,
    status: "ACTIVE",
    heldBy: "DEMO_EMPLOYER"
  },
  {
    accountName: "DEMO VEHICLE",
    actualAsset: "CAR",
    underlyingAsset: "PHYSICAL ASSET",
    stage: "UNLOCKED",
    liquidity: "ILLIQUID",
    type: "PHYSICAL ASSET",
    amount: 10000,
    shareAmount: 1,
    sharePrice: 10000,
    percentageOfTotal: 3.5,
    notes: "Demo Vehicle",
    updateDate: "1/15/2025",
    days: 10,
    status: "ACTIVE",
    heldBy: "PERSONAL"
  }
];

// Export the portfolio data (will use personal data in dev, demo data in prod)
export const portfolioData = loadPortfolioData();

export const totalPortfolioValue = portfolioData.reduce((sum, asset) => sum + asset.amount, 0);

export const assetTypeBreakdown = portfolioData.reduce((acc, asset) => {
  acc[asset.type] = (acc[asset.type] || 0) + asset.amount;
  return acc;
}, {} as Record<string, number>);

export const liquidityBreakdown = portfolioData.reduce((acc, asset) => {
  acc[asset.liquidity] = (acc[asset.liquidity] || 0) + asset.amount;
  return acc;
}, {} as Record<string, number>);

export const stageBreakdown = portfolioData.reduce((acc, asset) => {
  acc[asset.stage] = (acc[asset.stage] || 0) + asset.amount;
  return acc;
}, {} as Record<string, number>); 