"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { TrendingUp, ExternalLink } from "lucide-react";
import { formatCurrency } from "@/lib/portfolioUtils";

// Mock portfolio performance data - in a real app, this would come from historical portfolio values
const portfolioPerformanceData = [
  { month: 'Jul', value: 850000 },
  { month: 'Aug', value: 870000 },
  { month: 'Sep', value: 820000 },
  { month: 'Oct', value: 890000 },
  { month: 'Nov', value: 910000 },
  { month: 'Dec', value: 925000 },
  { month: 'Jan', value: 908000 },
];

interface PortfolioPerformanceProps {
  showValues?: boolean;
  currentValue?: number;
}

export function SpendingTracker({ showValues = true, currentValue }: PortfolioPerformanceProps) {
  // Use the actual current portfolio value if provided, otherwise use the mock data
  const currentMonth = currentValue ? 
    { ...portfolioPerformanceData[portfolioPerformanceData.length - 1], value: currentValue } :
    portfolioPerformanceData[portfolioPerformanceData.length - 1];
    
  const lastMonth = portfolioPerformanceData[portfolioPerformanceData.length - 2];
  const monthlyChange = currentMonth.value - lastMonth.value;
  const monthlyChangePercent = (monthlyChange / lastMonth.value) * 100;
  const isPositive = monthlyChange >= 0;

  // Calculate total return from first data point
  const firstMonth = portfolioPerformanceData[0];
  const totalReturn = currentMonth.value - firstMonth.value;
  const totalReturnPercent = (totalReturn / firstMonth.value) * 100;

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Portfolio Performance
            </CardTitle>
            <CardDescription>
              Track portfolio value growth over time
            </CardDescription>
          </div>
          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <span>HISTORY</span>
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current portfolio value */}
        <div className="space-y-2">
          <div className="text-3xl font-bold">
            {showValues ? formatCurrency(currentMonth.value) : '***'} value
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              {showValues ? formatCurrency(lastMonth.value) : '***'} last month
            </span>
            {monthlyChange !== 0 && (
              <Badge variant={isPositive ? "default" : "destructive"} className="text-xs">
                {isPositive ? '+' : ''}{showValues ? formatCurrency(Math.abs(monthlyChange)) : '***'} 
                ({isPositive ? '+' : ''}{showValues ? monthlyChangePercent.toFixed(1) : '*'}%)
              </Badge>
            )}
          </div>
        </div>

        {/* Portfolio performance chart */}
        <div className="h-24 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={portfolioPerformanceData}>
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={false}
              />
              <YAxis hide />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#22c55e"
                strokeWidth={3}
                dot={false}
                activeDot={{ 
                  r: 4, 
                  fill: "#22c55e",
                  stroke: "transparent"
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Total return status */}
        <div className="flex items-center justify-end">
          <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">
            {showValues ? `+${formatCurrency(totalReturn)}` : '***'} total return 
            ({showValues ? `+${totalReturnPercent.toFixed(1)}%` : '***'})
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}