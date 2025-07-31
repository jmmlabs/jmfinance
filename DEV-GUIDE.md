# 🛠️ JM Finance Dashboard - Development Guide

## 🎯 Current State (July 30, 2025)

**✅ Phase 1 Complete**: Fully functional real-time finance dashboard with live API integration

### **What's Working Right Now**
- ✅ **Live Stock Prices**: IVV and VXUS update with real market data
- ✅ **API Usage Monitoring**: Complete tracking with 500 daily call limit
- ✅ **Smart Controls**: Manual refresh with cost transparency
- ✅ **Personal Portfolio**: Your actual holdings with live pricing
- ✅ **Privacy Protection**: Personal data secured and git-ignored

---

## 🚀 Daily Development Workflow

### **1. Start Development Session**
```bash
# Navigate to project
cd /Users/jacob/projects/jmfinance

# Start development server
npm run dev
# ✅ App runs at http://localhost:3000 or :3001
# ✅ Personal portfolio loads automatically
# ✅ API key configured and working
```

### **2. Check Current Status**
```bash
# View dashboard in browser
open http://localhost:3000

# Monitor in header: "X/500 Good • Y Live Assets"
# Check API tab for detailed usage analytics
# Verify Prices tab controls are functional
```

### **3. Development Testing**
```bash
# Test API functionality
# 1. Go to Prices tab
# 2. Click "Test API" (1 call) - should work
# 3. Click individual refresh on IVV (1 call)
# 4. Click "Refresh All Stocks" (2 calls)
# 5. Monitor usage in API tab
```

### **4. Commit Changes**
```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: description of changes"

# Push to GitHub
git push origin main
```

---

## 📁 Project Architecture

```
jmfinance/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── page.tsx                  # Main dashboard (6 tabs)
│   │   ├── layout.tsx                # Root layout with dark mode
│   │   └── globals.css               # Global styles and variables
│   │
│   ├── components/                   # React Components
│   │   ├── ApiUsageDashboard.tsx     # Complete API analytics
│   │   ├── LiveDataIndicator.tsx     # Live data status badges
│   │   ├── PriceUpdateControls.tsx   # Manual refresh controls
│   │   └── ui/                       # shadcn/ui base components
│   │
│   ├── data/                         # Data Layer
│   │   ├── portfolio.ts              # Demo data + loading logic
│   │   └── portfolio.personal.ts     # Your real portfolio (PRIVATE)
│   │
│   ├── hooks/                        # React Hooks
│   │   ├── useStockPrices.ts         # Stock price state management
│   │   └── useApiUsage.ts            # API usage tracking
│   │
│   ├── services/                     # External Services
│   │   ├── alphaVantageService.ts    # Stock price API integration
│   │   └── apiUsageTracker.ts        # Usage analytics + persistence
│   │
│   ├── types/                        # TypeScript Definitions
│   │   └── api.ts                    # API response interfaces
│   │
│   └── lib/                          # Utilities
│       └── portfolioUtils.ts         # Portfolio calculations
│
├── .env.local                        # API keys (PRIVATE)
├── ROADMAP.md                        # Strategic planning
├── PROGRESS.md                       # Development tracking
└── README.md                         # Main documentation
```

---

## 🔧 Key Technical Components

### **1. Data Loading System**
```typescript
// src/data/portfolio.ts
function loadPortfolioData(): PortfolioAsset[] {
  if (process.env.NODE_ENV === 'development') {
    try {
      // Load your real portfolio
      const { personalPortfolioData } = require('./portfolio.personal');
      return personalPortfolioData;
    } catch (error) {
      // Fallback to demo data
    }
  }
  return demoPortfolioData;
}
```

### **2. API Integration**
```typescript
// src/services/alphaVantageService.ts
class AlphaVantageService {
  // Real-time stock quotes with caching
  async getQuote(symbol: string, forceRefresh = false)
  
  // Batch updates for multiple stocks  
  async getMultipleQuotes(symbols: string[], forceRefresh = false)
  
  // Cache-only data (no API calls)
  getCachedPricesOnly(symbols: string[])
}
```

### **3. Usage Tracking**
```typescript
// src/services/apiUsageTracker.ts
class ApiUsageTracker {
  // Record every API call with cost and timestamp
  recordCall(call: ApiCall)
  
  // Get today's usage stats
  getTodaysStats(): ApiUsageStats
  
  // Check rate limit status
  getRateLimitStatus()
}
```

### **4. Smart Caching**
- **Daily Cache**: Prices cached for 24 hours
- **Manual Override**: Force refresh bypasses cache
- **Fallback Logic**: Show cached data on API errors
- **Usage Optimization**: Minimize API calls while maintaining freshness

---

## 🎮 Dashboard Usage Guide

### **Navigation**
- **Header**: API status always visible (e.g., "15/500 Good • 2 Live Assets")
- **Tabs**: 6 main sections - Overview, Allocation, Liquidity, Assets, Prices, API
- **Privacy**: Toggle button to hide/show dollar amounts

### **Prices Tab** (Main Controls)
1. **Operation Cost Preview**: Shows API call cost before clicking
2. **Test API**: Verify connection (1 call)
3. **Individual Refresh**: Update specific stock (1 call each)
4. **Refresh All Stocks**: Update all configured stocks (2 calls total)

### **API Tab** (Monitoring)
- **Daily Usage**: Current quota usage with progress bar
- **Rate Limits**: Per-minute tracking
- **7-Day History**: Visual usage chart  
- **Live Indicators**: Which assets have fresh data
- **Operation Costs**: Estimated costs for different actions

### **Your Portfolio Configuration**
Current assets configured for live updates:
- **IVV**: iShares Core S&P 500 ETF
- **VXUS**: Vanguard Total International Stock ETF

---

## 🔧 Development Tips

### **API Management**
```bash
# Check current usage
# Visit: API tab in dashboard

# Monitor quota in real-time
# Header shows: "X/500 Good/Warning/Critical"

# Test without consuming quota
# Use cached data display in Prices tab
```

### **Debugging**
```bash
# Check browser console for API logs
# Look for: "[API Tracker]" and "[useStockPrices]" messages

# Verify environment variables
cat .env.local  # Should show your API key

# Check data loading
# Console shows: "Personal portfolio data not found, using demo data" OR loads personal
```

### **Performance**
- **Individual Loading States**: Each stock button has its own spinner
- **Cache-First Loading**: Tab visits load cached data only
- **Smart Batching**: Multiple stock updates use delay between calls
- **Error Recovery**: Graceful fallbacks to cached data

---

## 🎯 Next Development Session

### **Ready to Implement** 
1. **CoinGecko Crypto Integration**
   - Add BTC and ETH price tracking
   - Extend API usage monitoring
   - Configure crypto assets in personal portfolio

2. **Database Migration Planning**
   - Research Supabase vs PostgreSQL + Prisma
   - Design schema for assets and price history
   - Plan migration from static files

3. **Performance Analytics**
   - Calculate daily/monthly returns
   - Implement portfolio performance tracking
   - Add risk metrics and correlation analysis

### **Development Environment Ready**
✅ **Next.js 14**: App Router with TypeScript  
✅ **API Integration**: Alpha Vantage working (500 calls/day)  
✅ **UI Framework**: shadcn/ui with Tailwind CSS  
✅ **Data Visualization**: Recharts for portfolio charts  
✅ **State Management**: React hooks with localStorage  
✅ **Privacy**: Personal data protected and functional  

---

## 🚨 Important Notes

### **API Key Security**
- **Never commit** `.env.local` to git (already in .gitignore)
- **API key is working**: `NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY=1D6MJ3TSL6R6O23E`
- **Free tier limit**: 500 calls per day

### **Personal Data Privacy**
- **portfolio.personal.ts**: Contains your real financial data (git-ignored)
- **Development mode**: Automatically loads your personal portfolio
- **Production mode**: Uses demo data for public viewing

### **Current API Usage Strategy**
- **Daily Caching**: Prevents duplicate calls for same day
- **Manual Controls**: Only explicit user actions trigger API calls
- **Cost Transparency**: Show exact call cost before operations
- **Smart Fallbacks**: Cached data shown on API failures

---

## 📝 Quick Reference

### **Common Commands**
```bash
# Start development
npm run dev

# Build for production  
npm run build

# Type checking
npx tsc --noEmit

# Git workflow
git add .
git commit -m "message"
git push
```

### **Key URLs**
- **Local Dashboard**: http://localhost:3000 or :3001
- **GitHub Repo**: https://github.com/jmmlabs/jmfinance
- **Alpha Vantage Docs**: https://www.alphavantage.co/documentation/

### **File Locations**
- **Personal Portfolio**: `src/data/portfolio.personal.ts`
- **API Key**: `.env.local`
- **Main Dashboard**: `src/app/page.tsx`
- **Price Controls**: `src/components/PriceUpdateControls.tsx`

---

🎯 **Status**: Phase 1 Complete - Ready for Phase 2 development!  
🚀 **Next Goal**: CoinGecko crypto integration and database migration planning