import React, { useState } from 'react';
import { fetchMarketNews } from '../services/geminiService';
import { MarketNewsItem } from '../types';
import { Icons } from './ui/Icons';

export const MarketPulse: React.FC = () => {
  const [query, setQuery] = useState('');
  const [news, setNews] = useState<MarketNewsItem[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      const results = await fetchMarketNews(query);
      setNews(results);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-xl mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Icons.Search className="text-blue-400" />
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Market Pulse
          </span>
        </h2>
        <p className="text-slate-400 mb-6">
          Real-time market grounding using Google Search. Get the latest sentiment on any asset.
        </p>

        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ticker (e.g. TSLA) or market event"
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 px-6 rounded-lg text-white font-semibold transition-colors flex items-center gap-2"
          >
            {loading ? <Icons.Loader2 className="animate-spin" /> : <Icons.Search />}
            Search
          </button>
        </form>

        <div className="space-y-4">
          {news.map((item, idx) => (
            <div key={idx} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 hover:border-blue-500/50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-lg font-medium text-blue-300 hover:text-blue-200 hover:underline">
                  {item.title}
                </a>
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider
                  ${item.sentiment === 'positive' ? 'bg-green-900/50 text-green-400' :
                    item.sentiment === 'negative' ? 'bg-red-900/50 text-red-400' :
                    'bg-slate-700 text-slate-300'}
                `}>
                  {item.sentiment}
                </span>
              </div>
              <p className="text-slate-400 text-sm mb-2">{item.snippet}</p>
              <div className="text-xs text-slate-500">Source: {item.source}</div>
            </div>
          ))}
          {!loading && news.length === 0 && (
            <div className="text-center text-slate-500 py-8">
              Enter a ticker above to scan the web for latest financial data.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};