import { PortfolioAsset } from '@/data/portfolio';
import { PriceUpdateResult } from '@/types/api';

/**
 * Get all stock symbols that need Alpha Vantage API updates
 */
export function getStockSymbols(portfolio: PortfolioAsset[]): string[] {
  return portfolio
    .filter(asset => asset.apiSource === 'alphavantage' && asset.symbol)
    .map(asset => asset.symbol!)
    .filter((symbol, index, arr) => arr.indexOf(symbol) === index); // Remove duplicates
}

/**
 * Get all crypto coin IDs that need CoinGecko API updates
 */
export function getCryptoCoinIds(portfolio: PortfolioAsset[]): string[] {
  return portfolio
    .filter(asset => asset.apiSource === 'coingecko' && asset.coinId)
    .map(asset => asset.coinId!)
    .filter((coinId, index, arr) => arr.indexOf(coinId) === index); // Remove duplicates
}

/**
 * Update portfolio asset prices with API results
 */
export function updatePortfolioWithPrices(
  portfolio: PortfolioAsset[],
  stockPrices: Map<string, PriceUpdateResult>,
  cryptoPrices?: Map<string, PriceUpdateResult>
): PortfolioAsset[] {
  return portfolio.map(asset => {
    let updatedAsset = { ...asset };

    // Update stock prices
    if (asset.apiSource === 'alphavantage' && asset.symbol) {
      const priceData = stockPrices.get(asset.symbol);
      if (priceData?.success && priceData.price) {
        updatedAsset.sharePrice = priceData.price;
        updatedAsset.amount = asset.shareAmount * priceData.price;
        updatedAsset.lastApiUpdate = priceData.lastUpdated;
        updatedAsset.updateDate = new Date().toLocaleDateString();
      }
    }

    // Update crypto prices
    if (asset.apiSource === 'coingecko' && asset.coinId && cryptoPrices) {
      const priceData = cryptoPrices.get(asset.coinId);
      if (priceData?.success && priceData.price) {
        updatedAsset.sharePrice = priceData.price;
        updatedAsset.amount = asset.shareAmount * priceData.price;
        updatedAsset.lastApiUpdate = priceData.lastUpdated;
        updatedAsset.updateDate = new Date().toLocaleDateString();
      }
    }

    return updatedAsset;
  });
}

/**
 * Recalculate portfolio percentages after price updates
 */
export function recalculatePortfolioPercentages(portfolio: PortfolioAsset[]): PortfolioAsset[] {
  const totalValue = portfolio.reduce((sum, asset) => sum + asset.amount, 0);
  
  return portfolio.map(asset => ({
    ...asset,
    percentageOfTotal: totalValue > 0 ? (asset.amount / totalValue) * 100 : 0
  }));
}

/**
 * Get assets that need price updates (haven't been updated today)
 */
export function getAssetsNeedingUpdate(portfolio: PortfolioAsset[]): PortfolioAsset[] {
  const today = new Date().toDateString();
  
  return portfolio.filter(asset => {
    if (!asset.apiSource || asset.apiSource === 'manual') return false;
    
    if (!asset.lastApiUpdate) return true;
    
    const lastUpdate = new Date(asset.lastApiUpdate).toDateString();
    return lastUpdate !== today;
  });
}

/**
 * Format currency for display
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Get API update status for an asset
 */
export function getAssetUpdateStatus(asset: PortfolioAsset): {
  status: 'never' | 'stale' | 'fresh';
  lastUpdate: string | null;
  needsUpdate: boolean;
} {
  if (!asset.lastApiUpdate) {
    return {
      status: 'never',
      lastUpdate: null,
      needsUpdate: asset.apiSource !== 'manual'
    };
  }

  const today = new Date().toDateString();
  const lastUpdate = new Date(asset.lastApiUpdate).toDateString();
  const isFresh = lastUpdate === today;

  return {
    status: isFresh ? 'fresh' : 'stale',
    lastUpdate: asset.lastApiUpdate.toLocaleString(),
    needsUpdate: !isFresh && asset.apiSource !== 'manual'
  };
}

/**
 * Calculate portfolio performance metrics
 */
export function calculatePortfolioMetrics(portfolio: PortfolioAsset[]) {
  const totalValue = portfolio.reduce((sum, asset) => sum + asset.amount, 0);
  
  const metrics = {
    totalValue,
    assetCount: portfolio.length,
    stockValue: portfolio
      .filter(asset => asset.type === 'STOCKS')
      .reduce((sum, asset) => sum + asset.amount, 0),
    cryptoValue: portfolio
      .filter(asset => asset.type === 'CRYPTO')
      .reduce((sum, asset) => sum + asset.amount, 0),
    cashValue: portfolio
      .filter(asset => asset.type === 'USD')
      .reduce((sum, asset) => sum + asset.amount, 0),
    liquidValue: portfolio
      .filter(asset => asset.liquidity === 'LIQUID')
      .reduce((sum, asset) => sum + asset.amount, 0),
    illiquidValue: portfolio
      .filter(asset => asset.liquidity === 'ILLIQUID')
      .reduce((sum, asset) => sum + asset.amount, 0)
  };

  return {
    ...metrics,
    stockPercentage: (metrics.stockValue / totalValue) * 100,
    cryptoPercentage: (metrics.cryptoValue / totalValue) * 100,
    cashPercentage: (metrics.cashValue / totalValue) * 100,
    liquidPercentage: (metrics.liquidValue / totalValue) * 100,
    illiquidPercentage: (metrics.illiquidValue / totalValue) * 100
  };
}