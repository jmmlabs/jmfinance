"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CombinedPriceControls } from "@/components/CombinedPriceControls";
import { ApiUsageDashboard } from "@/components/ApiUsageDashboard";
import { ApiStatusHeader } from "@/components/LiveDataIndicator";
import { 
  DollarSign, 
  TrendingUp, 
  PieChart, 
  Wallet, 
  Lock, 
  Unlock, 
  Coins, 
  Building2,
  Car,
  Bitcoin,
  Ethereum,
  BarChart3,
  Eye,
  EyeOff,
  RefreshCw,
  Zap
} from "lucide-react";
import { 
  portfolioData, 
  totalPortfolioValue, 
  assetTypeBreakdown, 
  liquidityBreakdown, 
  stageBreakdown 
} from "@/data/portfolio";
import { useState, useCallback } from "react";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

const COLORS = {
  'USD': '#10B981',
  'CRYPTO': '#F59E0B',
  'STOCKS': '#3B82F6',
  'PRIVATE REAL ESTATE': '#8B5CF6',
  'PHYSICAL ASSET': '#6B7280',
  'BONDS': '#EF4444',
  'LIQUID': '#10B981',
  'ILLIQUID': '#F59E0B',
  'UNLOCKED': '#10B981',
  'LOCKED': '#F59E0B',
  'RETIREMENT': '#8B5CF6'
};

export default function Dashboard() {
  const [showValues, setShowValues] = useState(true);
  const [portfolioUpdateKey, setPortfolioUpdateKey] = useState(0);

  const handlePricesUpdated = useCallback(() => {
    // Force re-render of portfolio data when prices are updated
    setPortfolioUpdateKey(prev => prev + 1);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const assetTypeData = Object.entries(assetTypeBreakdown).map(([type, value]) => ({
    name: type,
    value,
    percentage: (value / totalPortfolioValue) * 100
  }));

  const liquidityData = Object.entries(liquidityBreakdown).map(([liquidity, value]) => ({
    name: liquidity,
    value,
    percentage: (value / totalPortfolioValue) * 100
  }));

  const stageData = Object.entries(stageBreakdown).map(([stage, value]) => ({
    name: stage,
    value,
    percentage: (value / totalPortfolioValue) * 100
  }));

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Portfolio Dashboard</h1>
            <div className="flex items-center gap-4">
              <p className="text-muted-foreground">Your financial overview</p>
              <ApiStatusHeader />
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowValues(!showValues)}
            className="flex items-center gap-2"
          >
            {showValues ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showValues ? 'Hide Values' : 'Show Values'}
          </Button>
        </div>

        {/* Total Portfolio Value */}
        <Card className="border-0 bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Portfolio Value</p>
                <p className="text-4xl font-bold text-foreground">
                  {showValues ? formatCurrency(totalPortfolioValue) : '••••••••'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Last updated: {portfolioData[0]?.updateDate}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Assets</p>
                  <p className="text-2xl font-bold text-foreground">{portfolioData.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Accounts</p>
                  <p className="text-2xl font-bold text-foreground">
                    {new Set(portfolioData.map(asset => asset.accountName)).size}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Liquid Assets</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {showValues ? formatCurrency(liquidityBreakdown.LIQUID || 0) : '••••••'}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatPercentage(((liquidityBreakdown.LIQUID || 0) / totalPortfolioValue) * 100)} of portfolio
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Crypto Holdings</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {showValues ? formatCurrency(assetTypeBreakdown.CRYPTO || 0) : '••••••'}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatPercentage(((assetTypeBreakdown.CRYPTO || 0) / totalPortfolioValue) * 100)} of portfolio
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Real Estate</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {showValues ? formatCurrency(assetTypeBreakdown['PRIVATE REAL ESTATE'] || 0) : '••••••'}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatPercentage(((assetTypeBreakdown['PRIVATE REAL ESTATE'] || 0) / totalPortfolioValue) * 100)} of portfolio
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stocks</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {showValues ? formatCurrency(assetTypeBreakdown.STOCKS || 0) : '••••••'}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatPercentage(((assetTypeBreakdown.STOCKS || 0) / totalPortfolioValue) * 100)} of portfolio
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Tables */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="allocation">Allocation</TabsTrigger>
            <TabsTrigger value="liquidity">Liquidity</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="prices" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Prices
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              API
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Comprehensive Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
              
              {/* Asset Type Breakdown */}
              <Card className="xl:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">'$ AMT' by 'TYPE'</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={assetTypeData}
                          cx="50%"
                          cy="50%"
                          outerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percentage }) => `${name}\n${percentage.toFixed(0)}%`}
                          labelLine={false}
                        >
                          {assetTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#8884d8'} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Underlying Asset Breakdown */}
              <Card className="xl:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">'% OF TOTAL' by 'UNDERLYING ASSET'</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={portfolioData.map(asset => ({
                            name: asset.underlyingAsset.length > 15 ? 
                              asset.underlyingAsset.substring(0, 15) + '...' : 
                              asset.underlyingAsset,
                            value: asset.amount,
                            percentage: asset.percentageOfTotal
                          })).filter(item => item.value > 1000)} // Only show significant holdings
                          cx="50%"
                          cy="50%"
                          outerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percentage }) => `${percentage.toFixed(0)}%`}
                          labelLine={false}
                        >
                          {portfolioData.map((entry, index) => (
                            <Cell key={`underlying-${index}`} fill={COLORS[Object.keys(COLORS)[index % Object.keys(COLORS).length] as keyof typeof COLORS]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Liquidity Breakdown */}
              <Card className="xl:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">'$ AMT' by 'LIQUIDITY'</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={[
                            { name: 'LIQUID', value: liquidityBreakdown.LIQUID || 0 },
                            { name: 'ILLIQUID', value: liquidityBreakdown.ILLIQUID || 0 }
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value }) => `${name}\n${((value / totalPortfolioValue) * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          <Cell fill="#3b82f6" />
                          <Cell fill="#f97316" />
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Stage Breakdown */}
              <Card className="xl:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">'$ AMT' by 'STAGE'</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={Object.entries(stageBreakdown).map(([stage, value]) => ({
                            name: stage,
                            value: value || 0
                          }))}
                          cx="50%"
                          cy="50%"
                          outerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value }) => `${name}\n${((value / totalPortfolioValue) * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          <Cell fill="#3b82f6" />
                          <Cell fill="#22c55e" />
                          <Cell fill="#f97316" />
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Account Summary Table */}
            <Card>
              <CardHeader>
                <CardTitle>Account Summary</CardTitle>
                <CardDescription>Total holdings grouped by account with allocation percentages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table className="w-auto">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[200px]">Account Name</TableHead>
                        <TableHead className="min-w-[150px] pr-8">Main Assets</TableHead>
                        <TableHead className="text-right min-w-[120px] pl-8">Total Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                  <TableBody>
                    {(() => {
                      // Group assets by account name
                      const accountGroups = portfolioData.reduce((acc, asset) => {
                        if (!acc[asset.accountName]) {
                          acc[asset.accountName] = [];
                        }
                        acc[asset.accountName].push(asset);
                        return acc;
                      }, {} as Record<string, typeof portfolioData>);

                      // Create summary for each account
                      const accountSummaries = Object.entries(accountGroups).map(([accountName, assets]) => {
                        const totalAmount = assets.reduce((sum, asset) => sum + asset.amount, 0);
                        
                        // Get main assets (top 3 by value)
                        const mainAssets = assets
                          .sort((a, b) => b.amount - a.amount)
                          .slice(0, 3)
                          .map(asset => asset.actualAsset)
                          .join(', ');

                        return {
                          accountName,
                          totalAmount,
                          mainAssets,
                          assetCount: assets.length
                        };
                      });

                      return accountSummaries
                        .sort((a, b) => b.totalAmount - a.totalAmount)
                        .map((summary, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {summary.accountName}
                              <div className="text-xs text-muted-foreground">
                                {summary.assetCount} asset{summary.assetCount !== 1 ? 's' : ''}
                              </div>
                            </TableCell>
                            <TableCell className="pr-8">
                              <div title={summary.mainAssets}>
                                {summary.mainAssets}
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold text-right pl-8">
                              {showValues ? formatCurrency(summary.totalAmount) : '***'}
                            </TableCell>
                          </TableRow>
                        ));
                    })()}
                    <TableRow className="font-semibold border-t-2">
                      <TableCell>Grand Total</TableCell>
                      <TableCell className="pr-8"></TableCell>
                      <TableCell className="text-right pl-8">
                        {showValues ? formatCurrency(totalPortfolioValue) : '***'}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="allocation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Asset Allocation</CardTitle>
                <CardDescription>Detailed breakdown of your portfolio by asset type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={assetTypeData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="liquidity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Liquidity Analysis</CardTitle>
                <CardDescription>Breakdown of liquid vs illiquid assets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={liquidityData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percentage }) => `${name} ${percentage.toFixed(1)}%`}
                      >
                        {liquidityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#8884d8'} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assets" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Assets</CardTitle>
                <CardDescription>Complete list of your portfolio assets</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>% of Portfolio</TableHead>
                      <TableHead>Liquidity</TableHead>
                      <TableHead>Stage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {portfolioData.map((asset, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          <div>
                            <div>{asset.actualAsset}</div>
                            <div className="text-sm text-muted-foreground">{asset.accountName}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{asset.type}</Badge>
                        </TableCell>
                        <TableCell className="font-mono">
                          {showValues ? formatCurrency(asset.amount) : '••••••'}
                        </TableCell>
                        <TableCell>{formatPercentage(asset.percentageOfTotal)}</TableCell>
                        <TableCell>
                          <Badge variant={asset.liquidity === 'LIQUID' ? 'default' : 'secondary'}>
                            {asset.liquidity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{asset.stage}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prices" className="space-y-4">
            <CombinedPriceControls onPricesUpdated={handlePricesUpdated} />
          </TabsContent>

          <TabsContent value="api" className="space-y-4">
            <ApiUsageDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
