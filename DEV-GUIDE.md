# 🛠️ JM Finance Dashboard - Development Guide

## 🚀 Quick Start Workflow

### Daily Development Process

1. **Start Your Work Session**
   ```bash
   # Check current todos and progress
   npm run dev  # Start development server
   
   # Mark task as in progress
   node scripts/update-progress.js start "phase1-research"
   ```

2. **During Development**
   ```bash
   # View current tasks
   node scripts/update-progress.js list
   
   # Add development notes
   node scripts/update-progress.js note "Successfully tested Alpha Vantage API"
   ```

3. **Complete a Task**
   ```bash
   # Mark task as complete
   node scripts/update-progress.js complete "phase1-research"
   
   # Commit your changes
   git add .
   git commit -m "feat: implement stock price API research and selection"
   git push
   ```

---

## 📁 Project Structure

```
jmfinance/
├── src/
│   ├── app/              # Next.js app router
│   │   ├── page.tsx      # Main dashboard
│   │   ├── layout.tsx    # Root layout
│   │   └── globals.css   # Global styles
│   ├── components/       # Reusable components
│   │   └── ui/          # shadcn/ui components
│   ├── data/            # Data layer
│   │   ├── portfolio.ts          # Demo data (public)
│   │   └── portfolio.personal.ts # Personal data (git-ignored)
│   └── lib/             # Utilities
├── scripts/             # Development scripts
│   └── update-progress.js # Progress tracking script
├── ROADMAP.md          # Strategic development plan
├── PROGRESS.md         # Current progress tracking
└── DEV-GUIDE.md       # This file
```

---

## 🔧 Development Commands

### Essential Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Update progress
node scripts/update-progress.js [command] [task-id]
```

### Progress Tracking Commands
```bash
# List all available tasks
node scripts/update-progress.js list

# Start working on a task
node scripts/update-progress.js start "phase1-stock-api"

# Complete a task
node scripts/update-progress.js complete "phase1-stock-api"

# Add a development note
node scripts/update-progress.js note "API integration successful"
```

---

## 🎯 Current Phase: Data Automation Foundation

### **This Week's Focus**
1. **API Research & Selection** (Priority 1)
   - Compare stock price APIs
   - Test free tier limitations
   - Document API capabilities

2. **Database Planning** (Priority 2)
   - Design database schema
   - Plan migration strategy
   - Set up development environment

### **Key Files to Modify**
- `src/data/portfolio.ts` - Add API integration
- `src/lib/` - Create API services
- Database migration files
- Environment configuration

---

## 🔌 API Integration Workflow

### 1. Research Phase
```bash
# Start the research task
node scripts/update-progress.js start "phase1-research"

# Test APIs in browser/Postman
# Document findings in research notes
# Make selection decision

# Complete research
node scripts/update-progress.js complete "phase1-research"
```

### 2. Implementation Phase
```bash
# Start implementation
node scripts/update-progress.js start "phase1-stock-api"

# Install dependencies
npm install axios dotenv

# Create API service files
mkdir src/services
touch src/services/stockApi.ts
touch src/services/priceUpdater.ts

# Implement and test
# Complete implementation
node scripts/update-progress.js complete "phase1-stock-api"
```

---

## 🗄️ Database Migration Workflow

### Current State: Static Data
```typescript
// src/data/portfolio.ts
export const portfolioData: PortfolioAsset[] = [...];
```

### Target State: Database-Driven
```typescript
// src/services/portfolioService.ts
export async function getPortfolioData(userId: string): Promise<PortfolioAsset[]>
export async function updateAssetPrice(assetId: string, price: number): Promise<void>
```

### Migration Steps
1. **Database Setup**
   ```bash
   node scripts/update-progress.js start "phase1-db-setup"
   # Set up Supabase/PostgreSQL
   # Configure connection
   ```

2. **Schema Design**
   ```bash
   node scripts/update-progress.js start "phase1-schema"
   # Create tables: users, portfolios, assets, price_history
   # Define relationships and indexes
   ```

3. **Data Migration**
   ```bash
   node scripts/update-progress.js start "phase1-migration"
   # Create migration script
   # Test with demo data
   # Migrate personal data
   ```

---

## 🧪 Testing Strategy

### Manual Testing Checklist
- [ ] Dashboard loads with demo data
- [ ] All charts render correctly
- [ ] Privacy toggle works
- [ ] Responsive design on mobile
- [ ] Dark mode styling consistent

### API Testing
- [ ] API keys work in development
- [ ] Rate limiting handled gracefully
- [ ] Error responses handled
- [ ] Price updates reflect in UI

### Database Testing
- [ ] Connection successful
- [ ] CRUD operations work
- [ ] Data migration successful
- [ ] Performance acceptable

---

## 🔍 Debugging Tips

### Common Issues
1. **API Rate Limits**
   ```bash
   # Check API response headers
   # Implement request queuing
   # Add fallback providers
   ```

2. **Database Connection**
   ```bash
   # Verify environment variables
   # Check network connectivity
   # Review database logs
   ```

3. **UI Updates Not Reflecting**
   ```bash
   # Clear browser cache
   # Check React state updates
   # Verify data flow
   ```

---

## 📊 Performance Monitoring

### Key Metrics to Track
- **API Response Times**: < 2 seconds
- **Database Query Times**: < 500ms
- **Page Load Speed**: < 3 seconds
- **Bundle Size**: Keep under 2MB

### Monitoring Tools
- Browser DevTools Network tab
- React DevTools Profiler
- Database query analyzers
- Lighthouse performance audits

---

## 🔐 Security Considerations

### API Key Management
```bash
# Never commit API keys
echo "ALPHA_VANTAGE_API_KEY=your_key" >> .env.local
echo "COINGECKO_API_KEY=your_key" >> .env.local

# Use environment variables
const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
```

### Database Security
- Use parameterized queries
- Implement rate limiting
- Enable audit logging
- Regular security updates

---

## 🎨 UI Development Guidelines

### Design Principles
- **Dark Mode First**: Optimize for dark theme
- **Mobile Responsive**: Design for mobile, enhance for desktop
- **Financial Clarity**: Numbers should be easily readable
- **Privacy Aware**: Easy to hide sensitive data

### Component Usage
```typescript
// Use existing shadcn/ui components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Maintain consistent styling
className="flex items-center gap-2 text-muted-foreground"
```

---

## 📝 Documentation Standards

### Code Comments
```typescript
/**
 * Updates asset prices from external API
 * @param assets Array of assets to update
 * @returns Promise resolving to updated assets
 */
async function updateAssetPrices(assets: PortfolioAsset[]): Promise<PortfolioAsset[]>
```

### Commit Messages
```bash
# Format: type(scope): description
feat(api): add Alpha Vantage stock price integration
fix(ui): resolve mobile responsive chart overflow
docs(readme): update API setup instructions
```

---

## 🔄 Release Process

### Development Flow
1. Work on feature branch
2. Test locally with development data
3. Update progress tracking
4. Create pull request
5. Merge to main
6. Deploy to production

### Version Management
- **Major**: Breaking changes (1.0.0 → 2.0.0)
- **Minor**: New features (1.0.0 → 1.1.0)
- **Patch**: Bug fixes (1.0.0 → 1.0.1)

---

*Happy coding! 🚀*