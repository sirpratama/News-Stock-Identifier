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

const articleText = 'Jakarta, CNBC Indonesia — Kerja sama antara bank dan fintech lending semakin erat. Hal ini terlihat dari penyaluran dana bank kepada P2P lending. Menurut Kepala Eksekutif Pengawas Perbankan Dian Ediana Rae, kerja sama antara bank dengan fintech merupakan salah satu business opportunity yang turut serta memberikan kontribusi dalam fungsi intermediasi, terutama dalam menjangkau segmen UMKM. Ia mengungkapkan, per Februari 2025, total penyaluran pinjaman kepada financial technology (fintech) mencapai Rp80,07 triliun. Dari jumlah tersebut, kontribusi pemberi pinjaman yang berasal dari perbankan mencapai Rp49,40 triliun atau sebesar 61,69% terhadap total penyaluran pinjaman. Penyaluran tersebut menunjukkan peningkatan dibandingkan dengan posisi Desember 2024, yaitu sebesar Rp46,07 triliun atau sebesar 59,88% dari total penyaluran pinjaman yang sebesar Rp76,95 triliun. "Sinergi ini diharapkan dapat meningkatkan akses dan layanan keuangan bagi masyarakat dalam rangka mendukung pendalaman dan perluasan inklusi keuangan," ujarnya dalam keterangannya, Jumat (13/6). Dian mengatakan, perbankan diharapkan dapat memperkuat pengelolaan risiko kredit dan penerapan tata kelola (good governance) yang baik dalam penyaluran kredit kepada dan/atau melalui perusahaan P2P lending sebagai mitra. "Untuk menjaga pertumbuhan yang berkesinambungan ini, maka dilakukan antara lain evaluasi secara berkala terhadap kerjasama dengan Mitra, termasuk penilaian terhadap kinerja dan kelayakan Mitra," sebutnya. Sebagai salah satu bentuk dukungan lebih lanjut, Ia menambahkan, OJK telah menerbitkan pedoman mengenai kerjasama antara Bank dengan fintech yang dapat digunakan sebagai panduan dalam memberikan professional judgement terhadap kebutuhan kerjasama tersebut. "Dengan demikian, kerjasama yang terjalin tetap dalam koridor penerapan prinsip kehati-hatian dan tata kelola yang baik," pungkasnya.';

async function main() {
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

Return ONLY the JSON array of results.`,
  });
  console.log(response.text);
}

await main();