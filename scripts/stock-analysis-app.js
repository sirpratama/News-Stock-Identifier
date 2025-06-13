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
            const response = await fetch(`${this.apiBaseUrl}/health`);
            if (response.ok) {
                console.log('✅ API connection successful');
            }
        } catch (error) {
            console.warn('⚠️ API connection failed, will use fallback simulation');
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

    // Generate mock analysis based on content
    generateMockAnalysis(content) {
        const contentLower = content.toLowerCase();
        const companies = [];
        
        // Check for banking/finance keywords and generate relevant companies
        if (contentLower.includes('bank') || contentLower.includes('fintech')) {
            companies.push(
                {
                    company_name: "Bank Central Asia Tbk",
                    stock_symbol: "BBCA.JK",
                    sentiment: "Positive",
                    impact: "4",
                    reasoning: "Indonesian bank positioned to benefit from fintech collaboration trends mentioned in the article.",
                    recommendation: "BUY"
                },
                {
                    company_name: "Bank Rakyat Indonesia Tbk",
                    stock_symbol: "BBRI.JK",
                    sentiment: "Positive",
                    impact: "3",
                    reasoning: "Major Indonesian bank likely to participate in the banking sector developments discussed.",
                    recommendation: "BUY"
                }
            );
        }

        if (contentLower.includes('ekonomi') || contentLower.includes('keuangan')) {
            companies.push({
                company_name: "Bank Mandiri Tbk",
                stock_symbol: "BMRI.JK",
                sentiment: "Neutral",
                impact: "2",
                reasoning: "Large bank with moderate exposure to economic trends mentioned in the article.",
                recommendation: "HOLD"
            });
        }

        // Add technology companies if relevant
        if (contentLower.includes('teknologi') || contentLower.includes('digital')) {
            companies.push({
                company_name: "GoTo Gojek Tokopedia Tbk",
                stock_symbol: "GOTO.JK",
                sentiment: "Positive",
                impact: "3",
                reasoning: "Indonesian tech platform potentially impacted by digital economy trends discussed.",
                recommendation: "BUY"
            });
        }

        // Fallback companies if none detected
        if (companies.length === 0) {
            companies.push({
                company_name: "Bank Central Asia Tbk",
                stock_symbol: "BBCA.JK",
                sentiment: "Neutral",
                impact: "2",
                reasoning: "General market impact from economic news discussed in the article.",
                recommendation: "HOLD"
            });
        }

        return companies;
    }

    // Real API call method
    async callRealAPI(articleContent) {
        try {
            console.log('🌐 Calling real API with article content...');
            
            const response = await fetch(`${this.apiBaseUrl}/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    articleText: articleContent
                })
            });

            if (!response.ok) {
                throw new Error(`API call failed: ${response.status}`);
            }

            const result = await response.json();
            console.log('✅ Real API response received:', result);
            
            // Return just the analysis array for the UI
            return result.analysis || result;
            
        } catch (error) {
            console.error('❌ Real API call failed:', error);
            
            // Fallback to simulation only if API is down
            console.log('🔄 Falling back to simulation...');
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