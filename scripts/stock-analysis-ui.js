// Stock Analysis UI Component for Browser Extension
class StockAnalysisUI {
    constructor() {
        this.container = null;
        this.isVisible = false;
        this.analysisData = null;
        this.chatHistory = [];
        this.isChatVisible = false;
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
                <div class="summary-header">
                    <h3>🎯 Affected Companies (${analysisData.length})</h3>
                    <button class="chat-toggle-btn" title="Ask AI about this analysis">💬 Chat</button>
                </div>
                <div class="companies-list">
                    ${analysisData.map((company, index) => this.createCompanyCard(company, index)).join('')}
                </div>
            </div>
            <div class="chat-section" style="display: none;">
                <div class="chat-header">
                    <h4>💬 Ask AI about this analysis</h4>
                    <button class="chat-close-btn">✕</button>
                </div>
                <div class="chat-messages" id="chat-messages"></div>
                <div class="chat-input-section">
                    <input type="text" class="chat-input" placeholder="Ask me anything about these stocks..." maxlength="500">
                    <button class="chat-send-btn">Send</button>
                </div>
            </div>
        `;

        // Add expand/collapse functionality
        this.addExpandFunctionality();
        
        // Add chat functionality
        this.addChatFunctionality();
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

    // Add chat functionality
    addChatFunctionality() {
        const chatToggleBtn = this.container.querySelector('.chat-toggle-btn');
        const chatCloseBtn = this.container.querySelector('.chat-close-btn');
        const chatSection = this.container.querySelector('.chat-section');
        const chatInput = this.container.querySelector('.chat-input');
        const chatSendBtn = this.container.querySelector('.chat-send-btn');
        const chatMessages = this.container.querySelector('#chat-messages');

        // Toggle chat visibility
        chatToggleBtn.addEventListener('click', () => {
            this.toggleChat();
        });

        chatCloseBtn.addEventListener('click', () => {
            this.toggleChat();
        });

        // Send message on button click
        chatSendBtn.addEventListener('click', () => {
            this.sendChatMessage();
        });

        // Send message on Enter key
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendChatMessage();
            }
        });

        // Initialize with a professional welcome message
        this.addChatMessage('assistant', 'I am an AI assistant, not a licensed financial advisor. The information I provide is for educational purposes only, based on an automated analysis of a specific news article. It should not be considered financial advice. Please consult with a qualified human professional before making any investment decisions.\n\nI can help you understand the stock analysis results. You may ask me to explain the analysis methodology, reasoning behind ratings, or clarify any terminology used in the report.');
    }

    // Toggle chat section
    toggleChat() {
        const chatSection = this.container.querySelector('.chat-section');
        const analysisSection = this.container.querySelector('.analysis-summary');
        
        if (this.isChatVisible) {
            chatSection.style.display = 'none';
            analysisSection.style.display = 'block';
            this.isChatVisible = false;
        } else {
            chatSection.style.display = 'block';
            analysisSection.style.display = 'none';
            this.isChatVisible = true;
            
            // Focus on input
            const chatInput = this.container.querySelector('.chat-input');
            setTimeout(() => chatInput.focus(), 100);
        }
    }

    // Send chat message
    async sendChatMessage() {
        const chatInput = this.container.querySelector('.chat-input');
        const message = chatInput.value.trim();
        
        if (!message) return;

        // Add user message to chat
        this.addChatMessage('user', message);
        chatInput.value = '';

        // Show typing indicator
        this.addTypingIndicator();

        try {
            // Call chat API
            const response = await fetch('http://localhost:3000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    conversationHistory: this.chatHistory
                })
            });

            const data = await response.json();
            
            // Remove typing indicator
            this.removeTypingIndicator();

            if (data.success) {
                this.addChatMessage('assistant', data.response);
            } else {
                this.addChatMessage('assistant', 'Sorry, I encountered an error. Please try again.');
            }

        } catch (error) {
            console.error('Chat error:', error);
            this.removeTypingIndicator();
            this.addChatMessage('assistant', 'Sorry, I\'m having trouble connecting to the AI service. Please make sure the API server is running.');
        }
    }

    // Add message to chat
    addChatMessage(role, content) {
        const chatMessages = this.container.querySelector('#chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${role}`;
        messageDiv.innerHTML = `
            <div class="message-content">
                ${content.replace(/\n/g, '<br>')}
            </div>
            <div class="message-time">${new Date().toLocaleTimeString()}</div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Store in history
        this.chatHistory.push({ role, content });
        
        // Keep only last 10 messages to avoid context getting too long
        if (this.chatHistory.length > 10) {
            this.chatHistory = this.chatHistory.slice(-10);
        }
    }

    // Add typing indicator
    addTypingIndicator() {
        const chatMessages = this.container.querySelector('#chat-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-message assistant typing-indicator';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Remove typing indicator
    removeTypingIndicator() {
        const typingIndicator = this.container.querySelector('#typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
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

            .summary-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
            }

            .analysis-summary h3 {
                margin: 0;
                color: #333;
                font-size: 16px;
            }

            .chat-toggle-btn {
                background: #667eea;
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 12px;
                transition: background-color 0.2s;
            }

            .chat-toggle-btn:hover {
                background: #5a67d8;
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

            /* Chat Styles */
            .chat-section {
                padding: 0;
                display: flex;
                flex-direction: column;
                height: 400px;
            }

            .chat-header {
                background: #667eea;
                color: white;
                padding: 12px 16px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid #e0e0e0;
            }

            .chat-header h4 {
                margin: 0;
                font-size: 14px;
                font-weight: 600;
            }

            .chat-close-btn {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                font-size: 16px;
                padding: 4px;
                border-radius: 4px;
                transition: background-color 0.2s;
            }

            .chat-close-btn:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            .chat-messages {
                flex: 1;
                overflow-y: auto;
                padding: 16px;
                display: flex;
                flex-direction: column;
                gap: 12px;
                background: #fafafa;
            }

            .chat-message {
                display: flex;
                flex-direction: column;
                gap: 4px;
                max-width: 85%;
            }

            .chat-message.user {
                align-self: flex-end;
            }

            .chat-message.assistant {
                align-self: flex-start;
            }

            .message-content {
                padding: 10px 14px;
                border-radius: 18px;
                line-height: 1.4;
                font-size: 13px;
            }

            .chat-message.user .message-content {
                background: #667eea;
                color: white;
                border-bottom-right-radius: 6px;
            }

            .chat-message.assistant .message-content {
                background: white;
                color: #333;
                border: 1px solid #e0e0e0;
                border-bottom-left-radius: 6px;
            }

            .message-time {
                font-size: 11px;
                color: #888;
                padding: 0 14px;
            }

            .chat-message.user .message-time {
                text-align: right;
            }

            .chat-input-section {
                padding: 16px;
                background: white;
                border-top: 1px solid #e0e0e0;
                display: flex;
                gap: 8px;
            }

            .chat-input {
                flex: 1;
                padding: 10px 12px;
                border: 1px solid #e0e0e0;
                border-radius: 20px;
                font-size: 13px;
                outline: none;
                transition: border-color 0.2s;
            }

            .chat-input:focus {
                border-color: #667eea;
            }

            .chat-send-btn {
                background: #667eea;
                color: white;
                border: none;
                padding: 10px 16px;
                border-radius: 20px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 600;
                transition: background-color 0.2s;
            }

            .chat-send-btn:hover {
                background: #5a67d8;
            }

            .typing-indicator .message-content {
                padding: 10px 14px;
            }

            .typing-dots {
                display: flex;
                gap: 4px;
                align-items: center;
            }

            .typing-dots span {
                width: 6px;
                height: 6px;
                background: #999;
                border-radius: 50%;
                animation: typing 1.4s infinite;
            }

            .typing-dots span:nth-child(2) {
                animation-delay: 0.2s;
            }

            .typing-dots span:nth-child(3) {
                animation-delay: 0.4s;
            }

            @keyframes typing {
                0%, 60%, 100% {
                    transform: translateY(0);
                    opacity: 0.4;
                }
                30% {
                    transform: translateY(-10px);
                    opacity: 1;
                }
            }
        `;

        document.head.appendChild(styles);
    }
}

// Make StockAnalysisUI available globally
window.StockAnalysisUI = StockAnalysisUI; 