"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { TrendingDown, ExternalLink } from "lucide-react";
import { formatCurrency } from "@/lib/portfolioUtils";

// Mock spending data - in a real app, this would come from bank/credit card APIs
const spendingData = [
  { month: 'Jul', amount: 7800 },
  { month: 'Aug', amount: 8200 },
  { month: 'Sep', amount: 8900 },
  { month: 'Oct', amount: 9100 },
  { month: 'Nov', amount: 8750 },
  { month: 'Dec', amount: 9200 },
  { month: 'Jan', amount: 8570 },
];

interface SpendingTrackerProps {
  showValues?: boolean;
}

export function SpendingTracker({ showValues = true }: SpendingTrackerProps) {
  const currentMonth = spendingData[spendingData.length - 1];
  const lastMonth = spendingData[spendingData.length - 2];
  const monthlyChange = currentMonth.amount - lastMonth.amount;
  const isUnderBudget = currentMonth.amount < 9000; // Assuming $9k budget
  const budgetRemaining = 9000 - currentMonth.amount;

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Monthly Spending
            </CardTitle>
            <CardDescription>
              Track monthly expenses and budget performance
            </CardDescription>
          </div>
          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <span>TRANSACTIONS</span>
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current month spending */}
        <div className="space-y-2">
          <div className="text-3xl font-bold">
            {showValues ? formatCurrency(currentMonth.amount) : '***'} spent
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              {showValues ? formatCurrency(lastMonth.amount) : '***'} spent last month
            </span>
            {monthlyChange !== 0 && (
              <Badge variant={monthlyChange > 0 ? "destructive" : "default"} className="text-xs">
                {monthlyChange > 0 ? '+' : ''}{showValues ? formatCurrency(Math.abs(monthlyChange)) : '***'}
              </Badge>
            )}
          </div>
        </div>

        {/* Spending trend chart */}
        <div className="h-24 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={spendingData}>
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={false}
              />
              <YAxis hide />
              <Line
                type="monotone"
                dataKey="amount"
                stroke={isUnderBudget ? "#22c55e" : "#ef4444"}
                strokeWidth={3}
                dot={false}
                activeDot={{ 
                  r: 4, 
                  fill: isUnderBudget ? "#22c55e" : "#ef4444",
                  stroke: "transparent"
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Budget status */}
        {isUnderBudget && (
          <div className="flex items-center justify-end">
            <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">
              {showValues ? formatCurrency(budgetRemaining) : '***'} under budget
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}