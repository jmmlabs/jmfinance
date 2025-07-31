"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  BarChart3,
  Calendar,
  Target,
  Timer
} from 'lucide-react';
import { useApiUsage } from '@/hooks/useApiUsage';
import { formatDistanceToNow } from 'date-fns';

interface ApiUsageDashboardProps {
  compact?: boolean;
}

export function ApiUsageDashboard({ compact = false }: ApiUsageDashboardProps) {
  const {
    stats,
    rateLimitStatus,
    liveIndicators,
    estimateOperationCost,
    usageHistory,
    refresh
  } = useApiUsage();

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Loading API usage data...
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: 'safe' | 'warning' | 'critical') => {
    switch (status) {
      case 'safe': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
    }
  };

  const getStatusIcon = (status: 'safe' | 'warning' | 'critical') => {
    switch (status) {
      case 'safe': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const operationCosts = {
    test: estimateOperationCost('test'),
    single: estimateOperationCost('single'),
    all: estimateOperationCost('all')
  };

  if (compact) {
    return (
      <div className="flex items-center gap-4 p-3 bg-muted rounded-md">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          <span className="text-sm font-medium">
            {stats.totalCallsToday}/{stats.dailyLimit} API calls
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={getStatusColor(rateLimitStatus.daily.status)}>
            {getStatusIcon(rateLimitStatus.daily.status)}
          </div>
          <span className="text-sm">
            {stats.remainingCallsToday} remaining
          </span>
        </div>

        {liveIndicators.size > 0 && (
          <Badge variant="default" className="text-xs">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse" />
            {liveIndicators.size} live
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          API Usage Dashboard
          <Button
            size="sm"
            variant="ghost"
            onClick={refresh}
            className="ml-auto"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Daily Usage Overview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Daily Usage</h4>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono">
                {stats.totalCallsToday}/{stats.dailyLimit}
              </span>
              <div className={getStatusColor(rateLimitStatus.daily.status)}>
                {getStatusIcon(rateLimitStatus.daily.status)}
              </div>
            </div>
          </div>
          
          <Progress 
            value={rateLimitStatus.daily.percentage} 
            className="h-2"
          />
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{stats.remainingCallsToday} calls remaining</span>
            <span>Resets {formatDistanceToNow(stats.resetTime, { addSuffix: true })}</span>
          </div>
        </div>

        {/* Rate Limit Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4" />
              <span className="text-sm font-medium">Rate Limit</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">
                {rateLimitStatus.minute.callsInLastMinute}/5 per minute
              </span>
              <div className={getStatusColor(rateLimitStatus.minute.status)}>
                {getStatusIcon(rateLimitStatus.minute.status)}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">Next Update</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {stats.costAnalysis.nextScheduledUpdate ? 
                formatDistanceToNow(stats.costAnalysis.nextScheduledUpdate, { addSuffix: true }) :
                'No scheduled updates'
              }
            </div>
          </div>
        </div>

        {/* Operation Costs */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4" />
            Operation Costs
          </h4>
          
          <div className="space-y-2">
            {Object.entries(operationCosts).map(([key, cost]) => (
              <div key={key} className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm">{cost.description}</span>
                <div className="flex items-center gap-2">
                  <Badge variant={cost.affordable ? "default" : "destructive"}>
                    {cost.cost} call{cost.cost !== 1 ? 's' : ''}
                  </Badge>
                  {!cost.affordable && (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Data Indicators */}
        {liveIndicators.size > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Live Data Status
            </h4>
            
            <div className="grid grid-cols-2 gap-2">
              {Array.from(liveIndicators.entries()).map(([symbol, indicator]) => (
                <div key={symbol} className="flex items-center gap-2 p-2 border rounded">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="font-mono text-sm font-medium">{symbol}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {indicator.lastUpdate ? 
                      formatDistanceToNow(indicator.lastUpdate, { addSuffix: true }) :
                      'Never'
                    }
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Usage History */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            7-Day Usage History
          </h4>
          
          <div className="flex items-end justify-between h-20 gap-1">
            {usageHistory.map((day, index) => {
              const height = Math.max(4, (day.calls / 100) * 100); // Scale to 100 max
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div 
                    className="w-full bg-primary rounded-sm min-h-[4px]"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-muted-foreground">{day.date}</span>
                  <span className="text-xs font-mono">{day.calls}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            size="sm"
            variant="outline"
            onClick={refresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Stats
          </Button>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground ml-auto">
            <Clock className="h-4 w-4" />
            Resets automatically at midnight
          </div>
        </div>
      </CardContent>
    </Card>
  );
}