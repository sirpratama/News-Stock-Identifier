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

// Export the function for use in other modules
export { main as getGeminiAnalysis };

// Only run main() when this file is executed directly, not when imported
if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}