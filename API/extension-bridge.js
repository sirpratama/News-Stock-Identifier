// Extension API Bridge - Express server to connect browser extension with Gemini + Finance APIs
import express from 'express';
import cors from 'cors';
import { getGeminiAnalysis, setCurrentArticleText } from './gemini-api.js';
import yahooFinance from 'yahoo-finance2';

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Store article text temporarily for API processing
let currentArticleText = '';

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Extension API Bridge is running' });
});

// Analyze article endpoint
app.post('/analyze', async (req, res) => {
    try {
        const { articleText } = req.body;
        
        if (!articleText || articleText.length < 100) {
            return res.status(400).json({ 
                error: 'Article text is required and must be at least 100 characters' 
            });
        }

        console.log(`📄 Received article for analysis (${articleText.length} characters)`);
        
        // Store article text for Gemini API to use
        currentArticleText = articleText;
        setCurrentArticleText(articleText);
        
        // Get Gemini analysis
        console.log('🤖 Calling Gemini API...');
        const geminiResponse = await getGeminiAnalysis();
        
        // Parse Gemini response (handle markdown code blocks)
        let stockAnalysis;
        try {
            // Clean the response - remove markdown code blocks if present
            let cleanResponse = geminiResponse.trim();
            
            // Remove ```json and ``` markers if present
            if (cleanResponse.startsWith('```json')) {
                cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
            } else if (cleanResponse.startsWith('```')) {
                cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
            }
            
            // Additional cleanup for any remaining markdown
            cleanResponse = cleanResponse.trim();
            
            console.log('🧹 Cleaned Gemini response:', cleanResponse.substring(0, 200) + '...');
            
            stockAnalysis = JSON.parse(cleanResponse);
            console.log('✅ Successfully parsed JSON with', stockAnalysis.length, 'companies');
            
        } catch (parseError) {
            console.error('❌ Error parsing Gemini response:', parseError);
            console.log('📄 Raw response:', geminiResponse.substring(0, 500));
            return res.status(500).json({ 
                error: 'Failed to parse AI analysis',
                details: parseError.message,
                rawResponse: geminiResponse.substring(0, 200) + '...'
            });
        }

        // Extract unique stock symbols
        const symbols = [...new Set(stockAnalysis.map(item => item.stock_symbol))];
        console.log(`📈 Found ${symbols.length} stocks to analyze:`, symbols);

        // Get financial data for each stock
        const stocksWithFinancialData = [];
        
        for (const analysis of stockAnalysis) {
            try {
                console.log(`💰 Fetching financial data for ${analysis.stock_symbol}...`);
                
                const historicalData = await yahooFinance.historical(analysis.stock_symbol, {
                    period1: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
                    period2: new Date(), // today
                    interval: '1d'
                });

                const latestData = historicalData[historicalData.length - 1];
                const previousData = historicalData[historicalData.length - 2];
                
                // Calculate daily change
                const dailyChange = latestData && previousData ? 
                    ((latestData.close - previousData.close) / previousData.close * 100).toFixed(2) : 0;

                // Add financial data to analysis
                stocksWithFinancialData.push({
                    ...analysis,
                    financialData: {
                        currentPrice: latestData ? latestData.close.toFixed(2) : 'N/A',
                        dailyChange: dailyChange + '%',
                        volume: latestData ? latestData.volume.toLocaleString() : 'N/A',
                        weeklyHigh: Math.max(...historicalData.map(d => d.high)).toFixed(2),
                        weeklyLow: Math.min(...historicalData.map(d => d.low)).toFixed(2)
                    }
                });
                
            } catch (stockError) {
                console.error(`Error fetching data for ${analysis.stock_symbol}:`, stockError.message);
                
                // Add analysis without financial data
                stocksWithFinancialData.push({
                    ...analysis,
                    financialData: {
                        currentPrice: 'N/A',
                        dailyChange: 'N/A',
                        volume: 'N/A',
                        weeklyHigh: 'N/A',
                        weeklyLow: 'N/A'
                    }
                });
            }
        }

        console.log('✅ Analysis complete!');
        
        // Return combined analysis
        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            articleWordCount: articleText.split(/\s+/).length,
            totalCompanies: stocksWithFinancialData.length,
            analysis: stocksWithFinancialData
        });

    } catch (error) {
        console.error('Error in /analyze endpoint:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
});

// Get stock data endpoint (for individual stock lookup)
app.get('/stock/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        
        console.log(`📊 Fetching data for ${symbol}...`);
        
        const data = await yahooFinance.historical(symbol, {
            period1: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            period2: new Date(),
            interval: '1d'
        });

        const lastFiveEntries = data.slice(-5);
        
        res.json({
            symbol,
            data: lastFiveEntries,
            summary: {
                currentPrice: lastFiveEntries[lastFiveEntries.length - 1].close,
                volume: lastFiveEntries[lastFiveEntries.length - 1].volume,
                high: Math.max(...lastFiveEntries.map(d => d.high)),
                low: Math.min(...lastFiveEntries.map(d => d.low))
            }
        });

    } catch (error) {
        console.error(`Error fetching stock data for ${req.params.symbol}:`, error);
        res.status(500).json({ 
            error: 'Failed to fetch stock data',
            details: error.message 
        });
    }
});

// Start server
app.listen(port, () => {
    console.log(`🚀 Extension API Bridge running on http://localhost:${port}`);
    console.log(`📊 Ready to analyze articles and fetch stock data!`);
    console.log(`🔗 Endpoints:`);
    console.log(`   GET  /health - Health check`);
    console.log(`   POST /analyze - Analyze article`);
    console.log(`   GET  /stock/:symbol - Get stock data`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 Shutting down Extension API Bridge...');
    process.exit(0);
});

// Current article text is now passed directly to setCurrentArticleText in gemini-api.js 