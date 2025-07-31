"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCw, 
  Zap, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useStockPrices } from '@/hooks/useStockPrices';
import { useApiUsage } from '@/hooks/useApiUsage';
import { getStockSymbols, formatCurrency } from '@/lib/portfolioUtils';
import { portfolioData } from '@/data/portfolio';
import { LiveDataIndicator } from '@/components/LiveDataIndicator';

interface PriceUpdateControlsProps {
  onPricesUpdated?: () => void;
}

export function PriceUpdateControls({ onPricesUpdated }: PriceUpdateControlsProps) {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);

  const stockSymbols = getStockSymbols(portfolioData);
  
  const {
    prices,
    loading,
    error,
    lastUpdate,
    refreshAll,
    refreshSymbol,
    clearCache,
    testConnection
  } = useStockPrices({
    symbols: stockSymbols,
    autoRefreshOnMount: false, // Don't auto-refresh, only manual
    enableLogging: true
  });

  const {
    estimateOperationCost,
    refresh: refreshApiUsage
  } = useApiUsage();

  const handleRefreshAll = async () => {
    await refreshAll();
    refreshApiUsage(); // Update API usage stats
    onPricesUpdated?.();
  };

  const handleRefreshSymbol = async (symbol: string) => {
    await refreshSymbol(symbol);
    refreshApiUsage(); // Update API usage stats
    onPricesUpdated?.();
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    try {
      const isConnected = await testConnection();
      setConnectionStatus(isConnected);
      refreshApiUsage(); // Update API usage stats
    } catch (err) {
      setConnectionStatus(false);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleClearCache = () => {
    clearCache();
    setConnectionStatus(null);
  };

  // Get cache status for each symbol
  const symbolStatuses = stockSymbols.map(symbol => {
    const priceData = prices.get(symbol);
    return {
      symbol,
      hasData: !!priceData,
      price: priceData?.price,
      fromCache: priceData?.fromCache,
      error: priceData?.error,
      success: priceData?.success
    };
  });

  // Get operation cost estimates
  const operationCosts = {
    test: estimateOperationCost('test'),
    single: estimateOperationCost('single'),
    all: estimateOperationCost('all')
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Price Update Controls
          {connectionStatus !== null && (
            <Badge variant={connectionStatus ? "default" : "destructive"}>
              {connectionStatus ? (
                <>
                  <Wifi className="h-3 w-3 mr-1" />
                  Connected
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 mr-1" />
                  Disconnected
                </>
              )}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Operation Cost Preview */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-muted rounded-md">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Test API</div>
            <div className="text-sm font-medium">
              {operationCosts.test.cost} call{operationCosts.test.cost !== 1 ? 's' : ''}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Single Refresh</div>
            <div className="text-sm font-medium">
              {operationCosts.single.cost} call{operationCosts.single.cost !== 1 ? 's' : ''}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">All Refresh</div>
            <div className="text-sm font-medium">
              {operationCosts.all.cost} call{operationCosts.all.cost !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleRefreshAll}
            disabled={loading || stockSymbols.length === 0 || !operationCosts.all.affordable}
            className="flex items-center gap-2"
            variant={operationCosts.all.affordable ? "default" : "destructive"}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh All Stocks
            {stockSymbols.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {stockSymbols.length}
              </Badge>
            )}
            <Badge variant="outline" className="ml-1">
              {operationCosts.all.cost}
            </Badge>
          </Button>

          <Button
            onClick={handleTestConnection}
            disabled={isTestingConnection || !operationCosts.test.affordable}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isTestingConnection ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Wifi className="h-4 w-4" />
            )}
            Test API
            <Badge variant="outline" className="ml-1">
              {operationCosts.test.cost}
            </Badge>
          </Button>

          <Button
            onClick={handleClearCache}
            variant="outline"
            className="flex items-center gap-2"
          >
            <AlertCircle className="h-4 w-4" />
            Clear Cache
          </Button>
        </div>

        {/* Status Information */}
        {lastUpdate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Last updated: {lastUpdate.toLocaleString()}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Updating prices...
          </div>
        )}

        {/* Individual Symbol Status */}
        {symbolStatuses.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Stock Status:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {symbolStatuses.map(status => (
                <div
                  key={status.symbol}
                  className="flex items-center justify-between p-2 border rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium">
                      {status.symbol}
                    </span>
                    {status.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : status.error ? (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-gray-400" />
                    )}
                    <LiveDataIndicator symbol={status.symbol} />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {status.price && (
                      <span className="text-sm font-medium">
                        {formatCurrency(status.price)}
                      </span>
                    )}
                    {status.fromCache && (
                      <Badge variant="outline" className="text-xs">
                        cached
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRefreshSymbol(status.symbol)}
                      disabled={loading}
                      className="h-6 w-6 p-0"
                    >
                      <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* API Usage Information */}
        <div className="text-xs text-muted-foreground p-3 bg-muted rounded-md">
          <p className="font-medium mb-1">ℹ️ API Usage Information:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Alpha Vantage Free Tier: 500 calls/day, 5 calls/minute</li>
            <li>Prices are cached daily to conserve API calls</li>
            <li>Manual refresh fetches fresh data from API</li>
            <li>Test connection uses 1 API call</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}