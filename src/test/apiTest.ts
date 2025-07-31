/**
 * Simple test script to verify Alpha Vantage API integration
 * Run with: npx tsx src/test/apiTest.ts
 */

import { alphaVantageService } from '../services/alphaVantageService';

async function testAlphaVantageAPI() {
  console.log('🧪 Testing Alpha Vantage API Integration...\n');

  try {
    // Test 1: API Connection
    console.log('1️⃣ Testing API connection...');
    const isConnected = await alphaVantageService.testConnection();
    console.log(`   Connection: ${isConnected ? '✅ SUCCESS' : '❌ FAILED'}\n`);

    if (!isConnected) {
      console.log('❌ API connection failed. Please check your API key in .env.local');
      return;
    }

    // Test 2: Single Stock Quote
    console.log('2️⃣ Testing single stock quote (SPY)...');
    const spyQuote = await alphaVantageService.getQuote('SPY');
    console.log('   Result:', {
      success: spyQuote.success,
      symbol: spyQuote.symbol,
      price: spyQuote.price,
      fromCache: spyQuote.fromCache,
      error: spyQuote.error
    });
    console.log('');

    // Test 3: Multiple Stock Quotes
    console.log('3️⃣ Testing multiple stock quotes (SPY, VTI)...');
    const multipleQuotes = await alphaVantageService.getMultipleQuotes(['SPY', 'VTI']);
    multipleQuotes.forEach(quote => {
      console.log(`   ${quote.symbol}: ${quote.success ? '✅' : '❌'} $${quote.price || 'N/A'} ${quote.fromCache ? '(cached)' : '(fresh)'}`);
    });
    console.log('');

    // Test 4: Cache Status
    console.log('4️⃣ Cache status:');
    const cacheStatus = alphaVantageService.getCacheStatus();
    cacheStatus.forEach(status => {
      console.log(`   ${status.symbol}: ${status.isValid ? '✅ Valid' : '❌ Invalid'} (cached at ${status.cachedAt.toLocaleTimeString()})`);
    });
    console.log('');

    console.log('🎉 API integration test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testAlphaVantageAPI();

export { testAlphaVantageAPI };