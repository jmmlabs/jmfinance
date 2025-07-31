# JM Finance Dashboard

A comprehensive, real-time finance dashboard with live API price tracking, intelligent usage monitoring, and automated portfolio updates. Built with Next.js 14, shadcn/ui, and TypeScript for professional financial management.

## 🚀 Current Features

### 📊 **Live Portfolio Management**
- **Real-Time Price Updates**: Live stock prices via Alpha Vantage API (IVV, VXUS)
- **Multi-Asset Support**: Stocks, crypto, cash, bonds, real estate tracking
- **Dark Mode Interface**: Beautiful, minimalistic design optimized for extended use
- **Account Organization**: Track across multiple brokers and account types
- **Privacy Controls**: Toggle to hide/show dollar amounts for security

### 📈 **Smart API Integration**
- **Alpha Vantage Integration**: Real-time stock price updates with 500 daily calls
- **Daily Caching**: Intelligent price caching to optimize API usage
- **Manual Refresh Controls**: Update all stocks or individual stocks on demand
- **Live Data Indicators**: Visual badges showing which assets have fresh data
- **Cost Estimation**: Shows exact API call cost before each operation

### 🎯 **API Usage Monitoring**
- **Usage Dashboard**: Complete analytics with 7-day usage history
- **Rate Limit Tracking**: Real-time monitoring of daily (500) and per-minute (5) limits
- **Smart Prevention**: Buttons automatically disable when quota insufficient
- **Automatic Reset**: Daily quota resets automatically at midnight
- **Error Handling**: Graceful fallbacks to cached data on API failures

### 📊 **Dashboard Views**
- **Overview**: Portfolio value, allocation charts, performance metrics
- **Allocation**: Asset type breakdown, liquidity analysis, stage categorization  
- **Assets**: Detailed table with live prices, notes, and comprehensive tracking
- **Prices**: Manual price update controls with operation cost estimates
- **API**: Complete usage analytics and live data monitoring

## 🎮 How to Use (Current State)

### 🏠 **Navigation**
1. **Header Status**: Always shows API usage (e.g., "15/500 Good • 2 Live Assets")
2. **Tab System**: Switch between Overview, Allocation, Assets, Prices, and API
3. **Privacy Toggle**: Hide/show dollar amounts instantly

### 💰 **Price Updates**
1. **Visit "Prices" Tab**: View all price control options
2. **Check Costs First**: Each operation shows API call cost
3. **Individual Refresh**: Click ↻ next to specific stock (1 call each)
4. **Refresh All Stocks**: Update all configured stocks (2 calls total)
5. **Test API Connection**: Verify Alpha Vantage connectivity (1 call)

### 📊 **Monitor API Usage**
1. **Header Indicator**: Current usage always visible
2. **API Tab**: Detailed analytics and 7-day history
3. **Live Badges**: Green indicators show today's fresh data
4. **Auto Management**: Usage resets to 0/500 at midnight

### 🔧 **Current Portfolio**
Your dashboard tracks these assets with live API integration:
- **IVV** (iShares Core S&P 500 ETF) - Real-time Alpha Vantage updates
- **VXUS** (Vanguard Total International Stock ETF) - Real-time Alpha Vantage updates  
- **Other Assets** - Manual tracking (cash, bonds, crypto, etc.)

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router) with TypeScript
- **UI Components**: shadcn/ui with Tailwind CSS
- **Data Visualization**: Recharts for portfolio charts
- **Icons**: Lucide React for consistent iconography
- **API Integration**: Alpha Vantage (stocks), CoinGecko ready (crypto)
- **State Management**: React hooks with localStorage persistence
- **Deployment**: GitHub Pages ready with environment-based data loading

## 🔒 Privacy & Security

### **Data Protection**
- **Development Mode**: Uses your real portfolio from `portfolio.personal.ts`
- **Production Mode**: Automatically switches to demo data for public viewing
- **API Key Security**: Stored in `.env.local` (never committed to repository)
- **Git Privacy**: Personal financial data automatically ignored

### **API Configuration**
Your Alpha Vantage API key is already configured:
```bash
# Already set in .env.local
NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY=1D6MJ3TSL6R6O23E
```

## 🚀 Getting Started

### **Current Setup (Ready to Use)**
The application is fully configured and functional:

1. **Development Server**: 
   ```bash
   npm run dev
   # App running at http://localhost:3000 or :3001
   ```

2. **Access Dashboard**: Your real portfolio loads automatically in development

3. **Monitor Usage**: API status visible in header and detailed in API tab

### **Daily Workflow**
1. ✅ **Check API Status**: Monitor daily usage in header
2. ✅ **Update Prices**: Use manual refresh controls as needed  
3. ✅ **Review Portfolio**: Check live values and allocation
4. ✅ **Track Performance**: Monitor asset performance with real data

### **Development Workflow**
- **Local Testing**: Personal data loads automatically 
- **Git Commits**: Personal data stays private (gitignored)
- **API Monitoring**: Stay within 500 daily call limit
- **Testing**: Use individual refresh for targeted price updates

## 📈 Current Implementation Status

### ✅ **Completed Features**
- **Live Price Tracking**: IVV and VXUS update with real market prices
- **API Usage Monitoring**: Complete tracking with quota management
- **Smart Caching**: Daily price caching prevents unnecessary API calls
- **Individual Controls**: Refresh specific stocks without affecting others
- **Error Prevention**: Intelligent button states based on API availability
- **Privacy Protection**: Personal financial data secured and git-ignored
- **Real Portfolio Integration**: Your actual holdings with live pricing

### 🔄 **In Progress**
- **Documentation**: Comprehensive guides and API references
- **Testing**: Additional error scenarios and edge cases

### 🎯 **Ready for Next Session**
- **CoinGecko Integration**: Add cryptocurrency price tracking (BTC, ETH)
- **Database Migration**: Move from static files to Supabase/PostgreSQL
- **Performance Calculations**: Daily, monthly, YTD return analysis
- **Advanced Charting**: Performance trends and correlation analysis

## 📊 Project Architecture

```
src/
├── app/                          # Next.js app router
│   ├── page.tsx                  # Main dashboard with tabs
│   ├── layout.tsx                # Root layout with dark mode
│   └── globals.css               # Global styles and variables
├── components/                   # React components
│   ├── ApiUsageDashboard.tsx     # Complete API analytics
│   ├── LiveDataIndicator.tsx     # Live data status badges
│   ├── PriceUpdateControls.tsx   # Manual refresh controls
│   └── ui/                       # shadcn/ui base components
├── data/
│   ├── portfolio.ts              # Demo data & environment loading
│   └── portfolio.personal.ts     # Your real portfolio (git-ignored)
├── hooks/                        # React hooks
│   ├── useStockPrices.ts         # Stock price state management
│   └── useApiUsage.ts            # API usage tracking
├── services/                     # External API services
│   ├── alphaVantageService.ts    # Stock price API integration
│   └── apiUsageTracker.ts        # Usage analytics and persistence
├── types/
│   └── api.ts                    # TypeScript interfaces
└── lib/
    └── portfolioUtils.ts         # Portfolio calculations and utilities
```

## 📝 Key Implementation Details

### **API Management**
- **Daily Quota**: 500 free calls from Alpha Vantage
- **Rate Limiting**: 5 calls per minute maximum
- **Caching Strategy**: Daily price caching with manual override
- **Error Handling**: Graceful fallbacks to cached data
- **Usage Tracking**: Persistent localStorage analytics

### **Performance Optimization**
- **Lazy Loading**: API tracker loads client-side only
- **Smart Caching**: Prevents duplicate API calls for same day
- **Individual Loading States**: Per-stock refresh indicators
- **Efficient Updates**: Only refreshes requested assets

### **Data Privacy**
- **Environment Detection**: Automatic dev/prod data switching
- **Secure Storage**: API keys in environment variables only
- **Git Exclusion**: Personal data never committed
- **Privacy Controls**: Toggle sensitive information display

## 🎯 Current Development State

**✅ Phase 1 Complete**: Core functionality with live API integration  
**🔄 Phase 2 Ready**: Enhanced features and database migration  
**📋 Phase 3 Planned**: Advanced analytics and multi-user support  

### **Immediate Next Steps**
1. **Crypto Integration**: CoinGecko API for BTC/ETH prices
2. **Database Setup**: PostgreSQL with Prisma ORM  
3. **Return Calculations**: Performance tracking over time
4. **Advanced Charts**: Trend analysis and correlation heatmaps

### **Session Summary**
- ✅ **API Integration**: Complete Alpha Vantage integration working
- ✅ **Usage Monitoring**: Comprehensive tracking and analytics
- ✅ **Price Controls**: Manual refresh system operational
- ✅ **Data Privacy**: Personal portfolio secured and functional
- ✅ **Error Handling**: Robust API failure management
- ✅ **User Experience**: Intuitive controls and visual feedback

---

🎯 **Ready for Tomorrow**: Fully functional real-time finance dashboard with intelligent API management and comprehensive portfolio tracking!