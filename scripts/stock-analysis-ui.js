// Stock Analysis UI Component for Browser Extension
class StockAnalysisUI {
    constructor() {
        this.container = null;
        this.isVisible = false;
        this.analysisData = null;
    }

    // Create the floating UI widget
    createWidget() {
        // Remove existing widget if present
        this.removeWidget();

        // Create main container
        this.container = document.createElement('div');
        this.container.id = 'stock-analysis-widget';
        this.container.innerHTML = `
            <div class="stock-widget-header">
                <div class="widget-title">
                    📈 Stock Impact Analysis
                </div>
                <div class="widget-controls">
                    <button class="minimize-btn" title="Minimize">−</button>
                    <button class="close-btn" title="Close">×</button>
                </div>
            </div>
            <div class="stock-widget-content">
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <p>Analyzing article for stock impacts...</p>
                </div>
            </div>
        `;

        // Add styles
        this.addStyles();

        // Add event listeners
        this.addEventListeners();

        // Append to body
        document.body.appendChild(this.container);
        
        // Make it draggable
        this.makeDraggable();
        
        this.isVisible = true;
    }

    // Display the analysis results
    displayResults(analysisData) {
        this.analysisData = analysisData;
        
        if (!analysisData || analysisData.length === 0) {
            this.showError('No stock impacts found in this article.');
            return;
        }

        const content = this.container.querySelector('.stock-widget-content');
        content.innerHTML = `
            <div class="analysis-summary">
                <h3>🎯 Affected Companies (${analysisData.length})</h3>
                <div class="companies-list">
                    ${analysisData.map((company, index) => this.createCompanyCard(company, index)).join('')}
                </div>
            </div>
        `;

        // Add expand/collapse functionality
        this.addExpandFunctionality();
    }

    // Create individual company card
    createCompanyCard(company, index) {
        const impactColor = this.getImpactColor(company.impact);
        const recommendationIcon = this.getRecommendationIcon(company.recommendation);
        
        return `
            <div class="company-card" data-company-index="${index}">
                <div class="company-summary">
                    <div class="company-symbol">
                        <span class="symbol-text">${company.stock_symbol}</span>
                        <span class="impact-badge" style="background-color: ${impactColor}">
                            ${company.impact}/5
                        </span>
                    </div>
                    <div class="company-recommendation">
                        <span class="rec-icon">${recommendationIcon}</span>
                        <span class="rec-text">${company.recommendation}</span>
                    </div>
                    <button class="expand-btn" data-company="${index}">
                        <span class="expand-icon">▼</span>
                        Details
                    </button>
                </div>
                
                <div class="company-details" data-details="${index}" style="display: none;">
                    <div class="detail-row">
                        <strong>🏢 Company:</strong>
                        <span>${company.company_name}</span>
                    </div>
                    <div class="detail-row">
                        <strong>😊 Sentiment:</strong>
                        <span class="sentiment-${company.sentiment.toLowerCase()}">${company.sentiment}</span>
                    </div>
                    <div class="detail-row">
                        <strong>💡 Reasoning:</strong>
                        <span class="reasoning-text">${company.reasoning}</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Get color based on impact score
    getImpactColor(impact) {
        const score = parseInt(impact);
        if (score >= 4) return '#e74c3c'; // High impact - red
        if (score >= 3) return '#f39c12'; // Medium impact - orange
        return '#27ae60'; // Low impact - green
    }

    // Get icon based on recommendation
    getRecommendationIcon(recommendation) {
        switch (recommendation.toUpperCase()) {
            case 'BUY': return '📈';
            case 'SELL': return '📉';
            case 'HOLD': return '⏸️';
            default: return '❓';
        }
    }

    // Add expand/collapse functionality
    addExpandFunctionality() {
        const expandButtons = this.container.querySelectorAll('.expand-btn');
        
        expandButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const companyIndex = button.getAttribute('data-company');
                const details = this.container.querySelector(`[data-details="${companyIndex}"]`);
                const icon = button.querySelector('.expand-icon');
                
                if (details.style.display === 'none') {
                    details.style.display = 'block';
                    icon.textContent = '▲';
                    button.classList.add('expanded');
                } else {
                    details.style.display = 'none';
                    icon.textContent = '▼';
                    button.classList.remove('expanded');
                }
            });
        });
    }

    // Show error message
    showError(message) {
        const content = this.container.querySelector('.stock-widget-content');
        content.innerHTML = `
            <div class="error-state">
                <div class="error-icon">⚠️</div>
                <p>${message}</p>
                <button class="retry-btn">Try Again</button>
            </div>
        `;

        // Add retry functionality
        const retryBtn = content.querySelector('.retry-btn');
        retryBtn.addEventListener('click', () => {
            window.stockAnalysisApp?.analyzeCurrentPage();
        });
    }

    // Add event listeners
    addEventListeners() {
        const minimizeBtn = this.container.querySelector('.minimize-btn');
        const closeBtn = this.container.querySelector('.close-btn');

        minimizeBtn.addEventListener('click', () => this.toggleMinimize());
        closeBtn.addEventListener('click', () => this.removeWidget());
    }

    // Toggle minimize state
    toggleMinimize() {
        const content = this.container.querySelector('.stock-widget-content');
        const minimizeBtn = this.container.querySelector('.minimize-btn');
        
        if (content.style.display === 'none') {
            content.style.display = 'block';
            minimizeBtn.textContent = '−';
            this.container.classList.remove('minimized');
        } else {
            content.style.display = 'none';
            minimizeBtn.textContent = '+';
            this.container.classList.add('minimized');
        }
    }

    // Make widget draggable
    makeDraggable() {
        const header = this.container.querySelector('.stock-widget-header');
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        header.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);

        function dragStart(e) {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;

            if (e.target === header || header.contains(e.target)) {
                isDragging = true;
            }
        }

        function drag(e) {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;

                xOffset = currentX;
                yOffset = currentY;

                setTranslate(currentX, currentY, this.container);
            }
        }

        function dragEnd(e) {
            initialX = currentX;
            initialY = currentY;
            isDragging = false;
        }

        function setTranslate(xPos, yPos, el) {
            el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
        }
    }

    // Remove widget
    removeWidget() {
        if (this.container) {
            this.container.remove();
            this.container = null;
            this.isVisible = false;
        }
    }

    // Add CSS styles
    addStyles() {
        if (document.getElementById('stock-analysis-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'stock-analysis-styles';
        styles.textContent = `
            #stock-analysis-widget {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 350px;
                max-height: 80vh;
                background: #ffffff;
                border: 1px solid #e0e0e0;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
                z-index: 10000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
                overflow: hidden;
                backdrop-filter: blur(10px);
            }

            .stock-widget-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 12px 16px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                cursor: move;
                user-select: none;
            }

            .widget-title {
                font-weight: 600;
                font-size: 15px;
            }

            .widget-controls {
                display: flex;
                gap: 8px;
            }

            .minimize-btn, .close-btn {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background-color 0.2s;
            }

            .minimize-btn:hover, .close-btn:hover {
                background: rgba(255, 255, 255, 0.3);
            }

            .stock-widget-content {
                padding: 16px;
                max-height: 60vh;
                overflow-y: auto;
            }

            .loading-state {
                text-align: center;
                padding: 20px;
                color: #666;
            }

            .loading-spinner {
                width: 32px;
                height: 32px;
                border: 3px solid #f3f3f3;
                border-top: 3px solid #667eea;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 12px;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .analysis-summary h3 {
                margin: 0 0 16px 0;
                color: #333;
                font-size: 16px;
            }

            .companies-list {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .company-card {
                border: 1px solid #e8e8e8;
                border-radius: 8px;
                overflow: hidden;
                transition: all 0.2s ease;
            }

            .company-card:hover {
                border-color: #667eea;
                box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
            }

            .company-summary {
                padding: 12px;
                background: #fafafa;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
            }

            .company-symbol {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .symbol-text {
                font-weight: 700;
                color: #333;
                font-size: 15px;
            }

            .impact-badge {
                color: white;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
            }

            .company-recommendation {
                display: flex;
                align-items: center;
                gap: 4px;
                font-weight: 600;
            }

            .rec-text {
                color: #333;
            }

            .expand-btn {
                background: #667eea;
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 12px;
                display: flex;
                align-items: center;
                gap: 4px;
                transition: background-color 0.2s;
            }

            .expand-btn:hover {
                background: #5a67d8;
            }

            .expand-btn.expanded {
                background: #38a169;
            }

            .company-details {
                padding: 16px;
                background: white;
                border-top: 1px solid #e8e8e8;
            }

            .detail-row {
                margin-bottom: 12px;
                display: flex;
                flex-direction: column;
                gap: 4px;
            }

            .detail-row:last-child {
                margin-bottom: 0;
            }

            .detail-row strong {
                color: #555;
                font-size: 13px;
            }

            .sentiment-positive { color: #38a169; font-weight: 600; }
            .sentiment-negative { color: #e53e3e; font-weight: 600; }
            .sentiment-neutral { color: #718096; font-weight: 600; }

            .reasoning-text {
                color: #666;
                line-height: 1.4;
                font-style: italic;
            }

            .error-state {
                text-align: center;
                padding: 20px;
                color: #666;
            }

            .error-icon {
                font-size: 32px;
                margin-bottom: 12px;
            }

            .retry-btn {
                background: #667eea;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                margin-top: 12px;
                transition: background-color 0.2s;
            }

            .retry-btn:hover {
                background: #5a67d8;
            }

            #stock-analysis-widget.minimized {
                height: auto;
            }
        `;

        document.head.appendChild(styles);
    }
}

// Make StockAnalysisUI available globally
window.StockAnalysisUI = StockAnalysisUI; 