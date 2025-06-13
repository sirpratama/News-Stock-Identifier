# Financial News Analysis Tool

An intelligent financial news analysis system that extracts and analyzes news articles to identify publicly traded companies and provide investment insights using Google's Gemini AI.

## Features

- **Web Content Extraction**: Automatically extracts clean text content from news articles across various websites (CNN Indonesia, general news sites)
- **AI-Powered Analysis**: Uses Google Gemini AI to analyze financial news with expert-level insights
- **Smart Company Identification**: Identifies relevant publicly traded companies even when not explicitly mentioned
- **Investment Recommendations**: Provides sentiment analysis, market impact ratings, and BUY/SELL/HOLD recommendations
- **Multi-Category Analysis**: Handles different types of news (company-specific, sector-wide, macroeconomic, geopolitical)

## How It Works

1. **Article Classification**: The AI first categorizes the news article type
2. **Context-Aware Analysis**: Applies specific rules based on article category to identify relevant companies
3. **Comprehensive Output**: Returns structured JSON with company analysis including:
   - Company name and stock symbol
   - Sentiment classification (Positive/Negative/Neutral)
   - Market impact rating (1-5 scale)
   - Investment recommendation
   - Detailed reasoning

## Project Structure

```
├── API/
│   └── gemini-api.js       # Main AI analysis engine
├── scripts/
│   └── content.js          # Web scraping and text extraction
└── README.md
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure your Google Gemini AI API key in `API/gemini-api.js`

3. Run the analysis:
   ```bash
   node API/gemini-api.js
   ```

## Usage

The tool can analyze various types of financial news in Indonesian and English, automatically identifying companies that may be impacted by the news even if they're not directly mentioned in the article.

## Example Output

```json
[
  {
    "company_name": "Bank Central Asia Tbk",
    "stock_symbol": "BBCA",
    "sentiment": "Positive",
    "impact": "3",
    "reasoning": "Banking sector benefits from increased fintech collaboration and lending opportunities",
    "recommendation": "HOLD"
  }
]
```
