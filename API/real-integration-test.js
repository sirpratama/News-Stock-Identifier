import yahooFinance from 'yahoo-finance2';

// This simulates the real getGeminiAnalysis function for testing
async function getGeminiAnalysis() {
    console.log('🤖 Calling Gemini API (simulated)...\n');
    
    // Simulate API processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return the same format as real Gemini API would
    const mockResponse = `[
  {
    "company_name": "Bank Central Asia Tbk",
    "stock_symbol": "BBCA.JK",
    "sentiment": "Positive",
    "impact": "4",
    "reasoning": "Indonesian bank positioned to benefit significantly from expanded collaboration with fintech lending platforms and increased credit distribution to UMKM sector.",
    "recommendation": "BUY"
  },
  {
    "company_name": "Bank Rakyat Indonesia Tbk",
    "stock_symbol": "BBRI.JK", 
    "sentiment": "Positive",
    "impact": "4",
    "reasoning": "Major Indonesian bank with strong UMKM lending focus likely to capitalize on growing fintech partnerships and regulatory support.",
    "recommendation": "BUY"
  },
  {
    "company_name": "Bank Mandiri Tbk",
    "stock_symbol": "BMRI.JK",
    "sentiment": "Positive", 
    "impact": "3",
    "reasoning": "Large Indonesian bank expected to participate in increased fintech lending collaboration but with more measured exposure.",
    "recommendation": "HOLD"
  },
  {
    "company_name": "Bank Negara Indonesia Tbk",
    "stock_symbol": "BBNI.JK",
    "sentiment": "Positive",
    "impact": "3", 
    "reasoning": "State-owned bank likely to support government initiatives for financial inclusion through fintech partnerships.",
    "recommendation": "HOLD"
  }
]`;
    
    console.log('📊 Gemini API Response Received');
    return mockResponse;
}

async function extractStockSymbols() {
    const geminiResponse = await getGeminiAnalysis();
    try {
        const stockAnalysis = JSON.parse(geminiResponse);
        console.log(`✅ Successfully parsed Gemini response`);
        console.log(`📈 Found ${stockAnalysis.length} companies to analyze\n`);
        
        return {
            symbols: [...new Set(stockAnalysis.map(item => item.stock_symbol))],
            analysis: stockAnalysis
        };
    } catch (error) {
        console.error('❌ Error parsing Gemini response:', error);
        return { symbols: [], analysis: [] };
    }
}

async function getHistoricalData(symbol, days = 30) {
    return await yahooFinance.historical(symbol, {
        period1: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
        period2: new Date(),
        interval: '1d'
    });
}

async function generateReport(symbols, analysis) {
    console.log('\n' + '='.repeat(100));
    console.log('📋 INVESTMENT ANALYSIS REPORT');
    console.log('='.repeat(100));
    
    for (const symbol of symbols) {
        try {
            console.log(`\n🏦 ANALYZING: ${symbol}`);
            console.log('-'.repeat(80));
            
            const data = await getHistoricalData(symbol, 14); // Get 2 weeks of data
            const lastFiveEntries = data.slice(-5);
            const analysisItem = analysis.find(item => item.stock_symbol === symbol);
            
            // Stock performance calculations
            const latestPrice = lastFiveEntries[lastFiveEntries.length - 1].close;
            const oldestPrice = lastFiveEntries[0].close;
            const weeklyChange = ((latestPrice - oldestPrice) / oldestPrice * 100).toFixed(2);
            const avgVolume = lastFiveEntries.reduce((sum, entry) => sum + entry.volume, 0) / lastFiveEntries.length;
            
            // Display company info
            if (analysisItem) {
                console.log(`🏢 Company: ${analysisItem.company_name}`);
                console.log(`💰 Current Price: ${latestPrice.toFixed(0)} IDR`);
                console.log(`📈 5-Day Change: ${weeklyChange}%`);
                console.log(`📊 Avg Volume: ${avgVolume.toLocaleString()}`);
                console.log('');
                
                // AI Analysis
                console.log('🤖 AI ANALYSIS:');
                console.log(`   Sentiment: ${analysisItem.sentiment}`);
                console.log(`   Impact Score: ${analysisItem.impact}/5`);
                console.log(`   Recommendation: ${analysisItem.recommendation}`);
                console.log(`   Reasoning: ${analysisItem.reasoning}`);
                console.log('');
            }
            
            // Historical data table
            console.log('📅 RECENT TRADING DATA:');
            console.log('Date\t\tOpen\t\tClose\t\tVolume\t\tDaily Change%');
            console.log('-'.repeat(70));
            
            lastFiveEntries.forEach((entry, index) => {
                const date = entry.date.toISOString().split('T')[0];
                const dailyChange = index > 0 ? 
                    (((entry.close - lastFiveEntries[index-1].close) / lastFiveEntries[index-1].close) * 100).toFixed(2) : 
                    '0.00';
                console.log(`${date}\t${entry.open.toFixed(0)}\t\t${entry.close.toFixed(0)}\t\t${entry.volume.toLocaleString()}\t${dailyChange}%`);
            });
            
            // Risk assessment
            console.log('\n🎯 RISK ASSESSMENT:');
            const volatility = Math.abs(parseFloat(weeklyChange));
            let riskLevel = 'Low';
            if (volatility > 5) riskLevel = 'High';
            else if (volatility > 2) riskLevel = 'Medium';
            
            console.log(`   Volatility: ${riskLevel} (${Math.abs(weeklyChange)}% weekly change)`);
            console.log(`   Volume Trend: ${avgVolume > 100000000 ? 'High' : avgVolume > 50000000 ? 'Medium' : 'Low'} Trading Activity`);
            
        } catch (error) {
            console.error(`❌ Error analyzing ${symbol}:`, error.message);
        }
    }
    
    console.log('\n' + '='.repeat(100));
    console.log('✅ ANALYSIS COMPLETE');
    console.log(`📊 Total Stocks Analyzed: ${symbols.length}`);
    console.log('🤖 Powered by Gemini AI + Yahoo Finance');
    console.log('='.repeat(100));
}

async function main() {
    console.log('🚀 NEWS STOCK IDENTIFIER - REAL INTEGRATION TEST');
    console.log('=' .repeat(60));
    console.log('📰 Analyzing Indonesian Banking & Fintech News');
    console.log('🔍 AI-Powered Stock Discovery & Analysis\n');
    
    const { symbols, analysis } = await extractStockSymbols();
    
    if (symbols.length === 0) {
        console.log('❌ No stock symbols found. Analysis failed.');
        return;
    }
    
    console.log(`🎯 Target Stocks: ${symbols.join(', ')}`);
    console.log('🔄 Fetching real-time market data...\n');
    
    await generateReport(symbols, analysis);
}

main().catch(console.error); 