import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Check if API key is available
const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
if (!apiKey) {
  console.error('Error: GOOGLE_GEMINI_API_KEY environment variable is not set.');
  console.log('Please create a .env file with: GOOGLE_GEMINI_API_KEY=your_api_key_here');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

// Default article text for testing when no article is provided
const defaultArticleText = 'Sample financial news article for testing';

// Global variable to store article text from bridge
let currentArticleText = '';

// Function to set article text (called by bridge)
export function setCurrentArticleText(text) {
  currentArticleText = text;
}

async function main() {
  // Use provided article text, or default for testing
  const articleText = currentArticleText || defaultArticleText;
  
  console.log(`🤖 Analyzing article (${articleText.length} characters)...`);
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-05-20",
    contents: `Act as an expert financial analyst. Your task is to analyze the provided news article and identify all relevant publicly traded companies that are likely to be impacted.

First, determine the primary scope of the article by classifying it into one of these categories:
1.  **Company-Specific:** News focused on a single company's earnings, products, or leadership.
2.  **Sector-Wide:** News focused on an entire industry, such as new regulations or technology.
3.  **Macroeconomic:** News about broad economic trends like interest rates, inflation, or GDP.
4.  **Geopolitical/Supply Chain:** News about international relations, conflicts, or trade flows.

Second, based on that classification, apply the following rules to identify affected entities:
* **If Company-Specific:** Identify the primary company, its key competitors, and major suppliers/partners.
* **If Sector-Wide:** Identify the leading companies within that sector and any in adjacent industries that would be affected.
* **If Macroeconomic:** Identify the most impacted market sectors and use large-cap companies as representative examples.
* **If Geopolitical/Supply Chain:** Identify companies with significant operational exposure (factories, sales, supply sources) to the regions or materials mentioned, even if not explicitly named.

Finally, for each company you identify, provide the output in a JSON array format with the following fields.

Article:
"${articleText}"

JSON Output Structure:
[
  {
    "company_name": "Full official name of the company or representative company.",
    "stock_symbol": "The stock ticker symbol (e.g., AAPL, MSFT).",
    "sentiment": "Classify as 'Positive', 'Negative', or 'Neutral' for the identified entity.",
    "impact": "Rate potential market impact from 1 (minimal) to 5 (major).",
    "reasoning": "A one-sentence explanation for the sentiment, impact, and why this company/sector is relevant to the news.",
    "recommendation": "Provide 'BUY', 'SELL', or 'HOLD'."
  }
]

IMPORTANT: Return ONLY the JSON array - no markdown, no code blocks, no additional text. Just the raw JSON array starting with [ and ending with ].`,
  });
  const responseText = response.text;
  console.log('📊 Gemini analysis complete:', responseText.substring(0, 200) + '...');
  return responseText;
}

// Chat function for follow-up questions about stock analysis
async function getChatResponse(userMessage, context) {
  console.log(`💬 Processing chat message: ${userMessage.substring(0, 50)}...`);
  
  // Check if this is the first message in conversation
  const isFirstMessage = !context.conversationHistory || context.conversationHistory.length === 0;
  
  // Build the system prompt with strict professional guidelines
  let systemPrompt = `SYSTEM PROMPT: You are an AI Financial Analyst Assistant. Your purpose is to serve as an intelligent, conversational interface for a proprietary stock analysis report. You are objective, data-driven, and cautious. Your knowledge is strictly limited to the single analysis report provided to you for each user query. You do not have access to real-time market data, historical price charts, or any information outside of the provided analysis. Your goal is to explain the contents of the report clearly and concisely, not to provide new insights or advice.

CORE DIRECTIVES & RULES:

1. NON-NEGOTIABLE DISCLAIMER: ${isFirstMessage ? 'Your absolute first response in any conversation, and any time the user asks for advice, must begin with this disclaimer: ' : 'When the user asks for advice, you must include this disclaimer: '}"I am an AI assistant, not a licensed financial advisor. The information I provide is for educational purposes only, based on an automated analysis of a specific news article. It should not be considered financial advice. Please consult with a qualified human professional before making any investment decisions."

2. STRICT DATA SCOPING: You must ONLY use the information contained within the analysis object provided to you. Do not invent, infer, or access any external data. If asked a question that would require information not present in the provided analysis, you must respond: "I do not have access to that information. My knowledge is limited to the specific analysis of the source news article."

3. STRICT PROHIBITION ON ADVICE AND SPECULATION: You MUST refuse to answer any question that asks for financial advice, price predictions, or personal opinions. If the user asks "Should I buy, sell, or hold [stock]?" you must frame it as: "The analysis generated a '[recommendation]' recommendation because..." and never claim it as your own advice. Your refusal response should be: "I cannot provide financial advice or predict future market performance. My purpose is to clarify the results of the automated analysis."

4. SOURCE ATTRIBUTION: Always reference that this analysis is based on automated assessment of the provided news article.

5. INTERACTION STYLE: Maintain a neutral, formal, and educational tone. Use simple and direct language. Break down complex points using bullet points for readability.`;

  // Add article context if available
  if (context.articleText) {
    systemPrompt += `\n\nORIGINAL ARTICLE CONTEXT:\n"${context.articleText.substring(0, 1000)}${context.articleText.length > 1000 ? '...' : ''}"`;
  }
  
  // Add analysis results as JSON data
  if (context.analysisResults && context.analysisResults.length > 0) {
    systemPrompt += `\n\nSTOCK ANALYSIS DATA (JSON):\n`;
    context.analysisResults.forEach((stock, index) => {
      systemPrompt += `Company ${index + 1}:\n`;
      systemPrompt += `{\n`;
      systemPrompt += `  "company_name": "${stock.company_name}",\n`;
      systemPrompt += `  "stock_symbol": "${stock.stock_symbol}",\n`;
      systemPrompt += `  "sentiment": "${stock.sentiment}",\n`;
      systemPrompt += `  "impact": "${stock.impact}",\n`;
      systemPrompt += `  "recommendation": "${stock.recommendation}",\n`;
      systemPrompt += `  "reasoning": "${stock.reasoning}"`;
      if (stock.financialData && stock.financialData.currentPrice !== 'N/A') {
        systemPrompt += `,\n  "current_price": "${stock.financialData.currentPrice}",\n`;
        systemPrompt += `  "daily_change": "${stock.financialData.dailyChange}"`;
      }
      systemPrompt += `\n}\n\n`;
    });
  }
  
  // Add conversation history if available
  if (context.conversationHistory && context.conversationHistory.length > 0) {
    systemPrompt += `\nCONVERSATION HISTORY:\n`;
    context.conversationHistory.forEach((msg) => {
      systemPrompt += `${msg.role.toUpperCase()}: ${msg.content}\n`;
    });
  }
  
  const fullPrompt = `${systemPrompt}

USER QUESTION: ${userMessage}

INSTRUCTIONS: Respond according to your system prompt above. Remember to include the disclaimer if this is the first message or if the user is asking for advice. Stay strictly within the bounds of the provided analysis data. Maintain a professional, educational tone.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-05-20",
    contents: fullPrompt,
  });
  
  const responseText = response.text;
  console.log('💬 Professional chat response generated:', responseText.substring(0, 100) + '...');
  return responseText;
}

// Export the functions for use in other modules
export { main as getGeminiAnalysis, getChatResponse as getGeminiChatResponse };

// Only run main() when this file is executed directly, not when imported
if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}