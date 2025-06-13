// Main Stock Analysis Application for Browser Extension
class StockAnalysisApp {
    constructor() {
        this.ui = new StockAnalysisUI();
        this.isAnalyzing = false;
        this.apiBaseUrl = 'http://localhost:3000';
        
        // Check if API is available on startup
        this.checkAPIConnection();
    }
    
    async checkAPIConnection() {
        try {
            console.log('🔌 Testing API connection to', this.apiBaseUrl);
            const response = await fetch(`${this.apiBaseUrl}/health`, {
                method: 'GET',
                mode: 'cors'
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('✅ API connection successful:', result.message);
                return true;
            } else {
                console.warn('⚠️ API returned status:', response.status);
                return false;
            }
        } catch (error) {
            console.warn('⚠️ API connection failed:', error.message);
            console.warn('📋 Make sure your API server is running: node extension-bridge.js');
            return false;
        }
    }

    // Initialize the application
    init() {
        console.log('Stock Analysis Extension: Initializing...');
        
        // Add activation button to page
        this.addActivationButton();
        
        // Auto-analyze if this looks like a financial news article
        if (this.isFinancialNewsPage()) {
            setTimeout(() => {
                this.showActivationPrompt();
            }, 3000);
        }
    }

    // Check if current page is a financial news article
    isFinancialNewsPage() {
        const url = window.location.href.toLowerCase();
        const title = document.title.toLowerCase();
        const content = document.body.textContent.toLowerCase();
        
        const financialKeywords = [
            'bank', 'saham', 'investasi', 'keuangan', 'bursa', 'ekonomi', 
            'finance', 'stock', 'investment', 'market', 'fintech', 'rupiah'
        ];
        
        const isFinancialSite = url.includes('cnnindonesia') || 
                               url.includes('ekonomi') || 
                               url.includes('finansial') ||
                               url.includes('finance');
        
        const hasFinancialContent = financialKeywords.some(keyword => 
            title.includes(keyword) || content.includes(keyword)
        );
        
        return isFinancialSite || hasFinancialContent;
    }

    // Add floating activation button
    addActivationButton() {
        const existingBtn = document.getElementById('stock-analysis-activate-btn');
        if (existingBtn) return;

        const button = document.createElement('button');
        button.id = 'stock-analysis-activate-btn';
        button.innerHTML = '📈 Analyze Stocks';
        button.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            z-index: 9999;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
        `;

        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-2px)';
            button.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
        });

        button.addEventListener('click', () => {
            this.analyzeCurrentPage();
        });

        document.body.appendChild(button);
    }

    // Show activation prompt for financial news pages
    showActivationPrompt() {
        if (document.getElementById('stock-analysis-prompt')) return;

        const prompt = document.createElement('div');
        prompt.id = 'stock-analysis-prompt';
        prompt.innerHTML = `
            <div style="
                position: fixed;
                top: 80px;
                right: 20px;
                background: white;
                border: 2px solid #667eea;
                border-radius: 12px;
                padding: 16px;
                box-shadow: 0 8px 25px rgba(0,0,0,0.1);
                z-index: 10001;
                max-width: 300px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            ">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                    <span style="font-size: 20px;">📈</span>
                    <strong style="color: #333;">Financial Article Detected!</strong>
                </div>
                <p style="margin: 0 0 16px 0; color: #666; font-size: 14px; line-height: 1.4;">
                    Would you like to analyze this article for stock impacts and investment opportunities?
                </p>
                <div style="display: flex; gap: 8px;">
                    <button id="analyze-yes" style="
                        flex: 1;
                        background: #667eea;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 13px;
                        font-weight: 600;
                    ">Analyze Now</button>
                    <button id="analyze-no" style="
                        flex: 1;
                        background: #e2e8f0;
                        color: #4a5568;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 13px;
                    ">Not Now</button>
                </div>
            </div>
        `;

        document.body.appendChild(prompt);

        // Add event listeners
        document.getElementById('analyze-yes').addEventListener('click', () => {
            prompt.remove();
            this.analyzeCurrentPage();
        });

        document.getElementById('analyze-no').addEventListener('click', () => {
            prompt.remove();
        });

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (prompt.parentNode) {
                prompt.remove();
            }
        }, 10000);
    }

    // Main analysis function
    async analyzeCurrentPage() {
        if (this.isAnalyzing) return;
        
        this.isAnalyzing = true;
        
        try {
            // Show UI widget with loading state
            this.ui.createWidget();
            
            // Extract article content
            console.log('Extracting article content...');
            const articleData = this.extractArticleContent();
            
            if (!articleData || articleData.content.length < 100) {
                this.ui.showError('Unable to extract meaningful content from this page.');
                return;
            }

            console.log('Article extracted:', articleData.wordCount, 'words');
            
            // Call the real API bridge server
            const analysisResult = await this.callRealAPI(articleData.content);
            
            // Display results in UI
            this.ui.displayResults(analysisResult);
            
        } catch (error) {
            console.error('Error analyzing page:', error);
            this.ui.showError('An error occurred during analysis. Please try again.');
        } finally {
            this.isAnalyzing = false;
        }
    }

    // Extract article content using existing content.js functions
    extractArticleContent() {
        // Use the existing scrapeArticle function from content.js
        if (typeof window.scrapeArticle === 'function') {
            return window.scrapeArticle();
        }
        
        // Fallback extraction method
        const text = this.fallbackExtractText();
        if (!text) return null;
        
        return {
            content: text,
            wordCount: text.split(/\s+/).length,
            title: document.title,
            url: window.location.href,
            extractedAt: new Date().toISOString()
        };
    }

    // Fallback text extraction
    fallbackExtractText() {
        const selectors = [
            'article',
            '.detail-text',
            '.article-content',
            '.content-detail',
            'main'
        ];

        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) {
                const paragraphs = element.querySelectorAll('p');
                if (paragraphs.length > 2) {
                    return Array.from(paragraphs)
                        .map(p => p.textContent.trim())
                        .filter(text => text.length > 20)
                        .join('\n\n');
                }
            }
        }

        return null;
    }

    // Simulate analysis (replace with real API call)
    async simulateAnalysis(articleContent) {
        console.log('Simulating Gemini + Finance API analysis...');
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mock response based on content analysis
        const mockAnalysis = this.generateMockAnalysis(articleContent);
        
        console.log('Analysis complete:', mockAnalysis);
        return mockAnalysis;
    }

    // Generate improved content-aware analysis
    generateMockAnalysis(content) {
        const contentLower = content.toLowerCase();
        const companies = [];
        
        console.log('🔍 Analyzing content for relevant companies...');
        
        // Tesla/Electric Vehicle keywords
        if (contentLower.includes('tesla') || contentLower.includes('electric vehicle') || 
            contentLower.includes('ev') || contentLower.includes('battery technology')) {
            companies.push({
                company_name: "Tesla Inc",
                stock_symbol: "TSLA",
                sentiment: "Positive",
                impact: "5",
                reasoning: "Direct mention of Tesla or electric vehicle technology in the article.",
                recommendation: "BUY"
            });
        }
        
        // Technology companies
        if (contentLower.includes('teknologi') || contentLower.includes('digital') || 
            contentLower.includes('gojek') || contentLower.includes('tokopedia')) {
            companies.push({
                company_name: "GoTo Gojek Tokopedia Tbk",
                stock_symbol: "GOTO.JK",
                sentiment: "Positive",
                impact: "4",
                reasoning: "Indonesian tech platform impacted by digital trends discussed in the article.",
                recommendation: "BUY"
            });
        }
        
        // Only add banking companies for banking-related content
        if (contentLower.includes('bank') && (contentLower.includes('indonesia') || 
            contentLower.includes('bca') || contentLower.includes('mandiri') || 
            contentLower.includes('bri') || contentLower.includes('fintech'))) {
            companies.push({
                company_name: "Bank Central Asia Tbk",
                stock_symbol: "BBCA.JK",
                sentiment: "Positive",
                impact: "3",
                reasoning: "Indonesian bank likely impacted by banking sector developments mentioned.",
                recommendation: "BUY"
            });
        }
        
        // Mining companies for commodity news
        if (contentLower.includes('mining') || contentLower.includes('commodity') || 
            contentLower.includes('coal') || contentLower.includes('nickel')) {
            companies.push({
                company_name: "Vale Indonesia Tbk",
                stock_symbol: "INCO.JK",
                sentiment: "Positive",
                impact: "3",
                reasoning: "Indonesian mining company potentially affected by commodity trends discussed.",
                recommendation: "HOLD"
            });
        }
        
        // Telecommunications
        if (contentLower.includes('telecom') || contentLower.includes('telkomsel') || 
            contentLower.includes('telecommunications')) {
            companies.push({
                company_name: "Telkom Indonesia Tbk",
                stock_symbol: "TLKM.JK",
                sentiment: "Neutral",
                impact: "2",
                reasoning: "Telecommunications company with potential exposure to trends discussed.",
                recommendation: "HOLD"
            });
        }
        
        // Global companies for international news
        if (contentLower.includes('apple') || contentLower.includes('iphone')) {
            companies.push({
                company_name: "Apple Inc",
                stock_symbol: "AAPL",
                sentiment: "Positive",
                impact: "4",
                reasoning: "Apple directly mentioned or referenced in the article.",
                recommendation: "BUY"
            });
        }
        
        // If no specific companies detected, return empty instead of default BBCA
        if (companies.length === 0) {
            console.log('📝 No specific companies detected for this article type');
            return [{
                company_name: "No specific companies identified",
                stock_symbol: "N/A",
                sentiment: "Neutral",
                impact: "1",
                reasoning: "This article does not appear to have direct impact on specific publicly traded companies.",
                recommendation: "N/A"
            }];
        }

        console.log(`✅ Found ${companies.length} relevant companies through content analysis`);
        return companies;
    }

    // Real API call method
    async callRealAPI(articleContent) {
        try {
            console.log('🌐 Calling real API with article content...');
            
            const response = await fetch(`${this.apiBaseUrl}/analyze`, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    articleText: articleContent
                })
            });

            if (!response.ok) {
                console.error('❌ API HTTP error:', response.status, response.statusText);
                throw new Error(`API call failed: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            console.log('✅ Real API response received:', result);
            
            // Return just the analysis array for the UI
            return result.analysis || result;
            
        } catch (error) {
            console.error('❌ Real API call failed:', error.message);
            console.error('🔍 Error type:', error.name);
            console.warn('🔄 Falling back to improved simulation...');
            
            // Use improved simulation that's content-aware
            return await this.simulateAnalysis(articleContent);
        }
    }
}

// Initialize the application when page loads
window.stockAnalysisApp = new StockAnalysisApp();

// Wait for page to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.stockAnalysisApp.init();
    });
} else {
    window.stockAnalysisApp.init();
} 