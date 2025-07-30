# JM Finance Dashboard

A sleek, minimalistic dark mode finance dashboard built with Next.js, shadcn/ui, and Recharts. This dashboard provides a comprehensive view of your personal finance portfolio with beautiful visualizations and real-time data insights.

## Features

### 🎨 Design
- **Dark Mode First**: Beautiful dark theme optimized for financial data visualization
- **Minimalistic**: Clean, uncluttered interface focusing on essential information
- **Responsive**: Fully responsive design that works on all devices
- **Modern UI**: Built with shadcn/ui components for consistent, professional styling

### 📊 Portfolio Overview
- **Total Portfolio Value**: Prominent display of your total net worth
- **Asset Count**: Track number of assets and accounts
- **Privacy Toggle**: Hide/show financial values for privacy
- **Last Updated**: Track when your data was last refreshed

### 📈 Key Metrics
- **Liquid Assets**: Quick view of easily accessible funds
- **Crypto Holdings**: Total cryptocurrency portfolio value
- **Real Estate**: Private real estate investments
- **Stocks**: Traditional stock market investments

### 🎯 Visualizations
- **Asset Type Breakdown**: Pie chart showing portfolio allocation by asset type
- **Liquidity Analysis**: Progress bars for liquid vs illiquid assets
- **Allocation Charts**: Bar charts for detailed asset type analysis
- **Interactive Tables**: Complete asset listing with filtering and sorting

### 🔒 Privacy Features
- **Value Hiding**: Toggle to hide all financial values for screenshots or shared screens
- **Secure Display**: No sensitive data stored in browser storage

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with shadcn/ui components
- **Charts**: Recharts for beautiful data visualizations
- **Icons**: Lucide React for consistent iconography
- **TypeScript**: Full type safety throughout the application

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd jmfinance
```

2. Install dependencies:
```bash
npm install
```

3. **Set up your personal data** (optional):
   - Copy your portfolio data to `src/data/portfolio.personal.ts`
   - Use the same format as shown in `src/data/portfolio.ts`
   - This file is automatically ignored by git for privacy

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Data Privacy

This project is designed with privacy in mind:

- **Demo Data**: The repository includes demo/sample data that's safe to share publicly
- **Personal Data**: Your actual financial data should go in `portfolio.personal.ts` (git-ignored)
- **Environment-Based Loading**: 
  - Development: Uses your personal data if available, otherwise demo data
  - Production: Always uses demo data for security

### Setting Up Your Personal Data

1. Create `src/data/portfolio.personal.ts`:
```typescript
import { PortfolioAsset } from './portfolio';

export const personalPortfolioData: PortfolioAsset[] = [
  // Your actual portfolio data here
  {
    accountName: "Your Bank",
    actualAsset: "USD",
    // ... rest of your data
  }
];
```

2. The dashboard will automatically use your data in development mode

### Building for Production

```bash
npm run build
npm start
```

## Portfolio Data Structure

The dashboard uses a structured data format for portfolio assets:

```typescript
interface PortfolioAsset {
  accountName: string;        // Account or institution name
  actualAsset: string;        // Specific asset name
  underlyingAsset: string;    // Broader asset category
  stage: 'UNLOCKED' | 'LOCKED' | 'RETIREMENT';
  liquidity: 'LIQUID' | 'ILLIQUID';
  type: 'PHYSICAL ASSET' | 'USD' | 'BONDS' | 'PRIVATE REAL ESTATE' | 'CRYPTO' | 'STOCKS';
  amount: number;             // Current value in USD
  shareAmount: number;        // Number of shares/units
  sharePrice: number;         // Price per share/unit
  percentageOfTotal: number;  // Percentage of total portfolio
  notes: string;              // Additional notes
  updateDate: string;         // Last update date
  days: number;               // Days since last update
  status: 'ACTIVE' | 'DORMANT';
  interestRate?: number;      // Interest rate if applicable
  heldBy: string;            // Institution holding the asset
  address?: string;           // Account number or address
  blockchain?: string;        // Blockchain for crypto assets
  url?: string;              // URL for additional info
}
```

## Customization

### Adding New Assets
Edit `src/data/portfolio.ts` to add or modify portfolio assets. The dashboard will automatically update all visualizations and calculations.

### Styling
The dashboard uses Tailwind CSS with shadcn/ui components. Customize colors and styling in:
- `src/app/globals.css` - Global styles and CSS variables
- `tailwind.config.js` - Tailwind configuration
- Individual component files for specific styling

### Charts and Visualizations
Modify chart configurations in the dashboard components:
- `src/app/page.tsx` - Main dashboard with all visualizations
- Chart colors and styling can be adjusted in the `COLORS` object

## Features in Detail

### Dashboard Sections

1. **Overview Tab**
   - Asset type breakdown pie chart
   - Liquidity vs illiquidity progress bars
   - Key portfolio metrics

2. **Allocation Tab**
   - Bar chart showing asset allocation
   - Detailed breakdown by asset type

3. **Liquidity Tab**
   - Pie chart of liquid vs illiquid assets
   - Quick liquidity analysis

4. **Assets Tab**
   - Complete table of all portfolio assets
   - Sortable and filterable data
   - Detailed asset information

### Privacy Controls
- Toggle button to hide/show all financial values
- Perfect for screenshots or shared screens
- Maintains layout and functionality while hiding sensitive data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or support, please open an issue in the repository.
