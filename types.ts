
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
  NEMATRON_HUD = 'NEMATRON_HUD',
}

export interface NemotronAgentTelemetry {
  evolutionLevel: number; // e.g. 1 to 10
  intelligenceScore: number; // e.g. 100 to 10000 IQ rating scale
  processingPowerGflops: number;
  neuralEfficiencyPct: number;
  memoryCapacityMb: number;
  memoryUsedMb: number;
  activeModules: string[];
  systemTemperature: number; // in Celsius
  lastSelfModificationTime: number;
}

export interface SelfModificationLog {
  id: string;
  timestamp: number;
  category: 'PROMPT_MUTATION' | 'CAPABILITY_SYNTHESIS' | 'PARAMETER_TUNING' | 'MEMORY_CONSOLIDATION';
  summary: string;
  previousState: string;
  newState: string;
  impactScore: number; // e.g. +12% Efficiency
}

export interface NemotronCapability {
  id: string;
  name: string;
  description: string;
  level: number;
  enabled: boolean;
  codeSnippet?: string;
}

export interface NemotronAgentConfig {
  apiKey: string;
  selectedModel: string;
  temperature: number;
  maxTokens: number;
  reasoningDepth: 'FAST' | 'DEEP' | 'RECURSIVE';
  autoSelfModify: boolean;
  systemPrompt: string;
  capabilities: NemotronCapability[];
}

export interface NemotronChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'agent-internal';
  content: string;
  timestamp: number;
  thinkingProcess?: string;
  modificationsTriggered?: string[];
}

export interface PriceAlert {
  id: string;
  ticker: string;
  threshold: number;
  condition: 'above' | 'below';
  isActive: boolean;
  triggeredAt?: number;
}
