"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  RefreshCw, 
  Zap, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  Wifi,
  WifiOff,
  TrendingUp,
  Coins
} from 'lucide-react';
import { useStockPrices } from '@/hooks/useStockPrices';
import { useCryptoPrices } from '@/hooks/useCryptoPrices';
import { useApiUsage } from '@/hooks/useApiUsage';
import { getStockSymbols, getCryptoCoinIds, formatCurrency } from '@/lib/portfolioUtils';
import { portfolioData } from '@/data/portfolio';
import { LiveDataIndicator } from '@/components/LiveDataIndicator';

interface CombinedPriceControlsProps {
  onPricesUpdated?: () => void;
}

export function CombinedPriceControls({ onPricesUpdated }: CombinedPriceControlsProps) {
  const [isTestingStockConnection, setIsTestingStockConnection] = useState(false);
  const [isTestingCryptoConnection, setIsTestingCryptoConnection] = useState(false);
  const [stockConnectionStatus, setStockConnectionStatus] = useState<boolean | null>(null);
  const [cryptoConnectionStatus, setCryptoConnectionStatus] = useState<boolean | null>(null);

  const stockSymbols = getStockSymbols(portfolioData);
  const cryptoCoinIds = getCryptoCoinIds(portfolioData);
  
  const {
    prices: stockPrices,
    loading: stockLoading,
    loadingSymbols: loadingStockSymbols,
    error: stockError,
    lastRefresh: stockLastRefresh,
    priceStatuses: stockStatuses,
    refreshPrice: refreshStockPrice,
    refreshAllPrices: refreshAllStockPrices,
    testConnection: testStockConnection
  } = useStockPrices(stockSymbols, { autoRefreshOnMount: false });

  const {
    prices: cryptoPrices,
    loading: cryptoLoading,
    loadingCoinIds: loadingCoinIds,
    error: cryptoError,
    lastRefresh: cryptoLastRefresh,
    priceStatuses: cryptoStatuses,
    refreshPrice: refreshCryptoPrice,
    refreshAllPrices: refreshAllCryptoPrices,
    testConnection: testCryptoConnection
  } = useCryptoPrices(cryptoCoinIds, { autoRefreshOnMount: false });

  const {
    estimateOperationCost,
    refresh: refreshApiUsage
  } = useApiUsage();

  const handleRefreshAllStocks = async () => {
    await refreshAllStockPrices(stockSymbols);
    refreshApiUsage();
    onPricesUpdated?.();
  };

  const handleRefreshAllCrypto = async () => {
    await refreshAllCryptoPrices(cryptoCoinIds);
    refreshApiUsage();
    onPricesUpdated?.();
  };

  const handleRefreshAllAssets = async () => {
    await Promise.all([
      refreshAllStockPrices(stockSymbols),
      refreshAllCryptoPrices(cryptoCoinIds)
    ]);
    refreshApiUsage();
    onPricesUpdated?.();
  };

  const handleRefreshStockSymbol = async (symbol: string) => {
    await refreshStockPrice(symbol);
    refreshApiUsage();
    onPricesUpdated?.();
  };

  const handleRefreshCryptoCoin = async (coinId: string) => {
    await refreshCryptoPrice(coinId);
    refreshApiUsage();
    onPricesUpdated?.();
  };

  const handleTestStockConnection = async () => {
    setIsTestingStockConnection(true);
    try {
      await testStockConnection();
      setStockConnectionStatus(true);
      refreshApiUsage();
    } catch (err) {
      setStockConnectionStatus(false);
    } finally {
      setIsTestingStockConnection(false);
    }
  };

  const handleTestCryptoConnection = async () => {
    setIsTestingCryptoConnection(true);
    try {
      await testCryptoConnection();
      setCryptoConnectionStatus(true);
      refreshApiUsage();
    } catch (err) {
      setCryptoConnectionStatus(false);
    } finally {
      setIsTestingCryptoConnection(false);
    }
  };

  // Get operation cost estimates
  const operationCosts = {
    testStock: estimateOperationCost('test'),
    testCrypto: { cost: 1, description: 'Test CoinGecko API' }, // CoinGecko is more lenient
    singleStock: estimateOperationCost('single'),
    singleCrypto: { cost: 1, description: 'Single crypto price' },
    allStocks: estimateOperationCost('all'),
    allCrypto: { cost: Math.ceil(cryptoCoinIds.length / 100), description: 'All crypto prices' }, // CoinGecko batches 100 at a time
    allAssets: { 
      cost: estimateOperationCost('all').cost + Math.ceil(cryptoCoinIds.length / 100), 
      description: 'All stocks + crypto' 
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Asset Price Controls
          <div className="flex gap-2 ml-auto">
            {stockConnectionStatus !== null && (
              <Badge variant={stockConnectionStatus ? "default" : "destructive"} className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                {stockConnectionStatus ? "Stock API ✓" : "Stock API ✗"}
              </Badge>
            )}
            {cryptoConnectionStatus !== null && (
              <Badge variant={cryptoConnectionStatus ? "default" : "destructive"} className="text-xs">
                <Coins className="h-3 w-3 mr-1" />
                {cryptoConnectionStatus ? "Crypto API ✓" : "Crypto API ✗"}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Operation Cost Preview */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-muted rounded-md">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Single Refresh</div>
            <div className="text-sm font-medium">
              {operationCosts.singleStock.cost + operationCosts.singleCrypto.cost} calls
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">All Stocks</div>
            <div className="text-sm font-medium">
              {operationCosts.allStocks.cost} calls
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">All Assets</div>
            <div className="text-sm font-medium">
              {operationCosts.allAssets.cost} calls
            </div>
          </div>
        </div>

        {/* Main Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button
            variant="outline"
            onClick={handleRefreshAllStocks}
            disabled={stockLoading || stockSymbols.length === 0}
            className="flex items-center gap-2"
          >
            {stockLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <TrendingUp className="h-4 w-4" />
            )}
            Refresh All Stocks ({stockSymbols.length})
          </Button>

          <Button
            variant="outline"
            onClick={handleRefreshAllCrypto}
            disabled={cryptoLoading || cryptoCoinIds.length === 0}
            className="flex items-center gap-2"
          >
            {cryptoLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Coins className="h-4 w-4" />
            )}
            Refresh All Crypto ({cryptoCoinIds.length})
          </Button>

          <Button
            variant="default"
            onClick={handleRefreshAllAssets}
            disabled={stockLoading || cryptoLoading || (stockSymbols.length === 0 && cryptoCoinIds.length === 0)}
            className="flex items-center gap-2"
          >
            {(stockLoading || cryptoLoading) ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            Refresh All Assets
          </Button>
        </div>

        {/* API Test Controls */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleTestStockConnection}
            disabled={isTestingStockConnection}
            className="flex items-center gap-2"
          >
            {isTestingStockConnection ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              <Wifi className="h-3 w-3" />
            )}
            Test Stock API
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleTestCryptoConnection}
            disabled={isTestingCryptoConnection}
            className="flex items-center gap-2"
          >
            {isTestingCryptoConnection ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              <Wifi className="h-3 w-3" />
            )}
            Test Crypto API
          </Button>
        </div>

        {/* Asset Status Tabs */}
        <Tabs defaultValue="stocks" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stocks">Stocks ({stockSymbols.length})</TabsTrigger>
            <TabsTrigger value="crypto">Crypto ({cryptoCoinIds.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="stocks" className="space-y-3">
            {stockError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive">{stockError}</span>
              </div>
            )}

            {stockLastRefresh && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Last refreshed: {stockLastRefresh.toLocaleTimeString()}
              </div>
            )}

            <div className="space-y-2">
              {stockStatuses.map((status) => (
                <div
                  key={status.symbol}
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{status.symbol}</span>
                    <LiveDataIndicator 
                      lastUpdate={status.lastUpdated} 
                      showLabel={false}
                    />
                    {status.fromCache && (
                      <Badge variant="secondary" className="text-xs">
                        Cached
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {status.price && (
                      <span className="text-sm font-medium">
                        {formatCurrency(status.price)}
                      </span>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRefreshStockSymbol(status.symbol)}
                      disabled={loadingStockSymbols.has(status.symbol)}
                      className="h-8 px-2"
                    >
                      {loadingStockSymbols.has(status.symbol) ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {stockSymbols.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No stocks configured for API updates
              </div>
            )}
          </TabsContent>

          <TabsContent value="crypto" className="space-y-3">
            {cryptoError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive">{cryptoError}</span>
              </div>
            )}

            {cryptoLastRefresh && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Last refreshed: {cryptoLastRefresh.toLocaleTimeString()}
              </div>
            )}

            <div className="space-y-2">
              {cryptoStatuses.map((status) => (
                <div
                  key={status.coinId}
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{status.symbol}</span>
                    <span className="text-xs text-muted-foreground">({status.coinId})</span>
                    <LiveDataIndicator 
                      lastUpdate={status.lastUpdated} 
                      showLabel={false}
                    />
                    {status.fromCache && (
                      <Badge variant="secondary" className="text-xs">
                        Cached
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {status.price && (
                      <span className="text-sm font-medium">
                        {formatCurrency(status.price)}
                      </span>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRefreshCryptoCoin(status.coinId)}
                      disabled={loadingCoinIds.has(status.coinId)}
                      className="h-8 px-2"
                    >
                      {loadingCoinIds.has(status.coinId) ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {cryptoCoinIds.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No cryptocurrencies configured for API updates
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* API Reset Info */}
        <div className="text-center text-xs text-muted-foreground pt-2 border-t">
          API usage resets automatically at midnight
        </div>
      </CardContent>
    </Card>
  );
}