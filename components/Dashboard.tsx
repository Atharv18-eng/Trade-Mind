import React, { useState, useEffect } from 'react';
import { analyzeTrade, explainRiskFactor } from '../services/geminiService';
import { TradeAnalysis, AnalysisHistoryItem } from '../types';
import { Icons } from './ui/Icons';
import TradingViewWidget from './TradingViewWidget';
import { TickerNews } from './TickerNews';

// Sub-component for individual interactive risk items
const RiskItem: React.FC<{ risk: string; ticker: string }> = ({ risk, ticker }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleOpen = async () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    setIsOpen(true);
    if (!details) {
      setLoading(true);
      try {
        const explanation = await explainRiskFactor(ticker, risk);
        setDetails(explanation);
      } catch (e) {
        setDetails("Failed to load details.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div 
      onClick={toggleOpen}
      className={`
        p-3 rounded-lg border transition-all cursor-pointer group
        ${isOpen 
          ? 'bg-yellow-950/30 border-yellow-500/50' 
          : 'bg-slate-900/50 border-slate-700 hover:border-yellow-500/30 hover:bg-yellow-900/10'}
      `}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex items-start gap-2 text-slate-300 group-hover:text-yellow-100 transition-colors text-sm">
           <Icons.AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${isOpen ? 'text-yellow-500' : 'text-slate-500 group-hover:text-yellow-500'}`} />
           <span>{risk}</span>
        </div>
        {isOpen ? (
          <Icons.ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
        ) : (
          <Icons.ChevronDown className="w-4 h-4 text-slate-500 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
      
      {/* Expandable Content */}
      <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0'}`}>
         <div className="overflow-hidden">
            {loading ? (
               <div className="flex items-center gap-2 text-xs text-yellow-500/80">
                  <Icons.Loader2 className="w-3 h-3 animate-spin" />
                  Analyzing risk impact...
               </div>
            ) : (
               <div className="text-xs text-slate-400 pl-6 border-l-2 border-yellow-500/20">
                  {details}
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const [ticker, setTicker] = useState('');
  const [context, setContext] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TradeAnalysis | null>(null);
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('tradeHistory');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const addToHistory = (analysis: TradeAnalysis, symbol: string) => {
    const newItem: AnalysisHistoryItem = {
      ...analysis,
      id: Date.now().toString(),
      ticker: symbol,
      timestamp: Date.now(),
    };
    
    // Keep last 20 items
    const updatedHistory = [newItem, ...history].slice(0, 20);
    setHistory(updatedHistory);
    localStorage.setItem('tradeHistory', JSON.stringify(updatedHistory));
  };

  const loadFromHistory = (item: AnalysisHistoryItem) => {
    setTicker(item.ticker);
    setResult(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteHistoryItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem('tradeHistory', JSON.stringify(updated));
  };

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear your analysis history?")) {
      setHistory([]);
      localStorage.removeItem('tradeHistory');
    }
  };

  const handleAnalyze = async () => {
    if (!ticker) return;
    setIsLoading(true);
    setResult(null);
    try {
      const data = await analyzeTrade(ticker, context);
      setResult(data);
      addToHistory(data, ticker);
    } catch (error) {
      console.error(error);
      alert("Analysis failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
      
      {/* Main Content Column */}
      <div className="lg:col-span-3 space-y-6">
        {/* Input Section */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Icons.BrainCircuit className="text-purple-400" />
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Deep Trade Analysis
            </span>
          </h2>
          <p className="text-slate-400 mb-6 text-sm">
            Powered by Gemini 3 Pro. Enter a ticker to auto-retrieve charts and financials using advanced Google Search grounding.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-300 mb-1">Asset Ticker</label>
              <input
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                placeholder="e.g. AAPL, BTC, NVDA"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all font-mono text-lg"
              />
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-300 mb-1">Your Strategy / Notes (Optional)</label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="E.g. I'm looking for a swing trade entry, concerned about upcoming CPI data..."
                className="w-full h-[52px] bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none resize-none"
              />
            </div>
          </div>
          
          <div className="flex justify-end border-t border-slate-700 pt-6">
            <button
              onClick={handleAnalyze}
              disabled={isLoading || !ticker}
              className={`
                flex items-center gap-2 px-8 py-4 rounded-lg font-bold text-lg text-white transition-all w-full md:w-auto justify-center
                ${isLoading || !ticker 
                  ? 'bg-slate-700 cursor-not-allowed text-slate-400' 
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-900/20 active:scale-95'}
              `}
            >
              {isLoading ? (
                <>
                  <Icons.Loader2 className="animate-spin w-5 h-5" />
                  Analyzing Market Data...
                </>
              ) : (
                <>
                  <Icons.Zap className="w-5 h-5" />
                  Analyze Ticker
                </>
              )}
            </button>
          </div>
        </div>

        {/* Real-time Chart Display and News Feed - Always visible if ticker is present */}
        {ticker && (
            <div className="animate-fade-in space-y-6">
              <div>
                  <h3 className="text-lg font-semibold text-slate-300 mb-3 flex items-center gap-2">
                      <Icons.BarChart2 className="text-blue-400" />
                      Real-Time Chart: {ticker}
                  </h3>
                  <TradingViewWidget symbol={ticker} />
              </div>

              <TickerNews ticker={ticker} />
            </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            {/* Gauge / Score */}
            <div className="md:col-span-1 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl flex flex-col items-center justify-center text-center">
              <div className="text-sm text-slate-400 uppercase tracking-wider mb-2">Recommendation</div>
              <div className={`text-4xl font-black mb-2 ${
                result.recommendation === 'BUY' ? 'text-green-400' : 
                result.recommendation === 'SELL' ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {result.recommendation}
              </div>
              <div className="w-full bg-slate-700 h-2 rounded-full mb-2 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      result.recommendation === 'BUY' ? 'bg-green-500' : 
                      result.recommendation === 'SELL' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${result.confidenceScore}%` }}
                  />
              </div>
              <div className="text-xs text-slate-500">Confidence: {result.confidenceScore}%</div>
            </div>

            {/* Reasoning */}
            <div className="md:col-span-2 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
              <h3 className="text-lg font-semibold text-white mb-3">AI Reasoning</h3>
              <p className="text-slate-300 text-sm mb-4 leading-relaxed">{result.summary}</p>
              <div className="space-y-2">
                {result.reasoning.map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                    <Icons.CheckCircle className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Metrics & Risks */}
            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">Key Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                    {result.keyMetrics?.map((metric, i) => (
                      <div key={i} className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                        <div className="text-xs text-slate-400">{metric.label}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-lg font-medium text-white">{metric.value}</span>
                          {metric.trend === 'up' && <Icons.TrendingUp className="w-4 h-4 text-green-500" />}
                          {metric.trend === 'down' && <Icons.TrendingDown className="w-4 h-4 text-red-500" />}
                          {metric.trend === 'neutral' && <Icons.Minus className="w-4 h-4 text-slate-500" />}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              
              {/* Enhanced Risk Factors Section */}
              <div className="bg-slate-800 p-6 rounded-xl border border-yellow-500/20 shadow-lg shadow-yellow-900/10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <div className="bg-yellow-500/10 p-1.5 rounded-lg">
                      <Icons.AlertTriangle className="text-yellow-500 w-5 h-5" />
                  </div>
                  Risk Factors
                  <span className="text-xs font-normal text-slate-500 ml-auto hidden sm:block">
                      Click items for AI analysis
                  </span>
                </h3>
                <div className="space-y-3">
                  {result.riskFactors.map((risk, i) => (
                    <RiskItem key={i} risk={risk} ticker={ticker} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar / History Column */}
      <div className="lg:col-span-1">
        <div className="sticky top-6 bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden max-h-[calc(100vh-100px)] flex flex-col">
          <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Icons.History className="text-slate-400 w-4 h-4" />
              History
            </h3>
            {history.length > 0 && (
              <button 
                onClick={clearHistory}
                className="text-xs text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1"
              >
                <Icons.Trash2 className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
            {history.length === 0 && (
              <div className="p-6 text-center text-slate-500 text-sm">
                No past analysis yet.
              </div>
            )}
            {history.map((item) => (
              <div 
                key={item.id}
                onClick={() => loadFromHistory(item)}
                className="group relative bg-slate-900/50 border border-slate-700/50 p-3 rounded-lg cursor-pointer hover:bg-slate-700 hover:border-slate-600 transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-mono font-bold text-white text-lg">{item.ticker}</div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    item.recommendation === 'BUY' ? 'text-green-400 border-green-900 bg-green-900/20' : 
                    item.recommendation === 'SELL' ? 'text-red-400 border-red-900 bg-red-900/20' : 
                    'text-yellow-400 border-yellow-900 bg-yellow-900/20'
                  }`}>
                    {item.recommendation}
                  </span>
                </div>
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <Icons.Clock className="w-3 h-3" />
                    {new Date(item.timestamp).toLocaleDateString()}
                  </div>
                  <Icons.ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
                </div>

                <button
                  onClick={(e) => deleteHistoryItem(e, item.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-md text-slate-600 hover:text-red-400 hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
                  title="Remove from history"
                >
                  <Icons.Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};