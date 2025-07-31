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
import { getStockSymbols, formatCurrency } from '@/lib/portfolioUtils';
import { portfolioData } from '@/data/portfolio';

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

  const handleRefreshAll = async () => {
    await refreshAll();
    onPricesUpdated?.();
  };

  const handleRefreshSymbol = async (symbol: string) => {
    await refreshSymbol(symbol);
    onPricesUpdated?.();
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    try {
      const isConnected = await testConnection();
      setConnectionStatus(isConnected);
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
        {/* Main Controls */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleRefreshAll}
            disabled={loading || stockSymbols.length === 0}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh All Stocks
            {stockSymbols.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {stockSymbols.length}
              </Badge>
            )}
          </Button>

          <Button
            onClick={handleTestConnection}
            disabled={isTestingConnection}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isTestingConnection ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Wifi className="h-4 w-4" />
            )}
            Test API
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