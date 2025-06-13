import { getGeminiAnalysis } from './gemini-api.js';
import yahooFinance from 'yahoo-finance2';

async function extractStockSymbols() {
    const geminiResponse = await getGeminiAnalysis();
    try {
        const stockAnalysis = JSON.parse(geminiResponse);
        return {
            symbols: [...new Set(stockAnalysis.map(item => item.stock_symbol))],
            analysis: stockAnalysis
        };
    } catch (error) {
        console.error('Error parsing Gemini response:', error);
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

async function main() {
    const { symbols, analysis } = await extractStockSymbols();
    
    for (const symbol of symbols) {
        try {
            const data = await getHistoricalData(symbol);
            const lastFiveEntries = data.slice(-5);
            
            // Display the data as shown above
            console.log(`\n${symbol} Historical Data:`);
            console.log('Name\t\tDate\t\tOpen\t\tClose\t\tVolume');
            console.log('='.repeat(60));
            lastFiveEntries.forEach(entry => {
                const date = entry.date.toISOString().split('T')[0];
                console.log(`${symbol}\t${date}\t${entry.open.toFixed(2)}\t\t${entry.close.toFixed(2)}\t\t${entry.volume}`);
            });
            
            // Also show the sentiment and recommendation from Gemini
            const analysisItem = analysis.find(item => item.stock_symbol === symbol);
            if (analysisItem) {
                console.log(`\nGemini Analysis for ${symbol}:`);
                console.log(`Company: ${analysisItem.company_name}`);
                console.log(`Sentiment: ${analysisItem.sentiment}`);
                console.log(`Impact: ${analysisItem.impact}/5`);
                console.log(`Recommendation: ${analysisItem.recommendation}`);
                console.log(`Reasoning: ${analysisItem.reasoning}`);
            }
            
            console.log('\n' + '='.repeat(80));
            
        } catch (error) {
            console.error(`Error fetching ${symbol}:`, error.message);
        }
    }
}

main();