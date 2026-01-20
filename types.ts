
export interface MarketNewsItem {
  title: string;
  source: string;
  url: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  snippet: string;
}

export interface TradeAnalysis {
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  confidenceScore: number; // 0-100
  summary: string;
  reasoning: string[];
  riskFactors: string[];
  keyMetrics: { label: string; value: string; trend: 'up' | 'down' | 'neutral' }[];
}

export interface AnalysisHistoryItem extends TradeAnalysis {
  id: string;
  ticker: string;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  MARKET_PULSE = 'MARKET_PULSE',
  CHAT = 'CHAT',
}
