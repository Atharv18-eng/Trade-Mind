import { GoogleGenAI, Type } from "@google/genai";
import { MarketNewsItem, TradeAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// 1. Search Grounding (Market Pulse) - Uses gemini-3-flash-preview
export const fetchMarketNews = async (ticker: string): Promise<MarketNewsItem[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Find the latest financial news, earnings reports, and market sentiment for ${ticker}. 
      Return a list of 3-5 key news items with their sentiment.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              source: { type: Type.STRING },
              url: { type: Type.STRING },
              sentiment: { type: Type.STRING, enum: ['positive', 'negative', 'neutral'] },
              snippet: { type: Type.STRING },
            },
            required: ['title', 'source', 'sentiment', 'snippet'],
          },
        },
      },
    });

    const text = response.text;
    if (!text) return [];
    
    // Attempt to parse JSON, handle potential markdown blocks
    const cleanedText = text.replace(/```json\s*|\s*```/g, "").trim();
    return JSON.parse(cleanedText) as MarketNewsItem[];
  } catch (error) {
    console.error("Error fetching market news:", error);
    return [];
  }
};

// 2. Deep Analysis (Thinking Mode) - Uses gemini-3-pro-preview with Google Search
export const analyzeTrade = async (
  ticker: string,
  context: string
): Promise<TradeAnalysis> => {

  const prompt = `You are an expert financial trading AI. Your goal is to provide a clear, decisive BUY, SELL, or HOLD recommendation for ${ticker} based on data.
    
    User Context: "${context}"
    
    MANDATORY STEPS:
    1. SEARCH: Use the Google Search tool to retrieve the LATEST real-time data:
       - Technical Analysis: RSI, MACD, Moving Averages (50/200 day), Support/Resistance levels.
       - Fundamental Analysis: Recent earnings, Revenue growth, Net Income, Balance Sheet health.
       - Sentiment: Recent news, analyst upgrades/downgrades.

    2. DECIDE:
       - Evaluate all factors.
       - If the trend is bullish and fundamentals are strong -> BUY.
       - If the trend is bearish or fundamentals are deteriorating -> SELL.
       - If signals are mixed or the market is flat -> HOLD.
       - Be decisive. Do not simply list facts; form a conclusion.

    3. OUTPUT:
       - The 'summary' MUST start with a clear verdict (e.g., "Verdict: BUY. The stock is showing strong momentum...").
       - Provide specific reasoning for the decision in the 'reasoning' list.
    
    Output a structured JSON response with your final recommendation.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 16384 }, 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendation: { type: Type.STRING, enum: ['BUY', 'SELL', 'HOLD'] },
            confidenceScore: { type: Type.NUMBER, description: "0 to 100" },
            summary: { type: Type.STRING },
            reasoning: { type: Type.ARRAY, items: { type: Type.STRING } },
            riskFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
            keyMetrics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  value: { type: Type.STRING },
                  trend: { type: Type.STRING, enum: ['up', 'down', 'neutral'] }
                }
              }
            }
          },
          required: ['recommendation', 'confidenceScore', 'summary', 'reasoning', 'riskFactors']
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No analysis generated");
    
    // Robust JSON cleaning
    const cleanedText = text.replace(/```json\s*|\s*```/g, "").trim();
    return JSON.parse(cleanedText) as TradeAnalysis;
  } catch (error) {
    console.error("Analysis Error:", error);
    // Return a dummy error object or rethrow to be caught by UI
    throw error;
  }
};

// 3. Fast Response (Quick Lookup) - Uses gemini-2.5-flash-lite-latest (or flash-lite)
export const quickLookup = async (term: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-flash-lite-latest',
    contents: `Explain the financial term or concept "${term}" briefly in one sentence.`,
  });
  return response.text || "Could not define term.";
};

// 4. Chatbot - Uses gemini-3-pro-preview
export const sendChatMessage = async (history: {role: string, parts: {text: string}[]}[], newMessage: string) => {
    const chat = ai.chats.create({
        model: 'gemini-3-pro-preview',
        history: history,
        config: {
            systemInstruction: "You are a helpful and cautious financial assistant. Do not give binding financial advice, but provide educational analysis.",
        }
    });

    const response = await chat.sendMessage({ message: newMessage });
    return response.text;
}

// 5. Risk Elaboration - Uses gemini-3-flash-preview for speed
export const explainRiskFactor = async (ticker: string, risk: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Explain why "${risk}" is a specific significant risk factor for the asset "${ticker}" right now. 
      Keep the explanation concise (under 50 words) and specific to the current market context.`,
    });
    return response.text || "No details available.";
  } catch (error) {
    return "Unable to fetch details at this time.";
  }
};